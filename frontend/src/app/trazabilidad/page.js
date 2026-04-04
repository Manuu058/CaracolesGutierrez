"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import SectionCard from "../../components/SectionCard";
import SimpleTable from "../../components/SimpleTable";

export default function TrazabilidadPage() {
  const [productos, setProductos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [stock, setStock] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    unidad_medida: "kg",
    stock_minimo: "",
  });

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      const [p, l, pr, c, s] = await Promise.all([
        api.get("/productos"),
        api.get("/lotes"),
        api.get("/proveedores"),
        api.get("/clientes"),
        api.get("/productos/stock/resumen"),
      ]);

      setProductos(p.data || []);
      setLotes(l.data || []);
      setProveedores(pr.data || []);
      setClientes(c.data || []);
      setStock(s.data || []);
    } catch (error) {
      console.error("Error al cargar trazabilidad:", error);
    }
  }

  const handleProductoChange = (e) => {
    setNuevoProducto({
      ...nuevoProducto,
      [e.target.name]: e.target.value,
    });
  };

  const crearProducto = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await api.post("/productos", {
        ...nuevoProducto,
        precio: Number(nuevoProducto.precio || 0),
        stock_minimo: Number(nuevoProducto.stock_minimo || 0),
      });

      setNuevoProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        unidad_medida: "kg",
        stock_minimo: "",
      });

      setMensaje("Producto creado correctamente");
      cargarTodo();
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.error || "Error al crear producto");
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
              "linear-gradient(135deg, rgba(12,48,25,0.94) 0%, rgba(20,83,45,0.94) 45%, rgba(34,120,64,0.92) 100%)",
            color: "#fff",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-30px",
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
              🌿 Control inteligente de trazabilidad
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
              Módulo de Trazabilidad
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
              Controla productos, lotes, proveedores, clientes y stock en tiempo
              real desde una vista más visual, limpia y profesional. Todo el
              recorrido del producto queda registrado para asegurar una
              trazabilidad completa y segura.
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
            { titulo: "Productos", valor: productos.length, icono: "📦" },
            { titulo: "Lotes", valor: lotes.length, icono: "🧾" },
            { titulo: "Clientes", valor: clientes.length, icono: "👥" },
            { titulo: "Proveedores", valor: proveedores.length, icono: "🚚" },
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

        {/* FORM + STOCK */}
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
                Nuevo registro
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
                Crear nuevo producto
              </h2>

              <p
                style={{
                  marginTop: "10px",
                  color: "#4e6f58",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Añade productos con sus datos básicos para empezar a controlar
                su stock y su trazabilidad dentro del sistema.
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

            <form onSubmit={crearProducto}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Nombre</label>
                  <input
                    name="nombre"
                    value={nuevoProducto.nombre}
                    onChange={handleProductoChange}
                    placeholder="Ej: Caracol cocido"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Unidad</label>
                  <select
                    name="unidad_medida"
                    value={nuevoProducto.unidad_medida}
                    onChange={handleProductoChange}
                    style={inputStyle}
                  >
                    <option value="kg">kg</option>
                    <option value="litros">litros</option>
                    <option value="unidades">unidades</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio"
                    value={nuevoProducto.precio}
                    onChange={handleProductoChange}
                    placeholder="0.00"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Stock mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    name="stock_minimo"
                    value={nuevoProducto.stock_minimo}
                    onChange={handleProductoChange}
                    placeholder="0"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={nuevoProducto.descripcion}
                    onChange={handleProductoChange}
                    placeholder="Describe el producto..."
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
                  Guardar producto
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
                Stock resumido
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Estado general del inventario para detectar rápidamente niveles
                bajos de stock.
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
                  { key: "producto", label: "Producto" },
                  { key: "stock_total", label: "Stock" },
                  { key: "unidad_medida", label: "Unidad" },
                  {
                    key: "estado_stock",
                    label: "Estado",
                    render: (row) => (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: 800,
                          background:
                            row.estado_stock === "BAJO"
                              ? "rgba(239, 68, 68, 0.12)"
                              : "rgba(34, 197, 94, 0.12)",
                          color:
                            row.estado_stock === "BAJO"
                              ? "#b91c1c"
                              : "#166534",
                        }}
                      >
                        {row.estado_stock}
                      </span>
                    ),
                  },
                ]}
                data={stock}
              />
            </div>
          </div>
        </div>

        {/* PRODUCTOS */}
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
                Productos registrados
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Visualiza todos los productos dados de alta con sus principales
                datos de control.
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
                  { key: "nombre", label: "Nombre" },
                  { key: "unidad_medida", label: "Unidad" },
                  {
                    key: "precio",
                    label: "Precio",
                    render: (row) => `${Number(row.precio || 0).toFixed(2)} €`,
                  },
                  { key: "stock_minimo", label: "Stock mínimo" },
                ]}
                data={productos}
              />
            </div>
          </div>
        </div>

        {/* LOTES Y PROVEEDORES */}
        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "22px",
          }}
        >
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
                Lotes
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Seguimiento de lotes por producto, proveedor y stock disponible.
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
                  { key: "codigo_lote", label: "Código" },
                  { key: "producto", label: "Producto" },
                  { key: "proveedor", label: "Proveedor" },
                  { key: "stock", label: "Stock" },
                ]}
                data={lotes}
              />
            </div>
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
                Proveedores
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Información de contacto de los proveedores registrados en el
                sistema.
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
                  { key: "nombre", label: "Nombre" },
                  { key: "telefono", label: "Teléfono" },
                  { key: "email", label: "Email" },
                ]}
                data={proveedores}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}