const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

function permitirRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const permitidosNormalizados = rolesPermitidos.map((r) =>
      String(r).toLowerCase()
    );

    let rolesUsuario = [];

    if (Array.isArray(req.usuario.roles)) {
      rolesUsuario = req.usuario.roles;
    } else if (req.usuario.rol) {
      rolesUsuario = [req.usuario.rol];
    } else if (req.usuario.role) {
      rolesUsuario = [req.usuario.role];
    }

    const tieneRol = rolesUsuario.some((rol) =>
      permitidosNormalizados.includes(String(rol).toLowerCase())
    );

    if (!tieneRol) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para esta acción" });
    }

    next();
  };
}

module.exports = { verificarToken, permitirRoles };