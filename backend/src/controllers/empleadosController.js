const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(`SELECT * FROM empleados ORDER BY nombre ASC, apellidos ASC`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar empleados" });
  }
}

async function crear(req, res) {
  try {
    const { nombre, apellidos, telefono, email, cargo, activo } = req.body;
    const errorCampos = validarCamposRequeridos({ nombre });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const [result] = await pool.query(
      `INSERT INTO empleados (nombre, apellidos, telefono, email, cargo, activo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellidos || null, telefono || null, email || null, cargo || null, activo ?? true]
    );

    res.status(201).json({ message: "Empleado creado", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear empleado" });
  }
}

async function actualizar(req, res) {
  try {
    const { nombre, apellidos, telefono, email, cargo, activo } = req.body;
    const [result] = await pool.query(
      `UPDATE empleados SET nombre=?, apellidos=?, telefono=?, email=?, cargo=?, activo=? WHERE id=?`,
      [nombre, apellidos || null, telefono || null, email || null, cargo || null, activo ?? true, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Empleado no encontrado" });
    res.json({ message: "Empleado actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar empleado" });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await pool.query(`DELETE FROM empleados WHERE id=?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Empleado no encontrado" });
    res.json({ message: "Empleado eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar empleado" });
  }
}

module.exports = { listar, crear, actualizar, eliminar };