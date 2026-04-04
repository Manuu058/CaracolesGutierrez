const express = require("express");
const router = express.Router();
const controller = require("../controllers/lotesController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, controller.listar);
router.get("/:id/historial", verificarToken, controller.historial);
router.get("/:id", verificarToken, controller.obtener);
router.post("/", verificarToken, controller.crear);
router.put("/:id", verificarToken, controller.actualizar);
router.delete("/:id", verificarToken, controller.eliminar);

module.exports = router;