const express = require("express");
const router = express.Router();

const { verificarToken, permitirRoles } = require("../middlewares/authMiddleware");

const clientesController = require("../controllers/clientesController");
const proveedoresController = require("../controllers/proveedoresController");
const trabajadoresController = require("../controllers/trabajadoresController");
const usuariosSistemaController = require("../controllers/usuariosSistemaController");
const authController = require("../controllers/authController");

// AUTH
router.post("/login", authController.login);

// CLIENTES
router.get(
  "/clientes",
  verificarToken,
  clientesController.listarClientes
);
router.get(
  "/clientes/:id",
  verificarToken,
  clientesController.obtenerCliente
);
router.post(
  "/clientes",
  verificarToken,
  permitirRoles("Administrador", "encargado"),
  clientesController.crearCliente
);
router.put(
  "/clientes/:id",
  verificarToken,
  permitirRoles("Administrador", "encargado"),
  clientesController.actualizarCliente
);
router.delete(
  "/clientes/:id",
  verificarToken,
  permitirRoles("Administrador"),
  clientesController.eliminarCliente
);

// PROVEEDORES
router.get(
  "/proveedores",
  verificarToken,
  proveedoresController.listarProveedores
);
router.get(
  "/proveedores/:id",
  verificarToken,
  proveedoresController.obtenerProveedor
);
router.post(
  "/proveedores",
  verificarToken,
  permitirRoles("Administrador", "encargado"),
  proveedoresController.crearProveedor
);
router.put(
  "/proveedores/:id",
  verificarToken,
  permitirRoles("Administrador", "encargado"),
  proveedoresController.actualizarProveedor
);
router.delete(
  "/proveedores/:id",
  verificarToken,
  permitirRoles("Administrador"),
  proveedoresController.eliminarProveedor
);

// TRABAJADORES
router.get(
  "/trabajadores",
  verificarToken,
  permitirRoles("administrador", "encargado", "Administrador"),
  trabajadoresController.listarTrabajadores
);
router.post(
  "/trabajadores",
  verificarToken,
  permitirRoles("Administrador"),
  trabajadoresController.crearTrabajador
);
router.put(
  "/trabajadores/:id",
  verificarToken,
  permitirRoles("Administrador"),
  trabajadoresController.actualizarTrabajador
);

// USUARIOS SISTEMA
router.get(
  "/usuarios-sistema",
  verificarToken,
  permitirRoles("Administrador"),
  usuariosSistemaController.listarUsuarios
);
router.post(
  "/usuarios-sistema",
  verificarToken,
  permitirRoles("Administrador"),
  usuariosSistemaController.crearUsuario
);
router.put(
  "/usuarios-sistema/:id",
  verificarToken,
  permitirRoles("Administrador"),
  usuariosSistemaController.actualizarUsuario
);

module.exports = router;