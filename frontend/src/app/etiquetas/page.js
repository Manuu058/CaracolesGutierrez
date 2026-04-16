"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

const colores = {
  fondo: "#f4f8f5",
  tarjeta: "#ffffff",
  borde: "#d8e7dc",
  principal: "#1f5f3b",
  principalHover: "#17482d",
  secundario: "#456b57",
  texto: "#1f2937",
  textoSuave: "#6b7280",
  exito: "#e8f5ec",
  exitoTexto: "#1f5f3b",
  error: "#fdecec",
  errorTexto: "#b42318",
};

export default function EtiquetasPage() {
  const [plantillas, setPlantillas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [formPlantilla, setFormPlantilla] = useState({
    nombre: "",
    descripcion: "",
    tipo_etiqueta: "",
    campo_variable: "LOTE",
    archivo: null,
  });

  const [formImpresion, setFormImpresion] = useState({
    plantilla_id: "",
    lote: "",
    cantidad: 1,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      setError("");
      const [plantillasRes, historialRes] = await Promise.all([
        api.get("/etiquetas/plantillas"),
        api.get("/etiquetas/historial"),
      ]);

      setPlantillas(Array.isArray(plantillasRes.data) ? plantillasRes.data : []);
      setHistorial(Array.isArray(historialRes.data) ? historialRes.data : []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "Error al cargar el módulo de etiquetas");
    }
  }

  async function crearPlantilla(e) {
    e.preventDefault();

    try {
      setMensaje("");
      setError("");

      const formData = new FormData();
      formData.append("nombre", formPlantilla.nombre);
      formData.append("descripcion", formPlantilla.descripcion);
      formData.append("tipo_etiqueta", formPlantilla.tipo_etiqueta);
      formData.append("campo_variable", formPlantilla.campo_variable);
      formData.append("archivo", formPlantilla.archivo);

      await api.post("/etiquetas/plantillas", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMensaje("Plantilla creada correctamente");

      setFormPlantilla({
        nombre: "",
        descripcion: "",
        tipo_etiqueta: "",
        campo_variable: "LOTE",
        archivo: null,
      });

      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "No se pudo crear la plantilla");
    }
  }

  async function crearTrabajoImpresion(e) {
    e.preventDefault();

    try {
      setMensaje("");
      setError("");

      await api.post("/etiquetas/imprimir", {
        plantilla_id: formImpresion.plantilla_id,
        lote: formImpresion.lote,
        cantidad: Number(formImpresion.cantidad),
      });

      setMensaje("Trabajo de impresión enviado correctamente");

      setFormImpresion({
        plantilla_id: "",
        lote: "",
        cantidad: 1,
      });

      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || "No se pudo enviar el trabajo de impresión");
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return "-";
    const f = new Date(fecha);
    if (Number.isNaN(f.getTime())) return fecha;
    return f.toLocaleString("es-ES");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colores.fondo,
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "1450px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: colores.tarjeta,
            border: `1px solid ${colores.borde}`,
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 10px 30px rgba(31,95,59,0.06)",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: colores.principal,
              fontSize: "34px",
              fontWeight: 900,
            }}
          >
            Módulo de Etiquetas
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: colores.textoSuave,
              fontSize: "15px",
            }}
          >
            Gestión de plantillas reales .ezp, envío de trabajos de impresión y control histórico.
          </p>
        </div>

        {mensaje ? (
          <div
            style={{
              background: colores.exito,
              color: colores.exitoTexto,
              border: "1px solid #cce7d4",
              borderRadius: "16px",
              padding: "14px 16px",
              fontWeight: 700,
            }}
          >
            {mensaje}
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              background: colores.error,
              color: colores.errorTexto,
              border: "1px solid #f7c6c6",
              borderRadius: "16px",
              padding: "14px 16px",
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: colores.tarjeta,
              border: `1px solid ${colores.borde}`,
              borderRadius: "24px",
              padding: "22px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: colores.principal,
                fontSize: "22px",
                fontWeight: 800,
              }}
            >
              Nueva plantilla
            </h2>

            <form
              onSubmit={crearPlantilla}
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              <input
                style={inputStyle}
                placeholder="Nombre de la plantilla"
                value={formPlantilla.nombre}
                onChange={(e) =>
                  setFormPlantilla({ ...formPlantilla, nombre: e.target.value })
                }
              />

              <input
                style={inputStyle}
                placeholder="Descripción"
                value={formPlantilla.descripcion}
                onChange={(e) =>
                  setFormPlantilla({ ...formPlantilla, descripcion: e.target.value })
                }
              />

              <input
                style={inputStyle}
                placeholder="Tipo de etiqueta"
                value={formPlantilla.tipo_etiqueta}
                onChange={(e) =>
                  setFormPlantilla({ ...formPlantilla, tipo_etiqueta: e.target.value })
                }
              />

              <input
                style={inputStyle}
                placeholder="Campo variable (por ejemplo LOTE)"
                value={formPlantilla.campo_variable}
                onChange={(e) =>
                  setFormPlantilla({ ...formPlantilla, campo_variable: e.target.value })
                }
              />

              <input
                style={inputStyle}
                type="file"
                accept=".ezp"
                onChange={(e) =>
                  setFormPlantilla({ ...formPlantilla, archivo: e.target.files?.[0] || null })
                }
              />

              <button type="submit" style={primaryButtonStyle}>
                Guardar plantilla
              </button>
            </form>
          </div>

          <div
            style={{
              background: colores.tarjeta,
              border: `1px solid ${colores.borde}`,
              borderRadius: "24px",
              padding: "22px",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: colores.principal,
                fontSize: "22px",
                fontWeight: 800,
              }}
            >
              Nueva impresión
            </h2>

            <form
              onSubmit={crearTrabajoImpresion}
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              <select
                style={inputStyle}
                value={formImpresion.plantilla_id}
                onChange={(e) =>
                  setFormImpresion({
                    ...formImpresion,
                    plantilla_id: e.target.value,
                  })
                }
              >
                <option value="">Selecciona una plantilla</option>
                {plantillas
                  .filter((p) => Number(p.activa) === 1)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
              </select>

              <input
                style={inputStyle}
                placeholder="Lote"
                value={formImpresion.lote}
                onChange={(e) =>
                  setFormImpresion({
                    ...formImpresion,
                    lote: e.target.value,
                  })
                }
              />

              <input
                style={inputStyle}
                type="number"
                min="1"
                placeholder="Cantidad"
                value={formImpresion.cantidad}
                onChange={(e) =>
                  setFormImpresion({
                    ...formImpresion,
                    cantidad: e.target.value,
                  })
                }
              />

              <button type="submit" style={primaryButtonStyle}>
                Enviar trabajo a impresión
              </button>
            </form>
          </div>
        </div>

        <div
          style={{
            background: colores.tarjeta,
            border: `1px solid ${colores.borde}`,
            borderRadius: "24px",
            padding: "22px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: colores.principal,
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            Plantillas registradas
          </h2>

          <div style={{ overflowX: "auto", borderRadius: "16px", border: `1px solid ${colores.borde}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Campo variable</th>
                  <th style={thStyle}>Archivo</th>
                  <th style={thStyle}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {plantillas.length > 0 ? (
                  plantillas.map((p) => (
                    <tr key={p.id}>
                      <td style={tdStyle}>{p.nombre}</td>
                      <td style={tdStyle}>{p.tipo_etiqueta || "-"}</td>
                      <td style={tdStyle}>{p.campo_variable || "-"}</td>
                      <td style={tdStyle}>{p.archivo_nombre || "-"}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: 800,
                            background: Number(p.activa) === 1 ? "#e8f5ec" : "#f3f4f6",
                            color: Number(p.activa) === 1 ? "#1f5f3b" : "#4b5563",
                          }}
                        >
                          {Number(p.activa) === 1 ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={tdStyle} colSpan={5}>
                      No hay plantillas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            background: colores.tarjeta,
            border: `1px solid ${colores.borde}`,
            borderRadius: "24px",
            padding: "22px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: colores.principal,
              fontSize: "22px",
              fontWeight: 800,
            }}
          >
            Histórico de impresiones
          </h2>

          <div style={{ overflowX: "auto", borderRadius: "16px", border: `1px solid ${colores.borde}` }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Plantilla</th>
                  <th style={thStyle}>Lote</th>
                  <th style={thStyle}>Cantidad</th>
                  <th style={thStyle}>Usuario</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Error</th>
                </tr>
              </thead>
              <tbody>
                {historial.length > 0 ? (
                  historial.map((h) => (
                    <tr key={h.id}>
                      <td style={tdStyle}>{formatearFecha(h.fecha_impresion)}</td>
                      <td style={tdStyle}>{h.plantilla}</td>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>{h.lote}</td>
                      <td style={tdStyle}>{h.cantidad}</td>
                      <td style={tdStyle}>{h.usuario_nombre || "-"}</td>
                      <td style={tdStyle}>{h.estado}</td>
                      <td style={tdStyle}>{h.mensaje_error || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={tdStyle} colSpan={7}>
                      No hay impresiones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #d8e7dc",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "14px",
  outline: "none",
  background: "#fff",
  color: "#1f2937",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: "14px",
  padding: "12px 18px",
  background: "#1f5f3b",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 800,
  cursor: "pointer",
};

const thStyle = {
  background: "#f1f6f2",
  color: "#1f5f3b",
  fontWeight: 800,
  fontSize: "13px",
  textAlign: "left",
  padding: "14px",
  borderBottom: "1px solid #d8e7dc",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #edf2ee",
  color: "#1f2937",
  fontSize: "14px",
  verticalAlign: "top",
};