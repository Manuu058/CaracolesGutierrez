const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function login(req, res) {
  try {
    let { username, password } = req.body;

    username = typeof username === "string" ? username.trim() : "";
    password = typeof password === "string" ? password.trim() : "";

    console.log("LOGIN BODY:", { username, password });

    if (!username || !password) {
      console.log("FALLA: faltan credenciales");
      return res.status(400).json({
        error: "Usuario y contraseña son obligatorios",
      });
    }

    const [usuarios] = await pool.query(
      `SELECT id, nombre, apellidos, email, username, password_hash, activo
       FROM usuarios
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [username, username]
    );

    console.log("USUARIOS ENCONTRADOS:", usuarios);

    if (!usuarios || usuarios.length === 0) {
      console.log("FALLA: usuario no encontrado");
      return res.status(401).json({
        error: "No existe un usuario con ese nombre o email",
      });
    }

    const usuario = usuarios[0];

    console.log("PASSWORD ESCRITA:", `"${password}"`);
    console.log("PASSWORD BD:", `"${usuario.password_hash}"`);
    console.log("ACTIVO:", usuario.activo);

    if (!usuario.activo) {
      console.log("FALLA: usuario inactivo");
      return res.status(403).json({ error: "Usuario inactivo" });
    }

    const passwordBD =
      usuario.password_hash === null || usuario.password_hash === undefined
        ? ""
        : String(usuario.password_hash).trim();

    if (password !== passwordBD) {
      console.log("FALLA: contraseña distinta");
      return res.status(401).json({
        error: "La contraseña no coincide",
      });
    }

    console.log("OK: contraseña correcta");

    const [roles] = await pool.query(
      `SELECT r.nombre
       FROM usuario_roles ur
       INNER JOIN roles r ON r.id = ur.rol_id
       WHERE ur.usuario_id = ?`,
      [usuario.id]
    );

    console.log("ROLES:", roles);

    const nombresRoles = Array.isArray(roles) ? roles.map((r) => r.nombre) : [];

    console.log("ANTES DE JWT");

    const token = jwt.sign(
      {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombre: usuario.nombre,
        roles: nombresRoles,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "8h" }
    );

    console.log("JWT GENERADO");

    await pool.query(
      `UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?`,
      [usuario.id]
    );

    console.log("ULTIMO ACCESO ACTUALIZADO");
    console.log("LOGIN TERMINADO OK");

    return res.json({
      message: "Login correcto",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        username: usuario.username,
        roles: nombresRoles,
      },
    });
  } catch (error) {
    console.error("ERROR REAL EN LOGIN:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

async function perfil(req, res) {
  try {
    const [usuarios] = await pool.query(
      `SELECT id, nombre, apellidos, email, username, telefono, activo, ultimo_acceso, created_at
       FROM usuarios
       WHERE id = ?`,
      [req.usuario.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const [roles] = await pool.query(
      `SELECT r.nombre
       FROM usuario_roles ur
       INNER JOIN roles r ON r.id = ur.rol_id
       WHERE ur.usuario_id = ?`,
      [req.usuario.id]
    );

    return res.json({
      ...usuarios[0],
      roles: roles.map((r) => r.nombre),
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

module.exports = { login, perfil };