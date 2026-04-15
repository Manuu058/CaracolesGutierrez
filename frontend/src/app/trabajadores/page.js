"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

const inicial = {
  nombre: "",
  apellidos: "",
  dni: "",
  telefono: "",
  email: "",
  puesto: "",
  fecha_alta: "",
  estado: "activo",
};

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [form, setForm] = useState(inicial);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  async function cargarTrabajadores() {
    try {
      const res = await api.get("/trabajadores", {
        params: { busqueda, estado },
      });
      setTrabajadores(res.data || []);
    } catch {
      setMensaje("Error al cargar trabajadores");
    }
  }

  useEffect(() => {
    cargarTrabajadores();
  }, [busqueda, estado]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardar(e) {
    e.preventDefault();

    try {
      if (editandoId) {
        await api.put(`/trabajadores/${editandoId}`, form);
        setMensaje("Trabajador actualizado correctamente");
      } else {
        await api.post("/trabajadores", form);
        setMensaje("Trabajador creado correctamente");
      }

      setForm(inicial);
      setEditandoId(null);
      cargarTrabajadores();
    } catch (error) {
      setMensaje(error.response?.data?.error || "Error al guardar trabajador");
    }
  }

  function editar(item) {
    setForm({
      nombre: item.nombre || "",
      apellidos: item.apellidos || "",
      dni: item.dni || "",
      telefono: item.telefono || "",
      email: item.email || "",
      puesto: item.puesto || "",
      fecha_alta: item.fecha_alta ? item.fecha_alta.slice(0, 10) : "",
      estado: item.estado || "activo",
    });
    setEditandoId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const pageStyle = {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f4f8f4 0%, #eef6ef 45%, #f7faf7 100%)",
    padding: "28px 20px 40px",
  };

  const containerStyle = {
    maxWidth: "1450px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #dfe8df",
    borderRadius: "24px",
    boxShadow: "0 14px 40px rgba(21, 53, 37, 0.06)",
  };

  const heroStyle = {
    ...cardStyle,
    padding: "30px",
    marginBottom: "20px",
    background:
      "linear-gradient(135deg, #ffffff 0%, #f8fcf8 55%, #eef8ef 100%)",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "16px",
    border: "1px solid #cfe0d0",
    background: "#fcfffc",
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

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    color: "#254031",
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

  const botonPrincipal = {
    border: "none",
    borderRadius: "16px",
    padding: "13px 18px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
    boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
  };

  const botonSecundario = {
    border: "1px solid #d7e2d8",
    borderRadius: "16px",
    padding: "13px 18px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#1f2937",
    cursor: "pointer",
    background: "#ffffff",
  };

  const botonEditar = {
    border: "none",
    borderRadius: "12px",
    padding: "9px 13px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#166534",
    cursor: "pointer",
    background: "#ecfdf5",
  };

  const tableContainerStyle = {
    background: "#ffffff",
    border: "1px solid #e3ebe4",
    borderRadius: "20px",
    overflowX: "auto",
    overflowY: "hidden",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: "1100px",
  };

  const thStyle = {
    textAlign: "left",
    padding: "17px 18px",
    fontSize: "13px",
    fontWeight: 800,
    color: "#1f2937",
    background: "#f6faf6",
    borderBottom: "1px solid #e5ece6",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  };

  const tdStyle = {
    padding: "17px 18px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #eef3ef",
    verticalAlign: "middle",
  };

  const emptyCellStyle = {
    padding: "26px 18px",
    fontSize: "15px",
    color: "#6b7280",
    textAlign: "center",
  };

  function badgeEstado(valor) {
    const activo = String(valor || "").toLowerCase() === "activo";

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "95px",
          padding: "8px 14px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 800,
          background: activo ? "#ecfdf5" : "#fef2f2",
          color: activo ? "#166534" : "#b91c1c",
        }}
      >
        {valor || "-"}
      </span>
    );
  }

  function badgePuesto(valor) {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "7px 12px",
          borderRadius: "999px",
          background: "#f0fdf4",
          color: "#166534",
          fontWeight: 800,
          fontSize: "12px",
        }}
      >
        {valor || "-"}
      </span>
    );
  }

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
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px 12px",
                  borderRadius: "999px",
                  background: "#ecfdf5",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "14px",
                }}
              >
                Registro · Trabajadores
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "34px",
                  lineHeight: 1.08,
                  fontWeight: 900,
                  color: "#111827",
                  letterSpacing: "-0.8px",
                }}
              >
                Gestión elegante del personal
              </h1>

              <p
                style={{
                  margin: "12px 0 0 0",
                  maxWidth: "820px",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#6b7280",
                }}
              >
                Organiza trabajadores, estados y puestos desde un entorno
                uniforme, serio y visualmente agradable.
              </p>
            </div>

            <div
              style={{
                minWidth: "220px",
                padding: "18px 20px",
                borderRadius: "20px",
                background: "#f3fbf4",
                border: "1px solid #dcebdd",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#5b6b5f",
                  marginBottom: "10px",
                }}
              >
                Total registrados
              </div>
              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 900,
                  color: "#166534",
                  lineHeight: 1,
                }}
              >
                {trabajadores.length}
              </div>
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
                color: mensaje.toLowerCase().includes("error")
                  ? "#b91c1c"
                  : "#166534",
                fontWeight: 800,
              }}
            >
              {mensaje}
            </div>
          </section>
        ) : null}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1.35fr",
            gap: "20px",
            alignItems: "start",
            marginBottom: "22px",
          }}
        >
          <div style={{ ...cardStyle, padding: "24px" }}>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={sectionTitleStyle}>
                {editandoId ? "Editar trabajador" : "Nuevo trabajador"}
              </h2>
              <p style={sectionTextStyle}>
                Formulario más limpio, espacioso y consistente con el resto del
                sistema.
              </p>
            </div>

            <form onSubmit={guardar}>
              <div style={{ display: "grid", gap: "16px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Nombre</label>
                    <input
                      name="nombre"
                      placeholder="Nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Apellidos</label>
                    <input
                      name="apellidos"
                      placeholder="Apellidos"
                      value={form.apellidos}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>DNI</label>
                    <input
                      name="dni"
                      placeholder="DNI"
                      value={form.dni}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      name="telefono"
                      placeholder="Teléfono"
                      value={form.telefono}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    name="email"
                    placeholder="Correo electrónico"
                    value={form.email}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Puesto</label>
                    <input
                      name="puesto"
                      placeholder="Puesto"
                      value={form.puesto}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Fecha de alta</label>
                    <input
                      type="date"
                      name="fecha_alta"
                      value={form.fecha_alta}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Estado</label>
                    <select
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      style={selectStyle}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "4px",
                  }}
                >
                  <button type="submit" style={botonPrincipal}>
                    {editandoId ? "Actualizar trabajador" : "Crear trabajador"}
                  </button>

                  {editandoId ? (
                    <button
                      type="button"
                      style={botonSecundario}
                      onClick={() => {
                        setEditandoId(null);
                        setForm(inicial);
                      }}
                    >
                      Cancelar edición
                    </button>
                  ) : null}
                </div>
              </div>
            </form>
          </div>

          <div style={{ ...cardStyle, padding: "24px" }}>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={sectionTitleStyle}>Buscador y listado</h2>
              <p style={sectionTextStyle}>
                Tabla más agradable visualmente, con filtros mejor presentados y
                mayor sensación de orden.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 0.8fr",
                gap: "14px",
                marginBottom: "16px",
              }}
            >
              <input
                placeholder="Buscar por nombre, DNI o puesto"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={inputStyle}
              />

              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                style={selectStyle}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Apellidos</th>
                    <th style={thStyle}>DNI</th>
                    <th style={thStyle}>Puesto</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {trabajadores.length > 0 ? (
                    trabajadores.map((t) => (
                      <tr key={t.id}>
                        <td style={{ ...tdStyle, fontWeight: 800 }}>
                          {t.nombre || "-"}
                        </td>
                        <td style={tdStyle}>{t.apellidos || "-"}</td>
                        <td style={tdStyle}>{t.dni || "-"}</td>
                        <td style={tdStyle}>{badgePuesto(t.puesto)}</td>
                        <td style={tdStyle}>{badgeEstado(t.estado)}</td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => editar(t)}
                            style={botonEditar}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={emptyCellStyle}>
                        No hay trabajadores registrados
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