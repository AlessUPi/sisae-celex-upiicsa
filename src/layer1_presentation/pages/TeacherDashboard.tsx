// ============================================================================
// SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX UPIICSA IPN
// CAPA 1: PRESENTACIÓN - PORTAL Y PANEL DOCENTE (TEACHER DASHBOARD)
// ============================================================================
// Implementa CU-11: Registrar calificaciones principales, RF-26, RF-27, RN-05, RN-06, DD-15:
// - Gestión de grupos asignados al docente
// - Captura de 1er Ordinario (Examen Medio), 2do Ordinario (Examen Final) y Tareas/Actividades
// - Validación institucional (Escala 0-100, Mínimo 80 aprobatorio)
// - Contador de oportunidades y alerta de 3ra reprobación
// - Publicación / Liberación oficial de resultados hacia los alumnos
// - Emisión e impresión de Acta Oficial de Calificaciones Ordinarias UPIICSA

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Eye, 
  EyeOff, 
  Printer, 
  Clock, 
  MapPin, 
  HelpCircle,
  X
} from 'lucide-react';
import type { 
  AuthSession, 
  Enrollment, 
  CelexCourse 
} from '../../types';
import { gradesService } from '../../layer2_business/gradesService';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';

interface TeacherDashboardProps {
  session: AuthSession;
  activities: CelexCourse[];
  enrollments: Enrollment[];
  onRefreshData: () => void;
}

interface EditableGradeRow {
  enrollmentId: string;
  primerOrdinario: number;
  segundoOrdinario: number;
  tareasActividades: number;
  calificacionFinal: number;
  oportunidad: number;
  observaciones: string;
  publicada: boolean;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  session,
  activities: _activities,
  enrollments,
  onRefreshData
}) => {
  const teacherEmail = session.user?.correo || '';
  const teacherId = session.user?.teacherId || session.user?.id || '';
  const teacherName = session.user?.nombre || 'Docente CELEX';
  const teacherInfo = gradesService.getTeacherInfo(teacherEmail) || gradesService.getTeacherInfo(teacherId);

  // Obtener los grupos del profesor
  const myGroups = gradesService.getTeacherGroups(teacherId || teacherEmail || teacherName);

  // Si no encuentra por ID exacto, buscar por todos los enrollments que contengan el nombre del profesor
  const activeGroups = myGroups.length > 0 
    ? myGroups 
    : gradesService.getTeacherGroups(teacherName);

  // Grupo seleccionado actualmente
  const [selectedGroupCode, setSelectedGroupCode] = useState<string>(
    activeGroups[0]?.grupo || (enrollments[0]?.grupo || 'ALE-B1-01')
  );

  // Estado local editable para las notas de los alumnos del grupo seleccionado
  const [gradeRows, setGradeRows] = useState<Record<string, EditableGradeRow>>({});
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isActaModalOpen, setIsActaModalOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Cargar estudiantes del grupo actual
  const currentGroupEnrollments = enrollments.filter(e => e.grupo === selectedGroupCode);
  const firstEnr = currentGroupEnrollments[0];

  useEffect(() => {
    // Inicializar el formulario local editable con los datos actuales
    const initialRows: Record<string, EditableGradeRow> = {};
    const groupEnrollments = enrollments.filter(e => e.grupo === selectedGroupCode);
    groupEnrollments.forEach(enr => {
      const ev = enr.evaluacion;
      initialRows[enr.id] = {
        enrollmentId: enr.id,
        primerOrdinario: ev?.primerOrdinario ?? 80,
        segundoOrdinario: ev?.segundoOrdinario ?? 80,
        tareasActividades: ev?.tareasActividades ?? 85,
        calificacionFinal: ev?.calificacionFinal ?? gradesService.calculateTotal(ev?.primerOrdinario ?? 80, ev?.segundoOrdinario ?? 80, ev?.tareasActividades ?? 85),
        oportunidad: ev?.oportunidad ?? 1,
        observaciones: ev?.observacionesDocente ?? '',
        publicada: ev?.publicada ?? false
      };
    });
    setGradeRows(initialRows);
  }, [selectedGroupCode, enrollments]);

  const showNotice = (type: 'success' | 'error' | 'info', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleScoreChange = (
    enrollmentId: string, 
    field: 'primerOrdinario' | 'segundoOrdinario' | 'tareasActividades', 
    value: string
  ) => {
    const num = Math.min(100, Math.max(0, parseInt(value) || 0));
    setGradeRows(prev => {
      const current = prev[enrollmentId] || {
        enrollmentId,
        primerOrdinario: 0,
        segundoOrdinario: 0,
        tareasActividades: 0,
        calificacionFinal: 0,
        oportunidad: 1,
        observaciones: '',
        publicada: false
      };

      const updated = { ...current, [field]: num };
      // Recalcular Total automáticamente según 40% P1 + 40% P2 + 20% Tareas
      updated.calificacionFinal = gradesService.calculateTotal(
        updated.primerOrdinario,
        updated.segundoOrdinario,
        updated.tareasActividades
      );

      return { ...prev, [enrollmentId]: updated };
    });
  };

  const handleManualFinalScore = (enrollmentId: string, value: string) => {
    const num = Math.min(100, Math.max(0, parseInt(value) || 0));
    setGradeRows(prev => {
      const current = prev[enrollmentId];
      if (!current) return prev;
      return { ...prev, [enrollmentId]: { ...current, calificacionFinal: num } };
    });
  };

  const handleObservationChange = (enrollmentId: string, text: string) => {
    setGradeRows(prev => {
      const current = prev[enrollmentId];
      if (!current) return prev;
      return { ...prev, [enrollmentId]: { ...current, observaciones: text } };
    });
  };

  const handleOpportunityChange = (enrollmentId: string, opt: number) => {
    setGradeRows(prev => {
      const current = prev[enrollmentId];
      if (!current) return prev;
      return { ...prev, [enrollmentId]: { ...current, oportunidad: opt } };
    });
  };

  // Guardar todas las calificaciones del grupo
  const handleSaveAllGrades = () => {
    let savedCount = 0;
    Object.values(gradeRows).forEach(row => {
      const res = gradesService.saveStudentEvaluation(
        row.enrollmentId,
        {
          primerOrdinario: row.primerOrdinario,
          segundoOrdinario: row.segundoOrdinario,
          tareasActividades: row.tareasActividades,
          calificacionFinal: row.calificacionFinal,
          oportunidad: row.oportunidad,
          observacionesDocente: row.observaciones,
          publicada: row.publicada
        },
        teacherName
      );
      if (res.success) savedCount++;
    });

    onRefreshData();
    showNotice('success', `¡Se guardaron las calificaciones ordinarias de ${savedCount} alumnos con éxito!`);
  };

  // Publicar o poner en borrador para los alumnos
  const handleTogglePublication = (shouldPublish: boolean) => {
    const res = gradesService.setGroupGradesPublication(selectedGroupCode, shouldPublish, teacherName);
    if (res.success) {
      setGradeRows(prev => {
        const copy = { ...prev };
        Object.keys(copy).forEach(k => {
          copy[k].publicada = shouldPublish;
        });
        return copy;
      });
      onRefreshData();
      showNotice(
        shouldPublish ? 'success' : 'info', 
        shouldPublish 
          ? `Calificaciones publicadas oficialmente. Los alumnos del grupo ${selectedGroupCode} ya pueden ver sus resultados por ordinarios.`
          : `Calificaciones retiradas del portal del alumno. Ahora están en modo borrador de edición.`
      );
    } else {
      showNotice('error', res.message);
    }
  };

  // Filtro de búsqueda
  const filteredEnrollments = currentGroupEnrollments.filter(e => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      e.alumnoNombre.toLowerCase().includes(q) ||
      e.alumnoBoleta.toLowerCase().includes(q) ||
      (e.alumnoRfc && e.alumnoRfc.toLowerCase().includes(q))
    );
  });

  const isCurrentGroupPublished = currentGroupEnrollments.every(e => e.evaluacion?.publicada);

  return (
    <div className="teacher-dashboard" style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: '1240px' }}>
        
        {/* ENCABEZADO: PERFIL DEL PROFESOR */}
        <div className="card" style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(108,29,69,0.06) 100%)',
          borderLeft: '6px solid var(--ipn-guinda)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'var(--ipn-guinda-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.8rem',
              fontWeight: 800,
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              border: '3px solid #ffffff'
            }}>
              {teacherInfo?.avatarUrl ? (
                <img src={teacherInfo.avatarUrl} alt={teacherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                teacherName.charAt(0)
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-guinda" style={{ fontWeight: 800 }}>DOCENTE TITULAR CELEX</span>
                <span className="badge badge-gold">UPIICSA IPN</span>
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
                {teacherName}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '650px', margin: 0 }}>
                {teacherInfo?.especialidad || 'Especialista en Lenguas Extranjeras y Certificaciones Internacionales'}
              </p>
              {teacherInfo?.certificaciones && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  <strong>Acreditaciones:</strong> {teacherInfo.certificaciones}
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            backgroundColor: 'var(--bg-main)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ipn-guinda)' }}>
                {activeGroups.length || 1}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grupos Asignados</div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-info)' }}>
                {currentGroupEnrollments.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Alumnos en Grupo</div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>
                80/100
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mínimo Aprobatorio</div>
            </div>
          </div>
        </div>

        {/* NOTIFICACIÓN FLOTANTE */}
        {actionNotice && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: actionNotice.type === 'success' ? 'var(--color-success-bg)' : actionNotice.type === 'error' ? 'var(--color-danger-bg)' : 'var(--color-info-bg)',
            color: actionNotice.type === 'success' ? 'var(--color-success)' : actionNotice.type === 'error' ? 'var(--color-danger)' : 'var(--color-info)',
            border: `1px solid ${actionNotice.type === 'success' ? 'var(--color-success)' : actionNotice.type === 'error' ? 'var(--color-danger)' : 'var(--color-info)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
              {actionNotice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              <span>{actionNotice.text}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="btn btn-sm btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>
              Cerrar
            </button>
          </div>
        )}

        {/* SELECTOR DE GRUPOS Y DETALLES DEL CURSO */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="var(--ipn-guinda)" />
                <span>Selección de Grupo y Asignatura</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Selecciona el grupo oficial para asentar o consultar evaluaciones ordinarias.
              </p>
            </div>

            {/* Pestañas de grupos */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {activeGroups.map(g => (
                <button
                  key={g.grupo}
                  onClick={() => setSelectedGroupCode(g.grupo)}
                  className={`btn btn-sm ${selectedGroupCode === g.grupo ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', fontWeight: 700 }}
                >
                  <Users size={15} />
                  <span>{g.grupo} - {g.idioma} ({g.totalAlumnos} alumnos)</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ficha técnica del curso seleccionado */}
          {firstEnr && (
            <div style={{
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Asignatura / Nivel</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                    {firstEnr.actividadNombre}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <Clock size={16} color="var(--ipn-guinda)" />
                  <span>{firstEnr.horarioTexto}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <MapPin size={16} color="var(--ipn-guinda)" />
                  <span>{firstEnr.salon}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <Users size={16} color="var(--ipn-guinda)" />
                  <span>Grupo {firstEnr.grupo} ({currentGroupEnrollments.length} inscritos)</span>
                </div>
              </div>

              {/* Botón de impresión del Acta Oficial */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsActaModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontWeight: 700 }}
                  title="Generar Acta Oficial con Formato UPIICSA"
                >
                  <Printer size={15} />
                  <span>Imprimir Acta Oficial</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BARRA DE HERRAMIENTAS Y ACCIONES DEL ACTA */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Barra de búsqueda de alumnos */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Buscar alumno por nombre o boleta..."
              className="input-field"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{ paddingLeft: '1rem', fontSize: '0.85rem' }}
            />
          </div>

          {/* Acciones principales del docente */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            <button
              onClick={() => handleTogglePublication(!isCurrentGroupPublished)}
              className={`btn btn-sm ${isCurrentGroupPublished ? 'btn-secondary' : 'btn-gold'}`}
              style={{ fontWeight: 700 }}
              title="Libera o restringe la visibilidad para los alumnos"
            >
              {isCurrentGroupPublished ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{isCurrentGroupPublished ? 'Poner en Borrador (Ocultar)' : 'Publicar Calificaciones Oficiales'}</span>
            </button>

            <button
              onClick={handleSaveAllGrades}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 700 }}
            >
              <Save size={16} />
              <span>Guardar Evaluaciones Ordinarias</span>
            </button>
          </div>
        </div>

        {/* AVISO DE REGLA INSTITUCIONAL DE ACREDITACIÓN */}
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--color-info-bg)',
          border: '1px solid var(--color-info)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <HelpCircle size={18} color="var(--color-info)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Normativa Escolar CELEX UPIICSA (RF-26 / RF-27 / RN-05 / RN-06):</strong>
            <span style={{ marginLeft: '4px' }}>
              Escala de evaluación de 0 a 100 puntos. Acreditación mínima de <strong>80 puntos</strong>.
              El 1er Ordinario (Examen Medio) pondera 40%, 2do Ordinario (Examen Final) 40%, y Tareas/Participación 20%.
              Máximo 3 oportunidades de acreditación por nivel (a la 3ra reprobación el alumno requerirá examen de ubicación).
            </span>
          </div>
        </div>

        {/* TABLA PRINCIPAL DE CAPTURA DE CALIFICACIONES ORDINARIAS */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-alt)',
                  borderBottom: '2px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}>
                  <th style={{ padding: '0.85rem 1rem' }}>No. / Folio</th>
                  <th style={{ padding: '0.85rem 1rem', minWidth: '220px' }}>Estudiante</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Asistencia</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center', width: '110px' }}>
                    1er Ordinario<br />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Medio 40%)</span>
                  </th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center', width: '110px' }}>
                    2do Ordinario<br />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Final 40%)</span>
                  </th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center', width: '110px' }}>
                    Tareas / Act.<br />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(20%)</span>
                  </th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center', width: '110px' }}>
                    Calificación<br />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Total 0-100)</span>
                  </th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Resultado</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center', width: '90px' }}>Oportunidad</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Observaciones del Docente</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enr, idx) => {
                  const row = gradeRows[enr.id] || {
                    enrollmentId: enr.id,
                    primerOrdinario: enr.evaluacion?.primerOrdinario ?? 80,
                    segundoOrdinario: enr.evaluacion?.segundoOrdinario ?? 80,
                    tareasActividades: enr.evaluacion?.tareasActividades ?? 85,
                    calificacionFinal: enr.evaluacion?.calificacionFinal ?? 80,
                    oportunidad: enr.evaluacion?.oportunidad ?? 1,
                    observaciones: enr.evaluacion?.observacionesDocente ?? '',
                    publicada: enr.evaluacion?.publicada ?? false
                  };

                  const total = row.calificacionFinal;
                  const isAprobado = total >= 80;
                  const isThirdChance = row.oportunidad >= 3;

                  return (
                    <tr 
                      key={enr.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)'
                      }}
                    >
                      {/* No. y Folio */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          #{idx + 1}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--ipn-guinda)' }}>
                          {enr.folio.replace('SISAE-CELEX-2026-', '')}
                        </div>
                      </td>

                      {/* Estudiante */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {enr.alumnoNombre}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span>{enr.alumnoBoleta}</span>
                          <span>•</span>
                          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {enr.alumnoCarrera}
                          </span>
                        </div>
                      </td>

                      {/* Asistencia */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span className={`badge ${enr.porcentajeAsistencia >= 80 ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 700 }}>
                          {enr.porcentajeAsistencia}%
                        </span>
                      </td>

                      {/* 1er Ordinario (Examen Medio) */}
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.primerOrdinario}
                          onChange={(e) => handleScoreChange(enr.id, 'primerOrdinario', e.target.value)}
                          className="input-field"
                          style={{
                            width: '75px',
                            textAlign: 'center',
                            padding: '0.4rem',
                            fontWeight: 700,
                            margin: '0 auto',
                            fontSize: '0.9rem'
                          }}
                        />
                      </td>

                      {/* 2do Ordinario (Examen Final) */}
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.segundoOrdinario}
                          onChange={(e) => handleScoreChange(enr.id, 'segundoOrdinario', e.target.value)}
                          className="input-field"
                          style={{
                            width: '75px',
                            textAlign: 'center',
                            padding: '0.4rem',
                            fontWeight: 700,
                            margin: '0 auto',
                            fontSize: '0.9rem'
                          }}
                        />
                      </td>

                      {/* Tareas / Actividades */}
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.tareasActividades}
                          onChange={(e) => handleScoreChange(enr.id, 'tareasActividades', e.target.value)}
                          className="input-field"
                          style={{
                            width: '75px',
                            textAlign: 'center',
                            padding: '0.4rem',
                            fontWeight: 700,
                            margin: '0 auto',
                            fontSize: '0.9rem'
                          }}
                        />
                      </td>

                      {/* Calificación Total (0-100) */}
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={row.calificacionFinal}
                          onChange={(e) => handleManualFinalScore(enr.id, e.target.value)}
                          className="input-field"
                          style={{
                            width: '75px',
                            textAlign: 'center',
                            padding: '0.4rem',
                            fontWeight: 800,
                            margin: '0 auto',
                            fontSize: '0.95rem',
                            color: isAprobado ? 'var(--color-success)' : 'var(--color-danger)',
                            borderColor: isAprobado ? 'var(--color-success)' : 'var(--color-danger)'
                          }}
                        />
                      </td>

                      {/* Resultado: Acreditado / No Acreditado */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span className={`badge ${isAprobado ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 800, fontSize: '0.75rem' }}>
                          {isAprobado ? 'ACREDITADO' : 'NO ACREDITADO'}
                        </span>
                      </td>

                      {/* Oportunidad (1, 2, 3) */}
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                        <select
                          value={row.oportunidad}
                          onChange={(e) => handleOpportunityChange(enr.id, parseInt(e.target.value))}
                          className="input-field"
                          style={{
                            padding: '0.35rem 0.4rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            width: '70px',
                            backgroundColor: isThirdChance && !isAprobado ? 'var(--color-warning-bg)' : 'inherit'
                          }}
                        >
                          <option value={1}>1ª Op</option>
                          <option value={2}>2ª Op</option>
                          <option value={3}>3ª Op</option>
                        </select>
                        {isThirdChance && !isAprobado && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-danger)', fontWeight: 700, marginTop: '2px' }}>
                            Req. Examen
                          </div>
                        )}
                      </td>

                      {/* Observaciones */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <input
                          type="text"
                          placeholder="Retroalimentación para el alumno..."
                          value={row.observaciones}
                          onChange={(e) => handleObservationChange(enr.id, e.target.value)}
                          className="input-field"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: '100%', minWidth: '180px' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: ACTA OFICIAL DE CALIFICACIONES IMPRIMIBLE */}
        {isActaModalOpen && firstEnr && (
          <div className="modal-overlay" onClick={() => setIsActaModalOpen(false)}>
            <div 
              className="modal-content" 
              style={{ maxWidth: '850px', padding: '2rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={logoIpn} alt="IPN" style={{ height: '48px', width: 'auto' }} />
                  <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--border-color)' }} />
                  <img src={logoUpiicsa} alt="UPIICSA" style={{ height: '48px', width: 'auto' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--ipn-guinda)' }}>
                      INSTITUTO POLITÉCNICO NACIONAL - UPIICSA
                    </h3>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      CENTRO DE LENGUAS EXTRANJERAS (CELEX) • ACTA OFICIAL DE EVALUACIONES ORDINARIAS
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsActaModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '50%', padding: '0.4rem' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Metadatos del Acta */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                backgroundColor: 'var(--bg-main)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.85rem'
              }}>
                <div><strong>Periodo Escolar:</strong> 2026-2 (Febrero - Junio 2026)</div>
                <div><strong>Asignatura:</strong> {firstEnr.actividadNombre}</div>
                <div><strong>Grupo Oficial:</strong> {firstEnr.grupo}</div>
                <div><strong>Docente Titular:</strong> {teacherName}</div>
                <div><strong>Aula / Salón:</strong> {firstEnr.salon}</div>
                <div><strong>Horario:</strong> {firstEnr.horarioTexto}</div>
              </div>

              {/* Lista para acta */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '2rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-alt)' }}>
                    <th style={{ padding: '0.5rem' }}>No.</th>
                    <th style={{ padding: '0.5rem' }}>Boleta / RFC</th>
                    <th style={{ padding: '0.5rem' }}>Nombre del Alumno</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>1er Ord.</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>2do Ord.</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Tareas</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Total</th>
                    <th style={{ padding: '0.5rem', textAlign: 'center' }}>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {currentGroupEnrollments.map((enr, idx) => {
                    const row = gradeRows[enr.id];
                    const total = row ? row.calificacionFinal : (enr.evaluacion?.calificacionFinal ?? 0);
                    const isAp = total >= 80;
                    return (
                      <tr key={enr.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.5rem' }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>{enr.alumnoBoleta}</td>
                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>{enr.alumnoNombre}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{row ? row.primerOrdinario : '-'}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{row ? row.segundoOrdinario : '-'}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{row ? row.tareasActividades : '-'}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 800 }}>{total}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700, color: isAp ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {isAp ? 'ACREDITADO' : 'NO ACREDITADO'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Firmas Oficiales */}
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '2.5rem', paddingTop: '1rem' }}>
                <div style={{ width: '220px', borderTop: '1px solid var(--text-main)', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>{teacherName}</strong>
                  <div>Docente Titular Asignado</div>
                </div>
                <div style={{ width: '220px', borderTop: '1px solid var(--text-main)', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>Mtro. Mario Bizarro Moreno</strong>
                  <div>Coordinador de Sistemas / CELEX</div>
                </div>
              </div>

              {/* Botón imprimir */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button onClick={() => window.print()} className="btn btn-primary">
                  <Printer size={16} />
                  <span>Imprimir Acta Oficial</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
