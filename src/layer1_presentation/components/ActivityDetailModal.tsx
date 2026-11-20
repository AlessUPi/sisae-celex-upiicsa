import React from 'react';
import { 
  X, 
  CheckCircle2, 
  CalendarDays,
  FileCheck2,
  Landmark
} from 'lucide-react';
import type { CelexCourse, AuthSession } from '../../types';

interface ActivityDetailModalProps {
  activity: CelexCourse | null;
  session?: AuthSession;
  isEnrolled: boolean;
  onClose: () => void;
  onStartPreRegister: (course: CelexCourse) => void;
  onOpenAuth?: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  session: _session,
  isEnrolled,
  onClose,
  onStartPreRegister,
  onOpenAuth: _onOpenAuth
}) => {
  if (!activity) return null;

  const isFull = activity.cupoOcupado >= activity.cupoMaximo;
  const availableSlots = Math.max(0, activity.cupoMaximo - activity.cupoOcupado);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '780px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado con Imagen y Botón de Cierre */}
        <div style={{ position: 'relative', height: '220px', backgroundColor: '#000000' }}>
          <img
            src={activity.imagenUrl}
            alt={activity.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
          />
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              borderRadius: '50%',
              padding: '0.45rem',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#ffffff',
              border: 'none'
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '20px',
            right: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem', marginRight: '0.5rem' }}>
                {activity.idioma} • {activity.subnivel || activity.nivel}
              </span>
              <span className="badge badge-guinda" style={{ backgroundColor: 'rgba(108,29,69,0.9)', color: '#ffffff' }}>
                {activity.modalidad}
              </span>
              <h2 style={{ color: '#ffffff', fontSize: '1.6rem', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.8)', marginTop: '0.35rem' }}>
                {activity.nombre}
              </h2>
            </div>
            
            <div style={{ textAlign: 'right', color: '#ffffff' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Cuota Interna IPN</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fef08a' }}>
                ${activity.costoInterno} MXN
              </div>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal con Información Estructurada (Documento CELEX p. 19-20) */}
        <div className="modal-body" style={{ padding: '1.75rem' }}>
          {/* Grid de Metadatos Rápidos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-alt)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Horario & Días</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {activity.dias.join(', ')}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {activity.horaInicio} - {activity.horaFin} ({activity.turno})
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Salón o Laboratorio</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {activity.salonOEspacio}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Edificio CELEX UPIICSA</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Docente Titular</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {activity.profesorNombre || 'Por asignar'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>Acreditado CELEX</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Disponibilidad de Cupo</span>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isFull ? 'var(--color-danger)' : 'var(--color-success)', marginTop: '2px' }}>
                {availableSlots} lugares disponibles
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {activity.cupoOcupado} de {activity.cupoMaximo} registrados
              </div>
            </div>
          </div>

          {/* Cuotas de Recuperación Diferenciadas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUOTA ALUMNOS / EGRESADOS IPN</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ipn-guinda)', marginTop: '0.2rem' }}>
                ${activity.costoInterno}.00 MXN
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Requiere Boleta IPN vigente o constancia de egreso.
              </div>
            </div>

            <div style={{
              padding: '1rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CUOTA PÚBLICO GENERAL / EXTERNO</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                ${activity.costoExterno}.00 MXN
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Requiere RFC e identificación oficial vigente (INE/Pasaporte).
              </div>
            </div>
          </div>

          {/* Datos Bancarios de Depósito (Documento p. 20, 24) */}
          <div style={{
            backgroundColor: 'rgba(197, 155, 39, 0.08)',
            border: '1px solid var(--ipn-oro)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--ipn-oro-dark)', marginBottom: '0.5rem' }}>
              <Landmark size={18} />
              <span>Instrucciones Bancarias Oficiales para el Pago</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div><strong>Banco:</strong> BBVA México</div>
              <div><strong>Convenio CIE IPN:</strong> 1849201</div>
              <div><strong>Concepto:</strong> CELEX UPIICSA 2026-2</div>
              <div><strong>Referencia:</strong> Tu Boleta o RFC</div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.6rem' }}>
              * Al realizar el pago en cajero o practicaja, conserva el voucher físico. Deberás capturar el número de autorización bancaria y adjuntar la fotografía en el pre-registro.
            </div>
          </div>

          {/* Descripción y Requisitos */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Descripción del Programa Académico</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
              {activity.descripcion}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>Requisitos de Ingreso y Documentación</h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
              <span>{activity.requisitos}</span>
            </div>
            {activity.fechaExamenDiagnostico && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
                <CalendarDays size={16} color="var(--ipn-oro)" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>Fecha límite para presentar Examen Diagnóstico / Ubicación: <strong>{activity.fechaExamenDiagnostico}</strong>.</span>
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem'
          }}>
            <button onClick={onClose} className="btn btn-secondary">
              Cerrar Ficha
            </button>

            {isEnrolled ? (
              <div className="badge badge-success" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
                ✓ Ya estás inscrito en este curso
              </div>
            ) : isFull ? (
              <div className="badge badge-danger" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}>
                Cupo completo para este horario
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onStartPreRegister(activity);
                }}
                className="btn btn-primary btn-lg"
                style={{ fontWeight: 700 }}
              >
                <FileCheck2 size={18} />
                <span>Comenzar Pre-Registro para este Curso</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
