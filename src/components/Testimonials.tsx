import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Valeria Gómez',
    role: 'Paciente de Odontología',
    content: 'La atención del Dr. Peralta y su equipo fue excepcional. Me realicé un diseño de sonrisa y el resultado superó todas mis expectativas. Lo mejor es que fue completamente libre de dolor.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: 2,
    name: 'Carlos Mendoza',
    role: 'Paciente de Cardiología',
    content: 'Acudí por un chequeo general de presión y me encontré con un servicio superprofesional. Me explicaron cada estudio a detalle y la calidez del trato me dio mucha tranquilidad.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
  },
  {
    id: 3,
    name: 'Sofía Martínez',
    role: 'Madre de Paciente Infantil',
    content: 'Llevar a mis hijos al pediatra solía ser una pesadilla, pero en MediCare los tratan con tanta dulzura y paciencia que ahora van felices. Las instalaciones infantiles son hermosas.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80',
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section 
      id="testimonials" 
      style={{
        padding: '100px 0',
        backgroundColor: 'var(--bg-tertiary)',
        transition: 'background-color var(--transition-normal)',
      }}
    >
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
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
            Opiniones de Pacientes
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Nuestra mayor recompensa es <span className="text-gradient">tu sonrisa</span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div style={{ position: 'relative' }}>
          {/* Card */}
          <div 
            className="card glass animate-fade-in"
            key={activeIndex} // Changing key triggers mount animation
            style={{
              padding: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '24px',
              position: 'relative',
              borderRadius: 'var(--border-radius-xl)',
            }}
          >
            {/* Quote Icon Background */}
            <Quote 
              size={120} 
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                color: 'var(--color-primary)',
                opacity: 0.05,
                pointerEvents: 'none',
              }}
            />

            {/* Avatar */}
            <div 
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid var(--bg-secondary)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <img 
                src={testimonials[activeIndex].avatar} 
                alt={testimonials[activeIndex].name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', gap: '4px', color: '#f59e0b' }}>
              {Array.from({ length: testimonials[activeIndex].rating }).map((_, i) => (
                <Star key={i} size={18} fill="#f59e0b" stroke="none" />
              ))}
            </div>

            {/* Review text */}
            <p style={{ fontSize: '18px', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.7, maxWidth: '640px' }}>
              "{testimonials[activeIndex].content}"
            </p>

            {/* Author */}
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
                {testimonials[activeIndex].name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {testimonials[activeIndex].role}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <button 
            onClick={handlePrev}
            style={{
              position: 'absolute',
              top: '50%',
              left: '-24px',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              zIndex: 5,
              transition: 'all var(--transition-fast)',
            }}
            className="carousel-control"
          >
            <ChevronLeft size={24} />
          </button>

          <button 
            onClick={handleNext}
            style={{
              position: 'absolute',
              top: '50%',
              right: '-24px',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              zIndex: 5,
              transition: 'all var(--transition-fast)',
            }}
            className="carousel-control"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Carousel Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: index === activeIndex ? 'var(--color-primary)' : 'var(--border-color)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .carousel-control:hover {
          background-color: var(--color-primary) !important;
          color: #ffffff !important;
          transform: translateY(-50%) scale(1.05);
          border-color: var(--color-primary) !important;
        }
        @media (max-width: 768px) {
          .carousel-control {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
