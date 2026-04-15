"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

const estadoInicial = {
  nombre: "",
  dni_cif: "",
  telefono: "",
  email: "",
  direccion: "",
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
      setClientes(res.data || []);
    } catch (error) {
      setMensaje("Error al cargar clientes");
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
      cargarClientes();
    } catch (error) {
      setMensaje(error.response?.data?.error || "Error al guardar cliente");
    }
  }

  function editar(cliente) {
    setForm({
      nombre: cliente.nombre || "",
      dni_cif: cliente.dni_cif || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      direccion: cliente.direccion || "",
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
      cargarClientes();
    } catch (error) {
      setMensaje(error.response?.data?.error || "Error al eliminar cliente");
    }
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
      "linear-gradient(135deg, #ffffff 0%, #f8fcf8 55%, #f0f8f1 100%)",
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

  const textareaStyle = {
    ...inputStyle,
    minHeight: "110px",
    resize: "vertical",
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

  function badgeDocumento(valor) {
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
                Registro · Clientes
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
                Gestión clara y profesional de clientes
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
                Registra clientes, consulta sus datos de contacto y mantén un
                listado limpio, ordenado y visualmente uniforme con el resto de
                la aplicación.
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
                {editandoId ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <p style={sectionTextStyle}>
                Completa la información básica del cliente con un diseño más
                limpio y cómodo de usar.
              </p>
            </div>

            <form onSubmit={guardarCliente}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Nombre / razón social</label>
                  <input
                    name="nombre"
                    placeholder="Introduce el nombre del cliente"
                    value={form.nombre}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>DNI / CIF</label>
                  <input
                    name="dni_cif"
                    placeholder="Introduce el DNI o CIF"
                    value={form.dni_cif}
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
                </div>

                <div>
                  <label style={labelStyle}>Dirección</label>
                  <input
                    name="direccion"
                    placeholder="Dirección"
                    value={form.direccion}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Observaciones</label>
                  <textarea
                    name="observaciones"
                    placeholder="Observaciones adicionales"
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
                    marginTop: "4px",
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
          </div>

          <div style={{ ...cardStyle, padding: "24px" }}>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={sectionTitleStyle}>Buscador y listado</h2>
              <p style={sectionTextStyle}>
                Consulta rápida de clientes con una tabla más clara, aireada y
                fácil de leer.
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <input
                placeholder="Buscar por nombre, DNI/CIF, teléfono o email"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Cliente</th>
                    <th style={thStyle}>DNI/CIF</th>
                    <th style={thStyle}>Teléfono</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Dirección</th>
                    <th style={thStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.length > 0 ? (
                    clientes.map((cliente) => (
                      <tr key={cliente.id}>
                        <td style={{ ...tdStyle, fontWeight: 800 }}>
                          {cliente.nombre || "-"}
                        </td>
                        <td style={tdStyle}>{badgeDocumento(cliente.dni_cif)}</td>
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
                              onClick={() => editar(cliente)}
                              style={botonEditar}
                            >
                              Editar
                            </button>
                            <button
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
                      <td colSpan={6} style={emptyCellStyle}>
                        No hay clientes registrados
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