// ============================================================================
// SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX UPIICSA IPN
// CAPA 2: LÓGICA DE NEGOCIO - PRE-REGISTRO, VALIDACIÓN Y ASIGNACIÓN (ENROLLMENT SERVICE)
// ============================================================================
// Implementa el flujo de validación condicional y asignación escolar de CELEX:
// Pre-registro -> Revisión de personal UDI/CELEX -> Aprobación con asignación
// de grupo/salón/profesor O Retorno con observaciones para corrección.

import { dbRepository } from '../layer3_data/dbRepository';
import { layerLogger } from './layerLogger';
import type { 
  Enrollment, 
  Student, 
  CelexCourse, 
  PreRegistrationRequest, 
  TipoAspirante, 
  CareerUPIICSA 
} from '../types';

class EnrollmentService {
  public getAllEnrollments(): Enrollment[] {
    return dbRepository.getEnrollments();
  }

  public getEnrollmentsForStudent(studentBoletaOrId: string): Enrollment[] {
    return dbRepository.getEnrollmentsByStudent(studentBoletaOrId);
  }

  public getAllRequests(): PreRegistrationRequest[] {
    return dbRepository.getRequests();
  }

  public getRequestsForStudent(identificador: string): PreRegistrationRequest[] {
    return dbRepository.getRequestsForApplicant(identificador);
  }

  // -------------------------------------------------------------------------
  // VALIDACIÓN DE TRASLAPE DE HORARIOS ENTRE CURSOS DE IDIOMAS
  // -------------------------------------------------------------------------
  public hasTimeConflict(newCourse: CelexCourse, existingEnrollments: Enrollment[]): { conflict: boolean; conflictingCourseName?: string } {
    for (const enr of existingEnrollments) {
      if (enr.estado === 'CANCELADO') continue;

      const enrolledCourse = dbRepository.getActivityById(enr.actividadId);
      if (!enrolledCourse) continue;

      const commonDays = newCourse.dias.filter(day => enrolledCourse.dias.includes(day));
      if (commonDays.length > 0) {
        const newStart = this.timeToMinutes(newCourse.horaInicio);
        const newEnd = this.timeToMinutes(newCourse.horaFin);
        const existStart = this.timeToMinutes(enrolledCourse.horaInicio);
        const existEnd = this.timeToMinutes(enrolledCourse.horaFin);

        const overlap = Math.max(newStart, existStart) < Math.min(newEnd, existEnd);
        if (overlap) {
          return {
            conflict: true,
            conflictingCourseName: enrolledCourse.nombre
          };
        }
      }
    }

    return { conflict: false };
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  // -------------------------------------------------------------------------
  // PASO 1 Y 2: ENVÍO DE SOLICITUD DE PRE-REGISTRO POR EL ASPIRANTE
  // -------------------------------------------------------------------------
  public submitPreRegistration(data: {
    aspiranteNombre: string;
    tipoAspirante: TipoAspirante;
    identificador: string;
    rfc: string;
    curp?: string;
    correo: string;
    telefono: string;
    carrera: CareerUPIICSA;
    cursoId: string;
    horarioDeseado?: string;
    numeroReferenciaPago: string;
    comprobantePagoUrl?: string;
    identificacionUrl?: string;
  }): { success: boolean; message: string; request?: PreRegistrationRequest } {
    const course = dbRepository.getActivityById(data.cursoId);
    if (!course) {
      return { success: false, message: 'El curso de idiomas seleccionado no existe.' };
    }

    if (course.cupoOcupado >= course.cupoMaximo) {
      return { success: false, message: 'El cupo para este curso se encuentra temporalmente agotado.' };
    }

    if (!data.numeroReferenciaPago || data.numeroReferenciaPago.trim().length < 4) {
      return { success: false, message: 'Debes capturar el número de referencia o autorización bancaria del depósito.' };
    }

    const folioNum = Math.floor(1000 + Math.random() * 9000);
    const folio = `SISAE-CELEX-2026-${folioNum}`;
    const monto = data.tipoAspirante === 'INTERNO_IPN' ? course.costoInterno : course.costoExterno;

    const newRequest: PreRegistrationRequest = {
      id: `req-${Date.now()}`,
      folio,
      aspiranteNombre: data.aspiranteNombre.trim(),
      tipoAspirante: data.tipoAspirante,
      identificador: data.identificador.trim(),
      rfc: data.rfc.trim().toUpperCase(),
      curp: data.curp ? data.curp.trim().toUpperCase() : undefined,
      correo: data.correo.trim().toLowerCase(),
      telefono: data.telefono.trim(),
      carrera: data.carrera,
      cursoId: course.id,
      cursoNombre: course.nombre,
      idioma: course.idioma,
      nivel: `${course.nivel} (${course.subnivel})`,
      modalidad: course.modalidad,
      horarioDeseado: data.horarioDeseado || `${course.dias.join(', ')} ${course.horaInicio} - ${course.horaFin}`,
      numeroReferenciaPago: data.numeroReferenciaPago.trim(),
      montoPago: monto,
      bancoConvenio: 'BBVA Convenio CIE IPN 1849201',
      comprobantePagoUrl: data.comprobantePagoUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      identificacionUrl: data.identificacionUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
      fechaRegistro: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estado: 'EN_REVISION',
      notificacionEnviada: {
        correo: true,
        whatsApp: true,
        fechaEnvio: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    };

    dbRepository.saveRequest(newRequest);

    // Si el alumno no existe en la base de datos de usuarios, guardarlo como prospecto
    const existingStudent = dbRepository.getStudentByBoleta(data.identificador);
    if (!existingStudent) {
      dbRepository.saveStudent({
        id: `alu-${Date.now()}`,
        boleta: data.identificador,
        rfc: data.rfc.trim().toUpperCase(),
        curp: data.curp,
        nombreCompleto: data.aspiranteNombre,
        correo: data.correo,
        telefono: data.telefono,
        tipoAspirante: data.tipoAspirante,
        carrera: data.carrera,
        semestre: 1,
        turno: course.turno,
        creditosAcumulados: 0,
        fechaRegistro: new Date().toISOString().split('T')[0]
      });
    }

    dbRepository.addAuditLog({
      usuario: `${data.aspiranteNombre} (${data.identificador})`,
      rol: 'ALUMNO',
      accion: 'NUEVA_SOLICITUD_PREREGISTRO',
      ipOrigen: '148.204.67.12',
      detalles: `Emitido Folio ${folio} para el curso ${course.nombre}. Voucher y referencia ${data.numeroReferenciaPago} enviados a validación UDI.`,
      modulo: 'CELEX',
      nivelSeguridad: 'INFO'
    });

    layerLogger.addLog(
      'CAPA_2_NEGOCIO',
      'SUBMIT_PREREGISTRATION',
      `Solicitud ${folio} registrada en Capa 3. Notificaciones automáticas disparadas por correo y WhatsApp.`,
      { folio, curso: course.nombre }
    );

    return {
      success: true,
      message: `¡Pre-registro enviado con éxito! Tu folio es ${folio}. Personal de CELEX validará tu documentación bancaria.`,
      request: newRequest
    };
  }

  // -------------------------------------------------------------------------
  // PASO 3: VALIDACIÓN ADMINISTRATIVA POR PERSONAL DE CELEX / UDI
  // -------------------------------------------------------------------------
  public approveAndAssignRequest(
    requestId: string,
    assignment: {
      grupo: string;
      salon: string;
      profesorNombre: string;
      horarioTexto: string;
      dias: string[];
    }
  ): { success: boolean; message: string; enrollment?: Enrollment } {
    const request = dbRepository.getRequestById(requestId);
    if (!request) {
      return { success: false, message: 'Solicitud no encontrada.' };
    }

    const course = dbRepository.getActivityById(request.cursoId);
    if (!course) {
      return { success: false, message: 'El curso asociado ya no existe.' };
    }

    // Incrementar cupo en Capa 3
    course.cupoOcupado = Math.min(course.cupoMaximo, course.cupoOcupado + 1);
    dbRepository.saveActivity(course);

    // Actualizar solicitud a APROBADA
    request.estado = 'APROBADA';
    request.observacionesAdmin = undefined;
    request.grupoAsignado = assignment.grupo;
    request.salonAsignado = assignment.salon;
    request.profesorAsignado = assignment.profesorNombre;
    request.horarioAsignado = assignment.horarioTexto;
    request.diasAsignados = assignment.dias;
    request.notificacionEnviada = {
      correo: true,
      whatsApp: true,
      fechaEnvio: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    dbRepository.saveRequest(request);

    // Generar Cédula Oficial de Inscripción con QR
    const enrollmentId = `enr-${Date.now()}`;
    const newEnrollment: Enrollment = {
      id: enrollmentId,
      folio: request.folio,
      alumnoId: request.identificador,
      alumnoBoleta: request.identificador,
      alumnoRfc: request.rfc,
      alumnoCurp: request.curp,
      alumnoNombre: request.aspiranteNombre,
      alumnoTipo: request.tipoAspirante,
      alumnoCarrera: request.carrera,
      actividadId: course.id,
      actividadNombre: course.nombre,
      actividadCategoria: course.idioma,
      idioma: course.idioma,
      nivel: course.subnivel || course.nivel,
      grupo: assignment.grupo,
      profesorNombre: assignment.profesorNombre,
      horarioTexto: assignment.horarioTexto,
      salon: assignment.salon,
      fechaInscripcion: new Date().toLocaleDateString('es-MX'),
      estado: 'INSCRITO',
      porcentajeAsistencia: 100,
      referenciaBancariaValidada: request.numeroReferenciaPago,
      montoPagado: request.montoPago,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        `SISAE-CELEX-IPN|FOLIO:${request.folio}|ALUMNO:${request.aspiranteNombre}|BOLETA:${request.identificador}|CURSO:${course.nombre}|GRUPO:${assignment.grupo}|SALON:${assignment.salon}|VALIDADO_UDI_UPIICSA`
      )}`
    };

    dbRepository.saveEnrollment(newEnrollment);

    dbRepository.addAuditLog({
      usuario: 'Coordinador UDI / CELEX',
      rol: 'ADMIN',
      accion: 'APROBACION_Y_ASIGNACION',
      ipOrigen: '148.204.64.2',
      detalles: `Aprobada solicitud ${request.folio}. Asignado Grupo ${assignment.grupo}, Salón ${assignment.salon}, Profesor ${assignment.profesorNombre}. Cédula QR generada.`,
      modulo: 'CELEX',
      nivelSeguridad: 'SUCCESS'
    });

    layerLogger.addLog(
      'CAPA_2_NEGOCIO',
      'APPROVE_REQUEST',
      `Solicitud ${request.folio} aprobada y vinculada a la Cédula Oficial ${enrollmentId}.`,
      { folio: request.folio, grupo: assignment.grupo }
    );

    return {
      success: true,
      message: `Solicitud ${request.folio} aprobada. Se ha generado la Cédula de Inscripción y notificado al alumno.`,
      enrollment: newEnrollment
    };
  }

  // -------------------------------------------------------------------------
  // PASO 3B: SOLICITAR CORRECCIÓN / OBSERVAR EXPEDIENTE
  // -------------------------------------------------------------------------
  public requestCorrection(requestId: string, observaciones: string): { success: boolean; message: string } {
    const request = dbRepository.getRequestById(requestId);
    if (!request) return { success: false, message: 'Solicitud no encontrada.' };

    if (!observaciones || observaciones.trim() === '') {
      return { success: false, message: 'Debes detallar la observación o motivo de corrección para el aspirante.' };
    }

    request.estado = 'REQUIERE_CORRECCION';
    request.observacionesAdmin = observaciones.trim();
    request.notificacionEnviada = {
      correo: true,
      whatsApp: true,
      fechaEnvio: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    dbRepository.saveRequest(request);

    dbRepository.addAuditLog({
      usuario: 'Coordinador UDI / CELEX',
      rol: 'ADMIN',
      accion: 'OBSERVACION_EXPEDIENTE',
      ipOrigen: '148.204.64.2',
      detalles: `Solicitud ${request.folio} marcada con observaciones: "${observaciones.trim()}". Notificación enviada.`,
      modulo: 'CELEX',
      nivelSeguridad: 'WARNING'
    });

    return {
      success: true,
      message: `Se ha notificado al alumno la observación sobre su comprobante o datos.`
    };
  }

  // -------------------------------------------------------------------------
  // SUBSANACIÓN DE OBSERVACIONES POR EL ALUMNO
  // -------------------------------------------------------------------------
  public resubmitCorrection(requestId: string, updatedVoucherUrl?: string, updatedReference?: string): { success: boolean; message: string } {
    const request = dbRepository.getRequestById(requestId);
    if (!request) return { success: false, message: 'Solicitud no encontrada.' };

    if (updatedVoucherUrl) request.comprobantePagoUrl = updatedVoucherUrl;
    if (updatedReference) request.numeroReferenciaPago = updatedReference;
    
    request.estado = 'EN_REVISION';
    request.observacionesAdmin = `Subsanado por el aspirante el ${new Date().toLocaleDateString('es-MX')}. En espera de nueva revisión.`;

    dbRepository.saveRequest(request);

    dbRepository.addAuditLog({
      usuario: `${request.aspiranteNombre} (${request.identificador})`,
      rol: 'ALUMNO',
      accion: 'SUBSANAR_OBSERVACION',
      ipOrigen: '148.204.67.12',
      detalles: `El aspirante actualizó su comprobante/datos para el Folio ${request.folio}. Regresa a EN_REVISION.`,
      modulo: 'CELEX',
      nivelSeguridad: 'INFO'
    });

    return {
      success: true,
      message: 'Comprobante actualizado correctamente. El personal de CELEX revisará nuevamente tu solicitud.'
    };
  }

  // -------------------------------------------------------------------------
  // CANCELACIÓN DE INSCRIPCIÓN
  // -------------------------------------------------------------------------
  public cancelEnrollment(enrollmentId: string): { success: boolean; message: string } {
    const enrollment = dbRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) return { success: false, message: 'Inscripción no encontrada.' };

    enrollment.estado = 'CANCELADO';
    dbRepository.saveEnrollment(enrollment);

    const course = dbRepository.getActivityById(enrollment.actividadId);
    if (course && course.cupoOcupado > 0) {
      course.cupoOcupado -= 1;
      dbRepository.saveActivity(course);
    }

    dbRepository.addAuditLog({
      usuario: `${enrollment.alumnoNombre} (${enrollment.alumnoBoleta})`,
      rol: 'ALUMNO',
      accion: 'CANCELAR_INSCRIPCION',
      ipOrigen: '148.204.67.12',
      detalles: `Cancelada inscripción en ${enrollment.actividadNombre} (${enrollment.folio}).`,
      modulo: 'CELEX',
      nivelSeguridad: 'WARNING'
    });

    return { success: true, message: 'Inscripción cancelada y cupo liberado.' };
  }

  // Compatibilidad directa con método anterior
  public enrollStudent(
    student: Student | { id: string; boleta: string; rfc?: string; nombreCompleto: string; carrera: CareerUPIICSA },
    activityId: string
  ): { success: boolean; message: string; enrollment?: Enrollment } {
    const course = dbRepository.getActivityById(activityId);
    if (!course) return { success: false, message: 'Curso no encontrado.' };

    const fakeRef = `BBVA-AUT-${Math.floor(100000 + Math.random() * 900000)}`;
    const groupName = `${course.idioma.substring(0, 3).toUpperCase()}-${course.subnivel || 'B1'}-01`;

    const sub = this.submitPreRegistration({
      aspiranteNombre: student.nombreCompleto,
      tipoAspirante: 'INTERNO_IPN',
      identificador: student.boleta,
      rfc: student.rfc || 'HERA030415XX8',
      correo: `${student.boleta}@alumno.ipn.mx`,
      telefono: '55 1234 5678',
      carrera: student.carrera,
      cursoId: course.id,
      numeroReferenciaPago: fakeRef
    });

    if (sub.success && sub.request) {
      const app = this.approveAndAssignRequest(sub.request.id, {
        grupo: groupName,
        salon: course.salonOEspacio,
        profesorNombre: course.profesorNombre || 'Instructor Asignado CELEX',
        horarioTexto: `${course.dias.join(', ')} ${course.horaInicio} - ${course.horaFin}`,
        dias: course.dias
      });
      return app;
    }

    return { success: false, message: sub.message };
  }
}

export const enrollmentService = new EnrollmentService();
