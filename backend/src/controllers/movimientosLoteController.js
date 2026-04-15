const pool = require("../config/db");
const { validarCamposRequeridos } = require("../utils/helpers");

function numeroSeguro(valor) {
  const n = Number(valor || 0);
  return Number.isNaN(n) ? 0 : n;
}

function textoSeguro(valor) {
  return String(valor || "").trim();
}

function obtenerMesDesdeFecha(fecha) {
  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  const f = new Date(fecha);
  if (Number.isNaN(f.getTime())) return "";
  return meses[f.getMonth()];
}

function detectarProductoId(caracoles, cabrillas) {
  const tieneCaracoles = numeroSeguro(caracoles) > 0;
  const tieneCabrillas = numeroSeguro(cabrillas) > 0;

  // AJUSTA ESTOS IDs SEGÚN TU TABLA productos
  if (tieneCaracoles && tieneCabrillas) return 3; // AMBAS
  if (tieneCaracoles) return 1; // CARACOLES
  if (tieneCabrillas) return 2; // CABRILLAS

  return 3;
}

async function recalcularStockLote(conn, loteId) {
  const [loteRows] = await conn.query(
    `SELECT
      id,
      cantidad_caracoles,
      cantidad_cabrillas
     FROM lotes
     WHERE id = ?`,
    [loteId]
  );

  if (loteRows.length === 0) {
    throw new Error("Lote no encontrado al recalcular stock");
  }

  const lote = loteRows[0];

  const [totalesRows] = await conn.query(
    `SELECT
      COALESCE(SUM(CASE WHEN tipo_movimiento = 'ENTRADA' THEN cantidad_caracoles ELSE 0 END), 0) AS total_entradas_caracoles,
      COALESCE(SUM(CASE WHEN tipo_movimiento = 'ENTRADA' THEN cantidad_cabrillas ELSE 0 END), 0) AS total_entradas_cabrillas,
      COALESCE(SUM(CASE WHEN tipo_movimiento = 'SALIDA' THEN cantidad_caracoles ELSE 0 END), 0) AS total_salidas_caracoles,
      COALESCE(SUM(CASE WHEN tipo_movimiento = 'SALIDA' THEN cantidad_cabrillas ELSE 0 END), 0) AS total_salidas_cabrillas
     FROM movimientos_lote
     WHERE lote_id = ?`,
    [loteId]
  );

  const totales = totalesRows[0];

  const stockCaracoles =
    numeroSeguro(lote.cantidad_caracoles) +
    numeroSeguro(totales.total_entradas_caracoles) -
    numeroSeguro(totales.total_salidas_caracoles);

  const stockCabrillas =
    numeroSeguro(lote.cantidad_cabrillas) +
    numeroSeguro(totales.total_entradas_cabrillas) -
    numeroSeguro(totales.total_salidas_cabrillas);

  if (stockCaracoles < 0 || stockCabrillas < 0) {
    throw new Error("No se puede dejar stock negativo");
  }

  await conn.query(
    `UPDATE lotes
     SET stock_caracoles = ?,
         stock_cabrillas = ?
     WHERE id = ?`,
    [stockCaracoles, stockCabrillas, loteId]
  );

  return {
    stock_caracoles: stockCaracoles,
    stock_cabrillas: stockCabrillas,
  };
}

async function buscarLotePorCodigo(conn, codigoLote) {
  const [rows] = await conn.query(
    `SELECT
      id,
      codigo_lote,
      producto,
      stock_caracoles,
      stock_cabrillas
     FROM lotes
     WHERE codigo_lote = ?
     LIMIT 1`,
    [codigoLote]
  );

  return rows.length ? rows[0] : null;
}

async function crearLoteAutomatico(conn, datos) {
  const {
    codigo_lote,
    proveedor_id,
    fecha,
    cantidad_caracoles,
    cantidad_cabrillas,
    numero_albaran,
  } = datos;

  const producto_id = detectarProductoId(cantidad_caracoles, cantidad_cabrillas);
  const mes = obtenerMesDesdeFecha(fecha);

  const [result] = await conn.query(
    `INSERT INTO lotes (
      codigo_lote,
      producto,
      proveedor_id,
      fecha_compra,
      mes,
      factura_compra,
      cantidad_caracoles,
      cantidad_cabrillas,
      stock_caracoles,
      stock_cabrillas
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      textoSeguro(codigo_lote),
      producto,
      Number(proveedor_id),
      fecha,
      mes,
      textoSeguro(numero_albaran) || null,
      0,
      0,
      0,
      0,
    ]
  );

  return {
    id: result.insertId,
    codigo_lote: textoSeguro(codigo_lote),
    producto,
    stock_caracoles: 0,
    stock_cabrillas: 0,
  };
}

async function listar(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        ml.id,
        ml.lote_id,
        ml.tipo_movimiento,
        ml.proveedor_id,
        ml.cliente_id,
        ml.fecha,
        ml.cantidad_caracoles,
        ml.cantidad_cabrillas,
        ml.numero_albaran,
        ml.descripcion,
        ml.usuario_id,
        l.codigo_lote,
        l.mes,
        l.producto,
        p.nombre AS proveedor,
        c.nombre AS cliente
      FROM movimientos_lote ml
      INNER JOIN lotes l ON l.id = ml.lote_id
      LEFT JOIN proveedores p ON p.id = ml.proveedor_id
      LEFT JOIN clientes c ON c.id = ml.cliente_id
      ORDER BY ml.fecha DESC, ml.id DESC`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Error al listar movimientos:", error);
    return res.status(500).json({
      error: "Error al listar movimientos",
    });
  }
}

async function crear(req, res) {
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const {
      lote_id,
      codigo_lote,
      tipo_movimiento,
      proveedor_id,
      cliente_id,
      fecha,
      cantidad_caracoles,
      cantidad_cabrillas,
      numero_albaran,
      descripcion,
    } = req.body;

    const tipo = textoSeguro(tipo_movimiento).toUpperCase();
    const codigoLote = textoSeguro(codigo_lote);
    const caracoles = numeroSeguro(cantidad_caracoles);
    const cabrillas = numeroSeguro(cantidad_cabrillas);

    const errorCampos = validarCamposRequeridos({
      tipo_movimiento: tipo,
      fecha,
    });

    if (errorCampos) {
      await conn.rollback();
      return res.status(400).json({ error: errorCampos });
    }

    if (!["ENTRADA", "SALIDA"].includes(tipo)) {
      await conn.rollback();
      return res.status(400).json({
        error: "El tipo de movimiento debe ser ENTRADA o SALIDA",
      });
    }

    if (caracoles < 0 || cabrillas < 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Las cantidades no pueden ser negativas",
      });
    }

    if (caracoles <= 0 && cabrillas <= 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Debes indicar al menos una cantidad de caracoles o cabrillas",
      });
    }

    if (tipo === "ENTRADA" && !proveedor_id) {
      await conn.rollback();
      return res.status(400).json({
        error: "Debes seleccionar un proveedor para una entrada",
      });
    }

    if (tipo === "SALIDA" && !cliente_id) {
      await conn.rollback();
      return res.status(400).json({
        error: "Debes seleccionar un cliente para una salida",
      });
    }

    let lote = null;
    let loteIdFinal = lote_id ? Number(lote_id) : null;

    if (tipo === "ENTRADA") {
      if (!codigoLote && !loteIdFinal) {
        await conn.rollback();
        return res.status(400).json({
          error: "Debes indicar un código de lote en la entrada",
        });
      }

      if (codigoLote) {
        lote = await buscarLotePorCodigo(conn, codigoLote);
      }

      if (!lote && loteIdFinal) {
        const [lotesPorId] = await conn.query(
          `SELECT
            id,
            codigo_lote,
            producto,
            stock_caracoles,
            stock_cabrillas
           FROM lotes
           WHERE id = ?
           LIMIT 1`,
          [loteIdFinal]
        );
        lote = lotesPorId.length ? lotesPorId[0] : null;
      }

      if (!lote) {
        lote = await crearLoteAutomatico(conn, {
          codigo_lote: codigoLote,
          proveedor_id,
          fecha,
          cantidad_caracoles: caracoles,
          cantidad_cabrillas: cabrillas,
          numero_albaran,
        });
      }

      loteIdFinal = Number(lote.id);
    }

    if (tipo === "SALIDA") {
      if (!loteIdFinal) {
        await conn.rollback();
        return res.status(400).json({
          error: "Debes seleccionar un lote existente para una salida",
        });
      }

      const [lotes] = await conn.query(
        `SELECT
          id,
          codigo_lote,
          producto,
          stock_caracoles,
          stock_cabrillas
        FROM lotes
        WHERE id = ?
        FOR UPDATE`,
        [loteIdFinal]
      );

      if (lotes.length === 0) {
        await conn.rollback();
        return res.status(404).json({
          error: "Lote no encontrado",
        });
      }

      lote = lotes[0];
    } else {
      const [lotes] = await conn.query(
        `SELECT
          id,
          codigo_lote,
          producto,
          stock_caracoles,
          stock_cabrillas
        FROM lotes
        WHERE id = ?
        FOR UPDATE`,
        [loteIdFinal]
      );

      if (lotes.length === 0) {
        await conn.rollback();
        return res.status(404).json({
          error: "Lote no encontrado",
        });
      }

      lote = lotes[0];
    }

    if (lote.producto === "CARACOLES" && cabrillas > 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Este lote es solo de caracoles",
      });
    }

    if (lote.producto === "CABRILLAS" && caracoles > 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "Este lote es solo de cabrillas",
      });
    }

    if (tipo === "SALIDA") {
      if (caracoles > numeroSeguro(lote.stock_caracoles)) {
        await conn.rollback();
        return res.status(400).json({
          error: "No hay suficiente stock de caracoles en ese lote",
        });
      }

      if (cabrillas > numeroSeguro(lote.stock_cabrillas)) {
        await conn.rollback();
        return res.status(400).json({
          error: "No hay suficiente stock de cabrillas en ese lote",
        });
      }
    }

    const [result] = await conn.query(
      `INSERT INTO movimientos_lote (
        lote_id,
        tipo_movimiento,
        proveedor_id,
        cliente_id,
        fecha,
        cantidad_caracoles,
        cantidad_cabrillas,
        numero_albaran,
        descripcion,
        usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(loteIdFinal),
        tipo,
        tipo === "ENTRADA" ? Number(proveedor_id) : null,
        tipo === "SALIDA" ? Number(cliente_id) : null,
        fecha,
        caracoles,
        cabrillas,
        numero_albaran || null,
        descripcion || null,
        req.usuario?.id || null,
      ]
    );

    await recalcularStockLote(conn, Number(loteIdFinal));
    await conn.commit();

    return res.status(201).json({
      message:
        tipo === "ENTRADA"
          ? "Entrada registrada correctamente"
          : "Salida registrada correctamente",
      id: result.insertId,
      lote_id: Number(loteIdFinal),
      codigo_lote: lote.codigo_lote,
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }

    console.error("Error al crear movimiento:", error);

    return res.status(500).json({
      error: error.sqlMessage || error.message || "Error al registrar el movimiento",
    });
  } finally {
    if (conn) conn.release();
  }
}

async function eliminar(req, res) {
  let conn;

  try {
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({
        error: "ID de movimiento no válido",
      });
    }

    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT
        id,
        lote_id
      FROM movimientos_lote
      WHERE id = ?
      FOR UPDATE`,
      [id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        error: "Movimiento no encontrado",
      });
    }

    const movimiento = rows[0];

    await conn.query(
      `DELETE FROM movimientos_lote WHERE id = ?`,
      [id]
    );

    await recalcularStockLote(conn, Number(movimiento.lote_id));
    await conn.commit();

    return res.json({
      message: "Movimiento eliminado correctamente",
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }

    console.error("Error al eliminar movimiento:", error);

    return res.status(500).json({
      error: error.sqlMessage || error.message || "Error al eliminar movimiento",
    });
  } finally {
    if (conn) conn.release();
  }
}

async function detallePorLote(req, res) {
  try {
    const loteId = Number(req.params.id);

    const [loteRows] = await pool.query(
      `SELECT
        l.id,
        l.codigo_lote,
        l.producto,
        l.proveedor_id,
        l.fecha_compra,
        l.mes,
        l.factura_compra,
        l.cantidad_caracoles,
        l.cantidad_cabrillas,
        l.stock_caracoles,
        l.stock_cabrillas,
        l.observaciones,
        l.estado,
        p.nombre AS proveedor
      FROM lotes l
      INNER JOIN proveedores p ON p.id = l.proveedor_id
      WHERE l.id = ?`,
      [loteId]
    );

    if (loteRows.length === 0) {
      return res.status(404).json({
        error: "Lote no encontrado",
      });
    }

    const lote = loteRows[0];

    const [historialRows] = await pool.query(
      `SELECT
        ml.id,
        ml.tipo_movimiento,
        ml.fecha,
        ml.numero_albaran,
        ml.cantidad_caracoles,
        ml.cantidad_cabrillas,
        ml.descripcion,
        p.nombre AS proveedor,
        c.nombre AS cliente
      FROM movimientos_lote ml
      LEFT JOIN proveedores p ON p.id = ml.proveedor_id
      LEFT JOIN clientes c ON c.id = ml.cliente_id
      WHERE ml.lote_id = ?
      ORDER BY ml.fecha DESC, ml.id DESC`,
      [loteId]
    );

    const [resumenRows] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'ENTRADA' THEN cantidad_caracoles ELSE 0 END), 0) AS total_entradas_caracoles,
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'ENTRADA' THEN cantidad_cabrillas ELSE 0 END), 0) AS total_entradas_cabrillas,
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'SALIDA' THEN cantidad_caracoles ELSE 0 END), 0) AS total_salidas_caracoles,
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'SALIDA' THEN cantidad_cabrillas ELSE 0 END), 0) AS total_salidas_cabrillas
      FROM movimientos_lote
      WHERE lote_id = ?`,
      [loteId]
    );

    const [clientesRows] = await pool.query(
      `SELECT
        c.id,
        c.nombre,
        COALESCE(SUM(ml.cantidad_caracoles), 0) AS total_caracoles,
        COALESCE(SUM(ml.cantidad_cabrillas), 0) AS total_cabrillas
      FROM movimientos_lote ml
      INNER JOIN clientes c ON c.id = ml.cliente_id
      WHERE ml.lote_id = ?
        AND ml.tipo_movimiento = 'SALIDA'
      GROUP BY c.id, c.nombre
      ORDER BY c.nombre ASC`,
      [loteId]
    );

    return res.json({
      lote,
      resumen: resumenRows[0],
      historial: historialRows,
      clientes: clientesRows,
    });
  } catch (error) {
    console.error("Error al obtener el detalle del lote:", error);
    return res.status(500).json({
      error: "Error al obtener el detalle del lote",
    });
  }
}

module.exports = {
  listar,
  crear,
  eliminar,
  detallePorLote,
};