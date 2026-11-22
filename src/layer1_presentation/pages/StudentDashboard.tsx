import React, { useState } from 'react';
import { 
  Languages, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  User, 
  FileCheck2,
  Upload,
  AlertTriangle,
  QrCode,
  Send,
  Camera,
  Eye,
  X,
  GraduationCap,
  Printer,
  BookOpen,
  HelpCircle,
  Mail,
  Phone
} from 'lucide-react';
import { WeeklyScheduleView } from '../components/WeeklyScheduleView';
import { EnrollmentReceiptModal } from '../components/EnrollmentReceiptModal';
import { enrollmentService } from '../../layer2_business/enrollmentService';
import { gradesService } from '../../layer2_business/gradesService';
import { dbRepository } from '../../layer3_data/dbRepository';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';
import type { 
  AuthSession, 
  CelexCourse, 
  Enrollment,
  Teacher
} from '../../types';

interface StudentDashboardProps {
  session: AuthSession;
  activities: CelexCourse[];
  enrollments: Enrollment[];
  onViewActivityDetails: (activity: CelexCourse) => void;
  onRefreshData: () => void;
  onOpenPreRegister: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  session,
  activities,
  enrollments,
  onViewActivityDetails,
  onRefreshData,
  onOpenPreRegister
}) => {
  const [activeTab, setActiveTab] = useState<'SOLICITUDES' | 'MIS_CURSOS' | 'CALIFICACIONES' | 'REQUISITOS' | 'MI_HORARIO' | 'HISTORIAL' | 'PERFIL'>('SOLICITUDES');
  const [selectedReceipt, setSelectedReceipt] = useState<Enrollment | null>(null);
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<Teacher | null>(null);
  const [selectedBoletaModal, setSelectedBoletaModal] = useState<Enrollment | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal para subsanar observaciones de comprobante
  const [subsanarRequestId, setSubsanarRequestId] = useState<string | null>(null);
  const [newVoucherRef, setNewVoucherRef] = useState('');
  const [newVoucherUrl, setNewVoucherUrl] = useState('');

  const studentBoleta = session.user?.identificador || '';
  const student = dbRepository.getStudentByBoleta(studentBoleta);

  // Diagnóstico de Requisitos Académicos del estudiante (RF-28, RN-06, RN-07, RN-09)
  const academicProgress = gradesService.getAcademicRequirementsForStudent(studentBoleta);

  // Solicitudes del alumno
  const myRequests = enrollmentService.getRequestsForStudent(studentBoleta);

  // Inscripciones acreditadas
  const myEnrollments = enrollments.filter(
    e => e.alumnoBoleta === studentBoleta || (student && e.alumnoId === student.id)
  );

  // Niveles completados
  const totalCreditos = myEnrollments
    .filter(e => e.estado === 'ACREDITADO' || e.estado === 'INSCRITO')
    .reduce((acc, e) => {
      const course = activities.find(a => a.id === e.actividadId);
      return acc + (course ? course.creditosElectiva : 3);
    }, 0);

  const handleSubsanarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subsanarRequestId) return;

    const result = enrollmentService.resubmitCorrection(
      subsanarRequestId,
      newVoucherUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      newVoucherRef || `BBVA-SUBSANADO-${Date.now().toString().slice(-4)}`
    );

    if (result.success) {
      setActionMessage({ type: 'success', text: result.message });
      setSubsanarRequestId(null);
      setNewVoucherRef('');
      setNewVoucherUrl('');
      onRefreshData();
    } else {
      setActionMessage({ type: 'error', text: result.message });
    }
  };

  const handleCancelEnrollment = (enrollmentId: string, courseName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas cancelar tu inscripción en el curso "${courseName}"? Se liberará tu cupo asignado.`)) {
      const result = enrollmentService.cancelEnrollment(enrollmentId);
      if (result.success) {
        setActionMessage({ type: 'success', text: 'Inscripción cancelada correctamente.' });
        onRefreshData();
      } else {
        setActionMessage({ type: 'error', text: result.message });
      }
    }
  };

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Banner de Bienvenida y Perfil del Alumno */}
        <div className="card" style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-alt) 100%)',
          borderLeft: '6px solid var(--ipn-guinda)',
          position: 'relative'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--ipn-guinda) 0%, var(--ipn-oro) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.5rem',
                fontWeight: 800,
                boxShadow: 'var(--shadow-guinda)',
                flexShrink: 0
              }}>
                {session.user?.nombre ? session.user.nombre.charAt(0) : 'E'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <img src={logoIpn} alt="IPN" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
                    <div style={{ width: '1px', height: '14px', backgroundColor: '#e2e8f0' }} />
                    <img src={logoUpiicsa} alt="UPIICSA" style={{ height: '22px', width: 'auto', objectFit: 'contain' }} />
                  </div>
                  <span className="badge badge-guinda" style={{ fontSize: '0.75rem' }}>
                    {session.user?.tipoAspirante === 'EXTERNO' ? 'Usuario Externo' : 'Comunidad IPN'}
                  </span>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    CELEX 2026-2
                  </span>
                </div>

                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {session.user?.nombre || 'Alumno de Lenguas Extranjeras'}
                </h1>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <span>{session.user?.tipoAspirante === 'INTERNO_IPN' ? 'Boleta IPN' : 'RFC'}: <strong>{session.user?.identificador}</strong>{session.user?.rfc && session.user?.tipoAspirante === 'INTERNO_IPN' ? ` • RFC: ${session.user.rfc}` : ''}</span>
                  <span style={{ margin: '0 0.5rem' }}>•</span>
                  <span>{session.user?.carrera || 'UPIICSA IPN'}</span>
                </div>
              </div>
            </div>

            {/* Resumen de Estado */}
            <div style={{
              display: 'flex',
              gap: '1.25rem',
              backgroundColor: 'var(--bg-card)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ipn-guinda)' }}>
                  {myRequests.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solicitudes</div>
              </div>

              <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ipn-oro-dark)' }}>
                  {myEnrollments.filter(e => e.estado === 'INSCRITO').length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cursos Activos</div>
              </div>

              <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)' }}>
                  {totalCreditos}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Créditos Idioma</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones o Avisos de Acción */}
        {actionMessage && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            backgroundColor: actionMessage.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
            color: actionMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
            border: `1px solid ${actionMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="btn btn-sm btn-secondary"
              style={{ padding: '0.2rem 0.5rem' }}
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Barra de Navegación del Dashboard de Estudiante */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '0.5rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setActiveTab('SOLICITUDES')}
            className={`btn btn-sm ${activeTab === 'SOLICITUDES' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <FileCheck2 size={16} />
            <span>Seguimiento de Pre-Registro ({myRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MIS_CURSOS')}
            className={`btn btn-sm ${activeTab === 'MIS_CURSOS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Languages size={16} />
            <span>Mis Cursos Asignados ({myEnrollments.filter(e => e.estado !== 'CANCELADO').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CALIFICACIONES')}
            className={`btn btn-sm ${activeTab === 'CALIFICACIONES' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Award size={16} />
            <span>Calificaciones & Ordinarios</span>
          </button>

          <button
            onClick={() => setActiveTab('REQUISITOS')}
            className={`btn btn-sm ${activeTab === 'REQUISITOS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <HelpCircle size={16} />
            <span>¿Qué Necesito? (Avance y Trámites)</span>
          </button>

          <button
            onClick={() => setActiveTab('MI_HORARIO')}
            className={`btn btn-sm ${activeTab === 'MI_HORARIO' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Calendar size={16} />
            <span>Mi Horario Semanal</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORIAL')}
            className={`btn btn-sm ${activeTab === 'HISTORIAL' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <GraduationCap size={16} />
            <span>Historial & Titulación</span>
          </button>

          <button
            onClick={onOpenPreRegister}
            className="btn btn-sm btn-gold"
            style={{ borderRadius: 'var(--radius-full)', marginLeft: 'auto', fontWeight: 700 }}
          >
            <Sparkles size={16} />
            <span>Nueva Solicitud de Idioma</span>
          </button>
        </div>

        {/* CONTENIDO SEGÚN PESTAÑA */}

        {/* PESTAÑA 1: SEGUIMIENTO DE SOLICITUDES DE PRE-REGISTRO EN TIEMPO REAL */}
        {activeTab === 'SOLICITUDES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Bandeja de Trámites y Validación Escolar
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Monitorea en tiempo real la revisión de tus comprobantes de pago por el personal de la Unidad de Informática de UPIICSA.
              </p>
            </div>

            {myRequests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {myRequests.map(req => {
                  const isApproved = req.estado === 'APROBADA';
                  const needsCorrection = req.estado === 'REQUIERE_CORRECCION';
                  const inReview = req.estado === 'EN_REVISION' || req.estado === 'REGISTRADA';
                  const matchingEnrollment = enrollments.find(e => e.folio === req.folio);

                  return (
                    <div
                      key={req.id}
                      className="card"
                      style={{
                        padding: '1.5rem',
                        borderLeft: `6px solid ${
                          isApproved ? 'var(--color-success)' :
                          needsCorrection ? 'var(--color-warning)' : 'var(--color-info)'
                        }`
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span className="badge badge-guinda" style={{ fontWeight: 800 }}>
                              {req.folio}
                            </span>
                            <span className={`badge ${
                              isApproved ? 'badge-success' :
                              needsCorrection ? 'badge-warning' : 'badge-info'
                            }`}>
                              {req.estado.replace('_', ' ')}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {req.cursoNombre}
                          </h3>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Horario Solicitado: <strong>{req.horarioDeseado}</strong>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                          <div style={{ color: 'var(--text-muted)' }}>Registrado el: {req.fechaRegistro}</div>
                          <div style={{ fontWeight: 700, color: 'var(--ipn-guinda)', marginTop: '0.2rem' }}>
                            Depósito BBVA: ${req.montoPago}.00 MXN
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Ref: {req.numeroReferenciaPago}
                          </div>
                        </div>
                      </div>

                      {/* Stepper visual de estado de trámite */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--bg-alt)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.25rem',
                        textAlign: 'center',
                        fontSize: '0.78rem'
                      }}>
                        <div style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                          ✓ 1. Pre-Registro Recibido
                        </div>
                        <div style={{
                          color: needsCorrection ? 'var(--color-warning)' : inReview ? 'var(--color-info)' : 'var(--color-success)',
                          fontWeight: 700
                        }}>
                          {needsCorrection ? '⚠️ 2. Observaciones de Pago' : inReview ? '⏳ 2. En Revisión UDI' : '✓ 2. Pago Validado'}
                        </div>
                        <div style={{
                          color: isApproved ? 'var(--color-success)' : 'var(--text-muted)',
                          fontWeight: 700
                        }}>
                          {isApproved ? '✓ 3. Grupo & Salón Asignado' : '○ 3. Asignación Pendiente'}
                        </div>
                      </div>

                      {/* ALERTA DE OBSERVACIONES DEL ADMINISTRADOR (Si requiere corrección) */}
                      {needsCorrection && (
                        <div style={{
                          backgroundColor: 'var(--color-warning-bg)',
                          border: '1px solid var(--color-warning)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                            <AlertTriangle size={18} />
                            <span>Observaciones del Personal de CELEX:</span>
                          </div>
                          <p style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                            "{req.observacionesAdmin || 'Se requiere actualizar el comprobante de pago o verificar la referencia bancaria.'}"
                          </p>
                          <button
                            onClick={() => {
                              setSubsanarRequestId(req.id);
                              setNewVoucherRef(req.numeroReferenciaPago);
                            }}
                            className="btn btn-sm btn-gold"
                            style={{ fontWeight: 700 }}
                          >
                            <Upload size={15} />
                            <span>Subsanar / Cargar Nuevo Comprobante</span>
                          </button>
                        </div>
                      )}

                      {/* ASIGNACIÓN OFICIAL Y BOTÓN DE CÉDULA QR (Si está aprobada) */}
                      {isApproved && (
                        <div style={{
                          backgroundColor: 'var(--color-success-bg)',
                          border: '1px solid var(--color-success)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          marginBottom: '1rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontWeight: 800, fontSize: '0.9rem' }}>
                              <CheckCircle2 size={18} />
                              <span>Asignación Académica Completada</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#065f46', marginTop: '0.25rem' }}>
                              Grupo: <strong>{req.grupoAsignado || 'ING-B2-02'}</strong> • Salón: <strong>{req.salonAsignado || 'Lab Multimedia 1'}</strong> • Docente: <strong>{req.profesorAsignado || 'Titular CELEX'}</strong>
                            </div>
                          </div>

                          {matchingEnrollment && (
                            <button
                              onClick={() => setSelectedReceipt(matchingEnrollment)}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: 700 }}
                            >
                              <QrCode size={16} />
                              <span>Ver Cédula Oficial con QR</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Acciones de la tarjeta */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <a
                          href={req.comprobantePagoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-secondary"
                        >
                          <Eye size={14} />
                          <span>Ver Voucher Adjunto</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <FileCheck2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No tienes solicitudes de pre-registro activas
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Inicia tu pre-registro en línea para el semestre 2026-2 en cualquiera de nuestros idiomas.
                </p>
                <button onClick={onOpenPreRegister} className="btn btn-primary">
                  <Sparkles size={16} />
                  <span>Realizar Pre-Registro Ahora</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: MIS CURSOS ASIGNADOS */}
        {activeTab === 'MIS_CURSOS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Mis Cursos de Lenguas Extranjeras Asignados
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Cursos con inscripción formal y profesores asignados por la Coordinación de CELEX UPIICSA.
              </p>
            </div>

            {myEnrollments.filter(e => e.estado !== 'CANCELADO').length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: '1.5rem'
              }}>
                {myEnrollments.filter(e => e.estado !== 'CANCELADO').map(enr => {
                  const teacher = gradesService.getTeacherInfo(enr.profesorNombre) || dbRepository.getTeacherById(enr.profesorId || '');
                  const ev = enr.evaluacion;
                  const isAcreditado = ev?.acreditado ?? (ev?.calificacionFinal !== undefined ? ev.calificacionFinal >= 80 : false);

                  return (
                    <div key={enr.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-guinda">{enr.idioma}</span>
                        <span className="badge badge-gold">Grupo: {enr.grupo}</span>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                          {enr.actividadNombre}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Folio Oficial: {enr.folio}
                        </div>
                      </div>

                      {/* Horario y Salón */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.45rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-main)',
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={15} color="var(--ipn-guinda)" />
                          <span><strong>Horario:</strong> {enr.horarioTexto}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={15} color="var(--ipn-guinda)" />
                          <span><strong>Salón:</strong> {enr.salon}</span>
                        </div>
                      </div>

                      {/* Tarjeta del Profesor Asignado */}
                      <div style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        backgroundColor: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: 'var(--ipn-guinda-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            flexShrink: 0
                          }}>
                            {teacher?.avatarUrl ? (
                              <img src={teacher.avatarUrl} alt={enr.profesorNombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              enr.profesorNombre.charAt(0)
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ipn-guinda)' }}>
                              PROFESOR TITULAR ASIGNADO
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {enr.profesorNombre}
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          {teacher?.especialidad || 'Docente de Lenguas Extranjeras UPIICSA'}
                        </div>

                        {teacher?.correo && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                            <Mail size={13} color="var(--ipn-guinda)" />
                            <span>{teacher.correo}</span>
                          </div>
                        )}

                        {teacher && (
                          <button
                            type="button"
                            onClick={() => setSelectedTeacherModal(teacher)}
                            className="btn btn-secondary btn-sm"
                            style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                          >
                            <User size={13} />
                            <span>Ver Semblanza y Acreditaciones Docentes</span>
                          </button>
                        )}
                      </div>

                      {/* Estatus de Calificación Resumido */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: isAcreditado ? 'var(--color-success-bg)' : 'var(--bg-main)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem'
                      }}>
                        <span style={{ fontWeight: 600 }}>Estatus de Acreditación:</span>
                        <span className={`badge ${isAcreditado ? 'badge-success' : 'badge-warning'}`}>
                          {ev?.publicada 
                            ? (isAcreditado ? `Acreditado (${ev.calificacionFinal}/100)` : `No Acreditado (${ev.calificacionFinal}/100)`)
                            : 'En Evaluación Continua'}
                        </span>
                      </div>

                      {/* Botones de acción */}
                      <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <button
                          onClick={() => setActiveTab('CALIFICACIONES')}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, fontWeight: 700 }}
                        >
                          <Award size={15} />
                          <span>Ver Calificaciones</span>
                        </button>
                        <button
                          onClick={() => setSelectedReceipt(enr)}
                          className="btn btn-secondary btn-sm"
                          title="Ver Cédula Oficial con QR"
                        >
                          <QrCode size={15} />
                          <span>Cédula QR</span>
                        </button>
                        <button
                          onClick={() => handleCancelEnrollment(enr.id, enr.actividadNombre)}
                          className="btn btn-secondary btn-sm"
                          title="Dar de baja curso"
                        >
                          <Trash2 size={15} color="var(--color-danger)" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <Languages size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Aún no tienes cursos de idiomas activos
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Tus cursos aparecerán aquí una vez que el personal de CELEX apruebe tu pre-registro y asigne tu grupo.
                </p>
                <button onClick={() => setActiveTab('SOLICITUDES')} className="btn btn-primary">
                  Revisar Estatus de Solicitudes
                </button>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: CALIFICACIONES POR ORDINARIOS (RF-26, RF-27, RN-05, DD-15) */}
        {activeTab === 'CALIFICACIONES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={24} color="var(--ipn-guinda)" />
                <span>Calificaciones Oficiales por Ordinarios</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Consulta el desglose de tus evaluaciones ordinarias asentadas por tus profesores titulares en CELEX UPIICSA.
              </p>
            </div>

            {/* Aviso de Normativa Oficial de Acreditación */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--color-info-bg)',
              border: '1px solid var(--color-info)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <HelpCircle size={20} color="var(--color-info)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Criterios Oficiales de Evaluación Escolar CELEX (RF-26 / RF-27 / RN-05):</strong>
                <p style={{ margin: '0.2rem 0 0 0' }}>
                  La acreditación requiere una calificación total mínima de <strong>80 puntos sobre 100</strong> y un 80% de asistencia.
                  Ponderación estándar: 40% 1er Ordinario (Examen Medio), 40% 2do Ordinario (Examen Final) y 20% Tareas/Actividades.
                </p>
              </div>
            </div>

            {myEnrollments.filter(e => e.estado !== 'CANCELADO').length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myEnrollments.filter(e => e.estado !== 'CANCELADO').map(enr => {
                  const ev = enr.evaluacion;
                  const isPublished = ev?.publicada ?? false;
                  const finalScore = ev?.calificacionFinal ?? 0;
                  const isAcreditado = ev?.acreditado ?? (finalScore >= 80);
                  const teacher = gradesService.getTeacherInfo(enr.profesorNombre);

                  return (
                    <div key={enr.id} className="card" style={{ padding: '1.75rem' }}>
                      {/* Cabecera del Curso y Docente */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        borderBottom: '1px solid var(--border-color)',
                        paddingBottom: '1rem'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span className="badge badge-guinda">{enr.idioma}</span>
                            <span className="badge badge-gold">Grupo {enr.grupo}</span>
                            <span className={`badge ${isPublished ? 'badge-success' : 'badge-warning'}`}>
                              {isPublished ? 'Calificación Oficial Publicada' : 'En Evaluación Continua'}
                            </span>
                          </div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0' }}>
                            {enr.actividadNombre}
                          </h3>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <strong>Profesor Titular:</strong> {enr.profesorNombre} {teacher?.correo ? `(${teacher.correo})` : ''}
                          </div>
                        </div>

                        {/* Botón Imprimir Boleta Oficial */}
                        <button
                          onClick={() => setSelectedBoletaModal(enr)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontWeight: 700 }}
                        >
                          <Printer size={15} />
                          <span>Boleta Oficial de Ordinarios</span>
                        </button>
                      </div>

                      {/* Desglose de Evaluaciones por Ordinarios */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        {/* 1er Ordinario */}
                        <div style={{
                          backgroundColor: 'var(--bg-main)',
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            1er Ordinario (Medio)
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ipn-guinda)', margin: '0.35rem 0' }}>
                            {ev?.primerOrdinario !== undefined ? ev.primerOrdinario : '-'}
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/100</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Ponderación 40%
                          </div>
                        </div>

                        {/* 2do Ordinario */}
                        <div style={{
                          backgroundColor: 'var(--bg-main)',
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            2do Ordinario (Final)
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ipn-guinda)', margin: '0.35rem 0' }}>
                            {ev?.segundoOrdinario !== undefined ? ev.segundoOrdinario : '-'}
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/100</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Ponderación 40%
                          </div>
                        </div>

                        {/* Tareas / Actividades */}
                        <div style={{
                          backgroundColor: 'var(--bg-main)',
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Tareas & Speaking
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-info)', margin: '0.35rem 0' }}>
                            {ev?.tareasActividades !== undefined ? ev.tareasActividades : '-'}
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/100</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Ponderación 20%
                          </div>
                        </div>

                        {/* Calificación Total Oficial */}
                        <div style={{
                          backgroundColor: isPublished 
                            ? (isAcreditado ? 'var(--color-success-bg)' : 'var(--color-danger-bg)')
                            : 'var(--bg-main)',
                          padding: '1.25rem',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isPublished ? (isAcreditado ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--border-color)'}`,
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isPublished ? (isAcreditado ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Calificación Total
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 900, color: isPublished ? (isAcreditado ? 'var(--color-success)' : 'var(--color-danger)') : 'var(--text-main)', margin: '0.35rem 0' }}>
                            {ev?.calificacionFinal !== undefined ? ev.calificacionFinal : (isPublished ? finalScore : 'Pendiente')}
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                            {isPublished 
                              ? (isAcreditado ? '✅ ACREDITADO (>=80)' : '❌ NO ACREDITADO (<80)')
                              : 'Borrador'}
                          </div>
                        </div>
                      </div>

                      {/* Observaciones y Oportunidades */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-main)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        gap: '1rem'
                      }}>
                        <div>
                          <strong>Retroalimentación del Docente:</strong>
                          <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontStyle: ev?.observacionesDocente ? 'normal' : 'italic' }}>
                            {ev?.observacionesDocente || 'Sin comentarios registrados hasta el momento por el profesor titular.'}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          <span style={{ fontWeight: 600 }}>Oportunidad Cursada:</span>
                          <span className="badge badge-guinda">
                            Intento {ev?.oportunidad || 1} de 3
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <Award size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  No tienes cursos inscritos para mostrar calificaciones
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Una vez que seas asignado a un grupo oficial, aquí verás tus calificaciones por ordinarios.
                </p>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: ¿QUÉ NECESITO? (REQUISITOS DE AVANCE, BAJAS, CONSTANCIAS Y TITULACIÓN) */}
        {activeTab === 'REQUISITOS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={24} color="var(--ipn-guinda)" />
                <span>¿Qué Necesito para mi Avance Escolar y Trámites?</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Verifica de manera interactiva tus requisitos para avanzar al siguiente nivel, tramitar constancias, solicitar baja temporal o liberar titulación.
              </p>
            </div>

            {/* Resumen del Alumno */}
            <div className="card" style={{
              padding: '1.5rem',
              backgroundColor: 'var(--bg-card)',
              borderLeft: '6px solid var(--ipn-oro)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div>
                <span className="badge badge-gold" style={{ fontWeight: 800, marginBottom: '0.35rem' }}>
                  DIAGNÓSTICO ACADÉMICO PERSONALIZADO
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  {student?.nombreCompleto || session.user?.nombre}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Boleta/RFC: {studentBoleta} • Carrera: {student?.carrera || session.user?.carrera || 'UPIICSA IPN'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nivel Actual Cursado:</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ipn-guinda)' }}>
                  {academicProgress.nivelActual}
                </div>
              </div>
            </div>

            {/* Cuadrícula de Requisitos por Trámite */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* 1. Requisito para Avanzar de Nivel */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ backgroundColor: 'var(--ipn-guinda-glow)', padding: '8px', borderRadius: '8px' }}>
                    <BookOpen size={20} color="var(--ipn-guinda)" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    1. Avanzar al Siguiente Nivel
                  </h4>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <strong>Regla RN-05 / RF-27:</strong> Para avanzar de nivel debes obtener un mínimo de <strong>80/100</strong> en la calificación final y contar con al menos 80% de asistencia.
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Próximo Nivel Elegible:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ipn-guinda)', marginTop: '2px' }}>
                    {academicProgress.siguienteNivel}
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: academicProgress.puedeAvanzar ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 700 }}>
                    {academicProgress.puedeAvanzar 
                      ? '✅ Cumples con la acreditación para inscribirte.'
                      : `⚠️ ${academicProgress.motivoBloqueo || 'Pendiente de publicar calificaciones.'}`}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Nota: Aprobar el nivel habilita tu elegibilidad, pero la inscripción formal requiere que selecciones tu grupo en la convocatoria correspondiente.
                </div>
              </div>

              {/* 2. Regla de las 3 Oportunidades y Repetición */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ backgroundColor: 'var(--ipn-oro-glow)', padding: '8px', borderRadius: '8px' }}>
                    <AlertTriangle size={20} color="var(--ipn-oro-dark)" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    2. Límite de Oportunidades (RN-06)
                  </h4>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <strong>Regla RN-06 / RF-28:</strong> Todo alumno cuenta con un máximo de <strong>3 oportunidades</strong> para cursar y acreditar el mismo nivel.
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700 }}>Oportunidades Usadas:</span>
                    <span style={{ fontWeight: 800, color: 'var(--ipn-guinda)' }}>
                      {academicProgress.oportunidadesUsadas} de 3
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', marginBottom: '0.5rem' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(academicProgress.oportunidadesUsadas / 3) * 100}%`,
                        backgroundColor: academicProgress.oportunidadesUsadas >= 3 ? 'var(--color-danger)' : 'var(--ipn-oro)' 
                      }} 
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {academicProgress.requiereExamenUbicacion 
                      ? '🚨 Has alcanzado 3 reprobaciones. Es OBLIGATORIO presentar examen de ubicación para continuar.'
                      : 'Cuentas con margen de oportunidades académicas dentro de la norma.'}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  A la 3ra reprobación el sistema bloquea la reinscripción directa al mismo nivel.
                </div>
              </div>

              {/* 3. Requisitos para Baja Temporal */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ backgroundColor: 'rgba(2,132,199,0.15)', padding: '8px', borderRadius: '8px' }}>
                    <Clock size={20} color="var(--color-info)" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    3. Baja Temporal de Curso
                  </h4>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <strong>Regla RN-07 / RN-08 / RF-31:</strong> La baja temporal se permite <strong>únicamente a partir de haber acreditado Intermedio 1</strong> y tiene vigencia de un solo ciclo escolar de la modalidad cursada.
                </p>

                <div style={{
                  backgroundColor: academicProgress.elegibleBajaTemporal ? 'var(--color-success-bg)' : 'var(--bg-main)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${academicProgress.elegibleBajaTemporal ? 'var(--color-success)' : 'var(--border-color)'}`,
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: academicProgress.elegibleBajaTemporal ? 'var(--color-success)' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {academicProgress.elegibleBajaTemporal ? '✅ Alumno Elegible para Baja Temporal' : '⚠️ No Elegible para Baja Temporal'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {academicProgress.bajaTemporalDetalle}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Los cursos semanales duran 1 mes y los sabatinos 2 meses. No se pierden calificaciones históricas.
                </div>
              </div>

              {/* 4. Requisitos para Constancias Oficiales */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', padding: '8px', borderRadius: '8px' }}>
                    <FileCheck2 size={20} color="var(--color-success)" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    4. Constancia de Módulo Básico
                  </h4>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <strong>Regla RN-09 / RF-36 / RF-37:</strong> Las constancias se emiten solo si el estudiante aprobó todos los niveles requeridos (5 módulos básicos de B1 a B5).
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700 }}>Progreso Nivel Básico:</span>
                    <span style={{ fontWeight: 800, color: 'var(--color-success)' }}>
                      {academicProgress.constanciaBasicoProgreso} de 5 módulos
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', marginBottom: '0.5rem' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(academicProgress.constanciaBasicoProgreso / 5) * 100}%`,
                        backgroundColor: 'var(--color-success)' 
                      }} 
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {academicProgress.constanciaBasicoElegible 
                      ? '🎉 ¡Completaste los 5 módulos básicos! Puedes solicitar tu Constancia Oficial en ventanilla.'
                      : `Te faltan ${5 - academicProgress.constanciaBasicoProgreso} módulo(s) para obtener la constancia de Básico terminado.`}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Las constancias requieren validación del expediente antes de su emisión con sello oficial.
                </div>
              </div>

              {/* 5. Requisito de Titulación UPIICSA */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ backgroundColor: 'var(--ipn-guinda-glow)', padding: '8px', borderRadius: '8px' }}>
                    <GraduationCap size={20} color="var(--ipn-guinda)" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    5. Liberación de Idioma para Titulación
                  </h4>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <strong>Normativa Curricular UPIICSA:</strong> Para iniciar trámites de titulación (Tesis, Seminario de Titulación o Prácticas), los estudiantes deben acreditar un mínimo de 15 créditos curriculares en lenguas extranjeras (o examen TOEFL ITP mayor a 460 puntos).
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-main)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 700 }}>Créditos de Idioma Acumulados:</span>
                    <span style={{ fontWeight: 800, color: 'var(--ipn-guinda)' }}>
                      {academicProgress.creditosTotales} / 15 Créditos
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', marginBottom: '0.5rem' }}>
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${Math.min(100, (academicProgress.creditosTotales / 15) * 100)}%`,
                        backgroundColor: 'var(--ipn-guinda)' 
                      }} 
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {academicProgress.requisitoTitulacionCumplido
                      ? '🎓 ¡Requisito de titulación completado! Tus créditos han sido validados por la UDI.'
                      : `Te faltan ${Math.max(0, 15 - academicProgress.creditosTotales)} créditos para cubrir la opción de titulación.`}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Aplica para carreras de Informática, Transporte, Industrial y Administración Industrial.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: MI HORARIO SEMANAL */}
        {activeTab === 'MI_HORARIO' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Mi Horario Semanal de Idiomas
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Distribución de clases asignadas en salones y laboratorios del CELEX UPIICSA.
              </p>
            </div>

            <WeeklyScheduleView
              activities={activities}
              enrollments={myEnrollments}
              filterEnrolledOnly={true}
              onSelectActivity={(act) => onViewActivityDetails(act)}
            />
          </div>
        )}

        {/* PESTAÑA 4: HISTORIAL Y TITULACIÓN */}
        {activeTab === 'HISTORIAL' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Acreditación de Lenguas Extranjeras & Titulación
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Seguimiento de niveles cursados en CELEX UPIICSA para la liberación del requisito curricular de titulación en el IPN.
              </p>
            </div>

            {/* Barra de Progreso hacia el Requisito de Titulación */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--ipn-guinda)' }}>
                  Progreso de Requisito de Idioma (Nivel Básico Completo o B2)
                </span>
                <span style={{ fontWeight: 800, color: 'var(--color-success)' }}>
                  60% Completado
                </span>
              </div>
              <div className="progress-bar" style={{ height: '10px', marginBottom: '0.75rem' }}>
                <div className="progress-fill" style={{ width: '60%', backgroundColor: 'var(--ipn-guinda)' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Reglamento de Titulación IPN: Los alumnos de licenciatura e ingeniería deben acreditar un mínimo de 5 módulos de lengua extranjera o certificación TOEFL ITP mayor a 460 puntos.
              </p>
            </div>

            {/* Tabla de Niveles Registrados */}
            <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem' }}>Idioma & Nivel</th>
                    <th style={{ padding: '0.75rem' }}>Periodo</th>
                    <th style={{ padding: '0.75rem' }}>Calificación</th>
                    <th style={{ padding: '0.75rem' }}>Asistencia</th>
                    <th style={{ padding: '0.75rem' }}>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Inglés Básico 1</td>
                    <td style={{ padding: '0.75rem' }}>2025-2</td>
                    <td style={{ padding: '0.75rem', color: 'var(--color-success)', fontWeight: 800 }}>9.5</td>
                    <td style={{ padding: '0.75rem' }}>96%</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge badge-success">Acreditado</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Inglés Básico 2</td>
                    <td style={{ padding: '0.75rem' }}>2026-1</td>
                    <td style={{ padding: '0.75rem', color: 'var(--color-success)', fontWeight: 800 }}>9.0</td>
                    <td style={{ padding: '0.75rem' }}>92%</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge badge-success">Acreditado</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>Inglés Intermedio 1</td>
                    <td style={{ padding: '0.75rem' }}>2026-2</td>
                    <td style={{ padding: '0.75rem', color: 'var(--ipn-oro-dark)', fontWeight: 800 }}>En Curso</td>
                    <td style={{ padding: '0.75rem' }}>100%</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge badge-info">Inscrito</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL DE SUBSANACIÓN DE COMPROBANTE DE PAGO */}
        {subsanarRequestId && (
          <div className="modal-overlay" onClick={() => setSubsanarRequestId(null)}>
            <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ backgroundColor: 'var(--ipn-guinda)', color: '#ffffff' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Subsanar Observación de Pago</h3>
                <button onClick={() => setSubsanarRequestId(null)} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '0.4rem', color: '#ffffff', background: 'transparent', border: 'none' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubsanarSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Carga una nueva fotografía nítida del comprobante original de depósito bancario BBVA y confirma el número de autorización para que la UDI vuelva a evaluar tu expediente:
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Número de Autorización / Referencia Corregido:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. BBVA-AUT-994120"
                    value={newVoucherRef}
                    onChange={(e) => setNewVoucherRef(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Nueva Fotografía / Archivo del Voucher:
                  </label>
                  <div style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-alt)'
                  }}>
                    <Camera size={24} color="var(--ipn-guinda)" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      comprobante_bancario_resubido.jpg
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewVoucherUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80')}
                      className="btn btn-sm btn-secondary"
                    >
                      <span>Simular Carga de Fotografía Nítida</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setSubsanarRequestId(null)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Send size={15} />
                    <span>Enviar Corrección a la UDI</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE FICHA OFICIAL CON CÓDIGO QR */}
        <EnrollmentReceiptModal
          enrollment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />

        {/* MODAL: SEMBLANZA Y FICHA DEL PROFESOR TITULAR */}
        {selectedTeacherModal && (
          <div className="modal-overlay" onClick={() => setSelectedTeacherModal(null)}>
            <div 
              className="modal-content" 
              style={{ maxWidth: '580px', padding: '0', overflow: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con gradiente institucional */}
              <div style={{
                background: 'linear-gradient(90deg, var(--ipn-guinda) 0%, #892658 100%)',
                color: '#ffffff',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    border: '3px solid #ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--ipn-guinda)',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    {selectedTeacherModal.avatarUrl ? (
                      <img src={selectedTeacherModal.avatarUrl} alt={selectedTeacherModal.nombreCompleto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      selectedTeacherModal.nombreCompleto.charAt(0)
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#fed7aa', fontWeight: 700, textTransform: 'uppercase' }}>
                      Docente de Lenguas Extranjeras CELEX
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 0 0' }}>
                      {selectedTeacherModal.nombreCompleto}
                    </h3>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedTeacherModal(null)} 
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '50%', padding: '0.4rem', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contenido de la Ficha Docente */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ipn-guinda)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Especialidad Académica
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {selectedTeacherModal.especialidad}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ipn-guinda)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Certificaciones y Acreditaciones Internacionales
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    {selectedTeacherModal.certificaciones}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ipn-guinda)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Semblanza y Trayectoria Docente
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {selectedTeacherModal.semblanza}
                  </p>
                </div>

                {/* Medios de Contacto */}
                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Mail size={16} color="var(--ipn-guinda)" />
                    <span><strong>Correo Institucional:</strong> {selectedTeacherModal.correo}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Phone size={16} color="var(--ipn-guinda)" />
                    <span><strong>Conmutador UPIICSA:</strong> {selectedTeacherModal.telefono}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="var(--ipn-guinda)" />
                    <span><strong>Ubicación de Asesorías:</strong> Edificio CELEX UPIICSA - Sala de Profesores</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button onClick={() => setSelectedTeacherModal(null)} className="btn btn-primary">
                    Cerrar Ficha
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: BOLETA OFICIAL DE CALIFICACIONES ORDINARIAS IMPRIMIBLE */}
        {selectedBoletaModal && (
          <div className="modal-overlay" onClick={() => setSelectedBoletaModal(null)}>
            <div 
              className="modal-content" 
              style={{ maxWidth: '750px', padding: '2rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Encabezado Oficial UPIICSA */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={logoIpn} alt="IPN" style={{ height: '46px', width: 'auto' }} />
                  <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--border-color)' }} />
                  <img src={logoUpiicsa} alt="UPIICSA" style={{ height: '46px', width: 'auto' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--ipn-guinda)' }}>
                      INSTITUTO POLITÉCNICO NACIONAL
                    </h3>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      UNIDAD PROFESIONAL INTERDISCIPLINARIA (UPIICSA) • CENTRO DE LENGUAS EXTRANJERAS
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedBoletaModal(null)} 
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '50%', padding: '0.4rem' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <span className="badge badge-guinda" style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  BOLETA INDIVIDUAL DE EVALUACIONES ORDINARIAS
                </span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Folio Institucional: {selectedBoletaModal.folio} • Ciclo Escolar: 2026-2
                </div>
              </div>

              {/* Datos del Alumno y Curso */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-main)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-color)'
              }}>
                <div><strong>Alumno:</strong> {selectedBoletaModal.alumnoNombre}</div>
                <div><strong>Boleta / RFC:</strong> {selectedBoletaModal.alumnoBoleta}</div>
                <div><strong>Carrera:</strong> {selectedBoletaModal.alumnoCarrera}</div>
                <div><strong>Curso:</strong> {selectedBoletaModal.actividadNombre}</div>
                <div><strong>Grupo:</strong> {selectedBoletaModal.grupo}</div>
                <div><strong>Profesor Titular:</strong> {selectedBoletaModal.profesorNombre}</div>
              </div>

              {/* Tabla de Calificaciones Ordinarias */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-alt)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.65rem' }}>Evaluación Ordinaria</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Ponderación</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Calificación</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 600 }}>1er Ordinario (Examen Medio de Competencias)</td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>40%</td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontWeight: 800 }}>
                      {selectedBoletaModal.evaluacion?.primerOrdinario ?? '-'} / 100
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span className="badge badge-info">Asentado</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 600 }}>2do Ordinario (Examen Final de Acreditación)</td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>40%</td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontWeight: 800 }}>
                      {selectedBoletaModal.evaluacion?.segundoOrdinario ?? '-'} / 100
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span className="badge badge-info">Asentado</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 600 }}>Evaluación Continua (Tareas, Speaking y Plataforma)</td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>20%</td>
                    <td style={{ padding: '0.65rem', textAlign: 'center', fontWeight: 800 }}>
                      {selectedBoletaModal.evaluacion?.tareasActividades ?? '-'} / 100
                    </td>
                    <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                      <span className="badge badge-info">Asentado</span>
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderTop: '2px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 800, fontSize: '0.95rem' }}>CALIFICACIÓN FINAL TOTAL (ESCALA 0-100)</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 800 }}>100%</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 900, fontSize: '1.2rem', color: (selectedBoletaModal.evaluacion?.calificacionFinal ?? 0) >= 80 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {selectedBoletaModal.evaluacion?.calificacionFinal ?? '-'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span className={`badge ${(selectedBoletaModal.evaluacion?.calificacionFinal ?? 0) >= 80 ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 800 }}>
                        {(selectedBoletaModal.evaluacion?.calificacionFinal ?? 0) >= 80 ? 'ACREDITADO' : 'NO ACREDITADO'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Firmas Oficiales */}
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '2.5rem' }}>
                <div style={{ width: '220px', borderTop: '1px solid var(--text-main)', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>{selectedBoletaModal.profesorNombre}</strong>
                  <div>Docente Titular Asignado</div>
                </div>
                <div style={{ width: '220px', borderTop: '1px solid var(--text-main)', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                  <strong>Mtro. Mario Bizarro Moreno</strong>
                  <div>Coordinador de Sistemas / CELEX</div>
                </div>
              </div>

              {/* Botón Imprimir */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button onClick={() => window.print()} className="btn btn-primary">
                  <Printer size={16} />
                  <span>Imprimir Boleta Oficial</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
