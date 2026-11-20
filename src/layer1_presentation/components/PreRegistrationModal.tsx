import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCheck2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Languages, 
  User, 
  ShieldCheck,
  Landmark,
  ArrowRight,
  ArrowLeft,
  Camera,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { enrollmentService } from '../../layer2_business/enrollmentService';
import { authService } from '../../layer2_business/authService';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';
import type { 
  CelexCourse, 
  AuthSession, 
  TipoAspirante, 
  CareerUPIICSA, 
  PreRegistrationRequest 
} from '../../types';

interface PreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCourse?: CelexCourse | null;
  courses: CelexCourse[];
  session: AuthSession;
  onSuccess: (request: PreRegistrationRequest) => void;
}

const CAREERS: CareerUPIICSA[] = [
  'Licenciatura en Ciencias de la Informática',
  'Ingeniería en Informática',
  'Ingeniería en Inteligencia Artificial',
  'Ingeniería en Transporte',
  'Ingeniería Industrial',
  'Licenciatura en Administración Industrial',
  'Público Externo / Otra Institución'
];

export const PreRegistrationModal: React.FC<PreRegistrationModalProps> = ({
  isOpen,
  onClose,
  preSelectedCourse,
  courses,
  session,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Paso 1: Tipo & Datos Personales
  const [tipoAspirante, setTipoAspirante] = useState<TipoAspirante>(
    session.user?.tipoAspirante || 'INTERNO_IPN'
  );
  const [boleta, setBoleta] = useState(
    session.user?.identificador && /^\d{10}$/.test(session.user.identificador) ? session.user.identificador : ''
  );
  const [rfc, setRfc] = useState(session.user?.rfc || session.user?.curp || '');
  const [nombreCompleto, setNombreCompleto] = useState(session.user?.nombre || '');
  const [correo, setCorreo] = useState(session.user?.correo || '');
  const [telefono, setTelefono] = useState('55 1234 5678');
  const [carrera, setCarrera] = useState<CareerUPIICSA>(
    session.user?.carrera || 'Licenciatura en Ciencias de la Informática'
  );

  // Paso 2: Curso seleccionado
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    preSelectedCourse?.id || (courses.length > 0 ? courses[0].id : '')
  );

  // Paso 3: Pago y Documentos
  const [referenciaPago, setReferenciaPago] = useState(`BBVA-DEP-${Math.floor(100000 + Math.random() * 900000)}`);
  const [voucherUrl, setVoucherUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80');
  const [identificacionUrl, setIdentificacionUrl] = useState('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&auto=format&fit=crop&q=80');
  const [voucherFileName, setVoucherFileName] = useState('voucher_deposito_bbva_celex.jpg');
  const [idFileName, setIdFileName] = useState('credencial_ipn_o_ine.jpg');

  // Paso 4: Resultado
  const [createdRequest, setCreatedRequest] = useState<PreRegistrationRequest | null>(null);

  useEffect(() => {
    if (preSelectedCourse) {
      setSelectedCourseId(preSelectedCourse.id);
    }
  }, [preSelectedCourse]);

  if (!isOpen) return null;

  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const costoFinal = tipoAspirante === 'INTERNO_IPN' ? (currentCourse?.costoInterno || 850) : (currentCourse?.costoExterno || 1450);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (tipoAspirante === 'INTERNO_IPN') {
      const v = authService.validateBoleta(boleta);
      if (!v.valid) {
        setErrorMessage(v.error!);
        return;
      }
    }

    if (rfc.trim().length > 0) {
      const vr = authService.validateRfc(rfc);
      if (!vr.valid) {
        setErrorMessage(vr.error!);
        return;
      }
    } else {
      setErrorMessage('El RFC es obligatorio para el registro en CELEX.');
      return;
    }

    if (!nombreCompleto.trim()) {
      setErrorMessage('Ingresa tu nombre completo.');
      return;
    }
    if (!correo.trim() || !correo.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }

    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!currentCourse) {
      setErrorMessage('Selecciona un curso válido.');
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handleSimulatedFileUpload = (type: 'voucher' | 'id') => {
    if (type === 'voucher') {
      setVoucherUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
      setVoucherFileName(`comprobante_banco_${Date.now().toString().slice(-4)}.pdf`);
    } else {
      setIdentificacionUrl('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
      setIdFileName(`identificacion_oficial_${Date.now().toString().slice(-4)}.pdf`);
    }
  };

  const handleSubmitPreRegistration = () => {
    setErrorMessage(null);

    if (!referenciaPago.trim() || referenciaPago.trim().length < 4) {
      setErrorMessage('Captura el número de autorización o referencia impreso en tu ticket de pago.');
      return;
    }

    const identificador = tipoAspirante === 'INTERNO_IPN' ? boleta.trim() : rfc.trim().toUpperCase();

    const result = enrollmentService.submitPreRegistration({
      aspiranteNombre: nombreCompleto.trim(),
      tipoAspirante,
      identificador,
      rfc: rfc.trim().toUpperCase(),
      correo: correo.trim().toLowerCase(),
      telefono: telefono.trim(),
      carrera,
      cursoId: currentCourse.id,
      numeroReferenciaPago: referenciaPago.trim(),
      comprobantePagoUrl: voucherUrl,
      identificacionUrl
    });

    if (result.success && result.request) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setCreatedRequest(result.request);
      setStep(4);
      onSuccess(result.request);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '720px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con Logos Oficiales */}
        <div className="modal-header" style={{
          background: 'linear-gradient(90deg, var(--ipn-guinda) 0%, #892658 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              padding: '3px 6px',
              borderRadius: '8px',
              flexShrink: 0
            }}>
              <img src={logoIpn} alt="IPN" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
              <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
              <img src={logoUpiicsa} alt="UPIICSA" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#fed7aa', fontWeight: 700, letterSpacing: '0.05em' }}>
                MÓDULO CELEX UPIICSA • TRÁMITE DIGITAL
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>
                Pre-Registro de Aspirantes a Lenguas Extranjeras
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '0.4rem', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Stepper Visual de 4 Pasos */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '1rem 1.75rem',
          backgroundColor: 'var(--bg-alt)',
          borderBottom: '1px solid var(--border-color)',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          <div style={{ color: step >= 1 ? 'var(--ipn-guinda)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step >= 1 ? 'var(--ipn-guinda)' : 'var(--border-color)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
            <span>Aspirante</span>
          </div>

          <div style={{ color: step >= 2 ? 'var(--ipn-guinda)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step >= 2 ? 'var(--ipn-guinda)' : 'var(--border-color)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
            <span>Curso & Idioma</span>
          </div>

          <div style={{ color: step >= 3 ? 'var(--ipn-guinda)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step >= 3 ? 'var(--ipn-guinda)' : 'var(--border-color)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
            <span>Pago & Voucher</span>
          </div>

          <div style={{ color: step === 4 ? 'var(--color-success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: step === 4 ? 'var(--color-success)' : 'var(--border-color)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>4</span>
            <span>Folio Oficial</span>
          </div>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div style={{
            margin: '1rem 1.75rem 0',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* CUERPO DEL FORMULARIO SEGÚN PASO */}
        <div className="modal-body" style={{ padding: '1.75rem' }}>
          {/* PASO 1: DATOS PERSONALES */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Selecciona tu tipo de aspirante:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoAspirante('INTERNO_IPN');
                      setCarrera('Licenciatura en Ciencias de la Informática');
                    }}
                    className={`btn ${tipoAspirante === 'INTERNO_IPN' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.75rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <User size={18} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Comunidad IPN</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Alumnos / Egresados ($850)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTipoAspirante('EXTERNO');
                      setCarrera('Público Externo / Otra Institución');
                    }}
                    className={`btn ${tipoAspirante === 'EXTERNO' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.75rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <ShieldCheck size={18} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Público Externo</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Comunidad general ($1,450)</div>
                    </div>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {tipoAspirante === 'INTERNO_IPN' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Número de Boleta IPN (10 dígitos) *
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ej. 2023600123"
                      maxLength={10}
                      value={boleta}
                      onChange={(e) => setBoleta(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                )}

                <div style={{ gridColumn: tipoAspirante === 'INTERNO_IPN' ? 'auto' : 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Registro Federal de Contribuyentes (RFC) *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ej. HERA030415XX8"
                    maxLength={13}
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Nombre Completo del Aspirante *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nombre(s) y Apellidos"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Correo Electrónico de Contacto *
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="correo@alumno.ipn.mx"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Teléfono Móvil (WhatsApp para avisos) *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="55 1234 5678"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>
              </div>

              {tipoAspirante === 'INTERNO_IPN' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Carrera o Programa de la UPIICSA *
                  </label>
                  <select
                    className="input-field"
                    value={carrera}
                    onChange={(e) => setCarrera(e.target.value as CareerUPIICSA)}
                  >
                    {CAREERS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary btn-lg">
                  <span>Continuar a Selección de Curso</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: SELECCIÓN DE CURSO */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Selecciona el curso de lengua extranjera a pre-registrarte:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {courses.map(course => {
                    const isSelected = course.id === selectedCourseId;
                    const isFull = course.cupoOcupado >= course.cupoMaximo;
                    return (
                      <div
                        key={course.id}
                        onClick={() => !isFull && setSelectedCourseId(course.id)}
                        style={{
                          padding: '1rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--ipn-guinda)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--ipn-guinda-glow)' : 'var(--bg-card)',
                          cursor: isFull ? 'not-allowed' : 'pointer',
                          opacity: isFull ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '8px',
                            background: isSelected ? 'var(--ipn-guinda)' : 'var(--bg-alt)',
                            color: isSelected ? '#ffffff' : 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Languages size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              {course.nombre}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {course.dias.join(', ')} • {course.horaInicio} - {course.horaFin} • {course.salonOEspacio}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                            {course.modalidad}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: isFull ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '0.25rem', fontWeight: 600 }}>
                            {isFull ? 'Agotado' : `${course.cupoMaximo - course.cupoOcupado} lugares`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resumen del curso elegido */}
              {currentCourse && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--bg-alt)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cuota a depositar ({tipoAspirante === 'INTERNO_IPN' ? 'Alumno IPN' : 'Público Externo'}):</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ipn-guinda)' }}>
                      ${costoFinal}.00 MXN
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>Convenio BBVA CIE IPN: <strong>1849201</strong></div>
                    <div>Concepto: <strong>CELEX UPIICSA</strong></div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                  <ArrowLeft size={18} />
                  <span>Regresar</span>
                </button>
                <button type="button" onClick={handleNextStep2} className="btn btn-primary btn-lg">
                  <span>Continuar a Validación de Pago</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: PAGO Y SUBIDA DE DOCUMENTOS */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Información bancaria oficial */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(197, 155, 39, 0.1)',
                border: '1px solid var(--ipn-oro)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--ipn-oro-dark)', marginBottom: '0.4rem' }}>
                  <Landmark size={18} />
                  <span>Depósito Bancario Obligatorio (BBVA México)</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Realiza tu depósito en practicaja o sucursal por la cantidad exacta de <strong>${costoFinal}.00 MXN</strong> a nombre del Instituto Politécnico Nacional (Convenio CIE <strong>1849201</strong>). Ingresa a continuación los datos de tu comprobante físico:
                </p>
              </div>

              {/* Captura de número de autorización / referencia */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Número de Autorización / Referencia de Pago (Impreso en el voucher) *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. BBVA-AUT-904128"
                  value={referenciaPago}
                  onChange={(e) => setReferenciaPago(e.target.value.toUpperCase())}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Este número será verificado de manera manual y automatizada por la Unidad de Informática de UPIICSA.
                </span>
              </div>

              {/* Subida digital del Voucher */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Copia Digital / Fotografía del Voucher de Pago *
                </label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-alt)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Upload size={22} color="var(--ipn-guinda)" />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{voucherFileName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSimulatedFileUpload('voucher')}
                      className="btn btn-sm btn-secondary"
                    >
                      <Camera size={14} />
                      <span>Reemplazar Archivo</span>
                    </button>
                    <a
                      href={voucherUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-secondary"
                    >
                      <Eye size={14} />
                      <span>Ver Vista Previa</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Subida de Identificación */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Identificación Oficial (INE o Credencial IPN) *
                </label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-alt)'
                }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{idFileName}</span>
                  <button
                    type="button"
                    onClick={() => handleSimulatedFileUpload('id')}
                    className="btn btn-sm btn-secondary"
                  >
                    <span>Cargar Documento</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
                  <ArrowLeft size={18} />
                  <span>Regresar</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPreRegistration}
                  className="btn btn-primary btn-lg"
                  style={{ fontWeight: 700 }}
                >
                  <FileCheck2 size={18} />
                  <span>Confirmar y Enviar Pre-Registro</span>
                </button>
              </div>
            </div>
          )}

          {/* PASO 4: RESULTADO EXITOSO Y FOLIO */}
          {step === 4 && createdRequest && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                ¡Pre-Registro Recibido Exitosamente!
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                Tu solicitud ha sido ingresada en la bandeja centralizada de validación del CELEX UPIICSA. Conserva tu folio de trámite oficial:
              </p>

              <div style={{
                backgroundColor: 'var(--bg-alt)',
                border: '2px solid var(--ipn-guinda)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'inline-block',
                marginBottom: '1.5rem',
                minWidth: '280px'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>FOLIO OFICIAL SISAE</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--ipn-guinda)', letterSpacing: '0.05em' }}>
                  {createdRequest.folio}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  Curso: <strong>{createdRequest.cursoNombre}</strong>
                </div>
              </div>

              {/* Notificaciones simuladas */}
              <div style={{
                backgroundColor: 'var(--color-success-bg)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'left',
                fontSize: '0.85rem',
                color: 'var(--color-success)',
                marginBottom: '1.75rem'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>✓ Canales de Notificación Automatizados Activados:</div>
                <div>• Correo electrónico de acuse enviado a: <strong>{createdRequest.correo}</strong></div>
                <div>• Alerta por WhatsApp vinculada al teléfono: <strong>{createdRequest.telefono}</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  onClick={onClose}
                  className="btn btn-primary btn-lg"
                >
                  Entendido y Finalizar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
