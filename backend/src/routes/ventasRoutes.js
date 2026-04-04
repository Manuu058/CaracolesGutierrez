const express = require("express");
const router = express.Router();
const controller = require("../controllers/ventasController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, controller.listar);
router.get("/resumen/diario", verificarToken, controller.resumenDiario);
router.get("/resumen/mensual", verificarToken, controller.resumenMensual);
router.get("/cierres", verificarToken, controller.listarCierres);
router.get("/:id", verificarToken, controller.obtener);
router.post("/", verificarToken, controller.crear);
router.put("/:id/anular", verificarToken, controller.anular);
router.post("/cierres/generar", verificarToken, controller.generarCierre);

module.exports = router;