const pool = require("../config/db");

async function listarTrabajadores(req, res) {
  try {
    const { busqueda = "", estado = "" } = req.query;

    let sql = `SELECT * FROM trabajadores WHERE 1 = 1`;
    const params = [];

    if (busqueda) {
      sql += ` AND (
        nombre LIKE ?
        OR apellidos LIKE ?
        OR dni LIKE ?
        OR puesto LIKE ?
      )`;
      const filtro = `%${busqueda}%`;
      params.push(filtro, filtro, filtro, filtro);
    }

    if (estado) {
      sql += ` AND estado = ?`;
      params.push(estado);
    }

    sql += ` ORDER BY nombre ASC, apellidos ASC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error("Error al listar trabajadores:", error);
    return res.status(500).json({ error: "Error al listar trabajadores" });
  }
}

async function crearTrabajador(req, res) {
  try {
    const {
      nombre,
      apellidos,
      dni,
      telefono,
      email,
      puesto,
      fecha_alta,
      estado,
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO trabajadores
        (nombre, apellidos, dni, telefono, email, puesto, fecha_alta, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre.trim(),
        apellidos || null,
        dni || null,
        telefono || null,
        email || null,
        puesto || null,
        fecha_alta || null,
        estado || "activo",
      ]
    );

    return res.json({
      mensaje: "Trabajador creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear trabajador:", error);
    return res.status(500).json({ error: "Error al crear trabajador" });
  }
}

async function actualizarTrabajador(req, res) {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellidos,
      dni,
      telefono,
      email,
      puesto,
      fecha_alta,
      estado,
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `UPDATE trabajadores
       SET nombre = ?,
           apellidos = ?,
           dni = ?,
           telefono = ?,
           email = ?,
           puesto = ?,
           fecha_alta = ?,
           estado = ?
       WHERE id = ?`,
      [
        nombre.trim(),
        apellidos || null,
        dni || null,
        telefono || null,
        email || null,
        puesto || null,
        fecha_alta || null,
        estado || "activo",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Trabajador no encontrado" });
    }

    return res.json({ mensaje: "Trabajador actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar trabajador:", error);
    return res.status(500).json({ error: "Error al actualizar trabajador" });
  }
}

module.exports = {
  listarTrabajadores,
  crearTrabajador,
  actualizarTrabajador,
};