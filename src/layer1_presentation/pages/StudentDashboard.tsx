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
  X
} from 'lucide-react';
import { WeeklyScheduleView } from '../components/WeeklyScheduleView';
import { EnrollmentReceiptModal } from '../components/EnrollmentReceiptModal';
import { enrollmentService } from '../../layer2_business/enrollmentService';
import { dbRepository } from '../../layer3_data/dbRepository';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';
import type { 
  AuthSession, 
  CelexCourse, 
  Enrollment
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
  const [activeTab, setActiveTab] = useState<'SOLICITUDES' | 'MIS_CURSOS' | 'MI_HORARIO' | 'HISTORIAL' | 'PERFIL'>('SOLICITUDES');
  const [selectedReceipt, setSelectedReceipt] = useState<Enrollment | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal para subsanar observaciones de comprobante
  const [subsanarRequestId, setSubsanarRequestId] = useState<string | null>(null);
  const [newVoucherRef, setNewVoucherRef] = useState('');
  const [newVoucherUrl, setNewVoucherUrl] = useState('');

  const studentBoleta = session.user?.identificador || '';
  const student = dbRepository.getStudentByBoleta(studentBoleta);

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
            <Award size={16} />
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
                Cursos con inscripción formal y folio oficial validado por la Unidad de Informática (UDI).
              </p>
            </div>

            {myEnrollments.filter(e => e.estado !== 'CANCELADO').length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem'
              }}>
                {myEnrollments.filter(e => e.estado !== 'CANCELADO').map(enr => {
                  return (
                    <div key={enr.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge badge-guinda">{enr.idioma}</span>
                        <span className="badge badge-gold">Grupo: {enr.grupo}</span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        {enr.actividadNombre}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={15} color="var(--ipn-guinda)" />
                          <span>{enr.horarioTexto}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={15} color="var(--ipn-guinda)" />
                          <span>{enr.salon}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <User size={15} color="var(--ipn-guinda)" />
                          <span>Prof. {enr.profesorNombre}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSelectedReceipt(enr)}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, fontWeight: 700 }}
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
      </div>
    </div>
  );
};
