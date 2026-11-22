// ============================================================================
// SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX UPIICSA IPN
// CAPA 3: ACCESO A DATOS Y PERSISTENCIA (DATA ACCESS LAYER / REPOSITORY)
// ============================================================================

import type { 
  Student, 
  Teacher, 
  CelexCourse, 
  Enrollment, 
  Announcement, 
  PreRegistrationRequest, 
  AuditSecurityLog,
  EvaluationRecord 
} from '../types';

import { 
  SEED_STUDENTS, 
  SEED_TEACHERS, 
  SEED_ACTIVITIES, 
  SEED_REQUESTS, 
  SEED_ENROLLMENTS, 
  SEED_ANNOUNCEMENTS, 
  SEED_AUDIT_LOGS 
} from '../data/dbSeed';
import { supabase } from './supabaseClient';

const STORAGE_KEYS = {
  STUDENTS: 'sisae_celex_alumnos_v3',
  TEACHERS: 'sisae_celex_profesores_v3',
  ACTIVITIES: 'sisae_celex_cursos_v3',
  REQUESTS: 'sisae_celex_solicitudes_v3',
  ENROLLMENTS: 'sisae_celex_inscripciones_v3',
  ANNOUNCEMENTS: 'sisae_celex_anuncios_v3',
  AUDIT_LOGS: 'sisae_celex_auditoria_v3',
  INITIALIZED: 'sisae_celex_initialized_v3'
};

class DataRepository {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDatabase();
    this.syncFromSupabase();
  }

  // Sincroniza en segundo plano con PostgreSQL en Supabase
  public async syncFromSupabase() {
    try {
      // 1. Alumnos desde PostgreSQL
      const { data: dbStudents } = await supabase.from('alumnos_celex').select('*');
      if (dbStudents && dbStudents.length > 0) {
        const mappedStudents: Student[] = dbStudents.map((s: Record<string, any>) => ({
          id: s.id,
          boleta: s.boleta,
          rfc: s.rfc,
          curp: s.curp,
          tipoAspirante: s.tipo_aspirante,
          nombreCompleto: s.nombre_completo,
          correo: s.correo,
          telefono: s.telefono || '',
          carrera: s.carrera,
          semestre: s.semestre,
          turno: s.turno,
          creditosAcumulados: s.creditos_acumulados || 0,
          nivelesAcreditados: [],
          fechaRegistro: s.fecha_registro
        }));
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(mappedStudents));
      }

      // 2. Pre-registros desde PostgreSQL
      const { data: dbRequests } = await supabase.from('solicitudes_preregistro').select('*').order('fecha_registro', { ascending: false });
      if (dbRequests && dbRequests.length > 0) {
        const mappedRequests: PreRegistrationRequest[] = dbRequests.map((r: Record<string, any>) => ({
          id: r.id,
          folio: r.folio,
          aspiranteNombre: r.aspirante_nombre,
          tipoAspirante: r.tipo_aspirante,
          identificador: r.identificador,
          rfc: r.rfc,
          curp: r.curp,
          correo: r.correo,
          telefono: r.telefono,
          carrera: r.carrera,
          cursoId: r.curso_id,
          cursoNombre: r.curso_nombre,
          idioma: r.idioma,
          nivel: r.nivel,
          modalidad: r.modalidad,
          horarioDeseado: r.horario_deseado,
          numeroReferenciaPago: r.numero_referencia_pago,
          montoPago: Number(r.monto_pago),
          bancoConvenio: r.banco_convenio,
          comprobantePagoUrl: r.comprobante_pago_url,
          identificacionUrl: r.identificacion_url,
          fechaRegistro: r.fecha_registro,
          estado: r.estado,
          observacionesAdmin: r.observaciones_admin,
          grupoAsignado: r.grupo_asignado,
          salonAsignado: r.salon_asignado,
          profesorAsignado: r.profesor_asignado,
          horarioAsignado: r.horario_asignado,
          notificacionEnviada: { correo: true, whatsApp: true, fechaEnvio: r.fecha_registro }
        }));
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mappedRequests));
      }

      // 3. Inscripciones acreditadas desde PostgreSQL
      const { data: dbEnrollments } = await supabase.from('inscripciones_acreditadas').select('*');
      if (dbEnrollments && dbEnrollments.length > 0) {
        const mappedEnrollments: Enrollment[] = dbEnrollments.map((e: Record<string, any>) => ({
          id: e.id,
          folio: e.folio,
          alumnoId: e.alumno_id,
          alumnoBoleta: e.alumno_boleta,
          alumnoRfc: e.alumno_rfc,
          alumnoCurp: e.alumno_curp,
          alumnoNombre: e.alumno_nombre,
          alumnoTipo: e.alumno_tipo,
          alumnoCarrera: e.alumno_carrera,
          actividadId: e.curso_id,
          actividadNombre: e.curso_nombre,
          actividadCategoria: e.idioma,
          idioma: e.idioma,
          nivel: e.nivel,
          grupo: e.grupo,
          profesorNombre: e.profesor_nombre,
          horarioTexto: e.horario_texto,
          salon: e.salon,
          fechaInscripcion: e.fecha_inscripcion,
          estado: e.estado,
          porcentajeAsistencia: e.porcentaje_asistencia,
          calificacionOConstancia: e.calificacion_o_constancia,
          referenciaBancariaValidada: e.referencia_bancaria_validada,
          montoPagado: Number(e.monto_pagado)
        }));
        localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(mappedEnrollments));
      }

      this.notifyListeners();
    } catch (err) {
      console.warn('Sync from Supabase fallback to localStorage:', err);
    }
  }

  // Inicializa la base de datos con los seeds institucionales de CELEX UPIICSA
  public initDatabase(forceReset: boolean = false) {
    if (forceReset || !localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(SEED_TEACHERS));
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(SEED_ENROLLMENTS));
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      this.notifyListeners();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  // -------------------------------------------------------------------------
  // TABLA: ALUMNOS / ASPIRANTES (INTERNOS Y EXTERNOS)
  // -------------------------------------------------------------------------
  public getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      return data ? JSON.parse(data) : SEED_STUDENTS;
    } catch {
      return SEED_STUDENTS;
    }
  }

  public getStudentByBoleta(boleta: string): Student | undefined {
    return this.getStudents().find(
      s => s.boleta.trim().toLowerCase() === boleta.trim().toLowerCase() ||
           (s.rfc && s.rfc.trim().toLowerCase() === boleta.trim().toLowerCase()) ||
           (s.curp && s.curp.trim().toLowerCase() === boleta.trim().toLowerCase())
    );
  }

  public getStudentById(id: string): Student | undefined {
    return this.getStudents().find(s => s.id === id);
  }

  public saveStudent(student: Student): Student {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === student.id || s.boleta === student.boleta);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.unshift(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    this.notifyListeners();

    // Persistencia en PostgreSQL (Supabase)
    supabase.from('alumnos_celex').upsert({
      id: student.id,
      boleta: student.boleta,
      rfc: student.rfc,
      curp: student.curp,
      tipo_aspirante: student.tipoAspirante,
      nombre_completo: student.nombreCompleto,
      correo: student.correo,
      telefono: student.telefono,
      carrera: student.carrera,
      semestre: student.semestre || 1,
      turno: student.turno,
      creditos_acumulados: student.creditosAcumulados || 0
    }).then(({ error }) => {
      if (error) console.warn('Supabase saveStudent warning:', error.message);
    });

    return student;
  }

  // -------------------------------------------------------------------------
  // TABLA: PROFESORES / DOCENTES DE LENGUAS EXTRANJERAS
  // -------------------------------------------------------------------------
  public getTeachers(): Teacher[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      return data ? JSON.parse(data) : SEED_TEACHERS;
    } catch {
      return SEED_TEACHERS;
    }
  }

  public getTeacherById(id: string): Teacher | undefined {
    return this.getTeachers().find(t => t.id === id);
  }

  public saveTeacher(teacher: Teacher): Teacher {
    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === teacher.id);
    if (index >= 0) {
      teachers[index] = teacher;
    } else {
      teachers.unshift(teacher);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    this.notifyListeners();
    return teacher;
  }

  public deleteTeacher(id: string): boolean {
    const teachers = this.getTeachers().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    this.notifyListeners();
    return true;
  }

  // -------------------------------------------------------------------------
  // TABLA: CURSOS DE IDIOMAS (OFERTA ACADÉMICA CELEX)
  // -------------------------------------------------------------------------
  public getActivities(): CelexCourse[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : SEED_ACTIVITIES;
    } catch {
      return SEED_ACTIVITIES;
    }
  }

  public getActivityById(id: string): CelexCourse | undefined {
    return this.getActivities().find(a => a.id === id);
  }

  public saveActivity(activity: CelexCourse): CelexCourse {
    const activities = this.getActivities();
    const index = activities.findIndex(a => a.id === activity.id);
    if (index >= 0) {
      activities[index] = activity;
    } else {
      activities.unshift(activity);
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    this.notifyListeners();
    return activity;
  }

  public deleteActivity(id: string): boolean {
    const activities = this.getActivities().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    this.notifyListeners();
    return true;
  }

  // -------------------------------------------------------------------------
  // TABLA: SOLICITUDES DE PRE-REGISTRO CELEX (BANDEJA CENTRALIZADA UDI)
  // -------------------------------------------------------------------------
  public getRequests(): PreRegistrationRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return data ? JSON.parse(data) : SEED_REQUESTS;
    } catch {
      return SEED_REQUESTS;
    }
  }

  public getRequestById(id: string): PreRegistrationRequest | undefined {
    return this.getRequests().find(r => r.id === id);
  }

  public getRequestByFolio(folio: string): PreRegistrationRequest | undefined {
    return this.getRequests().find(r => r.folio.trim().toLowerCase() === folio.trim().toLowerCase());
  }

  public getRequestsForApplicant(identificador: string): PreRegistrationRequest[] {
    const cleanId = identificador.trim().toLowerCase();
    return this.getRequests().filter(
      r => r.identificador.toLowerCase() === cleanId ||
           (r.rfc && r.rfc.toLowerCase() === cleanId) ||
           (r.curp && r.curp.toLowerCase() === cleanId) ||
           (r.boleta && r.boleta.toLowerCase() === cleanId) ||
           r.correo.toLowerCase() === cleanId
    );
  }

  public saveRequest(request: PreRegistrationRequest): PreRegistrationRequest {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === request.id || r.folio === request.folio);
    if (index >= 0) {
      requests[index] = request;
    } else {
      requests.unshift(request);
    }
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    this.notifyListeners();

    // Persistencia en PostgreSQL (Supabase)
    supabase.from('solicitudes_preregistro').upsert({
      id: request.id,
      folio: request.folio,
      aspirante_nombre: request.aspiranteNombre,
      tipo_aspirante: request.tipoAspirante,
      identificador: request.identificador,
      rfc: request.rfc,
      curp: request.curp,
      correo: request.correo,
      telefono: request.telefono,
      carrera: request.carrera,
      curso_id: request.cursoId,
      curso_nombre: request.cursoNombre,
      idioma: request.idioma,
      nivel: request.nivel,
      modalidad: request.modalidad,
      horario_deseado: request.horarioDeseado,
      numero_referencia_pago: request.numeroReferenciaPago,
      monto_pago: request.montoPago,
      banco_convenio: request.bancoConvenio,
      comprobante_pago_url: request.comprobantePagoUrl,
      identificacion_url: request.identificacionUrl,
      fecha_registro: request.fechaRegistro,
      estado: request.estado,
      observaciones_admin: request.observacionesAdmin,
      grupo_asignado: request.grupoAsignado,
      salon_asignado: request.salonAsignado,
      profesor_asignado: request.profesorAsignado,
      horario_asignado: request.horarioAsignado
    }).then(({ error }) => {
      if (error) console.warn('Supabase saveRequest warning:', error.message);
    });

    return request;
  }

  public deleteRequest(id: string): boolean {
    const requests = this.getRequests().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    this.notifyListeners();
    return true;
  }

  // -------------------------------------------------------------------------
  // TABLA: INSCRIPCIONES ACREDITADAS (CÉDULAS OFICIALES CON QR)
  // -------------------------------------------------------------------------
  public getEnrollments(): Enrollment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS);
      return data ? JSON.parse(data) : SEED_ENROLLMENTS;
    } catch {
      return SEED_ENROLLMENTS;
    }
  }

  public getEnrollmentsByStudent(studentBoletaOrRfc: string): Enrollment[] {
    const clean = studentBoletaOrRfc.trim().toLowerCase();
    return this.getEnrollments().filter(
      e => e.alumnoBoleta.toLowerCase() === clean ||
           (e.alumnoRfc && e.alumnoRfc.toLowerCase() === clean) ||
           (e.alumnoCurp && e.alumnoCurp.toLowerCase() === clean) ||
           e.alumnoId.toLowerCase() === clean
    );
  }

  public getEnrollmentById(id: string): Enrollment | undefined {
    return this.getEnrollments().find(e => e.id === id);
  }

  public getEnrollmentByFolio(folio: string): Enrollment | undefined {
    return this.getEnrollments().find(e => e.folio.trim().toLowerCase() === folio.trim().toLowerCase());
  }

  public saveEnrollment(enrollment: Enrollment): Enrollment {
    const enrollments = this.getEnrollments();
    const index = enrollments.findIndex(e => e.id === enrollment.id || e.folio === enrollment.folio);
    if (index >= 0) {
      enrollments[index] = enrollment;
    } else {
      enrollments.unshift(enrollment);
    }
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    this.notifyListeners();

    // Persistencia en PostgreSQL (Supabase)
    supabase.from('inscripciones_acreditadas').upsert({
      id: enrollment.id,
      folio: enrollment.folio,
      alumno_id: enrollment.alumnoId,
      alumno_boleta: enrollment.alumnoBoleta,
      alumno_rfc: enrollment.alumnoRfc,
      alumno_curp: enrollment.alumnoCurp,
      alumno_nombre: enrollment.alumnoNombre,
      alumno_tipo: enrollment.alumnoTipo,
      alumno_carrera: enrollment.alumnoCarrera,
      curso_id: enrollment.actividadId,
      curso_nombre: enrollment.actividadNombre,
      idioma: enrollment.idioma,
      nivel: enrollment.nivel,
      grupo: enrollment.grupo,
      profesor_nombre: enrollment.profesorNombre,
      horario_texto: enrollment.horarioTexto,
      salon: enrollment.salon,
      fecha_inscripcion: enrollment.fechaInscripcion,
      estado: enrollment.estado,
      porcentaje_asistencia: enrollment.porcentajeAsistencia,
      calificacion_o_constancia: enrollment.calificacionOConstancia,
      referencia_bancaria_validada: enrollment.referenciaBancariaValidada,
      monto_pagado: enrollment.montoPagado
    }).then(({ error }) => {
      if (error) console.warn('Supabase saveEnrollment warning:', error.message);
    });

    return enrollment;
  }

  public updateEnrollmentEvaluation(enrollmentId: string, evaluacion: EvaluationRecord): Enrollment | undefined {
    const enrollments = this.getEnrollments();
    const index = enrollments.findIndex(e => e.id === enrollmentId);
    if (index >= 0) {
      enrollments[index].evaluacion = evaluacion;
      if (evaluacion.calificacionFinal !== undefined) {
        enrollments[index].calificacionOConstancia = evaluacion.acreditado
          ? `${evaluacion.calificacionFinal}/100 - Acreditado`
          : `${evaluacion.calificacionFinal}/100 - No Acreditado`;
        if (evaluacion.acreditado) {
          enrollments[index].estado = 'ACREDITADO';
        }
      }
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
      this.notifyListeners();
      return enrollments[index];
    }
    return undefined;
  }

  public publishEnrollmentsByGroup(grupo: string, publicada: boolean): number {
    const enrollments = this.getEnrollments();
    let updated = 0;
    enrollments.forEach(e => {
      if (e.grupo === grupo) {
        if (e.evaluacion) {
          e.evaluacion.publicada = publicada;
        } else {
          e.evaluacion = {
            publicada,
            oportunidad: 1,
            fechaEvaluacion: new Date().toLocaleDateString('es-MX')
          };
        }
        updated++;
      }
    });
    if (updated > 0) {
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
      this.notifyListeners();
    }
    return updated;
  }

  public deleteEnrollment(id: string): boolean {
    const enrollments = this.getEnrollments().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    this.notifyListeners();
    return true;
  }

  // -------------------------------------------------------------------------
  // TABLA: AVISOS Y CONVOCATORIAS OFICIALES CELEX
  // -------------------------------------------------------------------------
  public getAnnouncements(): Announcement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return data ? JSON.parse(data) : SEED_ANNOUNCEMENTS;
    } catch {
      return SEED_ANNOUNCEMENTS;
    }
  }

  public saveAnnouncement(announcement: Announcement): Announcement {
    const announcements = this.getAnnouncements();
    const index = announcements.findIndex(a => a.id === announcement.id);
    if (index >= 0) {
      announcements[index] = announcement;
    } else {
      announcements.unshift(announcement);
    }
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    this.notifyListeners();
    return announcement;
  }

  public deleteAnnouncement(id: string): boolean {
    const announcements = this.getAnnouncements().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    this.notifyListeners();
    return true;
  }

  // -------------------------------------------------------------------------
  // TABLA: BITÁCORA DE AUDITORÍA Y SEGURIDAD UDI
  // -------------------------------------------------------------------------
  public getAuditLogs(): AuditSecurityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : SEED_AUDIT_LOGS;
    } catch {
      return SEED_AUDIT_LOGS;
    }
  }

  public addAuditLog(log: Omit<AuditSecurityLog, 'id' | 'timestamp'>): AuditSecurityLog {
    const logs = this.getAuditLogs();
    const newLog: AuditSecurityLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    logs.unshift(newLog);
    // Limitar a los 100 eventos más recientes
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(trimmed));
    this.notifyListeners();

    // Persistencia opcional en PostgreSQL (Supabase)
    supabase.from('bitacora_auditoria_udi').insert({
      id: newLog.id,
      timestamp: new Date().toISOString(),
      usuario: newLog.usuario,
      rol: newLog.rol,
      accion: newLog.accion,
      ip_origen: newLog.ipOrigen,
      detalles: newLog.detalles,
      modulo: newLog.modulo,
      nivel_seguridad: newLog.nivelSeguridad
    }).then(({ error }) => {
      if (error) console.warn('Supabase audit warning:', error.message);
    });

    return newLog;
  }
}

export const dbRepository = new DataRepository();
