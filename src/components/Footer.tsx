import { Phone, Mail, MapPin, Clock, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer 
      id="contact"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '80px',
        paddingBottom: '32px',
        color: 'var(--text-primary)',
        transition: 'background-color var(--transition-normal), color var(--transition-normal)',
      }}
    >
      <div className="container footer-grid">
        {/* Info Column */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '22px' }}>
            <Activity size={28} style={{ color: 'var(--color-primary)' }} />
            <span>Medi<span className="text-gradient">Care</span></span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            Comprometidos con ofrecer servicios de salud integrales y accesibles con la mayor calidad y profesionalismo.
          </p>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              {
                name: 'Facebook',
                svg: (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                  </svg>
                )
              },
              {
                name: 'Instagram',
                svg: (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                )
              },
              {
                name: 'Twitter',
                svg: (
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                )
              }
            ].map((social, i) => (
              <a 
                key={i} 
                href="#" 
                aria-label={social.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
                className="social-icon"
              >
                {social.svg}
              </a>
            ))}
          </div>
        </div>

        {/* Contact Links */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Contacto</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Phone size={18} style={{ color: 'var(--color-primary)' }} />
              <span>+52 (55) 1234 5678</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)' }}>
              <Mail size={18} style={{ color: 'var(--color-primary)' }} />
              <span>contacto@medicare.com</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
              <MapPin size={18} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
              <span>Av. de la Salud 456, Consultorio 201, Ciudad de México, CP 04510</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--text-secondary)' }}>
              <Clock size={18} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
              <div>
                <div>Lunes - Viernes: 9:00 AM - 7:00 PM</div>
                <div>Sábado: 9:00 AM - 2:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Visualization */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Ubicación</h4>
          {/* Simulated Premium SVG Map */}
          <div 
            className="glass"
            style={{
              position: 'relative',
              width: '100%',
              height: '180px',
              borderRadius: 'var(--border-radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
            }}
          >
            <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-tertiary)' }}>
              {/* Map grid lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="0" y1="140" x2="400" y2="140" stroke="var(--border-color)" strokeWidth="1" />
              
              <line x1="60" y1="0" x2="60" y2="180" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="180" y1="0" x2="180" y2="180" stroke="var(--border-color)" strokeWidth="1" />
              <line x1="300" y1="0" x2="300" y2="180" stroke="var(--border-color)" strokeWidth="1" />
              
              {/* Major streets */}
              <path d="M 0,90 Q 200,80 400,90" fill="none" stroke="var(--color-primary-light)" strokeWidth="8" opacity="0.5" />
              <path d="M 180,0 Q 190,90 180,180" fill="none" stroke="var(--color-primary-light)" strokeWidth="8" opacity="0.5" />
              
              {/* Other streets */}
              <line x1="0" y1="45" x2="400" y2="60" stroke="var(--border-color)" strokeWidth="3" opacity="0.4" />
              <line x1="260" y1="0" x2="280" y2="180" stroke="var(--border-color)" strokeWidth="3" opacity="0.4" />

              {/* Pulsing indicator at target pin */}
              <circle cx="185" cy="85" r="16" fill="var(--color-primary)" opacity="0.2">
                <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="185" cy="85" r="6" fill="var(--color-primary)" />
              
              {/* Marker pin */}
              <path d="M185 85 C175 75 175 60 185 60 C195 60 195 75 185 85 Z" fill="var(--color-primary)" stroke="white" strokeWidth="1" />
              <circle cx="185" cy="68" r="3" fill="white" />
            </svg>

            {/* Float details */}
            <div 
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                right: '10px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Clínica Médica MediCare</span>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}
              >
                Abrir Mapa
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div 
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}
        className="container footer-bottom"
      >
        <span>&copy; {new Date().getFullYear()} MediCare. Todos los derechos reservados.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Aviso de Privacidad</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Términos de Servicio</a>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1.5fr;
          gap: 48px;
        }
        .social-icon:hover {
          background-color: var(--color-primary) !important;
          color: #ffffff !important;
          transform: translateY(-2px);
        }
        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
        @media (max-width: 600px) {
          .footer-bottom {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
