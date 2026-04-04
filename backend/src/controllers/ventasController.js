const pool = require("../config/db");
const {
  generarCodigoVenta,
  validarCamposRequeridos,
} = require("../utils/helpers");

async function listar(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vw_ventas_detalle
       ORDER BY fecha_hora DESC, venta_id DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar ventas" });
  }
}

async function obtener(req, res) {
  const conn = await pool.getConnection();

  try {
    const [ventas] = await conn.query(
      `SELECT v.*, a.nombre AS almacen, mp.nombre AS metodo_pago, c.nombre AS cliente
       FROM ventas v
       INNER JOIN almacenes a ON a.id = v.almacen_id
       INNER JOIN metodos_pago mp ON mp.id = v.metodo_pago_id
       LEFT JOIN clientes c ON c.id = v.cliente_id
       WHERE v.id = ?`,
      [req.params.id]
    );

    if (ventas.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const [lineas] = await conn.query(
      `SELECT lv.*, p.nombre AS producto
       FROM lineas_venta lv
       INNER JOIN productos p ON p.id = lv.producto_id
       WHERE lv.venta_id = ?`,
      [req.params.id]
    );

    res.json({
      ...ventas[0],
      lineas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener venta" });
  } finally {
    conn.release();
  }
}

async function crear(req, res) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const { almacen_id, metodo_pago_id, observaciones, cliente_id, lineas } =
      req.body;

    const errorCampos = validarCamposRequeridos({
      almacen_id,
      metodo_pago_id,
    });

    if (errorCampos) {
      await conn.rollback();
      return res.status(400).json({ error: errorCampos });
    }

    if (!Array.isArray(lineas) || lineas.length === 0) {
      await conn.rollback();
      return res
        .status(400)
        .json({ error: "La venta debe tener al menos una línea" });
    }

    const codigoVenta = generarCodigoVenta();

    const [ventaResult] = await conn.query(
      `INSERT INTO ventas
       (codigo_venta, almacen_id, metodo_pago_id, observaciones, cliente_id, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        codigoVenta,
        almacen_id,
        metodo_pago_id,
        observaciones || null,
        cliente_id || null,
        req.usuario?.id || null,
      ]
    );

    const ventaId = ventaResult.insertId;

    for (const linea of lineas) {
      if (!linea.producto_id || !linea.cantidad || Number(linea.cantidad) <= 0) {
        throw new Error("Cada línea debe tener producto y cantidad válida");
      }

      await conn.query(
        `INSERT INTO lineas_venta
         (venta_id, producto_id, descripcion_producto, cantidad, precio_unitario, subtotal, lote_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ventaId,
          linea.producto_id,
          linea.descripcion_producto || null,
          Number(linea.cantidad),
          Number(linea.precio_unitario || 0),
          Number(linea.cantidad) * Number(linea.precio_unitario || 0),
          linea.lote_id || null,
        ]
      );
    }

    await conn.commit();

    res.status(201).json({
      message: "Venta creada",
      id: ventaId,
      codigo_venta: codigoVenta,
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({
      error: error.message || error.sqlMessage || "Error al crear venta",
    });
  } finally {
    conn.release();
  }
}

async function anular(req, res) {
  try {
    const { motivo_anulacion } = req.body;

    const [result] = await pool.query(
      `UPDATE ventas
       SET estado = 'ANULADA', motivo_anulacion = ?, anulada_en = NOW()
       WHERE id = ? AND estado = 'ACTIVA'`,
      [motivo_anulacion || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Venta no encontrada o ya anulada" });
    }

    res.json({ message: "Venta anulada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al anular venta" });
  }
}

async function resumenDiario(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vw_resumen_diario_ventas
       ORDER BY fecha DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen diario" });
  }
}

async function resumenMensual(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM vw_resumen_mensual_ventas
       ORDER BY anio DESC, mes DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen mensual" });
  }
}

async function generarCierre(req, res) {
  try {
    const fecha = req.body.fecha || new Date().toISOString().slice(0, 10);

    await pool.query(`CALL sp_generar_cierre_diario(?)`, [fecha]);

    const [rows] = await pool.query(
      `SELECT * FROM cierres_diarios WHERE fecha = ?`,
      [fecha]
    );

    res.json({
      message: "Cierre diario generado",
      cierre: rows[0] || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || "Error al generar cierre diario",
    });
  }
}

async function listarCierres(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM cierres_diarios
       ORDER BY fecha DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al listar cierres" });
  }
}

module.exports = {
  listar,
  obtener,
  crear,
  anular,
  resumenDiario,
  resumenMensual,
  generarCierre,
  listarCierres,
};