const express = require("express");
const router = express.Router();

const controller = require("../controllers/usuariosSistemaController");

// =========================
// 👥 USUARIOS SISTEMA
// =========================

// LISTAR
router.get("/", controller.listarUsuarios);

// OBTENER UNO
router.get("/:id", controller.obtenerUsuario);

// CREAR
router.post("/", controller.crearUsuario);

// ACTUALIZAR
router.put("/:id", controller.actualizarUsuario);

// ELIMINAR (DESACTIVAR)
router.delete("/:id", controller.eliminarUsuario);

module.exports = router;