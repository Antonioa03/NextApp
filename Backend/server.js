const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Database
const { sequelize, testConnection } = require('./config/db');
const User = require('./models/User');

// Importar rutas
const authRoutes = require('./routes/authRoutes');

// Inicializar express
const app = express();

// Configuración CORS básica primero
app.use(cors());

// Middleware para forzar encabezados CORS manualmente
app.use((req, res, next) => {
  // Establecer encabezados CORS de forma manual y explícita
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Manejar solicitudes preflight OPTIONS directamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Middleware
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor en línea',
    cors: 'Habilitado',
    time: new Date().toISOString()
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.send('API funcionando correctamente');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ 
    success: false,
    message: 'Algo salió mal!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Sincronizar modelos con la base de datos e iniciar servidor
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos con la base de datos
    // force: true recreará las tablas (elimina datos existentes)
    // alter: true actualiza las tablas si es necesario
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos');
    
    // Listar todas las rutas registradas para facilitar el debug
    console.log('Rutas disponibles:');
    app._router.stack.forEach(function(r) {
      if (r.route && r.route.path) {
        console.log(`${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
      }
    });
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
      console.log(`Accede a http://localhost:${PORT}/test para verificar funcionamiento`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();