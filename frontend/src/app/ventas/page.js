"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

export default function VentasPage() {
  const hoy = new Date();

  const formatearFechaInput = (fecha) => {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const hace7Dias = new Date();
  hace7Dias.setDate(hoy.getDate() - 6);

  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resumenDiario, setResumenDiario] = useState([]);
  const [resumenMensual, setResumenMensual] = useState([]);
  const [resumenSemanal, setResumenSemanal] = useState([]);
  const [estadoDiario, setEstadoDiario] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [filtros, setFiltros] = useState({
    desde: formatearFechaInput(hace7Dias),
    hasta: formatearFechaInput(hoy),
    almacen_id: "",
    metodo_pago_id: "",
    estado: "",
  });

  const [diaResumen, setDiaResumen] = useState(formatearFechaInput(hoy));

  const [formVenta, setFormVenta] = useState({
    almacen_id: 1,
    metodo_pago_id: 1,
    observaciones: "",
  });

  const [lineas, setLineas] = useState([
    {
      producto_id: "",
      descripcion_producto: "",
      cantidad: 1,
      precio_unitario: 0,
    },
  ]);

  const [mostrarModalInicio, setMostrarModalInicio] = useState(false);
  const [mostrarModalReposicion, setMostrarModalReposicion] = useState(false);

  const [formInicioDia, setFormInicioDia] = useState({
    fecha: formatearFechaInput(hoy),
    almacen_id: 1,
    bolsas_caracoles: "",
    bolsas_cabrillas: "",
    precio_caracoles: "",
    precio_cabrillas: "",
  });

  const [formReposicion, setFormReposicion] = useState({
    fecha: formatearFechaInput(hoy),
    almacen_id: 1,
    bolsas_caracoles: "",
    bolsas_cabrillas: "",
  });

  useEffect(() => {
    cargarTodo();
  }, []);

  useEffect(() => {
    cargarVentas();
    cargarResumenSemanal();
  }, [filtros]);

  useEffect(() => {
    cargarResumenDiario();
    cargarEstadoDiario();
  }, [diaResumen]);

  async function cargarTodo() {
    try {
      const [p, rm] = await Promise.all([
        api.get("/productos"),
        api.get("/ventas/resumen/mensual"),
      ]);

      setProductos(p.data || []);
      setResumenMensual(rm.data || []);

      await Promise.all([
        cargarVentas(),
        cargarResumenDiario(),
        cargarResumenSemanal(),
        cargarEstadoDiario(),
      ]);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  }

  async function cargarVentas() {
    try {
      const params = {
        desde: filtros.desde,
        hasta: filtros.hasta,
      };

      if (filtros.almacen_id) params.almacen_id = filtros.almacen_id;
      if (filtros.metodo_pago_id) params.metodo_pago_id = filtros.metodo_pago_id;
      if (filtros.estado) params.estado = filtros.estado;

      const { data } = await api.get("/ventas", { params });
      setVentas(data || []);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    }
  }

  async function cargarResumenDiario() {
    try {
      const { data } = await api.get("/ventas/resumen/diario", {
        params: { fecha: diaResumen },
      });
      setResumenDiario(data || []);
    } catch (error) {
      console.error("Error al cargar resumen diario:", error);
    }
  }

  async function cargarResumenSemanal() {
    try {
      const params = {
        desde: filtros.desde,
        hasta: filtros.hasta,
      };

      if (filtros.almacen_id) params.almacen_id = filtros.almacen_id;
      if (filtros.metodo_pago_id) params.metodo_pago_id = filtros.metodo_pago_id;

      const { data } = await api.get("/ventas/resumen/semanal-productos", { params });
      setResumenSemanal(data || []);
    } catch (error) {
      console.error("Error al cargar resumen semanal:", error);
    }
  }

  async function cargarEstadoDiario() {
    try {
      const { data } = await api.get("/ventas/estado-diario", {
        params: { fecha: diaResumen },
      });
      setEstadoDiario(data || []);
    } catch (error) {
      console.error("Error al cargar estado diario:", error);
    }
  }

  const productosFiltrados = useMemo(() => {
    return (productos || [])
      .filter((p) => {
        const nombre = String(p.nombre || "").toLowerCase();
        return !nombre.includes("caldo");
      })
      .sort((a, b) => {
        const nombreA = String(a.nombre || "").toLowerCase();
        const nombreB = String(b.nombre || "").toLowerCase();

        const prioridad = (nombre) => {
          if (nombre.includes("especies") || nombre.includes("especias")) return 1;
          if (nombre.includes("tarrinas")) return 2;
          if (nombre.includes("caracoles")) return 3;
          if (nombre.includes("cabrillas")) return 4;
          return 99;
        };

        return prioridad(nombreA) - prioridad(nombreB);
      });
  }, [productos]);

  const totalVenta = useMemo(() => {
    return lineas.reduce((acc, linea) => {
      return acc + Number(linea.cantidad || 0) * Number(linea.precio_unitario || 0);
    }, 0);
  }, [lineas]);

  const totalDelDia = useMemo(() => {
    return (resumenDiario || []).reduce((acc, fila) => {
      return acc + Number(fila.total_vendido || 0);
    }, 0);
  }, [resumenDiario]);

  const ventasDelDia = useMemo(() => {
    return (resumenDiario || []).reduce((acc, fila) => {
      return acc + Number(fila.numero_ventas || 0);
    }, 0);
  }, [resumenDiario]);

  const unidadesSemana = useMemo(() => {
    return (resumenSemanal || []).reduce((acc, item) => {
      return acc + Number(item.cantidad_vendida || 0);
    }, 0);
  }, [resumenSemanal]);

  const estadoActualAlmacenVenta = useMemo(() => {
    return (estadoDiario || []).find(
      (item) => String(item.almacen_id) === String(formVenta.almacen_id)
    );
  }, [estadoDiario, formVenta.almacen_id]);

  const handleVentaChange = (e) => {
    setFormVenta({
      ...formVenta,
      [e.target.name]: e.target.value,
    });
  };

  const handleFiltrosChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value,
    });
  };

  function detectarTipoProducto(nombre = "") {
    const texto = String(nombre).toLowerCase();
    if (texto.includes("cabrillas")) return "cabrillas";
    if (texto.includes("caracoles")) return "caracoles";
    return null;
  }

  const handleLineaChange = (index, field, value) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index][field] = value;

    if (field === "producto_id") {
      const producto = productosFiltrados.find((p) => String(p.id) === String(value));

      if (producto) {
        nuevasLineas[index].descripcion_producto = producto.nombre;

        const tipo = detectarTipoProducto(producto.nombre);
        if (tipo === "caracoles" && estadoActualAlmacenVenta?.precio_caracoles) {
          nuevasLineas[index].precio_unitario = Number(
            estadoActualAlmacenVenta.precio_caracoles || 0
          );
        } else if (tipo === "cabrillas" && estadoActualAlmacenVenta?.precio_cabrillas) {
          nuevasLineas[index].precio_unitario = Number(
            estadoActualAlmacenVenta.precio_cabrillas || 0
          );
        } else {
          nuevasLineas[index].precio_unitario = Number(producto.precio || 0);
        }
      }
    }

    setLineas(nuevasLineas);
  };

  const agregarLinea = () => {
    setLineas([
      ...lineas,
      {
        producto_id: "",
        descripcion_producto: "",
        cantidad: 1,
        precio_unitario: 0,
      },
    ]);
  };

  const eliminarLinea = (index) => {
    if (lineas.length === 1) return;
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const abrirModalInicio = () => {
    setFormInicioDia((prev) => ({
      ...prev,
      fecha: diaResumen,
      almacen_id: Number(formVenta.almacen_id || 1),
    }));
    setMostrarModalInicio(true);
  };

  const abrirModalReposicion = () => {
    setFormReposicion((prev) => ({
      ...prev,
      fecha: diaResumen,
      almacen_id: Number(formVenta.almacen_id || 1),
    }));
    setMostrarModalReposicion(true);
  };

  const comenzarVentaDiaria = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await api.post("/ventas/comenzar-dia", {
        ...formInicioDia,
        almacen_id: Number(formInicioDia.almacen_id),
        bolsas_caracoles: Number(formInicioDia.bolsas_caracoles || 0),
        bolsas_cabrillas: Number(formInicioDia.bolsas_cabrillas || 0),
        precio_caracoles: Number(formInicioDia.precio_caracoles || 0),
        precio_cabrillas: Number(formInicioDia.precio_cabrillas || 0),
      });

      setMensaje("Venta diaria comenzada correctamente");
      setMostrarModalInicio(false);
      await Promise.all([cargarEstadoDiario(), cargarResumenDiario()]);
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.error || "Error al comenzar venta diaria");
    }
  };

  const registrarReposicion = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await api.post("/ventas/reposicion", {
        ...formReposicion,
        almacen_id: Number(formReposicion.almacen_id),
        bolsas_caracoles: Number(formReposicion.bolsas_caracoles || 0),
        bolsas_cabrillas: Number(formReposicion.bolsas_cabrillas || 0),
      });

      setMensaje("Reposición registrada correctamente");
      setMostrarModalReposicion(false);
      setFormReposicion({
        fecha: diaResumen,
        almacen_id: Number(formVenta.almacen_id || 1),
        bolsas_caracoles: "",
        bolsas_cabrillas: "",
      });

      await Promise.all([cargarEstadoDiario(), cargarResumenDiario()]);
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.error || "Error al registrar reposición");
    }
  };

  const crearVenta = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      const { data } = await api.post("/ventas", {
        ...formVenta,
        fecha: diaResumen,
        almacen_id: Number(formVenta.almacen_id),
        metodo_pago_id: Number(formVenta.metodo_pago_id),
        lineas: lineas.map((l) => ({
          producto_id: Number(l.producto_id),
          descripcion_producto: l.descripcion_producto,
          cantidad: Number(l.cantidad),
          precio_unitario: Number(l.precio_unitario),
        })),
      });
     

      setMensaje("Venta creada correctamente");
      setLineas([
        {
          producto_id: "",
          descripcion_producto: "",
          cantidad: 1,
          precio_unitario: 0,
        },
      ]);

      await Promise.all([
        cargarVentas(),
        cargarEstadoDiario(),
        cargarResumenDiario(),
        cargarResumenSemanal(),
        cargarTodoMensualSolo(),
      ]);

      if (data?.aviso_reposicion) {
        const reponer = window.confirm(
          "El stock de este almacén se ha quedado a 0. ¿Quieres registrar una reposición ahora?"
        );
        if (reponer) abrirModalReposicion();
      }
    } catch (error) {
      console.error("ERROR AXIOS:", error);
      console.error("STATUS:", error.response?.status);
      console.error("DATA:", error.response?.data);
      console.error("MENSAJE BACKEND:", error.response?.data?.error);

      const msg = error.response?.data?.error || "Error al crear venta";
      alert(msg);
      setMensaje(msg);

      if (error.response?.data?.pregunta_reposicion) {
        const reponer = window.confirm(`${msg} ¿Quieres registrar una reposición ahora?`);
        if (reponer) abrirModalReposicion();
      }
    }
  };

  async function cargarTodoMensualSolo() {
    try {
      const { data } = await api.get("/ventas/resumen/mensual");
      setResumenMensual(data || []);
    } catch (error) {
      console.error(error);
    }
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fafc 0%, #f5f7f6 100%)",
    padding: "28px 20px 40px",
  };

  const containerStyle = {
    maxWidth: "1500px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 700,
  };

  const sectionTitleStyle = {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#111827",
  };

  const sectionTextStyle = {
    margin: "8px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.6,
  };

  const tableContainerStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    overflowX: "auto",
    overflowY: "hidden",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "980px",
  };

  const thStyle = {
    textAlign: "left",
    padding: "16px 18px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#111827",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "16px 18px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
  };

  const emptyCellStyle = {
    padding: "22px 18px",
    fontSize: "15px",
    color: "#6b7280",
    textAlign: "center",
  };

  const botonVerde = {
    border: "none",
    borderRadius: "14px",
    padding: "13px 18px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#fff",
    cursor: "pointer",
    background: "#166534",
  };

  function badgeMetodoPago(metodo) {
    const normalizado = String(metodo || "").toLowerCase();

    const estilo =
      normalizado === "efectivo"
        ? { background: "#fef3c7", color: "#92400e" }
        : normalizado === "tarjeta"
        ? { background: "#dbeafe", color: "#1d4ed8" }
        : { background: "#f3e8ff", color: "#7c3aed" };

    return (
      <span
        style={{
          display: "inline-block",
          padding: "6px 10px",
          borderRadius: "10px",
          fontWeight: 700,
          fontSize: "12px",
          ...estilo,
        }}
      >
        {metodo || "-"}
      </span>
    );
  }

  function badgeCodigo(codigo) {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "6px 10px",
          borderRadius: "999px",
          background: "#ecfdf5",
          color: "#166534",
          fontWeight: 800,
          fontSize: "12px",
        }}
      >
        {codigo || "-"}
      </span>
    );
  }

  function badgeEstado(valor) {
    const esActiva = String(valor || "").toUpperCase() === "ACTIVA";

    return (
      <span
        style={{
          display: "inline-block",
          padding: "6px 10px",
          borderRadius: "999px",
          background: esActiva ? "#ecfdf5" : "#fef2f2",
          color: esActiva ? "#166534" : "#b91c1c",
          fontWeight: 800,
          fontSize: "12px",
        }}
      >
        {valor || "-"}
      </span>
    );
  }

  function formatearFechaHora(valor) {
    if (!valor) return "-";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return valor;
    return fecha.toLocaleString("es-ES");
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <section
          style={{
            ...cardStyle,
            padding: "28px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  background: "#ecfdf5",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "14px",
                }}
              >
                Módulo de ventas
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "34px",
                  lineHeight: 1.1,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Registro y control de ventas
              </h1>

              <p
                style={{
                  margin: "12px 0 0 0",
                  maxWidth: "760px",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#6b7280",
                }}
              >
                Control diario de mercancía, reposiciones, filtros avanzados,
                resumen del día y listado completo de ventas con fecha y hora.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button type="button" onClick={abrirModalInicio} style={botonVerde}>
                Comenzar venta diaria
              </button>

              <button
                type="button"
                onClick={abrirModalReposicion}
                style={{
                  ...botonVerde,
                  background: "#1d4ed8",
                }}
              >
                Reposición
              </button>
            </div>
          </div>
        </section>

        {mensaje ? (
          <section
            style={{
              ...cardStyle,
              padding: "16px 18px",
              marginBottom: "20px",
              background: mensaje.toLowerCase().includes("error")
                ? "#fef2f2"
                : "#ecfdf5",
              borderColor: mensaje.toLowerCase().includes("error")
                ? "#fecaca"
                : "#bbf7d0",
            }}
          >
            <div
              style={{
                color: mensaje.toLowerCase().includes("error") ? "#b91c1c" : "#166534",
                fontWeight: 700,
              }}
            >
              {mensaje}
            </div>
          </section>
        ) : null}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {[
            {
              titulo: "Total vendido del día",
              valor: `${totalDelDia.toFixed(2)} €`,
              fondo: "#f0fdf4",
            },
            {
              titulo: "Ventas del día",
              valor: ventasDelDia,
              fondo: "#eff6ff",
            },
            {
              titulo: "Ventas registradas",
              valor: ventas.length,
              fondo: "#ffffff",
            },
            {
              titulo: "Unidades periodo filtrado",
              valor: unidadesSemana,
              fondo: "#fff7ed",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                ...cardStyle,
                padding: "20px",
                background: item.fondo,
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6b7280",
                  marginBottom: "10px",
                }}
              >
                {item.titulo}
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                {item.valor}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            ...cardStyle,
            padding: "22px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h2 style={sectionTitleStyle}>Estado diario de mercancía</h2>
            <p style={sectionTextStyle}>
              Aquí ves cuántas bolsas quedan y cuántas se han vendido por almacén.
            </p>
          </div>

          <div style={{ marginBottom: "16px", maxWidth: "250px" }}>
            <label style={labelStyle}>Día</label>
            <input
              type="date"
              value={diaResumen}
              onChange={(e) => setDiaResumen(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "16px",
            }}
          >
            {estadoDiario.length > 0 ? (
              estadoDiario.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "18px",
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#111827",
                      fontSize: "18px",
                      marginBottom: "10px",
                    }}
                  >
                    {item.almacen}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      fontSize: "14px",
                    }}
                  >
                    <div>
                      <strong>Caracoles inicial:</strong> {Number(item.bolsas_caracoles_iniciales || 0)}
                    </div>
                    <div>
                      <strong>Cabrillas inicial:</strong> {Number(item.bolsas_cabrillas_iniciales || 0)}
                    </div>
                    <div>
                      <strong>Caracoles repuestos:</strong> {Number(item.bolsas_caracoles_repuestas || 0)}
                    </div>
                    <div>
                      <strong>Cabrillas repuestas:</strong> {Number(item.bolsas_cabrillas_repuestas || 0)}
                    </div>
                    <div>
                      <strong>Caracoles vendidos:</strong> {Number(item.bolsas_caracoles_vendidas || 0)}
                    </div>
                    <div>
                      <strong>Cabrillas vendidas:</strong> {Number(item.bolsas_cabrillas_vendidas || 0)}
                    </div>
                    <div style={{ color: "#166534", fontWeight: 800 }}>
                      <strong>Caracoles restantes:</strong> {Number(item.bolsas_caracoles_restantes || 0)}
                    </div>
                    <div style={{ color: "#166534", fontWeight: 800 }}>
                      <strong>Cabrillas restantes:</strong> {Number(item.bolsas_cabrillas_restantes || 0)}
                    </div>
                    <div>
                      <strong>Precio caracoles:</strong> {Number(item.precio_caracoles || 0).toFixed(2)} €
                    </div>
                    <div>
                      <strong>Precio cabrillas:</strong> {Number(item.precio_cabrillas || 0).toFixed(2)} €
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  ...cardStyle,
                  padding: "20px",
                  gridColumn: "1 / -1",
                }}
              >
                No hay venta diaria iniciada para el día seleccionado.
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            padding: "22px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h2 style={sectionTitleStyle}>Filtros avanzados del listado</h2>
            <p style={sectionTextStyle}>
              Filtra las ventas por fechas, almacén, método de pago y estado.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={labelStyle}>Desde</label>
              <input
                type="date"
                name="desde"
                value={filtros.desde}
                onChange={handleFiltrosChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Hasta</label>
              <input
                type="date"
                name="hasta"
                value={filtros.hasta}
                onChange={handleFiltrosChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Almacén</label>
              <select
                name="almacen_id"
                value={filtros.almacen_id}
                onChange={handleFiltrosChange}
                style={inputStyle}
              >
                <option value="">Todos</option>
                <option value="1">Almacén de Sevilla</option>
                <option value="2">Almacén de Medina</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Método de pago</label>
              <select
                name="metodo_pago_id"
                value={filtros.metodo_pago_id}
                onChange={handleFiltrosChange}
                style={inputStyle}
              >
                <option value="">Todos</option>
                <option value="1">Efectivo</option>
                <option value="2">Tarjeta</option>
                <option value="3">Bizum</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Estado</label>
              <select
                name="estado"
                value={filtros.estado}
                onChange={handleFiltrosChange}
                style={inputStyle}
              >
                <option value="">Todos</option>
                <option value="ACTIVA">Activa</option>
                <option value="ANULADA">Anulada</option>
              </select>
            </div>
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            padding: "24px",
            marginBottom: "22px",
          }}
        >
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionTitleStyle}>Nueva venta</h2>
            <p style={sectionTextStyle}>
              Puedes seguir modificando el precio en cada línea aunque exista un precio diario.
            </p>
          </div>

          <form onSubmit={crearVenta}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginBottom: "18px",
              }}
            >
              <div>
                <label style={labelStyle}>Almacén</label>
                <select
                  name="almacen_id"
                  value={formVenta.almacen_id}
                  onChange={handleVentaChange}
                  style={inputStyle}
                >
                  <option value={1}>Almacén de Sevilla</option>
                  <option value={2}>Almacén de Medina</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Método de pago</label>
                <select
                  name="metodo_pago_id"
                  value={formVenta.metodo_pago_id}
                  onChange={handleVentaChange}
                  style={inputStyle}
                >
                  <option value={1}>Efectivo</option>
                  <option value={2}>Tarjeta</option>
                  <option value={3}>Bizum</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Observaciones</label>
                <textarea
                  name="observaciones"
                  value={formVenta.observaciones}
                  onChange={handleVentaChange}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
            </div>

            {estadoActualAlmacenVenta ? (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "10px",
                }}
              >
                <div>
                  <strong>Caracoles restantes:</strong>{" "}
                  {Number(estadoActualAlmacenVenta.bolsas_caracoles_restantes || 0)}
                </div>
                <div>
                  <strong>Cabrillas restantes:</strong>{" "}
                  {Number(estadoActualAlmacenVenta.bolsas_cabrillas_restantes || 0)}
                </div>
                <div>
                  <strong>Precio caracoles:</strong>{" "}
                  {Number(estadoActualAlmacenVenta.precio_caracoles || 0).toFixed(2)} €
                </div>
                <div>
                  <strong>Precio cabrillas:</strong>{" "}
                  {Number(estadoActualAlmacenVenta.precio_cabrillas || 0).toFixed(2)} €
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  color: "#9a3412",
                  fontWeight: 700,
                }}
              >
                En este almacén todavía no has pulsado "Comenzar venta diaria" para el día seleccionado.
              </div>
            )}

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    Líneas de venta
                  </h3>
                  <p
                    style={{
                      margin: "6px 0 0 0",
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    Total actual de esta venta:{" "}
                    <strong style={{ color: "#166534" }}>
                      {totalVenta.toFixed(2)} €
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={agregarLinea}
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    background: "#ffffff",
                    color: "#111827",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Añadir línea
                </button>
              </div>

              {lineas.map((linea, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "16px",
                    marginBottom: "14px",
                    background: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "14px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#111827",
                      }}
                    >
                      Línea {index + 1}
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#166534",
                        background: "#ecfdf5",
                        border: "1px solid #bbf7d0",
                        padding: "6px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      Importe:{" "}
                      {(
                        Number(linea.cantidad || 0) *
                        Number(linea.precio_unitario || 0)
                      ).toFixed(2)} €
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Producto</label>
                      <select
                        value={linea.producto_id}
                        onChange={(e) =>
                          handleLineaChange(index, "producto_id", e.target.value)
                        }
                        style={inputStyle}
                      >
                        <option value="">Selecciona producto</option>
                        {productosFiltrados.map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={linea.cantidad}
                        onChange={(e) =>
                          handleLineaChange(index, "cantidad", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Precio unitario</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={linea.precio_unitario}
                        onChange={(e) =>
                          handleLineaChange(index, "precio_unitario", e.target.value)
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ display: "flex", alignItems: "end" }}>
                      <button
                        type="button"
                        onClick={() => eliminarLinea(index)}
                        style={{
                          width: "100%",
                          border: "none",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          background: lineas.length === 1 ? "#f3f4f6" : "#fef2f2",
                          color: lineas.length === 1 ? "#9ca3af" : "#b91c1c",
                          cursor: lineas.length === 1 ? "not-allowed" : "pointer",
                          fontWeight: 700,
                        }}
                      >
                        Eliminar línea
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "18px",
              }}
            >
              <button type="submit" style={botonVerde}>
                Guardar venta
              </button>
            </div>
          </form>
        </section>

        <section
  style={{
            ...cardStyle,
            padding: "22px",
            marginBottom: "22px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h2 style={sectionTitleStyle}>Listado de ventas</h2>
            <p style={sectionTextStyle}>
              Ahora muestra fecha y hora exacta, productos, cantidades y precios.
            </p>
          </div>

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Fecha y hora</th>
                  <th style={thStyle}>Almacén</th>
                  <th style={thStyle}>Método</th>
                  <th style={thStyle}>Productos / Cantidades / Precios</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.length > 0 ? (
                  ventas.map((row, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>{badgeCodigo(row.codigo_venta)}</td>

                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        {formatearFechaHora(row.fecha_hora)}
                      </td>

                      <td style={tdStyle}>{row.almacen || "-"}</td>

                      <td style={tdStyle}>{badgeMetodoPago(row.metodo_pago)}</td>

                      <td style={{ ...tdStyle, whiteSpace: "pre-line", minWidth: "320px" }}>
                        {row.detalle_productos
                          ? row.detalle_productos.split(" || ").map((item, i) => (
                              <div key={i} style={{ marginBottom: "6px" }}>
                                {item}
                              </div>
                            ))
                          : "-"}
                      </td>

                      <td style={tdStyle}>{badgeEstado(row.estado)}</td>

                      <td style={{ ...tdStyle, fontWeight: 800 }}>
                        {Number(row.total || 0).toFixed(2)} €
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={emptyCellStyle}>
                      No hay ventas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "20px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: "22px",
              borderLeft: "6px solid #2563eb",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h2 style={sectionTitleStyle}>Resumen diario</h2>
              <p style={sectionTextStyle}>
                Selecciona el día. Por defecto está puesto el actual.
              </p>
            </div>

            <div style={{ marginBottom: "14px", maxWidth: "220px" }}>
              <label style={labelStyle}>Día del resumen</label>
              <input
                type="date"
                value={diaResumen}
                onChange={(e) => setDiaResumen(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Fecha</th>
                      <th style={thStyle}>Almacén</th>
                      <th style={thStyle}>Nº ventas</th>
                      <th style={thStyle}>Productos / Cantidades / Precios</th>
                      <th style={thStyle}>Efectivo</th>
                      <th style={thStyle}>Tarjeta</th>
                      <th style={thStyle}>Bizum</th>
                      <th style={thStyle}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenDiario.length > 0 ? (
                      resumenDiario.map((row, index) => (
                        <tr key={index}>
                          <td style={tdStyle}>{row.fecha || "-"}</td>
                          <td style={tdStyle}>{row.almacen || "-"}</td>
                          <td style={tdStyle}>{row.numero_ventas || 0}</td>

                          <td style={{ ...tdStyle, whiteSpace: "pre-line", minWidth: "320px" }}>
                            {row.detalle_productos
                              ? row.detalle_productos.split(" || ").map((item, i) => (
                                  <div key={i} style={{ marginBottom: "6px" }}>
                                    {item}
                                  </div>
                                ))
                              : "-"}
                          </td>

                          <td style={tdStyle}>
                            {Number(row.total_efectivo || 0).toFixed(2)} €
                          </td>

                          <td style={tdStyle}>
                            {Number(row.total_tarjeta || 0).toFixed(2)} €
                          </td>

                          <td style={tdStyle}>
                            {Number(row.total_bizum || 0).toFixed(2)} €
                          </td>

                          <td style={{ ...tdStyle, fontWeight: 800, color: "#166534" }}>
                            {Number(row.total_vendido || 0).toFixed(2)} €
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} style={emptyCellStyle}>
                          No hay datos en el resumen diario
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: "22px",
              borderLeft: "6px solid #d97706",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h2 style={sectionTitleStyle}>Resumen mensual</h2>
              <p style={sectionTextStyle}>
                Histórico mensual de ventas activas.
              </p>
            </div>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Mes</th>
                    <th style={thStyle}>Ventas</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Ticket medio</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenMensual.length > 0 ? (
                    resumenMensual.map((row, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>{row.mes}</td>
                        <td style={tdStyle}>{row.numero_ventas}</td>
                        <td style={tdStyle}>{Number(row.total_vendido || 0).toFixed(2)} €</td>
                        <td style={tdStyle}>{Number(row.ticket_medio || 0).toFixed(2)} €</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={emptyCellStyle}>
                        No hay datos en el resumen mensual
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {mostrarModalInicio && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "650px",
                ...cardStyle,
                padding: "24px",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "14px", fontSize: "24px" }}>
                Comenzar venta diaria
              </h3>

              <form onSubmit={comenzarVentaDiaria}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Fecha</label>
                    <input
                      type="date"
                      value={formInicioDia.fecha}
                      onChange={(e) =>
                        setFormInicioDia({ ...formInicioDia, fecha: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Almacén</label>
                    <select
                      value={formInicioDia.almacen_id}
                      onChange={(e) =>
                        setFormInicioDia({ ...formInicioDia, almacen_id: e.target.value })
                      }
                      style={inputStyle}
                    >
                      <option value={1}>Almacén de Sevilla</option>
                      <option value={2}>Almacén de Medina</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Bolsas de caracoles</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formInicioDia.bolsas_caracoles}
                      onChange={(e) =>
                        setFormInicioDia({
                          ...formInicioDia,
                          bolsas_caracoles: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Bolsas de cabrillas</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formInicioDia.bolsas_cabrillas}
                      onChange={(e) =>
                        setFormInicioDia({
                          ...formInicioDia,
                          bolsas_cabrillas: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Precio caracoles</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formInicioDia.precio_caracoles}
                      onChange={(e) =>
                        setFormInicioDia({
                          ...formInicioDia,
                          precio_caracoles: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Precio cabrillas</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formInicioDia.precio_cabrillas}
                      onChange={(e) =>
                        setFormInicioDia({
                          ...formInicioDia,
                          precio_cabrillas: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setMostrarModalInicio(false)}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={botonVerde}>
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {mostrarModalReposicion && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "620px",
                ...cardStyle,
                padding: "24px",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "14px", fontSize: "24px" }}>
                Registrar reposición
              </h3>

              <form onSubmit={registrarReposicion}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Fecha</label>
                    <input
                      type="date"
                      value={formReposicion.fecha}
                      onChange={(e) =>
                        setFormReposicion({ ...formReposicion, fecha: e.target.value })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Almacén</label>
                    <select
                      value={formReposicion.almacen_id}
                      onChange={(e) =>
                        setFormReposicion({ ...formReposicion, almacen_id: e.target.value })
                      }
                      style={inputStyle}
                    >
                      <option value={1}>Almacén de Sevilla</option>
                      <option value={2}>Almacén de Medina</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Bolsas de caracoles</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formReposicion.bolsas_caracoles}
                      onChange={(e) =>
                        setFormReposicion({
                          ...formReposicion,
                          bolsas_caracoles: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Bolsas de cabrillas</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formReposicion.bolsas_cabrillas}
                      onChange={(e) =>
                        setFormReposicion({
                          ...formReposicion,
                          bolsas_cabrillas: e.target.value,
                        })
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setMostrarModalReposicion(false)}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "12px",
                      padding: "12px 16px",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      ...botonVerde,
                      background: "#1d4ed8",
                    }}
                  >
                    Guardar reposición
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}