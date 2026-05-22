// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // Carrega as variáveis do .env

// Usamos um "Pool" de conexões, que é mais eficiente para várias requisições simultâneas
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;