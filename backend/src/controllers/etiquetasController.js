const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function texto(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
}

function obtenerUsuario(req) {
  const usuario = req.usuario || {};
  return {
    id: usuario.id || usuario.usuario_id || null,
    nombre:
      usuario.nombre ||
      usuario.username ||
      usuario.usuario ||
      usuario.email ||
      "Usuario",
  };
}

// =======================
// PLANTILLAS
// =======================

async function listarPlantillas(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        p.*,
        i.nombre AS impresora_nombre
       FROM plantillas_etiquetas p
       LEFT JOIN impresoras_etiquetas i ON i.id = p.impresora_id
       ORDER BY p.activa DESC, p.nombre ASC`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Error al listar plantillas:", error);
    return res.status(500).json({ error: "Error al listar plantillas" });
  }
}

async function obtenerPlantilla(req, res) {
  try {
    const id = numero(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "ID de plantilla no válido" });
    }

    const [rows] = await pool.query(
      `SELECT
        p.*,
        i.nombre AS impresora_nombre
       FROM plantillas_etiquetas p
       LEFT JOIN impresoras_etiquetas i ON i.id = p.impresora_id
       WHERE p.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener plantilla:", error);
    return res.status(500).json({ error: "Error al obtener plantilla" });
  }
}

async function descargarArchivoPlantilla(req, res) {
  try {
    const id = numero(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "ID de plantilla no válido" });
    }

    const [rows] = await pool.query(
      `SELECT id, archivo_nombre, archivo_ruta
       FROM plantillas_etiquetas
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    const plantilla = rows[0];
    const rutaAbsoluta = path.resolve(plantilla.archivo_ruta);

    if (!fs.existsSync(rutaAbsoluta)) {
      return res
        .status(404)
        .json({ error: "El archivo de la plantilla no existe en el servidor" });
    }

    return res.download(rutaAbsoluta, plantilla.archivo_nombre);
  } catch (error) {
    console.error("Error al descargar archivo de plantilla:", error);
    return res
      .status(500)
      .json({ error: "Error al descargar el archivo de plantilla" });
  }
}

async function crearPlantilla(req, res) {
  try {
    const nombre = texto(req.body.nombre);
    const descripcion = texto(req.body.descripcion);
    const tipo_etiqueta = texto(req.body.tipo_etiqueta);
    const campo_variable = texto(req.body.campo_variable) || "LOTE";
    const impresora_id = req.body.impresora_id
      ? numero(req.body.impresora_id)
      : null;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Debes subir un archivo .ezp" });
    }

    const archivo_nombre = req.file.originalname || req.file.filename;
    const archivo_ruta = req.file.path.replace(/\\/g, "/");

    const [result] = await pool.query(
      `INSERT INTO plantillas_etiquetas
       (nombre, descripcion, tipo_etiqueta, archivo_nombre, archivo_ruta, campo_variable, impresora_id, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        nombre,
        descripcion || null,
        tipo_etiqueta || null,
        archivo_nombre,
        archivo_ruta,
        campo_variable,
        impresora_id || null,
      ]
    );

    return res.status(201).json({
      ok: true,
      id: result.insertId,
      mensaje: "Plantilla creada correctamente",
    });
  } catch (error) {
    console.error("Error al crear plantilla:", error);
    return res.status(500).json({ error: "Error al crear plantilla" });
  }
}

async function actualizarPlantilla(req, res) {
  try {
    const id = numero(req.params.id);
    const nombre = texto(req.body.nombre);
    const descripcion = texto(req.body.descripcion);
    const tipo_etiqueta = texto(req.body.tipo_etiqueta);
    const campo_variable = texto(req.body.campo_variable) || "LOTE";
    const impresora_id = req.body.impresora_id
      ? numero(req.body.impresora_id)
      : null;

    if (!id) {
      return res.status(400).json({ error: "ID de plantilla no válido" });
    }

    if (!nombre) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const [rows] = await pool.query(
      `SELECT id FROM plantillas_etiquetas WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    await pool.query(
      `UPDATE plantillas_etiquetas
       SET nombre = ?, descripcion = ?, tipo_etiqueta = ?, campo_variable = ?, impresora_id = ?
       WHERE id = ?`,
      [
        nombre,
        descripcion || null,
        tipo_etiqueta || null,
        campo_variable,
        impresora_id || null,
        id,
      ]
    );

    return res.json({
      ok: true,
      mensaje: "Plantilla actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar plantilla:", error);
    return res.status(500).json({ error: "Error al actualizar plantilla" });
  }
}

async function cambiarEstadoPlantilla(req, res) {
  try {
    const id = numero(req.params.id);
    const activa = req.body.activa ? 1 : 0;

    if (!id) {
      return res.status(400).json({ error: "ID de plantilla no válido" });
    }

    await pool.query(
      `UPDATE plantillas_etiquetas
       SET activa = ?
       WHERE id = ?`,
      [activa, id]
    );

    return res.json({
      ok: true,
      mensaje: activa ? "Plantilla activada" : "Plantilla desactivada",
    });
  } catch (error) {
    console.error("Error al cambiar estado de plantilla:", error);
    return res
      .status(500)
      .json({ error: "Error al cambiar estado de plantilla" });
  }
}

// =======================
// CREAR TRABAJO DE IMPRESION
// =======================

async function crearTrabajoImpresion(req, res) {
  try {
    const plantilla_id = numero(req.body.plantilla_id);
    const lote = texto(req.body.lote);
    const cantidad = numero(req.body.cantidad);
    const impresora_id = req.body.impresora_id
      ? numero(req.body.impresora_id)
      : null;

    if (!plantilla_id) {
      return res.status(400).json({ error: "Selecciona una plantilla válida" });
    }

    if (!lote) {
      return res.status(400).json({ error: "El lote es obligatorio" });
    }

    if (!cantidad || cantidad <= 0) {
      return res
        .status(400)
        .json({ error: "La cantidad debe ser mayor que cero" });
    }

    const [plantillas] = await pool.query(
      `SELECT
        p.*,
        i.nombre AS impresora_nombre
       FROM plantillas_etiquetas p
       LEFT JOIN impresoras_etiquetas i ON i.id = p.impresora_id
       WHERE p.id = ?`,
      [plantilla_id]
    );

    if (!plantillas.length) {
      return res.status(404).json({ error: "Plantilla no encontrada" });
    }

    const plantilla = plantillas[0];

    if (Number(plantilla.activa) !== 1) {
      return res.status(400).json({ error: "La plantilla está inactiva" });
    }

    let impresoraFinalId = impresora_id || plantilla.impresora_id || null;
    let impresoraFinalNombre = plantilla.impresora_nombre || null;

    if (impresoraFinalId) {
      const [impresoras] = await pool.query(
        `SELECT id, nombre, activa
         FROM impresoras_etiquetas
         WHERE id = ?`,
        [impresoraFinalId]
      );

      if (!impresoras.length) {
        return res
          .status(400)
          .json({ error: "La impresora seleccionada no existe" });
      }

      if (Number(impresoras[0].activa) !== 1) {
        return res
          .status(400)
          .json({ error: "La impresora seleccionada no está activa" });
      }

      impresoraFinalNombre = impresoras[0].nombre;
    }

    const usuario = obtenerUsuario(req);

    const [result] = await pool.query(
      `INSERT INTO historial_impresiones_etiquetas
       (plantilla_id, usuario_id, usuario_nombre, lote, cantidad, impresora_id, impresora_nombre, estado, mensaje_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDIENTE', NULL)`,
      [
        plantilla_id,
        usuario.id,
        usuario.nombre,
        lote,
        cantidad,
        impresoraFinalId,
        impresoraFinalNombre,
      ]
    );

    return res.json({
      ok: true,
      id: result.insertId,
      mensaje: "Trabajo de impresión creado correctamente",
    });
  } catch (error) {
    console.error("Error al crear trabajo de impresión:", error);
    return res
      .status(500)
      .json({ error: "Error al crear el trabajo de impresión" });
  }
}

// =======================
// HISTORIAL
// =======================

async function historial(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        h.*,
        p.nombre AS plantilla
      FROM historial_impresiones_etiquetas h
      JOIN plantillas_etiquetas p ON p.id = h.plantilla_id
      ORDER BY h.fecha_impresion DESC, h.id DESC
    `);

    return res.json(rows);
  } catch (error) {
    console.error("Error al listar historial:", error);
    return res.status(500).json({ error: "Error al listar historial" });
  }
}

// =======================
// AGENTE LOCAL
// =======================

async function obtenerSiguienteTrabajo(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        h.id,
        h.plantilla_id,
        h.lote,
        h.cantidad,
        h.impresora_id,
        h.impresora_nombre,
        h.estado,
        p.nombre AS plantilla_nombre,
        p.archivo_nombre,
        p.archivo_ruta,
        p.campo_variable
       FROM historial_impresiones_etiquetas h
       INNER JOIN plantillas_etiquetas p ON p.id = h.plantilla_id
       WHERE h.estado = 'PENDIENTE'
       ORDER BY h.id ASC
       LIMIT 1`
    );

    if (!rows.length) {
      return res.json({ ok: true, trabajo: null });
    }

    return res.json({
      ok: true,
      trabajo: rows[0],
    });
  } catch (error) {
    console.error("Error al obtener siguiente trabajo:", error);
    return res.status(500).json({ error: "Error al obtener siguiente trabajo" });
  }
}

async function marcarTrabajoProcesando(req, res) {
  try {
    const id = numero(req.params.id);
    const agente_nombre = texto(req.body.agente_nombre) || "Agente local";

    if (!id) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const [rows] = await pool.query(
      `SELECT id, estado
       FROM historial_impresiones_etiquetas
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Trabajo no encontrado" });
    }

    if (rows[0].estado !== "PENDIENTE") {
      return res
        .status(400)
        .json({ error: "El trabajo ya no está pendiente" });
    }

    await pool.query(
      `UPDATE historial_impresiones_etiquetas
       SET estado = 'PROCESANDO',
           agente_nombre = ?
       WHERE id = ?`,
      [agente_nombre, id]
    );

    return res.json({
      ok: true,
      mensaje: "Trabajo marcado como procesando",
    });
  } catch (error) {
    console.error("Error al marcar trabajo como procesando:", error);
    return res
      .status(500)
      .json({ error: "Error al marcar trabajo como procesando" });
  }
}

async function finalizarTrabajo(req, res) {
  try {
    const id = numero(req.params.id);
    const estado = texto(req.body.estado);
    const mensaje_error = texto(req.body.mensaje_error);
    const archivo_generado_ruta = texto(req.body.archivo_generado_ruta);

    if (!id) {
      return res.status(400).json({ error: "ID no válido" });
    }

    if (!["IMPRESA", "ERROR"].includes(estado)) {
      return res.status(400).json({ error: "Estado final no válido" });
    }

    await pool.query(
      `UPDATE historial_impresiones_etiquetas
       SET estado = ?,
           mensaje_error = ?,
           archivo_generado_ruta = ?,
           procesada_en = NOW()
       WHERE id = ?`,
      [estado, mensaje_error || null, archivo_generado_ruta || null, id]
    );

    return res.json({
      ok: true,
      mensaje: "Trabajo finalizado correctamente",
    });
  } catch (error) {
    console.error("Error al finalizar trabajo:", error);
    return res.status(500).json({ error: "Error al finalizar trabajo" });
  }
}

module.exports = {
  listarPlantillas,
  obtenerPlantilla,
  descargarArchivoPlantilla,
  crearPlantilla,
  actualizarPlantilla,
  cambiarEstadoPlantilla,
  crearTrabajoImpresion,
  historial,
  obtenerSiguienteTrabajo,
  marcarTrabajoProcesando,
  finalizarTrabajo,
};