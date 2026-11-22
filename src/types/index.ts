// ============================================================================
// SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX UPIICSA IPN
// DEFINICIÓN DE MODELOS Y TIPOS DE DATOS (DATA CONTRACTS)
// ============================================================================

export type UserRole = 'ALUMNO' | 'ADMIN' | 'DOCENTE';

export type TipoAspirante = 'INTERNO_IPN' | 'EXTERNO';

export type CareerUPIICSA =
  | 'Licenciatura en Ciencias de la Informática'
  | 'Ingeniería en Informática'
  | 'Ingeniería en Inteligencia Artificial'
  | 'Ingeniería en Transporte'
  | 'Ingeniería Industrial'
  | 'Licenciatura en Administración Industrial'
  | 'Público Externo / Otra Institución';

export type LanguageCategory =
  | 'Inglés'
  | 'Francés'
  | 'Alemán'
  | 'Italiano'
  | 'Portugués'
  | 'Japonés';

// Alias para compatibilidad con código existente
export type WorkshopCategory = LanguageCategory;

export type CourseLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Certificación';

export type CourseSubLevel =
  | 'B1' | 'B2' | 'B3' | 'B4' | 'B5'
  | 'I1' | 'I2' | 'I3' | 'I4' | 'I5'
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5'
  | 'TOEFL' | 'DELF' | 'Goethe' | 'CILS';

export type CourseModality = 'Regular' | 'Intensivo' | 'Sabatino';

export type TurnoType = 'Matutino' | 'Vespertino' | 'Sabatino' | 'Mixto';

export type PreRegistrationStatus =
  | 'REGISTRADA'
  | 'EN_REVISION'
  | 'REQUIERE_CORRECCION'
  | 'APROBADA'
  | 'RECHAZADA';

export type EnrollmentStatus = 'INSCRITO' | 'EN_CURSO' | 'ACREDITADO' | 'CANCELADO';

export type AnnouncementPriority = 'URGENTE' | 'CONVOCATORIA' | 'EVENTO' | 'GENERAL';

// ---------------------------------------------------------------------------
// Modelos de Entidades (Base de Datos Relacional)
// ---------------------------------------------------------------------------

export interface Student {
  id: string;             // UUID o Boleta / RFC
  boleta: string;         // 10 dígitos (Internos) o "EXT-" + RFC (Externos)
  rfc?: string;           // RFC oficial con homoclave (12-13 caracteres)
  curp?: string;          // Opcional para retrocompatibilidad
  nombreCompleto: string;
  correo: string;         // institucional @ipn.mx o correo personal
  telefono: string;
  tipoAspirante: TipoAspirante;
  carrera: CareerUPIICSA;
  semestre?: number;      // 1 al 10 si es interno
  turno: TurnoType;
  nivelesAcreditados?: string[]; // ej. ["Inglés B1", "Inglés B2"]
  creditosAcumulados: number;    // Para acreditación de titulación IPN
  password?: string;
  fechaRegistro: string;
}

export interface Teacher {
  id: string;
  nombreCompleto: string;
  especialidad: string;          // Ej: "Docente Certificado de Inglés / Exámenes TOEFL"
  idiomas: LanguageCategory[];
  certificaciones: string;       // Ej: "CELTA, CAE C2 Cambridge, TOEFL ITP 660"
  correo: string;
  telefono: string;
  semblanza: string;
  activo: boolean;
  avatarUrl?: string;
  password?: string;
}

export interface CelexCourse {
  id: string;
  nombre: string;                // Ej: "Inglés Básico 2 (Regular)", "Francés Intermedio 1"
  idioma: LanguageCategory;
  categoria: LanguageCategory;   // compatibilidad
  nivel: CourseLevel;
  subnivel: string;              // B1, B2, I1, etc.
  modalidad: CourseModality;
  profesorId: string;
  profesorNombre?: string;
  cupoMaximo: number;
  cupoOcupado: number;
  salonOEspacio: string;         // Ej: "Edificio CELEX - Aula 102", "Lab Multimedia de Idiomas 1"
  dias: string[];                // Ej: ["Lunes", "Martes", "Miércoles", "Jueves"] o ["Sábado"]
  horaInicio: string;            // "07:00"
  horaFin: string;               // "09:00"
  turno: TurnoType;
  creditosElectiva: number;      // Validez curricular o electiva
  costoInterno: number;          // $850.00 MXN
  costoExterno: number;          // $1,450.00 MXN
  descripcion: string;
  requisitos: string;
  imagenUrl: string;
  activa: boolean;
  semestrePeriodo: string;       // Ej: "2026-2"
  fechaInicio?: string;
  fechaFin?: string;
  fechaExamenDiagnostico?: string;
}

// Alias para compatibilidad con componentes que usan CulturalActivity
export type CulturalActivity = CelexCourse;

export interface PreRegistrationRequest {
  id: string;
  folio: string;                 // Ej: "SISAE-CELEX-2026-0842"
  aspiranteNombre: string;
  tipoAspirante: TipoAspirante;
  identificador: string;         // Boleta si es Interno, RFC si es Externo
  boleta?: string;               // Boleta opcional si es interno
  rfc: string;                   // RFC oficial obligatorio
  curp?: string;                 // Opcional para retrocompatibilidad
  correo: string;
  telefono: string;
  carrera: CareerUPIICSA;
  cursoId: string;
  cursoNombre: string;
  idioma: LanguageCategory;
  nivel: string;
  modalidad: CourseModality;
  horarioDeseado: string;
  numeroReferenciaPago: string;  // Folio de depósito bancario BBVA
  montoPago: number;             // $850.00 o $1,450.00
  bancoConvenio: string;         // "BBVA Convenio CIE IPN 1849201"
  comprobantePagoUrl: string;    // Voucher digital
  identificacionUrl?: string;    // INE / Credencial IPN
  fechaRegistro: string;
  estado: PreRegistrationStatus;
  observacionesAdmin?: string;   // Observaciones emitidas por el personal CELEX
  grupoAsignado?: string;        // Ej: "ING-B2-03"
  salonAsignado?: string;        // Ej: "Edificio CELEX A-201"
  profesorAsignado?: string;
  horarioAsignado?: string;
  diasAsignados?: string[];
  notificacionEnviada?: {
    correo: boolean;
    whatsApp: boolean;
    fechaEnvio?: string;
  };
}

export interface EvaluationRecord {
  primerOrdinario?: number;      // 0 - 100 (Examen Medio / 1er Parcial Ordinario)
  segundoOrdinario?: number;     // 0 - 100 (Examen Final / 2do Parcial Ordinario)
  tareasActividades?: number;    // 0 - 100 (Evaluación Continua / Tareas / Asistencia)
  calificacionFinal?: number;    // 0 - 100 (Calificación Total)
  acreditado?: boolean;          // Total >= 80 (RF-27, RN-05)
  publicada: boolean;            // Si fue liberada para consulta del alumno (DD-15)
  oportunidad: number;           // 1, 2 o 3 (RN-06: 3 oportunidades antes de examen ubicación)
  observacionesDocente?: string; // Comentarios / retroalimentación del profesor
  fechaEvaluacion?: string;      // Fecha de registro
  docenteNombre?: string;        // Nombre del profesor que asentó
}

export interface AcademicProgressInfo {
  nivelActual: string;
  siguienteNivel: string;
  puedeAvanzar: boolean;
  motivoBloqueo?: string;
  oportunidadesUsadas: number;   // 1, 2 o 3
  maxOportunidades: number;      // 3
  requiereExamenUbicacion: boolean; // Si llegó al 3er intento no acreditado
  elegibleBajaTemporal: boolean; // RN-07: solo a partir de Intermedio 1 aprobado
  bajaTemporalDetalle: string;
  constanciaBasicoElegible: boolean; // RN-09: 5 módulos básicos
  constanciaBasicoProgreso: number;  // Ej: 3 de 5 módulos
  requisitoTitulacionCumplido: boolean;
  creditosTotales: number;
}

export interface Enrollment {
  id: string;
  folio: string;                 // Ej: "SISAE-CELEX-2026-0842"
  alumnoId: string;
  alumnoBoleta: string;
  alumnoRfc?: string;
  alumnoCurp?: string;
  alumnoNombre: string;
  alumnoTipo: TipoAspirante;
  alumnoCarrera: CareerUPIICSA;
  actividadId: string;
  actividadNombre: string;
  actividadCategoria: LanguageCategory;
  idioma: LanguageCategory;
  nivel: string;
  grupo: string;                 // Ej: "1CE01", "ING-B2-03"
  profesorId?: string;
  profesorNombre: string;
  horarioTexto: string;
  salon: string;
  fechaInscripcion: string;
  estado: EnrollmentStatus;
  porcentajeAsistencia: number;  // 0 - 100
  calificacionOConstancia?: string;
  evaluacion?: EvaluationRecord;  // Calificaciones por ordinarios
  referenciaBancariaValidada: string;
  montoPagado: number;
  qrCodeUrl?: string;
}

export interface Announcement {
  id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  prioridad: AnnouncementPriority;
  categoria?: 'CONVOCATORIA' | 'DIAGNOSTICO' | 'REINSCRIPCION' | 'TITULACION' | 'GENERAL';
  autor: string;                 // Ej: "Coordinación CELEX - UPIICSA"
  fechaPublicacion: string;
  imagenUrl?: string;
  activa: boolean;
  fijado: boolean;
}

// ---------------------------------------------------------------------------
// Auditoría de Seguridad UDI & Transacciones de 3 Capas
// ---------------------------------------------------------------------------

export type LayerType = 'CAPA_1_PRESENTACION' | 'CAPA_2_NEGOCIO' | 'CAPA_3_DATOS';

export interface LayerTransactionLog {
  id: string;
  timestamp: string;
  capa: LayerType;
  accion: string;
  detalles: string;
  payload?: any;
  estado: 'SUCCESS' | 'WARNING' | 'ERROR';
  tiempoEjecucionMs: number;
}

export interface LayerMetrics {
  totalPeticionesCapa1: number;
  totalValidacionesCapa2: number;
  totalConsultasCapa3: number;
  tiempoPromedioMs: number;
}

export interface AuditSecurityLog {
  id: string;
  timestamp: string;
  usuario: string;
  rol: UserRole;
  accion: string;                // Ej: "LOGIN_SUCCESS", "VALIDAR_PAGO", "OBSERVACION_EXPEDIENTE", "ASIGNAR_GRUPO"
  ipOrigen: string;
  detalles: string;
  modulo: 'CELEX' | 'SEMINARIOS' | 'DIPLOMADOS' | 'UDI_SEGURIDAD';
  nivelSeguridad: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

// ---------------------------------------------------------------------------
// Sesión y Auth
// ---------------------------------------------------------------------------

export interface AuthSession {
  user: {
    id: string;
    identificador: string;       // Boleta, RFC, usuario admin o correo docente
    rfc?: string;
    curp?: string;
    nombre: string;
    correo: string;
    rol: UserRole;
    tipoAspirante?: TipoAspirante;
    carrera?: CareerUPIICSA;
    semestre?: number;
    turno?: TurnoType;
    teacherId?: string;
    especialidad?: string;
    certificaciones?: string;
    avatarUrl?: string;
  } | null;
  token?: string;                // JWT institucional simulado
  isAuthenticated: boolean;
}
