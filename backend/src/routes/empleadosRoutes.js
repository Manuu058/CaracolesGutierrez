const express = require("express");
const router = express.Router();
const controller = require("../controllers/empleadosController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, controller.listar);
router.post("/", verificarToken, controller.crear);
router.put("/:id", verificarToken, controller.actualizar);
router.delete("/:id", verificarToken, controller.eliminar);

module.exports = router;