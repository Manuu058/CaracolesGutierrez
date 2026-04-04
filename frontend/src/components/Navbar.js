"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion, obtenerUsuario } from "../lib/auth";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setUsuario(obtenerUsuario());
  }, []);

  // 🔥 OCULTAR NAVBAR EN LOGIN
  if (pathname === "/login") return null;

  const modulos = [
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Ventas", ruta: "/ventas" },
    { nombre: "Trazabilidad", ruta: "/trazabilidad" },
    { nombre: "Vehículos", ruta: "/vehiculos" },
  ];

  return (
    <header
      style={{
        background:
          "linear-gradient(135deg, rgba(10,44,24,0.95) 0%, rgba(18,84,46,0.95) 45%, rgba(36,122,68,0.92) 100%)",
        padding: "20px 26px",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: "20px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* IZQUIERDA */}
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>
            Caracoles Gutiérrez S.L.
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.8 }}>
            Sistema empresarial
          </p>
        </div>

        {/* LOGO */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Image
            src="/LogotipoEmpresaColor.png"
            alt="logo"
            width={120}
            height={120}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* DERECHA */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ☰ Menú
            </button>

            {menuAbierto && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  right: 0,
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "10px",
                  width: "220px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                  border: "1px solid rgba(21, 128, 61, 0.10)",
                }}
              >
                {modulos.map((m, i) => (
                  <Link
                    key={i}
                    href={m.ruta}
                    onClick={() => setMenuAbierto(false)}
                    style={{
                      display: "block",
                      padding: "10px",
                      borderRadius: "10px",
                      textDecoration: "none",
                      color: "#14532d",
                      fontWeight: 600,
                      background: "#f0fdf4",
                      marginBottom: i !== modulos.length - 1 ? "6px" : "0",
                    }}
                  >
                    {m.nombre}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontWeight: 600 }}>
              {usuario?.nombre || "Usuario"}
            </span>

            <button
              onClick={cerrarSesion}
              style={{
                background: "#ef4444",
                border: "none",
                borderRadius: "10px",
                padding: "8px 10px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}