const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, v.matricula, v.marca, v.modelo, tm.nombre AS tipo_mantenimiento,
              CONCAT(e.nombre, ' ', IFNULL(e.apellidos, '')) AS encargado
       FROM mantenimientos m
       INNER JOIN vehiculos v ON v.id = m.vehiculo_id
       INNER JOIN tipos_mantenimiento tm ON tm.id = m.tipo_mantenimiento_id
       LEFT JOIN empleados e ON e.id = m.encargado_id
       ORDER BY m.fecha DESC, m.id DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar mantenimientos" });
  }
}

async function crear(req, res) {
  try {
    const {
      vehiculo_id,
      tipo_mantenimiento_id,
      encargado_id,
      fecha,
      descripcion,
      coste,
      kilometros_en_momento,
      proxima_fecha,
      proximos_km,
      taller,
    } = req.body;

    const errorCampos = validarCamposRequeridos({
      vehiculo_id,
      tipo_mantenimiento_id,
      fecha,
    });

    if (errorCampos) {
      return res.status(400).json({ error: errorCampos });
    }

    const [result] = await pool.query(
      `INSERT INTO mantenimientos
      (vehiculo_id, tipo_mantenimiento_id, encargado_id, fecha, descripcion, coste, kilometros_en_momento, proxima_fecha, proximos_km, taller)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vehiculo_id,
        tipo_mantenimiento_id,
        encargado_id || null,
        fecha,
        descripcion || null,
        Number(coste || 0),
        kilometros_en_momento ? Number(kilometros_en_momento) : null,
        proxima_fecha || null,
        proximos_km ? Number(proximos_km) : null,
        taller || null,
      ]
    );

    res.status(201).json({
      message: "Mantenimiento creado",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || "Error al crear mantenimiento",
    });
  }
}

async function actualizar(req, res) {
  try {
    const {
      vehiculo_id,
      tipo_mantenimiento_id,
      encargado_id,
      fecha,
      descripcion,
      coste,
      kilometros_en_momento,
      proxima_fecha,
      proximos_km,
      taller,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE mantenimientos SET
       vehiculo_id = ?,
       tipo_mantenimiento_id = ?,
       encargado_id = ?,
       fecha = ?,
       descripcion = ?,
       coste = ?,
       kilometros_en_momento = ?,
       proxima_fecha = ?,
       proximos_km = ?,
       taller = ?
       WHERE id = ?`,
      [
        vehiculo_id,
        tipo_mantenimiento_id,
        encargado_id || null,
        fecha,
        descripcion || null,
        Number(coste || 0),
        kilometros_en_momento ? Number(kilometros_en_momento) : null,
        proxima_fecha || null,
        proximos_km ? Number(proximos_km) : null,
        taller || null,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }

    res.json({ message: "Mantenimiento actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || "Error al actualizar mantenimiento",
    });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM mantenimientos WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mantenimiento no encontrado" });
    }

    res.json({ message: "Mantenimiento eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar mantenimiento" });
  }
}

async function proximos(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vw_proximos_mantenimientos
       ORDER BY
         CASE estado_fecha
           WHEN 'VENCIDO' THEN 1
           WHEN 'PROXIMO' THEN 2
           ELSE 3
         END,
         proxima_fecha ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener próximos mantenimientos",
    });
  }
}

module.exports = {
  listar,
  crear,
  actualizar,
  eliminar,
  proximos,
};