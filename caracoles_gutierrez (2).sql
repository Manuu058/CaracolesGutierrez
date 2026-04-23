-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 23-04-2026 a las 11:55:00
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `caracoles_gutierrez`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_generar_cierre_diario` (IN `p_fecha` DATE)   BEGIN
    DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_numero INT DEFAULT 0;
    DECLARE v_promedio DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_cierre_id INT;

    SELECT
        IFNULL(SUM(total), 0),
        COUNT(*),
        IFNULL(AVG(total), 0)
    INTO v_total, v_numero, v_promedio
    FROM ventas
    WHERE estado = 'ACTIVA'
      AND DATE(fecha_hora) = p_fecha;

    INSERT INTO cierres_diarios (
        fecha,
        total_ventas,
        numero_ventas,
        promedio_venta,
        generado_automaticamente
    )
    VALUES (
        p_fecha,
        v_total,
        v_numero,
        v_promedio,
        TRUE
    )
    ON DUPLICATE KEY UPDATE
        total_ventas = VALUES(total_ventas),
        numero_ventas = VALUES(numero_ventas),
        promedio_venta = VALUES(promedio_venta),
        generado_automaticamente = VALUES(generado_automaticamente),
        updated_at = CURRENT_TIMESTAMP;

    SELECT id INTO v_cierre_id
    FROM cierres_diarios
    WHERE fecha = p_fecha
    LIMIT 1;

    DELETE FROM cierres_diarios_pago
    WHERE cierre_diario_id = v_cierre_id;

    INSERT INTO cierres_diarios_pago (
        cierre_diario_id,
        metodo_pago_id,
        total,
        numero_ventas
    )
    SELECT
        v_cierre_id,
        v.metodo_pago_id,
        ROUND(SUM(v.total), 2),
        COUNT(*)
    FROM ventas v
    WHERE v.estado = 'ACTIVA'
      AND DATE(v.fecha_hora) = p_fecha
    GROUP BY v.metodo_pago_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `almacenes`
--

CREATE TABLE `almacenes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `responsable` varchar(120) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `almacenes`
--

INSERT INTO `almacenes` (`id`, `nombre`, `direccion`, `telefono`, `responsable`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Almacén Principal', 'Carretera jerez prado dela feria el bonete chico s/n, 11170 Medina-Sidonia, Cádiz', '000000000', 'Pendiente', 1, '2026-04-03 14:43:01', '2026-04-09 09:43:30'),
(2, 'Almacén Sevilla', ' Poligono el pino, C. Pino Tea, 41016 Sevilla', '000000001', 'Pendiente', 1, '2026-04-03 14:43:01', '2026-04-09 09:43:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_logs`
--

CREATE TABLE `auditoria_logs` (
  `id` bigint(20) NOT NULL,
  `tabla_afectada` varchar(100) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT','ANULAR') NOT NULL,
  `registro_id` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `fecha_evento` datetime NOT NULL DEFAULT current_timestamp(),
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `ip` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cierres_diarios`
--

CREATE TABLE `cierres_diarios` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `total_ventas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `numero_ventas` int(11) NOT NULL DEFAULT 0,
  `promedio_venta` decimal(10,2) NOT NULL DEFAULT 0.00,
  `generado_automaticamente` tinyint(1) NOT NULL DEFAULT 1,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cierres_diarios_pago`
--

CREATE TABLE `cierres_diarios_pago` (
  `id` int(11) NOT NULL,
  `cierre_diario_id` int(11) NOT NULL,
  `metodo_pago_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `numero_ventas` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `empresa` varchar(150) DEFAULT NULL,
  `nif_cif` varchar(30) DEFAULT NULL,
  `persona_contacto` varchar(120) DEFAULT NULL,
  `iban` varchar(34) DEFAULT NULL,
  `metodo_pago_preferido` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(150) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`id`, `nombre`, `apellidos`, `telefono`, `email`, `cargo`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Antonio', 'Pérez', '633333333', 'antonio@demo.com', 'Conductor', 1, '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(2, 'Manuel', 'Gutiérrez', '644444444', 'manuel@demo.com', 'Responsable', 1, '2026-04-03 14:43:01', '2026-04-03 14:43:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_impresiones_etiquetas`
--

CREATE TABLE `historial_impresiones_etiquetas` (
  `id` int(11) NOT NULL,
  `plantilla_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `usuario_nombre` varchar(150) DEFAULT NULL,
  `lote` varchar(120) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `impresora_id` int(11) DEFAULT NULL,
  `impresora_nombre` varchar(150) DEFAULT NULL,
  `archivo_generado_ruta` varchar(255) DEFAULT NULL,
  `agente_nombre` varchar(150) DEFAULT NULL,
  `estado` enum('PENDIENTE','PROCESANDO','IMPRESA','ERROR') NOT NULL DEFAULT 'PENDIENTE',
  `mensaje_error` text DEFAULT NULL,
  `fecha_impresion` datetime NOT NULL DEFAULT current_timestamp(),
  `procesada_en` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_impresiones_etiquetas`
--

INSERT INTO `historial_impresiones_etiquetas` (`id`, `plantilla_id`, `usuario_id`, `usuario_nombre`, `lote`, `cantidad`, `impresora_id`, `impresora_nombre`, `archivo_generado_ruta`, `agente_nombre`, `estado`, `mensaje_error`, `fecha_impresion`, `procesada_en`, `created_at`) VALUES
(1, 1, 1, 'Administrador', '1604', 1, NULL, NULL, NULL, NULL, 'PENDIENTE', NULL, '2026-04-19 19:30:23', NULL, '2026-04-19 17:30:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `impresoras_etiquetas`
--

CREATE TABLE `impresoras_etiquetas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `predeterminada` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lineas_venta`
--

CREATE TABLE `lineas_venta` (
  `id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `descripcion_producto` varchar(255) DEFAULT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `lote_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lineas_venta`
--

INSERT INTO `lineas_venta` (`id`, `venta_id`, `producto_id`, `descripcion_producto`, `cantidad`, `precio_unitario`, `subtotal`, `lote_id`, `created_at`, `updated_at`) VALUES
(3, 3, 1, 'Caracoles', 4.00, 13.00, 52.00, NULL, '2026-04-09 07:53:21', '2026-04-09 07:53:21'),
(4, 3, 2, 'Cabrillas', 3.00, 20.00, 60.00, NULL, '2026-04-09 07:53:21', '2026-04-09 07:53:21'),
(8, 5, 5, 'Tarrinas', 1.00, 9.50, 9.50, NULL, '2026-04-09 10:33:48', '2026-04-09 10:33:48'),
(9, 5, 1, 'Caracoles', 4.00, 13.00, 52.00, NULL, '2026-04-09 10:33:48', '2026-04-09 10:33:48'),
(10, 5, 2, 'Cabrillas', 1.00, 20.00, 20.00, NULL, '2026-04-09 10:33:48', '2026-04-09 10:33:48'),
(11, 5, 4, 'Especias', 3.00, 1.50, 4.50, NULL, '2026-04-09 10:33:48', '2026-04-09 10:33:48'),
(12, 6, 2, 'Cabrillas', 5.00, 20.00, 100.00, NULL, '2026-04-11 10:07:58', '2026-04-11 10:07:58'),
(13, 7, 5, 'Tarrinas', 1.00, 9.50, 9.50, NULL, '2026-04-12 13:35:25', '2026-04-12 13:35:25'),
(14, 7, 1, 'Caracoles', 5.00, 13.00, 65.00, NULL, '2026-04-12 13:35:25', '2026-04-12 13:35:25'),
(0, 0, 1, 'Caracoles', 3.00, 13.00, 39.00, NULL, '2026-04-15 21:16:20', '2026-04-15 21:16:20'),
(0, 0, 2, 'Cabrillas', 3.00, 18.00, 54.00, NULL, '2026-04-15 21:16:20', '2026-04-15 21:16:20');

--
-- Disparadores `lineas_venta`
--
DELIMITER $$
CREATE TRIGGER `trg_lineas_venta_after_delete` AFTER DELETE ON `lineas_venta` FOR EACH ROW BEGIN
    UPDATE ventas
    SET subtotal = (
            SELECT IFNULL(SUM(subtotal), 0)
            FROM lineas_venta
            WHERE venta_id = OLD.venta_id
        ),
        total = (
            SELECT IFNULL(SUM(subtotal), 0)
            FROM lineas_venta
            WHERE venta_id = OLD.venta_id
        )
    WHERE id = OLD.venta_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_lineas_venta_after_insert` AFTER INSERT ON `lineas_venta` FOR EACH ROW BEGIN
    UPDATE ventas
    SET subtotal = (
            SELECT IFNULL(SUM(subtotal), 0)
            FROM lineas_venta
            WHERE venta_id = NEW.venta_id
        ),
        total = (
            SELECT IFNULL(SUM(subtotal), 0)
            FROM lineas_venta
            WHERE venta_id = NEW.venta_id
        )
    WHERE id = NEW.venta_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_lineas_venta_after_update` AFTER UPDATE ON `lineas_venta` FOR EACH ROW BEGIN
    UPDATE ventas
    SET subtotal = (
            SELECT IFNULL(SUM(subtotal), 0)
            FROM lineas_venta
            WHERE venta_id = NEW.venta_id
        ),
        total = (
            SELECT IFNULL(SUM(subtotal), 0)
            FROM lineas_venta
            WHERE venta_id = NEW.venta_id
        )
    WHERE id = NEW.venta_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_lineas_venta_before_insert` BEFORE INSERT ON `lineas_venta` FOR EACH ROW BEGIN
    IF NEW.cantidad <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad de la línea debe ser mayor que cero';
    END IF;

    IF NEW.precio_unitario < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El precio unitario no puede ser negativo';
    END IF;

    SET NEW.subtotal = ROUND(NEW.cantidad * NEW.precio_unitario, 2);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_lineas_venta_before_update` BEFORE UPDATE ON `lineas_venta` FOR EACH ROW BEGIN
    IF NEW.cantidad <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad de la línea debe ser mayor que cero';
    END IF;

    IF NEW.precio_unitario < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El precio unitario no puede ser negativo';
    END IF;

    SET NEW.subtotal = ROUND(NEW.cantidad * NEW.precio_unitario, 2);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotes`
--

CREATE TABLE `lotes` (
  `id` int(11) NOT NULL,
  `codigo_lote` varchar(50) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `proveedor_id` int(11) NOT NULL,
  `precio_compra` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fecha_compra` date NOT NULL,
  `cantidad_inicial` decimal(10,2) NOT NULL,
  `stock` decimal(10,2) NOT NULL,
  `observaciones` text DEFAULT NULL,
  `estado` enum('ACTIVO','AGOTADO','BLOQUEADO') NOT NULL DEFAULT 'ACTIVO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `factura_compra` varchar(100) DEFAULT NULL,
  `cantidad_caracoles` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cantidad_cabrillas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_caracoles` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_cabrillas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `almacen_id` int(11) NOT NULL DEFAULT 1,
  `mes_lote` varchar(20) DEFAULT NULL,
  `numero_albaran` varchar(100) DEFAULT NULL,
  `mes` varchar(20) NOT NULL DEFAULT '',
  `producto` varchar(20) NOT NULL DEFAULT 'AMBAS'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lotes`
--

INSERT INTO `lotes` (`id`, `codigo_lote`, `producto_id`, `proveedor_id`, `precio_compra`, `fecha_compra`, `cantidad_inicial`, `stock`, `observaciones`, `estado`, `created_at`, `updated_at`, `factura_compra`, `cantidad_caracoles`, `cantidad_cabrillas`, `stock_caracoles`, `stock_cabrillas`, `almacen_id`, `mes_lote`, `numero_albaran`, `mes`, `producto`) VALUES
(1, '150426', 0, 1, 0.00, '2026-04-14', 0.00, 0.00, NULL, 'ACTIVO', '2026-04-15 21:21:18', '2026-04-15 21:49:34', '11452', 0.00, 0.00, 4600.00, 3500.00, 1, NULL, NULL, 'ABRIL', 'AMBAS'),
(2, '160426', 0, 1, 0.00, '2026-04-15', 0.00, 0.00, NULL, 'ACTIVO', '2026-04-15 21:49:34', '2026-04-16 10:04:41', '112233', 2000.00, 2000.00, 2000.00, 2000.00, 1, NULL, NULL, 'ABRIL', 'AMBAS'),
(3, '040526', 0, 6, 0.00, '2026-04-15', 0.00, 0.00, NULL, 'ACTIVO', '2026-04-16 09:57:34', '2026-04-16 10:54:49', '11452', 2000.00, 1500.00, 1500.00, 1000.00, 1, NULL, NULL, 'ABRIL', 'AMBAS');

--
-- Disparadores `lotes`
--
DELIMITER $$
CREATE TRIGGER `trg_lotes_before_delete` BEFORE DELETE ON `lotes` FOR EACH ROW BEGIN
    DECLARE v_total_movimientos INT;

    SELECT COUNT(*) INTO v_total_movimientos
    FROM movimientos_lote
    WHERE lote_id = OLD.id;

    IF v_total_movimientos > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede eliminar un lote con movimientos asociados';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_lotes_before_insert` BEFORE INSERT ON `lotes` FOR EACH ROW BEGIN
    IF NEW.stock IS NULL THEN
        SET NEW.stock = NEW.cantidad_inicial;
    END IF;

    IF NEW.cantidad_inicial < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La cantidad inicial del lote no puede ser negativa';
    END IF;

    IF NEW.stock < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El stock del lote no puede ser negativo';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mantenimientos`
--

CREATE TABLE `mantenimientos` (
  `id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `tipo_mantenimiento_id` int(11) NOT NULL,
  `encargado_id` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `descripcion` text DEFAULT NULL,
  `coste` decimal(10,2) NOT NULL DEFAULT 0.00,
  `kilometros_en_momento` int(11) DEFAULT NULL,
  `proxima_fecha` date DEFAULT NULL,
  `proximos_km` int(11) DEFAULT NULL,
  `taller` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `mantenimientos`
--
DELIMITER $$
CREATE TRIGGER `trg_mantenimientos_before_insert` BEFORE INSERT ON `mantenimientos` FOR EACH ROW BEGIN
    DECLARE v_meses INT;
    DECLARE v_km INT;

    SELECT meses_proximo, km_proximo
      INTO v_meses, v_km
    FROM tipos_mantenimiento
    WHERE id = NEW.tipo_mantenimiento_id;

    IF NEW.proxima_fecha IS NULL AND v_meses IS NOT NULL THEN
        SET NEW.proxima_fecha = DATE_ADD(NEW.fecha, INTERVAL v_meses MONTH);
    END IF;

    IF NEW.proximos_km IS NULL AND v_km IS NOT NULL AND NEW.kilometros_en_momento IS NOT NULL THEN
        SET NEW.proximos_km = NEW.kilometros_en_momento + v_km;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_mantenimientos_before_update` BEFORE UPDATE ON `mantenimientos` FOR EACH ROW BEGIN
    DECLARE v_meses INT;
    DECLARE v_km INT;

    SELECT meses_proximo, km_proximo
      INTO v_meses, v_km
    FROM tipos_mantenimiento
    WHERE id = NEW.tipo_mantenimiento_id;

    IF NEW.proxima_fecha IS NULL AND v_meses IS NOT NULL THEN
        SET NEW.proxima_fecha = DATE_ADD(NEW.fecha, INTERVAL v_meses MONTH);
    END IF;

    IF NEW.proximos_km IS NULL AND v_km IS NOT NULL AND NEW.kilometros_en_momento IS NOT NULL THEN
        SET NEW.proximos_km = NEW.kilometros_en_momento + v_km;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_pago`
--

CREATE TABLE `metodos_pago` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `metodos_pago`
--

INSERT INTO `metodos_pago` (`id`, `nombre`, `descripcion`, `activo`) VALUES
(1, 'Efectivo', 'Pago en efectivo', 1),
(2, 'Tarjeta', 'Pago con tarjeta', 1),
(3, 'Transferencia', 'Pago por transferencia', 1),
(4, 'Bizum', 'Pago por Bizum', 1),
(5, 'Otros', 'Otros métodos de pago', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos_lote`
--

CREATE TABLE `movimientos_lote` (
  `id` int(11) NOT NULL,
  `lote_id` int(11) NOT NULL,
  `proveedor_id` int(11) DEFAULT NULL,
  `tipo_movimiento` enum('ENTRADA','SALIDA') NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `cantidad_caracoles` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cantidad_cabrillas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `numero_factura` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `movimientos_lote`
--

INSERT INTO `movimientos_lote` (`id`, `lote_id`, `proveedor_id`, `tipo_movimiento`, `cliente_id`, `fecha`, `cantidad_caracoles`, `cantidad_cabrillas`, `numero_factura`, `descripcion`, `usuario_id`, `created_at`, `updated_at`) VALUES
(4, 3, NULL, 'SALIDA', 36, '2026-04-16', 500.00, 500.00, '12345', NULL, NULL, '2026-04-16 10:54:49', '2026-04-16 10:54:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantillas_etiquetas`
--

CREATE TABLE `plantillas_etiquetas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo_etiqueta` varchar(100) DEFAULT NULL,
  `archivo_diseno` varchar(255) DEFAULT NULL,
  `contenido_html` longtext DEFAULT NULL,
  `campo_variable` varchar(100) NOT NULL DEFAULT '[[LOTE]]',
  `impresora_id` int(11) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plantillas_etiquetas`
--

INSERT INTO `plantillas_etiquetas` (`id`, `nombre`, `descripcion`, `tipo_etiqueta`, `archivo_diseno`, `contenido_html`, `campo_variable`, `impresora_id`, `activa`, `created_at`, `updated_at`) VALUES
(1, 'CABRILLAS SEVILLA', 'Etiqueta cabrillas sevilla', 'CABRILLAS', 'uploads/etiquetas/CABRILLAS SEVILLA.ezp', NULL, 'LOTE', NULL, 1, '2026-04-19 17:29:39', '2026-04-19 17:29:39'),
(2, 'CARACOLES SEVILLA NORMAL', 'Etiqueta caracoles sevilla', 'CARACOLES', 'uploads/etiquetas/CARACOLES SEVILLA NORMAL.ezp', NULL, 'LOTE', NULL, 1, '2026-04-19 17:29:39', '2026-04-19 17:29:39'),
(3, 'PALETS CABRILLAS SEVILLA', 'Etiqueta palets cabrillas', 'PALET', 'uploads/etiquetas/PALETS CABRILLAS SEVILLA.ezp', NULL, 'LOTE', NULL, 1, '2026-04-19 17:29:39', '2026-04-19 17:29:39'),
(4, 'PALETS SEVILLA CARACOLES', 'Etiqueta palets caracoles', 'PALET', 'uploads/etiquetas/PALETS SEVILLA CARACOLES.ezp', NULL, 'LOTE', NULL, 1, '2026-04-19 17:29:39', '2026-04-19 17:29:39');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL DEFAULT 0.00,
  `unidad_medida` varchar(30) NOT NULL DEFAULT 'kg',
  `stock_minimo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `unidad_medida`, `stock_minimo`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Caracoles', 'Caracoles preparados para venta', 8.50, 'kg', 20.00, 1, '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(2, 'Cabrillas', 'Cabrillas preparadas para venta', 9.50, 'kg', 15.00, 1, '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(4, 'Especias', 'Especias preparadas para venta', 0.00, 'ud', 10.00, 1, '2026-04-09 08:06:34', '2026-04-09 08:06:34'),
(5, 'Tarrinas', 'Tarrinas preparadas para venta', 0.00, 'ud', 10.00, 1, '2026-04-09 08:06:34', '2026-04-09 08:06:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `empresa` varchar(150) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `nif_cif` varchar(30) DEFAULT NULL,
  `persona_contacto` varchar(120) DEFAULT NULL,
  `iban` varchar(34) DEFAULT NULL,
  `metodo_pago_preferido` varchar(50) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
(1, 'ADMINISTRADOR', 'Acceso total al sistema', '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(2, 'GERENCIA', 'Acceso a paneles, informes y control general', '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(3, 'TRAZABILIDAD', 'Gestión de lotes, productos, clientes y proveedores', '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(4, 'VEHICULOS', 'Gestión de vehículos y mantenimientos', '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(5, 'VENTAS', 'Gestión de ventas y cierres diarios', '2026-04-03 14:43:01', '2026-04-03 14:43:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_mantenimiento`
--

CREATE TABLE `tipos_mantenimiento` (
  `id` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `meses_proximo` int(11) DEFAULT NULL,
  `km_proximo` int(11) DEFAULT NULL,
  `obligatorio` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `tipos_mantenimiento`
--

INSERT INTO `tipos_mantenimiento` (`id`, `nombre`, `descripcion`, `meses_proximo`, `km_proximo`, `obligatorio`) VALUES
(1, 'ITV', 'Inspección técnica del vehículo', 12, NULL, 1),
(2, 'Cambio de aceite', 'Cambio periódico de aceite', 6, 15000, 1),
(3, 'Revisión mecánica', 'Revisión general mecánica', 12, 30000, 0),
(4, 'Mantenimiento general', 'Mantenimiento general preventivo', 12, 20000, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajadores`
--

CREATE TABLE `trabajadores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(150) DEFAULT NULL,
  `dni` varchar(50) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `puesto` varchar(100) DEFAULT NULL,
  `fecha_alta` date DEFAULT curdate(),
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trabajadores`
--

INSERT INTO `trabajadores` (`id`, `nombre`, `apellidos`, `dni`, `telefono`, `email`, `puesto`, `fecha_alta`, `estado`, `created_at`, `updated_at`) VALUES
(0, 'Maria Jose', 'Carmona', '4987551H', '651768237', 'manuelgutirecio@gmail.com', 'Dependienta', '2026-04-01', 'activo', '2026-04-15 22:17:57', '2026-04-15 22:17:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(150) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `username` varchar(80) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `ultimo_acceso` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellidos`, `email`, `username`, `password_hash`, `telefono`, `activo`, `ultimo_acceso`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'Sistema', 'admin@caracolesgutierrez.com', 'admin', '123456', '600000000', 1, '2026-04-19 21:12:43', '2026-04-03 14:43:01', '2026-04-19 19:12:43'),
(2, 'Manuel', 'Gutierrez', 'manuel@caracolesgutierrez.com', 'manuel', 'Manuel058', '600000001', 1, '2026-04-04 17:31:04', '2026-04-04 14:49:28', '2026-04-04 15:31:04'),
(3, 'Jesus', 'Perez', 'jesus@caracolesgutierrez.com', 'jesus', '1234', '600000002', 1, NULL, '2026-04-04 14:49:28', '2026-04-04 14:49:28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_sistema`
--

CREATE TABLE `usuarios_sistema` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('administrador','encargado','operario','consulta') NOT NULL DEFAULT 'consulta',
  `trabajador_id` int(11) DEFAULT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_roles`
--

CREATE TABLE `usuario_roles` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `usuario_roles`
--

INSERT INTO `usuario_roles` (`id`, `usuario_id`, `rol_id`, `created_at`) VALUES
(1, 1, 1, '2026-04-03 14:43:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `marca` varchar(80) NOT NULL,
  `modelo` varchar(100) NOT NULL,
  `matriculacion` date NOT NULL,
  `esta_activo` tinyint(1) NOT NULL DEFAULT 1,
  `conductor_habitual_id` int(11) DEFAULT NULL,
  `kilometros_actuales` int(11) NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `codigo_venta` varchar(50) NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `almacen_id` int(11) NOT NULL,
  `metodo_pago_id` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estado` enum('ACTIVA','ANULADA') NOT NULL DEFAULT 'ACTIVA',
  `observaciones` text DEFAULT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `anulada_en` datetime DEFAULT NULL,
  `motivo_anulacion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `codigo_venta`, `fecha_hora`, `almacen_id`, `metodo_pago_id`, `subtotal`, `total`, `estado`, `observaciones`, `cliente_id`, `usuario_id`, `anulada_en`, `motivo_anulacion`, `created_at`, `updated_at`) VALUES
(3, 'VTA-20260409-86691', '2026-04-09 09:53:21', 1, 1, 112.00, 112.00, 'ACTIVA', NULL, NULL, NULL, NULL, NULL, '2026-04-09 07:53:21', '2026-04-09 07:53:21'),
(5, 'VTA-20260409-32142', '2026-04-09 12:33:48', 1, 2, 86.00, 86.00, 'ACTIVA', NULL, NULL, NULL, NULL, NULL, '2026-04-09 10:33:48', '2026-04-09 10:33:48'),
(6, 'VTA-20260411-77191', '2026-04-11 12:07:58', 1, 1, 100.00, 100.00, 'ACTIVA', NULL, NULL, NULL, NULL, NULL, '2026-04-11 10:07:58', '2026-04-11 10:07:58'),
(7, 'VTA-20260412-97176', '2026-04-12 15:35:25', 1, 1, 74.50, 74.50, 'ACTIVA', NULL, NULL, NULL, NULL, NULL, '2026-04-12 13:35:25', '2026-04-12 13:35:25'),
(0, 'VTA-20260415-92363', '2026-04-15 23:16:20', 1, 2, 93.00, 93.00, 'ACTIVA', NULL, NULL, NULL, NULL, NULL, '2026-04-15 21:16:20', '2026-04-15 21:16:20');

--
-- Disparadores `ventas`
--
DELIMITER $$
CREATE TRIGGER `trg_ventas_before_insert` BEFORE INSERT ON `ventas` FOR EACH ROW BEGIN
    IF NEW.codigo_venta IS NULL OR NEW.codigo_venta = '' THEN
        SET NEW.codigo_venta = CONCAT(
            'VTA-',
            DATE_FORMAT(NOW(), '%Y%m%d'),
            '-',
            LPAD(FLOOR(1 + RAND() * 99999), 5, '0')
        );
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_ventas_before_update` BEFORE UPDATE ON `ventas` FOR EACH ROW BEGIN
    IF NEW.estado = 'ANULADA' AND OLD.estado = 'ACTIVA' THEN
        SET NEW.anulada_en = NOW();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas_resumen_diario`
--

CREATE TABLE `ventas_resumen_diario` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `almacen_id` int(11) NOT NULL,
  `numero_ventas` int(11) NOT NULL DEFAULT 0,
  `total_vendido` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_efectivo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_tarjeta` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_bizum` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bolsas_caracoles_vendidas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bolsas_cabrillas_vendidas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas_resumen_diario`
--

INSERT INTO `ventas_resumen_diario` (`id`, `fecha`, `almacen_id`, `numero_ventas`, `total_vendido`, `total_efectivo`, `total_tarjeta`, `total_bizum`, `bolsas_caracoles_vendidas`, `bolsas_cabrillas_vendidas`, `creado_en`, `actualizado_en`) VALUES
(1, '2026-04-11', 1, 1, 100.00, 100.00, 0.00, 0.00, 0.00, 5.00, '2026-04-11 09:53:51', '2026-04-11 10:07:58'),
(3, '2026-04-12', 1, 1, 74.50, 74.50, 0.00, 0.00, 5.00, 0.00, '2026-04-12 13:34:57', '2026-04-12 13:35:25'),
(0, '2026-04-15', 1, 0, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2026-04-15 21:15:56', '2026-04-15 21:15:56'),
(0, '2026-04-15', 1, 1, 93.00, 0.00, 93.00, 0.00, 3.00, 3.00, '2026-04-15 21:16:20', '2026-04-15 21:16:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas_stock_diario`
--

CREATE TABLE `ventas_stock_diario` (
  `id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `almacen_id` int(11) NOT NULL,
  `bolsas_caracoles_iniciales` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bolsas_cabrillas_iniciales` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bolsas_caracoles_repuestas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bolsas_cabrillas_repuestas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bolsas_caracoles_vendidas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `bolsas_cabrillas_vendidas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_caracoles` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_cabrillas` decimal(10,2) NOT NULL DEFAULT 0.00,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas_stock_diario`
--

INSERT INTO `ventas_stock_diario` (`id`, `fecha`, `almacen_id`, `bolsas_caracoles_iniciales`, `bolsas_cabrillas_iniciales`, `bolsas_caracoles_repuestas`, `bolsas_cabrillas_repuestas`, `bolsas_caracoles_vendidas`, `bolsas_cabrillas_vendidas`, `precio_caracoles`, `precio_cabrillas`, `creado_en`, `actualizado_en`) VALUES
(1, '2026-04-11', 1, 40.00, 40.00, 0.00, 0.00, 0.00, 5.00, 13.00, 20.00, '2026-04-11 09:53:51', '2026-04-11 10:07:58'),
(3, '2026-04-12', 1, 20.00, 20.00, 10.00, 0.00, 5.00, 0.00, 13.00, 20.00, '2026-04-12 13:34:57', '2026-04-12 13:35:48'),
(0, '2026-04-15', 1, 40.00, 40.00, 0.00, 0.00, 3.00, 3.00, 13.00, 18.00, '2026-04-15 21:15:56', '2026-04-15 21:16:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vw_proximos_mantenimientos`
--

CREATE TABLE `vw_proximos_mantenimientos` (
  `id` int(11) DEFAULT NULL,
  `matricula` varchar(20) DEFAULT NULL,
  `marca` varchar(80) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `tipo_mantenimiento` varchar(80) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `proxima_fecha` date DEFAULT NULL,
  `proximos_km` int(11) DEFAULT NULL,
  `kilometros_actuales` int(11) DEFAULT NULL,
  `estado_fecha` varchar(7) DEFAULT NULL,
  `estado_km` varchar(7) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `historial_impresiones_etiquetas`
--
ALTER TABLE `historial_impresiones_etiquetas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_historial_plantilla` (`plantilla_id`),
  ADD KEY `idx_historial_usuario` (`usuario_id`),
  ADD KEY `idx_historial_impresora` (`impresora_id`),
  ADD KEY `idx_historial_fecha` (`fecha_impresion`),
  ADD KEY `idx_historial_lote` (`lote`);

--
-- Indices de la tabla `impresoras_etiquetas`
--
ALTER TABLE `impresoras_etiquetas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `movimientos_lote`
--
ALTER TABLE `movimientos_lote`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `plantillas_etiquetas`
--
ALTER TABLE `plantillas_etiquetas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_plantillas_impresora` (`impresora_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT de la tabla `historial_impresiones_etiquetas`
--
ALTER TABLE `historial_impresiones_etiquetas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `impresoras_etiquetas`
--
ALTER TABLE `impresoras_etiquetas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `movimientos_lote`
--
ALTER TABLE `movimientos_lote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `plantillas_etiquetas`
--
ALTER TABLE `plantillas_etiquetas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `historial_impresiones_etiquetas`
--
ALTER TABLE `historial_impresiones_etiquetas`
  ADD CONSTRAINT `fk_historial_impresora` FOREIGN KEY (`impresora_id`) REFERENCES `impresoras_etiquetas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_plantilla` FOREIGN KEY (`plantilla_id`) REFERENCES `plantillas_etiquetas` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `plantillas_etiquetas`
--
ALTER TABLE `plantillas_etiquetas`
  ADD CONSTRAINT `fk_plantillas_impresora` FOREIGN KEY (`impresora_id`) REFERENCES `impresoras_etiquetas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
