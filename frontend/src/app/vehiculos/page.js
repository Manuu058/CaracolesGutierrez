"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import SectionCard from "../../components/SectionCard";
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

  const cardGlass = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(21, 128, 61, 0.18)",
    background: "#f8fff9",
    color: "#16351f",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    color: "#1f4d2c",
    fontSize: "14px",
    fontWeight: 700,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eefbf0 0%, #e3f5e7 20%, #d4edd8 45%, #c6e7cb 100%)",
        padding: "32px 20px 40px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* HERO */}
        <section
          style={{
            ...cardGlass,
            position: "relative",
            overflow: "hidden",
            padding: "34px 30px",
            marginBottom: "26px",
            background:
              "linear-gradient(135deg, rgba(10,44,24,0.95) 0%, rgba(18,84,46,0.95) 45%, rgba(36,122,68,0.92) 100%)",
            color: "#fff",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-45px",
              right: "-35px",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "-40px",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "18px",
              }}
            >
              🚚 Gestión profesional de flota
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "40px",
                lineHeight: 1.08,
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              Módulo de Vehículos
            </h1>

            <p
              style={{
                marginTop: "14px",
                maxWidth: "900px",
                fontSize: "16px",
                lineHeight: 1.7,
                color: "rgba(240,255,244,0.92)",
              }}
            >
              Gestiona vehículos, conductores, mantenimientos, fechas clave y
              próximos avisos desde una vista más visual, moderna y clara. Todo
              el historial queda centralizado para un mejor control operativo.
            </p>
          </div>
        </section>

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "26px",
          }}
        >
          {[
            { titulo: "Vehículos", valor: vehiculos.length, icono: "🚐" },
            { titulo: "Empleados", valor: empleados.length, icono: "👨‍🔧" },
            { titulo: "Avisos próximos", valor: proximos.length, icono: "⏰" },
            {
              titulo: "Mantenimientos",
              valor: mantenimientos.length,
              icono: "🛠️",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                ...cardGlass,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(240,250,242,0.96) 100%)",
                padding: "22px 22px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "14px",
                  background:
                    "linear-gradient(135deg, #d8f3dc 0%, #b7e4c7 100%)",
                }}
              >
                {item.icono}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#3b6b47",
                  marginBottom: "6px",
                }}
              >
                {item.titulo}
              </div>

              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 800,
                  color: "#123b20",
                  lineHeight: 1,
                }}
              >
                {item.valor}
              </div>
            </div>
          ))}
        </div>

        {/* FORM + PRÓXIMOS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "22px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              ...cardGlass,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(244,252,245,0.98) 100%)",
              padding: "26px",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "12px",
                }}
              >
                Alta de vehículo
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#123b20",
                  letterSpacing: "-0.5px",
                }}
              >
                Registrar nuevo vehículo
              </h2>

              <p
                style={{
                  marginTop: "10px",
                  color: "#4e6f58",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Añade nuevos vehículos a la flota con sus datos principales,
                conductor habitual y kilometraje actual.
              </p>
            </div>

            {mensaje ? (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background:
                    mensaje.toLowerCase().includes("error")
                      ? "rgba(220, 38, 38, 0.10)"
                      : "rgba(22, 163, 74, 0.10)",
                  color:
                    mensaje.toLowerCase().includes("error")
                      ? "#991b1b"
                      : "#166534",
                  border:
                    mensaje.toLowerCase().includes("error")
                      ? "1px solid rgba(220,38,38,0.18)"
                      : "1px solid rgba(22,163,74,0.18)",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {mensaje}
              </div>
            ) : null}

            <form onSubmit={crearVehiculo}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Matrícula</label>
                  <input
                    name="matricula"
                    value={nuevoVehiculo.matricula}
                    onChange={handleChange}
                    placeholder="Ej: 1234-ABC"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Marca</label>
                  <input
                    name="marca"
                    value={nuevoVehiculo.marca}
                    onChange={handleChange}
                    placeholder="Ej: Renault"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Modelo</label>
                  <input
                    name="modelo"
                    value={nuevoVehiculo.modelo}
                    onChange={handleChange}
                    placeholder="Ej: Kangoo"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Fecha matriculación</label>
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
                    <option value="">Sin asignar</option>
                    {empleados.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre} {emp.apellidos || ""}
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
                    placeholder="Ej: 120000"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={nuevoVehiculo.observaciones}
                    onChange={handleChange}
                    placeholder="Notas adicionales del vehículo..."
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "120px",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="submit"
                  style={{
                    border: "none",
                    borderRadius: "18px",
                    padding: "14px 22px",
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "#fff",
                    cursor: "pointer",
                    background:
                      "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                    boxShadow: "0 12px 25px rgba(21, 128, 61, 0.25)",
                  }}
                >
                  Guardar vehículo
                </button>
              </div>
            </form>
          </div>

          <div
            style={{
              ...cardGlass,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(244,252,245,0.98) 100%)",
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#123b20",
                }}
              >
                Próximos mantenimientos
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Control rápido de revisiones vencidas, próximas o en estado
                correcto.
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "8px",
                border: "1px solid rgba(21, 128, 61, 0.08)",
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
                              background: "rgba(239, 68, 68, 0.12)",
                              color: "#b91c1c",
                            }
                          : row.estado_fecha === "PROXIMO"
                          ? {
                              background: "rgba(245, 158, 11, 0.14)",
                              color: "#b45309",
                            }
                          : {
                              background: "rgba(34, 197, 94, 0.12)",
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
        </div>

        {/* VEHÍCULOS */}
        <div style={{ marginTop: "24px" }}>
          <div
            style={{
              ...cardGlass,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(244,252,245,0.98) 100%)",
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#123b20",
                }}
              >
                Vehículos registrados
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Consulta rápida de la flota actual con conductor y kilometraje.
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "8px",
                border: "1px solid rgba(21, 128, 61, 0.08)",
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
          </div>
        </div>

        {/* HISTORIAL */}
        <div style={{ marginTop: "24px" }}>
          <div
            style={{
              ...cardGlass,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(244,252,245,0.98) 100%)",
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#123b20",
                }}
              >
                Historial de mantenimientos
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Seguimiento de mantenimientos realizados, costes y responsables.
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                borderRadius: "18px",
                padding: "8px",
                border: "1px solid rgba(21, 128, 61, 0.08)",
              }}
            >
              <SimpleTable
                columns={[
                  { key: "matricula", label: "Matrícula" },
                  { key: "tipo_mantenimiento", label: "Tipo" },
                  { key: "fecha", label: "Fecha" },
                  {
                    key: "coste",
                    label: "Coste",
                    render: (row) => `${Number(row.coste || 0).toFixed(2)} €`,
                  },
                  { key: "encargado", label: "Encargado" },
                ]}
                data={mantenimientos}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}