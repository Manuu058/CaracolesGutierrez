const express = require("express");
const router = express.Router();

const {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} = require("../controllers/proveedoresController");

router.get("/", listarProveedores);
router.get("/:id", obtenerProveedor);
router.post("/", crearProveedor);
router.put("/:id", actualizarProveedor);
router.delete("/:id", eliminarProveedor);

module.exports = router;