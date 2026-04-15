const express = require("express");
const router = express.Router();
const controller = require("../controllers/movimientosLoteController");

router.get("/", controller.listar);
router.get("/lote/:id", controller.detallePorLote);
router.post("/", controller.crear);
router.delete("/:id", controller.eliminar);

module.exports = router;