"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "../lib/api";
import SimpleTable from "../components/SimpleTable";

export default function HomePage() {
  const [dashboard, setDashboard] = useState({
    ventasHoy: { numeroVentas: 0, totalVendido: 0 },
    ultimasVentas: [],
    stockBajo: [],
    proximosMantenimientos: [],
  });

  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    try {
      setLoading(true);
      const { data } = await api.get("/dashboard");
      setDashboard(data);
    } catch (error) {
      console.error("Error al cargar dashboard:", error.response?.data || error.message);
      setDashboard({
        ventasHoy: { numeroVentas: 0, totalVendido: 0 },
        ultimasVentas: [],
        stockBajo: [],
        proximosMantenimientos: [],
      });
    } finally {
      setLoading(false);
    }
  }

  const cardGlass = {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  };

  const metricCards = [
    {
      title: "Ventas de hoy",
      value: dashboard.ventasHoy?.numeroVentas || 0,
      subtitle: "Número de operaciones registradas",
      icon: "🧾",
    },
    {
      title: "Total vendido hoy",
      value: `${Number(dashboard.ventasHoy?.totalVendido || 0).toFixed(2)} €`,
      subtitle: "Facturación diaria actual",
      icon: "💶",
    },
    {
      title: "Stock bajo",
      value: dashboard.stockBajo?.length || 0,
      subtitle: "Productos que necesitan reposición",
      icon: "📦",
    },
    {
      title: "Mantenimientos próximos",
      value: dashboard.proximosMantenimientos?.length || 0,
      subtitle: "Vehículos con revisión pendiente",
      icon: "🚚",
    },
  ];

  const modulos = [
    { nombre: "Panel principal", ruta: "/" },
    { nombre: "Ventas", ruta: "/ventas" },
    { nombre: "Trazabilidad", ruta: "/trazabilidad" },
    { nombre: "Vehículos", ruta: "/vehiculos" },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        paddingTop: "20px",
        background:
          "linear-gradient(135deg, #eefbf0 0%, #e3f5e7 20%, #d4edd8 45%, #c6e7cb 100%)",
        padding: "24px 20px 40px",
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
              🌿 Visión global del negocio
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: "40px",
                lineHeight: 1.08,
                fontWeight: 800,
                letterSpacing: "-1px",
              }}
            >
              Panel principal
            </h2>

            <p
              style={{
                marginTop: "14px",
                maxWidth: "920px",
                fontSize: "16px",
                lineHeight: 1.7,
                color: "rgba(240,255,244,0.92)",
              }}
            >
              Control general de la empresa con acceso rápido a ventas,
              trazabilidad y vehículos. Un panel más visual, elegante y pensado
              para trabajar rápido y con claridad.
            </p>
          </div>
        </section>

        {/* KPIS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "26px",
          }}
        >
          {metricCards.map((item, i) => (
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
                {item.icon}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#3b6b47",
                  marginBottom: "6px",
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  fontSize: typeof item.value === "string" ? "28px" : "34px",
                  fontWeight: 800,
                  color: "#123b20",
                  lineHeight: 1,
                  marginBottom: "8px",
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#5a7a63",
                  lineHeight: 1.5,
                }}
              >
                {item.subtitle}
              </div>
            </div>
          ))}
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
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#123b20",
                }}
              >
                Últimas ventas
              </h3>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Consulta rápida de las últimas operaciones registradas.
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
                  {
                    key: "total",
                    label: "Total",
                    render: (row) => `${Number(row.total || 0).toFixed(2)} €`,
                  },
                ]}
                data={dashboard.ultimasVentas || []}
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
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#123b20",
                }}
              >
                Stock bajo
              </h3>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Productos que necesitan atención o reposición.
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
                  { key: "unidad_medida", label: "Unidad" },
                  { key: "stock_total", label: "Stock" },
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
                          background: "rgba(239, 68, 68, 0.12)",
                          color: "#b91c1c",
                        }}
                      >
                        {row.estado_stock}
                      </span>
                    ),
                  },
                ]}
                data={dashboard.stockBajo || []}
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
              <h3
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "#123b20",
                }}
              >
                Próximos mantenimientos
              </h3>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#4e6f58",
                  fontSize: "14px",
                }}
              >
                Revisa los vehículos con mantenimientos vencidos o próximos.
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
                  { key: "tipo_mantenimiento", label: "Mantenimiento" },
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
                data={dashboard.proximosMantenimientos || []}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div
            style={{
              marginTop: "18px",
              padding: "14px 16px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.65)",
              color: "#14532d",
              fontWeight: 600,
              border: "1px solid rgba(21, 128, 61, 0.10)",
            }}
          >
            Cargando dashboard...
          </div>
        ) : null}
      </div>
    </main>
  );
}