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

  const esPadreActivo = (submodulos) => {
    return submodulos?.some((item) => pathname === item.ruta);
  };

  function toggleMenu(nombre) {
    setMenuAbierto((prev) => (prev === nombre ? null : nombre));
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 8px 20px rgba(22, 101, 52, 0.04)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: "260px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "#f0fdf4",
              border: "1px solid #dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <Image
              src="/LogotipoEmpresaColor.png"
              alt="Logo empresa"
              width={34}
              height={34}
              style={{ objectFit: "contain" }}
            />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.1,
              }}
            >
              Caracoles Gutiérrez S.L.
            </h1>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              Sistema empresarial
            </p>
          </div>
        </div>

        <nav
          ref={menuRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            flex: 1,
          }}
        >
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
                      textDecoration: "none",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: activoPadre ? 800 : 600,
                      color: activoPadre ? "#166534" : "#374151",
                      background: activoPadre ? "#ecfdf5" : "transparent",
                      border: activoPadre
                        ? "1px solid #bbf7d0"
                        : "1px solid transparent",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      boxShadow: activoPadre
                        ? "0 6px 16px rgba(22,101,52,0.08)"
                        : "none",
                    }}
                  >
                    {modulo.nombre} ▾
                  </button>

                  {abierto && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "8px",
                        minWidth: "220px",
                        background: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
                        padding: "8px",
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
                              padding: "10px 12px",
                              borderRadius: "10px",
                              fontSize: "14px",
                              fontWeight: activo ? 700 : 500,
                              color: activo ? "#166534" : "#374151",
                              background: activo ? "#ecfdf5" : "transparent",
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
                  textDecoration: "none",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: activo ? 800 : 600,
                  color: activo ? "#166534" : "#374151",
                  background: activo ? "#ecfdf5" : "transparent",
                  border: activo ? "1px solid #bbf7d0" : "1px solid transparent",
                  transition: "all 0.2s ease",
                  boxShadow: activo
                    ? "0 6px 16px rgba(22,101,52,0.08)"
                    : "none",
                }}
              >
                {modulo.nombre}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            minWidth: "260px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "12px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "2px",
              }}
            >
              Usuario
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {usuario?.nombre || usuario?.username || "Sesión iniciada"}
            </div>
          </div>

          <button
            onClick={cerrarSesion}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "12px 16px",
              background: "#166534",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(22, 101, 52, 0.18)",
              transition: "all 0.2s ease",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}