"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

const estadoInicial = {
  nombre: "",
  telefono: "",
  email: "",
  direccion: "",
  nif_cif: "",
  persona_contacto: "",
  observaciones: "",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(estadoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  async function cargarClientes() {
    try {
      const res = await api.get("/clientes", {
        params: { busqueda },
      });
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setMensaje(
        error.response?.data?.error ||
          error.response?.data?.detalle ||
          "Error al cargar clientes"
      );
    }
  }

  useEffect(() => {
    cargarClientes();
  }, [busqueda]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardarCliente(e) {
    e.preventDefault();
    setMensaje("");

    try {
      if (editandoId) {
        await api.put(`/clientes/${editandoId}`, form);
        setMensaje("Cliente actualizado correctamente");
      } else {
        await api.post("/clientes", form);
        setMensaje("Cliente creado correctamente");
      }

      setForm(estadoInicial);
      setEditandoId(null);
      await cargarClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setMensaje(
        error.response?.data?.error ||
          error.response?.data?.detalle ||
          "Error al guardar cliente"
      );
    }
  }

  function editar(cliente) {
    setForm({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      direccion: cliente.direccion || "",
      nif_cif: cliente.nif_cif || "",
      persona_contacto: cliente.persona_contacto || "",
      observaciones: cliente.observaciones || "",
    });
    setEditandoId(cliente.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id) {
    if (!confirm("¿Seguro que quieres eliminar este cliente?")) return;

    try {
      await api.delete(`/clientes/${id}`);
      setMensaje("Cliente eliminado correctamente");
      await cargarClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      setMensaje(
        error.response?.data?.error ||
          error.response?.data?.detalle ||
          "Error al eliminar cliente"
      );
    }
  }

  function badge(valor) {
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

  const heroStyle = {
    ...cardStyle,
    padding: "30px",
    marginBottom: "22px",
    background: "linear-gradient(135deg, #ffffff 0%, #f7fcf4 55%, #eef8e9 100%)",
  };

  const sectionCardStyle = {
    ...cardStyle,
    padding: "24px",
  };

  const formCardStyle = {
    ...cardStyle,
    padding: "24px",
    position: "sticky",
    top: "20px",
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

  const textareaStyle = {
    ...inputStyle,
    minHeight: "120px",
    resize: "vertical",
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
    cursor: "pointer",
    background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
    boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
    minWidth: "190px",
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
    minWidth: "180px",
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
    width: "100%",
    overflowX: "auto",
    overflowY: "hidden",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    background: "#ffffff",
  };

  const tableStyle = {
    width: "100%",
    minWidth: "1200px",
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
                Registro · Clientes
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
                Gestión clara y profesional de clientes
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
                Registra clientes, consulta sus datos de contacto y mantén un
                listado limpio, ordenado y visualmente uniforme con el resto de
                la aplicación.
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
                {clientes.length}
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
            gridTemplateColumns: "560px minmax(0, 1fr)",
            gap: "24px",
            alignItems: "start",
            marginBottom: "22px",
          }}
        >
          <section style={formCardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "18px",
                flexWrap: "wrap",
                marginBottom: "22px",
              }}
            >
              <div>
                <h2 style={sectionTitleStyle}>
                  {editandoId ? "Editar cliente" : "Nuevo cliente"}
                </h2>
                <p style={sectionTextStyle}>
                  Formulario amplio, cómodo y alineado con el resto del sistema.
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
                    Cliente seleccionado
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={guardarCliente}>
              <div style={{ display: "grid", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input
                    name="nombre"
                    placeholder="Introduce el nombre del cliente"
                    value={form.nombre}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>NIF / CIF</label>
                  <input
                    name="nif_cif"
                    placeholder="Introduce el NIF o CIF"
                    value={form.nif_cif}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Persona de contacto</label>
                  <input
                    name="persona_contacto"
                    placeholder="Nombre de la persona de contacto"
                    value={form.persona_contacto}
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
                  <label style={labelStyle}>Dirección</label>
                  <input
                    name="direccion"
                    placeholder="Dirección completa"
                    value={form.direccion}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Observaciones</label>
                  <textarea
                    name="observaciones"
                    placeholder="Escribe aquí cualquier observación adicional"
                    value={form.observaciones}
                    onChange={handleChange}
                    style={textareaStyle}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginTop: "8px",
                  }}
                >
                  <button type="submit" style={botonPrincipal}>
                    {editandoId ? "Actualizar cliente" : "Crear cliente"}
                  </button>

                  {editandoId ? (
                    <button
                      type="button"
                      style={botonSecundario}
                      onClick={() => {
                        setEditandoId(null);
                        setForm(estadoInicial);
                      }}
                    >
                      Cancelar edición
                    </button>
                  ) : null}
                </div>
              </div>
            </form>
          </section>

          <section style={sectionCardStyle}>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={sectionTitleStyle}>Buscador y listado</h2>
              <p style={sectionTextStyle}>
                Consulta rápida de clientes con una tabla clara y bien integrada.
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <input
                placeholder="Buscar por nombre, NIF/CIF, teléfono o email"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>NIF/CIF</th>
                    <th style={thStyle}>Contacto</th>
                    <th style={thStyle}>Teléfono</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Dirección</th>
                    <th style={thStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.length > 0 ? (
                    clientes.map((cliente, index) => (
                      <tr key={`${cliente.id || 0}-${index}`}>
                        <td style={{ ...tdStyle, fontWeight: 800 }}>
                          {cliente.nombre || "-"}
                        </td>
                        <td style={tdStyle}>{badge(cliente.nif_cif)}</td>
                        <td style={tdStyle}>{cliente.persona_contacto || "-"}</td>
                        <td style={tdStyle}>{cliente.telefono || "-"}</td>
                        <td style={tdStyle}>{cliente.email || "-"}</td>
                        <td style={tdStyle}>{cliente.direccion || "-"}</td>
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
                              onClick={() => editar(cliente)}
                              style={botonEditar}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminar(cliente.id)}
                              style={botonEliminar}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={emptyCellStyle}>
                        No hay clientes registrados
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