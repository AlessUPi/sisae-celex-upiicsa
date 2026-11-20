import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { CelexCourse, Enrollment } from '../../types';

interface WeeklyScheduleViewProps {
  activities: CelexCourse[];
  enrollments?: Enrollment[];
  onSelectActivity?: (activity: CelexCourse) => void;
  filterEnrolledOnly?: boolean;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const TIME_SLOTS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  activities,
  enrollments = [],
  onSelectActivity,
  filterEnrolledOnly = false
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('TODOS');
  const [selectedTurno, setSelectedTurno] = useState<string>('TODOS');

  const enrolledActivityIds = new Set(
    enrollments.filter(e => e.estado !== 'CANCELADO').map(e => e.actividadId)
  );

  let filteredActivities = activities;
  if (filterEnrolledOnly) {
    filteredActivities = activities.filter(a => enrolledActivityIds.has(a.id));
  }
  if (selectedLanguage !== 'TODOS') {
    filteredActivities = filteredActivities.filter(a => a.idioma === selectedLanguage);
  }
  if (selectedTurno !== 'TODOS') {
    filteredActivities = filteredActivities.filter(a => a.turno === selectedTurno || a.turno === 'Mixto');
  }

  const getActivitiesForCell = (day: string, hourStr: string) => {
    const currentHour = parseInt(hourStr.split(':')[0], 10);
    return filteredActivities.filter(act => {
      if (!act.dias.includes(day)) return false;
      const startHour = parseInt(act.horaInicio.split(':')[0], 10);
      const endHour = parseInt(act.horaFin.split(':')[0], 10);
      return currentHour >= startHour && currentHour < endHour;
    });
  };

  const getLanguageColor = (idioma: string) => {
    switch (idioma) {
      case 'Inglés': return { bg: 'rgba(108, 29, 69, 0.12)', border: '#6c1d45', text: '#6c1d45' };
      case 'Francés': return { bg: 'rgba(2, 132, 199, 0.12)', border: '#0284c7', text: '#0284c7' };
      case 'Alemán': return { bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', text: '#b45309' };
      case 'Italiano': return { bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981', text: '#047857' };
      default: return { bg: 'rgba(100, 116, 139, 0.12)', border: '#64748b', text: '#334155' };
    }
  };

  return (
    <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
      {/* Encabezado y Filtros */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="var(--ipn-guinda)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {filterEnrolledOnly ? 'Mi Calendario Académico CELEX' : 'Matriz Semanal de Cursos CELEX UPIICSA'}
          </h3>
        </div>

        {!filterEnrolledOnly && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Filtro Idioma */}
            <select
              className="input-field"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <option value="TODOS">Todos los Idiomas</option>
              <option value="Inglés">🇬🇧 Inglés</option>
              <option value="Francés">🇫🇷 Francés</option>
              <option value="Alemán">🇩🇪 Alemán</option>
              <option value="Italiano">🇮🇹 Italiano</option>
            </select>

            {/* Filtro Turno */}
            <select
              className="input-field"
              value={selectedTurno}
              onChange={(e) => setSelectedTurno(e.target.value)}
              style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <option value="TODOS">Todos los Turnos</option>
              <option value="Matutino">Turno Matutino</option>
              <option value="Vespertino">Turno Vespertino</option>
              <option value="Sabatino">Turno Sabatino</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabla del Horario Semanal */}
      <div style={{ minWidth: '780px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px repeat(6, 1fr)',
          backgroundColor: 'var(--bg-alt)',
          borderRadius: 'var(--radius-sm)',
          borderBottom: '2px solid var(--border-color)',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '0.85rem',
          padding: '0.75rem 0'
        }}>
          <div>Hora</div>
          {DAYS.map(day => (
            <div key={day} style={{ color: day === 'Sábado' ? 'var(--ipn-guinda)' : 'var(--text-main)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Filas de Horas */}
        {TIME_SLOTS.map(hour => (
          <div
            key={hour}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px repeat(6, 1fr)',
              borderBottom: '1px solid var(--border-color)',
              minHeight: '75px',
              fontSize: '0.8rem'
            }}
          >
            {/* Columna Hora */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-alt)',
              fontWeight: 600,
              color: 'var(--text-muted)',
              borderRight: '1px solid var(--border-color)'
            }}>
              {hour}
            </div>

            {/* Celdas por Día */}
            {DAYS.map(day => {
              const acts = getActivitiesForCell(day, hour);
              return (
                <div
                  key={`${day}-${hour}`}
                  style={{
                    padding: '0.35rem',
                    borderRight: '1px solid var(--border-color)',
                    backgroundColor: acts.length > 0 ? 'var(--bg-card)' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  {acts.map(act => {
                    const colors = getLanguageColor(act.idioma);
                    const isStartHour = act.horaInicio.startsWith(hour.substring(0, 2));
                    if (!isStartHour) return null; // Solo renderizar en el bloque de inicio

                    return (
                      <div
                        key={act.id}
                        onClick={() => onSelectActivity && onSelectActivity(act)}
                        style={{
                          backgroundColor: colors.bg,
                          borderLeft: `4px solid ${colors.border}`,
                          borderRadius: '4px',
                          padding: '0.45rem',
                          cursor: onSelectActivity ? 'pointer' : 'default',
                          transition: 'transform var(--transition-fast)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        title={`${act.nombre} - ${act.salonOEspacio} (${act.horaInicio} a ${act.horaFin})`}
                      >
                        <div style={{ fontWeight: 700, color: colors.text, fontSize: '0.78rem', lineHeight: 1.2 }}>
                          {act.nombre}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          📍 {act.salonOEspacio}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          ⏰ {act.horaInicio} - {act.horaFin}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
