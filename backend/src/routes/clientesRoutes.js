const express = require("express");
const router = express.Router();

const {
  listarClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} = require("../controllers/clientesController");

router.get("/", listarClientes);
router.get("/:id", obtenerCliente);
router.post("/", crearCliente);
router.put("/:id", actualizarCliente);
router.delete("/:id", eliminarCliente);

module.exports = router;