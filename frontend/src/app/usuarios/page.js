"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

const estadoInicial = {
  username: "",
  password: "",
  rol: "consulta",
  trabajador_id: "",
  estado: "activo",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [form, setForm] = useState(estadoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  async function cargar() {
    try {
      const [usuariosRes, trabajadoresRes] = await Promise.all([
        api.get("/usuarios-sistema", {
          params: {
            busqueda,
            rol: rolFiltro,
            estado: estadoFiltro,
          },
        }),
        api.get("/trabajadores"),
      ]);

      setUsuarios(Array.isArray(usuariosRes.data) ? usuariosRes.data : []);
      setTrabajadores(
        Array.isArray(trabajadoresRes.data) ? trabajadoresRes.data : []
      );
    } catch (error) {
      setMensaje(
        error.response?.data?.error || "Error al cargar usuarios del sistema"
      );
    }
  }

  useEffect(() => {
    cargar();
  }, [busqueda, rolFiltro, estadoFiltro]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function limpiarFormulario() {
    setForm(estadoInicial);
    setEditandoId(null);
  }

  async function guardar(e) {
    e.preventDefault();
    setMensaje("");

    try {
      const payload = {
        ...form,
        trabajador_id: form.trabajador_id || null,
      };

      if (editandoId && !payload.password.trim()) {
        delete payload.password;
      }

      if (editandoId) {
        await api.put(`/usuarios-sistema/${editandoId}`, payload);
        setMensaje("Usuario actualizado correctamente");
      } else {
        await api.post("/usuarios-sistema", payload);
        setMensaje("Usuario creado correctamente");
      }

      limpiarFormulario();
      await cargar();
    } catch (error) {
      setMensaje(error.response?.data?.error || "Error al guardar usuario");
    }
  }

  function editar(usuario) {
    setEditandoId(usuario.id);
    setForm({
      username: usuario.username || "",
      password: "",
      rol: usuario.rol || "consulta",
      trabajador_id: usuario.trabajador_id
        ? String(usuario.trabajador_id)
        : "",
      estado: usuario.estado || "activo",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id) {
    if (!confirm("¿Seguro que quieres desactivar este usuario?")) return;

    try {
      await api.delete(`/usuarios-sistema/${id}`);
      setMensaje("Usuario desactivado correctamente");

      if (editandoId === id) {
        limpiarFormulario();
      }

      await cargar();
    } catch (error) {
      setMensaje(
        error.response?.data?.error || "Error al desactivar usuario"
      );
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return "-";

    try {
      return new Date(fecha).toLocaleString("es-ES");
    } catch {
      return fecha;
    }
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
        }}
      >
        {valor || "-"}
      </span>
    );
  }

  function badgeRol(valor) {
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
          textTransform: "capitalize",
        }}
      >
        {valor || "-"}
      </span>
    );
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
    minHeight: "50px",
    padding: "14px 15px",
    borderRadius: "16px",
    border: "1px solid #cfe0d0",
    background: "#fcfffc",
    color: "#111827",
    outline: "none",
    fontSize: "15px",
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
    letterSpacing: "-0.3px",
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

  const botonEliminar = {
    border: "none",
    borderRadius: "12px",
    padding: "9px 13px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#b91c1c",
    cursor: "pointer",
    background: "#fef2f2",
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
    background: "#ffffff",
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
                Registro · Usuarios del sistema
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
                Gestión segura y uniforme de accesos
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
                Administra usuarios, roles, vinculación con trabajadores y estado
                de acceso desde una pantalla con la misma estética profesional
                del resto de módulos.
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
                {usuarios.length}
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
                {editandoId ? "Editar usuario" : "Nuevo usuario"}
              </h2>
              <p style={sectionTextStyle}>
                Campos más amplios, cómodos y homogéneos para altas y edición.
              </p>
            </div>

            <form onSubmit={guardar}>
              <div style={{ display: "grid", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Nombre de usuario</label>
                  <input
                    name="username"
                    placeholder="Introduce el nombre de usuario"
                    value={form.username}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    {editandoId ? "Nueva contraseña" : "Contraseña"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder={
                      editandoId
                        ? "Déjalo vacío si no quieres cambiarla"
                        : "Introduce la contraseña"
                    }
                    value={form.password}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>Rol</label>
                    <select
                      name="rol"
                      value={form.rol}
                      onChange={handleChange}
                      style={selectStyle}
                    >
                      <option value="administrador">Administrador</option>
                      <option value="encargado">Encargado</option>
                      <option value="operario">Operario</option>
                      <option value="consulta">Consulta</option>
                    </select>
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

                <div>
                  <label style={labelStyle}>Trabajador asociado</label>
                  <select
                    name="trabajador_id"
                    value={form.trabajador_id}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="">Sin trabajador asociado</option>
                    {trabajadores.map((t) => (
                      <option key={t.id} value={t.id}>
                        {[t.nombre, t.apellidos].filter(Boolean).join(" ")}
                      </option>
                    ))}
                  </select>
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
                    {editandoId ? "Actualizar usuario" : "Crear usuario"}
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
              </div>
            </form>
          </div>

          <div style={{ ...cardStyle, padding: "24px" }}>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={sectionTitleStyle}>Buscador y listado</h2>
              <p style={sectionTextStyle}>
                Visual más clara, filtros homogéneos y lectura más cómoda.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 0.8fr 0.8fr",
                gap: "14px",
                marginBottom: "16px",
              }}
            >
              <input
                placeholder="Buscar por usuario o trabajador"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={inputStyle}
              />

              <select
                value={rolFiltro}
                onChange={(e) => setRolFiltro(e.target.value)}
                style={selectStyle}
              >
                <option value="">Todos los roles</option>
                <option value="administrador">Administrador</option>
                <option value="encargado">Encargado</option>
                <option value="operario">Operario</option>
                <option value="consulta">Consulta</option>
              </select>

              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
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
                    <th style={thStyle}>Usuario</th>
                    <th style={thStyle}>Rol</th>
                    <th style={thStyle}>Trabajador</th>
                    <th style={thStyle}>Último acceso</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length > 0 ? (
                    usuarios.map((u) => (
                      <tr key={u.id}>
                        <td style={{ ...tdStyle, fontWeight: 800 }}>
                          {u.username || "-"}
                        </td>
                        <td style={tdStyle}>{badgeRol(u.rol)}</td>
                        <td style={tdStyle}>
                          {[u.nombre, u.apellidos].filter(Boolean).join(" ") ||
                            "-"}
                        </td>
                        <td style={tdStyle}>{formatearFecha(u.ultimo_acceso)}</td>
                        <td style={tdStyle}>{badgeEstado(u.estado)}</td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => editar(u)}
                              style={botonEditar}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => eliminar(u.id)}
                              style={botonEliminar}
                            >
                              Desactivar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={emptyCellStyle}>
                        No hay usuarios registrados
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