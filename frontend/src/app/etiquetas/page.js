"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

export default function EtiquetasPage() {
  const [plantillas, setPlantillas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

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
      setCargando(true);
      setError("");

      const [plantillasRes, historialRes] = await Promise.all([
        api.get("/etiquetas/plantillas"),
        api.get("/etiquetas/historial"),
      ]);

      const plantillasData = Array.isArray(plantillasRes.data)
        ? plantillasRes.data
        : [];
      const historialData = Array.isArray(historialRes.data)
        ? historialRes.data
        : [];

      const activas = plantillasData.filter((p) => Number(p.activa) === 1);

      setPlantillas(activas);
      setHistorial(historialData);

      setFormImpresion((prev) => ({
        ...prev,
        plantilla_id:
          prev.plantilla_id || (activas.length > 0 ? String(activas[0].id) : ""),
      }));
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error || "Error al cargar el módulo de etiquetas"
      );
    } finally {
      setCargando(false);
    }
  }

  async function crearTrabajoImpresion(e) {
    e.preventDefault();

    try {
      setMensaje("");
      setError("");

      if (!formImpresion.plantilla_id) {
        setError("Debes seleccionar una plantilla");
        return;
      }

      if (!String(formImpresion.lote).trim()) {
        setError("Debes indicar el lote");
        return;
      }

      if (Number(formImpresion.cantidad) <= 0) {
        setError("La cantidad debe ser mayor que 0");
        return;
      }

      await api.post("/etiquetas/imprimir", {
        plantilla_id: Number(formImpresion.plantilla_id),
        lote: String(formImpresion.lote).trim(),
        cantidad: Number(formImpresion.cantidad),
      });

      const plantillaSeleccionadaActual = plantillas.find(
        (p) => String(p.id) === String(formImpresion.plantilla_id)
      );

      setMensaje(
        `Trabajo enviado correctamente${
          plantillaSeleccionadaActual ? ` (${plantillaSeleccionadaActual.nombre})` : ""
        }`
      );

      setFormImpresion((prev) => ({
        ...prev,
        lote: "",
        cantidad: 1,
      }));

      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.error ||
          "No se pudo enviar el trabajo de impresión"
      );
    }
  }

  const plantillaSeleccionada = useMemo(() => {
    return plantillas.find(
      (p) => String(p.id) === String(formImpresion.plantilla_id)
    );
  }, [plantillas, formImpresion.plantilla_id]);

  function formatearFecha(fecha) {
    if (!fecha) return "-";
    const f = new Date(fecha);
    if (Number.isNaN(f.getTime())) return fecha;
    return f.toLocaleString("es-ES");
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #edf7e8 0%, #f6fbf3 45%, #eef7ea 100%)",
    padding: "28px 20px 40px",
  };

  const containerStyle = {
    maxWidth: "1520px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #dcefd1",
    borderRadius: "24px",
    boxShadow: "0 10px 28px rgba(22, 101, 52, 0.06)",
  };

  const heroStyle = {
    ...cardStyle,
    padding: "30px",
    background: "linear-gradient(135deg, #ffffff 0%, #f7fcf4 55%, #eef8e9 100%)",
  };

  const sectionCardStyle = {
    ...cardStyle,
    padding: "24px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 700,
  };

  const inputStyle = {
    width: "100%",
    minHeight: "50px",
    padding: "14px 15px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    cursor: "pointer",
  };

  const sectionTitleStyle = {
    margin: 0,
    fontSize: "24px",
    fontWeight: 800,
    color: "#111827",
  };

  const sectionTextStyle = {
    margin: "8px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: 1.65,
  };

  const botonPrincipal = {
    border: "none",
    borderRadius: "14px",
    padding: "14px 20px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
    boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
  };

  const tableContainerStyle = {
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    background: "#ffffff",
  };

  const tableStyle = {
    width: "100%",
    minWidth: "980px",
    borderCollapse: "separate",
    borderSpacing: 0,
    tableLayout: "auto",
  };

  const thStyle = {
    textAlign: "left",
    padding: "15px 16px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#6b7280",
    background: "#f7fbf5",
    borderBottom: "1px solid #e5e7eb",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "15px 16px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.5,
  };

  const emptyCellStyle = {
    padding: "26px 18px",
    fontSize: "15px",
    color: "#6b7280",
    textAlign: "center",
  };

  const infoCardStyle = {
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    padding: "16px 18px",
    background: "#fafdfa",
  };

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <section style={heroStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: "860px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "14px",
                  border: "1px solid #bbf7d0",
                }}
              >
                Módulo · Etiquetas
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "36px",
                  lineHeight: 1.08,
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Impresión de etiquetas
              </h1>

              <p
                style={{
                  margin: "12px 0 0 0",
                  maxWidth: "820px",
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: "#6b7280",
                }}
              >
                Selecciona una plantilla .ezp ya registrada, indica el lote y la
                cantidad de etiquetas que deseas imprimir desde un entorno alineado
                con el resto de la aplicación.
              </p>
            </div>

            <div
              style={{
                padding: "14px 16px",
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                borderRadius: "16px",
                minWidth: "220px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#166534",
                  marginBottom: "4px",
                }}
              >
                Plantillas activas
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#166534",
                  lineHeight: 1,
                }}
              >
                {plantillas.length}
              </div>
            </div>
          </div>
        </section>

        {mensaje ? (
          <section
            style={{
              ...cardStyle,
              padding: "16px 18px",
              background: "#ecfdf5",
              borderColor: "#bbf7d0",
            }}
          >
            <div
              style={{
                color: "#166534",
                fontWeight: 800,
              }}
            >
              {mensaje}
            </div>
          </section>
        ) : null}

        {error ? (
          <section
            style={{
              ...cardStyle,
              padding: "16px 18px",
              background: "#fef2f2",
              borderColor: "#fecaca",
            }}
          >
            <div
              style={{
                color: "#b91c1c",
                fontWeight: 800,
              }}
            >
              {error}
            </div>
          </section>
        ) : null}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.02fr 1.18fr",
            gap: "22px",
            alignItems: "start",
          }}
        >
          <section style={sectionCardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "18px",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 style={sectionTitleStyle}>Nueva impresión</h2>
                <p style={sectionTextStyle}>
                  Elige plantilla, lote y cantidad para enviar el trabajo.
                </p>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "16px",
                  minWidth: "170px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#1d4ed8",
                    marginBottom: "4px",
                  }}
                >
                  Impresión actual
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#1d4ed8",
                    lineHeight: 1.2,
                  }}
                >
                  {Number(formImpresion.cantidad || 1)} etiqueta(s)
                </div>
              </div>
            </div>

            <form
              onSubmit={crearTrabajoImpresion}
              style={{
                display: "grid",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Etiqueta / plantilla</label>
                <select
                  style={selectStyle}
                  value={formImpresion.plantilla_id}
                  onChange={(e) =>
                    setFormImpresion({
                      ...formImpresion,
                      plantilla_id: e.target.value,
                    })
                  }
                >
                  <option value="">Selecciona una plantilla</option>
                  {plantillas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Lote</label>
                <input
                  style={inputStyle}
                  placeholder="Ej: LOTE-2404"
                  value={formImpresion.lote}
                  onChange={(e) =>
                    setFormImpresion({
                      ...formImpresion,
                      lote: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>Cantidad de etiquetas</label>
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
              </div>

              <div style={{ marginTop: "4px" }}>
                <button type="submit" style={botonPrincipal}>
                  Enviar trabajo a impresión
                </button>
              </div>
            </form>
          </section>

          <section style={sectionCardStyle}>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={sectionTitleStyle}>Datos de la plantilla seleccionada</h2>
              <p style={sectionTextStyle}>
                Información detallada de la plantilla activa seleccionada.
              </p>
            </div>

            {plantillaSeleccionada ? (
              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Nombre</div>
                  <div style={infoValueStyle}>
                    {plantillaSeleccionada.nombre || "-"}
                  </div>
                </div>

                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Tipo</div>
                  <div style={infoValueStyle}>
                    {plantillaSeleccionada.tipo_etiqueta || "-"}
                  </div>
                </div>

                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Archivo</div>
                  <div style={infoValueStyle}>
                    {plantillaSeleccionada.archivo_nombre || "-"}
                  </div>
                </div>

                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Campo variable</div>
                  <div style={infoValueStyle}>
                    {plantillaSeleccionada.campo_variable || "LOTE"}
                  </div>
                </div>

                <div style={infoCardStyle}>
                  <div style={infoLabelStyle}>Impresora</div>
                  <div style={infoValueStyle}>
                    {plantillaSeleccionada.impresora_nombre || "-"}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    padding: "14px 16px",
                    borderRadius: "16px",
                    background: "#f8fbf9",
                    border: "1px dashed #cfe1d4",
                    color: "#456b57",
                    fontSize: "14px",
                    lineHeight: 1.65,
                  }}
                >
                  Esta impresión sustituirá el valor del campo{" "}
                  <strong>
                    {plantillaSeleccionada.campo_variable || "LOTE"}
                  </strong>{" "}
                  por el lote que indiques y enviará{" "}
                  <strong>{formImpresion.cantidad || 1}</strong> etiqueta(s).
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "18px",
                  borderRadius: "16px",
                  border: "1px dashed #dcefd1",
                  color: "#6b7280",
                }}
              >
                Selecciona una plantilla para ver su información.
              </div>
            )}
          </section>
        </section>

        <section style={sectionCardStyle}>
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionTitleStyle}>Plantillas disponibles</h2>
            <p style={sectionTextStyle}>
              Listado de plantillas activas disponibles para imprimir.
            </p>
          </div>

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Campo variable</th>
                  <th style={thStyle}>Archivo</th>
                  <th style={thStyle}>Impresora</th>
                </tr>
              </thead>
              <tbody>
                {plantillas.length > 0 ? (
                  plantillas.map((p) => (
                    <tr key={p.id}>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>{p.nombre}</td>
                      <td style={tdStyle}>{p.tipo_etiqueta || "-"}</td>
                      <td style={tdStyle}>{p.campo_variable || "-"}</td>
                      <td style={tdStyle}>{p.archivo_nombre || "-"}</td>
                      <td style={tdStyle}>{p.impresora_nombre || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={emptyCellStyle} colSpan={5}>
                      {cargando
                        ? "Cargando plantillas..."
                        : "No hay plantillas activas registradas."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCardStyle}>
          <div style={{ marginBottom: "18px" }}>
            <h2 style={sectionTitleStyle}>Histórico de impresiones</h2>
            <p style={sectionTextStyle}>
              Consulta los trabajos enviados y su estado.
            </p>
          </div>

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
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
                      <td style={tdStyle}>{h.plantilla || "-"}</td>
                      <td style={{ ...tdStyle, fontWeight: 800 }}>{h.lote || "-"}</td>
                      <td style={tdStyle}>{h.cantidad ?? "-"}</td>
                      <td style={tdStyle}>{h.usuario_nombre || "-"}</td>
                      <td style={tdStyle}>{h.estado || "-"}</td>
                      <td style={tdStyle}>{h.mensaje_error || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td style={emptyCellStyle} colSpan={7}>
                      No hay impresiones registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

const infoLabelStyle = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: 700,
  marginBottom: "6px",
};

const infoValueStyle = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: 800,
  lineHeight: 1.45,
};