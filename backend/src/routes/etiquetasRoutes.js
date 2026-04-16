const express = require("express");
const router = express.Router();

const { verificarToken, permitirRoles } = require("../middlewares/authMiddleware");
const controller = require("../controllers/etiquetasController");
const upload = require("../config/multerEtiquetas");

// PLANTILLAS
router.get("/plantillas", verificarToken, controller.listarPlantillas);

router.post(
  "/plantillas",
  verificarToken,
  permitirRoles("administrador"),
  upload.single("archivo"),
  controller.crearPlantilla
);

router.put(
  "/plantillas/:id",
  verificarToken,
  permitirRoles("administrador"),
  controller.actualizarPlantilla
);

// IMPRESIÓN
router.post(
  "/imprimir",
  verificarToken,
  controller.crearTrabajoImpresion
);

// HISTORIAL
router.get("/historial", verificarToken, controller.historial);

module.exports = router;