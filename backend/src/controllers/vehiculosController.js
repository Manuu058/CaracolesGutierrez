const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, CONCAT(e.nombre, ' ', IFNULL(e.apellidos, '')) AS conductor_habitual
       FROM vehiculos v
       LEFT JOIN empleados e ON e.id = v.conductor_habitual_id
       ORDER BY v.matricula ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar vehículos" });
  }
}

async function obtener(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vehiculos WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener vehículo" });
  }
}

async function crear(req, res) {
  try {
    const {
      matricula,
      marca,
      modelo,
      matriculacion,
      esta_activo,
      conductor_habitual_id,
      kilometros_actuales,
      observaciones,
    } = req.body;

    const errorCampos = validarCamposRequeridos({
      matricula,
      marca,
      modelo,
      matriculacion,
    });

    if (errorCampos) {
      return res.status(400).json({ error: errorCampos });
    }

    const [result] = await pool.query(
      `INSERT INTO vehiculos
      (matricula, marca, modelo, matriculacion, esta_activo, conductor_habitual_id, kilometros_actuales, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        matricula,
        marca,
        modelo,
        matriculacion,
        esta_activo ?? true,
        conductor_habitual_id || null,
        Number(kilometros_actuales || 0),
        observaciones || null,
      ]
    );

    res.status(201).json({
      message: "Vehículo creado",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || "Error al crear vehículo",
    });
  }
}

async function actualizar(req, res) {
  try {
    const {
      matricula,
      marca,
      modelo,
      matriculacion,
      esta_activo,
      conductor_habitual_id,
      kilometros_actuales,
      observaciones,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE vehiculos SET
       matricula = ?,
       marca = ?,
       modelo = ?,
       matriculacion = ?,
       esta_activo = ?,
       conductor_habitual_id = ?,
       kilometros_actuales = ?,
       observaciones = ?
       WHERE id = ?`,
      [
        matricula,
        marca,
        modelo,
        matriculacion,
        esta_activo ?? true,
        conductor_habitual_id || null,
        Number(kilometros_actuales || 0),
        observaciones || null,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ message: "Vehículo actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || "Error al actualizar vehículo",
    });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM vehiculos WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json({ message: "Vehículo eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar vehículo" });
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};