-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-04-2026 a las 12:58:40
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
(1, 'Cliente Demo 1', '611111111', 'cliente1@demo.com', 'Dirección cliente 1', 'Empresa Cliente 1', '12345678A', 'Persona 1', NULL, 'Efectivo', NULL, 0, '2026-04-03 14:43:01', '2026-04-15 22:37:00'),
(2, 'Cliente Demo 2', '622222222', 'cliente2@demo.com', 'Dirección cliente 2', 'Empresa Cliente 2', '23456789B', 'Persona 2', NULL, 'Transferencia', NULL, 0, '2026-04-03 14:43:01', '2026-04-15 22:37:01'),
(3, 'Manuel', '629283601', 'manuelgutirecio@gmail.com', 'Calle Alfareros 4a', NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-04-15 22:36:55', '2026-04-15 22:36:58'),
(4, 'LUQUEZ PEREZ S.L.', '665761826', NULL, 'C/ San Esmenegildo, 8 - Sevilla', NULL, 'B-41532250', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 2', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(5, 'JOSE GUTIERREZ GUERRERO', NULL, NULL, 'C/ ALFAREROS - MEDINA SIDONIA - CADIZ', NULL, '31237729E', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 2', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(6, 'JOSE ANTONIO MARIN FRAILE', '658839028', NULL, 'C/ Grecia, 23 - Sanlúcar La Mayor - Sevilla', NULL, '28926059V', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 3', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(7, 'ISMAEL ASTORGA ZUMAQUERO', NULL, NULL, 'C/ Colombia, 6 - Chiclana de la Frontera - CADIZ', NULL, '44034980P', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 3', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(8, 'ANTONIO J. SANCI RAPOSO', '653852573', NULL, 'C/ Cruz de Montañina, 50 - Bollullos del Condado - Huelva', NULL, '29769837V', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 4', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(9, 'TAMARA DELGADO PAEZ', NULL, NULL, 'C/ Uruguay, 3 - Medina Sidonia - CADIZ', NULL, '75770557R', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 4', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(10, 'ANTONIO LEON RUIZ', '686041581', NULL, 'C/ Cruz de Montañina, 57 - Bollullos del Condado - Huelva', NULL, '44203314M', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 5', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(11, 'JUAN GUERRERO BOLAÑOS', NULL, NULL, 'C/ Barrio Nuevo - MEDINA SIDONIA - CADIZ', NULL, '48899996H', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 5', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(12, 'HNOS PAEZ Y VIRUEL S.L.', '617406589', NULL, 'Avda de Utrera, 155 - Los Palacios y Villafranca - Sevilla', NULL, 'B-41161068', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 6', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(13, 'ANGEL GAGO SANCHEZ', NULL, NULL, 'C/ Molino - MEDINA SIDONIA - CADIZ', NULL, '31733437S', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 6', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(14, 'FRANCISCO GARCIA VAZQUEZ', NULL, NULL, 'C/ Ponce, 52 - Morón - Sevilla', NULL, '52252259-P', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 7', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(15, 'NOEL GUTIERREZ ALMAGRO', NULL, NULL, 'C/ San Juan de Dios s/n - MEDINA SIDONIA - CADIZ', NULL, '15443854K', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 7', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(16, 'PILAR LOPEZ CRESPO', '630334907', NULL, 'c/Arias                 ,16 - Arahal - Sevilla', NULL, '75446771D', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 8', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(17, 'BELEN RIVERO GARCIA', NULL, 'ismatozu666@hotmail.com', 'C/ Colombia, 6 - Chiclana de la Frontera - CADIZ', NULL, '44036548N', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 8', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(18, 'C.B. HNOS GUETO', NULL, NULL, 'C/ Ruiz Frias, 35 - 14850 Baena - Cordoba', NULL, 'E-14370779', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 9', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(19, 'FRANCISCO GUTIERREZ GUERRERO', NULL, NULL, 'C/ Azocarrem - MEDINA SIDONIA - CADIZ', NULL, '32858759Q', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 9', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(20, 'ANTONIO ROMERO LEONIZA', '656394882', NULL, 'C/ Jaen, 45 - Coripe - Sevilla', NULL, '48862605W', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 10', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(21, 'JUAN JOSE BALLESTERO OTERO', NULL, NULL, 'C/ Puerto Real 7 - MEDINA SIDONIA - CADIZ', NULL, '75765750R', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 10', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(22, 'J. ANTONIO CAMACHO QUINTERO', '685172578', NULL, 'C/ San Pio X, 11 - 41840 PILAS - Sevilla', NULL, '28904851S', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 11', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(23, 'EDUVIGUIS RUBIO MARTINEZ', NULL, NULL, 'C/ Tarteso 17 - ALGECIRAS - CADIZ', NULL, '75880929L', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 11', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(24, 'TOMAS ADAN MORENO', NULL, NULL, 'C/ Ocho de Marzo - Sevilla', NULL, '28917877T', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 12', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(25, 'FRANCISCO BENITEZ DIAZ', NULL, NULL, 'C/ Senda del Mudo, nº 4 - MEDINA SIDONIA - CADIZ', NULL, '15444758M', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 12', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(26, 'FRUTERIA ROCIO', NULL, NULL, 'C/ Cesar Augusto 108 - Sevilla', NULL, '48957884S', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 13', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(27, 'MANUEL GUERRERO BOLAÑOS', NULL, NULL, 'C/ Valencia - MEDINA SIDONIA - CADIZ', NULL, '44043937M', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 13', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(28, 'SAMUEL MARTINEZ ORTEGA', NULL, NULL, NULL, NULL, '28716702Y', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 14', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(29, 'OMAR MORALES DE LA FLOR', NULL, NULL, 'C/Timon PG-Palmones - ALGECIRAS - CADIZ', NULL, '49077135B', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 14', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(30, 'PEDRO VICIANA TORRE', NULL, NULL, 'C/ Valencia - Sevilla', NULL, '38522281G', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 15', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(31, 'FRANCISCO ANGEL BARRERA', NULL, NULL, 'San Fernando - CADIZ', NULL, '48965618K', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 15', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(32, 'BAR SANTA MARIA', NULL, NULL, 'C/ Monte Carmelo, 4 - Sevilla', NULL, '28722875S', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 16', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(33, 'MERCEDES MENDOZA MARENTE', 'ESTE ES MANUEL BENITEZ BARRIOS', NULL, 'C/ Aragon, 2 - Medina Sidonia - CADIZ', NULL, '34048160H', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 16', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(34, 'ISABEL MUÑOZ VALVERDE', NULL, NULL, 'C/ General Hollero, 29 - Sevilla', NULL, '28581687R', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 17', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(35, 'EUSEVIO ALARCON PAVON', NULL, NULL, 'C/Jose Mº del Coran - Alcala de - Sevilla', NULL, '14328473W', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 18', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(36, 'ACEITUNA DEL CONDADO', '637849730', 'aceitunaslapalma@gmail.com', 'Ctra. Circunvalación s/n - La Palma del Condado - Huelva', NULL, '21499447B', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 19', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(37, 'Mª DOLORES SANCHEZ HERRERA', '653375135', 'marinataliaainara@gmail.com', 'C/ Alamo, 41 - Sevilla', NULL, '14325384H', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 20', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(38, 'PIMIENTOS CASA GARCIA S.L.', '637849730', NULL, 'C/ Carpinteros 13 -15 - Mairena del Alcor - Sevilla', NULL, 'B91292326', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 21', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(39, 'DOMINGO BENITEZ MIRANDA', '625624267', NULL, 'C/ Higuera, 13 - El Cuervo - Sevilla', NULL, '75444134V', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 22', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(40, 'LA CARACOLERIA', NULL, 'marosant.2004@hotmail.com', 'C/ Huelva, 15 - Santiponce - Sevilla', NULL, '52225371F', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 23', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(41, 'RAMON AGUILERA VARGAS', NULL, NULL, 'Plaza de Abastos Palacio - Montequinto - Sevilla', NULL, '28678626K', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 24', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(42, 'BRAULIO VALVERDE PORTILLO', NULL, NULL, 'C/ Capitán Jose Cortes,1 - Salvatierra????? - Sevilla', NULL, '28673714M', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 25', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(43, 'BODEGA LA PITARRA(JESUS MORERA PAVON)', NULL, NULL, 'C/Pava, 1 - Montequinto - Sevilla', NULL, '28915771X', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 26', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(44, 'Mª DOLORES HERRERA MOLINA', NULL, NULL, 'C/ Central nº 5 - Torreblanca - Sevilla', NULL, '14318249J', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 27', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(45, 'ROCIO GALINDO', NULL, NULL, 'Mercasevilla nave 2, nº47 - Sevilla', NULL, '52227099X', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 28', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(46, 'Mª JESUS IGLESIAS POYATO', NULL, NULL, 'C/ Encina nº 5 - Torreblanca - Sevilla', NULL, '28623833B', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 29', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(47, 'PEDRO PORTILLO SANCHEZ', NULL, NULL, 'C/Arroyo 38 - Arahal - Sevilla', NULL, '28575978L', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 30', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(48, 'ANTONIO ROMERO LEONIZA', NULL, NULL, 'C/ Fernandez y Bermudez - Utrera - Sevilla', NULL, '48862605W', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 31', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(49, 'MIGUEL TORRE SOTO', NULL, NULL, 'C/ Santi Ponce 4, 1 - Cama - Sevilla', NULL, '27296925L', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 32', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(50, 'RAFAEL BERMUDEZ SEVILLANO', NULL, NULL, 'C/ Alcala de Henares, 9 - Alcala de Guadaira - Sevilla', NULL, '28598430T', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 33', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(51, 'ENRIQUE RODRIGUEZ GORDO', NULL, NULL, 'C/ Japon, 12 local 4 - Sevilla', NULL, '28900760H', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 34', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(52, 'BAR ARAHAL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 35', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(53, 'JOSE DAVID SANCHEZ RODRIGUEZ(BAR REMONTA)', NULL, 'armandosanchez7873@gmail.com', 'C/ San Antonio112 - Arahal - Sevilla', NULL, '44952723M', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 36', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(54, 'DISTRIBUCIONES ZANJAR ROMERO', NULL, NULL, 'C/ Canal, 34 - Sevilla', NULL, 'B90379207', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 37', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(55, 'FRANCISCA LORA SIRIA', NULL, NULL, 'C/ Plaza de Malagueta - Sevilla', NULL, '28914881V', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 38', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(56, 'Mª DEL MAR HERRERA FRANCO', NULL, NULL, 'C/ Alamos, 12 - Torreblanca - Sevilla', NULL, '28704505E', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 39', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(57, 'VALENTIN VERA CONDE', NULL, NULL, 'C/ Malaga, 21 - Alamis - Sevilla', NULL, '75441808Z', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 40', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(58, 'MANUEL RIEGO LOPEZ', NULL, NULL, 'C/ Santa Maria de Gracia, 40 - Cama - Sevilla', NULL, '28894971W', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 41', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(59, 'CAROLINA TORO MOYANO', NULL, NULL, 'Palmar de Troya - Sevilla', NULL, '15410416W', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 42', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(60, 'JESUS MORERA PAVON', NULL, NULL, 'C/ Ferrara. 3 local 4 - Montequinto-Dos Hermanas - Sevilla', NULL, '28915771X', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 43', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(61, 'JOSE Mº SUAREZ BEJARANO', NULL, NULL, 'C/ Virgen del Castillo, 7 - El Cuervo - Sevilla', NULL, '34063709L', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 44', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(62, 'ANTONIO EDUARDO PORTILLO GARCIA', NULL, NULL, 'C/ Puerto Osuna, 81 - Arahal - Sevilla', NULL, '48988338V', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 45', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(63, 'ANTONIO CARRASCO MORENO', NULL, NULL, 'Plaza de Abastos Palacio - Sevilla', NULL, '34063731H', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 46', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(64, 'ROCIO CORTES MAYA', NULL, NULL, 'C/ Cesar Augustp, 8 - Montequinto - Sevilla', NULL, '48957884S', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 47', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(65, 'ROSARIO NIETO REYES', NULL, NULL, 'C/ Tomares blq 2, 12-Pañoleta - Cama - Sevilla', NULL, NULL, NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 48', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(66, 'HNOS CENIZO RECACHA S.C.', NULL, 'caracolesmarinparadas@hotmail.com', 'C/ Picaso, 45 - Paradas - Sevilla', NULL, 'J-91333757', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 49', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(67, 'SEMESGA OIL S.L.', NULL, NULL, 'C/ Guadalquivir, 2 - Coin - Málaga', NULL, 'B-93692143', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 50', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(68, 'JERONIMO CALVO GARCIA', NULL, NULL, 'LA ALGABA - Sevilla', NULL, '28490639X', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 51', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(69, 'CAFÉ BAR CIPRI(REYES PEREZ FERNANDEZ)', NULL, NULL, 'C/ San Pio X, 11 - PILAS - Sevilla', NULL, '79190095Z', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 52', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(70, 'CAFÉ BAR ESPERANZA', NULL, NULL, 'Conde de Barcelona, 20 - San Juan de Aznalfarache - Sevilla', NULL, 'B-41834037', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 53', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(71, 'ALIMENTACION ROYMA', NULL, NULL, 'C/ Segadora, 25 - LA ALGABA - Sevilla', NULL, 'B75400267', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 54', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(72, 'FRUTAS EL GIRALDILLO S.L.', NULL, NULL, 'Mercasevilla nave 2, nº40 - Sevilla', NULL, 'B-41603804', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 55', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(73, 'VICTORIA CANO GANDALA', NULL, 'jamarinfraile@gmail.com', 'C/ Grecia, 23 - Sanlúcar La Mayor - Sevilla', NULL, '53270305M', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 56', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(74, 'CAFÉ-BAR ESPERANZA S.L.', NULL, NULL, 'Conde de Barcelona, 120 - SAN JUAN DE AZNALFARACHE - SEVILLA', NULL, 'B-41834037', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 57', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(75, 'ERNESTO DIAZ JIMENEZ', NULL, NULL, 'Dos Hermanas - Sevilla', NULL, '48957703H', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 58', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(76, 'CHURROS GUADALQUIVIR S.L.', NULL, 'churrosguadalquivir@gmail.com', 'C/ Asunción 54 - Sevilla', NULL, 'B02828770', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 59', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(77, 'ANGELA FRIAS MARTIN (BAR CASA FRIAS)', NULL, 'm.angel40@hotmail.es', 'C/ Acueducto, 12 - 41008Sevilla', NULL, '77783749N', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 60', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(78, 'CARNICERIA URSULA', NULL, NULL, 'Alcala de Guadaira - Sevilla', NULL, '28694270E', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 61', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(79, 'FRANCISCO POLINARIO HERNANDEZ', NULL, NULL, 'C/ Cueva de Menga s/n - Sevilla', NULL, '28877545X', NULL, NULL, NULL, 'Importado desde Lista de Clientes.xlsx fila 62', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(80, 'FRUTAS EL GIRALDILLO S.L.', NULL, 'f.elgiraldillo@gamil.com', 'MERCASEVILLA NAVE 2 Nº 40 - SEVILLA - SEVILLA', NULL, 'B-41603804', NULL, NULL, NULL, 'Importado desde CLIENTES ESPARRAGOS-CASTAÑAS.xlsx fila 2', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(81, 'GUERRERO PEREZ 2005 S.L.', NULL, 'guerreroperez2005@gmail.com', 'C/ MURILLO, 6 - MEDINA SIDONIA - CADIZ', NULL, 'B72001878', NULL, NULL, NULL, 'Importado desde CLIENTES ESPARRAGOS-CASTAÑAS.xlsx fila 2', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(82, 'FRUTAS HNOS. JIMENEZ GOMEZ S.L.', NULL, 'arcosfrutas@hotmail.com', 'POL. IND. JADRAMIL S/N - ARCOS DE LA FRA - CADIZ', NULL, 'B-11925963', NULL, NULL, NULL, 'Importado desde CLIENTES ESPARRAGOS-CASTAÑAS.xlsx fila 3', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38');

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

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`, `empresa`, `telefono`, `email`, `direccion`, `nif_cif`, `persona_contacto`, `iban`, `metodo_pago_preferido`, `observaciones`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Proveedor Demo 1', NULL, '600111111', 'proveedor1@demo.com', 'Dirección proveedor 1', 'B12345678', 'Contacto 1', NULL, NULL, NULL, 0, '2026-04-03 14:43:01', '2026-04-15 23:10:50'),
(2, 'Proveedor Demo 2', NULL, '600222222', 'proveedor2@demo.com', 'Dirección proveedor 2', 'B87654321', 'Contacto 2', NULL, NULL, NULL, 0, '2026-04-03 14:43:01', '2026-04-15 23:10:52'),
(3, 'DAVID FERNANDEZ CORDERO', 'DAVID FERNANDEZ CORDERO', NULL, 'distribuciondfc@gmail.com', 'Alemania, 33 - El Cuervo de Sevilla - Sevilla', '31689327L', NULL, NULL, NULL, 'CP: 41749', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(4, 'ESCARGOMA ESPANE S.L.', 'ESCARGOMA ESPANE S.L.', NULL, NULL, 'Avda. del Transporte, 27 - El Cuervo de Sevilla - Sevilla', 'B-67914879', NULL, NULL, NULL, 'CP: 41749', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(5, 'JAQUADKANAR S.L.', 'JAQUADKANAR S.L.', NULL, 'kanar.jaouad@gmail.com', 'C/ Marruecos, Mercajerez Nave ZAC1, Local 2a - El Portal(Jerez de la Fra) - Cádiz', 'B-16405581', NULL, NULL, NULL, 'CP: 11408', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(6, 'BRAHIM ETTALEB', 'BRAHIM ETTALEB', NULL, NULL, 'Po. Ind. El Pino-C/ Pino Real, 14 - Sevilla', 'Y1208075-Z', NULL, NULL, NULL, 'CP: 41016', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(7, 'CARACOLES PERIBAÑEZ S.L.', 'CARACOLES PERIBAÑEZ S.L.', NULL, 'ventas@caracolespb.com', 'Cami Vell d\'Albal, 107 - Beniparrell - Valencia', 'B-967999309', NULL, NULL, NULL, 'CP: 46469', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(8, 'CARACOLES MEDINA S.C.', 'CARACOLES MEDINA S.C.', NULL, 'caracolesmedina@hotmail.com', 'Carretera Medina-Paterna, km 2 - Medina Sidonia - Cadiz', 'J72293137', NULL, NULL, NULL, 'CP: 11170', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(9, 'SOCICARACOL S.L.', 'SOCICARACOL S.L.', '955901898', NULL, 'Poligono Cinco Parcelas, 53 - La Luisiana - Sevilla', 'B41874645', NULL, NULL, NULL, 'CP: 41430', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(10, 'CASUIGON S.L.', 'CASUIGON S.L.', NULL, 'casuigon@gmail.com', 'C/ El Pozo, nº 27 - Lebrija - Sevilla', 'B41879966', NULL, NULL, NULL, 'CP: 41740', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(11, 'MENA FAJARDO S.L.L.', 'MENA FAJARDO S.L.L.', '647466247', 'menafajardosll@hotmail.com', 'Plaza Andalucía, nº 27 - Igualeja - Málaga', 'B92322197', NULL, NULL, NULL, 'CP: 29440', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38'),
(12, 'CASTAÑERA SERRANA S. COOP. AND', 'CASTAÑERA SERRANA S. COOP. AND', '656975552', 'info@cserrana.com', 'Carretera Valdelarco, km 0,200 - Galaroza - Huelva', 'F21028733', NULL, NULL, NULL, 'CP: 21291', 1, '2026-04-15 23:03:38', '2026-04-15 23:03:38');

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
(1, 'Administrador', 'Sistema', 'admin@caracolesgutierrez.com', 'admin', '123456', '600000000', 1, '2026-04-16 11:16:59', '2026-04-03 14:43:01', '2026-04-16 09:16:59'),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
