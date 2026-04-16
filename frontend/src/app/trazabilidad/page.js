"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const PRODUCTOS = ["CARACOLES", "CABRILLAS", "AMBAS"];

export default function TrazabilidadPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [filtros, setFiltros] = useState({
    mes: "",
    proveedor_id: "",
    producto: "",
  });

  const [loteSeleccionado, setLoteSeleccionado] = useState("");
  const [detalleLote, setDetalleLote] = useState({
    lote: null,
    resumen: null,
    historial: [],
    clientes: [],
  });

  const [formMovimiento, setFormMovimiento] = useState({
    tipo_movimiento: "SALIDA",
    lote_id: "",
    proveedor_id: "",
    cliente_id: "",
    fecha: "",
    cantidad_caracoles: "",
    cantidad_cabrillas: "",
    numero_factura: "",
    descripcion: "",
  });

  const [busquedaLoteMovimiento, setBusquedaLoteMovimiento] = useState("");
  const [mostrarLotesMovimiento, setMostrarLotesMovimiento] = useState(false);
  const [loteSeleccionadoMovimiento, setLoteSeleccionadoMovimiento] = useState(null);

  const [busquedaLoteDetalle, setBusquedaLoteDetalle] = useState("");
  const [mostrarLotesDetalle, setMostrarLotesDetalle] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarLotes();
  }, [filtros.mes, filtros.proveedor_id, filtros.producto]);

  useEffect(() => {
    if (loteSeleccionado) {
      cargarDetalleLote(loteSeleccionado);
    } else {
      setDetalleLote({
        lote: null,
        resumen: null,
        historial: [],
        clientes: [],
      });
    }
  }, [loteSeleccionado]);

  async function cargarDatos() {
  try {
    const movRes = await api.get("/movimientos-lote");
    console.log("movimientos OK", movRes.data);

    const lotesRes = await api.get("/lotes");
    console.log("lotes OK", lotesRes.data);

    const clientesRes = await api.get("/clientes");
    console.log("clientes OK", clientesRes.data);

    const proveedoresRes = await api.get("/proveedores");
    console.log("proveedores OK", proveedoresRes.data);

    setMovimientos(movRes.data || []);
    setLotes(lotesRes.data || []);
    setClientes(clientesRes.data || []);
    setProveedores(proveedoresRes.data || []);
  } catch (error) {
    console.error("ERROR COMPLETO:", error);
    console.error("RESPUESTA BACKEND:", error?.response?.data);
    mostrarMensaje(
      error?.response?.data?.error || "Error al cargar trazabilidad",
      true
    );
  }
}

  async function cargarLotes() {
    try {
      const params = {};
      if (filtros.mes) params.mes = filtros.mes;
      if (filtros.proveedor_id) params.proveedor_id = filtros.proveedor_id;
      if (filtros.producto) params.producto = filtros.producto;

      const { data } = await api.get("/lotes", { params });
      setLotes(data || []);
    } catch (error) {
      console.error("Error al cargar lotes filtrados:", error);
      mostrarMensaje("Error al cargar lotes filtrados", true);
    }
  }

  async function cargarDetalleLote(loteId) {
    try {
      const { data } = await api.get(`/movimientos-lote/lote/${loteId}`);
      setDetalleLote({
        lote: data?.lote || null,
        resumen: data?.resumen || null,
        historial: data?.historial || [],
        clientes: data?.clientes || [],
      });
    } catch (error) {
      console.error("Error al cargar detalle del lote:", error);
      setDetalleLote({
        lote: null,
        resumen: null,
        historial: [],
        clientes: [],
      });
      mostrarMensaje("Error al cargar detalle del lote", true);
    }
  }

  function mostrarMensaje(texto, esError = false) {
    setMensaje(esError ? `Error: ${texto}` : texto);
    setTimeout(() => {
      setMensaje("");
    }, 3500);
  }

  function handleFiltrosChange(e) {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleMovimientoChange(e) {
    const { name, value } = e.target;

    setFormMovimiento((prev) => {
      const nuevo = {
        ...prev,
        [name]: value,
      };

      if (name === "tipo_movimiento") {
        if (value === "ENTRADA") {
          nuevo.cliente_id = "";
          nuevo.lote_id = "";
          setLoteSeleccionadoMovimiento(null);
          setBusquedaLoteMovimiento("");
        } else {
          nuevo.proveedor_id = "";
          nuevo.lote_id = "";
          setLoteSeleccionadoMovimiento(null);
          setBusquedaLoteMovimiento("");
        }
      }

      return nuevo;
    });
  }

  function normalizarTexto(valor) {
    return String(valor || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function renderLoteOption(lote) {
    return `${lote.codigo_lote || ""} - ${lote.mes || "-"} - ${lote.proveedor || "-"} - ${lote.producto || "-"}`;
  }

  function obtenerTextoLote(lote) {
    return `${lote.codigo_lote || ""} ${lote.mes || ""} ${lote.proveedor || ""} ${lote.producto || ""}`.trim();
  }

  function buscarCoincidenciaLote(texto) {
    const textoNormalizado = normalizarTexto(texto);

    if (!textoNormalizado) return null;

    const coincidencias = lotes.filter((lote) => {
      const codigo = normalizarTexto(lote.codigo_lote);
      const textoCompleto = normalizarTexto(obtenerTextoLote(lote));

      return (
        codigo === textoNormalizado ||
        codigo.includes(textoNormalizado) ||
        textoCompleto.includes(textoNormalizado)
      );
    });

    if (coincidencias.length >= 1) {
      return coincidencias[0];
    }

    return null;
  }

  async function crearMovimiento(e) {
    e.preventDefault();

    const esEntrada = formMovimiento.tipo_movimiento === "ENTRADA";

    if (esEntrada && !busquedaLoteMovimiento.trim()) {
      mostrarMensaje("Debes escribir un código de lote para la entrada", true);
      return;
    }

    if (!esEntrada && !loteSeleccionadoMovimiento?.id) {
      mostrarMensaje("Debes seleccionar un lote existente para la salida", true);
      return;
    }

    try {
      const payload = {
        ...formMovimiento,
        tipo_movimiento: String(formMovimiento.tipo_movimiento || "").toUpperCase(),
        fecha: formMovimiento.fecha || new Date().toISOString().slice(0, 10),
        lote_id: esEntrada ? null : Number(loteSeleccionadoMovimiento.id),
        codigo_lote: String(busquedaLoteMovimiento || "").trim(),
        proveedor_id:
          esEntrada && formMovimiento.proveedor_id
            ? Number(formMovimiento.proveedor_id)
            : null,
        cliente_id:
          !esEntrada && formMovimiento.cliente_id
            ? Number(formMovimiento.cliente_id)
            : null,
        cantidad_caracoles: Number(formMovimiento.cantidad_caracoles || 0),
        cantidad_cabrillas: Number(formMovimiento.cantidad_cabrillas || 0),
        numero_factura: formMovimiento.numero_factura || null,
        descripcion: formMovimiento.descripcion || null,
      };
      await api.post("/movimientos-lote", payload);

      setFormMovimiento({
        tipo_movimiento: "SALIDA",
        lote_id: "",
        proveedor_id: "",
        cliente_id: "",
        fecha: "",
        cantidad_caracoles: "",
        cantidad_cabrillas: "",
        numero_factura: "",
        descripcion: "",
      });

      setBusquedaLoteMovimiento("");
      setMostrarLotesMovimiento(false);
      setLoteSeleccionadoMovimiento(null);

      await cargarDatos();

      if (loteSeleccionado) {
        await cargarDetalleLote(loteSeleccionado);
      }

      mostrarMensaje("Movimiento registrado correctamente");
    } catch (error) {
      console.error("Error al crear movimiento:", error);

      const textoError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Error al crear movimiento";

      mostrarMensaje(textoError, true);
      alert(textoError);
    }
  }

  async function eliminarMovimiento(id) {
    const confirmar = window.confirm("¿Seguro que quieres eliminar este movimiento?");
    if (!confirmar) return;

    try {
      await api.delete(`/movimientos-lote/${id}`);
      await cargarDatos();

      if (loteSeleccionado) {
        await cargarDetalleLote(loteSeleccionado);
      }

      mostrarMensaje("Movimiento eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      mostrarMensaje(
        error.response?.data?.error || "Error al eliminar el movimiento",
        true
      );
    }
  }

  async function cargarImagenBase64(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function exportarPdfLote() {
    if (!detalleLote?.lote) {
      mostrarMensaje("Debes seleccionar un lote para exportar el PDF", true);
      return;
    }

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const logoBase64 = await cargarImagenBase64("/LogotipoEmpresaColor.png");
      const colorPrincipal = [22, 101, 52];
      const colorSecundario = [107, 114, 128];

      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 14, 10, 24, 24);
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...colorPrincipal);
      doc.text("Caracoles Gutiérrez S.L.", 42, 18);

      doc.setFontSize(11);
      doc.setTextColor(...colorSecundario);
      doc.text("Informe de trazabilidad del lote", 42, 25);

      doc.setDrawColor(...colorPrincipal);
      doc.setLineWidth(0.6);
      doc.line(14, 36, 196, 36);

      doc.setFontSize(15);
      doc.setTextColor(17, 24, 39);
      doc.text(`Lote: ${detalleLote.lote.codigo_lote || "-"}`, 14, 46);

      autoTable(doc, {
        startY: 52,
        theme: "grid",
        headStyles: {
          fillColor: colorPrincipal,
          textColor: 255,
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: 40,
        },
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        body: [
          ["Producto", detalleLote.lote.producto || "-"],
          ["Proveedor", detalleLote.lote.proveedor || "-"],
          ["Fecha de compra", detalleLote.lote.fecha_compra || "-"],
          ["Mes", detalleLote.lote.mes || "-"],
          ["Número de factura de compra", detalleLote.lote.factura_compra || "-"],
          ["Kilos comprados de caracoles", Number(detalleLote.lote.cantidad_caracoles || 0).toFixed(2)],
          ["Kilos comprados de cabrillas", Number(detalleLote.lote.cantidad_cabrillas || 0).toFixed(2)],
          ["Entradas caracoles", Number(detalleLote.resumen?.total_entradas_caracoles || 0).toFixed(2)],
          ["Entradas cabrillas", Number(detalleLote.resumen?.total_entradas_cabrillas || 0).toFixed(2)],
          ["Salidas caracoles", Number(detalleLote.resumen?.total_salidas_caracoles || 0).toFixed(2)],
          ["Salidas cabrillas", Number(detalleLote.resumen?.total_salidas_cabrillas || 0).toFixed(2)],
          ["Stock actual caracoles", Number(detalleLote.lote.stock_caracoles || 0).toFixed(2)],
          ["Stock actual cabrillas", Number(detalleLote.lote.stock_cabrillas || 0).toFixed(2)],
        ],
      });

      const startClientes = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.setTextColor(...colorPrincipal);
      doc.text("Salidas agrupadas por cliente", 14, startClientes);

      autoTable(doc, {
        startY: startClientes + 4,
        theme: "striped",
        head: [["Cliente", "Kg caracoles", "Kg cabrillas"]],
        body:
          detalleLote.clientes?.length > 0
            ? detalleLote.clientes.map((c) => [
                c.nombre || "-",
                Number(c.total_caracoles || 0).toFixed(2),
                Number(c.total_cabrillas || 0).toFixed(2),
              ])
            : [["Sin salidas registradas", "-", "-"]],
        headStyles: {
          fillColor: colorPrincipal,
          textColor: 255,
        },
        styles: {
          fontSize: 10,
        },
      });

      const startHistorial = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(13);
      doc.setTextColor(...colorPrincipal);
      doc.text("Historial completo del lote", 14, startHistorial);

      autoTable(doc, {
        startY: startHistorial + 4,
        theme: "grid",
        head: [[
          "Fecha",
          "Tipo",
          "Proveedor",
          "Cliente",
          "Factura",
          "Kg caracoles",
          "Kg cabrillas",
        ]],
        body:
          detalleLote.historial?.length > 0
            ? detalleLote.historial.map((h) => [
                h.fecha || "-",
                h.tipo_movimiento || "-",
                h.proveedor || "-",
                h.cliente || "-",
                h.numero_factura || "-",
                Number(h.cantidad_caracoles || 0).toFixed(2),
                Number(h.cantidad_cabrillas || 0).toFixed(2),
              ])
            : [["Sin historial", "-", "-", "-", "-", "-", "-"]],
        headStyles: {
          fillColor: colorPrincipal,
          textColor: 255,
        },
        styles: {
          fontSize: 9,
          cellPadding: 2.5,
        },
      });

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i += 1) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(
          `Caracoles Gutiérrez S.L. `,14, 289
        );
        doc.text(`Página ${i} de ${totalPages}`, 180, 289, { align: "right" });
      }

      doc.save(`trazabilidad-lote-${detalleLote.lote.codigo_lote || "sin-codigo"}.pdf`);
      mostrarMensaje("PDF del lote descargado correctamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      mostrarMensaje("No se pudo generar el PDF del lote", true);
    }
  }

  const movimientosOrdenados = useMemo(() => {
    return [...movimientos].sort((a, b) => {
      const fechaA = new Date(a.fecha || 0).getTime();
      const fechaB = new Date(b.fecha || 0).getTime();
      return fechaB - fechaA;
    });
  }, [movimientos]);

  const lotesFiltradosMovimiento = useMemo(() => {
    const texto = busquedaLoteMovimiento.trim().toLowerCase();

    if (!texto) return lotes.slice(0, 12);

    return lotes
      .filter((lote) =>
        `${lote.codigo_lote || ""} ${lote.mes || ""} ${lote.proveedor || ""} ${lote.producto || ""}`
          .toLowerCase()
          .includes(texto)
      )
      .slice(0, 12);
  }, [busquedaLoteMovimiento, lotes]);

  const lotesFiltradosDetalle = useMemo(() => {
    const texto = busquedaLoteDetalle.trim().toLowerCase();

    if (!texto) return lotes.slice(0, 12);

    return lotes
      .filter((lote) =>
        `${lote.codigo_lote || ""} ${lote.mes || ""} ${lote.proveedor || ""} ${lote.producto || ""}`
          .toLowerCase()
          .includes(texto)
      )
      .slice(0, 12);
  }, [busquedaLoteDetalle, lotes]);

  const pageStyle = {
    minHeight: "100vh",
    background: "#f5f7f6",
    padding: "28px 20px 40px",
  };

  const containerStyle = {
    maxWidth: "1500px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
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
    minWidth: "1000px",
  };

  const thStyle = {
    textAlign: "left",
    padding: "16px 16px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#111827",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "16px 16px",
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

  const dropdownStyle = {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
    maxHeight: "260px",
    overflowY: "auto",
    zIndex: 50,
  };

  function badgeTipo(tipo) {
    const valor = String(tipo || "").toUpperCase();
    const esEntrada = valor === "ENTRADA";

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "92px",
          padding: "8px 14px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 800,
          background: esEntrada ? "#ecfdf5" : "#eff6ff",
          color: esEntrada ? "#166534" : "#1d4ed8",
        }}
      >
        {valor || "-"}
      </span>
    );
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
            Módulo de trazabilidad
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
            Control completo de lotes, entradas, salidas y stock por lote
          </h1>

          <p
            style={{
              marginTop: "12px",
              maxWidth: "900px",
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#6b7280",
            }}
          >
            Gestiona lotes con mes y producto, registra entradas y salidas,
            consulta el stock actualizado de cada lote y revisa la trazabilidad
            completa por proveedor, cliente y movimientos.
          </p>
        </section>

        {mensaje ? (
          <section
            style={{
              ...cardStyle,
              padding: "16px 20px",
              marginBottom: "20px",
              background: mensaje.toLowerCase().includes("error")
                ? "#fef2f2"
                : "#ecfdf5",
              border: mensaje.toLowerCase().includes("error")
                ? "1px solid #fecaca"
                : "1px solid #bbf7d0",
              color: mensaje.toLowerCase().includes("error")
                ? "#b91c1c"
                : "#166534",
              fontWeight: 700,
            }}
          >
            {mensaje}
          </section>
        ) : null}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ ...cardStyle, padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "8px", fontSize: "24px", fontWeight: 800 }}>
              Registrar movimiento
            </h2>
            <p style={{ margin: "0 0 18px 0", color: "#6b7280", fontSize: "14px" }}>
              Registra entradas desde proveedor y salidas a cliente con actualización automática del stock del lote.
            </p>

            <form onSubmit={crearMovimiento}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Tipo de movimiento</label>
                  <select
                    name="tipo_movimiento"
                    value={formMovimiento.tipo_movimiento}
                    onChange={handleMovimientoChange}
                    style={inputStyle}
                  >
                    <option value="SALIDA">SALIDA</option>
                    <option value="ENTRADA">ENTRADA</option>
                  </select>
                </div>

                <div style={{ position: "relative" }}>
                  <label style={labelStyle}>
                    {formMovimiento.tipo_movimiento === "ENTRADA"
                      ? "Código de lote a crear o reutilizar"
                      : "Lote"}
                  </label>
                  <input
                    type="text"
                    value={busquedaLoteMovimiento}
                    onChange={(e) => {
                      const valor = e.target.value;
                      const esEntrada = formMovimiento.tipo_movimiento === "ENTRADA";

                      setBusquedaLoteMovimiento(valor);
                      setMostrarLotesMovimiento(true);

                      if (esEntrada) {
                        setFormMovimiento((prev) => ({
                          ...prev,
                          lote_id: "",
                        }));
                        setLoteSeleccionadoMovimiento(null);
                        return;
                      }

                      setFormMovimiento((prev) => ({
                        ...prev,
                        lote_id: "",
                      }));
                      setLoteSeleccionadoMovimiento(null);
                    }}
                    onFocus={() => setMostrarLotesMovimiento(true)}
                    onBlur={() => {
                      setTimeout(() => {
                        const esEntrada = formMovimiento.tipo_movimiento === "ENTRADA";

                        if (!esEntrada) {
                          if (loteSeleccionadoMovimiento?.id) {
                            setFormMovimiento((prev) => ({
                              ...prev,
                              lote_id: String(loteSeleccionadoMovimiento.id),
                            }));
                            setBusquedaLoteMovimiento(renderLoteOption(loteSeleccionadoMovimiento));
                          } else {
                            setFormMovimiento((prev) => ({
                              ...prev,
                              lote_id: "",
                            }));
                          }
                        }

                        setMostrarLotesMovimiento(false);
                      }, 150);
                    }}
                    placeholder={
                      formMovimiento.tipo_movimiento === "ENTRADA"
                        ? "Escribe el código del lote"
                        : "Escribe código, mes, proveedor o producto"
                    }
                    style={inputStyle}
                  />

                  {formMovimiento.tipo_movimiento === "SALIDA" && formMovimiento.lote_id ? (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#166534",
                      }}
                    >
                      Lote seleccionado correctamente
                    </div>
                  ) : null}

                  {mostrarLotesMovimiento &&
                  lotesFiltradosMovimiento.length > 0 &&
                  formMovimiento.tipo_movimiento === "SALIDA" ? (
                    <div style={dropdownStyle}>
                      {lotesFiltradosMovimiento.map((lote) => (
                        <div
                          key={lote.id}
                          onMouseDown={() => {
                            setFormMovimiento((prev) => ({
                              ...prev,
                              lote_id: String(lote.id),
                            }));
                            setLoteSeleccionadoMovimiento(lote);
                            setBusquedaLoteMovimiento(renderLoteOption(lote));
                            setMostrarLotesMovimiento(false);
                          }}
                          style={{
                            padding: "12px 14px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eef2f7",
                            fontSize: "14px",
                            color: "#111827",
                            background: "#ffffff",
                          }}
                        >
                          {renderLoteOption(lote)}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {formMovimiento.tipo_movimiento === "ENTRADA" ? (
                  <div>
                    <label style={labelStyle}>Proveedor</label>
                    <select
                      name="proveedor_id"
                      value={formMovimiento.proveedor_id}
                      onChange={handleMovimientoChange}
                      style={inputStyle}
                    >
                      <option value="">Selecciona proveedor</option>
                      {proveedores.map((proveedor) => (
                        <option key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>Cliente</label>
                    <select
                      name="cliente_id"
                      value={formMovimiento.cliente_id}
                      onChange={handleMovimientoChange}
                      style={inputStyle}
                    >
                      <option value="">Selecciona cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formMovimiento.fecha}
                    onChange={handleMovimientoChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Cantidad caracoles (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="cantidad_caracoles"
                    value={formMovimiento.cantidad_caracoles}
                    onChange={handleMovimientoChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Cantidad cabrillas (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="cantidad_cabrillas"
                    value={formMovimiento.cantidad_cabrillas}
                    onChange={handleMovimientoChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Número de factura</label>
                  <input
                    name="numero_factura"
                    value={formMovimiento.numero_factura}
                    onChange={handleMovimientoChange}
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formMovimiento.descripcion}
                    onChange={handleMovimientoChange}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
                <button
                  type="submit"
                  style={{
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 22px",
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "#fff",
                    cursor: "pointer",
                    background: "#166534",
                    boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
                  }}
                >
                  Guardar movimiento
                </button>
              </div>
            </form>
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111827" }}>
              Filtros de lotes
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            <div>
              <label style={labelStyle}>Mes</label>
              <select
                name="mes"
                value={filtros.mes}
                onChange={handleFiltrosChange}
                style={inputStyle}
              >
                <option value="">Todos</option>
                {MESES.map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Proveedor</label>
              <select
                name="proveedor_id"
                value={filtros.proveedor_id}
                onChange={handleFiltrosChange}
                style={inputStyle}
              >
                <option value="">Todos</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Producto</label>
              <select
                name="producto"
                value={filtros.producto}
                onChange={handleFiltrosChange}
                style={inputStyle}
              >
                <option value="">Todos</option>
                {PRODUCTOS.map((producto) => (
                  <option key={producto} value={producto}>
                    {producto}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111827" }}>
              Listado de lotes
            </h2>
          </div>

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Producto</th>
                  <th style={thStyle}>Proveedor</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Mes</th>
                  <th style={thStyle}>Factura compra</th>
                  <th style={thStyle}>Stock caracoles</th>
                  <th style={thStyle}>Stock cabrillas</th>
                </tr>
              </thead>
              <tbody>
                {lotes.length > 0 ? (
                  lotes.map((row) => (
                    <tr key={`${row.id}-${row.codigo_lote}-${row.fecha_compra}`}>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>{row.codigo_lote}</td>
                      <td style={tdStyle}>{row.producto || "-"}</td>
                      <td style={tdStyle}>{row.proveedor || "-"}</td>
                      <td style={tdStyle}>{row.fecha_compra || "-"}</td>
                      <td style={tdStyle}>{row.mes || "-"}</td>
                      <td style={tdStyle}>{row.factura_compra || "-"}</td>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>
                        {Number(row.stock_caracoles || 0).toFixed(2)}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>
                        {Number(row.stock_cabrillas || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={emptyCellStyle}>
                      No hay lotes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111827" }}>
              Historial general de movimientos
            </h2>
          </div>

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Lote</th>
                  <th style={thStyle}>Mes</th>
                  <th style={thStyle}>Producto</th>
                  <th style={thStyle}>Proveedor</th>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Factura</th>
                  <th style={thStyle}>Caracoles</th>
                  <th style={thStyle}>Cabrillas</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientosOrdenados.length > 0 ? (
                  movimientosOrdenados.map((row) => (
                    <tr key={`${row.id}-${row.codigo_lote}-${row.fecha}`}>
                      <td style={tdStyle}>{row.fecha || "-"}</td>
                      <td style={tdStyle}>{badgeTipo(row.tipo_movimiento)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{row.codigo_lote || "-"}</td>
                      <td style={tdStyle}>{row.mes || "-"}</td>
                      <td style={tdStyle}>{row.producto || "-"}</td>
                      <td style={tdStyle}>{row.proveedor || "-"}</td>
                      <td style={tdStyle}>{row.cliente || "-"}</td>
                      <td style={tdStyle}>{row.numero_factura || "-"}</td>
                      <td style={tdStyle}>{Number(row.cantidad_caracoles || 0).toFixed(2)}</td>
                      <td style={tdStyle}>{Number(row.cantidad_cabrillas || 0).toFixed(2)}</td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => eliminarMovimiento(row.id)}
                          style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 12px",
                            background: "#fef2f2",
                            color: "#b91c1c",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} style={emptyCellStyle}>
                      No hay movimientos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ ...cardStyle, padding: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#111827" }}>
              Detalle completo del lote
            </h2>
            <p style={{ margin: "8px 0 0 0", color: "#6b7280", fontSize: "14px" }}>
              Escribe para buscar un lote y ver proveedor, cantidades, stock, historial y clientes que han recibido mercancía.
            </p>
          </div>

          <div style={{ marginBottom: "18px", maxWidth: "520px", position: "relative" }}>
            <label style={labelStyle}>Buscar lote</label>
            <input
              type="text"
              value={busquedaLoteDetalle}
              onChange={(e) => {
                setBusquedaLoteDetalle(e.target.value);
                setMostrarLotesDetalle(true);
                setLoteSeleccionado("");
              }}
              onFocus={() => setMostrarLotesDetalle(true)}
              onBlur={() => {
                setTimeout(() => {
                  const loteCoincidente = buscarCoincidenciaLote(busquedaLoteDetalle);

                  if (loteCoincidente) {
                    setLoteSeleccionado(String(loteCoincidente.id));
                    setBusquedaLoteDetalle(renderLoteOption(loteCoincidente));
                  }

                  setMostrarLotesDetalle(false);
                }, 150);
              }}
              placeholder="Escribe código, mes, proveedor o producto"
              style={inputStyle}
            />

            {loteSeleccionado ? (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#166534",
                }}
              >
                Lote seleccionado correctamente
              </div>
            ) : null}

            {mostrarLotesDetalle && lotesFiltradosDetalle.length > 0 ? (
              <div style={dropdownStyle}>
                {lotesFiltradosDetalle.map((lote) => (
                  <div
                    key={lote.id}
                    onMouseDown={() => {
                      setLoteSeleccionado(String(lote.id));
                      setBusquedaLoteDetalle(renderLoteOption(lote));
                      setMostrarLotesDetalle(false);
                    }}
                    style={{
                      padding: "12px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eef2f7",
                      fontSize: "14px",
                      color: "#111827",
                      background: "#ffffff",
                    }}
                  >
                    {renderLoteOption(lote)}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "18px" }}>
            <button
              type="button"
              onClick={exportarPdfLote}
              style={{
                border: "none",
                borderRadius: "14px",
                padding: "14px 22px",
                fontSize: "15px",
                fontWeight: 800,
                color: "#fff",
                cursor: "pointer",
                background: "#166534",
                boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
              }}
            >
              Descargar PDF del lote
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "18px",
            }}
          >
            {[
              ["Lote", detalleLote.lote?.codigo_lote || "-"],
              ["Producto", detalleLote.lote?.producto || "-"],
              ["Proveedor", detalleLote.lote?.proveedor || "-"],
              ["Fecha compra", detalleLote.lote?.fecha_compra || "-"],
              ["Mes", detalleLote.lote?.mes || "-"],
              ["Factura compra", detalleLote.lote?.factura_compra || "-"],
              ["Inicial caracoles", Number(detalleLote.lote?.cantidad_caracoles || 0).toFixed(2)],
              ["Inicial cabrillas", Number(detalleLote.lote?.cantidad_cabrillas || 0).toFixed(2)],
              ["Entradas caracoles", Number(detalleLote.resumen?.total_entradas_caracoles || 0).toFixed(2)],
              ["Entradas cabrillas", Number(detalleLote.resumen?.total_entradas_cabrillas || 0).toFixed(2)],
              ["Salidas caracoles", Number(detalleLote.resumen?.total_salidas_caracoles || 0).toFixed(2)],
              ["Salidas cabrillas", Number(detalleLote.resumen?.total_salidas_cabrillas || 0).toFixed(2)],
              ["Stock caracoles", Number(detalleLote.lote?.stock_caracoles || 0).toFixed(2)],
              ["Stock cabrillas", Number(detalleLote.lote?.stock_cabrillas || 0).toFixed(2)],
            ].map(([titulo, valor]) => (
              <div
                key={titulo}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  padding: "18px",
                  background: "#f9fafb",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  {titulo}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {valor}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: 800, color: "#111827" }}>
              Cantidades vendidas por cliente
            </h3>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Cliente</th>
                    <th style={thStyle}>Total caracoles</th>
                    <th style={thStyle}>Total cabrillas</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleLote.clientes?.length > 0 ? (
                    detalleLote.clientes.map((row) => (
                      <tr key={row.id}>
                        <td style={tdStyle}>{row.nombre}</td>
                        <td style={tdStyle}>{Number(row.total_caracoles || 0).toFixed(2)}</td>
                        <td style={tdStyle}>{Number(row.total_cabrillas || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={emptyCellStyle}>
                        No hay salidas agrupadas por cliente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "18px", fontWeight: 800, color: "#111827" }}>
              Historial del lote
            </h3>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Fecha</th>
                    <th style={thStyle}>Tipo</th>
                    <th style={thStyle}>Proveedor</th>
                    <th style={thStyle}>Cliente</th>
                    <th style={thStyle}>Factura</th>
                    <th style={thStyle}>Caracoles</th>
                    <th style={thStyle}>Cabrillas</th>
                    <th style={thStyle}>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleLote.historial?.length > 0 ? (
                    detalleLote.historial.map((row) => (
                      <tr key={row.id}>
                        <td style={tdStyle}>{row.fecha || "-"}</td>
                        <td style={tdStyle}>{badgeTipo(row.tipo_movimiento)}</td>
                        <td style={tdStyle}>{row.proveedor || "-"}</td>
                        <td style={tdStyle}>{row.cliente || "-"}</td>
                        <td style={tdStyle}>{row.numero_factura || "-"}</td>
                        <td style={tdStyle}>{Number(row.cantidad_caracoles || 0).toFixed(2)}</td>
                        <td style={tdStyle}>{Number(row.cantidad_cabrillas || 0).toFixed(2)}</td>
                        <td style={tdStyle}>{row.descripcion || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={emptyCellStyle}>
                        No hay historial para este lote
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}