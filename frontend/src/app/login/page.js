"use client";

import { useState } from "react";
import api from "../../lib/api";
import { guardarSesion } from "../../lib/auth";
import Image from "next/image";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", form);
      console.log("LOGIN OK:", data);

      guardarSesion(data);

      const tokenGuardado = localStorage.getItem("token");
      const usuarioGuardado = localStorage.getItem("usuario");

      console.log("TOKEN LEIDO JUSTO DESPUES DE GUARDAR:", tokenGuardado);
      console.log("USUARIO LEIDO JUSTO DESPUES DE GUARDAR:", usuarioGuardado);

      if (!tokenGuardado) {
        setError("El token no se ha guardado en localStorage");
        return;
      }

      window.location.href = "/";
    } catch (err) {
      console.error("ERROR LOGIN COMPLETO:", err);
      console.error("RESPUESTA:", err.response);
      setError(err.response?.data?.error || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const mainStyle = {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #edf7e8 0%, #f6fbf3 45%, #eef7ea 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  };

  const wrapperStyle = {
    width: "100%",
    maxWidth: "1100px",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "24px",
    alignItems: "stretch",
  };

  const panelStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f7fcf4 55%, #eef8e9 100%)",
    border: "1px solid #dcefd1",
    borderRadius: "28px",
    boxShadow: "0 18px 40px rgba(22, 101, 52, 0.08)",
  };

  const leftPanelStyle = {
    ...panelStyle,
    padding: "38px 38px 34px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "620px",
  };

  const rightPanelStyle = {
    ...panelStyle,
    padding: "34px 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 700,
  };

  const inputStyle = {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "16px",
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    background: loading
      ? "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
      : "linear-gradient(135deg, #166534 0%, #15803d 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    boxShadow: "0 12px 24px rgba(22, 101, 52, 0.18)",
    opacity: loading ? 0.85 : 1,
  };

  const featureCard = {
    background: "#ffffff",
    border: "1px solid #e5efe0",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 8px 20px rgba(22, 101, 52, 0.05)",
  };

  return (
    <main style={mainStyle}>
      <div style={wrapperStyle}>
        <section style={leftPanelStyle}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "7px 12px",
                borderRadius: "999px",
                background: "#dcfce7",
                color: "#166534",
                fontSize: "12px",
                fontWeight: 800,
                marginBottom: "18px",
                border: "1px solid #bbf7d0",
              }}
            >
              Acceso al sistema
            </div>

            <div
              style={{
                marginBottom: "22px",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #dcefd1",
                  borderRadius: "20px",
                  padding: "14px 18px",
                  boxShadow: "0 10px 24px rgba(22, 101, 52, 0.06)",
                }}
              >
                <Image
                  src="/LogotipoEmpresaColor.png"
                  alt="Caracoles Gutiérrez S.L."
                  width={280}
                  height={80}
                  priority
                  style={{
                    width: "280px",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                lineHeight: 1.08,
                fontWeight: 800,
                color: "#111827",
                letterSpacing: "-0.8px",
                maxWidth: "680px",
              }}
            >
              Sistema de gestión empresarial
            </h1>

            <p
              style={{
                margin: "16px 0 0 0",
                maxWidth: "720px",
                color: "#6b7280",
                fontSize: "15px",
                lineHeight: 1.8,
              }}
            >
              Accede al panel principal para gestionar ventas, trazabilidad,
              vehículos, clientes, proveedores, trabajadores y usuarios desde una
              interfaz uniforme, profesional y clara.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "14px",
              marginTop: "28px",
            }}
          >
            <div style={featureCard}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: "6px",
                }}
              >
                Control centralizado
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: 1.65,
                }}
              >
                Toda la operativa diaria reunida en un solo sistema.
              </div>
            </div>

            <div style={featureCard}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: "6px",
                }}
              >
                Entorno profesional
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: 1.65,
                }}
              >
                Diseño visual coherente con el resto de módulos de la aplicación.
              </div>
            </div>

            <div style={featureCard}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#111827",
                  marginBottom: "6px",
                }}
              >
                Acceso seguro
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  lineHeight: 1.65,
                }}
              >
                Inicio de sesión con control de sesión y acceso autenticado.
              </div>
            </div>
          </div>
        </section>

        <section style={rightPanelStyle}>
          <div
            style={{
              maxWidth: "420px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#111827",
                  letterSpacing: "-0.5px",
                }}
              >
                Iniciar sesión
              </h2>

              <p
                style={{
                  margin: "10px 0 0 0",
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: 1.7,
                }}
              >
                Introduce tus credenciales para acceder al sistema.
              </p>
            </div>

            {error ? (
              <div
                style={{
                  marginBottom: "18px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "12px 14px",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="username" style={labelStyle}>
                  Usuario o email
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Introduce tu usuario"
                  autoComplete="username"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label htmlFor="password" style={labelStyle}>
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Introduce tu contraseña"
                  autoComplete="current-password"
                  style={inputStyle}
                />
              </div>

              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div
              style={{
                marginTop: "20px",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              Caracoles Gutiérrez S.L. · sistema empresarial
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}