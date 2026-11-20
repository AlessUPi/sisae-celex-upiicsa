import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  Pin, 
  Megaphone,
  ChevronRight
} from 'lucide-react';
import type { Announcement, AnnouncementPriority } from '../../types';

interface AnnouncementsSectionProps {
  announcements: Announcement[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  announcements
}) => {
  const [filter, setFilter] = useState<string>('TODOS');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const filtered = announcements.filter(a => {
    if (filter === 'TODOS') return true;
    return a.prioridad === filter;
  });

  const getBadgeStyle = (priority: AnnouncementPriority) => {
    switch (priority) {
      case 'URGENTE':
        return { className: 'badge badge-danger', icon: <AlertTriangle size={13} /> };
      case 'CONVOCATORIA':
        return { className: 'badge badge-guinda', icon: <Sparkles size={13} /> };
      case 'EVENTO':
        return { className: 'badge badge-gold', icon: <Calendar size={13} /> };
      default:
        return { className: 'badge badge-guinda', icon: <Megaphone size={13} /> };
    }
  };

  return (
    <section style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Encabezado y Filtros */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--ipn-guinda)', fontWeight: 700, fontSize: '0.85rem' }}>
              <Megaphone size={16} /> CONVOCATORIAS Y COMUNICADOS OFICIALES
            </div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Cartelera de Lenguas Extranjeras CELEX
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Consulta avisos de pre-registro, calendario de exámenes de diagnóstico, trámites de titulación y cuentas de pago.
            </p>
          </div>

          {/* Filtro por Categoría de Aviso */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['TODOS', 'URGENTE', 'CONVOCATORIA', 'EVENTO', 'GENERAL'].map(p => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`btn btn-sm ${filter === p ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Comunicados */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {filtered.map(ann => {
            const badge = getBadgeStyle(ann.prioridad);
            return (
              <div
                key={ann.id}
                className="card"
                onClick={() => setSelectedAnnouncement(ann)}
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderTop: ann.fijado ? '4px solid var(--ipn-oro)' : ann.prioridad === 'URGENTE' ? '4px solid var(--color-danger)' : '4px solid var(--ipn-guinda)',
                  position: 'relative'
                }}
              >
                {/* Header de la tarjeta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span className={badge.className}>
                    {badge.icon} {ann.prioridad}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {ann.fijado && <Pin size={14} color="var(--ipn-oro)" />}
                    <span>{ann.fechaPublicacion}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.6rem', lineHeight: 1.35 }}>
                  {ann.titulo}
                </h3>

                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {ann.resumen}
                </p>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span>{ann.autor}</span>
                  <span style={{ color: 'var(--ipn-guinda)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Leer más <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Detalle de Noticia */}
        {selectedAnnouncement && (
          <div className="modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
            <div 
              className="modal-content" 
              style={{ maxWidth: '600px' }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <span className={getBadgeStyle(selectedAnnouncement.prioridad).className}>
                    {selectedAnnouncement.prioridad}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Publicado el {selectedAnnouncement.fechaPublicacion} por {selectedAnnouncement.autor}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '50%', padding: '0.4rem' }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {selectedAnnouncement.imagenUrl && (
                  <img
                    src={selectedAnnouncement.imagenUrl}
                    alt={selectedAnnouncement.titulo}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
                  />
                )}
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--ipn-guinda)' }}>
                  {selectedAnnouncement.titulo}
                </h2>
                <div style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {selectedAnnouncement.contenido}
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setSelectedAnnouncement(null)} className="btn btn-primary">
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
