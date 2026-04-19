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
  const [esError, setEsError] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      cargarTrabajadores();
    }, 300);

    return () => clearTimeout(timeout);
  }, [busqueda, estado]);

  function mostrarMensaje(texto, error = false) {
    setMensaje(texto);
    setEsError(error);

    setTimeout(() => {
      setMensaje("");
      setEsError(false);
    }, 3500);
  }

  async function cargarTrabajadores() {
    try {
      setCargando(true);

      const res = await api.get("/api/trabajadores", {
        params: {
          busqueda: busqueda || "",
          estado: estado || "",
        },
      });

      setTrabajadores(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
      mostrarMensaje(
        error?.response?.data?.error ||
          `Error al cargar trabajadores (${error?.response?.status || "sin código"})`,
        true
      );
    } finally {
      setCargando(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "dni"
          ? value.toUpperCase()
          : name === "email"
          ? value.toLowerCase()
          : value,
    }));
  }

  function limpiarFormulario() {
    setForm(inicial);
    setEditandoId(null);
  }

  function validarFormulario() {
    if (!String(form.nombre || "").trim()) {
      mostrarMensaje("El nombre es obligatorio", true);
      return false;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      mostrarMensaje("El email no tiene un formato válido", true);
      return false;
    }

    return true;
  }

  async function guardar(e) {
    e.preventDefault();
    if (guardando) return;

    if (!validarFormulario()) return;

    try {
      setGuardando(true);

      const payload = {
        nombre: String(form.nombre || "").trim(),
        apellidos: String(form.apellidos || "").trim() || null,
        dni: String(form.dni || "").trim().toUpperCase() || null,
        telefono: String(form.telefono || "").trim() || null,
        email: String(form.email || "").trim().toLowerCase() || null,
        puesto: String(form.puesto || "").trim() || null,
        fecha_alta: form.fecha_alta || null,
        estado: form.estado || "activo",
      };

      if (editandoId) {
        await api.put(`/api/trabajadores/${editandoId}`, payload);
        mostrarMensaje("Trabajador actualizado correctamente");
      } else {
        await api.post("/api/trabajadores", payload);
        mostrarMensaje("Trabajador creado correctamente");
      }

      limpiarFormulario();
      await cargarTrabajadores();
    } catch (error) {
      console.error("Error al guardar trabajador:", error);
      mostrarMensaje(
        error?.response?.data?.error ||
          `Error al guardar trabajador (${error?.response?.status || "sin código"})`,
        true
      );
    } finally {
      setGuardando(false);
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
      fecha_alta: item.fecha_alta ? String(item.fecha_alta).slice(0, 10) : "",
      estado: item.estado || "activo",
    });

    setEditandoId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
          whiteSpace: "nowrap",
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
          whiteSpace: "nowrap",
        }}
      >
        {valor || "-"}
      </span>
    );
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #edf7e8 0%, #f6fbf3 45%, #eef7ea 100%)",
    padding: "28px 20px 40px",
  };

  const containerStyle = {
    maxWidth: "1520px",
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

  const heroStyle = {
    ...cardStyle,
    padding: "30px",
    marginBottom: "22px",
    background: "linear-gradient(135deg, #ffffff 0%, #f7fcf4 55%, #eef8e9 100%)",
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
    padding: "14px 20px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#fff",
    cursor: guardando ? "not-allowed" : "pointer",
    background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
    boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
    opacity: guardando ? 0.75 : 1,
  };

  const botonSecundario = {
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    padding: "14px 20px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#111827",
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
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    background: "#ffffff",
  };

  const tableStyle = {
    width: "100%",
    minWidth: "1100px",
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
                Registro · Trabajadores
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
                Gestión elegante del personal
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
                Organiza trabajadores, estados y puestos desde un entorno
                uniforme, serio y visualmente agradable, con la misma línea que
                el resto del sistema.
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
                Total registrados
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 800,
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
              marginBottom: "22px",
              background: esError ? "#fef2f2" : "#ecfdf5",
              borderColor: esError ? "#fecaca" : "#bbf7d0",
            }}
          >
            <div
              style={{
                color: esError ? "#b91c1c" : "#166534",
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
            gridTemplateColumns: "1.02fr 1.38fr",
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
                <h2 style={sectionTitleStyle}>
                  {editandoId ? "Editar trabajador" : "Nuevo trabajador"}
                </h2>
                <p style={sectionTextStyle}>
                  Formulario limpio y consistente con el resto de módulos.
                </p>
              </div>

              {editandoId ? (
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
                    Modo edición
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#1d4ed8",
                      lineHeight: 1.2,
                    }}
                  >
                    Trabajador seleccionado
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={guardar}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
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
                  marginTop: "20px",
                }}
              >
                <button type="submit" style={botonPrincipal} disabled={guardando}>
                  {guardando
                    ? "Guardando..."
                    : editandoId
                    ? "Actualizar trabajador"
                    : "Crear trabajador"}
                </button>

                {editandoId ? (
                  <button
                    type="button"
                    style={botonSecundario}
                    onClick={limpiarFormulario}
                  >
                    Cancelar edición
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section style={sectionCardStyle}>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={sectionTitleStyle}>Buscador y listado</h2>
              <p style={sectionTextStyle}>
                Busca por nombre, DNI o puesto, con una tabla más clara y mejor integrada.
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
                  {cargando ? (
                    <tr>
                      <td colSpan={6} style={emptyCellStyle}>
                        Cargando trabajadores...
                      </td>
                    </tr>
                  ) : trabajadores.length > 0 ? (
                    trabajadores.map((t, index) => (
                      <tr key={`${t.id}-${t.dni || "sin-dni"}-${index}`}>
                        <td style={{ ...tdStyle, fontWeight: 800 }}>
                          {t.nombre || "-"}
                        </td>
                        <td style={tdStyle}>{t.apellidos || "-"}</td>
                        <td style={tdStyle}>{t.dni || "-"}</td>
                        <td style={tdStyle}>{badgePuesto(t.puesto)}</td>
                        <td style={tdStyle}>{badgeEstado(t.estado)}</td>
                        <td style={tdStyle}>
                          <button type="button" onClick={() => editar(t)} style={botonEditar}>
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
          </section>
        </section>
      </div>
    </main>
  );
}