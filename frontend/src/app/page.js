"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";

export default function HomePage() {
  const [dashboard, setDashboard] = useState({
    ventasHoy: { numeroVentas: 0, totalVendido: 0 },
    ultimasVentas: [],
    stockBajo: [],
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
        ultimasVentas: [],
        stockBajo: [],
        proximosMantenimientos: [],
      });
    } finally {
      setLoading(false);
    }
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "#f5f7f6",
    padding: "28px 20px 40px",
  };

  const containerStyle = {
    maxWidth: "1400px",
    margin: "0 auto",
  };

  const sectionCard = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "22px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  };

  const tableContainerStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    overflow: "hidden",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    tableLayout: "fixed",
  };

  const thStyle = {
    textAlign: "left",
    padding: "18px 18px",
    fontSize: "14px",
    fontWeight: 800,
    color: "#111827",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    padding: "18px 18px",
    fontSize: "14px",
    color: "#374151",
    borderBottom: "1px solid #eef2f7",
    verticalAlign: "middle",
  };

  const emptyCellStyle = {
    padding: "22px 18px",
    fontSize: "15px",
    color: "#6b7280",
    textAlign: "center",
  };

  const metricCards = [
    {
      title: "Ventas de hoy",
      value: dashboard.ventasHoy?.numeroVentas || 0,
      subtitle: "Número de operaciones registradas hoy",
    },
    {
      title: "Facturación diaria",
      value: `${Number(dashboard.ventasHoy?.totalVendido || 0).toFixed(2)} €`,
      subtitle: "Importe total vendido en la jornada",
    },
    {
      title: "Stock bajo",
      value: dashboard.stockBajo?.length || 0,
      subtitle: "Productos pendientes de reposición",
    },
    {
      title: "Mantenimientos próximos",
      value: dashboard.proximosMantenimientos?.length || 0,
      subtitle: "Vehículos que requieren atención",
    },
  ];

  const accesos = [
    {
      nombre: "Ventas",
      ruta: "/ventas",
      descripcion: "Registrar ventas y consultar resúmenes diarios y mensuales",
    },
    {
      nombre: "Trazabilidad",
      ruta: "/trazabilidad",
      descripcion: "Controlar lotes, entradas, salidas y stock",
    },
    {
      nombre: "Vehículos",
      ruta: "/vehiculos",
      descripcion: "Gestionar la flota y los próximos mantenimientos",
    },
  ];

  function renderBadgeEstadoStock(estado) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "90px",
          padding: "8px 14px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 800,
          background: "#fef2f2",
          color: "#b91c1c",
          letterSpacing: "0.3px",
        }}
      >
        {estado || "BAJO"}
      </span>
    );
  }

  function renderBadgeEstadoFecha(estado) {
    const estilo =
      estado === "VENCIDO"
        ? {
            background: "#fef2f2",
            color: "#b91c1c",
          }
        : estado === "PROXIMO"
        ? {
            background: "#fff7ed",
            color: "#c2410c",
          }
        : {
            background: "#ecfdf5",
            color: "#166534",
          };

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "100px",
          padding: "8px 14px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.3px",
          ...estilo,
        }}
      >
        {estado || "EN FECHA"}
      </span>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        {/* CABECERA */}
        <section
          style={{
            ...sectionCard,
            padding: "28px",
            marginBottom: "22px",
          }}
        >
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
                  padding: "6px 12px",
                  borderRadius: "999px",
                  background: "#ecfdf5",
                  color: "#166534",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "14px",
                }}
              >
                Panel principal
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "34px",
                  lineHeight: 1.1,
                  fontWeight: 800,
                  color: "#111827",
                  letterSpacing: "-0.5px",
                }}
              >
                Vista general del negocio
              </h2>

              <p
                style={{
                  margin: "12px 0 0 0",
                  maxWidth: "760px",
                  color: "#6b7280",
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                Consulta los indicadores principales, revisa avisos importantes y
                entra rápidamente en los módulos principales desde un entorno
                mucho más claro, limpio y fácil de usar.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/ventas"
                style={{
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  background: "#166534",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "14px",
                  boxShadow: "0 10px 20px rgba(22, 101, 52, 0.15)",
                }}
              >
                Nueva venta
              </Link>

              <Link
                href="/trazabilidad"
                style={{
                  textDecoration: "none",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  background: "#f9fafb",
                  color: "#111827",
                  border: "1px solid #e5e7eb",
                  fontWeight: 700,
                  fontSize: "14px",
                }}
              >
                Ir a trazabilidad
              </Link>
            </div>
          </div>
        </section>

        {/* KPIS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {metricCards.map((item, index) => (
            <div
              key={index}
              style={{
                ...sectionCard,
                padding: "22px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#6b7280",
                  marginBottom: "10px",
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  fontSize: typeof item.value === "string" ? "28px" : "34px",
                  fontWeight: 800,
                  color: "#111827",
                  lineHeight: 1,
                  marginBottom: "10px",
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#6b7280",
                  lineHeight: 1.5,
                }}
              >
                {item.subtitle}
              </div>
            </div>
          ))}
        </section>

        {/* ACCESOS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          {accesos.map((item) => (
            <Link
              key={item.ruta}
              href={item.ruta}
              style={{
                ...sectionCard,
                textDecoration: "none",
                padding: "22px",
                display: "block",
              }}
            >
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: "10px",
                }}
              >
                {item.nombre}
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                {item.descripcion}
              </p>
            </Link>
          ))}
        </section>

        {/* TABLAS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          {/* STOCK BAJO */}
          <div
            style={{
              ...sectionCard,
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Stock bajo
              </h3>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Productos que necesitan reposición o control.
              </p>
            </div>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <colgroup>
                  <col style={{ width: "36%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "28%" }} />
                </colgroup>

                <thead>
                  <tr>
                    <th style={thStyle}>Producto</th>
                    <th style={thStyle}>Unidad</th>
                    <th style={thStyle}>Stock</th>
                    <th style={thStyle}>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {(dashboard.stockBajo || []).length > 0 ? (
                    dashboard.stockBajo
                      .filter((item) => item.producto !== "Caldo")
                      .map((item, index) => (
                      <tr key={index}>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#111827" }}>
                          {item.producto}
                        </td>
                        <td style={tdStyle}>{item.unidad_medida}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>
                          {Number(item.stock_total || 0).toFixed(2)}
                        </td>
                        <td style={tdStyle}>
                          {renderBadgeEstadoStock(item.estado_stock)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={emptyCellStyle}>
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MANTENIMIENTOS */}
          <div
            style={{
              ...sectionCard,
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "14px" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#111827",
                }}
              >
                Próximos mantenimientos
              </h3>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: 1.6,
                }}
              >
                Vehículos con revisión vencida, próxima o en fecha correcta.
              </p>
            </div>

            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "30%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "24%" }} />
                </colgroup>

                <thead>
                  <tr>
                    <th style={thStyle}>Matrícula</th>
                    <th style={thStyle}>Mantenimiento</th>
                    <th style={thStyle}>Próxima fecha</th>
                    <th style={thStyle}>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {(dashboard.proximosMantenimientos || []).length > 0 ? (
                    dashboard.proximosMantenimientos.map((item, index) => (
                      <tr key={index}>
                        <td style={{ ...tdStyle, fontWeight: 700, color: "#111827" }}>
                          {item.matricula}
                        </td>
                        <td style={tdStyle}>{item.tipo_mantenimiento}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>
                          {item.proxima_fecha}
                        </td>
                        <td style={tdStyle}>
                          {renderBadgeEstadoFecha(item.estado_fecha)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={emptyCellStyle}>
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {loading ? (
          <div
            style={{
              marginTop: "18px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Cargando panel...
          </div>
        ) : null}
      </div>
    </main>
  );
}