import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ArrowUpRight,
  FileCheck2
} from 'lucide-react';
import type { CelexCourse } from '../../types';

interface ActivityCardProps {
  activity: CelexCourse;
  onViewDetails: (activity: CelexCourse) => void;
  onEnrollDirectly?: (activity: CelexCourse) => void;
  isEnrolled?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onViewDetails,
  onEnrollDirectly,
  isEnrolled = false
}) => {
  const isFull = activity.cupoOcupado >= activity.cupoMaximo;
  const availableSlots = Math.max(0, activity.cupoMaximo - activity.cupoOcupado);
  const percentage = Math.min(100, Math.round((activity.cupoOcupado / activity.cupoMaximo) * 100));

  // Color de badge según idioma
  const getLanguageBadge = (idioma: string) => {
    switch (idioma) {
      case 'Inglés': return 'badge-guinda';
      case 'Francés': return 'badge-info';
      case 'Alemán': return 'badge-warning';
      case 'Italiano': return 'badge-success';
      case 'Japonés': return 'badge-gold';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}>
      {/* Imagen y Tags flotantes */}
      <div style={{
        position: 'relative',
        height: '180px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-alt)'
      }}>
        <img
          src={activity.imagenUrl}
          alt={activity.nombre}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)'
          }}
          className="card-image-hover"
        />

        {/* Gradiente oscuro sobre la imagen para legibilidad */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.15) 60%, transparent 100%)'
        }} />

        {/* Badges superiores */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span className={`badge ${getLanguageBadge(activity.idioma)}`} style={{ fontWeight: 800 }}>
            {activity.idioma} • {activity.subnivel || activity.nivel}
          </span>

          <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
            {activity.modalidad}
          </span>
        </div>

        {/* Datos en la base de la imagen */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          color: '#ffffff'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nivel: {activity.nivel}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {activity.turno}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>Cuota IPN</span>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fef08a' }}>
              ${activity.costoInterno} MXN
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del Taller / Curso */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          lineHeight: 1.3,
          marginBottom: '0.75rem',
          color: 'var(--text-main)'
        }}>
          {activity.nombre}
        </h3>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {activity.descripcion}
        </p>

        {/* Metadatos: Horario, Días, Salón, Profesor */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={15} color="var(--ipn-guinda)" style={{ flexShrink: 0 }} />
            <span>{activity.dias.join(', ')}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} color="var(--ipn-guinda)" style={{ flexShrink: 0 }} />
            <span>{activity.horaInicio} a {activity.horaFin} hrs</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={15} color="var(--ipn-guinda)" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activity.salonOEspacio}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={15} color="var(--ipn-guinda)" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activity.profesorNombre || 'Instructor por asignar'}
            </span>
          </div>
        </div>

        {/* Barra de Progreso de Cupo */}
        <div style={{ marginTop: 'auto', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Disponibilidad de Cupo</span>
            <span style={{ fontWeight: 700, color: isFull ? 'var(--color-danger)' : 'var(--text-main)' }}>
              {isFull ? '¡Cupo Lleno!' : `${availableSlots} lugares disponibles`}
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: isFull ? 'var(--color-danger)' : percentage > 80 ? 'var(--color-warning)' : 'var(--ipn-guinda)'
              }}
            />
          </div>
        </div>

        {/* Acciones del Card */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onViewDetails(activity)}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1 }}
          >
            <span>Ver Ficha</span>
            <ArrowUpRight size={14} />
          </button>

          {isEnrolled ? (
            <button className="btn btn-sm" disabled style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}>
              Inscrito
            </button>
          ) : (
            <button
              onClick={() => onEnrollDirectly ? onEnrollDirectly(activity) : onViewDetails(activity)}
              disabled={isFull}
              className={`btn btn-sm ${isFull ? 'btn-secondary' : 'btn-primary'}`}
              style={{ flex: 1.2 }}
            >
              <FileCheck2 size={14} />
              <span>{isFull ? 'Sin Cupo' : 'Pre-Registro'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
