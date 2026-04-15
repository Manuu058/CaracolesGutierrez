const express = require("express");
const router = express.Router();
const controller = require("../controllers/lotesController");

// SOLO CONSULTA (SIN CREAR NI MODIFICAR)
router.get("/", controller.listar);
router.get("/:id", controller.obtener);

module.exports = router;