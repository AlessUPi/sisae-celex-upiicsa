import { Calendar, Shield, Users, Star, ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
}

export default function Hero({ onOpenBooking }: HeroProps) {
  return (
    <section 
      id="home" 
      style={{
        paddingTop: '160px',
        paddingBottom: '80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Blobs */}
      <div 
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: -1,
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--color-secondary-light) 0%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: -1,
        }}
      />

      <div className="container hero-grid">
        {/* Hero Left Content */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Trust Badge */}
          <div 
            className="glass" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '100px',
              width: 'fit-content',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
              <Star size={14} fill="#f59e0b" />
              <Star size={14} fill="#f59e0b" />
              <Star size={14} fill="#f59e0b" />
              <Star size={14} fill="#f59e0b" />
              <Star size={14} fill="#f59e0b" />
            </div>
            <span>Valoración 4.9/5 de más de 1,200 pacientes</span>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: '52px', fontWeight: 800, lineHeight: 1.15, margin: 0, color: 'var(--text-primary)' }}>
            Tu salud en las manos de <span className="text-gradient">profesionales de confianza</span>
          </h1>

          {/* Subheading */}
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '540px' }}>
            Brindamos atención médica de primer nivel y tratamientos odontológicos avanzados con tecnología de vanguardia en un ambiente cálido y seguro.
          </p>

          {/* Call to Actions */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onOpenBooking}>
              <Calendar size={18} />
              Agendar Cita en Línea
            </button>
            <a href="#services" className="btn btn-secondary">
              Ver Especialidades
              <ArrowRight size={18} />
            </a>
          </div>

          {/* Fast Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary)' }}>15+</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Especialistas Médicos</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-secondary)' }}>99%</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Pacientes Satisfechos</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-accent)' }}>10k+</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Consultas Realizadas</span>
            </div>
          </div>
        </div>

        {/* Hero Right Visuals */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Main Visual SVG representing dynamic medical tech */}
          <div className="animate-float" style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 2 }}>
            <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
              {/* Outer decorative glowing ring */}
              <circle cx="250" cy="250" r="210" stroke="url(#paint0_linear)" strokeWidth="2" strokeDasharray="8 8" opacity="0.3" />
              {/* Inner glowing circle */}
              <circle cx="250" cy="250" r="170" fill="url(#paint1_radial)" opacity="0.15" />
              {/* Medical Shield Icon */}
              <path d="M250 80L370 130V270C370 345 320 405 250 430C180 405 130 345 130 270V130L250 80Z" fill="url(#paint2_linear)" stroke="var(--color-primary)" strokeWidth="4" />
              {/* Inner details of Shield */}
              <path d="M250 140V370" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
              <path d="M190 230H310" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
              <circle cx="250" cy="230" r="40" stroke="#ffffff" strokeWidth="4" opacity="0.5" />
              
              {/* Floating elements */}
              <circle cx="100" cy="150" r="15" fill="var(--color-primary)" opacity="0.6" />
              <circle cx="410" cy="300" r="22" fill="var(--color-secondary)" opacity="0.4" />
              <circle cx="390" cy="120" r="8" fill="var(--color-accent)" opacity="0.5" />
              
              <defs>
                <linearGradient id="paint0_linear" x1="40" y1="40" x2="460" y2="460" gradientUnits="userSpaceOnUse">
                  <stop stopColor="var(--color-primary)" />
                  <stop offset="1" stopColor="var(--color-secondary)" />
                </linearGradient>
                <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(250 250) rotate(90) scale(170)">
                  <stop stopColor="var(--color-primary)" />
                  <stop offset="1" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="paint2_linear" x1="130" y1="80" x2="370" y2="430" gradientUnits="userSpaceOnUse">
                  <stop stopColor="var(--color-primary)" />
                  <stop offset="1" stopColor="var(--color-secondary)" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Floating Glassmorphism Cards */}
          <div 
            className="glass animate-slide-up"
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '10px',
              padding: '16px',
              borderRadius: 'var(--border-radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 3,
            }}
          >
            <div style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Shield size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>100% Seguro</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Instalaciones sanitizadas</div>
            </div>
          </div>

          <div 
            className="glass animate-slide-up"
            style={{
              position: 'absolute',
              top: '40px',
              right: '10px',
              padding: '16px',
              borderRadius: 'var(--border-radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 3,
            }}
          >
            <div style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '8px', borderRadius: '50%', display: 'flex' }}>
              <Users size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Atención Médica</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>15+ médicos certificados</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .hero-grid > div {
            align-items: center;
            text-align: center !important;
          }
          .hero-grid > div:first-child {
            align-items: center !important;
          }
        }
      `}</style>
    </section>
  );
}
