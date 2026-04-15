const pool = require("../config/db");

async function listarClientes(req, res) {
  try {
    const { busqueda = "" } = req.query;

    let sql = `
      SELECT *
      FROM clientes
      WHERE activo = 1
    `;
    const params = [];

    if (busqueda) {
      sql += `
        AND (
          nombre LIKE ?
          OR dni_cif LIKE ?
          OR telefono LIKE ?
        )
      `;
      const filtro = `%${busqueda}%`;
      params.push(filtro, filtro, filtro);
    }

    sql += ` ORDER BY nombre ASC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error("Error al listar clientes:", error);
    return res.status(500).json({ error: "Error al listar clientes" });
  }
}

async function obtenerCliente(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM clientes WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return res.status(500).json({ error: "Error al obtener cliente" });
  }
}

async function crearCliente(req, res) {
  try {
    const {
      nombre,
      dni_cif,
      telefono,
      email,
      direccion,
      observaciones,
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO clientes
        (nombre, dni_cif, telefono, email, direccion, observaciones)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        dni_cif || null,
        telefono || null,
        email || null,
        direccion || null,
        observaciones || null,
      ]
    );

    return res.json({
      mensaje: "Cliente creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return res.status(500).json({ error: "Error al crear cliente" });
  }
}

async function actualizarCliente(req, res) {
  try {
    const { id } = req.params;
    const {
      nombre,
      dni_cif,
      telefono,
      email,
      direccion,
      observaciones,
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `UPDATE clientes
       SET nombre = ?,
           dni_cif = ?,
           telefono = ?,
           email = ?,
           direccion = ?,
           observaciones = ?
       WHERE id = ?`,
      [
        nombre.trim(),
        dni_cif || null,
        telefono || null,
        email || null,
        direccion || null,
        observaciones || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json({ mensaje: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return res.status(500).json({ error: "Error al actualizar cliente" });
  }
}

async function eliminarCliente(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE clientes
       SET activo = 0
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return res.status(500).json({ error: "Error al eliminar cliente" });
  }
}

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};