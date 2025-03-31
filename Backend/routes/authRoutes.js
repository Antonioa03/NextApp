const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validators');

const router = express.Router();

// Rutas públicas
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password/:resettoken', validateResetPassword, resetPassword);

// Rutas protegidas (requieren autenticación)
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;