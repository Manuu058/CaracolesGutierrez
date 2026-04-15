const pool = require("../config/db");
const bcrypt = require("bcrypt");

async function listarUsuarios(req, res) {
  try {
    const { busqueda = "", rol = "", estado = "" } = req.query;

    let sql = `
      SELECT
        u.id,
        u.username,
        u.rol,
        u.trabajador_id,
        u.ultimo_acceso,
        u.estado,
        u.created_at,
        t.nombre,
        t.apellidos
      FROM usuarios_sistema u
      LEFT JOIN trabajadores t ON t.id = u.trabajador_id
      WHERE 1 = 1
    `;

    const params = [];

    if (busqueda) {
      sql += `
        AND (
          u.username LIKE ?
          OR t.nombre LIKE ?
          OR t.apellidos LIKE ?
        )
      `;
      const filtro = `%${busqueda}%`;
      params.push(filtro, filtro, filtro);
    }

    if (rol) {
      sql += ` AND u.rol = ?`;
      params.push(rol);
    }

    if (estado) {
      sql += ` AND u.estado = ?`;
      params.push(estado);
    }

    sql += ` ORDER BY u.username ASC`;

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return res.status(500).json({ error: "Error al listar usuarios" });
  }
}

async function obtenerUsuario(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.rol,
        u.trabajador_id,
        u.ultimo_acceso,
        u.estado,
        u.created_at,
        t.nombre,
        t.apellidos
      FROM usuarios_sistema u
      LEFT JOIN trabajadores t ON t.id = u.trabajador_id
      WHERE u.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return res.status(500).json({ error: "Error al obtener usuario" });
  }
}

async function crearUsuario(req, res) {
  try {
    const { username, password, rol, trabajador_id, estado } = req.body;

    if (!username || !String(username).trim()) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario es obligatorio" });
    }

    if (!password || !String(password).trim()) {
      return res.status(400).json({ error: "La contraseña es obligatoria" });
    }

    const usernameNormalizado = String(username).trim();

    const [existe] = await pool.query(
      `SELECT id FROM usuarios_sistema WHERE username = ? LIMIT 1`,
      [usernameNormalizado]
    );

    if (existe.length > 0) {
      return res.status(400).json({ error: "Ese nombre de usuario ya existe" });
    }

    const hash = await bcrypt.hash(String(password), 10);

    const [result] = await pool.query(
      `INSERT INTO usuarios_sistema
        (username, password_hash, rol, trabajador_id, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [
        usernameNormalizado,
        hash,
        rol || "consulta",
        trabajador_id || null,
        estado || "activo",
      ]
    );

    return res.status(201).json({
      mensaje: "Usuario creado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { username, rol, trabajador_id, estado, password } = req.body;

    const [actual] = await pool.query(
      `SELECT * FROM usuarios_sistema WHERE id = ? LIMIT 1`,
      [id]
    );

    if (actual.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usernameNormalizado = username
      ? String(username).trim()
      : actual[0].username;

    if (!usernameNormalizado) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario es obligatorio" });
    }

    const [duplicado] = await pool.query(
      `SELECT id FROM usuarios_sistema WHERE username = ? AND id <> ? LIMIT 1`,
      [usernameNormalizado, id]
    );

    if (duplicado.length > 0) {
      return res.status(400).json({ error: "Ese nombre de usuario ya existe" });
    }

    let passwordHash = actual[0].password_hash;

    if (password && String(password).trim()) {
      passwordHash = await bcrypt.hash(String(password), 10);
    }

    const [result] = await pool.query(
      `UPDATE usuarios_sistema
       SET username = ?,
           password_hash = ?,
           rol = ?,
           trabajador_id = ?,
           estado = ?
       WHERE id = ?`,
      [
        usernameNormalizado,
        passwordHash,
        rol || actual[0].rol,
        trabajador_id || null,
        estado || actual[0].estado,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE usuarios_sistema
       SET estado = 'inactivo'
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ mensaje: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ error: "Error al eliminar usuario" });
  }
}

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
};