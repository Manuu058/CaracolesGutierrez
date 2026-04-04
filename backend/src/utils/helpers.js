function generarCodigoVenta() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
  return `VTA-${y}${m}${d}-${rand}`;
}

function validarCamposRequeridos(campos = {}) {
  for (const [clave, valor] of Object.entries(campos)) {
    if (valor === undefined || valor === null || valor === "") {
      return `El campo ${clave} es obligatorio`;
    }
  }
  return null;
}

module.exports = {
  generarCodigoVenta,
  validarCamposRequeridos,
};