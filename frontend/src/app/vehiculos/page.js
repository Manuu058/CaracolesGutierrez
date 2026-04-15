"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import SimpleTable from "../../components/SimpleTable";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [proximos, setProximos] = useState([]);
  const [mensaje, setMensaje] = useState("");

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
      const [v, e, m, p] = await Promise.all([
        api.get("/vehiculos"),
        api.get("/empleados"),
        api.get("/mantenimientos"),
        api.get("/mantenimientos/proximos/listado"),
      ]);

      setVehiculos(v.data || []);
      setEmpleados(e.data || []);
      setMantenimientos(m.data || []);
      setProximos(p.data || []);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  }

  const handleChange = (e) => {
    setNuevoVehiculo({
      ...nuevoVehiculo,
      [e.target.name]: e.target.value,
    });
  };

  const crearVehiculo = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await api.post("/vehiculos", {
        ...nuevoVehiculo,
        conductor_habitual_id: nuevoVehiculo.conductor_habitual_id || null,
        kilometros_actuales: Number(nuevoVehiculo.kilometros_actuales || 0),
      });

      setNuevoVehiculo({
        matricula: "",
        marca: "",
        modelo: "",
        matriculacion: "",
        conductor_habitual_id: "",
        kilometros_actuales: "",
        observaciones: "",
      });

      setMensaje("Vehículo creado correctamente");
      cargarTodo();
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.error || "Error al crear vehículo");
    }
  };

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

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* CABECERA */}
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

        {/* KPIS */}
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
          ].map((item, i) => (
            <div
              key={i}
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

        {/* FORM + PRÓXIMOS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
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
                Añade los datos principales del vehículo y asígnalo a un conductor.
              </p>
            </div>

            {mensaje ? (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: mensaje.toLowerCase().includes("error")
                    ? "#fef2f2"
                    : "#ecfdf5",
                  color: mensaje.toLowerCase().includes("error")
                    ? "#b91c1c"
                    : "#166534",
                  border: mensaje.toLowerCase().includes("error")
                    ? "1px solid #fecaca"
                    : "1px solid #bbf7d0",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {mensaje}
              </div>
            ) : null}

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
                  />
                </div>

                <div>
                  <label style={labelStyle}>Marca</label>
                  <input
                    name="marca"
                    value={nuevoVehiculo.marca}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Modelo</label>
                  <input
                    name="modelo"
                    value={nuevoVehiculo.modelo}
                    onChange={handleChange}
                    style={inputStyle}
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
                    name="kilometros_actuales"
                    value={nuevoVehiculo.kilometros_actuales}
                    onChange={handleChange}
                    style={inputStyle}
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
                  Guardar vehículo
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

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #eef2f7",
                borderRadius: "16px",
                padding: "8px",
              }}
            >
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
                          {row.estado_fecha}
                        </span>
                      );
                    },
                  },
                ]}
                data={proximos}
              />
            </div>
          </div>
        </section>

        {/* VEHÍCULOS */}
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

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #eef2f7",
              borderRadius: "16px",
              padding: "8px",
            }}
          >
            <SimpleTable
              columns={[
                { key: "matricula", label: "Matrícula" },
                { key: "marca", label: "Marca" },
                { key: "modelo", label: "Modelo" },
                { key: "conductor_habitual", label: "Conductor" },
                { key: "kilometros_actuales", label: "Kilómetros" },
              ]}
              data={vehiculos}
            />
          </div>
        </section>

        {/* HISTORIAL */}
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

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #eef2f7",
              borderRadius: "16px",
              padding: "8px",
            }}
          >
            <SimpleTable
              columns={[
                { key: "matricula", label: "Matrícula" },
                { key: "tipo_mantenimiento", label: "Tipo" },
                { key: "fecha", label: "Fecha" },
                { key: "coste", label: "Coste" },
                { key: "responsable", label: "Responsable" },
              ]}
              data={mantenimientos}
            />
          </div>
        </section>
      </div>
    </main>
  );
}