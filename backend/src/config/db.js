const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false,
  charset: "utf8mb4",
});

async function inicializarConexion() {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_spanish_ci");
    await connection.query("SET collation_connection = 'utf8mb4_spanish_ci'");
    await connection.query("SET character_set_client = 'utf8mb4'");
    await connection.query("SET character_set_connection = 'utf8mb4'");
    await connection.query("SET character_set_results = 'utf8mb4'");

    console.log("✅ MySQL conectado con utf8mb4_spanish_ci");
  } catch (error) {
    console.error("❌ Error inicializando la conexión MySQL:", error.message);
  } finally {
    if (connection) connection.release();
  }
}

inicializarConexion();

module.exports = pool;