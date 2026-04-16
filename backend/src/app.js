const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const proveedoresRoutes = require("./routes/proveedoresRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const productosRoutes = require("./routes/productosRoutes");
const lotesRoutes = require("./routes/lotesRoutes");
const movimientosLoteRoutes = require("./routes/movimientosLoteRoutes");
const empleadosRoutes = require("./routes/empleadosRoutes");
const vehiculosRoutes = require("./routes/vehiculosRoutes");
const mantenimientosRoutes = require("./routes/mantenimientosRoutes");
const ventasRoutes = require("./routes/ventasRoutes");
const gestionPersonasRoutes = require("./routes/gestionPersonasRoutes");
const usuariosSistemaRoutes = require("./routes/usuariosSistemaRoutes");
const etiquetasRoutes = require("./routes/etiquetasRoutes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "API Caracoles Gutiérrez S.L. funcionando",
    version: "1.0.0",
  });
});

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/proveedores", proveedoresRoutes);
app.use("/clientes", clientesRoutes);
app.use("/productos", productosRoutes);
app.use("/lotes", lotesRoutes);
app.use("/movimientos-lote", movimientosLoteRoutes);
app.use("/empleados", empleadosRoutes);
app.use("/vehiculos", vehiculosRoutes);
app.use("/mantenimientos", mantenimientosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/api", gestionPersonasRoutes);
app.use("/usuarios-sistema", usuariosSistemaRoutes);
app.use("/etiquetas", etiquetasRoutes);

module.exports = app;