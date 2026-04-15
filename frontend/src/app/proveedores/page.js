"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

const estadoInicial = {
  nombre: "",
  nif_cif: "",
  telefono: "",
  email: "",
  direccion: "",
  tipo_producto: "",
  observaciones: "",
};

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState(estadoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  async function cargarProveedores() {
    try {
      const res = await api.get("/proveedores", {
        params: { busqueda },
      });
      setProveedores(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setMensaje(
        error.response?.data?.error ||
          error.response?.data?.detalle ||
          "Error al cargar proveedores"
      );
    }
  }

  useEffect(() => {
    cargarProveedores();
  }, [busqueda]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function guardarProveedor(e) {
    e.preventDefault();
    setMensaje("");

    try {
      if (editandoId) {
        await api.put(`/proveedores/${editandoId}`, form);
        setMensaje("Proveedor actualizado correctamente");
      } else {
        await api.post("/proveedores", form);
        setMensaje("Proveedor creado correctamente");
      }

      setForm(estadoInicial);
      setEditandoId(null);
      cargarProveedores();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      setMensaje(
        error.response?.data?.error ||
          error.response?.data?.detalle ||
          "Error al guardar proveedor"
      );
    }
  }

  function editar(proveedor) {
    setForm({
      nombre: proveedor.nombre || "",
      nif_cif: proveedor.nif_cif || "",
      telefono: proveedor.telefono || "",
      email: proveedor.email || "",
      direccion: proveedor.direccion || "",
      tipo_producto: proveedor.tipo_producto || "",
      observaciones: proveedor.observaciones || "",
    });
    setEditandoId(proveedor.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id) {
    if (!confirm("¿Seguro que quieres eliminar este proveedor?")) return;

    try {
      await api.delete(`/proveedores/${id}`);
      setMensaje("Proveedor eliminado correctamente");
      cargarProveedores();
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      setMensaje(
        error.response?.data?.error ||
          error.response?.data?.detalle ||
          "Error al eliminar proveedor"
      );
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
    minWidth: "1150px",
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

  function badgeDato(valor) {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "7px 12px",
          borderRadius: "999px",
          background: "#eefbf0",
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
                Registro · Proveedores
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
                Gestión ordenada de proveedores
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
                Mantén una base de proveedores bien presentada, uniforme y
                alineada con la estética profesional de toda la aplicación.
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
                {proveedores.length}
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
                {editandoId ? "Editar proveedor" : "Nuevo proveedor"}
              </h2>
              <p style={sectionTextStyle}>
                Formulario con mejor estructura visual y un aspecto más serio y
                corporativo.
              </p>
            </div>

            <form onSubmit={guardarProveedor}>
              <div style={{ display: "grid", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Nombre / razón social</label>
                  <input
                    name="nombre"
                    placeholder="Nombre del proveedor"
                    value={form.nombre}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>NIF / CIF</label>
                  <input
                    name="nif_cif"
                    placeholder="Documento fiscal"
                    value={form.nif_cif}
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
                  <label style={labelStyle}>Tipo de producto suministrado</label>
                  <input
                    name="tipo_producto"
                    placeholder="Ej. caracoles, cabrillas, envases..."
                    value={form.tipo_producto}
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
                    {editandoId ? "Actualizar proveedor" : "Crear proveedor"}
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
                Tabla más moderna, mejor separada y visualmente uniforme con el
                resto de módulos.
              </p>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <input
                placeholder="Buscar por nombre, NIF/CIF, teléfono o tipo de producto"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Proveedor</th>
                    <th style={thStyle}>NIF/CIF</th>
                    <th style={thStyle}>Teléfono</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Tipo producto</th>
                    <th style={thStyle}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.length > 0 ? (
                    proveedores.map((proveedor) => (
                      <tr key={proveedor.id}>
                        <td style={{ ...tdStyle, fontWeight: 800 }}>
                          {proveedor.nombre || "-"}
                        </td>
                        <td style={tdStyle}>{badgeDato(proveedor.nif_cif)}</td>
                        <td style={tdStyle}>{proveedor.telefono || "-"}</td>
                        <td style={tdStyle}>{proveedor.email || "-"}</td>
                        <td style={tdStyle}>
                          {badgeDato(proveedor.tipo_producto || "-")}
                        </td>
                        <td style={tdStyle}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              onClick={() => editar(proveedor)}
                              style={botonEditar}
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => eliminar(proveedor.id)}
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
                        No hay proveedores registrados
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