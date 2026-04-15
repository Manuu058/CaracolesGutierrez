"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import SimpleTable from "../../components/SimpleTable";

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

  const pageStyle = {
    minHeight: "100vh",
    background: "#f5f7f6",
    padding: "28px 20px 40px",
  };

  const containerStyle = {
    maxWidth: "1400px",
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

  const tableWrapperStyle = {
    background: "#ffffff",
    border: "1px solid #eef2f7",
    borderRadius: "16px",
    padding: "8px",
    overflowX: "auto",
  };

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
              justifyContent: "space-between",
              alignItems: "flex-start",
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
                Módulo de vehículos
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
                Gestión de flota y mantenimiento
              </h1>

              <p
                style={{
                  marginTop: "12px",
                  maxWidth: "760px",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#6b7280",
                }}
              >
                Centraliza la información de la flota, registra nuevos vehículos
                y revisa rápidamente los próximos mantenimientos y el historial
                de actuaciones.
              </p>
            </div>
          </div>
        </section>

        {mensaje ? (
          <section
            style={{
              ...cardStyle,
              padding: "16px 20px",
              marginBottom: "20px",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          {[
            { titulo: "Vehículos", valor: vehiculos.length },
            { titulo: "Empleados", valor: empleados.length },
            { titulo: "Avisos próximos", valor: proximos.length },
            { titulo: "Mantenimientos", valor: mantenimientos.length },
          ].map((item) => (
            <div
              key={item.titulo}
              style={{
                ...cardStyle,
                padding: "20px",
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
            display: "grid",
            gridTemplateColumns: "minmax(360px, 1.1fr) minmax(320px, 1fr)",
            gap: "18px",
            alignItems: "start",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              ...cardStyle,
              padding: "24px",
            }}
          >
            <div style={{ marginBottom: "18px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Registrar nuevo vehículo
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Añade los datos principales del vehículo y asígnalo a un
                conductor.
              </p>
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
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder="Anotaciones del vehículo"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "18px",
                }}
              >
                <button
                  type="submit"
                  disabled={guardando}
                  style={{
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px 22px",
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "#fff",
                    cursor: guardando ? "not-allowed" : "pointer",
                    background: guardando ? "#6b7280" : "#166534",
                    boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
                    opacity: guardando ? 0.8 : 1,
                  }}
                >
                  {guardando ? "Guardando..." : "Guardar vehículo"}
                </button>
              </div>
            </form>
          </div>

          <div
            style={{
              ...cardStyle,
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Próximos mantenimientos
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Revisión rápida del estado de cada mantenimiento.
              </p>
            </div>

            <div style={tableWrapperStyle}>
              <SimpleTable
                columns={[
                  { key: "matricula", label: "Matrícula" },
                  { key: "tipo_mantenimiento", label: "Tipo" },
                  { key: "proxima_fecha", label: "Próxima fecha" },
                  {
                    key: "estado_fecha",
                    label: "Estado",
                    render: (row) => {
                      const estilo =
                        row.estado_fecha === "VENCIDO"
                          ? {
                              background: "#fef2f2",
                              color: "#b91c1c",
                            }
                          : row.estado_fecha === "PROXIMO"
                          ? {
                              background: "#fff7ed",
                              color: "#c2410c",
                            }
                          : {
                              background: "#ecfdf5",
                              color: "#166534",
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
                            ...estilo,
                          }}
                        >
                          {row.estado_fecha || "-"}
                        </span>
                      );
                    },
                  },
                ]}
                data={proximosOrdenados}
              />
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
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Vehículos registrados
            </h2>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Consulta rápida de la flota actual.
            </p>
          </div>

          <div style={tableWrapperStyle}>
            <SimpleTable
              columns={[
                { key: "matricula", label: "Matrícula" },
                { key: "marca", label: "Marca" },
                { key: "modelo", label: "Modelo" },
                { key: "conductor_habitual", label: "Conductor" },
                {
                  key: "kilometros_actuales",
                  label: "Kilómetros",
                  render: (row) =>
                    Number(row.kilometros_actuales || 0).toLocaleString("es-ES"),
                },
              ]}
              data={vehiculosOrdenados}
            />
          </div>
        </section>

        <section
          style={{
            ...cardStyle,
            padding: "20px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              Historial de mantenimientos
            </h2>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Seguimiento de mantenimientos realizados, responsables y costes.
            </p>
          </div>

          <div style={tableWrapperStyle}>
            <SimpleTable
              columns={[
                { key: "matricula", label: "Matrícula" },
                { key: "tipo_mantenimiento", label: "Tipo" },
                { key: "fecha", label: "Fecha" },
                {
                  key: "coste",
                  label: "Coste",
                  render: (row) =>
                    row.coste !== null && row.coste !== undefined
                      ? `${Number(row.coste).toFixed(2)} €`
                      : "-",
                },
                { key: "responsable", label: "Responsable" },
              ]}
              data={mantenimientosOrdenados}
            />
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