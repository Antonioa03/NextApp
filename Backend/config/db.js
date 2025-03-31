const { Sequelize } = require('sequelize');
require('dotenv').config();

// Opciones de conexión
const dbName = process.env.DB_NAME || 'auth_app';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbDialect = process.env.DB_DIALECT || 'mysql'; // mysql, postgres, sqlite, etc.

// Crear instancia de Sequelize
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDialect,
  logging: false, // Set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Para SQLite puedes usar:
// const sequelize = new Sequelize({
//   dialect: 'sqlite',
//   storage: './database.sqlite', // Ruta al archivo SQLite
//   logging: false
// });

// Probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };