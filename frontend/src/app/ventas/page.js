"use client";

import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";
import SectionCard from "../../components/SectionCard";
import SimpleTable from "../../components/SimpleTable";

export default function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [resumenDiario, setResumenDiario] = useState([]);
  const [resumenMensual, setResumenMensual] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [formVenta, setFormVenta] = useState({
    almacen_id: 1,
    metodo_pago_id: 1,
    observaciones: "",
    cliente_id: "",
  });

  const [lineas, setLineas] = useState([
    {
      producto_id: "",
      descripcion_producto: "",
      cantidad: 1,
      precio_unitario: 0,
      lote_id: "",
    },
  ]);

  useEffect(() => {
    cargarTodo();
  }, []);

  async function cargarTodo() {
    try {
      const [v, p, rd, rm] = await Promise.all([
        api.get("/ventas"),
        api.get("/productos"),
        api.get("/ventas/resumen/diario"),
        api.get("/ventas/resumen/mensual"),
      ]);

      setVentas(v.data || []);
      setProductos(p.data || []);
      setResumenDiario(rd.data || []);
      setResumenMensual(rm.data || []);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
    }
  }

  const totalVenta = useMemo(() => {
    return lineas.reduce((acc, linea) => {
      return (
        acc +
        Number(linea.cantidad || 0) * Number(linea.precio_unitario || 0)
      );
    }, 0);
  }, [lineas]);

  const handleVentaChange = (e) => {
    setFormVenta({
      ...formVenta,
      [e.target.name]: e.target.value,
    });
  };

  const handleLineaChange = (index, field, value) => {
    const nuevasLineas = [...lineas];
    nuevasLineas[index][field] = value;

    if (field === "producto_id") {
      const producto = productos.find((p) => String(p.id) === String(value));

      if (producto) {
        nuevasLineas[index].descripcion_producto = producto.nombre;
        nuevasLineas[index].precio_unitario = Number(producto.precio || 0);
      }
    }

    setLineas(nuevasLineas);
  };

  const agregarLinea = () => {
    setLineas([
      ...lineas,
      {
        producto_id: "",
        descripcion_producto: "",
        cantidad: 1,
        precio_unitario: 0,
        lote_id: "",
      },
    ]);
  };

  const eliminarLinea = (index) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const crearVenta = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await api.post("/ventas", {
        ...formVenta,
        almacen_id: Number(formVenta.almacen_id),
        metodo_pago_id: Number(formVenta.metodo_pago_id),
        cliente_id: formVenta.cliente_id || null,
        lineas: lineas.map((l) => ({
          ...l,
          producto_id: Number(l.producto_id),
          cantidad: Number(l.cantidad),
          precio_unitario: Number(l.precio_unitario),
          lote_id: l.lote_id || null,
        })),
      });

      setMensaje("Venta creada correctamente");
      setFormVenta({
        almacen_id: 1,
        metodo_pago_id: 1,
        observaciones: "",
        cliente_id: "",
      });
      setLineas([
        {
          producto_id: "",
          descripcion_producto: "",
          cantidad: 1,
          precio_unitario: 0,
          lote_id: "",
        },
      ]);
      cargarTodo();
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.error || "Error al crear venta");
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
              "linear-gradient(135deg, rgba(12,48,25,0.95) 0%, rgba(20,83,45,0.95) 45%, rgba(34,120,64,0.92) 100%)",
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
              💶 Gestión comercial y ventas
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
              Módulo de Ventas
            </h1>

            <p
              style={{
                marginTop: "14px",
                maxWidth: "920px",
                fontSize: "16px",
                lineHeight: 1.7,
                color: "rgba(240,255,244,0.92)",
              }}
            >
              Registra ventas con varias líneas, controla métodos de pago,
              consulta listados y analiza resúmenes diarios y mensuales desde
              una vista mucho más moderna, clara y profesional.
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
            { titulo: "Ventas registradas", valor: ventas.length, icono: "🧾" },
            { titulo: "Resumen diario", valor: resumenDiario.length, icono: "📅" },
            {
              titulo: "Venta actual",
              valor: `${totalVenta.toFixed(2)} €`,
              icono: "💰",
            },
            {
              titulo: "Resumen mensual",
              valor: resumenMensual.length,
              icono: "📈",
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
                  fontSize: typeof item.valor === "string" ? "28px" : "34px",
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

        {/* FORMULARIO */}
        <div
          style={{
            ...cardGlass,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(244,252,245,0.98) 100%)",
            padding: "26px",
            marginBottom: "24px",
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
              Nueva venta
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
              Registrar venta
            </h2>

            <p
              style={{
                marginTop: "10px",
                color: "#4e6f58",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Crea ventas con varias líneas de producto y calcula el total en
              tiempo real.
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

          <form onSubmit={crearVenta}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Almacén</label>
                <select
                  name="almacen_id"
                  value={formVenta.almacen_id}
                  onChange={handleVentaChange}
                  style={inputStyle}
                >
                  <option value={1}>Almacén Principal</option>
                  <option value={2}>Almacén Sevilla</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Método de pago</label>
                <select
                  name="metodo_pago_id"
                  value={formVenta.metodo_pago_id}
                  onChange={handleVentaChange}
                  style={inputStyle}
                >
                  <option value={1}>Efectivo</option>
                  <option value={2}>Tarjeta</option>
                  <option value={3}>Transferencia</option>
                  <option value={4}>Bizum</option>
                  <option value={5}>Otros</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Observaciones</label>
                <textarea
                  name="observaciones"
                  value={formVenta.observaciones}
                  onChange={handleVentaChange}
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "110px",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: "24px" }}>
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#123b20",
                }}
              >
                Líneas de venta
              </h3>

              <div
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                {lineas.map((linea, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(21, 128, 61, 0.10)",
                      borderRadius: "20px",
                      padding: "18px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: "#14532d",
                        }}
                      >
                        Línea {index + 1}
                      </div>

                      {lineas.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => eliminarLinea(index)}
                          style={{
                            border: "none",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            background: "rgba(220, 38, 38, 0.10)",
                            color: "#b91c1c",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Quitar línea
                        </button>
                      ) : null}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Producto</label>
                        <select
                          value={linea.producto_id}
                          onChange={(e) =>
                            handleLineaChange(index, "producto_id", e.target.value)
                          }
                          style={inputStyle}
                        >
                          <option value="">Selecciona</option>
                          {productos.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                              {producto.nombre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={labelStyle}>Cantidad</label>
                        <input
                          type="number"
                          step="0.01"
                          value={linea.cantidad}
                          onChange={(e) =>
                            handleLineaChange(index, "cantidad", e.target.value)
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Precio unitario</label>
                        <input
                          type="number"
                          step="0.01"
                          value={linea.precio_unitario}
                          onChange={(e) =>
                            handleLineaChange(
                              index,
                              "precio_unitario",
                              e.target.value
                            )
                          }
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>Subtotal</label>
                        <input
                          type="text"
                          disabled
                          value={`${(
                            Number(linea.cantidad || 0) *
                            Number(linea.precio_unitario || 0)
                          ).toFixed(2)} €`}
                          style={{
                            ...inputStyle,
                            background: "#ecfdf3",
                            color: "#166534",
                            fontWeight: 800,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "space-between",
                gap: "14px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={agregarLinea}
                style={{
                  border: "1px solid rgba(21, 128, 61, 0.20)",
                  borderRadius: "18px",
                  padding: "14px 20px",
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#166534",
                  cursor: "pointer",
                  background: "#f0fdf4",
                }}
              >
                Añadir línea
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#14532d",
                  }}
                >
                  Total actual:{" "}
                  <span
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                    }}
                  >
                    {totalVenta.toFixed(2)} €
                  </span>
                </div>

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
                  Guardar venta
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* TABLAS */}
        <div
          style={{
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
                Listado de ventas
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Consulta rápida de las ventas registradas en el sistema.
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
                  { key: "codigo_venta", label: "Código" },
                  { key: "almacen", label: "Almacén" },
                  { key: "metodo_pago", label: "Pago" },
                  { key: "estado", label: "Estado" },
                  {
                    key: "total",
                    label: "Total",
                    render: (row) => `${Number(row.total || 0).toFixed(2)} €`,
                  },
                ]}
                data={ventas}
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
                Resumen diario
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Visualiza la actividad diaria y el total vendido por fecha.
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
                  { key: "fecha", label: "Fecha" },
                  { key: "numero_ventas", label: "Ventas" },
                  {
                    key: "total_vendido",
                    label: "Total",
                    render: (row) =>
                      `${Number(row.total_vendido || 0).toFixed(2)} €`,
                  },
                ]}
                data={resumenDiario}
              />
            </div>
          </div>
        </div>

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
                Resumen mensual
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Análisis mensual del volumen de ventas, totales y promedio por
                operación.
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
                  { key: "anio", label: "Año" },
                  { key: "mes", label: "Mes" },
                  { key: "numero_ventas", label: "Ventas" },
                  {
                    key: "total_vendido",
                    label: "Total vendido",
                    render: (row) =>
                      `${Number(row.total_vendido || 0).toFixed(2)} €`,
                  },
                  {
                    key: "promedio_venta",
                    label: "Promedio",
                    render: (row) =>
                      `${Number(row.promedio_venta || 0).toFixed(2)} €`,
                  },
                ]}
                data={resumenMensual}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}