import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingFormProps {
  onClose: () => void;
  initialSpecialty?: string;
}

const specialties = [
  'Medicina General',
  'Odontología Estética',
  'Pediatría Integrada',
  'Cardiología Preventiva',
  'Oftalmología Clínica',
  'Nutrición & Bienestar'
];

const doctors: Record<string, string[]> = {
  'Medicina General': ['Dr. Alejandro Méndez', 'Dra. Sofía Rivas'],
  'Odontología Estética': ['Dr. Carlos Peralta', 'Dra. Elena Cruz'],
  'Pediatría Integrada': ['Dra. Andrea Morales'],
  'Cardiología Preventiva': ['Dr. Ricardo Sanz'],
  'Oftalmología Clínica': ['Dra. Gabriela Torres'],
  'Nutrición & Bienestar': ['Lic. Mariana Fuentes']
};

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', 
  '12:00 PM', '03:00 PM', '04:00 PM', 
  '05:00 PM', '06:00 PM'
];

export default function BookingForm({ onClose, initialSpecialty = '' }: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState(initialSpecialty || specialties[0]);
  const [doctor, setDoctor] = useState(doctors[initialSpecialty || specialties[0]]?.[0] || '');
  const [date, setDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const spec = e.target.value;
    setSpecialty(spec);
    setDoctor(doctors[spec]?.[0] || '');
  };

  const sanitizeInput = (val: string): string => {
    return val
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[&<>"'/]/g, (match) => {
        const map: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '/': '&#x2F;'
        };
        return map[match];
      })
      .trim();
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      const newErrors: Record<string, string> = {};
      const sanitizedName = sanitizeInput(name);
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPhone = sanitizeInput(phone);

      // Update inputs with sanitized values
      setName(sanitizedName);
      setEmail(sanitizedEmail);
      setPhone(sanitizedPhone);

      // Validation regex
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]{2,50}$/;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const phoneRegex = /^[0-9\s()+-]{8,15}$/;

      if (!nameRegex.test(sanitizedName)) {
        newErrors.name = 'Por favor ingresa un nombre válido (2-50 caracteres, sin números ni caracteres especiales).';
      }
      if (!emailRegex.test(sanitizedEmail)) {
        newErrors.email = 'Por favor ingresa un correo electrónico válido.';
      }
      if (!phoneRegex.test(sanitizedPhone)) {
        newErrors.phone = 'Por favor ingresa un número de teléfono válido (8-15 dígitos).';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      setIsSubmitting(true);

      // Debounce submission for security and spam prevention
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        setIsSubmitting(false);
        setStep(4);
      }, 800);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Close Button */}
        <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
          <X size={20} />
        </button>

        {step < 4 ? (
          <>
            {/* Title & Progress Bar */}
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', textAlign: 'left' }}>
              Agendar Cita Médica
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', textAlign: 'left' }}>
              Completa los datos en 3 sencillos pasos.
            </p>

            {/* Progress indicators */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  style={{
                    height: '6px',
                    flexGrow: 1,
                    borderRadius: '3px',
                    backgroundColor: s <= step ? 'var(--color-primary)' : 'var(--border-color)',
                    transition: 'background-color var(--transition-fast)',
                  }}
                />
              ))}
            </div>

            <form onSubmit={handleNextStep}>
              {/* STEP 1: Specialty & Doctor */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
                  <div className="form-group">
                    <label className="form-label">Especialidad Requerida</label>
                    <select 
                      className="form-control" 
                      value={specialty} 
                      onChange={handleSpecialtyChange}
                      required
                    >
                      {specialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Médico Especialista</label>
                    <select 
                      className="form-control" 
                      value={doctor} 
                      onChange={(e) => setDoctor(e.target.value)}
                      required
                    >
                      {doctors[specialty]?.map(doc => (
                        <option key={doc} value={doc}>{doc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Date & Time */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
                  <div className="form-group">
                    <label className="form-label">Seleccionar Fecha</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Horarios Disponibles</label>
                    <div 
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))',
                        gap: '10px',
                        marginTop: '8px',
                      }}
                    >
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          style={{
                            padding: '10px 4px',
                            borderRadius: '10px',
                            border: selectedTime === time ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                            backgroundColor: selectedTime === time ? 'var(--color-primary-light)' : 'var(--bg-secondary)',
                            color: selectedTime === time ? 'var(--color-primary)' : 'var(--text-primary)',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                    {!selectedTime && <span style={{ fontSize: '12px', color: 'red', marginTop: '6px', display: 'block' }}>* Por favor selecciona un horario</span>}
                  </div>
                </div>
              )}

              {/* STEP 3: Contact Info */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
                  <div className="form-group">
                    <label className="form-label">Nombre Completo</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ej. Juan Pérez" 
                      value={name} 
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                      style={{ borderColor: errors.name ? 'red' : 'var(--border-color)' }}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.name && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="ejemplo@correo.com" 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      style={{ borderColor: errors.email ? 'red' : 'var(--border-color)' }}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.email && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono Móvil</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      placeholder="55 1234 5678" 
                      value={phone} 
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      style={{ borderColor: errors.phone ? 'red' : 'var(--border-color)' }}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.phone && <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
                  </div>
                </div>
              )}

              {/* Buttons Panel */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '32px',
                  gap: '16px',
                }}
              >
                {step > 1 ? (
                  <button type="button" className="btn btn-secondary" onClick={handlePrevStep} style={{ flexGrow: 1 }} disabled={isSubmitting}>
                    Atrás
                  </button>
                ) : (
                  <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flexGrow: 1 }} disabled={isSubmitting}>
                    Cancelar
                  </button>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={(step === 2 && !selectedTime) || isSubmitting}
                  style={{ flexGrow: 2 }}
                >
                  {isSubmitting ? 'Procesando...' : step === 3 ? 'Confirmar Cita' : 'Siguiente'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* STEP 4: Success View */
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }} className="animate-scale-up">
            <div style={{ color: 'var(--color-secondary)', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={64} style={{ animation: 'glow 2s infinite' }} />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
              ¡Cita Reservada con Éxito!
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6 }}>
              Hola <strong>{name}</strong>, hemos registrado tu solicitud de cita. Recibirás un correo de confirmación en breve.
            </p>

            {/* Ticket Summary */}
            <div 
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                padding: '20px',
                textAlign: 'left',
                border: '1px dashed var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '14px',
              }}
            >
              <div><span style={{ color: 'var(--text-muted)' }}>Especialidad:</span> <strong style={{ color: 'var(--text-primary)' }}>{specialty}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Especialista:</span> <strong style={{ color: 'var(--text-primary)' }}>{doctor}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Fecha:</span> <strong style={{ color: 'var(--text-primary)' }}>{date}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Hora:</span> <strong style={{ color: 'var(--text-primary)' }}>{selectedTime}</strong></div>
            </div>

            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', marginTop: '12px' }}>
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
