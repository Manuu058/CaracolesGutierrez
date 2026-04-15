const pool = require("../config/db");

async function listarProveedores(req, res) {
  try {
    const { busqueda = "" } = req.query;

    let sql = `
      SELECT *
      FROM proveedores
      WHERE activo = 1
    `;
    const params = [];

    if (busqueda) {
      sql += `
        AND (
          nombre LIKE ?
          OR dni_cif LIKE ?
          OR tipo_producto LIKE ?
        )
      `;
      const filtro = `%${busqueda}%`;
      params.push(filtro, filtro, filtro);
    }

    sql += ` ORDER BY nombre ASC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error("Error al listar proveedores:", error);
    return res.status(500).json({ error: "Error al listar proveedores" });
  }
}

async function obtenerProveedor(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM proveedores WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener proveedor:", error);
    return res.status(500).json({ error: "Error al obtener proveedor" });
  }
}

async function crearProveedor(req, res) {
  try {
    const {
      nombre,
      dni_cif,
      telefono,
      email,
      direccion,
      tipo_producto,
      observaciones,
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO proveedores
        (nombre, dni_cif, telefono, email, direccion, tipo_producto, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        dni_cif || null,
        telefono || null,
        email || null,
        direccion || null,
        tipo_producto || null,
        observaciones || null,
      ]
    );

    return res.json({
      mensaje: "Proveedor creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    return res.status(500).json({ error: "Error al crear proveedor" });
  }
}

async function actualizarProveedor(req, res) {
  try {
    const { id } = req.params;
    const {
      nombre,
      dni_cif,
      telefono,
      email,
      direccion,
      tipo_producto,
      observaciones,
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `UPDATE proveedores
       SET nombre = ?,
           dni_cif = ?,
           telefono = ?,
           email = ?,
           direccion = ?,
           tipo_producto = ?,
           observaciones = ?
       WHERE id = ?`,
      [
        nombre.trim(),
        dni_cif || null,
        telefono || null,
        email || null,
        direccion || null,
        tipo_producto || null,
        observaciones || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    return res.json({ mensaje: "Proveedor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return res.status(500).json({ error: "Error al actualizar proveedor" });
  }
}

async function eliminarProveedor(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE proveedores
       SET activo = 0
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    return res.json({ mensaje: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    return res.status(500).json({ error: "Error al eliminar proveedor" });
  }
}

module.exports = {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};