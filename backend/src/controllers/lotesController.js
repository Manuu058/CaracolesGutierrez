const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, p.nombre AS producto, pr.nombre AS proveedor
       FROM lotes l
       INNER JOIN productos p ON p.id = l.producto_id
       INNER JOIN proveedores pr ON pr.id = l.proveedor_id
       ORDER BY l.fecha_compra DESC, l.id DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar lotes" });
  }
}

async function obtener(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, p.nombre AS producto, pr.nombre AS proveedor
       FROM lotes l
       INNER JOIN productos p ON p.id = l.producto_id
       INNER JOIN proveedores pr ON pr.id = l.proveedor_id
       WHERE l.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Lote no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener lote" });
  }
}

async function crear(req, res) {
  try {
    const {
      codigo_lote,
      producto_id,
      proveedor_id,
      precio_compra,
      fecha_compra,
      cantidad_inicial,
      observaciones,
      estado,
    } = req.body;

    const errorCampos = validarCamposRequeridos({
      codigo_lote,
      producto_id,
      proveedor_id,
      fecha_compra,
      cantidad_inicial,
    });

    if (errorCampos) {
      return res.status(400).json({ error: errorCampos });
    }

    const [result] = await pool.query(
      `INSERT INTO lotes
      (codigo_lote, producto_id, proveedor_id, precio_compra, fecha_compra, cantidad_inicial, stock, observaciones, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_lote,
        producto_id,
        proveedor_id,
        Number(precio_compra || 0),
        fecha_compra,
        Number(cantidad_inicial),
        Number(cantidad_inicial),
        observaciones || null,
        estado || "ACTIVO",
      ]
    );

    res.status(201).json({
      message: "Lote creado",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || "Error al crear lote",
    });
  }
}

async function actualizar(req, res) {
  try {
    const { precio_compra, fecha_compra, observaciones, estado } = req.body;

    const [result] = await pool.query(
      `UPDATE lotes
       SET precio_compra = ?, fecha_compra = ?, observaciones = ?, estado = ?
       WHERE id = ?`,
      [
        Number(precio_compra || 0),
        fecha_compra,
        observaciones || null,
        estado || "ACTIVO",
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lote no encontrado" });
    }

    res.json({ message: "Lote actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || "Error al actualizar lote",
    });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM lotes WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lote no encontrado" });
    }

    res.json({ message: "Lote eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || "Error al eliminar lote",
    });
  }
}

async function historial(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vw_historial_lotes
       WHERE lote_id = ?
       ORDER BY fecha_movimiento DESC`,
      [req.params.id]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener historial del lote",
    });
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  historial,
};