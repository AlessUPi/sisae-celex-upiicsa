import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  Megaphone, 
  CheckCircle2, 
  UserCheck, 
  Layers,
  X,
  Languages,
  FileCheck2,
  AlertTriangle,
  Eye,
  Clock,
  Activity,
  Send
} from 'lucide-react';
import type { 
  CelexCourse, 
  Teacher, 
  Student, 
  Enrollment, 
  Announcement, 
  PreRegistrationRequest,
  LanguageCategory
} from '../../types';
import { activityService } from '../../layer2_business/activityService';
import { announcementService } from '../../layer2_business/announcementService';
import { enrollmentService } from '../../layer2_business/enrollmentService';
import { dbRepository } from '../../layer3_data/dbRepository';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';

interface AdminDashboardProps {
  activities: CelexCourse[];
  teachers: Teacher[];
  students: Student[];
  enrollments: Enrollment[];
  announcements: Announcement[];
  onRefreshData: () => void;
  onOpenLayerInspector: () => void;
}

const LANGUAGES_LIST: LanguageCategory[] = [
  'Inglés',
  'Francés',
  'Alemán',
  'Italiano',
  'Portugués',
  'Japonés'
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activities,
  teachers,
  students: _students,
  enrollments,
  announcements,
  onRefreshData,
  onOpenLayerInspector
}) => {
  const [activeTab, setActiveTab] = useState<'SOLICITUDES' | 'CURSOS' | 'DOCENTES' | 'ANUNCIOS' | 'AUDITORIA'>('SOLICITUDES');
  const [requestFilter, setRequestFilter] = useState<'TODAS' | 'EN_REVISION' | 'REQUIERE_CORRECCION' | 'APROBADA'>('TODAS');
  const [searchRequest, setSearchRequest] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Estados de Modales Administrativos
  // 1. Modal de Aprobación y Asignación
  const [assigningRequest, setAssigningRequest] = useState<PreRegistrationRequest | null>(null);
  const [assignGroup, setAssignGroup] = useState('');
  const [assignSalon, setAssignSalon] = useState('');
  const [assignTeacher, setAssignTeacher] = useState('');

  // 2. Modal de Solicitud de Corrección
  const [correctingRequest, setCorrectingRequest] = useState<PreRegistrationRequest | null>(null);
  const [correctionNote, setCorrectionNote] = useState('');

  // 3. Modal de Vista Previa de Voucher / Identificación
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  // 4. Modal de Curso
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<CelexCourse> | null>(null);

  const requests = dbRepository.getRequests();
  const auditLogs = dbRepository.getAuditLogs();
  const metrics = activityService.getSystemMetrics();

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Filtrado de solicitudes de pre-registro
  const filteredRequests = requests.filter(r => {
    if (requestFilter !== 'TODAS' && r.estado !== requestFilter) return false;
    if (searchRequest.trim() !== '') {
      const q = searchRequest.toLowerCase().trim();
      return (
        r.folio.toLowerCase().includes(q) ||
        r.aspiranteNombre.toLowerCase().includes(q) ||
        r.identificador.toLowerCase().includes(q) ||
        (r.rfc && r.rfc.toLowerCase().includes(q)) ||
        r.cursoNombre.toLowerCase().includes(q) ||
        r.numeroReferenciaPago.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // -------------------------------------------------------------------------
  // ACCIONES DE VALIDACIÓN ESCOLAR (Documento p. 20-21, 24, 26)
  // -------------------------------------------------------------------------
  const handleOpenAssignModal = (req: PreRegistrationRequest) => {
    const course = activities.find(a => a.id === req.cursoId);
    setAssigningRequest(req);
    setAssignGroup(`${req.idioma.substring(0, 3).toUpperCase()}-${req.nivel.substring(0, 2).replace(/\s/g, '')}-0${Math.floor(1 + Math.random() * 3)}`);
    setAssignSalon(course?.salonOEspacio || 'Aula CELEX 102');
    setAssignTeacher(course?.profesorNombre || (teachers[0] ? teachers[0].nombreCompleto : 'Docente Asignado'));
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRequest) return;

    const course = activities.find(a => a.id === assigningRequest.cursoId);
    const result = enrollmentService.approveAndAssignRequest(assigningRequest.id, {
      grupo: assignGroup.trim(),
      salon: assignSalon.trim(),
      profesorNombre: assignTeacher.trim(),
      horarioTexto: assigningRequest.horarioDeseado || `${course?.dias.join(', ')} ${course?.horaInicio} - ${course?.horaFin}`,
      dias: course ? course.dias : ['Lunes', 'Miércoles']
    });

    if (result.success) {
      showNotice(result.message);
      setAssigningRequest(null);
      onRefreshData();
    } else {
      alert(result.message);
    }
  };

  const handleOpenCorrectionModal = (req: PreRegistrationRequest) => {
    setCorrectingRequest(req);
    setCorrectionNote('El comprobante de pago bancario adjunto no permite verificar con nitidez el número de autorización o fecha del depósito. Favor de sustituir con una fotografía legible del comprobante original.');
  };

  const handleConfirmCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingRequest) return;

    const result = enrollmentService.requestCorrection(correctingRequest.id, correctionNote);
    if (result.success) {
      showNotice(result.message);
      setCorrectingRequest(null);
      onRefreshData();
    } else {
      alert(result.message);
    }
  };

  // -------------------------------------------------------------------------
  // GESTIÓN DE CURSOS DE IDIOMAS
  // -------------------------------------------------------------------------
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const result = activityService.createOrUpdateActivity(editingCourse);
    if (result.success) {
      showNotice(result.message);
      setIsCourseModalOpen(false);
      setEditingCourse(null);
      onRefreshData();
    } else {
      alert(result.message);
    }
  };

  const handleDeleteCourse = (id: string, name: string) => {
    if (window.confirm(`¿Deseas retirar el curso "${name}" del catálogo oficial?`)) {
      const res = activityService.deleteActivity(id);
      if (res.success) {
        showNotice(res.message);
        onRefreshData();
      }
    }
  };

  return (
    <div style={{ padding: '2.5rem 0', minHeight: '85vh' }}>
      <div className="container">
        {/* Banner Superior de Coordinación UDI */}
        <div className="card" style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ffffff', padding: '3px 7px', borderRadius: '8px' }}>
                <img src={logoIpn} alt="IPN" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
                <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0' }} />
                <img src={logoUpiicsa} alt="UPIICSA" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <ShieldCheck size={16} /> UNIDAD DE INFORMÁTICA (UDI) • UPIICSA IPN
              </div>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>
              Mesa de Control y Validación Escolar SISAE – CELEX
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '650px', marginTop: '0.25rem' }}>
              Bandeja centralizada de solicitudes de pre-registro, validación de comprobantes bancarios BBVA, control de cupos y emisión de constancias con firma digital.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onOpenLayerInspector}
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none' }}
            >
              <Layers size={16} />
              <span>Inspector de Arquitectura</span>
            </button>
          </div>
        </div>

        {/* Notificación Flotante */}
        {actionNotice && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="btn btn-sm btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>
              ✕
            </button>
          </div>
        )}

        {/* Grid de Métricas Clave */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>Total Solicitudes</span>
              <FileCheck2 size={18} color="var(--ipn-guinda)" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--ipn-guinda)' }}>
              {metrics.totalRequests}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Pre-registros en el ciclo actual
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>Pendientes de Revisión</span>
              <Clock size={18} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#0284c7' }}>
              {metrics.pendingRequests}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              En espera de validación bancaria
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-warning)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>Con Observaciones</span>
              <AlertTriangle size={18} color="var(--color-warning)" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: '#b45309' }}>
              {metrics.correctionRequests}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Aspirantes notificados para corrección
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>Aprobadas & Asignadas</span>
              <CheckCircle2 size={18} color="var(--color-success)" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--color-success)' }}>
              {metrics.approvedRequests}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Cédulas QR oficiales emitidas
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span>Ocupación de Cupo</span>
              <Users size={18} color="var(--ipn-oro-dark)" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--ipn-oro-dark)' }}>
              {metrics.porcentajeOcupacion}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {metrics.cupoOcupado} de {metrics.totalCupo} lugares ocupados
            </div>
          </div>
        </div>

        {/* Barra de Pestañas de la Mesa de Control */}
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
            <span>Bandeja de Validación ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CURSOS')}
            className={`btn btn-sm ${activeTab === 'CURSOS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Languages size={16} />
            <span>Cursos de Idiomas ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DOCENTES')}
            className={`btn btn-sm ${activeTab === 'DOCENTES' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <UserCheck size={16} />
            <span>Plantilla Docente ({teachers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ANUNCIOS')}
            className={`btn btn-sm ${activeTab === 'ANUNCIOS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Megaphone size={16} />
            <span>Convocatorias ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDITORIA')}
            className={`btn btn-sm ${activeTab === 'AUDITORIA' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Activity size={16} />
            <span>Auditoría de Seguridad UDI ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: BANDEJA CENTRALIZADA DE VALIDACIÓN DE SOLICITUDES */}
        {activeTab === 'SOLICITUDES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Filtros de la Bandeja */}
            <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setRequestFilter('TODAS')}
                  className={`btn btn-sm ${requestFilter === 'TODAS' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Todas ({requests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('EN_REVISION')}
                  className={`btn btn-sm ${requestFilter === 'EN_REVISION' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  ⏳ Pendientes ({requests.filter(r => r.estado === 'EN_REVISION' || r.estado === 'REGISTRADA').length})
                </button>
                <button
                  onClick={() => setRequestFilter('REQUIERE_CORRECCION')}
                  className={`btn btn-sm ${requestFilter === 'REQUIERE_CORRECCION' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  ⚠️ Con Observaciones ({requests.filter(r => r.estado === 'REQUIERE_CORRECCION').length})
                </button>
                <button
                  onClick={() => setRequestFilter('APROBADA')}
                  className={`btn btn-sm ${requestFilter === 'APROBADA' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  ✓ Aprobadas ({requests.filter(r => r.estado === 'APROBADA').length})
                </button>
              </div>

              <div style={{ minWidth: '260px' }}>
                <input
                  type="text"
                  placeholder="Buscar por folio, nombre, boleta, RFC o referencia..."
                  className="input-field"
                  value={searchRequest}
                  onChange={(e) => setSearchRequest(e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Tabla de Solicitudes */}
            <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem' }}>Folio SISAE</th>
                    <th style={{ padding: '0.75rem' }}>Aspirante</th>
                    <th style={{ padding: '0.75rem' }}>Tipo</th>
                    <th style={{ padding: '0.75rem' }}>Curso Solicitado</th>
                    <th style={{ padding: '0.75rem' }}>Comprobante BBVA</th>
                    <th style={{ padding: '0.75rem' }}>Estatus</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Acciones UDI</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => {
                    const isApproved = req.estado === 'APROBADA';
                    const needsCorrection = req.estado === 'REQUIERE_CORRECCION';
                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {/* Folio */}
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--ipn-guinda)' }}>{req.folio}</span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.fechaRegistro}</div>
                        </td>

                        {/* Aspirante */}
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{req.aspiranteNombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Id: <strong>{req.identificador}</strong>{req.rfc ? ` • RFC: ${req.rfc}` : ''} • {req.telefono}
                          </div>
                        </td>

                        {/* Tipo de Usuario */}
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${req.tipoAspirante === 'INTERNO_IPN' ? 'badge-guinda' : 'badge-gold'}`} style={{ fontSize: '0.7rem' }}>
                            {req.tipoAspirante === 'INTERNO_IPN' ? 'IPN' : 'Externo'}
                          </span>
                        </td>

                        {/* Curso Solicitado */}
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600 }}>{req.cursoNombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.horarioDeseado}</div>
                        </td>

                        {/* Comprobante Bancario */}
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: '#047857' }}>${req.montoPago}.00</span>
                            <button
                              onClick={() => setPreviewDocUrl(req.comprobantePagoUrl)}
                              className="btn btn-sm btn-secondary"
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                              title="Ver Comprobante de Pago Adjunto"
                            >
                              <Eye size={12} />
                              <span>Ver</span>
                            </button>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Ref: {req.numeroReferenciaPago}
                          </div>
                        </td>

                        {/* Estatus */}
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`badge ${
                            isApproved ? 'badge-success' :
                            needsCorrection ? 'badge-warning' : 'badge-info'
                          }`} style={{ fontSize: '0.72rem' }}>
                            {req.estado.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Acciones */}
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            {!isApproved && (
                              <button
                                onClick={() => handleOpenAssignModal(req)}
                                className="btn btn-sm btn-primary"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', fontWeight: 700 }}
                                title="Aprobar pago y asignar grupo/salón"
                              >
                                <CheckCircle2 size={13} />
                                <span>Aprobar</span>
                              </button>
                            )}

                            {!isApproved && !needsCorrection && (
                              <button
                                onClick={() => handleOpenCorrectionModal(req)}
                                className="btn btn-sm btn-gold"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                title="Solicitar corrección o emitir observaciones"
                              >
                                <AlertTriangle size={13} />
                                <span>Observar</span>
                              </button>
                            )}

                            {isApproved && (
                              <button
                                onClick={() => {
                                  const enr = enrollments.find(e => e.folio === req.folio);
                                  if (enr) {
                                    alert(`Solicitud asignada a Grupo: ${req.grupoAsignado}, Salón: ${req.salonAsignado}, Profesor: ${req.profesorAsignado}. Cédula QR disponible en el portal del alumno.`);
                                  }
                                }}
                                className="btn btn-sm btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                              >
                                <span>Detalles</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CATÁLOGO DE CURSOS DE IDIOMAS */}
        {activeTab === 'CURSOS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Oferta de Lenguas Extranjeras</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Configuración de grupos, cupos y salones del CELEX UPIICSA.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCourse({
                    nombre: '',
                    idioma: 'Inglés',
                    nivel: 'Básico',
                    subnivel: 'B1',
                    modalidad: 'Regular',
                    cupoMaximo: 25,
                    cupoOcupado: 0,
                    salonOEspacio: 'Edificio CELEX - Aula 101',
                    dias: ['Lunes', 'Miércoles'],
                    horaInicio: '07:00',
                    horaFin: '09:00',
                    turno: 'Matutino',
                    creditosElectiva: 3,
                    costoInterno: 850,
                    costoExterno: 1450,
                    descripcion: '',
                    requisitos: 'Comprobante de inscripción y pago bancario BBVA.'
                  });
                  setIsCourseModalOpen(true);
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Agregar Nuevo Curso</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {activities.map(course => (
                <div key={course.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="badge badge-guinda">{course.idioma}</span>
                    <span className="badge badge-gold">{course.modalidad}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>{course.nombre}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    <div>📍 {course.salonOEspacio}</div>
                    <div>⏰ {course.dias.join(', ')} • {course.horaInicio} - {course.horaFin}</div>
                    <div>👥 Cupo: <strong>{course.cupoOcupado} / {course.cupoMaximo}</strong></div>
                  </div>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setIsCourseModalOpen(true);
                      }}
                      className="btn btn-sm btn-secondary"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.nombre)}
                      className="btn btn-sm btn-secondary"
                    >
                      <Trash2 size={14} color="var(--color-danger)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PLANTILLA DOCENTE */}
        {activeTab === 'DOCENTES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Plantilla Docente de Lenguas Extranjeras</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Instructores certificados adscritos a CELEX UPIICSA.</p>
              </div>
              <button
                onClick={() => {
                  const nombre = prompt('Nombre completo del nuevo docente de idiomas:');
                  if (nombre && nombre.trim()) {
                    dbRepository.saveTeacher({
                      id: `prof-${Date.now()}`,
                      nombreCompleto: nombre.trim(),
                      especialidad: 'Lenguas Extranjeras & Certificaciones',
                      idiomas: ['Inglés'],
                      certificaciones: 'Docente Acreditado CELEX UPIICSA',
                      correo: `${nombre.toLowerCase().replace(/\s+/g, '')}@ipn.mx`,
                      telefono: '55 5624 2000',
                      semblanza: 'Docente titular adscrito a CELEX UPIICSA.',
                      activo: true
                    });
                    onRefreshData();
                    showNotice('Docente agregado exitosamente.');
                  }
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Registrar Docente</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {teachers.map(teacher => (
                <div key={teacher.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <img
                      src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={teacher.nombreCompleto}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{teacher.nombreCompleto}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ipn-guinda)', fontWeight: 600 }}>{teacher.especialidad}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                    <div><strong>Idiomas:</strong> {teacher.idiomas.join(', ')}</div>
                    <div><strong>Certificaciones:</strong> {teacher.certificaciones}</div>
                    <div><strong>Contacto:</strong> {teacher.correo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONVOCATORIAS */}
        {activeTab === 'ANUNCIOS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Convocatorias & Avisos Oficiales</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Publicaciones oficiales de fechas de examen diagnóstico y cuentas bancarias.</p>
              </div>
              <button
                onClick={() => {
                  const titulo = prompt('Título del nuevo comunicado oficial CELEX:');
                  if (titulo && titulo.trim()) {
                    announcementService.createOrUpdateAnnouncement({
                      titulo: titulo.trim(),
                      resumen: titulo.trim(),
                      contenido: `Comunicado oficial emitido por la Coordinación CELEX UPIICSA: ${titulo.trim()}`,
                      prioridad: 'GENERAL',
                      autor: 'Coordinación CELEX & Unidad de Informática UPIICSA'
                    });
                    onRefreshData();
                    showNotice('Comunicado publicado en el portal.');
                  }
                }}
                className="btn btn-primary"
              >
                <Plus size={16} />
                <span>Nuevo Comunicado</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map(ann => (
                <div key={ann.id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="badge badge-guinda" style={{ fontSize: '0.75rem', marginRight: '0.5rem' }}>{ann.prioridad}</span>
                    <strong style={{ fontSize: '1rem' }}>{ann.titulo}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{ann.resumen}</div>
                  </div>
                  <button
                    onClick={() => {
                      announcementService.deleteAnnouncement(ann.id);
                      onRefreshData();
                      showNotice('Aviso retirado de la cartelera.');
                    }}
                    className="btn btn-sm btn-secondary"
                  >
                    <Trash2 size={15} color="var(--color-danger)" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDITORÍA DE SEGURIDAD UDI */}
        {activeTab === 'AUDITORIA' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Bitácora de Auditoría UDI</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Registro inmutable de trazabilidad de accesos, validación de comprobantes y asignaciones de cupos.
              </p>
            </div>

            <div className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.6rem' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem' }}>Usuario / Actor</th>
                    <th style={{ padding: '0.6rem' }}>Acción</th>
                    <th style={{ padding: '0.6rem' }}>IP Origen</th>
                    <th style={{ padding: '0.6rem' }}>Detalles del Evento</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>{log.usuario}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span className={`badge ${
                          log.nivelSeguridad === 'SUCCESS' ? 'badge-success' :
                          log.nivelSeguridad === 'WARNING' ? 'badge-warning' : 'badge-info'
                        }`} style={{ fontSize: '0.7rem' }}>
                          {log.accion}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-muted)' }}>{log.ipOrigen}</td>
                      <td style={{ padding: '0.6rem', color: 'var(--text-secondary)' }}>{log.detalles}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: APROBAR Y ASIGNAR SOLICITUD */}
        {assigningRequest && (
          <div className="modal-overlay" onClick={() => setAssigningRequest(null)}>
            <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ backgroundColor: 'var(--ipn-guinda)', color: '#ffffff' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Validación y Asignación de Curso</h3>
                <button onClick={() => setAssigningRequest(null)} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '0.4rem', color: '#ffffff', background: 'transparent', border: 'none' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmAssignment} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: 'var(--bg-alt)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                  <div>Aspirante: <strong>{assigningRequest.aspiranteNombre}</strong> ({assigningRequest.identificador})</div>
                  <div>Curso Solicitado: <strong>{assigningRequest.cursoNombre}</strong></div>
                  <div>Referencia BBVA: <strong>{assigningRequest.numeroReferenciaPago}</strong> (${assigningRequest.montoPago}.00 MXN)</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Clave de Grupo Asignado:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={assignGroup}
                    onChange={(e) => setAssignGroup(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Salón o Laboratorio Multimedia:
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={assignSalon}
                    onChange={(e) => setAssignSalon(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Profesor / Docente Titular:
                  </label>
                  <select
                    className="input-field"
                    value={assignTeacher}
                    onChange={(e) => setAssignTeacher(e.target.value)}
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.nombreCompleto}>{t.nombreCompleto} ({t.especialidad})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setAssigningRequest(null)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontWeight: 700 }}>
                    <CheckCircle2 size={16} />
                    <span>Aprobar Pago y Emitir Cédula QR</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: SOLICITAR CORRECCIÓN / OBSERVAR EXPEDIENTE */}
        {correctingRequest && (
          <div className="modal-overlay" onClick={() => setCorrectingRequest(null)}>
            <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ backgroundColor: 'var(--ipn-oro-dark)', color: '#ffffff' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Emitir Observaciones para Corrección</h3>
                <button onClick={() => setCorrectingRequest(null)} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '0.4rem', color: '#ffffff', background: 'transparent', border: 'none' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmCorrection} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Detalla el motivo por el cual el comprobante o los datos del aspirante no pueden ser aprobados de inmediato (ej. voucher borroso, monto incorrecto, referencia inválida):
                </p>

                <textarea
                  className="input-field"
                  rows={4}
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setCorrectingRequest(null)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Send size={15} />
                    <span>Notificar al Aspirante</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: VISTA PREVIA DE VOUCHER */}
        {previewDocUrl && (
          <div className="modal-overlay" onClick={() => setPreviewDocUrl(null)}>
            <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Comprobante de Depósito Adjunto</h3>
                <button onClick={() => setPreviewDocUrl(null)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <img
                  src={previewDocUrl}
                  alt="Voucher Bancario"
                  style={{ maxWidth: '100%', maxHeight: '450px', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: AGREGAR / EDITAR CURSO */}
        {isCourseModalOpen && editingCourse && (
          <div className="modal-overlay" onClick={() => setIsCourseModalOpen(false)}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{editingCourse.id ? 'Editar Curso CELEX' : 'Nuevo Curso de Idioma'}</h3>
                <button onClick={() => setIsCourseModalOpen(false)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveCourse} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombre del Curso *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editingCourse.nombre || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, nombre: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Idioma *</label>
                    <select
                      className="input-field"
                      value={editingCourse.idioma || 'Inglés'}
                      onChange={(e) => setEditingCourse({ ...editingCourse, idioma: e.target.value as LanguageCategory, categoria: e.target.value as LanguageCategory })}
                    >
                      {LANGUAGES_LIST.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Modalidad *</label>
                    <select
                      className="input-field"
                      value={editingCourse.modalidad || 'Regular'}
                      onChange={(e) => setEditingCourse({ ...editingCourse, modalidad: e.target.value as any })}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Sabatino">Sabatino</option>
                      <option value="Intensivo">Intensivo</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Cupo Máximo *</label>
                    <input
                      type="number"
                      className="input-field"
                      value={editingCourse.cupoMaximo || 25}
                      onChange={(e) => setEditingCourse({ ...editingCourse, cupoMaximo: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Salón / Lab *</label>
                    <input
                      type="text"
                      className="input-field"
                      value={editingCourse.salonOEspacio || 'Aula CELEX 101'}
                      onChange={(e) => setEditingCourse({ ...editingCourse, salonOEspacio: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsCourseModalOpen(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar Curso
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
