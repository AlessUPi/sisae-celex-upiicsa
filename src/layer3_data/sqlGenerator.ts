// ============================================================================
// SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX UPIICSA IPN
// CAPA 3: GENERADOR Y EXPORTADOR DE SCRIPTS SQL RELACIONALES (DDL + DML)
// ============================================================================

import { dbRepository } from './dbRepository';

export function generateFullSQLScript(): string {
  const teachers = dbRepository.getTeachers();
  const activities = dbRepository.getActivities();

  let sql = `-- ============================================================================
-- INSTITUTO POLITÉCNICO NACIONAL - UPIICSA
-- SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX
-- ESQUEMA RELACIONAL Y BASE DE DATOS (ARQUITECTURA DE 3 CAPAS - CAPA 3)
-- Generado el: ${new Date().toLocaleString('es-MX')}
-- ============================================================================

CREATE DATABASE IF NOT EXISTS sisae_celex_upiicsa_db
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE sisae_celex_upiicsa_db;

-- ----------------------------------------------------------------------------
-- LIMPIEZA DE TABLAS PREVIAS
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS bitacora_auditoria_udi;
DROP TABLE IF EXISTS inscripciones_acreditadas;
DROP TABLE IF EXISTS solicitudes_preregistro;
DROP TABLE IF EXISTS cursos_idiomas_celex;
DROP TABLE IF EXISTS profesores_celex;
DROP TABLE IF EXISTS alumnos_celex;
DROP TABLE IF EXISTS convocatorias_celex;

-- ----------------------------------------------------------------------------
-- TABLA: PROFESORES / INSTRUCTORES DE LENGUAS EXTRANJERAS
-- ----------------------------------------------------------------------------
CREATE TABLE profesores_celex (
    id VARCHAR(50) PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    especialidad VARCHAR(200) NOT NULL,
    idiomas_json JSON NOT NULL,
    certificaciones TEXT,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    semblanza TEXT,
    activo BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- TABLA: ALUMNOS Y ASPIRANTES (INTERNOS IPN Y USUARIOS EXTERNOS)
-- ----------------------------------------------------------------------------
CREATE TABLE alumnos_celex (
    id VARCHAR(50) PRIMARY KEY,
    boleta VARCHAR(25) UNIQUE NOT NULL,
    rfc VARCHAR(13) NOT NULL,
    curp VARCHAR(18),
    tipo_aspirante ENUM('INTERNO_IPN', 'EXTERNO') NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    carrera VARCHAR(120) NOT NULL,
    semestre INT CHECK (semestre BETWEEN 1 AND 10),
    turno ENUM('Matutino', 'Vespertino', 'Sabatino', 'Mixto') NOT NULL,
    creditos_acumulados INT DEFAULT 0,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro DATE NOT NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: OFERTA ACADÉMICA DE CURSOS DE IDIOMAS (CELEX)
-- ----------------------------------------------------------------------------
CREATE TABLE cursos_idiomas_celex (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    idioma ENUM('Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Japonés') NOT NULL,
    nivel ENUM('Básico', 'Intermedio', 'Avanzado', 'Certificación') NOT NULL,
    subnivel VARCHAR(20) NOT NULL,
    modalidad ENUM('Regular', 'Intensivo', 'Sabatino') NOT NULL,
    profesor_id VARCHAR(50),
    cupo_maximo INT NOT NULL CHECK (cupo_maximo > 0),
    cupo_ocupado INT DEFAULT 0,
    salon VARCHAR(100) NOT NULL,
    dias_json JSON NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    turno ENUM('Matutino', 'Vespertino', 'Sabatino', 'Mixto') NOT NULL,
    creditos_electiva INT DEFAULT 3,
    costo_interno DECIMAL(10,2) DEFAULT 850.00,
    costo_externo DECIMAL(10,2) DEFAULT 1450.00,
    descripcion TEXT,
    requisitos TEXT,
    imagen_url VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE,
    semestre_periodo VARCHAR(20) DEFAULT '2026-2',
    fecha_examen_diagnostico DATE,
    FOREIGN KEY (profesor_id) REFERENCES profesores_celex(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- TABLA: BANDEJA CENTRALIZADA DE SOLICITUDES DE PRE-REGISTRO
-- ----------------------------------------------------------------------------
CREATE TABLE solicitudes_preregistro (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(40) UNIQUE NOT NULL,
    aspirante_nombre VARCHAR(150) NOT NULL,
    tipo_aspirante ENUM('INTERNO_IPN', 'EXTERNO') NOT NULL,
    identificador VARCHAR(30) NOT NULL,
    rfc VARCHAR(13) NOT NULL,
    curp VARCHAR(18),
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    carrera VARCHAR(120) NOT NULL,
    curso_id VARCHAR(50) NOT NULL,
    curso_nombre VARCHAR(150) NOT NULL,
    idioma VARCHAR(50) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    modalidad VARCHAR(30) NOT NULL,
    horario_deseado VARCHAR(100) NOT NULL,
    numero_referencia_pago VARCHAR(50) NOT NULL,
    monto_pago DECIMAL(10,2) NOT NULL,
    banco_convenio VARCHAR(100) DEFAULT 'BBVA Convenio CIE IPN 1849201',
    comprobante_pago_url VARCHAR(255),
    identificacion_url VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('REGISTRADA', 'EN_REVISION', 'REQUIERE_CORRECCION', 'APROBADA', 'RECHAZADA') DEFAULT 'REGISTRADA',
    observaciones_admin TEXT,
    grupo_asignado VARCHAR(30),
    salon_asignado VARCHAR(100),
    profesor_asignado VARCHAR(150),
    horario_asignado VARCHAR(100),
    FOREIGN KEY (curso_id) REFERENCES cursos_idiomas_celex(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- TABLA: INSCRIPCIONES OFICIALES Y CÉDULAS CON VALIDACIÓN QR
-- ----------------------------------------------------------------------------
CREATE TABLE inscripciones_acreditadas (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(40) UNIQUE NOT NULL,
    alumno_id VARCHAR(50) NOT NULL,
    alumno_boleta VARCHAR(25) NOT NULL,
    alumno_rfc VARCHAR(13),
    alumno_curp VARCHAR(18),
    alumno_nombre VARCHAR(150) NOT NULL,
    alumno_tipo ENUM('INTERNO_IPN', 'EXTERNO') NOT NULL,
    curso_id VARCHAR(50) NOT NULL,
    curso_nombre VARCHAR(150) NOT NULL,
    idioma VARCHAR(50) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    grupo VARCHAR(30) NOT NULL,
    profesor_nombre VARCHAR(150) NOT NULL,
    horario_texto VARCHAR(100) NOT NULL,
    salon VARCHAR(100) NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    estado ENUM('INSCRITO', 'EN_CURSO', 'ACREDITADO', 'CANCELADO') DEFAULT 'INSCRITO',
    porcentaje_asistencia INT DEFAULT 0,
    calificacion_o_constancia VARCHAR(50),
    referencia_bancaria_validada VARCHAR(50) NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (alumno_id) REFERENCES alumnos_celex(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos_idiomas_celex(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- TABLA: BITÁCORA DE AUDITORÍA Y SEGURIDAD UDI
-- ----------------------------------------------------------------------------
CREATE TABLE bitacora_auditoria_udi (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(150) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    detalles TEXT NOT NULL,
    modulo ENUM('CELEX', 'SEMINARIOS', 'DIPLOMADOS', 'UDI_SEGURIDAD') DEFAULT 'CELEX',
    nivel_seguridad ENUM('INFO', 'SUCCESS', 'WARNING', 'CRITICAL') DEFAULT 'INFO'
);

-- ============================================================================
-- INSERCIÓN DE DATOS INICIALES (SEEDS INSTITUCIONALES)
-- ============================================================================
`;

  // Docentes
  teachers.forEach(t => {
    sql += `INSERT INTO profesores_celex (id, nombre_completo, especialidad, idiomas_json, certificaciones, correo, telefono, semblanza, activo) VALUES 
('${t.id}', '${t.nombreCompleto.replace(/'/g, "''")}', '${t.especialidad.replace(/'/g, "''")}', '${JSON.stringify(t.idiomas)}', '${t.certificaciones.replace(/'/g, "''")}', '${t.correo}', '${t.telefono}', '${t.semblanza.replace(/'/g, "''")}', ${t.activo});\n`;
  });

  sql += '\n';

  // Cursos
  activities.forEach(a => {
    sql += `INSERT INTO cursos_idiomas_celex (id, nombre, idioma, nivel, subnivel, modalidad, profesor_id, cupo_maximo, cupo_ocupado, salon, dias_json, hora_inicio, hora_fin, turno, creditos_electiva, costo_interno, costo_externo, activa) VALUES 
('${a.id}', '${a.nombre.replace(/'/g, "''")}', '${a.idioma}', '${a.nivel}', '${a.subnivel}', '${a.modalidad}', '${a.profesorId}', ${a.cupoMaximo}, ${a.cupoOcupado}, '${a.salonOEspacio.replace(/'/g, "''")}', '${JSON.stringify(a.dias)}', '${a.horaInicio}:00', '${a.horaFin}:00', '${a.turno}', ${a.creditosElectiva}, ${a.costoInterno}, ${a.costoExterno}, ${a.activa});\n`;
  });

  sql += '\n-- Fin de Script SQL SISAE-CELEX UPIICSA IPN\n';

  return sql;
}
