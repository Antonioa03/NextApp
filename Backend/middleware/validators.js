const validator = require('validator');

// Validador para registro de usuarios
exports.validateRegister = (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  
  const errors = [];

  // Validar nombre de usuario
  if (!username || username.trim() === '') {
    errors.push({ field: 'username', message: 'El nombre de usuario es obligatorio' });
  } else if (username.length < 3) {
    errors.push({ field: 'username', message: 'El nombre de usuario debe tener al menos 3 caracteres' });
  }

  // Validar email
  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'El email es obligatorio' });
  } else if (!validator.isEmail(email)) {
    errors.push({ field: 'email', message: 'El email no es válido' });
  }

  // Validar contraseña
  if (!password) {
    errors.push({ field: 'password', message: 'La contraseña es obligatoria' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Validar confirmación de contraseña
  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Las contraseñas no coinciden' });
  }

  // Si hay errores, retornar respuesta con errores
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  // Si todo está bien, continuar con el siguiente middleware
  next();
};

// Validador para inicio de sesión
exports.validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  
  const errors = [];

  // Validar nombre de usuario
  if (!username || username.trim() === '') {
    errors.push({ field: 'username', message: 'El nombre de usuario es obligatorio' });
  }

  // Validar contraseña
  if (!password) {
    errors.push({ field: 'password', message: 'La contraseña es obligatoria' });
  }

  // Si hay errores, retornar respuesta con errores
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  // Si todo está bien, continuar con el siguiente middleware
  next();
};

// Validador para recuperación de contraseña
exports.validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  
  const errors = [];

  // Validar email
  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'El email es obligatorio' });
  } else if (!validator.isEmail(email)) {
    errors.push({ field: 'email', message: 'El email no es válido' });
  }

  // Si hay errores, retornar respuesta con errores
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  // Si todo está bien, continuar con el siguiente middleware
  next();
};

// Validador para restablecimiento de contraseña
exports.validateResetPassword = (req, res, next) => {
  const { password, confirmPassword } = req.body;
  
  const errors = [];

  // Validar contraseña
  if (!password) {
    errors.push({ field: 'password', message: 'La contraseña es obligatoria' });
  } else if (password.length < 6) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Validar confirmación de contraseña
  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Las contraseñas no coinciden' });
  }

  // Si hay errores, retornar respuesta con errores
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  // Si todo está bien, continuar con el siguiente middleware
  next();
};