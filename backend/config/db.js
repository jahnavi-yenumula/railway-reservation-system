// Oracle Database Connection Configuration
const oracledb = require('oracledb');
require('dotenv').config();

// Use thin mode - no Oracle Instant Client needed
oracledb.thin = true;

// Connection pool configuration
let pool;

async function initializePool() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('✅ Oracle DB connection pool created successfully');
  } catch (err) {
    console.error('❌ Failed to create Oracle DB pool:', err.message);
    process.exit(1);
  }
}

// Get a connection from the pool
async function getConnection() {
  return await pool.getConnection();
}

// Execute a query and release connection automatically
async function executeQuery(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await getConnection();
    // Default options: return objects, auto-commit
    const defaultOptions = {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options,
    };
    const result = await connection.execute(sql, binds, defaultOptions);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

module.exports = { initializePool, getConnection, executeQuery };
