-- ============================================================================
-- INSTITUTO POLITÉCNICO NACIONAL - UPIICSA
-- SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX
-- ESQUEMA COMPLETO PARA SUPABASE POSTGRESQL CON RFC
-- ============================================================================

-- 1. LIMPIEZA DE TABLAS PREVIAS
DROP TABLE IF EXISTS bitacora_auditoria_udi CASCADE;
DROP TABLE IF EXISTS inscripciones_acreditadas CASCADE;
DROP TABLE IF EXISTS solicitudes_preregistro CASCADE;
DROP TABLE IF EXISTS cursos_idiomas_celex CASCADE;
DROP TABLE IF EXISTS profesores_celex CASCADE;
DROP TABLE IF EXISTS alumnos_celex CASCADE;

-- 2. TABLA: PROFESORES
CREATE TABLE profesores_celex (
    id VARCHAR(50) PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    especialidad VARCHAR(200) NOT NULL,
    idiomas_json JSONB DEFAULT '[]'::jsonb,
    certificaciones TEXT,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    semblanza TEXT,
    activo BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(255),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: ALUMNOS (CON RFC OBLIGATORIO)
CREATE TABLE alumnos_celex (
    id VARCHAR(50) PRIMARY KEY,
    boleta VARCHAR(30) UNIQUE NOT NULL,
    rfc VARCHAR(13) NOT NULL,
    curp VARCHAR(18),
    tipo_aspirante VARCHAR(30) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(50),
    carrera VARCHAR(120) NOT NULL,
    semestre INT DEFAULT 1,
    turno VARCHAR(30) NOT NULL,
    creditos_acumulados INT DEFAULT 0,
    password_hash VARCHAR(255) DEFAULT '123456',
    fecha_registro DATE DEFAULT CURRENT_DATE
);

-- 4. TABLA: CURSOS DE IDIOMAS CELEX
CREATE TABLE cursos_idiomas_celex (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    idioma VARCHAR(50) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    subnivel VARCHAR(20) NOT NULL,
    modalidad VARCHAR(30) NOT NULL,
    profesor_id VARCHAR(50) REFERENCES profesores_celex(id) ON DELETE SET NULL,
    profesor_nombre VARCHAR(150),
    cupo_maximo INT NOT NULL DEFAULT 25,
    cupo_ocupado INT DEFAULT 0,
    salon VARCHAR(100) NOT NULL,
    dias_json JSONB DEFAULT '[]'::jsonb,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    turno VARCHAR(30) NOT NULL,
    creditos_electiva INT DEFAULT 3,
    costo_interno DECIMAL(10,2) DEFAULT 850.00,
    costo_externo DECIMAL(10,2) DEFAULT 1450.00,
    descripcion TEXT,
    requisitos TEXT,
    imagen_url VARCHAR(255),
    activa BOOLEAN DEFAULT TRUE,
    semestre_periodo VARCHAR(20) DEFAULT '2026-2',
    fecha_inicio VARCHAR(20) DEFAULT '10/02/2026',
    fecha_fin VARCHAR(20) DEFAULT '18/06/2026',
    fecha_examen_diagnostico VARCHAR(20)
);

-- 5. TABLA: SOLICITUDES DE PRE-REGISTRO
CREATE TABLE solicitudes_preregistro (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(40) UNIQUE NOT NULL,
    aspirante_nombre VARCHAR(150) NOT NULL,
    tipo_aspirante VARCHAR(30) NOT NULL,
    identificador VARCHAR(30) NOT NULL,
    rfc VARCHAR(13) NOT NULL,
    curp VARCHAR(18),
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    carrera VARCHAR(120) NOT NULL,
    curso_id VARCHAR(50) REFERENCES cursos_idiomas_celex(id) ON DELETE CASCADE,
    curso_nombre VARCHAR(150) NOT NULL,
    idioma VARCHAR(50) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    modalidad VARCHAR(30) NOT NULL,
    horario_deseado VARCHAR(100) NOT NULL,
    numero_referencia_pago VARCHAR(50) NOT NULL,
    monto_pago DECIMAL(10,2) NOT NULL,
    banco_convenio VARCHAR(100) DEFAULT 'BBVA Convenio CIE IPN 1849201',
    comprobante_pago_url TEXT,
    identificacion_url TEXT,
    fecha_registro VARCHAR(30) DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI'),
    estado VARCHAR(30) DEFAULT 'REGISTRADA',
    observaciones_admin TEXT,
    grupo_asignado VARCHAR(30),
    salon_asignado VARCHAR(100),
    profesor_asignado VARCHAR(150),
    horario_asignado VARCHAR(100)
);

-- 6. TABLA: INSCRIPCIONES ACREDITADAS
CREATE TABLE inscripciones_acreditadas (
    id VARCHAR(50) PRIMARY KEY,
    folio VARCHAR(40) UNIQUE NOT NULL,
    alumno_id VARCHAR(50) REFERENCES alumnos_celex(id) ON DELETE CASCADE,
    alumno_boleta VARCHAR(30) NOT NULL,
    alumno_rfc VARCHAR(13),
    alumno_curp VARCHAR(18),
    alumno_nombre VARCHAR(150) NOT NULL,
    alumno_tipo VARCHAR(30) NOT NULL,
    alumno_carrera VARCHAR(120),
    curso_id VARCHAR(50) REFERENCES cursos_idiomas_celex(id) ON DELETE CASCADE,
    curso_nombre VARCHAR(150) NOT NULL,
    idioma VARCHAR(50) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    grupo VARCHAR(30) NOT NULL,
    profesor_nombre VARCHAR(150) NOT NULL,
    horario_texto VARCHAR(100) NOT NULL,
    salon VARCHAR(100) NOT NULL,
    fecha_inscripcion VARCHAR(20) DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    estado VARCHAR(30) DEFAULT 'INSCRITO',
    porcentaje_asistencia INT DEFAULT 0,
    calificacion_o_constancia VARCHAR(50),
    referencia_bancaria_validada VARCHAR(50) NOT NULL,
    monto_pagado DECIMAL(10,2) NOT NULL
);

-- 7. TABLA: AUDITORIA UDI
CREATE TABLE bitacora_auditoria_udi (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(150) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    accion VARCHAR(100) NOT NULL,
    ip_origen VARCHAR(45) NOT NULL,
    detalles TEXT NOT NULL,
    modulo VARCHAR(50) DEFAULT 'CELEX',
    nivel_seguridad VARCHAR(20) DEFAULT 'INFO'
);

-- 8. DESACTIVAR RLS Y OTORGAR PERMISOS A LA APP (ANON / AUTHENTICATED)
ALTER TABLE profesores_celex DISABLE ROW LEVEL SECURITY;
ALTER TABLE alumnos_celex DISABLE ROW LEVEL SECURITY;
ALTER TABLE cursos_idiomas_celex DISABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_preregistro DISABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones_acreditadas DISABLE ROW LEVEL SECURITY;
ALTER TABLE bitacora_auditoria_udi DISABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;

-- 9. DATOS INICIALES (PROFESORES)
INSERT INTO profesores_celex (id, nombre_completo, especialidad, idiomas_json, certificaciones, correo, telefono, semblanza, activo, avatar_url)
VALUES 
('prof-01', 'Mtro. Mario Alberto Bizarro Romero', 'Coordinador General CELEX UPIICSA / Inglés Avanzado', '["Inglés"]'::jsonb, 'Mtro. en Lingüística Aplicada (IPN), Certificación Cambridge CPE Nivel C2, Diplomado UDI', 'mbizarror@ipn.mx', '55 5624 2000 ext. 70201', 'Más de 16 años de trayectoria académica en la enseñanza de lenguas anglosajonas.', true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('prof-02', 'Lic. Brenda Morales Estrada', 'Inglés Comunicativo, Gramática Aplicada y Niveles Básicos', '["Inglés"]'::jsonb, 'Lic. en Lengua Inglesa (UNAM), TKT Cambridge Band 4', 'bmoralese@ipn.mx', '55 5624 2000 ext. 70202', 'Especialista en pedagogía para estudiantes de áreas tecnológicas e ingenierías.', true, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
('prof-03', 'Mtra. Élodie Fournier Renard', 'Francés Académico, Cultura Francesa y Preparación DELF', '["Francés"]'::jsonb, 'Master FLE Université de la Sorbonne, Evaluadora DELF/DALF C2', 'efournier@ipn.mx', '55 5624 2000 ext. 70203', 'Docente francófona con vasta experiencia en movilidad estudiantil México-Francia.', true, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
('prof-04', 'Dr. Hans Weber Müller', 'Alemán Técnico para Ingenierías y Preparación Goethe', '["Alemán"]'::jsonb, 'Goethe-Zertifikat C2, DAAD Fachsprachenprüfer', 'hweberm@ipn.mx', '55 5624 2000 ext. 70204', 'Ingeniero y lingüista con experiencia en vinculación politécnica alemana.', true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
('prof-05', 'Lic. Giancarlo Rossi Benítez', 'Italiano General y Certificación CILS', '["Italiano"]'::jsonb, 'Certificazione DITALS II Università di Siena, CILS C2', 'grossib@ipn.mx', '55 5624 2000 ext. 70205', 'Docente titular de los cursos de italiano en CELEX UPIICSA desde 2018.', true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150')
ON CONFLICT (id) DO NOTHING;

-- 10. DATOS INICIALES (ALUMNOS CON RFC)
INSERT INTO alumnos_celex (id, boleta, rfc, curp, tipo_aspirante, nombre_completo, correo, telefono, carrera, semestre, turno, creditos_acumulados, password_hash, fecha_registro)
VALUES
('alu-01', '2023600123', 'HERA030415XX8', 'HERA030415HDFRRD04', 'INTERNO_IPN', 'Daniel Hernández Rodríguez', 'dhernandezr2300@alumno.ipn.mx', '55 1234 5678', 'Licenciatura en Ciencias de la Informática', 8, 'Matutino', 3, 'alumno123', '2026-01-15'),
('alu-02', '2022601144', 'AVMA020819L09', 'AVMA020819HDFMLL09', 'INTERNO_IPN', 'Alejandro Avila Morales', 'aavilam2200@alumno.ipn.mx', '55 9876 5432', 'Ingeniería en Inteligencia Artificial', 6, 'Vespertino', 3, 'alumno123', '2026-01-18'),
('alu-03', 'ROAA980512RB1', 'ROAA980512RB1', 'ROAA980512MDFRRB01', 'EXTERNO', 'Fernanda Joanna Hernández González', 'fer.hernandez.g@gmail.com', '55 4567 8901', 'Público Externo / Otra Institución', 1, 'Vespertino', 0, 'alumno123', '2026-01-20')
ON CONFLICT (id) DO NOTHING;

-- 11. DATOS INICIALES (CURSOS CELEX)
INSERT INTO cursos_idiomas_celex (id, nombre, idioma, nivel, subnivel, modalidad, profesor_id, profesor_nombre, cupo_maximo, cupo_ocupado, salon, dias_json, hora_inicio, hora_fin, turno, creditos_electiva, costo_interno, costo_externo, descripcion, requisitos, imagen_url, activa, semestre_periodo)
VALUES
('celex-ing-01', 'Inglés Básico 1 (Regular)', 'Inglés', 'Básico', 'B1', 'Regular', 'prof-02', 'Lic. Brenda Morales Estrada', 25, 21, 'Edificio CELEX - Aula 101', '["Lunes","Martes","Miércoles","Jueves"]'::jsonb, '07:00', '09:00', 'Matutino', 3, 850.00, 1450.00, 'Curso introductorio para aspirantes sin conocimientos previos o con nivel elemental.', 'Comprobante de pago bancario BBVA.', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600', true, '2026-2'),
('celex-ing-02', 'Inglés Básico 2 (Regular)', 'Inglés', 'Básico', 'B2', 'Regular', 'prof-02', 'Lic. Brenda Morales Estrada', 25, 19, 'Laboratorio Multimedia de Idiomas 1', '["Lunes","Martes","Miércoles","Jueves"]'::jsonb, '13:00', '15:00', 'Vespertino', 3, 850.00, 1450.00, 'Consolidación de estructuras verbales pasadas y futuras, desarrollo de fluidez conversacional.', 'Haber acreditado Inglés Básico 1 o examen diagnóstico.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600', true, '2026-2'),
('celex-fra-01', 'Francés Básico 1 (Regular)', 'Francés', 'Básico', 'B1', 'Regular', 'prof-03', 'Mtra. Élodie Fournier Renard', 20, 14, 'Edificio CELEX - Aula 204', '["Lunes","Miércoles"]'::jsonb, '14:00', '16:00', 'Vespertino', 3, 850.00, 1450.00, 'Iniciación en lengua francesa. Fonética, expresiones cotidianas y bases socioculturales.', 'Interés en la lengua y cultura francesa.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600', true, '2026-2'),
('celex-ale-01', 'Alemán Básico 1 (Regular)', 'Alemán', 'Básico', 'B1', 'Regular', 'prof-04', 'Dr. Hans Weber Müller', 20, 12, 'Edificio CELEX - Aula 202', '["Martes","Jueves"]'::jsonb, '13:00', '15:00', 'Vespertino', 3, 850.00, 1450.00, 'Introducción al idioma alemán para ingenierías. Gramática fundamental y vocabulario técnico.', 'Ninguno para nivel inicial.', 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600', true, '2026-2'),
('celex-ita-01', 'Italiano Básico 1 (Sabatino)', 'Italiano', 'Básico', 'B1', 'Sabatino', 'prof-05', 'Lic. Giancarlo Rossi Benítez', 25, 16, 'Edificio CELEX - Aula 103', '["Sábado"]'::jsonb, '08:00', '13:00', 'Sabatino', 3, 850.00, 1450.00, 'Modalidad sabatina intensiva. Comprensión lectora, fonética y expresión interactiva.', 'Disponibilidad sabatina.', 'https://images.unsplash.com/photo-1529154036634-a20c73328ee6?w=600', true, '2026-2')
ON CONFLICT (id) DO NOTHING;

-- 12. DATOS INICIALES (SOLICITUDES DE PRE-REGISTRO CON RFC)
INSERT INTO solicitudes_preregistro (id, folio, aspirante_nombre, tipo_aspirante, identificador, rfc, curp, correo, telefono, carrera, curso_id, curso_nombre, idioma, nivel, modalidad, horario_deseado, numero_referencia_pago, monto_pago, estado, observaciones_admin)
VALUES
('req-01', 'SISAE-CELEX-2026-0841', 'Daniel Hernández Rodríguez', 'INTERNO_IPN', '2023600123', 'HERA030415XX8', 'HERA030415HDFRRD04', 'dhernandezr2300@alumno.ipn.mx', '55 1234 5678', 'Licenciatura en Ciencias de la Informática', 'celex-ing-02', 'Inglés Básico 2 (Regular)', 'Inglés', 'Básico 2', 'Regular', 'Lun a Jue 13:00 - 15:00', 'BBVA-REF-902148', 850.00, 'EN_REVISION', NULL),
('req-02', 'SISAE-CELEX-2026-0842', 'Fernanda Joanna Hernández González', 'EXTERNO', 'ROAA980512RB1', 'ROAA980512RB1', 'ROAA980512MDFRRB01', 'fer.hernandez.g@gmail.com', '55 4567 8901', 'Público Externo / Otra Institución', 'celex-fra-01', 'Francés Básico 1 (Regular)', 'Francés', 'Básico 1', 'Regular', 'Lun y Mié 14:00 - 16:00', 'BBVA-REF-114872', 1450.00, 'REQUIERE_CORRECCION', 'El voucher bancario cargado presenta baja resolución. Favor de sustituir con fotografía nítida.'),
('req-03', 'SISAE-CELEX-2026-0839', 'Alejandro Avila Morales', 'INTERNO_IPN', '2022601144', 'AVMA020819L09', 'AVMA020819HDFMLL09', 'aavilam2200@alumno.ipn.mx', '55 9876 5432', 'Ingeniería en Inteligencia Artificial', 'celex-ale-01', 'Alemán Básico 1 (Regular)', 'Alemán', 'Básico 1', 'Regular', 'Mar y Jue 13:00 - 15:00', 'BBVA-REF-773912', 850.00, 'APROBADA', NULL)
ON CONFLICT (id) DO NOTHING;

-- 13. DATOS INICIALES (INSCRIPCIONES ACREDITADAS CON RFC)
INSERT INTO inscripciones_acreditadas (id, folio, alumno_id, alumno_boleta, alumno_rfc, alumno_curp, alumno_nombre, alumno_tipo, alumno_carrera, curso_id, curso_nombre, idioma, nivel, grupo, profesor_nombre, horario_texto, salon, fecha_inscripcion, estado, referencia_bancaria_validada, monto_pagado)
VALUES
('enr-01', 'SISAE-CELEX-2026-0839', 'alu-02', '2022601144', 'AVMA020819L09', 'AVMA020819HDFMLL09', 'Alejandro Avila Morales', 'INTERNO_IPN', 'Ingeniería en Inteligencia Artificial', 'celex-ale-01', 'Alemán Básico 1 (Regular)', 'Alemán', 'Básico 1', 'ALE-B1-01', 'Dr. Hans Weber Müller', 'Mar y Jue 13:00 - 15:00', 'Edificio CELEX - Aula 202', '2026-01-19', 'INSCRITO', 'BBVA-REF-773912', 850.00)
ON CONFLICT (id) DO NOTHING;
