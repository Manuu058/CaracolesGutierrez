"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion, obtenerUsuario } from "../lib/auth";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    setUsuario(obtenerUsuario());
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAbierto(null);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuAbierto(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setMenuAbierto(null);
  }, [pathname]);

  if (pathname === "/login") return null;

  const modulos = [
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Ventas", ruta: "/ventas" },
    { nombre: "Trazabilidad", ruta: "/trazabilidad" },
    { nombre: "Etiquetas", ruta: "/etiquetas" },
    { nombre: "Vehículos", ruta: "/vehiculos" },
    {
      nombre: "Registro",
      submodulos: [
        { nombre: "Clientes", ruta: "/clientes" },
        { nombre: "Proveedores", ruta: "/proveedores" },
        { nombre: "Trabajadores", ruta: "/trabajadores" },
        { nombre: "Usuarios", ruta: "/usuarios" },
      ],
    },
  ];

  const esActivo = (ruta) => pathname === ruta;

  const esPadreActivo = (submodulos) =>
    submodulos?.some((item) => pathname === item.ruta);

  function toggleMenu(nombre) {
    setMenuAbierto((prev) => (prev === nombre ? null : nombre));
  }

  const estilos = {
    header: {
      position: "sticky",
      top: 0,
      zIndex: 1000,
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(22, 101, 52, 0.10)",
      boxShadow: "0 10px 30px rgba(22, 101, 52, 0.06)",
    },
    container: {
      maxWidth: "1480px",
      margin: "0 auto",
      padding: "14px 22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "18px",
      flexWrap: "wrap",
    },
    logoWrap: {
      display: "flex",
      alignItems: "center",
      minWidth: "320px",
      flexShrink: 0,
    },
    logoCard: {
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "10px 16px",
      borderRadius: "18px",
      background: "linear-gradient(180deg, #ffffff 0%, #f8fcf6 100%)",
      border: "1px solid #dcefd1",
      boxShadow: "0 8px 22px rgba(22, 101, 52, 0.06)",
    },
    logoImageBox: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "54px",
      width: "220px",
      flexShrink: 0,
    },
    logoTextWrap: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      minWidth: "120px",
    },
    logoTitle: {
      margin: 0,
      fontSize: "16px",
      fontWeight: 800,
      color: "#111827",
      lineHeight: 1.1,
    },
    logoSub: {
      margin: "4px 0 0 0",
      fontSize: "12px",
      color: "#6b7280",
      fontWeight: 500,
    },
    nav: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      flex: 1,
      flexWrap: "wrap",
    },
    linkBase: {
      textDecoration: "none",
      padding: "11px 16px",
      borderRadius: "14px",
      fontSize: "14px",
      fontWeight: 700,
      transition: "all 0.22s ease",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "nowrap",
    },
    userArea: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "12px",
      minWidth: "280px",
      flexWrap: "wrap",
    },
    userCard: {
      padding: "10px 14px",
      borderRadius: "14px",
      background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
      border: "1px solid #e5e7eb",
      boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
      minWidth: "170px",
    },
    salirBtn: {
      border: "none",
      borderRadius: "14px",
      padding: "12px 18px",
      background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: "0 10px 20px rgba(22, 101, 52, 0.18)",
      transition: "all 0.2s ease",
    },
  };

  return (
    <header style={estilos.header}>
      <div style={estilos.container}>
        {/* IZQUIERDA - LOGO */}
        <div style={estilos.logoWrap}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={estilos.logoCard}>
              <div style={estilos.logoImageBox}>
                <Image
                  src="/logo.png"
                  alt="Caracoles Gutiérrez S.L."
                  width={220}
                  height={54}
                  priority
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div style={estilos.logoTextWrap}>
                <h1 style={estilos.logoTitle}>Caracoles Gutiérrez S.L.</h1>
                <p style={estilos.logoSub}>Sistema empresarial</p>
              </div>
            </div>
          </Link>
        </div>

        {/* CENTRO - MENÚ */}
        <nav ref={menuRef} style={estilos.nav}>
          {modulos.map((modulo) => {
            if (modulo.submodulos) {
              const activoPadre = esPadreActivo(modulo.submodulos);
              const abierto = menuAbierto === modulo.nombre;

              return (
                <div
                  key={modulo.nombre}
                  style={{ position: "relative" }}
                >
                  <button
                    type="button"
                    onClick={() => toggleMenu(modulo.nombre)}
                    style={{
                      ...estilos.linkBase,
                      color: activoPadre ? "#166534" : "#374151",
                      background: activoPadre
                        ? "linear-gradient(180deg, #ecfdf5 0%, #dcfce7 100%)"
                        : "transparent",
                      border: activoPadre
                        ? "1px solid #bbf7d0"
                        : "1px solid transparent",
                      boxShadow: activoPadre
                        ? "0 8px 18px rgba(22,101,52,0.08)"
                        : "none",
                      cursor: "pointer",
                    }}
                  >
                    {modulo.nombre}
                    <span
                      style={{
                        marginLeft: "8px",
                        fontSize: "11px",
                        transform: abierto ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        display: "inline-block",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {abierto && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "10px",
                        minWidth: "240px",
                        background: "rgba(255,255,255,0.98)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "18px",
                        boxShadow: "0 18px 34px rgba(0,0,0,0.10)",
                        padding: "10px",
                        zIndex: 2000,
                      }}
                    >
                      {modulo.submodulos.map((sub) => {
                        const activo = esActivo(sub.ruta);

                        return (
                          <Link
                            key={sub.ruta}
                            href={sub.ruta}
                            onClick={() => setMenuAbierto(null)}
                            style={{
                              display: "block",
                              textDecoration: "none",
                              padding: "11px 13px",
                              borderRadius: "12px",
                              fontSize: "14px",
                              fontWeight: activo ? 800 : 600,
                              color: activo ? "#166534" : "#374151",
                              background: activo
                                ? "linear-gradient(180deg, #ecfdf5 0%, #dcfce7 100%)"
                                : "transparent",
                              border: activo
                                ? "1px solid #bbf7d0"
                                : "1px solid transparent",
                              transition: "all 0.2s ease",
                            }}
                          >
                            {sub.nombre}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const activo = esActivo(modulo.ruta);

            return (
              <Link
                key={modulo.ruta}
                href={modulo.ruta}
                style={{
                  ...estilos.linkBase,
                  color: activo ? "#166534" : "#374151",
                  background: activo
                    ? "linear-gradient(180deg, #ecfdf5 0%, #dcfce7 100%)"
                    : "transparent",
                  border: activo
                    ? "1px solid #bbf7d0"
                    : "1px solid transparent",
                  boxShadow: activo
                    ? "0 8px 18px rgba(22,101,52,0.08)"
                    : "none",
                }}
              >
                {modulo.nombre}
              </Link>
            );
          })}
        </nav>

        {/* DERECHA - USUARIO */}
        <div style={estilos.userArea}>
          <div style={estilos.userCard}>
            <div
              style={{
                fontSize: "11px",
                color: "#6b7280",
                marginBottom: "3px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Usuario
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {usuario?.nombre || usuario?.username || "Sesión iniciada"}
            </div>
          </div>

          <button onClick={cerrarSesion} style={estilos.salirBtn}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}