const express = require("express");
const router = express.Router();
const controller = require("../controllers/movimientosLoteController");
const { verificarToken } = require("../middlewares/authMiddleware");

router.get("/", verificarToken, controller.listar);
router.post("/", verificarToken, controller.crear);
router.delete("/:id", verificarToken, controller.eliminar);

module.exports = router;