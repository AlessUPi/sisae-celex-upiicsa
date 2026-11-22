// ============================================================================
// SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX UPIICSA IPN
// CAPA 2: LÓGICA DE NEGOCIO - CALIFICACIONES, EVALUACIONES Y REQUISITOS (GRADES SERVICE)
// ============================================================================
// Conforme a la especificación oficial SISAE CELEX:
// - RF-26: Registro de examen medio (1er ordinario), examen final (2do ordinario) y calificación total (0-100).
// - RF-27 & RN-05: Acreditación con calificación total >= 80 puntos; < 80 no acreditado.
// - RF-28 & RN-06: Máximo 3 oportunidades por nivel; a la 3ra reprobación requiere examen de ubicación.
// - RF-31 & RN-07: Baja temporal únicamente a partir de Intermedio 1 aprobado (vigencia de 1 ciclo).
// - RF-36, RF-37 & RN-09: Verificación de elegibilidad para constancias (Básico completo = 5 módulos).
// - DD-15: Calificaciones se guardan y sólo son visibles al alumno cuando son publicadas.

import { dbRepository } from '../layer3_data/dbRepository';
import { layerLogger } from './layerLogger';
import type { 
  Enrollment, 
  EvaluationRecord, 
  AcademicProgressInfo, 
  Teacher 
} from '../types';

class GradesService {
  /**
   * Valida que una calificación numérica se encuentre dentro del rango oficial (0 - 100).
   */
  public validateGrade(score: number): { valid: boolean; error?: string } {
    if (isNaN(score)) {
      return { valid: false, error: 'La calificación debe ser un valor numérico.' };
    }
    if (score < 0 || score > 100) {
      return { valid: false, error: 'La calificación debe estar comprendida entre 0 y 100 puntos.' };
    }
    return { valid: true };
  }

  /**
   * Criterio institucional CELEX UPIICSA de acreditación (RF-27 / RN-05):
   * Mínimo 80 puntos sobre 100 para acreditar el nivel.
   */
  public isAccredited(totalScore: number): boolean {
    return totalScore >= 80;
  }

  /**
   * Cálculo sugerido de calificación total ordinaria:
   * 40% 1er Ordinario (Examen Medio) + 40% 2do Ordinario (Examen Final) + 20% Tareas/Speaking
   */
  public calculateTotal(
    primerOrdinario: number = 0, 
    segundoOrdinario: number = 0, 
    tareas: number = 0
  ): number {
    const total = Math.round((primerOrdinario * 0.40) + (segundoOrdinario * 0.40) + (tareas * 0.20));
    return Math.min(100, Math.max(0, total));
  }

  /**
   * Obtiene la lista de grupos asignados a un docente.
   */
  public getTeacherGroups(teacherIdOrName: string): {
    courseId: string;
    courseName: string;
    idioma: string;
    nivel: string;
    grupo: string;
    horario: string;
    salon: string;
    totalAlumnos: number;
    enrollments: Enrollment[];
  }[] {
    const allEnrollments = dbRepository.getEnrollments();
    const clean = teacherIdOrName.trim().toLowerCase();

    // Filtra las inscripciones por profesor
    const teacherEnrollments = allEnrollments.filter(e => 
      (e.profesorId && e.profesorId.toLowerCase() === clean) ||
      e.profesorNombre.toLowerCase().includes(clean)
    );

    // Agrupa por grupo
    const groupMap = new Map<string, Enrollment[]>();
    teacherEnrollments.forEach(enr => {
      const g = enr.grupo || 'GENERAL';
      if (!groupMap.has(g)) {
        groupMap.set(g, []);
      }
      groupMap.get(g)!.push(enr);
    });

    const result: {
      courseId: string;
      courseName: string;
      idioma: string;
      nivel: string;
      grupo: string;
      horario: string;
      salon: string;
      totalAlumnos: number;
      enrollments: Enrollment[];
    }[] = [];

    groupMap.forEach((enrs, grupo) => {
      const first = enrs[0];
      result.push({
        courseId: first.actividadId,
        courseName: first.actividadNombre,
        idioma: first.idioma,
        nivel: first.nivel,
        grupo: grupo,
        horario: first.horarioTexto,
        salon: first.salon,
        totalAlumnos: enrs.length,
        enrollments: enrs
      });
    });

    return result;
  }

  /**
   * Guarda o actualiza la evaluación ordinaria de un alumno en una inscripción.
   * Aplica RN-05 (acreditado >= 80) y RN-06 (gestión de oportunidades).
   */
  public saveStudentEvaluation(
    enrollmentId: string,
    evalData: {
      primerOrdinario?: number;
      segundoOrdinario?: number;
      tareasActividades?: number;
      calificacionFinal?: number;
      oportunidad?: number;
      observacionesDocente?: string;
      publicada?: boolean;
    },
    docenteNombre?: string
  ): { success: boolean; message: string; updatedEnrollment?: Enrollment } {
    const enrollment = dbRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      return { success: false, message: 'Inscripción no encontrada en el sistema.' };
    }

    // Validar rangos de calificaciones
    if (evalData.primerOrdinario !== undefined) {
      const v1 = this.validateGrade(evalData.primerOrdinario);
      if (!v1.valid) return { success: false, message: `1er Ordinario inválido: ${v1.error}` };
    }
    if (evalData.segundoOrdinario !== undefined) {
      const v2 = this.validateGrade(evalData.segundoOrdinario);
      if (!v2.valid) return { success: false, message: `2do Ordinario inválido: ${v2.error}` };
    }
    if (evalData.tareasActividades !== undefined) {
      const vt = this.validateGrade(evalData.tareasActividades);
      if (!vt.valid) return { success: false, message: `Tareas/Actividades inválido: ${vt.error}` };
    }

    // Calificación final calculada o provista
    const finalScore = evalData.calificacionFinal !== undefined
      ? evalData.calificacionFinal
      : this.calculateTotal(
          evalData.primerOrdinario ?? enrollment.evaluacion?.primerOrdinario ?? 0,
          evalData.segundoOrdinario ?? enrollment.evaluacion?.segundoOrdinario ?? 0,
          evalData.tareasActividades ?? enrollment.evaluacion?.tareasActividades ?? 0
        );

    const vf = this.validateGrade(finalScore);
    if (!vf.valid) return { success: false, message: `Calificación final inválida: ${vf.error}` };

    const isAprobado = this.isAccredited(finalScore);
    const oportunidad = evalData.oportunidad || enrollment.evaluacion?.oportunidad || 1;

    const newEvaluation: EvaluationRecord = {
      primerOrdinario: evalData.primerOrdinario ?? enrollment.evaluacion?.primerOrdinario,
      segundoOrdinario: evalData.segundoOrdinario ?? enrollment.evaluacion?.segundoOrdinario,
      tareasActividades: evalData.tareasActividades ?? enrollment.evaluacion?.tareasActividades,
      calificacionFinal: finalScore,
      acreditado: isAprobado,
      publicada: evalData.publicada ?? enrollment.evaluacion?.publicada ?? false,
      oportunidad: oportunidad,
      observacionesDocente: evalData.observacionesDocente ?? enrollment.evaluacion?.observacionesDocente ?? '',
      fechaEvaluacion: new Date().toLocaleDateString('es-MX'),
      docenteNombre: docenteNombre || enrollment.profesorNombre
    };

    const updatedEnrollment: Enrollment = {
      ...enrollment,
      evaluacion: newEvaluation,
      calificacionOConstancia: isAprobado ? `${finalScore}/100 - Acreditado` : `${finalScore}/100 - No Acreditado`,
      estado: isAprobado ? 'ACREDITADO' : 'EN_CURSO'
    };

    dbRepository.saveEnrollment(updatedEnrollment);

    // Si el alumno acreditó, agregamos al historial del estudiante
    if (isAprobado) {
      const student = dbRepository.getStudentById(enrollment.alumnoId) || dbRepository.getStudentByBoleta(enrollment.alumnoBoleta);
      if (student) {
        const nivelName = `${enrollment.idioma} ${enrollment.nivel}`;
        const currentNiveles = student.nivelesAcreditados || [];
        if (!currentNiveles.includes(nivelName)) {
          student.nivelesAcreditados = [...currentNiveles, nivelName];
          student.creditosAcumulados = (student.creditosAcumulados || 0) + 3;
          dbRepository.saveStudent(student);
        }
      }
    }

    // Registro de Auditoría UDI
    dbRepository.addAuditLog({
      usuario: docenteNombre || 'DOCENTE_TITULAR',
      rol: 'DOCENTE',
      accion: 'REGISTRO_CALIFICACION_ORDINARIA',
      ipOrigen: '148.204.64.18 (Red Académica CELEX)',
      detalles: `Calificación asentada para ${enrollment.alumnoNombre} (${enrollment.alumnoBoleta}) en ${enrollment.actividadNombre}: Total ${finalScore}/100 (${isAprobado ? 'ACREDITADO' : 'NO ACREDITADO'}). Oportunidad: ${oportunidad}.`,
      modulo: 'CELEX',
      nivelSeguridad: isAprobado ? 'SUCCESS' : 'WARNING'
    });

    layerLogger.addLog(
      'CAPA_2_NEGOCIO',
      'EVALUATION_SAVED',
      `Calificación registrada: ${enrollment.alumnoNombre} -> ${finalScore} pts`,
      { enrollmentId, finalScore, isAprobado },
      'SUCCESS',
      12
    );

    return {
      success: true,
      message: `Calificación de ${enrollment.alumnoNombre} guardada con éxito (${finalScore}/100 - ${isAprobado ? 'Acreditado' : 'No Acreditado'}).`,
      updatedEnrollment
    };
  }

  /**
   * Publica o retiene las calificaciones de un grupo completo (DD-15).
   * Al publicar, los estudiantes pueden consultarlas en su portal.
   */
  public setGroupGradesPublication(grupo: string, publicada: boolean, docenteNombre?: string): {
    success: boolean;
    message: string;
    totalUpdated: number;
  } {
    const enrollments = dbRepository.getEnrollments().filter(e => e.grupo === grupo);
    if (enrollments.length === 0) {
      return { success: false, message: `No se encontraron alumnos en el grupo ${grupo}.`, totalUpdated: 0 };
    }

    let count = 0;
    enrollments.forEach(enr => {
      if (enr.evaluacion) {
        enr.evaluacion.publicada = publicada;
        dbRepository.saveEnrollment(enr);
        count++;
      } else {
        // Inicializa registro si aún no tenía
        enr.evaluacion = {
          publicada: publicada,
          oportunidad: 1,
          docenteNombre: docenteNombre || enr.profesorNombre,
          fechaEvaluacion: new Date().toLocaleDateString('es-MX')
        };
        dbRepository.saveEnrollment(enr);
        count++;
      }
    });

    dbRepository.addAuditLog({
      usuario: docenteNombre || 'DOCENTE_COORDINADOR',
      rol: 'DOCENTE',
      accion: publicada ? 'PUBLICACION_CALIFICACIONES_GRUPO' : 'RETIRO_CALIFICACIONES_GRUPO',
      ipOrigen: '148.204.64.18 (Red Académica CELEX)',
      detalles: `${publicada ? 'Liberadas' : 'Retenidas'} calificaciones para el grupo ${grupo} (${count} alumnos notificados).`,
      modulo: 'CELEX',
      nivelSeguridad: 'INFO'
    });

    return {
      success: true,
      message: publicada 
        ? `Se han publicado las calificaciones para los ${count} alumnos del grupo ${grupo}.`
        : `Se han puesto en modo borrador las calificaciones del grupo ${grupo}.`,
      totalUpdated: count
    };
  }

  /**
   * Diagnóstico institucional: ¿Qué necesita el alumno para avanzar, constancias, titulación y bajas?
   * Cumple con RF-28, RN-06, RN-07, RN-08, RN-09 y requisitos de UPIICSA.
   */
  public getAcademicRequirementsForStudent(studentBoleta: string): AcademicProgressInfo {
    const student = dbRepository.getStudentByBoleta(studentBoleta);
    const enrollments = dbRepository.getEnrollmentsByStudent(studentBoleta);

    // Cursos acreditados e históricos
    const acreditados = student?.nivelesAcreditados || [];
    const activeEnrollment = enrollments.find(e => e.estado !== 'CANCELADO');

    // Nivel actual
    const nivelActual = activeEnrollment ? `${activeEnrollment.idioma} ${activeEnrollment.nivel}` : (acreditados[acreditados.length - 1] || 'Sin curso activo');

    // Identificar si acreditó el curso activo
    const evaluacionActual = activeEnrollment?.evaluacion;
    const finalScore = evaluacionActual?.calificacionFinal ?? 0;
    const estaAcreditado = evaluacionActual ? this.isAccredited(finalScore) : false;
    const asistencia = activeEnrollment?.porcentajeAsistencia || 100;
    const asistenciaOk = asistencia >= 80;

    // Regla de oportunidades (RN-06)
    const oportunidadActual = evaluacionActual?.oportunidad || 1;
    const maxOportunidades = 3;
    const requiereExamenUbicacion = !estaAcreditado && oportunidadActual >= maxOportunidades;

    // Siguiente nivel
    let siguienteNivel = 'Consulta la convocatoria';
    let canAdvance = false;
    let motivoBloqueo = '';

    if (activeEnrollment) {
      if (estaAcreditado && asistenciaOk) {
        canAdvance = true;
        siguienteNivel = this.getNextLevelName(activeEnrollment.nivel, activeEnrollment.idioma);
      } else if (!asistenciaOk) {
        canAdvance = false;
        motivoBloqueo = `Asistencia insuficiente (${asistencia}%). Se requiere mínimo 80% para tener derecho a acreditación.`;
      } else if (!estaAcreditado && evaluacionActual) {
        canAdvance = false;
        if (requiereExamenUbicacion) {
          motivoBloqueo = `Has alcanzado el límite de 3 oportunidades en ${activeEnrollment.nivel}. Según la regla RN-06, debes presentar un nuevo Examen de Diagnóstico y Ubicación.`;
        } else {
          motivoBloqueo = `Calificación final (${finalScore}/100) inferior al mínimo aprobatorio de 80 puntos. Debes repetir el nivel (Oportunidad ${oportunidadActual + 1} de 3).`;
        }
      } else {
        motivoBloqueo = 'El curso se encuentra actualmente en periodo lectivo. Las evaluaciones ordinarias están en proceso.';
      }
    } else {
      canAdvance = true;
      siguienteNivel = 'Inscripción a Básico 1 o Examen de Ubicación';
    }

    // Regla de Baja Temporal (RN-07): Se permite a partir de Intermedio 1 aprobado
    const tieneIntermedio1Aprobado = acreditados.some(n => 
      n.toLowerCase().includes('intermedio') || 
      n.toLowerCase().includes('avanzado') ||
      n.toLowerCase().includes('b5') ||
      n.toLowerCase().includes('i1')
    );

    const bajaTemporalDetalle = tieneIntermedio1Aprobado
      ? 'Elegible: Cuentas con nivel intermedio acreditado. La baja temporal ampara hasta 1 ciclo de tu modalidad.'
      : 'No elegible: La normativa CELEX (RN-07) establece que la baja temporal sólo procede a partir de haber acreditado mínimo Intermedio 1.';

    // Regla de Constancias (RN-09): Módulo básico completo (5 niveles)
    const nivelesBasicosAprobados = acreditados.filter(n => n.toLowerCase().includes('básico') || n.toLowerCase().includes('b1') || n.toLowerCase().includes('b2')).length;
    const constanciaBasicoProgreso = Math.min(5, nivelesBasicosAprobados);
    const constanciaBasicoElegible = constanciaBasicoProgreso >= 5;

    // Requisito de titulación IPN: mínimo 5 módulos o nivel B2 / TOEFL
    const creditosTotales = student?.creditosAcumulados || (acreditados.length * 3);
    const requisitoTitulacionCumplido = creditosTotales >= 15 || constanciaBasicoElegible;

    return {
      nivelActual,
      siguienteNivel,
      puedeAvanzar: canAdvance,
      motivoBloqueo: motivoBloqueo || undefined,
      oportunidadesUsadas: oportunidadActual,
      maxOportunidades: 3,
      requiereExamenUbicacion,
      elegibleBajaTemporal: tieneIntermedio1Aprobado,
      bajaTemporalDetalle,
      constanciaBasicoElegible,
      constanciaBasicoProgreso,
      requisitoTitulacionCumplido,
      creditosTotales
    };
  }

  private getNextLevelName(currentLevel: string, idioma: string): string {
    const l = currentLevel.trim().toLowerCase();
    if (l.includes('básico 1') || l.includes('b1')) return `${idioma} Básico 2`;
    if (l.includes('básico 2') || l.includes('b2')) return `${idioma} Básico 3`;
    if (l.includes('básico 3') || l.includes('b3')) return `${idioma} Básico 4`;
    if (l.includes('básico 4') || l.includes('b4')) return `${idioma} Básico 5`;
    if (l.includes('básico 5') || l.includes('b5')) return `${idioma} Intermedio 1`;
    if (l.includes('intermedio 1') || l.includes('i1')) return `${idioma} Intermedio 2`;
    if (l.includes('intermedio 2') || l.includes('i2')) return `${idioma} Intermedio 3`;
    if (l.includes('intermedio 3') || l.includes('i3')) return `${idioma} Intermedio 4`;
    if (l.includes('intermedio 4') || l.includes('i4')) return `${idioma} Intermedio 5`;
    if (l.includes('intermedio 5') || l.includes('i5')) return `${idioma} Avanzado 1`;
    if (l.includes('avanzado 1') || l.includes('a1')) return `${idioma} Avanzado 2`;
    return `${idioma} Nivel Superior / Certificación Oficial`;
  }

  /**
   * Obtiene la ficha de un profesor para consulta de los alumnos (CU-10).
   */
  public getTeacherInfo(profesorNombreOrId: string): Teacher | undefined {
    const teachers = dbRepository.getTeachers();
    const clean = profesorNombreOrId.trim().toLowerCase();
    return teachers.find(t => 
      t.id.toLowerCase() === clean || 
      t.nombreCompleto.toLowerCase().includes(clean)
    );
  }
}

export const gradesService = new GradesService();
