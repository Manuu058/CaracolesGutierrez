const express = require("express");
const router = express.Router();
const controller = require("../controllers/ventasController");

router.get("/", controller.listar);
router.get("/estado-diario", controller.obtenerEstadoDiario);
router.get("/resumen/diario", controller.resumenDiario);
router.get("/resumen/mensual", controller.resumenMensual);
router.get("/resumen/semanal-productos", controller.resumenSemanalProductos);
router.get("/cierres", controller.listarCierres);
router.get("/:id", controller.obtener);

router.post("/comenzar-dia", controller.comenzarVentaDiaria);
router.post("/reposicion", controller.registrarReposicion);
router.post("/cierre", controller.generarCierre);
router.post("/", controller.crear);

router.put("/:id/anular", controller.anular);

module.exports = router;