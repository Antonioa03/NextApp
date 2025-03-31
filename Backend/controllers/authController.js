const User = require('../models/User');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const { Op } = require('sequelize');

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Comprobar si el usuario o el email ya existen
    const userExists = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ 
          success: false, 
          message: 'El email ya está registrado' 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'El nombre de usuario ya está en uso' 
        });
      }
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      password
    });

    // Generar token JWT
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    
    // Manejo de errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar email y contraseña
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Por favor, proporciona un nombre de usuario y contraseña' 
      });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'createdAt', 'updatedAt']
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @desc    Olvidé contraseña
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No hay usuario con ese email' 
      });
    }

    // Obtener token para resetear contraseña
    const resetToken = user.getResetPasswordToken();

    // Guardar cambios en el usuario
    await user.save();

    // Crear URL de reseteo
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Crear mensaje de email
    const message = `
      <h1>Has solicitado un reseteo de contraseña</h1>
      <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}" target="_blank">Restablecer Contraseña</a>
      <p>Si no has solicitado este cambio, puedes ignorar este mensaje.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Solicitud de recuperación de contraseña',
        html: message
      });

      res.status(200).json({
        success: true,
        message: 'Email enviado'
      });
    } catch (err) {
      console.error(err);
      
      // Limpiar campos de reseteo si falla el envío
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message: 'No se pudo enviar el email'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @desc    Resetear contraseña
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Obtener token hasheado
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Buscar usuario con el token válido
    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token inválido o expirado' 
      });
    }

    // Establecer nueva contraseña
    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    
    await user.save();

    // Generar token JWT
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// @desc    Cerrar sesión / limpiar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
};

// Función auxiliar para enviar el token con la respuesta
const sendTokenResponse = (user, statusCode, res) => {
  // Crear token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
};