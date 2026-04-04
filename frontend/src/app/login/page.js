"use client";

import { useState } from "react";
import api from "../../lib/api";
import { guardarSesion } from "../../lib/auth";

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

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0b1f16 0%, #123524 30%, #1b5e20 65%, #2e7d32 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 15% 20%, rgba(129, 199, 132, 0.18) 0%, transparent 25%), radial-gradient(circle at 85% 15%, rgba(165, 214, 167, 0.14) 0%, transparent 22%), radial-gradient(circle at 80% 80%, rgba(102, 187, 106, 0.14) 0%, transparent 25%), radial-gradient(circle at 20% 85%, rgba(200, 230, 201, 0.08) 0%, transparent 20%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.10)",
            border: "1px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "28px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
            padding: "34px 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background:
                  "linear-gradient(135deg, rgba(220,244,223,0.95), rgba(129,199,132,0.95))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "34px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.35)",
              }}
            >
              🐌
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#f4fff4",
                  lineHeight: 1.1,
                  letterSpacing: "-0.5px",
                }}
              >
                Acceso al sistema
              </h1>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "rgba(232, 245, 233, 0.88)",
                  fontSize: "15px",
                  fontWeight: 500,
                }}
              >
                Caracoles Gutiérrez S.L.
              </p>
            </div>
          </div>

          <div
            style={{
              marginBottom: "24px",
              padding: "14px 16px",
              borderRadius: "18px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#e8f5e9",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Gestiona ventas, trazabilidad y vehículos desde un entorno más claro,
            natural y profesional.
          </div>

          {error ? (
            <div
              style={{
                marginBottom: "18px",
                background: "rgba(211, 47, 47, 0.18)",
                border: "1px solid rgba(255, 138, 128, 0.35)",
                color: "#ffebee",
                padding: "12px 14px",
                borderRadius: "16px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="username"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#ecfdf3",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
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
                style={{
                  width: "100%",
                  padding: "15px 16px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  outline: "none",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "22px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#ecfdf3",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
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
                style={{
                  width: "100%",
                  padding: "15px 16px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  outline: "none",
                  fontSize: "15px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px 18px",
                borderRadius: "18px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                background: loading
                  ? "linear-gradient(135deg, #5c8f61, #6ba86f)"
                  : "linear-gradient(135deg, #66bb6a, #2e7d32)",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 700,
                boxShadow: "0 14px 30px rgba(46, 125, 50, 0.35)",
                transition: "all 0.2s ease",
                opacity: loading ? 0.85 : 1,
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div
            style={{
              marginTop: "22px",
              textAlign: "center",
              color: "rgba(232, 245, 233, 0.78)",
              fontSize: "13px",
            }}
          >
            Sistema de gestión empresarial · entorno seguro
          </div>
        </div>
      </div>
    </main>
  );
}