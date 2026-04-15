const pool = require("../config/db");

async function getDashboard(req, res) {
  try {
    let ventasHoy = { numeroVentas: 0, totalVendido: 0 };
    let ultimasVentas = [];
    let stockBajo = [];
    let proximosMantenimientos = [];

    try {
      const [rows] = await pool.query(`
        SELECT
          COUNT(*) AS numeroVentas,
          IFNULL(SUM(total), 0) AS totalVendido
        FROM ventas
        WHERE estado = 'ACTIVA' AND DATE(fecha_hora) = CURDATE()
      `);

      ventasHoy = rows[0] || { numeroVentas: 0, totalVendido: 0 };
    } catch (error) {
      console.error("Error en ventasHoy:", error.message);
      console.error("SQL message:", error.sqlMessage);
      console.error("SQL code:", error.code);
    }

    try {
      const [rows] = await pool.query(`
        SELECT
          v.id,
          v.codigo_venta,
          v.fecha_hora,
          v.total,
          mp.nombre AS metodo_pago,
          a.nombre AS almacen
        FROM ventas v
        INNER JOIN metodos_pago mp ON mp.id = v.metodo_pago_id
        INNER JOIN almacenes a ON a.id = v.almacen_id
        ORDER BY v.fecha_hora DESC
        LIMIT 5
      `);

      ultimasVentas = rows || [];
    } catch (error) {
      console.error("Error en ultimasVentas:", error.message);
      console.error("SQL message:", error.sqlMessage);
      console.error("SQL code:", error.code);
    }

    try {
      const [rows] = await pool.query(`
        SELECT *
        FROM vw_stock_productos
        WHERE estado_stock = 'BAJO'
        LIMIT 10
      `);

      stockBajo = rows || [];
    } catch (error) {
      console.error("Error en stockBajo:", error.message);
      console.error("SQL message:", error.sqlMessage);
      console.error("SQL code:", error.code);
    }

    try {
      const [rows] = await pool.query(`
        SELECT *
        FROM vw_proximos_mantenimientos
        WHERE estado_fecha IN ('VENCIDO', 'PROXIMO')
           OR estado_km IN ('VENCIDO', 'PROXIMO')
        ORDER BY proxima_fecha ASC
        LIMIT 10
      `);

      proximosMantenimientos = rows || [];
    } catch (error) {
      console.error("Error en proximosMantenimientos:", error.message);
      console.error("SQL message:", error.sqlMessage);
      console.error("SQL code:", error.code);
    }

    return res.json({
      ventasHoy,
      ultimasVentas,
      stockBajo,
      proximosMantenimientos,
    });
  } catch (error) {
    console.error("Error dashboard general:", error.message);
    console.error("SQL message:", error.sqlMessage);
    console.error("SQL state:", error.sqlState);
    console.error("SQL code:", error.code);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
}

module.exports = { getDashboard };