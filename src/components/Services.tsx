import { Heart, Stethoscope, Smile, Baby, Eye, Sparkles, ArrowUpRight } from 'lucide-react';

interface ServicesProps {
  onOpenBooking: (specialty?: string) => void;
}

const specialtiesList = [
  {
    id: 'general',
    name: 'Medicina General',
    description: 'Chequeos integrales, diagnósticos precisos, prevención de enfermedades y seguimiento de pacientes crónicos.',
    icon: Stethoscope,
    color: 'var(--color-primary)',
    bgColor: 'var(--color-primary-light)',
  },
  {
    id: 'dental',
    name: 'Odontología Estética',
    description: 'Diseño de sonrisa, blanqueamiento dental, ortodoncia, implantes y limpiezas profundas sin dolor.',
    icon: Smile,
    color: 'var(--color-secondary)',
    bgColor: 'var(--color-secondary-light)',
  },
  {
    id: 'pediatria',
    name: 'Pediatría Integrada',
    description: 'Control de crecimiento infantil, vacunación y cuidado con el cariño y suavidad que los niños necesitan.',
    icon: Baby,
    color: 'var(--color-accent)',
    bgColor: 'var(--color-accent-light)',
  },
  {
    id: 'cardiologia',
    name: 'Cardiología Preventiva',
    description: 'Electrocardiogramas, ecocardiogramas, monitoreo de presión y cuidado integral para la salud cardíaca.',
    icon: Heart,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
  },
  {
    id: 'oftalmologia',
    name: 'Oftalmología Clínica',
    description: 'Exámenes de agudeza visual, prescripción de lentes y diagnóstico preventivo de patologías oculares.',
    icon: Eye,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    id: 'bienestar',
    name: 'Nutrición & Bienestar',
    description: 'Evaluación de composición corporal, diseño de planes de alimentación saludables y nutrición deportiva.',
    icon: Sparkles,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
];

export default function Services({ onOpenBooking }: ServicesProps) {
  return (
    <section 
      id="services" 
      style={{
        padding: '100px 0',
        backgroundColor: 'var(--bg-tertiary)',
        transition: 'background-color var(--transition-normal)',
      }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{
              display: 'inline-flex',
              padding: '6px 16px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Nuestros Servicios
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Especialidades Médicas <span className="text-gradient">de Vanguardia</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '16px' }}>
            Ofrecemos un amplio abanico de especialidades médicas para cuidar de ti y de toda tu familia, con tecnología y calidez humana.
          </p>
        </div>

        {/* Services Grid */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {specialtiesList.map((specialty) => {
            const Icon = specialty.icon;
            return (
              <div 
                key={specialty.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onClick={() => onOpenBooking(specialty.name)}
              >
                {/* Icon Container */}
                <div 
                  style={{
                    backgroundColor: specialty.bgColor,
                    color: specialty.color,
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    transition: 'transform var(--transition-fast)',
                  }}
                  className="service-icon-container"
                >
                  <Icon size={28} />
                </div>

                {/* Content */}
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  {specialty.name}
                  <ArrowUpRight size={18} style={{ opacity: 0.3, transition: 'all var(--transition-fast)' }} className="service-arrow" />
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, flexGrow: 1, marginBottom: '24px' }}>
                  {specialty.description}
                </p>

                {/* Bottom Trigger */}
                <span 
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'gap var(--transition-fast)',
                  }}
                  className="service-link"
                >
                  Agendar Consulta
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .card:hover .service-icon-container {
          transform: scale(1.1);
        }
        .card:hover .service-arrow {
          opacity: 1;
          transform: translate(2px, -2px);
          color: var(--color-primary);
        }
        .card:hover .service-link {
          gap: 8px;
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
}
