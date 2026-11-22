import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Zap, 
  AlertCircle
} from 'lucide-react';
import { authService } from '../../layer2_business/authService';
import type { CareerUPIICSA, TurnoType, TipoAspirante } from '../../types';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State Login
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form State Register
  const [regTipo, setRegTipo] = useState<TipoAspirante>('INTERNO_IPN');
  const [regBoleta, setRegBoleta] = useState('');
  const [regRfc, setRegRfc] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCarrera, setRegCarrera] = useState<CareerUPIICSA>('Licenciatura en Ciencias de la Informática');
  const [regSemestre] = useState(1);
  const [regTurno] = useState<TurnoType>('Matutino');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = authService.login(loginId, loginPassword);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = authService.registerStudent({
      tipoAspirante: regTipo,
      boleta: regBoleta,
      rfc: regRfc.trim().toUpperCase(),
      nombreCompleto: regNombre,
      correo: regCorreo,
      telefono: regTelefono,
      carrera: regCarrera,
      semestre: regSemestre,
      turno: regTurno,
      password: regPassword
    });

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleDemoLogin = (role: 'ALUMNO_INTERNO' | 'ALUMNO_EXTERNO' | 'ADMIN' | 'DOCENTE' | 'DOCENTE_VANCE' | 'DOCENTE_WEBER') => {
    authService.quickDemoLogin(role);
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '540px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con Logos Institucionales */}
        <div className="modal-header" style={{
          background: 'linear-gradient(90deg, var(--ipn-guinda) 0%, #892658 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
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
              <img src={logoIpn} alt="IPN" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0' }} />
              <img src={logoUpiicsa} alt="UPIICSA" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#fed7aa', fontWeight: 700 }}>
                SISAE • MÓDULO CELEX UPIICSA
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '2px' }}>
                Autenticación Institucional
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-secondary btn-sm" 
            style={{ borderRadius: '50%', padding: '0.4rem', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs de Login vs Registro */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-alt)'
        }}>
          <button
            onClick={() => { setTab('LOGIN'); setErrorMessage(null); }}
            style={{
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: tab === 'LOGIN' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'LOGIN' ? 'var(--ipn-guinda)' : 'var(--text-secondary)',
              borderBottom: tab === 'LOGIN' ? '3px solid var(--ipn-guinda)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <LogIn size={16} />
            <span>Iniciar Sesión</span>
          </button>

          <button
            onClick={() => { setTab('REGISTER'); setErrorMessage(null); }}
            style={{
              padding: '0.85rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: tab === 'REGISTER' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'REGISTER' ? 'var(--ipn-guinda)' : 'var(--text-secondary)',
              borderBottom: tab === 'REGISTER' ? '3px solid var(--ipn-guinda)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <UserPlus size={16} />
            <span>Registro Nuevo</span>
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMessage && (
          <div style={{
            margin: '1rem 1.5rem 0',
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

        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* TAB 1: LOGIN */}
          {tab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Boleta IPN (10 dígitos), RFC, Correo institucional o ID Docente *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. 2023600123, rvanceg@ipn.mx, prof-01 o admin"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Contraseña Institucional *
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Ingresa tu contraseña"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  (Admin: admin123 | Docentes: docente123)
                </span>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '0.5rem' }}>
                <LogIn size={18} />
                <span>Ingresar al Sistema SISAE</span>
              </button>

              {/* Botones de Demo Rápido */}
              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px dashed var(--border-color)',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ipn-guinda)', marginBottom: '0.5rem' }}>
                  <Zap size={14} color="var(--ipn-oro)" />
                  <span>Accesos Rápidos de Prueba (Sin Contraseña):</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('ALUMNO_INTERNO')}
                    className="btn btn-sm btn-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    👤 Demo Alumno Interno IPN (Daniel Hernández)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('ALUMNO_EXTERNO')}
                    className="btn btn-sm btn-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    🌐 Demo Usuario Externo RFC (Fernanda Hernández)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('DOCENTE_VANCE')}
                    className="btn btn-sm btn-secondary"
                    style={{ justifyContent: 'center', borderColor: 'var(--ipn-guinda)' }}
                  >
                    👨‍🏫 Demo Docente CELEX (Mtro. Robert Vance - Inglés)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('DOCENTE_WEBER')}
                    className="btn btn-sm btn-secondary"
                    style={{ justifyContent: 'center', borderColor: 'var(--ipn-guinda)' }}
                  >
                    👨‍🏫 Demo Docente CELEX (Dr. Hans Weber - Alemán)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('ADMIN')}
                    className="btn btn-sm btn-gold"
                    style={{ justifyContent: 'center' }}
                  >
                    🛡️ Demo Coordinador UDI / CELEX (Mtro. Mario Bizarro)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTRO */}
          {tab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setRegTipo('INTERNO_IPN');
                    setRegCarrera('Licenciatura en Ciencias de la Informática');
                  }}
                  className={`btn btn-sm ${regTipo === 'INTERNO_IPN' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Alumno IPN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegTipo('EXTERNO');
                    setRegCarrera('Público Externo / Otra Institución');
                  }}
                  className={`btn btn-sm ${regTipo === 'EXTERNO' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Público Externo
                </button>
              </div>

              {regTipo === 'INTERNO_IPN' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Boleta IPN (10 dígitos numéricos) *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="2023600123"
                    maxLength={10}
                    value={regBoleta}
                    onChange={(e) => setRegBoleta(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Registro Federal de Contribuyentes (RFC) *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej. HERA030415XX8"
                  maxLength={13}
                  value={regRfc}
                  onChange={(e) => setRegRfc(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nombre y Apellidos"
                  value={regNombre}
                  onChange={(e) => setRegNombre(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="correo@ipn.mx"
                    value={regCorreo}
                    onChange={(e) => setRegCorreo(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Teléfono Móvil *
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="55 1234 5678"
                    value={regTelefono}
                    onChange={(e) => setRegTelefono(e.target.value)}
                    required
                  />
                </div>
              </div>

              {regTipo === 'INTERNO_IPN' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Carrera en UPIICSA *
                  </label>
                  <select
                    className="input-field"
                    value={regCarrera}
                    onChange={(e) => setRegCarrera(e.target.value as CareerUPIICSA)}
                  >
                    {CAREERS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Crear Contraseña *
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Mínimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '0.5rem' }}>
                <UserPlus size={18} />
                <span>Registrarme en SISAE CELEX</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
