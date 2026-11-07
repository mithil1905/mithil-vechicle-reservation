// =====================================================================
// Database Connection Configuration (MySQL)
// User: root | Password: mithil | Database: mithil_vehicle_db
// =====================================================================
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'mithil',
    database: process.env.DB_NAME || 'mithil_vehicle_db',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
};

const pool = mysql.createPool(dbConfig);

// Test database connection on startup
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected successfully to MySQL Database: "mithil_vehicle_db" (User: root)');
        connection.release();
    } catch (error) {
        console.error('❌ MySQL Connection Error:', error.message);
        console.error('Please ensure MySQL service is running and user "root" with password "mithil" has access.');
    }
}

testConnection();

module.exports = pool;

