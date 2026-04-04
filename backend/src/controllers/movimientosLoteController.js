const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT ml.*, l.codigo_lote, c.nombre AS cliente
       FROM movimientos_lote ml
       INNER JOIN lotes l ON l.id = ml.lote_id
       LEFT JOIN clientes c ON c.id = ml.cliente_id
       ORDER BY ml.fecha DESC, ml.id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar movimientos" });
  }
}

async function crear(req, res) {
  try {
    const { lote_id, tipo_movimiento, cliente_id, fecha, cantidad, precio_venta, descripcion, referencia_externa } = req.body;
    const errorCampos = validarCamposRequeridos({ lote_id, tipo_movimiento, cantidad });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const [result] = await pool.query(
      `INSERT INTO movimientos_lote
      (lote_id, tipo_movimiento, cliente_id, fecha, cantidad, precio_venta, descripcion, usuario_id, referencia_externa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lote_id,
        tipo_movimiento,
        cliente_id || null,
        fecha || new Date(),
        Number(cantidad),
        precio_venta ? Number(precio_venta) : null,
        descripcion || null,
        req.usuario?.id || null,
        referencia_externa || null,
      ]
    );

    res.status(201).json({ message: "Movimiento creado", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.sqlMessage || "Error al crear movimiento" });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await pool.query(`DELETE FROM movimientos_lote WHERE id = ?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Movimiento no encontrado" });
    res.json({ message: "Movimiento eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.sqlMessage || "Error al eliminar movimiento" });
  }
}

module.exports = { listar, crear, eliminar };