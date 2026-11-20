// ============================================================================
// SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX UPIICSA IPN
// CAPA 2: LÓGICA DE NEGOCIO - GESTIÓN DE OFERTA ACADÉMICA (ACTIVITY SERVICE)
// ============================================================================

import { dbRepository } from '../layer3_data/dbRepository';
import { layerLogger } from './layerLogger';
import type { CelexCourse } from '../types';

class ActivityService {
  public getAllActivities(): CelexCourse[] {
    const start = performance.now();
    const courses = dbRepository.getActivities();
    const teachers = dbRepository.getTeachers();

    const enriched = courses.map(course => {
      const teacher = teachers.find(t => t.id === course.profesorId);
      return {
        ...course,
        profesorNombre: teacher ? teacher.nombreCompleto : course.profesorNombre || 'Profesor por asignar'
      };
    });

    const duration = Math.round(performance.now() - start);
    layerLogger.addLog(
      'CAPA_2_NEGOCIO',
      'GET_ALL_COURSES',
      `Recuperados ${enriched.length} cursos de lenguas extranjeras de CELEX`,
      { total: enriched.length },
      'SUCCESS',
      duration
    );

    return enriched;
  }

  public getActiveActivities(): CelexCourse[] {
    return this.getAllActivities().filter(a => a.activa);
  }

  public getActivityById(id: string): CelexCourse | undefined {
    return this.getAllActivities().find(a => a.id === id);
  }

  public filterActivities(filters: {
    language?: string;
    level?: string;
    modality?: string;
    turno?: string;
    searchQuery?: string;
    onlyWithSlots?: boolean;
  }): CelexCourse[] {
    let list = this.getActiveActivities();

    if (filters.language && filters.language !== 'TODAS') {
      list = list.filter(a => a.idioma === filters.language || a.categoria === filters.language);
    }

    if (filters.level && filters.level !== 'TODOS') {
      list = list.filter(a => a.nivel === filters.level);
    }

    if (filters.modality && filters.modality !== 'TODAS') {
      list = list.filter(a => a.modalidad === filters.modality);
    }

    if (filters.turno && filters.turno !== 'TODOS') {
      list = list.filter(a => a.turno === filters.turno || a.turno === 'Mixto');
    }

    if (filters.onlyWithSlots) {
      list = list.filter(a => a.cupoOcupado < a.cupoMaximo);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter(a =>
        a.nombre.toLowerCase().includes(q) ||
        a.idioma.toLowerCase().includes(q) ||
        a.nivel.toLowerCase().includes(q) ||
        (a.profesorNombre && a.profesorNombre.toLowerCase().includes(q)) ||
        a.salonOEspacio.toLowerCase().includes(q) ||
        a.descripcion.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public createOrUpdateActivity(data: Partial<CelexCourse>): { success: boolean; message: string; activity?: CelexCourse } {
    if (!data.nombre || data.nombre.trim() === '') {
      return { success: false, message: 'El nombre del curso de idioma es obligatorio.' };
    }
    if (!data.idioma) {
      return { success: false, message: 'Debes seleccionar el idioma del curso.' };
    }
    if (!data.cupoMaximo || data.cupoMaximo <= 0) {
      return { success: false, message: 'El cupo máximo debe ser mayor a 0.' };
    }

    const isEdit = Boolean(data.id && dbRepository.getActivityById(data.id));

    const courseToSave: CelexCourse = {
      id: data.id || `celex-${Date.now()}`,
      nombre: data.nombre.trim(),
      idioma: data.idioma || 'Inglés',
      categoria: data.idioma || 'Inglés',
      nivel: data.nivel || 'Básico',
      subnivel: data.subnivel || 'B1',
      modalidad: data.modalidad || 'Regular',
      profesorId: data.profesorId || 'prof-01',
      profesorNombre: data.profesorNombre,
      cupoMaximo: Number(data.cupoMaximo),
      cupoOcupado: Number(data.cupoOcupado) || 0,
      salonOEspacio: data.salonOEspacio || 'Aula CELEX UPIICSA',
      dias: data.dias && data.dias.length > 0 ? data.dias : ['Lunes', 'Miércoles'],
      horaInicio: data.horaInicio || '07:00',
      horaFin: data.horaFin || '09:00',
      turno: data.turno || 'Matutino',
      creditosElectiva: Number(data.creditosElectiva) || 3,
      costoInterno: Number(data.costoInterno) || 850,
      costoExterno: Number(data.costoExterno) || 1450,
      descripcion: data.descripcion || '',
      requisitos: data.requisitos || 'Pre-registro validado en línea y comprobante de pago.',
      imagenUrl: data.imagenUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
      activa: data.activa !== undefined ? data.activa : true,
      semestrePeriodo: data.semestrePeriodo || '2026-2',
      fechaInicio: data.fechaInicio || '10/02/2026',
      fechaFin: data.fechaFin || '18/06/2026',
      fechaExamenDiagnostico: data.fechaExamenDiagnostico || '28/01/2026'
    };

    const saved = dbRepository.saveActivity(courseToSave);

    dbRepository.addAuditLog({
      usuario: 'Coordinador UDI / CELEX',
      rol: 'ADMIN',
      accion: isEdit ? 'ACTUALIZAR_CURSO_CELEX' : 'CREAR_CURSO_CELEX',
      ipOrigen: '148.204.64.2',
      detalles: `${isEdit ? 'Actualizado' : 'Creado'} curso: ${saved.nombre} (${saved.idioma} - ${saved.subnivel}).`,
      modulo: 'CELEX',
      nivelSeguridad: 'SUCCESS'
    });

    return {
      success: true,
      message: isEdit ? 'Curso actualizado exitosamente.' : 'Curso de idioma creado en el catálogo.',
      activity: saved
    };
  }

  public deleteActivity(id: string): { success: boolean; message: string } {
    const act = dbRepository.getActivityById(id);
    if (!act) return { success: false, message: 'Curso no encontrado.' };

    dbRepository.deleteActivity(id);

    dbRepository.addAuditLog({
      usuario: 'Coordinador UDI / CELEX',
      rol: 'ADMIN',
      accion: 'ELIMINAR_CURSO_CELEX',
      ipOrigen: '148.204.64.2',
      detalles: `Deshabilitado curso de idiomas: ${act.nombre}`,
      modulo: 'CELEX',
      nivelSeguridad: 'WARNING'
    });

    return { success: true, message: 'Curso retirado del catálogo oficial.' };
  }

  public getSystemMetrics() {
    const courses = this.getAllActivities();
    const students = dbRepository.getStudents();
    const teachers = dbRepository.getTeachers();
    const enrollments = dbRepository.getEnrollments();
    const requests = dbRepository.getRequests();

    const totalCupo = courses.reduce((acc, c) => acc + c.cupoMaximo, 0);
    const cupoOcupado = courses.reduce((acc, c) => acc + c.cupoOcupado, 0);
    const porcentajeOcupacion = totalCupo > 0 ? Math.round((cupoOcupado / totalCupo) * 100) : 0;

    const pendingRequests = requests.filter(r => r.estado === 'EN_REVISION' || r.estado === 'REGISTRADA').length;
    const correctionRequests = requests.filter(r => r.estado === 'REQUIERE_CORRECCION').length;
    const approvedRequests = requests.filter(r => r.estado === 'APROBADA').length;

    return {
      totalCourses: courses.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalEnrollments: enrollments.length,
      totalRequests: requests.length,
      pendingRequests,
      correctionRequests,
      approvedRequests,
      totalCupo,
      cupoOcupado,
      porcentajeOcupacion
    };
  }
}

export const activityService = new ActivityService();
