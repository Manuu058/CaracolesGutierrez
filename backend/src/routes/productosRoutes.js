const express = require("express");
const router = express.Router();
const controller = require("../controllers/productosController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, controller.listar);
router.get("/stock/resumen", verificarToken, controller.stock);
router.get("/:id", verificarToken, controller.obtener);
router.post("/", verificarToken, controller.crear);
router.put("/:id", verificarToken, controller.actualizar);
router.delete("/:id", verificarToken, controller.eliminar);

module.exports = router;