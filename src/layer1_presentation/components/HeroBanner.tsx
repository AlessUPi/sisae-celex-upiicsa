import React from 'react';
import { 
  Compass, 
  Award, 
  CheckCircle2, 
  Zap,
  FileCheck2,
  ShieldCheck,
  Languages,
  CreditCard
} from 'lucide-react';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';

interface HeroBannerProps {
  totalActivities: number;
  totalStudents: number;
  totalRequests: number;
  onExploreClick: () => void;
  onOpenPreRegister: () => void;
  onQuickDemoStudent: () => void;
  onQuickDemoExterno: () => void;
  onQuickDemoAdmin: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalActivities,
  totalStudents,
  totalRequests,
  onExploreClick,
  onOpenPreRegister,
  onQuickDemoStudent,
  onQuickDemoExterno,
  onQuickDemoAdmin
}) => {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 80% 20%, rgba(197, 155, 39, 0.16) 0%, rgba(108, 29, 69, 0.25) 45%, var(--bg-card) 100%)',
      borderBottom: '1px solid var(--border-color)',
      paddingTop: '3.5rem',
      paddingBottom: '3.5rem'
    }}>
      {/* Elementos decorativos de fondo */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,29,69,0.18) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          {/* Columna Izquierda: Mensaje y Objetivos SISAE */}
          <div>
            <div style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
              <span className="badge badge-guinda" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
                <Languages size={14} /> Módulo CELEX • Semestre 2026-2
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
                <Award size={14} /> Requisito de Titulación IPN
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
                <ShieldCheck size={14} /> Unidad de Informática (UDI)
              </span>
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em'
            }}>
              Sistema de Administración Escolar{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--ipn-guinda) 0%, var(--ipn-oro) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                (SISAE) – Módulo CELEX
              </span>
            </h1>

            <p style={{
              fontSize: '1.08rem',
              color: 'var(--text-secondary)',
              marginBottom: '1.75rem',
              lineHeight: 1.6
            }}>
              Centralización digital para la gestión de los Cursos Extracurriculares de Lenguas Extranjeras en la UPIICSA. 
              Consulta la oferta de <strong>Inglés, Francés, Alemán e Italiano</strong>, realiza tu pre-registro en línea, carga tu comprobante bancario BBVA y obtén tu asignación oficial con código QR verificable.
            </p>

            {/* CTAs de acción */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '2rem' }}>
              <button onClick={onOpenPreRegister} className="btn btn-primary btn-lg" style={{ fontWeight: 700 }}>
                <FileCheck2 size={20} />
                <span>Iniciar Pre-Registro en Línea</span>
              </button>

              <button onClick={onExploreClick} className="btn btn-secondary btn-lg">
                <Compass size={20} />
                <span>Consultar Catálogo de Idiomas</span>
              </button>
            </div>

            {/* Accesos rápidos de prueba (Demo Rápido) */}
            <div style={{
              backgroundColor: 'var(--bg-card-glass)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ipn-guinda)' }}>
                <Zap size={15} color="var(--ipn-oro)" />
                <span>Accesos de Prueba Rápida (Evaluación de Roles Institucionales):</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  onClick={onQuickDemoStudent}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                  title="Acceder como Alumno Interno IPN con boleta"
                >
                  👤 Alumno Interno IPN (Boleta)
                </button>
                <button
                  onClick={onQuickDemoExterno}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                  title="Acceder como Usuario Externo con RFC"
                >
                  🌐 Usuario Externo (RFC)
                </button>
                <button
                  onClick={onQuickDemoAdmin}
                  className="btn btn-sm btn-gold"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                  title="Acceder a la Bandeja Centralizada de Validación Administrativa UDI"
                >
                  🛡️ Coordinador UDI / CELEX
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Institucional de Beneficios y Cuentas Oficiales */}
          <div>
            <div className="card" style={{
              padding: '1.75rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: 'linear-gradient(135deg, var(--ipn-guinda) 0%, var(--ipn-oro) 100%)',
                color: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Plataforma Oficial UPIICSA
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '3px 6px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                  <img src={logoUpiicsa} alt="UPIICSA" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Módulo CELEX UPIICSA</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cursos Extracurriculares de Lenguas Extranjeras</p>
                </div>
              </div>

              {/* Indicadores clave */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ipn-guinda)' }}>
                    {totalActivities}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cursos de Idiomas</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ipn-oro-dark)' }}>
                    {totalRequests}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Solicitudes SISAE</div>
                </div>

                <div style={{ padding: '0.75rem', background: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>
                    {totalStudents}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Alumnos Inscritos</div>
                </div>
              </div>

              {/* Cuotas oficiales de recuperación */}
              <div style={{
                border: '1px dashed var(--border-color)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-alt)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                  <CreditCard size={16} color="var(--ipn-guinda)" />
                  <span>Cuotas Institucionales de Recuperación:</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Comunidad IPN (Alumnos / Egresados):</span>
                  <strong style={{ color: 'var(--ipn-guinda)' }}>$850.00 MXN</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Público General / Externos:</span>
                  <strong style={{ color: 'var(--text-main)' }}>$1,450.00 MXN</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Convenio BBVA CIE IPN: <strong>1849201</strong> • Concepto: CELEX UPIICSA
                </div>
              </div>

              {/* Checklist de beneficios del SISAE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <span>Bandeja centralizada de revisión y control de cupos</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <span>Emisión de constancia con código QR y validación oficial</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                  <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <span>Arquitectura escalable a Seminarios de Titulación y Cursos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
