"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";

export default function HomePage() {
  const [dashboard, setDashboard] = useState({
    ventasHoy: { numeroVentas: 0, totalVendido: 0 },
    proximosMantenimientos: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    try {
      setLoading(true);
      const { data } = await api.get("/dashboard");
      setDashboard(data);
    } catch (error) {
      console.error(
        "Error al cargar dashboard:",
        error.response?.data || error.message
      );
      setDashboard({
        ventasHoy: { numeroVentas: 0, totalVendido: 0 },
        proximosMantenimientos: [],
      });
    } finally {
      setLoading(false);
    }
  }

  const kpis = [
    {
      label: "Ventas hoy",
      value: dashboard.ventasHoy?.numeroVentas || 0,
      sub: "Operaciones registradas",
      color: "green",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <path
            d="M4 18l4-5 4 3 4-7 4 4"
            stroke="#166534"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Facturación",
      value: `${Number(dashboard.ventasHoy?.totalVendido || 0)
        .toFixed(2)
        .replace(".", ",")} €`,
      sub: "Importe total del día",
      color: "emerald",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <rect
            x="3"
            y="7"
            width="18"
            height="12"
            rx="3"
            stroke="#166534"
            strokeWidth="1.8"
          />
          <path
            d="M8 7V5.8A4 4 0 0 1 12 2a4 4 0 0 1 4 3.8V7"
            stroke="#166534"
            strokeWidth="1.8"
          />
        </svg>
      ),
    },
    {
      label: "Mantenimientos",
      value: dashboard.proximosMantenimientos?.length || 0,
      sub: "Vehículos pendientes",
      color: "orange",
      icon: (
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
          <rect
            x="3"
            y="4"
            width="18"
            height="17"
            rx="3"
            stroke="#b45309"
            strokeWidth="1.8"
          />
          <path
            d="M8 2v4M16 2v4M3 10h18"
            stroke="#b45309"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  const accesos = [
    {
      nombre: "Ventas",
      ruta: "/ventas",
      descripcion: "Registra ventas y consulta resúmenes diarios, semanales y mensuales",
      emoji: "🛒",
    },
    {
      nombre: "Trazabilidad",
      ruta: "/trazabilidad",
      descripcion: "Controla lotes, entradas, salidas y stock de mercancía",
      emoji: "📦",
    },
    {
      nombre: "Vehículos",
      ruta: "/vehiculos",
      descripcion: "Gestiona la flota, revisiones, averías y mantenimientos",
      emoji: "🚛",
    },
  ];

  function BadgeEstado({ estado }) {
    const styles = {
      VENCIDO: {
        background: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
      },
      PROXIMO: {
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fed7aa",
      },
      "EN FECHA": {
        background: "#ecfdf5",
        color: "#166534",
        border: "1px solid #bbf7d0",
      },
    };

    const style = styles[estado] || styles["EN FECHA"];

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 12px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.2px",
          ...style,
        }}
      >
        {estado || "EN FECHA"}
      </span>
    );
  }

  const iconBg = {
    green: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    emerald: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    orange: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 22px 50px",
        background:
          "linear-gradient(180deg, #edf7e8 0%, #f6fbf3 45%, #eef7ea 100%)",
        fontFamily: "var(--font-sans, sans-serif)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* CABECERA */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #ffffff 0%, #f7fcf4 50%, #eef8e9 100%)",
            borderRadius: "26px",
            border: "1px solid #d7ebcb",
            padding: "34px 34px 30px",
            marginBottom: "24px",
            boxShadow: "0 10px 30px rgba(22, 101, 52, 0.08)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-40px",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "rgba(134, 239, 172, 0.18)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-70px",
              left: "-50px",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "rgba(187, 247, 208, 0.18)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  height: "72px",
                  padding: "6px 12px",
                  background: "#ffffff",
                  borderRadius: "14px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                }}
              >
                <img
                  src="/logo.png"
                  alt="Caracoles Gutierrez"
                  style={{
                    height: "100%",
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.1px",
                    textTransform: "uppercase",
                    color: "#15803d",
                  }}
                >
                  Panel principal
                </p>
                <h1
                  style={{
                    fontSize: "30px",
                    lineHeight: 1.1,
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  Caracoles Gutiérrez S.L.
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "8px 0 0",
                    lineHeight: 1.6,
                  }}
                >
                  Gestión comercial, trazabilidad de lotes y control operativo
                  diario · Medina Sidonia, Cádiz · Sevilla
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: 700,
                  border: "1px solid #bbf7d0",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#16a34a",
                    display: "inline-block",
                    boxShadow: "0 0 0 4px rgba(34, 197, 94, 0.15)",
                  }}
                />
                Sistema en línea
              </span>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  href="/ventas"
                  style={{
                    padding: "12px 18px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
                  }}
                >
                  + Nueva venta
                </Link>
                <Link
                  href="/trazabilidad"
                  style={{
                    padding: "12px 18px",
                    borderRadius: "14px",
                    background: "#ffffff",
                    color: "#166534",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "1px solid #bbf7d0",
                    textDecoration: "none",
                    boxShadow: "0 6px 16px rgba(22, 101, 52, 0.06)",
                  }}
                >
                  Ir a trazabilidad
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: "#ffffff",
                borderRadius: "22px",
                border: "1px solid #dcefd1",
                padding: "24px",
                boxShadow: "0 8px 24px rgba(22, 101, 52, 0.05)",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: iconBg[kpi.color],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
              >
                {kpi.icon}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontWeight: 700,
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                {kpi.label}
              </div>

              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1.05,
                  marginBottom: "6px",
                }}
              >
                {kpi.value}
              </div>

              <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.5 }}>
                {kpi.sub}
              </div>
            </div>
          ))}
        </section>

        {/* ACCESOS RÁPIDOS */}
        <section
          style={{
            marginBottom: "24px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Módulos principales
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              Acceso rápido a las áreas más utilizadas del sistema
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {accesos.map((item) => (
              <Link
                key={item.ruta}
                href={item.ruta}
                style={{
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #fbfef9 100%)",
                  borderRadius: "22px",
                  border: "1px solid #dcefd1",
                  padding: "22px",
                  textDecoration: "none",
                  display: "block",
                  boxShadow: "0 8px 24px rgba(22, 101, 52, 0.05)",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "16px",
                    background: "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "14px",
                    border: "1px solid #d1fae5",
                  }}
                >
                  {item.emoji}
                </div>

                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "8px",
                  }}
                >
                  {item.nombre}
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: "13px",
                    lineHeight: 1.7,
                  }}
                >
                  {item.descripcion}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* TABLA MANTENIMIENTOS */}
        <section
          style={{
            background: "#ffffff",
            borderRadius: "22px",
            border: "1px solid #dcefd1",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(22, 101, 52, 0.05)",
          }}
        >
          <div
            style={{
              padding: "22px 24px 18px",
              borderBottom: "1px solid #edf6e8",
              background: "linear-gradient(180deg, #fcfefb 0%, #f7fcf5 100%)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "17px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Próximos mantenimientos
            </h3>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              Vehículos con revisión pendiente o próxima
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["Matrícula", "Tipo", "Fecha", "Estado"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 18px",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#6b7280",
                        background: "#f8fcf6",
                        textAlign: "left",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        borderBottom: "1px solid #edf6e8",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "28px",
                        fontSize: "14px",
                        color: "#6b7280",
                      }}
                    >
                      Cargando datos…
                    </td>
                  </tr>
                ) : (dashboard.proximosMantenimientos || []).length > 0 ? (
                  dashboard.proximosMantenimientos.map((item, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: "16px 18px",
                          fontSize: "14px",
                          color: "#111827",
                          fontWeight: 700,
                          borderBottom: "1px solid #f1f7ed",
                        }}
                      >
                        {item.matricula}
                      </td>
                      <td
                        style={{
                          padding: "16px 18px",
                          fontSize: "14px",
                          color: "#374151",
                          borderBottom: "1px solid #f1f7ed",
                        }}
                      >
                        {item.tipo_mantenimiento}
                      </td>
                      <td
                        style={{
                          padding: "16px 18px",
                          fontSize: "14px",
                          color: "#374151",
                          borderBottom: "1px solid #f1f7ed",
                        }}
                      >
                        {item.proxima_fecha}
                      </td>
                      <td
                        style={{
                          padding: "16px 18px",
                          borderBottom: "1px solid #f1f7ed",
                        }}
                      >
                        <BadgeEstado estado={item.estado_fecha} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        padding: "28px",
                        fontSize: "14px",
                        color: "#6b7280",
                      }}
                    >
                      Sin mantenimientos pendientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}