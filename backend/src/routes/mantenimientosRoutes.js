const express = require("express");
const router = express.Router();
const controller = require("../controllers/mantenimientosController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, controller.listar);
router.get("/proximos/listado", verificarToken, controller.proximos);
router.post("/", verificarToken, controller.crear);
router.put("/:id", verificarToken, controller.actualizar);
router.delete("/:id", verificarToken, controller.eliminar);

module.exports = router;