const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(`SELECT * FROM proveedores ORDER BY nombre ASC`);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar proveedores" });
  }
}

async function obtener(req, res) {
  try {
    const [rows] = await pool.query(`SELECT * FROM proveedores WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener proveedor" });
  }
}

async function crear(req, res) {
  try {
    const { nombre, telefono, email, direccion, nif_cif, persona_contacto, observaciones, activo } = req.body;
    const errorCampos = validarCamposRequeridos({ nombre });
    if (errorCampos) return res.status(400).json({ error: errorCampos });

    const [result] = await pool.query(
      `INSERT INTO proveedores (nombre, telefono, email, direccion, nif_cif, persona_contacto, observaciones, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, telefono || null, email || null, direccion || null, nif_cif || null, persona_contacto || null, observaciones || null, activo ?? true]
    );

    res.status(201).json({ message: "Proveedor creado", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear proveedor" });
  }
}

async function actualizar(req, res) {
  try {
    const { nombre, telefono, email, direccion, nif_cif, persona_contacto, observaciones, activo } = req.body;
    const [result] = await pool.query(
      `UPDATE proveedores
       SET nombre=?, telefono=?, email=?, direccion=?, nif_cif=?, persona_contacto=?, observaciones=?, activo=?
       WHERE id=?`,
      [nombre, telefono || null, email || null, direccion || null, nif_cif || null, persona_contacto || null, observaciones || null, activo ?? true, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json({ message: "Proveedor actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar proveedor" });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await pool.query(`DELETE FROM proveedores WHERE id = ?`, [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Proveedor no encontrado" });
    res.json({ message: "Proveedor eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar proveedor" });
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };