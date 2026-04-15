const pool = require("../config/db");

function limpiarTexto(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto === "" ? null : texto;
}

async function listarClientes(req, res) {
  try {
    const { busqueda = "" } = req.query;

    let sql = `
      SELECT
        id,
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
        created_at,
        updated_at
      FROM clientes
      WHERE activo = 1
    `;
    const params = [];

    if (busqueda && String(busqueda).trim() !== "") {
      const filtro = `%${String(busqueda).trim()}%`;
      sql += `
        AND (
          nombre LIKE ?
          OR telefono LIKE ?
          OR email LIKE ?
          OR direccion LIKE ?
          OR empresa LIKE ?
          OR nif_cif LIKE ?
          OR persona_contacto LIKE ?
          OR iban LIKE ?
          OR metodo_pago_preferido LIKE ?
        )
      `;
      params.push(
        filtro,
        filtro,
        filtro,
        filtro,
        filtro,
        filtro,
        filtro,
        filtro,
        filtro
      );
    }

    sql += ` ORDER BY nombre ASC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error("Error al listar clientes:", error);
    return res.status(500).json({
      error: "Error al listar clientes",
      detalle: error.message,
    });
  }
}

async function obtenerCliente(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        id,
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
        created_at,
        updated_at
      FROM clientes
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return res.status(500).json({
      error: "Error al obtener cliente",
      detalle: error.message,
    });
  }
}

async function crearCliente(req, res) {
  try {
    const nombre = limpiarTexto(req.body.nombre);
    const telefono = limpiarTexto(req.body.telefono);
    const email = limpiarTexto(req.body.email);
    const direccion = limpiarTexto(req.body.direccion);
    const empresa = limpiarTexto(req.body.empresa);
    const nif_cif = limpiarTexto(req.body.nif_cif);
    const persona_contacto = limpiarTexto(req.body.persona_contacto);
    const iban = limpiarTexto(req.body.iban);
    const metodo_pago_preferido = limpiarTexto(req.body.metodo_pago_preferido);
    const observaciones = limpiarTexto(req.body.observaciones);

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (nif_cif) {
      const [duplicadoNif] = await pool.query(
        `
        SELECT id
        FROM clientes
        WHERE nif_cif = ? AND activo = 1
        LIMIT 1
        `,
        [nif_cif]
      );

      if (duplicadoNif.length > 0) {
        return res.status(400).json({
          error: "Ya existe un cliente activo con ese NIF/CIF",
        });
      }
    }

    if (email) {
      const [duplicadoEmail] = await pool.query(
        `
        SELECT id
        FROM clientes
        WHERE email = ? AND activo = 1
        LIMIT 1
        `,
        [email]
      );

      if (duplicadoEmail.length > 0) {
        return res.status(400).json({
          error: "Ya existe un cliente activo con ese email",
        });
      }
    }

    const [result] = await pool.query(
      `
      INSERT INTO clientes
      (
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
        activo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
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
      ]
    );

    return res.status(201).json({
      mensaje: "Cliente creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    return res.status(500).json({
      error: "Error al crear cliente",
      detalle: error.message,
    });
  }
}

async function actualizarCliente(req, res) {
  try {
    const { id } = req.params;

    const nombre = limpiarTexto(req.body.nombre);
    const telefono = limpiarTexto(req.body.telefono);
    const email = limpiarTexto(req.body.email);
    const direccion = limpiarTexto(req.body.direccion);
    const empresa = limpiarTexto(req.body.empresa);
    const nif_cif = limpiarTexto(req.body.nif_cif);
    const persona_contacto = limpiarTexto(req.body.persona_contacto);
    const iban = limpiarTexto(req.body.iban);
    const metodo_pago_preferido = limpiarTexto(req.body.metodo_pago_preferido);
    const observaciones = limpiarTexto(req.body.observaciones);

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (nif_cif) {
      const [duplicadoNif] = await pool.query(
        `
        SELECT id
        FROM clientes
        WHERE nif_cif = ? AND id <> ? AND activo = 1
        LIMIT 1
        `,
        [nif_cif, id]
      );

      if (duplicadoNif.length > 0) {
        return res.status(400).json({
          error: "Ya existe otro cliente activo con ese NIF/CIF",
        });
      }
    }

    if (email) {
      const [duplicadoEmail] = await pool.query(
        `
        SELECT id
        FROM clientes
        WHERE email = ? AND id <> ? AND activo = 1
        LIMIT 1
        `,
        [email, id]
      );

      if (duplicadoEmail.length > 0) {
        return res.status(400).json({
          error: "Ya existe otro cliente activo con ese email",
        });
      }
    }

    const [result] = await pool.query(
      `
      UPDATE clientes
      SET
        nombre = ?,
        telefono = ?,
        email = ?,
        direccion = ?,
        empresa = ?,
        nif_cif = ?,
        persona_contacto = ?,
        iban = ?,
        metodo_pago_preferido = ?,
        observaciones = ?
      WHERE id = ?
      `,
      [
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
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json({ mensaje: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return res.status(500).json({
      error: "Error al actualizar cliente",
      detalle: error.message,
    });
  }
}

async function eliminarCliente(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `
      UPDATE clientes
      SET activo = 0
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return res.status(500).json({
      error: "Error al eliminar cliente",
      detalle: error.message,
    });
  }
}

module.exports = {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
};