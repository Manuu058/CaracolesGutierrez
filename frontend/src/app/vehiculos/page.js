"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [proximos, setProximos] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    matricula: "",
    marca: "",
    modelo: "",
    matriculacion: "",
    conductor_habitual_id: "",
    kilometros_actuales: "",
    observaciones: "",
  });

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      setCargando(true);

      const [v, e, m, p] = await Promise.all([
        api.get("/vehiculos"),
        api.get("/empleados"),
        api.get("/mantenimientos"),
        api.get("/mantenimientos/proximos/listado"),
      ]);

      setVehiculos(Array.isArray(v.data) ? v.data : []);
      setEmpleados(Array.isArray(e.data) ? e.data : []);
      setMantenimientos(Array.isArray(m.data) ? m.data : []);
      setProximos(Array.isArray(p.data) ? p.data : []);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
      mostrarMensaje(
        error?.response?.data?.error || "Error al cargar los datos del módulo",
        true
      );
    } finally {
      setCargando(false);
    }
  }

  function mostrarMensaje(texto, error = false) {
    setMensaje(texto);
    setEsError(error);

    window.clearTimeout(window.__vehiculosMensajeTimeout);
    window.__vehiculosMensajeTimeout = window.setTimeout(() => {
      setMensaje("");
      setEsError(false);
    }, 3500);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setNuevoVehiculo((prev) => ({
      ...prev,
      [name]: name === "matricula" ? value.toUpperCase() : value,
    }));
  }

  function limpiarFormulario() {
    setNuevoVehiculo({
      matricula: "",
      marca: "",
      modelo: "",
      matriculacion: "",
      conductor_habitual_id: "",
      kilometros_actuales: "",
      observaciones: "",
    });
  }

  function validarFormulario() {
    const matricula = String(nuevoVehiculo.matricula || "").trim();
    const marca = String(nuevoVehiculo.marca || "").trim();
    const modelo = String(nuevoVehiculo.modelo || "").trim();
    const matriculacion = String(nuevoVehiculo.matriculacion || "").trim();
    const kilometros = Number(nuevoVehiculo.kilometros_actuales || 0);

    if (!matricula) {
      mostrarMensaje("La matrícula es obligatoria", true);
      return false;
    }

    if (!marca) {
      mostrarMensaje("La marca es obligatoria", true);
      return false;
    }

    if (!modelo) {
      mostrarMensaje("El modelo es obligatorio", true);
      return false;
    }

    if (!matriculacion) {
      mostrarMensaje("La fecha de matriculación es obligatoria", true);
      return false;
    }

    if (kilometros < 0) {
      mostrarMensaje("Los kilómetros no pueden ser negativos", true);
      return false;
    }

    return true;
  }

  async function crearVehiculo(e) {
    e.preventDefault();
    if (guardando) return;

    if (!validarFormulario()) return;

    try {
      setGuardando(true);
      setMensaje("");

      const payload = {
        matricula: String(nuevoVehiculo.matricula || "").trim().toUpperCase(),
        marca: String(nuevoVehiculo.marca || "").trim(),
        modelo: String(nuevoVehiculo.modelo || "").trim(),
        matriculacion: nuevoVehiculo.matriculacion,
        conductor_habitual_id: nuevoVehiculo.conductor_habitual_id
          ? Number(nuevoVehiculo.conductor_habitual_id)
          : null,
        kilometros_actuales: Number(nuevoVehiculo.kilometros_actuales || 0),
        observaciones: String(nuevoVehiculo.observaciones || "").trim() || null,
      };

      await api.post("/vehiculos", payload);

      limpiarFormulario();
      await cargarTodo();
      mostrarMensaje("Vehículo creado correctamente");
    } catch (error) {
      console.error("Error al crear vehículo:", error);
      mostrarMensaje(
        error?.response?.data?.error || "Error al crear vehículo",
        true
      );
    } finally {
      setGuardando(false);
    }
  }

  const proximosOrdenados = useMemo(() => {
    return [...proximos].sort((a, b) => {
      const fechaA = new Date(a.proxima_fecha || 0).getTime();
      const fechaB = new Date(b.proxima_fecha || 0).getTime();
      return fechaA - fechaB;
    });
  }, [proximos]);

  const mantenimientosOrdenados = useMemo(() => {
    return [...mantenimientos].sort((a, b) => {
      const fechaA = new Date(a.fecha || 0).getTime();
      const fechaB = new Date(b.fecha || 0).getTime();
      return fechaB - fechaA;
    });
  }, [mantenimientos]);

  const vehiculosOrdenados = useMemo(() => {
    return [...vehiculos].sort((a, b) =>
      String(a.matricula || "").localeCompare(String(b.matricula || ""))
    );
  }, [vehiculos]);

  const resumenKpis = [
    {
      titulo: "Vehículos",
      valor: vehiculos.length,
      fondo: "linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)",
      color: "#166534",
    },
    {
      titulo: "Empleados",
      valor: empleados.length,
      fondo: "linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%)",
      color: "#1d4ed8",
    },
    {
      titulo: "Avisos próximos",
      valor: proximos.length,
      fondo: "linear-gradient(180deg, #fff7ed 0%, #fffbf5 100%)",
      color: "#c2410c",
    },
    {
      titulo: "Mantenimientos",
      valor: mantenimientos.length,
      fondo: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
      color: "#111827",
    },
  ];

  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #edf7e8 0%, #f6fbf3 45%, #eef7ea 100%)",
    padding: "28px 20px 42px",
  };

  const containerStyle = {
    maxWidth: "1450px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #dcefd1",
    borderRadius: "24px",
    boxShadow: "0 10px 28px rgba(22, 101, 52, 0.06)",
  };

  const sectionCardStyle = {
    ...cardStyle,
    padding: "24px",
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
    padding: "14px 22px",
    fontSize: "15px",
    fontWeight: 800,
    color: "#fff",
    cursor: guardando ? "not-allowed" : "pointer",
    background: guardando
      ? "#6b7280"
      : "linear-gradient(135deg, #166534 0%, #15803d 100%)",
    boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
    opacity: guardando ? 0.85 : 1,
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
    minWidth: "760px",
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

  function badgeMatricula(valor) {
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
          whiteSpace: "nowrap",
        }}
      >
        {valor || "-"}
      </span>
    );
  }

  function badgeCoste(valor) {
    const numero = Number(valor || 0);
    return (
      <span
        style={{
          display: "inline-block",
          padding: "6px 10px",
          borderRadius: "10px",
          background: "#eff6ff",
          color: "#1d4ed8",
          fontWeight: 800,
          fontSize: "12px",
          whiteSpace: "nowrap",
        }}
      >
        {numero.toFixed(2)} €
      </span>
    );
  }

  function badgeEstadoMantenimiento(estado) {
    const valor = String(estado || "").toUpperCase();

    const estilo =
      valor === "VENCIDO"
        ? {
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          }
        : valor === "PROXIMO"
        ? {
            background: "#fff7ed",
            color: "#c2410c",
            border: "1px solid #fed7aa",
          }
        : {
            background: "#ecfdf5",
            color: "#166534",
            border: "1px solid #bbf7d0",
          };

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 12px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 800,
          whiteSpace: "nowrap",
          ...estilo,
        }}
      >
        {estado || "-"}
      </span>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <section
          style={{
            ...cardStyle,
            padding: "30px",
            marginBottom: "22px",
            background:
              "linear-gradient(135deg, #ffffff 0%, #f7fcf4 55%, #eef8e9 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: "820px" }}>
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
                Módulo de vehículos
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
                Gestión de flota y mantenimiento
              </h1>

              <p
                style={{
                  marginTop: "12px",
                  maxWidth: "760px",
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: "#6b7280",
                }}
              >
                Centraliza la información de la flota, da de alta nuevos vehículos
                y revisa rápidamente próximos avisos e historial de mantenimiento
                desde un panel más limpio y profesional.
              </p>
            </div>
          </div>
        </section>

        {mensaje ? (
          <section
            style={{
              ...cardStyle,
              padding: "16px 20px",
              marginBottom: "22px",
              background: esError ? "#fef2f2" : "#ecfdf5",
              border: esError ? "1px solid #fecaca" : "1px solid #bbf7d0",
              color: esError ? "#b91c1c" : "#166534",
              fontWeight: 700,
            }}
          >
            {mensaje}
          </section>
        ) : null}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {resumenKpis.map((item) => (
            <div
              key={item.titulo}
              style={{
                ...cardStyle,
                padding: "22px",
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
                  color: item.color,
                  lineHeight: 1.1,
                }}
              >
                {item.valor}
              </div>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(420px, 1.15fr) minmax(320px, 0.95fr)",
            gap: "22px",
            alignItems: "start",
            marginBottom: "22px",
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
                <h2 style={sectionTitleStyle}>Registrar nuevo vehículo</h2>
                <p style={sectionTextStyle}>
                  Añade los datos principales del vehículo y, si quieres, asígnalo
                  directamente a un conductor habitual.
                </p>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  background: "#ecfdf5",
                  border: "1px solid #bbf7d0",
                  borderRadius: "16px",
                  minWidth: "200px",
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
                  Flota actual
                </div>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#166534",
                    lineHeight: 1,
                  }}
                >
                  {vehiculos.length}
                </div>
              </div>
            </div>

            <form onSubmit={crearVehiculo}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Matrícula</label>
                  <input
                    name="matricula"
                    value={nuevoVehiculo.matricula}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="1234ABC"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Marca</label>
                  <input
                    name="marca"
                    value={nuevoVehiculo.marca}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Ford"
                    maxLength={80}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Modelo</label>
                  <input
                    name="modelo"
                    value={nuevoVehiculo.modelo}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Transit"
                    maxLength={120}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Fecha de matriculación</label>
                  <input
                    type="date"
                    name="matriculacion"
                    value={nuevoVehiculo.matriculacion}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Conductor habitual</label>
                  <select
                    name="conductor_habitual_id"
                    value={nuevoVehiculo.conductor_habitual_id}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="">Selecciona empleado</option>
                    {empleados.map((empleado) => (
                      <option key={empleado.id} value={empleado.id}>
                        {empleado.nombre} {empleado.apellidos || ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Kilómetros actuales</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="kilometros_actuales"
                    value={nuevoVehiculo.kilometros_actuales}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="0"
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={nuevoVehiculo.observaciones}
                    onChange={handleChange}
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder="Anotaciones del vehículo"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button type="submit" disabled={guardando} style={botonPrincipal}>
                  {guardando ? "Guardando..." : "Guardar vehículo"}
                </button>
              </div>
            </form>
          </section>

          <section style={sectionCardStyle}>
            <div style={{ marginBottom: "16px" }}>
              <h2 style={sectionTitleStyle}>Próximos mantenimientos</h2>
              <p style={sectionTextStyle}>
                Revisión rápida de vencimientos y avisos próximos de la flota.
              </p>
            </div>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: "22%" }}>Matrícula</th>
                    <th style={{ ...thStyle, width: "30%" }}>Tipo</th>
                    <th style={{ ...thStyle, width: "24%" }}>Próxima fecha</th>
                    <th style={{ ...thStyle, width: "24%" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {proximosOrdenados.length > 0 ? (
                    proximosOrdenados.map((row, index) => (
                      <tr key={index}>
                        <td style={tdStyle}>{badgeMatricula(row.matricula)}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>
                          {row.tipo_mantenimiento || "-"}
                        </td>
                        <td style={tdStyle}>{row.proxima_fecha || "-"}</td>
                        <td style={tdStyle}>{badgeEstadoMantenimiento(row.estado_fecha)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={emptyCellStyle}>
                        No hay mantenimientos próximos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <section
          style={{
            ...sectionCardStyle,
            marginBottom: "22px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h2 style={sectionTitleStyle}>Vehículos registrados</h2>
            <p style={sectionTextStyle}>
              Consulta rápida de la flota actual, conductor habitual y kilometraje.
            </p>
          </div>

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: "18%" }}>Matrícula</th>
                  <th style={{ ...thStyle, width: "18%" }}>Marca</th>
                  <th style={{ ...thStyle, width: "22%" }}>Modelo</th>
                  <th style={{ ...thStyle, width: "24%" }}>Conductor</th>
                  <th style={{ ...thStyle, width: "18%" }}>Kilómetros</th>
                </tr>
              </thead>
              <tbody>
                {vehiculosOrdenados.length > 0 ? (
                  vehiculosOrdenados.map((row, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>{badgeMatricula(row.matricula)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{row.marca || "-"}</td>
                      <td style={tdStyle}>{row.modelo || "-"}</td>
                      <td style={tdStyle}>{row.conductor_habitual || "-"}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, whiteSpace: "nowrap" }}>
                        {Number(row.kilometros_actuales || 0).toLocaleString("es-ES")} km
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={emptyCellStyle}>
                      No hay vehículos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={sectionCardStyle}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={sectionTitleStyle}>Historial de mantenimientos</h2>
            <p style={sectionTextStyle}>
              Seguimiento de mantenimientos realizados, responsables y costes.
            </p>
          </div>

          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: "18%" }}>Matrícula</th>
                  <th style={{ ...thStyle, width: "24%" }}>Tipo</th>
                  <th style={{ ...thStyle, width: "18%" }}>Fecha</th>
                  <th style={{ ...thStyle, width: "18%" }}>Coste</th>
                  <th style={{ ...thStyle, width: "22%" }}>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {mantenimientosOrdenados.length > 0 ? (
                  mantenimientosOrdenados.map((row, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>{badgeMatricula(row.matricula)}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        {row.tipo_mantenimiento || "-"}
                      </td>
                      <td style={tdStyle}>{row.fecha || "-"}</td>
                      <td style={tdStyle}>
                        {row.coste !== null && row.coste !== undefined
                          ? badgeCoste(row.coste)
                          : "-"}
                      </td>
                      <td style={tdStyle}>{row.responsable || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={emptyCellStyle}>
                      No hay mantenimientos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {cargando ? (
          <section
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "#6b7280",
              fontWeight: 700,
            }}
          >
            Cargando datos...
          </section>
        ) : null}
      </div>
    </main>
  );
}