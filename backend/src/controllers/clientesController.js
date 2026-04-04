const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM clientes ORDER BY nombre ASC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar clientes" });
  }
}

async function obtener(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM clientes WHERE id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener cliente" });
  }
}

async function crear(req, res) {
  try {
    const {
      nombre,
      telefono,
      email,
      direccion,
      empresa,
      nif_cif,
      persona_contacto,
      iban,
      metodo_pago_preferido,
      observaciones,
      activo,
    } = req.body;

    const errorCampos = validarCamposRequeridos({ nombre });

    if (errorCampos) {
      return res.status(400).json({ error: errorCampos });
    }

    const [result] = await pool.query(
      `INSERT INTO clientes
      (nombre, telefono, email, direccion, empresa, nif_cif, persona_contacto, iban, metodo_pago_preferido, observaciones, activo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        telefono || null,
        email || null,
        direccion || null,
        empresa || null,
        nif_cif || null,
        persona_contacto || null,
        iban || null,
        metodo_pago_preferido || null,
        observaciones || null,
        activo ?? true,
      ]
    );

    res.status(201).json({
      message: "Cliente creado",
      id: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
}

async function actualizar(req, res) {
  try {
    const {
      nombre,
      telefono,
      email,
      direccion,
      empresa,
      nif_cif,
      persona_contacto,
      iban,
      metodo_pago_preferido,
      observaciones,
      activo,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE clientes SET
        nombre = ?,
        telefono = ?,
        email = ?,
        direccion = ?,
        empresa = ?,
        nif_cif = ?,
        persona_contacto = ?,
        iban = ?,
        metodo_pago_preferido = ?,
        observaciones = ?,
        activo = ?
       WHERE id = ?`,
      [
        nombre,
        telefono || null,
        email || null,
        direccion || null,
        empresa || null,
        nif_cif || null,
        persona_contacto || null,
        iban || null,
        metodo_pago_preferido || null,
        observaciones || null,
        activo ?? true,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
}

async function eliminar(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM clientes WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
};