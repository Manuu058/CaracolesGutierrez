const pool = require("../config/db");

function limpiarTexto(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto === "" ? null : texto;
}

async function listarProveedores(req, res) {
  try {
    const { busqueda = "" } = req.query;

    let sql = `
      SELECT
        id,
        nombre,
        empresa,
        telefono,
        email,
        direccion,
        nif_cif,
        persona_contacto,
        iban,
        metodo_pago_preferido,
        observaciones,
        activo,
        created_at,
        updated_at
      FROM proveedores
      WHERE activo = 1
    `;
    const params = [];

    if (busqueda && String(busqueda).trim() !== "") {
      const filtro = `%${String(busqueda).trim()}%`;
      sql += `
        AND (
          nombre LIKE ?
          OR empresa LIKE ?
          OR telefono LIKE ?
          OR email LIKE ?
          OR direccion LIKE ?
          OR nif_cif LIKE ?
          OR persona_contacto LIKE ?
          OR iban LIKE ?
          OR metodo_pago_preferido LIKE ?
          OR observaciones LIKE ?
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
        filtro,
        filtro
      );
    }

    sql += ` ORDER BY nombre ASC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error("Error al listar proveedores:", error);
    return res.status(500).json({
      error: "Error al listar proveedores",
      detalle: error.message,
    });
  }
}

async function obtenerProveedor(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        id,
        nombre,
        empresa,
        telefono,
        email,
        direccion,
        nif_cif,
        persona_contacto,
        iban,
        metodo_pago_preferido,
        observaciones,
        activo,
        created_at,
        updated_at
      FROM proveedores
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener proveedor:", error);
    return res.status(500).json({
      error: "Error al obtener proveedor",
      detalle: error.message,
    });
  }
}

async function crearProveedor(req, res) {
  try {
    const nombre = limpiarTexto(req.body.nombre);
    const empresa = limpiarTexto(req.body.empresa);
    const telefono = limpiarTexto(req.body.telefono);
    const email = limpiarTexto(req.body.email);
    const direccion = limpiarTexto(req.body.direccion);
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
        FROM proveedores
        WHERE nif_cif = ? AND activo = 1
        LIMIT 1
        `,
        [nif_cif]
      );

      if (duplicadoNif.length > 0) {
        return res.status(400).json({
          error: "Ya existe un proveedor activo con ese NIF/CIF",
        });
      }
    }

    if (email) {
      const [duplicadoEmail] = await pool.query(
        `
        SELECT id
        FROM proveedores
        WHERE email = ? AND activo = 1
        LIMIT 1
        `,
        [email]
      );

      if (duplicadoEmail.length > 0) {
        return res.status(400).json({
          error: "Ya existe un proveedor activo con ese email",
        });
      }
    }

    const [result] = await pool.query(
      `
      INSERT INTO proveedores
      (
        nombre,
        empresa,
        telefono,
        email,
        direccion,
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
        empresa,
        telefono,
        email,
        direccion,
        nif_cif,
        persona_contacto,
        iban,
        metodo_pago_preferido,
        observaciones,
      ]
    );

    return res.status(201).json({
      mensaje: "Proveedor creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    return res.status(500).json({
      error: "Error al crear proveedor",
      detalle: error.message,
    });
  }
}

async function actualizarProveedor(req, res) {
  try {
    const { id } = req.params;

    const nombre = limpiarTexto(req.body.nombre);
    const empresa = limpiarTexto(req.body.empresa);
    const telefono = limpiarTexto(req.body.telefono);
    const email = limpiarTexto(req.body.email);
    const direccion = limpiarTexto(req.body.direccion);
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
        FROM proveedores
        WHERE nif_cif = ? AND id <> ? AND activo = 1
        LIMIT 1
        `,
        [nif_cif, id]
      );

      if (duplicadoNif.length > 0) {
        return res.status(400).json({
          error: "Ya existe otro proveedor activo con ese NIF/CIF",
        });
      }
    }

    if (email) {
      const [duplicadoEmail] = await pool.query(
        `
        SELECT id
        FROM proveedores
        WHERE email = ? AND id <> ? AND activo = 1
        LIMIT 1
        `,
        [email, id]
      );

      if (duplicadoEmail.length > 0) {
        return res.status(400).json({
          error: "Ya existe otro proveedor activo con ese email",
        });
      }
    }

    const [result] = await pool.query(
      `
      UPDATE proveedores
      SET
        nombre = ?,
        empresa = ?,
        telefono = ?,
        email = ?,
        direccion = ?,
        nif_cif = ?,
        persona_contacto = ?,
        iban = ?,
        metodo_pago_preferido = ?,
        observaciones = ?
      WHERE id = ?
      `,
      [
        nombre,
        empresa,
        telefono,
        email,
        direccion,
        nif_cif,
        persona_contacto,
        iban,
        metodo_pago_preferido,
        observaciones,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    return res.json({ mensaje: "Proveedor actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    return res.status(500).json({
      error: "Error al actualizar proveedor",
      detalle: error.message,
    });
  }
}

async function eliminarProveedor(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `
      UPDATE proveedores
      SET activo = 0
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado" });
    }

    return res.json({ mensaje: "Proveedor eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    return res.status(500).json({
      error: "Error al eliminar proveedor",
      detalle: error.message,
    });
  }
}

module.exports = {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};