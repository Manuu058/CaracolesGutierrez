const pool = require("../config/db");
const bcrypt = require("bcrypt");

function limpiarTexto(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto === "" ? null : texto;
}

async function listarUsuarios(req, res) {
  try {
    const { busqueda = "", estado = "" } = req.query;

    let sql = `
      SELECT
        id,
        nombre,
        apellidos,
        email,
        username,
        telefono,
        activo,
        ultimo_acceso,
        created_at,
        updated_at
      FROM usuarios
      WHERE 1 = 1
    `;

    const params = [];

    if (busqueda && String(busqueda).trim() !== "") {
      const filtro = `%${String(busqueda).trim()}%`;
      sql += `
        AND (
          nombre LIKE ?
          OR apellidos LIKE ?
          OR email LIKE ?
          OR username LIKE ?
          OR telefono LIKE ?
        )
      `;
      params.push(filtro, filtro, filtro, filtro, filtro);
    }

    if (estado === "activo") {
      sql += ` AND activo = 1`;
    }

    if (estado === "inactivo") {
      sql += ` AND activo = 0`;
    }

    sql += ` ORDER BY username ASC`;

    const [rows] = await pool.query(sql, params);

    const datos = rows.map((u) => ({
      ...u,
      estado: u.activo === 1 ? "activo" : "inactivo",
    }));

    return res.json(datos);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return res.status(500).json({
      error: "Error al listar usuarios",
      detalle: error.message,
    });
  }
}

async function obtenerUsuario(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        id,
        nombre,
        apellidos,
        email,
        username,
        telefono,
        activo,
        ultimo_acceso,
        created_at,
        updated_at
      FROM usuarios
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuario = {
      ...rows[0],
      estado: rows[0].activo === 1 ? "activo" : "inactivo",
    };

    return res.json(usuario);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return res.status(500).json({
      error: "Error al obtener usuario",
      detalle: error.message,
    });
  }
}

async function crearUsuario(req, res) {
  try {
    const nombre = limpiarTexto(req.body.nombre);
    const apellidos = limpiarTexto(req.body.apellidos);
    const email = limpiarTexto(req.body.email);
    const username = limpiarTexto(req.body.username);
    const password = limpiarTexto(req.body.password);
    const telefono = limpiarTexto(req.body.telefono);
    const estado = limpiarTexto(req.body.estado);

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (!email) {
      return res.status(400).json({ error: "El email es obligatorio" });
    }

    if (!username) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario es obligatorio" });
    }

    if (!password) {
      return res.status(400).json({ error: "La contraseña es obligatoria" });
    }

    const [existeUsername] = await pool.query(
      `SELECT id FROM usuarios WHERE username = ? LIMIT 1`,
      [username]
    );

    if (existeUsername.length > 0) {
      return res.status(400).json({ error: "Ese nombre de usuario ya existe" });
    }

    const [existeEmail] = await pool.query(
      `SELECT id FROM usuarios WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existeEmail.length > 0) {
      return res.status(400).json({ error: "Ese email ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO usuarios
      (
        nombre,
        apellidos,
        email,
        username,
        password_hash,
        telefono,
        activo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nombre,
        apellidos,
        email,
        username,
        hash,
        telefono,
        estado === "inactivo" ? 0 : 1,
      ]
    );

    return res.status(201).json({
      mensaje: "Usuario creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({
      error: "Error al crear usuario",
      detalle: error.message,
    });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;

    const nombre = limpiarTexto(req.body.nombre);
    const apellidos = limpiarTexto(req.body.apellidos);
    const email = limpiarTexto(req.body.email);
    const username = limpiarTexto(req.body.username);
    const password = limpiarTexto(req.body.password);
    const telefono = limpiarTexto(req.body.telefono);
    const estado = limpiarTexto(req.body.estado);

    const [actual] = await pool.query(
      `SELECT * FROM usuarios WHERE id = ? LIMIT 1`,
      [id]
    );

    if (actual.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuarioActual = actual[0];

    const nombreFinal = nombre || usuarioActual.nombre;
    const apellidosFinal = apellidos !== null ? apellidos : usuarioActual.apellidos;
    const emailFinal = email || usuarioActual.email;
    const usernameFinal = username || usuarioActual.username;
    const telefonoFinal = telefono !== null ? telefono : usuarioActual.telefono;
    const activoFinal = estado === "inactivo" ? 0 : estado === "activo" ? 1 : usuarioActual.activo;

    if (!nombreFinal) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (!emailFinal) {
      return res.status(400).json({ error: "El email es obligatorio" });
    }

    if (!usernameFinal) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario es obligatorio" });
    }

    const [duplicadoUsername] = await pool.query(
      `SELECT id FROM usuarios WHERE username = ? AND id <> ? LIMIT 1`,
      [usernameFinal, id]
    );

    if (duplicadoUsername.length > 0) {
      return res.status(400).json({ error: "Ese nombre de usuario ya existe" });
    }

    const [duplicadoEmail] = await pool.query(
      `SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1`,
      [emailFinal, id]
    );

    if (duplicadoEmail.length > 0) {
      return res.status(400).json({ error: "Ese email ya existe" });
    }

    let passwordHashFinal = usuarioActual.password_hash;

    if (password) {
      passwordHashFinal = await bcrypt.hash(password, 10);
    }

    const [result] = await pool.query(
      `
      UPDATE usuarios
      SET
        nombre = ?,
        apellidos = ?,
        email = ?,
        username = ?,
        password_hash = ?,
        telefono = ?,
        activo = ?
      WHERE id = ?
      `,
      [
        nombreFinal,
        apellidosFinal,
        emailFinal,
        usernameFinal,
        passwordHashFinal,
        telefonoFinal,
        activoFinal,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({
      error: "Error al actualizar usuario",
      detalle: error.message,
    });
  }
}

async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `
      UPDATE usuarios
      SET activo = 0
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ mensaje: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({
      error: "Error al eliminar usuario",
      detalle: error.message,
    });
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};