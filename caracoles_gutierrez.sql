-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-04-2026 a las 16:59:38
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

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `nombre`, `telefono`, `email`, `direccion`, `empresa`, `nif_cif`, `persona_contacto`, `iban`, `metodo_pago_preferido`, `observaciones`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Cliente Demo 1', '611111111', 'cliente1@demo.com', 'Dirección cliente 1', 'Empresa Cliente 1', '12345678A', 'Persona 1', NULL, 'Efectivo', NULL, 1, '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(2, 'Cliente Demo 2', '622222222', 'cliente2@demo.com', 'Dirección cliente 2', 'Empresa Cliente 2', '23456789B', 'Persona 2', NULL, 'Transferencia', NULL, 1, '2026-04-03 14:43:01', '2026-04-03 14:43:01');

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
(14, 7, 1, 'Caracoles', 5.00, 13.00, 65.00, NULL, '2026-04-12 13:35:25', '2026-04-12 13:35:25');

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
  `numero_albaran` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `nif_cif` varchar(30) DEFAULT NULL,
  `persona_contacto` varchar(120) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`, `telefono`, `email`, `direccion`, `nif_cif`, `persona_contacto`, `observaciones`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Proveedor Demo 1', '600111111', 'proveedor1@demo.com', 'Dirección proveedor 1', 'B12345678', 'Contacto 1', NULL, 1, '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(2, 'Proveedor Demo 2', '600222222', 'proveedor2@demo.com', 'Dirección proveedor 2', 'B87654321', 'Contacto 2', NULL, 1, '2026-04-03 14:43:01', '2026-04-03 14:43:01');

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
(1, 'Administrador', 'Sistema', 'admin@caracolesgutierrez.com', 'admin', '123456', '600000000', 1, '2026-04-12 15:17:26', '2026-04-03 14:43:01', '2026-04-12 13:17:26'),
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

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`id`, `matricula`, `marca`, `modelo`, `matriculacion`, `esta_activo`, `conductor_habitual_id`, `kilometros_actuales`, `observaciones`, `created_at`, `updated_at`) VALUES
(1, '1234ABC', 'Iveco', 'Daily', '2022-06-10', 1, 1, 55000, 'Vehículo de reparto principal', '2026-04-03 14:43:01', '2026-04-03 14:43:01'),
(2, '5678DEF', 'Mercedes', 'Sprinter', '2021-03-15', 1, 2, 83000, 'Vehículo secundario', '2026-04-03 14:43:01', '2026-04-03 14:43:01');

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
(7, 'VTA-20260412-97176', '2026-04-12 15:35:25', 1, 1, 74.50, 74.50, 'ACTIVA', NULL, NULL, NULL, NULL, NULL, '2026-04-12 13:35:25', '2026-04-12 13:35:25');

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
(3, '2026-04-12', 1, 1, 74.50, 74.50, 0.00, 0.00, 5.00, 0.00, '2026-04-12 13:34:57', '2026-04-12 13:35:25');

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
(3, '2026-04-12', 1, 20.00, 20.00, 10.00, 0.00, 5.00, 0.00, 13.00, 20.00, '2026-04-12 13:34:57', '2026-04-12 13:35:48');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_historial_lotes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_historial_lotes` (
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_proximos_mantenimientos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_proximos_mantenimientos` (
`id` int(11)
,`matricula` varchar(20)
,`marca` varchar(80)
,`modelo` varchar(100)
,`tipo_mantenimiento` varchar(80)
,`fecha` date
,`proxima_fecha` date
,`proximos_km` int(11)
,`kilometros_actuales` int(11)
,`estado_fecha` varchar(7)
,`estado_km` varchar(7)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_resumen_diario_ventas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_resumen_diario_ventas` (
`fecha` date
,`numero_ventas` bigint(21)
,`total_vendido` decimal(32,2)
,`promedio_venta` decimal(11,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_resumen_mensual_ventas`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_resumen_mensual_ventas` (
`anio` int(4)
,`mes` int(2)
,`numero_ventas` bigint(21)
,`total_vendido` decimal(32,2)
,`promedio_venta` decimal(11,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_stock_productos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_stock_productos` (
`producto_id` int(11)
,`producto` varchar(150)
,`unidad_medida` varchar(30)
,`stock_minimo` decimal(10,2)
,`stock_total` decimal(32,2)
,`estado_stock` varchar(4)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vw_ventas_detalle`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vw_ventas_detalle` (
`venta_id` int(11)
,`codigo_venta` varchar(50)
,`fecha_hora` datetime
,`almacen` varchar(120)
,`metodo_pago` varchar(50)
,`estado` enum('ACTIVA','ANULADA')
,`total` decimal(10,2)
,`cliente` varchar(150)
,`usuario` varchar(80)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_historial_lotes`
--
DROP TABLE IF EXISTS `vw_historial_lotes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_historial_lotes`  AS SELECT `l`.`id` AS `lote_id`, `l`.`codigo_lote` AS `codigo_lote`, `p`.`nombre` AS `producto`, `pr`.`nombre` AS `proveedor`, `l`.`fecha_compra` AS `fecha_compra`, `l`.`cantidad_inicial` AS `cantidad_inicial`, `l`.`stock` AS `stock`, `ml`.`id` AS `movimiento_id`, `ml`.`tipo_movimiento` AS `tipo_movimiento`, `ml`.`fecha` AS `fecha_movimiento`, `ml`.`cantidad` AS `cantidad`, `ml`.`precio_venta` AS `precio_venta`, `c`.`nombre` AS `cliente`, `ml`.`descripcion` AS `descripcion` FROM ((((`lotes` `l` join `productos` `p` on(`p`.`id` = `l`.`producto_id`)) join `proveedores` `pr` on(`pr`.`id` = `l`.`proveedor_id`)) left join `movimientos_lote` `ml` on(`ml`.`lote_id` = `l`.`id`)) left join `clientes` `c` on(`c`.`id` = `ml`.`cliente_id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_proximos_mantenimientos`
--
DROP TABLE IF EXISTS `vw_proximos_mantenimientos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_proximos_mantenimientos`  AS SELECT `m`.`id` AS `id`, `v`.`matricula` AS `matricula`, `v`.`marca` AS `marca`, `v`.`modelo` AS `modelo`, `tm`.`nombre` AS `tipo_mantenimiento`, `m`.`fecha` AS `fecha`, `m`.`proxima_fecha` AS `proxima_fecha`, `m`.`proximos_km` AS `proximos_km`, `v`.`kilometros_actuales` AS `kilometros_actuales`, CASE WHEN `m`.`proxima_fecha` is not null AND `m`.`proxima_fecha` < curdate() THEN 'VENCIDO' WHEN `m`.`proxima_fecha` is not null AND `m`.`proxima_fecha` <= curdate() + interval 30 day THEN 'PROXIMO' ELSE 'OK' END AS `estado_fecha`, CASE WHEN `m`.`proximos_km` is not null AND `v`.`kilometros_actuales` >= `m`.`proximos_km` THEN 'VENCIDO' WHEN `m`.`proximos_km` is not null AND `v`.`kilometros_actuales` >= `m`.`proximos_km` - 1000 THEN 'PROXIMO' ELSE 'OK' END AS `estado_km` FROM ((`mantenimientos` `m` join `vehiculos` `v` on(`v`.`id` = `m`.`vehiculo_id`)) join `tipos_mantenimiento` `tm` on(`tm`.`id` = `m`.`tipo_mantenimiento_id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_resumen_diario_ventas`
--
DROP TABLE IF EXISTS `vw_resumen_diario_ventas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_resumen_diario_ventas`  AS SELECT cast(`v`.`fecha_hora` as date) AS `fecha`, count(0) AS `numero_ventas`, round(sum(`v`.`total`),2) AS `total_vendido`, round(avg(`v`.`total`),2) AS `promedio_venta` FROM `ventas` AS `v` WHERE `v`.`estado` = 'ACTIVA' GROUP BY cast(`v`.`fecha_hora` as date) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_resumen_mensual_ventas`
--
DROP TABLE IF EXISTS `vw_resumen_mensual_ventas`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_resumen_mensual_ventas`  AS SELECT year(`v`.`fecha_hora`) AS `anio`, month(`v`.`fecha_hora`) AS `mes`, count(0) AS `numero_ventas`, round(sum(`v`.`total`),2) AS `total_vendido`, round(avg(`v`.`total`),2) AS `promedio_venta` FROM `ventas` AS `v` WHERE `v`.`estado` = 'ACTIVA' GROUP BY year(`v`.`fecha_hora`), month(`v`.`fecha_hora`) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_stock_productos`
--
DROP TABLE IF EXISTS `vw_stock_productos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_stock_productos`  AS SELECT `p`.`id` AS `producto_id`, `p`.`nombre` AS `producto`, `p`.`unidad_medida` AS `unidad_medida`, `p`.`stock_minimo` AS `stock_minimo`, ifnull(sum(case when `l`.`estado` <> 'BLOQUEADO' then `l`.`stock` else 0 end),0) AS `stock_total`, CASE WHEN ifnull(sum(case when `l`.`estado` <> 'BLOQUEADO' then `l`.`stock` else 0 end),0) <= `p`.`stock_minimo` THEN 'BAJO' ELSE 'OK' END AS `estado_stock` FROM (`productos` `p` left join `lotes` `l` on(`l`.`producto_id` = `p`.`id`)) GROUP BY `p`.`id`, `p`.`nombre`, `p`.`unidad_medida`, `p`.`stock_minimo` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vw_ventas_detalle`
--
DROP TABLE IF EXISTS `vw_ventas_detalle`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_ventas_detalle`  AS SELECT `v`.`id` AS `venta_id`, `v`.`codigo_venta` AS `codigo_venta`, `v`.`fecha_hora` AS `fecha_hora`, `a`.`nombre` AS `almacen`, `mp`.`nombre` AS `metodo_pago`, `v`.`estado` AS `estado`, `v`.`total` AS `total`, `c`.`nombre` AS `cliente`, `u`.`username` AS `usuario` FROM ((((`ventas` `v` join `almacenes` `a` on(`a`.`id` = `v`.`almacen_id`)) join `metodos_pago` `mp` on(`mp`.`id` = `v`.`metodo_pago_id`)) left join `clientes` `c` on(`c`.`id` = `v`.`cliente_id`)) left join `usuarios` `u` on(`u`.`id` = `v`.`usuario_id`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `almacenes`
--
ALTER TABLE `almacenes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_almacenes_nombre` (`nombre`);

--
-- Indices de la tabla `auditoria_logs`
--
ALTER TABLE `auditoria_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_auditoria_tabla` (`tabla_afectada`),
  ADD KEY `idx_auditoria_accion` (`accion`),
  ADD KEY `idx_auditoria_fecha` (`fecha_evento`),
  ADD KEY `fk_auditoria_usuario` (`usuario_id`);

--
-- Indices de la tabla `cierres_diarios`
--
ALTER TABLE `cierres_diarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cierres_diarios_fecha` (`fecha`);

--
-- Indices de la tabla `cierres_diarios_pago`
--
ALTER TABLE `cierres_diarios_pago`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_cierre_pago` (`cierre_diario_id`,`metodo_pago_id`),
  ADD KEY `fk_cierres_pago_metodo` (`metodo_pago_id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_clientes_nombre` (`nombre`),
  ADD KEY `idx_clientes_empresa` (`empresa`),
  ADD KEY `idx_clientes_email` (`email`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_empleados_nombre` (`nombre`,`apellidos`);

--
-- Indices de la tabla `lineas_venta`
--
ALTER TABLE `lineas_venta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lineas_venta_venta` (`venta_id`),
  ADD KEY `idx_lineas_venta_producto` (`producto_id`),
  ADD KEY `fk_lineas_venta_lote` (`lote_id`);

--
-- Indices de la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_lotes_codigo_lote` (`codigo_lote`),
  ADD KEY `idx_lotes_producto` (`producto_id`),
  ADD KEY `idx_lotes_proveedor` (`proveedor_id`),
  ADD KEY `idx_lotes_fecha_compra` (`fecha_compra`),
  ADD KEY `fk_lotes_almacen_nueva` (`almacen_id`);

--
-- Indices de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_mantenimientos_vehiculo` (`vehiculo_id`),
  ADD KEY `idx_mantenimientos_tipo` (`tipo_mantenimiento_id`),
  ADD KEY `idx_mantenimientos_fecha` (`fecha`),
  ADD KEY `fk_mantenimientos_encargado` (`encargado_id`);

--
-- Indices de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_metodos_pago_nombre` (`nombre`);

--
-- Indices de la tabla `movimientos_lote`
--
ALTER TABLE `movimientos_lote`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_movimientos_lote_id` (`lote_id`),
  ADD KEY `idx_movimientos_cliente_id` (`cliente_id`),
  ADD KEY `idx_movimientos_fecha` (`fecha`),
  ADD KEY `idx_movimientos_tipo` (`tipo_movimiento`),
  ADD KEY `fk_movimientos_lote_proveedor` (`proveedor_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_productos_nombre` (`nombre`),
  ADD KEY `idx_productos_activo` (`activo`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_proveedores_nombre` (`nombre`),
  ADD KEY `idx_proveedores_email` (`email`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `tipos_mantenimiento`
--
ALTER TABLE `tipos_mantenimiento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tipos_mantenimiento_nombre` (`nombre`);

--
-- Indices de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `usuarios_sistema`
--
ALTER TABLE `usuarios_sistema`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_usuario_trabajador` (`trabajador_id`);

--
-- Indices de la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_rol` (`usuario_id`,`rol_id`),
  ADD KEY `fk_usuario_roles_rol` (`rol_id`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_vehiculos_matricula` (`matricula`),
  ADD KEY `idx_vehiculos_marca_modelo` (`marca`,`modelo`),
  ADD KEY `fk_vehiculos_conductor` (`conductor_habitual_id`),
  ADD KEY `idx_vehiculos_activo` (`esta_activo`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ventas_codigo_venta` (`codigo_venta`),
  ADD KEY `idx_ventas_fecha_hora` (`fecha_hora`),
  ADD KEY `idx_ventas_almacen` (`almacen_id`),
  ADD KEY `idx_ventas_metodo_pago` (`metodo_pago_id`),
  ADD KEY `idx_ventas_estado` (`estado`),
  ADD KEY `fk_ventas_usuario` (`usuario_id`),
  ADD KEY `idx_ventas_cliente` (`cliente_id`);

--
-- Indices de la tabla `ventas_resumen_diario`
--
ALTER TABLE `ventas_resumen_diario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_resumen_diario_fecha_almacen` (`fecha`,`almacen_id`),
  ADD KEY `fk_resumen_diario_almacen` (`almacen_id`);

--
-- Indices de la tabla `ventas_stock_diario`
--
ALTER TABLE `ventas_stock_diario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_stock_diario_fecha_almacen` (`fecha`,`almacen_id`),
  ADD KEY `fk_stock_diario_almacen` (`almacen_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `almacenes`
--
ALTER TABLE `almacenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `auditoria_logs`
--
ALTER TABLE `auditoria_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cierres_diarios`
--
ALTER TABLE `cierres_diarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cierres_diarios_pago`
--
ALTER TABLE `cierres_diarios_pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `lineas_venta`
--
ALTER TABLE `lineas_venta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `movimientos_lote`
--
ALTER TABLE `movimientos_lote`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tipos_mantenimiento`
--
ALTER TABLE `tipos_mantenimiento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `trabajadores`
--
ALTER TABLE `trabajadores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios_sistema`
--
ALTER TABLE `usuarios_sistema`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `ventas_resumen_diario`
--
ALTER TABLE `ventas_resumen_diario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ventas_stock_diario`
--
ALTER TABLE `ventas_stock_diario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditoria_logs`
--
ALTER TABLE `auditoria_logs`
  ADD CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `cierres_diarios_pago`
--
ALTER TABLE `cierres_diarios_pago`
  ADD CONSTRAINT `fk_cierres_pago_cierre` FOREIGN KEY (`cierre_diario_id`) REFERENCES `cierres_diarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cierres_pago_metodo` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `lineas_venta`
--
ALTER TABLE `lineas_venta`
  ADD CONSTRAINT `fk_lineas_venta_lote` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_venta_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lineas_venta_venta` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lotes`
--
ALTER TABLE `lotes`
  ADD CONSTRAINT `fk_lotes_almacen` FOREIGN KEY (`almacen_id`) REFERENCES `almacenes` (`id`),
  ADD CONSTRAINT `fk_lotes_almacen_nueva` FOREIGN KEY (`almacen_id`) REFERENCES `almacenes` (`id`),
  ADD CONSTRAINT `fk_lotes_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lotes_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `mantenimientos`
--
ALTER TABLE `mantenimientos`
  ADD CONSTRAINT `fk_mantenimientos_encargado` FOREIGN KEY (`encargado_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mantenimientos_tipo` FOREIGN KEY (`tipo_mantenimiento_id`) REFERENCES `tipos_mantenimiento` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mantenimientos_vehiculo` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `movimientos_lote`
--
ALTER TABLE `movimientos_lote`
  ADD CONSTRAINT `fk_movimientos_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimientos_lote` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movimientos_lote_proveedor` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`);

--
-- Filtros para la tabla `usuarios_sistema`
--
ALTER TABLE `usuarios_sistema`
  ADD CONSTRAINT `fk_usuario_trabajador` FOREIGN KEY (`trabajador_id`) REFERENCES `trabajadores` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_roles`
--
ALTER TABLE `usuario_roles`
  ADD CONSTRAINT `fk_usuario_roles_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_roles_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD CONSTRAINT `fk_vehiculos_conductor` FOREIGN KEY (`conductor_habitual_id`) REFERENCES `empleados` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_almacen` FOREIGN KEY (`almacen_id`) REFERENCES `almacenes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ventas_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ventas_metodo_pago` FOREIGN KEY (`metodo_pago_id`) REFERENCES `metodos_pago` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ventas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `ventas_resumen_diario`
--
ALTER TABLE `ventas_resumen_diario`
  ADD CONSTRAINT `fk_resumen_diario_almacen` FOREIGN KEY (`almacen_id`) REFERENCES `almacenes` (`id`);

--
-- Filtros para la tabla `ventas_stock_diario`
--
ALTER TABLE `ventas_stock_diario`
  ADD CONSTRAINT `fk_stock_diario_almacen` FOREIGN KEY (`almacen_id`) REFERENCES `almacenes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
