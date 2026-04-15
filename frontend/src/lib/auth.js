export function guardarSesion(data) {
  if (typeof window === "undefined") return;

  const token = data?.token;
  const usuario = data?.usuario;

  console.log("DATOS RECIBIDOS EN guardarSesion:", data);
  console.log("TOKEN A GUARDAR:", token);
  console.log("USUARIO A GUARDAR:", usuario);

  if (!token) {
    throw new Error("No se recibió el token al guardar la sesión");
  }

  localStorage.setItem("token", token);

  if (usuario) {
    localStorage.setItem("usuario", JSON.stringify(usuario));
  }

  console.log("TOKEN GUARDADO EN LOCALSTORAGE:", localStorage.getItem("token"));
  console.log("USUARIO GUARDADO EN LOCALSTORAGE:", localStorage.getItem("usuario"));
}

export function obtenerToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function obtenerUsuario() {
  if (typeof window === "undefined") return null;

  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
}

export function cerrarSesion() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  }
}