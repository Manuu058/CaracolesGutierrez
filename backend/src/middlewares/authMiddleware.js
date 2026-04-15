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
    if (!req.usuario || !req.usuario.roles) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const tieneRol = req.usuario.roles.some((rol) => rolesPermitidos.includes(rol));

    if (!tieneRol) {
      return res.status(403).json({ error: "No tienes permisos para esta acción" });
    }

    next();
  };
}

module.exports = { verificarToken, permitirRoles };