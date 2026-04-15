const pool = require("../config/db");

function normalizarMes(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase();
}

function normalizarProducto(valor) {
  const producto = String(valor || "")
    .trim()
    .toUpperCase();

  if (["CARACOLES", "CABRILLAS", "AMBAS"].includes(producto)) {
    return producto;
  }

  return "AMBAS";
}

// LISTAR LOTES (SOLO CONSULTA)
async function listar(req, res) {
  try {
    const { mes, proveedor_id, producto } = req.query;

    const where = [];
    const params = [];

    if (mes) {
      where.push("UPPER(l.mes) = ?");
      params.push(normalizarMes(mes));
    }

    if (proveedor_id) {
      where.push("l.proveedor_id = ?");
      params.push(Number(proveedor_id));
    }

    if (producto) {
      where.push("l.producto = ?");
      params.push(normalizarProducto(producto));
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `SELECT
        l.id,
        l.codigo_lote,
        l.producto,
        l.proveedor_id,
        l.fecha_compra,
        l.mes,
        l.factura_compra,
        l.stock_caracoles,
        l.stock_cabrillas,
        p.nombre AS proveedor
      FROM lotes l
      INNER JOIN proveedores p ON p.id = l.proveedor_id
      ${whereSql}
      ORDER BY l.fecha_compra DESC, l.id DESC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    console.error("Error al listar lotes:", error);
    return res.status(500).json({ error: "Error al listar lotes" });
  }
}

// OBTENER LOTE
async function obtener(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        l.id,
        l.codigo_lote,
        l.producto,
        l.proveedor_id,
        l.fecha_compra,
        l.mes,
        l.factura_compra,
        l.stock_caracoles,
        l.stock_cabrillas,
        p.nombre AS proveedor
      FROM lotes l
      INNER JOIN proveedores p ON p.id = l.proveedor_id
      WHERE l.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Lote no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener lote:", error);
    return res.status(500).json({ error: "Error al obtener lote" });
  }
}

module.exports = {
  listar,
  obtener,
};