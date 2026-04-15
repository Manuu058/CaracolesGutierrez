const pool = require("../config/db");
const {
  generarCodigoVenta,
  validarCamposRequeridos,
} = require("../utils/helpers");

function numero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : 0;
}

function normalizarFecha(fecha) {
  if (!fecha) return new Date().toISOString().slice(0, 10);
  return String(fecha).slice(0, 10);
}

function obtenerNombreMes(numeroMes) {
  const meses = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
  };

  return meses[Number(numeroMes)] || "";
}

function detectarTipoProducto(nombre = "") {
  const texto = String(nombre).toLowerCase();

  if (texto.includes("cabrillas")) return "cabrillas";
  if (texto.includes("caracoles")) return "caracoles";

  return null;
}

function construirWhereVentas(query = {}) {
  const condiciones = [];
  const params = [];

  if (query.dia) {
    condiciones.push("DATE(v.fecha_hora) = ?");
    params.push(normalizarFecha(query.dia));
  } else {
    if (query.desde) {
      condiciones.push("DATE(v.fecha_hora) >= ?");
      params.push(normalizarFecha(query.desde));
    }
    if (query.hasta) {
      condiciones.push("DATE(v.fecha_hora) <= ?");
      params.push(normalizarFecha(query.hasta));
    }
  }

  if (query.almacen_id) {
    condiciones.push("v.almacen_id = ?");
    params.push(Number(query.almacen_id));
  }

  if (query.metodo_pago_id) {
    condiciones.push("v.metodo_pago_id = ?");
    params.push(Number(query.metodo_pago_id));
  }

  if (query.estado) {
    condiciones.push("v.estado = ?");
    params.push(query.estado);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
  return { where, params };
}

async function obtenerMapaProductos(conn, lineas = []) {
  const ids = [...new Set(lineas.map((l) => Number(l.producto_id)).filter(Boolean))];

  if (ids.length === 0) return new Map();

  const placeholders = ids.map(() => "?").join(", ");
  const [rows] = await conn.query(
    `
    SELECT id, nombre
    FROM productos
    WHERE id IN (${placeholders})
    `,
    ids
  );

  return new Map(rows.map((r) => [Number(r.id), r]));
}

async function calcularMovimientoBolsas(conn, lineas = []) {
  const productosMap = await obtenerMapaProductos(conn, lineas);

  let bolsasCaracoles = 0;
  let bolsasCabrillas = 0;

  for (const linea of lineas) {
    const producto = productosMap.get(Number(linea.producto_id));
    const tipo = detectarTipoProducto(
      producto?.nombre || linea.descripcion_producto || ""
    );
    const cantidad = numero(linea.cantidad);

    if (tipo === "caracoles") bolsasCaracoles += cantidad;
    if (tipo === "cabrillas") bolsasCabrillas += cantidad;
  }

  return {
    bolsasCaracoles,
    bolsasCabrillas,
  };
}

function calcularRestantes(stock) {
  const caracolesRestantes =
    numero(stock.bolsas_caracoles_iniciales) +
    numero(stock.bolsas_caracoles_repuestas) -
    numero(stock.bolsas_caracoles_vendidas);

  const cabrillasRestantes =
    numero(stock.bolsas_cabrillas_iniciales) +
    numero(stock.bolsas_cabrillas_repuestas) -
    numero(stock.bolsas_cabrillas_vendidas);

  return {
    caracolesRestantes,
    cabrillasRestantes,
  };
}

async function obtenerStockDiario(conn, fecha, almacenId) {
  const [rows] = await conn.query(
    `
    SELECT *
    FROM ventas_stock_diario
    WHERE fecha = ? AND almacen_id = ?
    LIMIT 1
    `,
    [fecha, Number(almacenId)]
  );

  return rows[0] || null;
}

async function actualizarResumenDiario(conn, fecha, almacenId) {
  const fechaNormalizada = normalizarFecha(fecha);
  const almacenIdNumero = Number(almacenId);

  const [rows] = await conn.query(
    `
    SELECT
      DATE(v.fecha_hora) AS fecha,
      v.almacen_id,
      COUNT(DISTINCT v.id) AS numero_ventas,
      COALESCE(SUM(lv.subtotal), 0) AS total_vendido,
      COALESCE(SUM(CASE WHEN LOWER(mp.nombre) = 'efectivo' THEN lv.subtotal ELSE 0 END), 0) AS total_efectivo,
      COALESCE(SUM(CASE WHEN LOWER(mp.nombre) = 'tarjeta' THEN lv.subtotal ELSE 0 END), 0) AS total_tarjeta,
      COALESCE(SUM(CASE WHEN LOWER(mp.nombre) = 'bizum' THEN lv.subtotal ELSE 0 END), 0) AS total_bizum,
      COALESCE(SUM(CASE WHEN LOWER(p.nombre) LIKE '%caracoles%' THEN lv.cantidad ELSE 0 END), 0) AS bolsas_caracoles_vendidas,
      COALESCE(SUM(CASE WHEN LOWER(p.nombre) LIKE '%cabrillas%' THEN lv.cantidad ELSE 0 END), 0) AS bolsas_cabrillas_vendidas
    FROM ventas v
    INNER JOIN metodos_pago mp ON mp.id = v.metodo_pago_id
    LEFT JOIN lineas_venta lv ON lv.venta_id = v.id
    LEFT JOIN productos p ON p.id = lv.producto_id
    WHERE DATE(v.fecha_hora) = ?
      AND v.almacen_id = ?
      AND v.estado = 'ACTIVA'
    GROUP BY DATE(v.fecha_hora), v.almacen_id
    `,
    [fechaNormalizada, almacenIdNumero]
  );

  const resumen = rows[0] || {
    fecha: fechaNormalizada,
    almacen_id: almacenIdNumero,
    numero_ventas: 0,
    total_vendido: 0,
    total_efectivo: 0,
    total_tarjeta: 0,
    total_bizum: 0,
    bolsas_caracoles_vendidas: 0,
    bolsas_cabrillas_vendidas: 0,
  };

  await conn.query(
    `
    INSERT INTO ventas_resumen_diario
    (
      fecha,
      almacen_id,
      numero_ventas,
      total_vendido,
      total_efectivo,
      total_tarjeta,
      total_bizum,
      bolsas_caracoles_vendidas,
      bolsas_cabrillas_vendidas
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      numero_ventas = VALUES(numero_ventas),
      total_vendido = VALUES(total_vendido),
      total_efectivo = VALUES(total_efectivo),
      total_tarjeta = VALUES(total_tarjeta),
      total_bizum = VALUES(total_bizum),
      bolsas_caracoles_vendidas = VALUES(bolsas_caracoles_vendidas),
      bolsas_cabrillas_vendidas = VALUES(bolsas_cabrillas_vendidas)
    `,
    [
      resumen.fecha,
      resumen.almacen_id,
      numero(resumen.numero_ventas),
      numero(resumen.total_vendido),
      numero(resumen.total_efectivo),
      numero(resumen.total_tarjeta),
      numero(resumen.total_bizum),
      numero(resumen.bolsas_caracoles_vendidas),
      numero(resumen.bolsas_cabrillas_vendidas),
    ]
  );

  await conn.query(
    `
    UPDATE ventas_stock_diario
    SET
      bolsas_caracoles_vendidas = ?,
      bolsas_cabrillas_vendidas = ?
    WHERE fecha = ? AND almacen_id = ?
    `,
    [
      numero(resumen.bolsas_caracoles_vendidas),
      numero(resumen.bolsas_cabrillas_vendidas),
      fechaNormalizada,
      almacenIdNumero,
    ]
  );
}

async function listar(req, res) {
  try {
    const { where, params } = construirWhereVentas(req.query);

    const [rows] = await pool.query(
      `
      SELECT
        v.id,
        v.codigo_venta,
        v.fecha_hora,
        DATE(v.fecha_hora) AS fecha,
        TIME(v.fecha_hora) AS hora,
        a.nombre AS almacen,
        mp.nombre AS metodo_pago,
        v.estado,
        COALESCE(SUM(lv.subtotal), 0) AS total,
        GROUP_CONCAT(
          CONCAT(
            p.nombre,
            ' | Cantidad: ',
            lv.cantidad,
            ' | Precio: ',
            FORMAT(lv.precio_unitario, 2),
            ' €'
          )
          SEPARATOR ' || '
        ) AS detalle_productos
      FROM ventas v
      INNER JOIN almacenes a ON a.id = v.almacen_id
      INNER JOIN metodos_pago mp ON mp.id = v.metodo_pago_id
      LEFT JOIN lineas_venta lv ON lv.venta_id = v.id
      LEFT JOIN productos p ON p.id = lv.producto_id
      ${where}
      GROUP BY
        v.id,
        v.codigo_venta,
        v.fecha_hora,
        a.nombre,
        mp.nombre,
        v.estado
      ORDER BY v.fecha_hora DESC, v.id DESC
      `,
      params
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
      `
      SELECT
        v.id,
        v.codigo_venta,
        v.fecha_hora,
        v.almacen_id,
        v.metodo_pago_id,
        v.observaciones,
        v.cliente_id,
        v.usuario_id,
        v.estado,
        v.motivo_anulacion,
        v.anulada_en,
        a.nombre AS almacen,
        mp.nombre AS metodo_pago,
        c.nombre AS cliente,
        COALESCE(SUM(lv.subtotal), 0) AS total
      FROM ventas v
      INNER JOIN almacenes a ON a.id = v.almacen_id
      INNER JOIN metodos_pago mp ON mp.id = v.metodo_pago_id
      LEFT JOIN clientes c ON c.id = v.cliente_id
      LEFT JOIN lineas_venta lv ON lv.venta_id = v.id
      WHERE v.id = ?
      GROUP BY
        v.id,
        v.codigo_venta,
        v.fecha_hora,
        v.almacen_id,
        v.metodo_pago_id,
        v.observaciones,
        v.cliente_id,
        v.usuario_id,
        v.estado,
        v.motivo_anulacion,
        v.anulada_en,
        a.nombre,
        mp.nombre,
        c.nombre
      `,
      [req.params.id]
    );

    if (ventas.length === 0) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const [lineas] = await conn.query(
      `
      SELECT
        lv.id,
        lv.venta_id,
        lv.producto_id,
        lv.descripcion_producto,
        lv.cantidad,
        lv.precio_unitario,
        lv.subtotal,
        p.nombre AS producto
      FROM lineas_venta lv
      INNER JOIN productos p ON p.id = lv.producto_id
      WHERE lv.venta_id = ?
      ORDER BY lv.id ASC
      `,
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

async function comenzarVentaDiaria(req, res) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const fecha = normalizarFecha(req.body.fecha);
    const almacen_id = Number(req.body.almacen_id);
    const bolsas_caracoles = numero(req.body.bolsas_caracoles);
    const bolsas_cabrillas = numero(req.body.bolsas_cabrillas);
    const precio_caracoles = numero(req.body.precio_caracoles);
    const precio_cabrillas = numero(req.body.precio_cabrillas);

    console.log("COMENZAR DIA:", {
      fecha,
      almacen_id,
      bolsas_caracoles,
      bolsas_cabrillas,
      precio_caracoles,
      precio_cabrillas,
    });

    const errorCampos = validarCamposRequeridos({
      almacen_id,
      bolsas_caracoles,
      bolsas_cabrillas,
      precio_caracoles,
      precio_cabrillas,
    });

    if (errorCampos) {
      await conn.rollback();
      return res.status(400).json({ error: errorCampos });
    }

    const existente = await obtenerStockDiario(conn, fecha, almacen_id);

    if (existente) {
      await conn.rollback();
      return res.status(400).json({
        error: "La venta diaria ya está comenzada para ese almacén y fecha",
      });
    }

    await conn.query(
      `
      INSERT INTO ventas_stock_diario
      (
        fecha,
        almacen_id,
        bolsas_caracoles_iniciales,
        bolsas_cabrillas_iniciales,
        precio_caracoles,
        precio_cabrillas
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        fecha,
        almacen_id,
        bolsas_caracoles,
        bolsas_cabrillas,
        precio_caracoles,
        precio_cabrillas,
      ]
    );

    await actualizarResumenDiario(conn, fecha, almacen_id);
    await conn.commit();

    res.status(201).json({
      message: "Venta diaria comenzada correctamente",
    });
  } catch (error) {
    await conn.rollback();
    console.error("ERROR EN COMENZAR DIA:", error);
    res.status(500).json({
      error: error.sqlMessage || error.message || "Error al comenzar venta diaria",
    });
  } finally {
    conn.release();
  }
}

async function registrarReposicion(req, res) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const fecha = normalizarFecha(req.body.fecha);
    const almacen_id = Number(req.body.almacen_id);
    const bolsas_caracoles = numero(req.body.bolsas_caracoles);
    const bolsas_cabrillas = numero(req.body.bolsas_cabrillas);

    const stock = await obtenerStockDiario(conn, fecha, almacen_id);

    if (!stock) {
      await conn.rollback();
      return res.status(400).json({
        error: "Primero debes pulsar 'Comenzar venta diaria' en ese almacén",
      });
    }

    await conn.query(
      `
      UPDATE ventas_stock_diario
      SET
        bolsas_caracoles_repuestas = bolsas_caracoles_repuestas + ?,
        bolsas_cabrillas_repuestas = bolsas_cabrillas_repuestas + ?
      WHERE fecha = ? AND almacen_id = ?
      `,
      [bolsas_caracoles, bolsas_cabrillas, fecha, almacen_id]
    );

    await actualizarResumenDiario(conn, fecha, almacen_id);
    await conn.commit();

    res.json({
      message: "Reposición registrada correctamente",
    });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({
      error: error.sqlMessage || error.message || "Error al registrar reposición",
    });
  } finally {
    conn.release();
  }
}

async function obtenerEstadoDiario(req, res) {
  try {
    const fecha = normalizarFecha(req.query.fecha);
    const almacenId = req.query.almacen_id ? Number(req.query.almacen_id) : null;

    const params = [fecha];
    let extraWhere = "";

    if (almacenId) {
      extraWhere = "AND s.almacen_id = ?";
      params.push(almacenId);
    }

    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        s.fecha,
        s.almacen_id,
        a.nombre AS almacen,
        s.bolsas_caracoles_iniciales,
        s.bolsas_cabrillas_iniciales,
        s.bolsas_caracoles_repuestas,
        s.bolsas_cabrillas_repuestas,
        s.bolsas_caracoles_vendidas,
        s.bolsas_cabrillas_vendidas,
        s.precio_caracoles,
        s.precio_cabrillas,
        (
          COALESCE(s.bolsas_caracoles_iniciales, 0) +
          COALESCE(s.bolsas_caracoles_repuestas, 0) -
          COALESCE(s.bolsas_caracoles_vendidas, 0)
        ) AS bolsas_caracoles_restantes,
        (
          COALESCE(s.bolsas_cabrillas_iniciales, 0) +
          COALESCE(s.bolsas_cabrillas_repuestas, 0) -
          COALESCE(s.bolsas_cabrillas_vendidas, 0)
        ) AS bolsas_cabrillas_restantes
      FROM ventas_stock_diario s
      INNER JOIN almacenes a ON a.id = s.almacen_id
      WHERE s.fecha = ?
      ${extraWhere}
      ORDER BY a.nombre ASC
      `,
      params
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el estado diario" });
  }
}

async function crear(req, res) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const {
      almacen_id,
      metodo_pago_id,
      observaciones,
      cliente_id,
      lineas,
    } = req.body;

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
      return res.status(400).json({
        error: "La venta debe tener al menos una línea",
      });
    }

    const fechaHoy = normalizarFecha(req.body.fecha || new Date());
    const stock = await obtenerStockDiario(conn, fechaHoy, almacen_id);

    const movimiento = await calcularMovimientoBolsas(conn, lineas);
    const vendeCaracoles = movimiento.bolsasCaracoles > 0;
    const vendeCabrillas = movimiento.bolsasCabrillas > 0;

    if ((vendeCaracoles || vendeCabrillas) && !stock) {
      await conn.rollback();
      return res.status(400).json({
        error: `No hay stock diario iniciado para hoy en el almacén ${almacen_id}. Pulsa primero "Comenzar venta diaria".`,
      });
    }

    if (stock) {
      const { caracolesRestantes, cabrillasRestantes } = calcularRestantes(stock);

      if (movimiento.bolsasCaracoles > caracolesRestantes) {
        await conn.rollback();
        return res.status(409).json({
          error: "No hay suficientes bolsas de caracoles. Debes reponer.",
          pregunta_reposicion: true,
          tipo: "caracoles",
        });
      }

      if (movimiento.bolsasCabrillas > cabrillasRestantes) {
        await conn.rollback();
        return res.status(409).json({
          error: "No hay suficientes bolsas de cabrillas. Debes reponer.",
          pregunta_reposicion: true,
          tipo: "cabrillas",
        });
      }
    }

    const codigoVenta = generarCodigoVenta();

    const [ventaResult] = await conn.query(
      `
      INSERT INTO ventas
      (
        codigo_venta,
        almacen_id,
        metodo_pago_id,
        observaciones,
        cliente_id,
        usuario_id,
        estado,
        fecha_hora
      )
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVA', NOW())
      `,
      [
        codigoVenta,
        Number(almacen_id),
        Number(metodo_pago_id),
        observaciones || null,
        cliente_id || null,
        req.usuario?.id || null,
      ]
    );

    const ventaId = ventaResult.insertId;

    for (const linea of lineas) {
      if (!linea.producto_id || numero(linea.cantidad) <= 0) {
        throw new Error("Cada línea debe tener producto y cantidad válida");
      }

      const cantidad = numero(linea.cantidad);
      const precioUnitario = numero(linea.precio_unitario);
      const subtotal = cantidad * precioUnitario;

      await conn.query(
        `
        INSERT INTO lineas_venta
        (
          venta_id,
          producto_id,
          descripcion_producto,
          cantidad,
          precio_unitario,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          ventaId,
          Number(linea.producto_id),
          linea.descripcion_producto || null,
          cantidad,
          precioUnitario,
          subtotal,
        ]
      );
    }

    if (stock) {
      await conn.query(
        `
        UPDATE ventas_stock_diario
        SET
          bolsas_caracoles_vendidas = bolsas_caracoles_vendidas + ?,
          bolsas_cabrillas_vendidas = bolsas_cabrillas_vendidas + ?
        WHERE fecha = ? AND almacen_id = ?
        `,
        [
          movimiento.bolsasCaracoles,
          movimiento.bolsasCabrillas,
          fechaHoy,
          Number(almacen_id),
        ]
      );

      await actualizarResumenDiario(conn, fechaHoy, almacen_id);
    }

    const stockActualizado = await obtenerStockDiario(conn, fechaHoy, almacen_id);
    const restantes = stockActualizado ? calcularRestantes(stockActualizado) : null;

    await conn.commit();

    res.status(201).json({
      message: "Venta creada correctamente",
      id: ventaId,
      codigo_venta: codigoVenta,
      aviso_reposicion:
        !!restantes &&
        (numero(restantes.caracolesRestantes) === 0 ||
          numero(restantes.cabrillasRestantes) === 0),
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
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const { motivo_anulacion } = req.body;

    const [ventas] = await conn.query(
      `
      SELECT id, almacen_id, DATE(fecha_hora) AS fecha_venta, estado
      FROM ventas
      WHERE id = ?
      LIMIT 1
      `,
      [req.params.id]
    );

    if (ventas.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    const venta = ventas[0];

    if (venta.estado !== "ACTIVA") {
      await conn.rollback();
      return res.status(400).json({ error: "La venta ya está anulada" });
    }

    const [lineas] = await conn.query(
      `
      SELECT lv.producto_id, lv.descripcion_producto, lv.cantidad, p.nombre
      FROM lineas_venta lv
      INNER JOIN productos p ON p.id = lv.producto_id
      WHERE lv.venta_id = ?
      `,
      [req.params.id]
    );

    const movimiento = await calcularMovimientoBolsas(conn, lineas);

    await conn.query(
      `
      UPDATE ventas
      SET
        estado = 'ANULADA',
        motivo_anulacion = ?,
        anulada_en = NOW()
      WHERE id = ?
      `,
      [motivo_anulacion || null, req.params.id]
    );

    const stock = await obtenerStockDiario(
      conn,
      normalizarFecha(venta.fecha_venta),
      venta.almacen_id
    );

    if (stock) {
      await conn.query(
        `
        UPDATE ventas_stock_diario
        SET
          bolsas_caracoles_vendidas = GREATEST(0, bolsas_caracoles_vendidas - ?),
          bolsas_cabrillas_vendidas = GREATEST(0, bolsas_cabrillas_vendidas - ?)
        WHERE fecha = ? AND almacen_id = ?
        `,
        [
          movimiento.bolsasCaracoles,
          movimiento.bolsasCabrillas,
          normalizarFecha(venta.fecha_venta),
          venta.almacen_id,
        ]
      );

      await actualizarResumenDiario(
        conn,
        normalizarFecha(venta.fecha_venta),
        venta.almacen_id
      );
    }

    await conn.commit();

    res.json({ message: "Venta anulada correctamente" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Error al anular venta" });
  } finally {
    conn.release();
  }
}

async function resumenDiario(req, res) {
  try {
    const fecha = normalizarFecha(req.query.fecha || req.query.dia);
    const params = [fecha];
    let extraWhere = "";

    if (req.query.almacen_id) {
      extraWhere = "AND r.almacen_id = ?";
      params.push(Number(req.query.almacen_id));
    }

    const [rows] = await pool.query(
      `
      SELECT
        r.fecha,
        r.almacen_id,
        a.nombre AS almacen,
        r.numero_ventas,
        r.total_vendido,
        r.total_efectivo,
        r.total_tarjeta,
        r.total_bizum,
        r.bolsas_caracoles_vendidas,
        r.bolsas_cabrillas_vendidas
      FROM ventas_resumen_diario r
      INNER JOIN almacenes a ON a.id = r.almacen_id
      WHERE r.fecha = ?
      ${extraWhere}
      ORDER BY a.nombre ASC
      `,
      params
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
      `
      SELECT
        YEAR(v.fecha_hora) AS anio,
        MONTH(v.fecha_hora) AS mes_numero,
        COUNT(DISTINCT v.id) AS numero_ventas,
        COALESCE(SUM(lv.subtotal), 0) AS total_vendido,
        COALESCE(
          ROUND(SUM(lv.subtotal) / NULLIF(COUNT(DISTINCT v.id), 0), 2),
          0
        ) AS ticket_medio
      FROM ventas v
      LEFT JOIN lineas_venta lv ON lv.venta_id = v.id
      WHERE v.estado = 'ACTIVA'
      GROUP BY YEAR(v.fecha_hora), MONTH(v.fecha_hora)
      ORDER BY YEAR(v.fecha_hora) DESC, MONTH(v.fecha_hora) DESC
      `
    );

    const datosFormateados = rows.map((row) => ({
      anio: row.anio,
      mes_numero: row.mes_numero,
      mes: `${obtenerNombreMes(row.mes_numero)} ${row.anio}`,
      numero_ventas: Number(row.numero_ventas || 0),
      total_vendido: Number(row.total_vendido || 0),
      ticket_medio: Number(row.ticket_medio || 0),
    }));

    res.json(datosFormateados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener resumen mensual" });
  }
}

async function resumenSemanalProductos(req, res) {
  try {
    const condiciones = ["v.estado = 'ACTIVA'"];
    const params = [];

    if (req.query.desde) {
      condiciones.push("DATE(v.fecha_hora) >= ?");
      params.push(normalizarFecha(req.query.desde));
    }

    if (req.query.hasta) {
      condiciones.push("DATE(v.fecha_hora) <= ?");
      params.push(normalizarFecha(req.query.hasta));
    }

    if (req.query.almacen_id) {
      condiciones.push("v.almacen_id = ?");
      params.push(Number(req.query.almacen_id));
    }

    if (req.query.metodo_pago_id) {
      condiciones.push("v.metodo_pago_id = ?");
      params.push(Number(req.query.metodo_pago_id));
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT
        p.nombre AS producto,
        mp.nombre AS metodo_pago,
        COALESCE(SUM(lv.cantidad), 0) AS cantidad_vendida
      FROM ventas v
      INNER JOIN metodos_pago mp ON mp.id = v.metodo_pago_id
      INNER JOIN lineas_venta lv ON lv.venta_id = v.id
      INNER JOIN productos p ON p.id = lv.producto_id
      ${where}
      GROUP BY p.nombre, mp.nombre
      ORDER BY p.nombre ASC, cantidad_vendida DESC
      `,
      params
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener resumen semanal por productos",
    });
  }
}

async function generarCierre(req, res) {
  try {
    const fecha = normalizarFecha(req.body.fecha);

    const [rows] = await pool.query(
      `
      SELECT
        s.fecha,
        s.almacen_id,
        a.nombre AS almacen,
        s.bolsas_caracoles_iniciales,
        s.bolsas_cabrillas_iniciales,
        s.bolsas_caracoles_repuestas,
        s.bolsas_cabrillas_repuestas,
        s.bolsas_caracoles_vendidas,
        s.bolsas_cabrillas_vendidas,
        (
          COALESCE(s.bolsas_caracoles_iniciales, 0) +
          COALESCE(s.bolsas_caracoles_repuestas, 0) -
          COALESCE(s.bolsas_caracoles_vendidas, 0)
        ) AS bolsas_caracoles_restantes,
        (
          COALESCE(s.bolsas_cabrillas_iniciales, 0) +
          COALESCE(s.bolsas_cabrillas_repuestas, 0) -
          COALESCE(s.bolsas_cabrillas_vendidas, 0)
        ) AS bolsas_cabrillas_restantes,
        COALESCE(r.numero_ventas, 0) AS numero_ventas,
        COALESCE(r.total_vendido, 0) AS total_vendido,
        COALESCE(r.total_efectivo, 0) AS total_efectivo,
        COALESCE(r.total_tarjeta, 0) AS total_tarjeta,
        COALESCE(r.total_bizum, 0) AS total_bizum
      FROM ventas_stock_diario s
      INNER JOIN almacenes a ON a.id = s.almacen_id
      LEFT JOIN ventas_resumen_diario r
        ON r.fecha = s.fecha AND r.almacen_id = s.almacen_id
      WHERE s.fecha = ?
      ORDER BY a.nombre ASC
      `,
      [fecha]
    );

    res.json({
      message: "Cierre diario generado",
      cierre: rows,
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
      `
      SELECT
        s.fecha,
        s.almacen_id,
        a.nombre AS almacen,
        COALESCE(r.numero_ventas, 0) AS numero_ventas,
        COALESCE(r.total_vendido, 0) AS total_vendido,
        (
          COALESCE(s.bolsas_caracoles_iniciales, 0) +
          COALESCE(s.bolsas_caracoles_repuestas, 0) -
          COALESCE(s.bolsas_caracoles_vendidas, 0)
        ) AS bolsas_caracoles_restantes,
        (
          COALESCE(s.bolsas_cabrillas_iniciales, 0) +
          COALESCE(s.bolsas_cabrillas_repuestas, 0) -
          COALESCE(s.bolsas_cabrillas_vendidas, 0)
        ) AS bolsas_cabrillas_restantes
      FROM ventas_stock_diario s
      INNER JOIN almacenes a ON a.id = s.almacen_id
      LEFT JOIN ventas_resumen_diario r
        ON r.fecha = s.fecha AND r.almacen_id = s.almacen_id
      ORDER BY s.fecha DESC, a.nombre ASC
      `
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
  comenzarVentaDiaria,
  registrarReposicion,
  obtenerEstadoDiario,
  resumenDiario,
  resumenMensual,
  resumenSemanalProductos,
  generarCierre,
  listarCierres,
};