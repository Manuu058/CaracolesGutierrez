const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM productos ORDER BY nombre ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar productos" });
  }
}

async function obtener(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM productos WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener producto" });
  }
}

async function crear(req, res) {
  try {
    const {
      nombre,
      descripcion,
      precio,
      unidad_medida,
      stock_minimo,
      activo,
    } = req.body;

    const errorCampos = validarCamposRequeridos({ nombre });

    if (errorCampos) {
      return res.status(400).json({ error: errorCampos });
    }

    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, unidad_medida, stock_minimo, activo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion || null,
        Number(precio || 0),
        unidad_medida || "kg",
        Number(stock_minimo || 0),
        activo ?? true,
      ]
    );

    res.status(201).json({
      message: "Producto creado",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear producto" });
  }
}

async function actualizar(req, res) {
  try {
    const {
      nombre,
      descripcion,
      precio,
      unidad_medida,
      stock_minimo,
      activo,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE productos
       SET nombre = ?, descripcion = ?, precio = ?, unidad_medida = ?, stock_minimo = ?, activo = ?
       WHERE id = ?`,
      [
        nombre,
        descripcion || null,
        Number(precio || 0),
        unidad_medida || "kg",
        Number(stock_minimo || 0),
        activo ?? true,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM productos WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
}

async function stock(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vw_stock_productos ORDER BY producto ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener stock" });
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  stock,
};