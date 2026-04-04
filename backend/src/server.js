const app = require("./app");
const pool = require("./config/db");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

async function iniciarServidor() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión a MySQL correcta");
    connection.release();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error conectando con MySQL:", error);
    process.exit(1);
  }
}

iniciarServidor();