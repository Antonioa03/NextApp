const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
  let token;

  // Verificar si existe el header de autorización y comienza con 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obtener token del header
    token = req.headers.authorization.split(' ')[1];
  } 
  // También podemos verificar el token desde las cookies si lo preferimos
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Verificar si el token existe
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No estás autorizado para acceder a esta ruta' 
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario desde la base de datos
    req.user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email']
    });
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'No estás autorizado para acceder a esta ruta' 
    });
  }
};