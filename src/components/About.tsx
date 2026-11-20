import { Award, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <section 
      id="about" 
      style={{
        padding: '100px 0',
        position: 'relative',
        backgroundColor: 'var(--bg-secondary)',
        transition: 'background-color var(--transition-normal)',
      }}
    >
      <div className="container about-grid">
        {/* Left Side: Photo Frame & Highlights */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* Main Photo Frame */}
          <div 
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
              height: '460px',
              borderRadius: 'var(--border-radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '4px solid var(--bg-secondary)',
            }}
          >
            <img 
              src="/doctor_portrait.png" 
              alt="Dr. Alejandro Méndez" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {/* Gradient Overlay */}
            <div 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, rgba(11, 15, 25, 0.7) 0%, transparent 100%)',
              }}
            />
          </div>

          {/* Experience Badge */}
          <div 
            className="glass animate-float"
            style={{
              position: 'absolute',
              top: '30px',
              left: '-20px',
              padding: '16px 20px',
              borderRadius: 'var(--border-radius-md)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 3,
            }}
          >
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)', display: 'block', lineHeight: 1 }}>12+</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Años de Experiencia</span>
          </div>

          {/* Certificate Badge */}
          <div 
            className="glass"
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '-10px',
              padding: '12px 18px',
              borderRadius: 'var(--border-radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 3,
            }}
          >
            <Award size={20} style={{ color: 'var(--color-secondary)' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Médico Certificado</span>
          </div>
        </div>

        {/* Right Side: Description */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div 
            style={{
              display: 'inline-flex',
              padding: '6px 16px',
              backgroundColor: 'var(--color-secondary-light)',
              color: 'var(--color-secondary)',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              width: 'fit-content',
            }}
          >
            Sobre Nosotros
          </div>

          <h2 style={{ fontSize: '38px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Liderando el camino en <span className="text-gradient">excelencia médica</span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.7 }}>
            El **Dr. Alejandro Méndez**, Director Médico de MediCare, cuenta con una trayectoria de más de una década dedicada al cuidado integral de la salud. Su filosofía se basa en combinar la precisión científica con la calidez humana, asegurando que cada paciente reciba un trato personalizado y libre de estrés.
          </p>

          {/* Bullet features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Tratamientos Personalizados:</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'block' }}>
                  Diseñamos planes clínicos específicos adaptados al estilo de vida y necesidades de cada paciente.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Tecnología de Punta:</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'block' }}>
                  Equipos de diagnóstico y tratamiento de última generación para procedimientos mínimamente invasivos.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Seguimiento Continuo:</strong>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'block' }}>
                  Acompañamiento post-consulta para garantizar una recuperación y bienestar a largo plazo.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 48px;
            text-align: center;
          }
          .about-grid > div {
            text-align: center !important;
          }
          .about-grid > div:first-child {
            order: 2;
          }
        }
      `}</style>
    </section>
  );
}
