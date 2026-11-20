import React, { useState } from 'react';
import { 
  Search, 
  Languages, 
  Sparkles,
  FileCheck2 
} from 'lucide-react';
import { HeroBanner } from '../components/HeroBanner';
import { ActivityCard } from '../components/ActivityCard';
import { AnnouncementsSection } from '../components/AnnouncementsSection';
import type { CelexCourse, Announcement, AuthSession } from '../../types';

interface HomePageProps {
  session?: AuthSession;
  activities: CelexCourse[];
  announcements: Announcement[];
  totalRequests: number;
  onViewActivityDetails: (activity: CelexCourse) => void;
  onEnrollDirectly: (activity: CelexCourse) => void;
  onOpenPreRegister: () => void;
  onOpenAuth?: () => void;
  onQuickDemoStudent: () => void;
  onQuickDemoExterno: () => void;
  onQuickDemoAdmin: () => void;
  enrolledActivityIds: string[];
}

const LANGUAGES = [
  { label: 'Todos los Idiomas', value: 'TODAS' },
  { label: '🇬🇧 Inglés', value: 'Inglés' },
  { label: '🇫🇷 Francés', value: 'Francés' },
  { label: '🇩🇪 Alemán', value: 'Alemán' },
  { label: '🇮🇹 Italiano', value: 'Italiano' }
];

const LEVELS = [
  { label: 'Todos los Niveles', value: 'TODOS' },
  { label: 'Básico (B1 - B5)', value: 'Básico' },
  { label: 'Intermedio (I1 - I5)', value: 'Intermedio' },
  { label: 'Avanzado (A1 - A5)', value: 'Avanzado' },
  { label: 'Certificación / TOEFL', value: 'Certificación' }
];

const MODALITIES = [
  { label: 'Todas las Modalidades', value: 'TODAS' },
  { label: 'Regular (Semanal)', value: 'Regular' },
  { label: 'Sabatino', value: 'Sabatino' },
  { label: 'Intensivo', value: 'Intensivo' }
];

export const HomePage: React.FC<HomePageProps> = ({
  activities,
  announcements,
  totalRequests,
  onViewActivityDetails,
  onEnrollDirectly,
  onOpenPreRegister,
  onQuickDemoStudent,
  onQuickDemoExterno,
  onQuickDemoAdmin,
  enrolledActivityIds
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('TODAS');
  const [selectedLevel, setSelectedLevel] = useState('TODOS');
  const [selectedModality, setSelectedModality] = useState('TODAS');
  const [selectedTurno, setSelectedTurno] = useState('TODOS');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filtrado de cursos de idiomas
  const filteredActivities = activities.filter(act => {
    if (!act.activa) return false;
    if (selectedLanguage !== 'TODAS' && act.idioma !== selectedLanguage) return false;
    if (selectedLevel !== 'TODOS' && act.nivel !== selectedLevel) return false;
    if (selectedModality !== 'TODAS' && act.modalidad !== selectedModality) return false;
    if (selectedTurno !== 'TODOS' && act.turno !== selectedTurno && act.turno !== 'Mixto') return false;
    if (onlyAvailable && act.cupoOcupado >= act.cupoMaximo) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = act.nombre.toLowerCase().includes(q);
      const matchIdioma = act.idioma.toLowerCase().includes(q);
      const matchTeacher = act.profesorNombre?.toLowerCase().includes(q) || false;
      const matchSalon = act.salonOEspacio.toLowerCase().includes(q);
      const matchDesc = act.descripcion.toLowerCase().includes(q);
      if (!matchName && !matchIdioma && !matchTeacher && !matchSalon && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div>
      {/* Hero Principal con Métricas y Difusión */}
      <HeroBanner
        totalActivities={activities.length}
        totalStudents={activities.reduce((acc, a) => acc + a.cupoOcupado, 0)}
        totalRequests={totalRequests}
        onExploreClick={() => {
          const el = document.getElementById('catalogo-cursos');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenPreRegister={onOpenPreRegister}
        onQuickDemoStudent={onQuickDemoStudent}
        onQuickDemoExterno={onQuickDemoExterno}
        onQuickDemoAdmin={onQuickDemoAdmin}
      />

      {/* Tablón de Avisos y Convocatorias Oficiales */}
      <AnnouncementsSection announcements={announcements} />

      {/* SECCIÓN PRINCIPAL: CATÁLOGO DE CURSOS DE LENGUAS EXTRANJERAS */}
      <section id="catalogo-cursos" style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-alt)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
            <span className="badge badge-guinda" style={{ marginBottom: '0.5rem' }}>
              <Languages size={14} /> Oferta Académica Semestre 2026-2
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Catálogo Oficial de Cursos de Idiomas CELEX
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.5rem' }}>
              Consulta grupos, salones en el Edificio CELEX de UPIICSA, horarios matutinos, vespertinos o sabatinos, y asegura tu lugar realizando tu pre-registro.
            </p>
          </div>

          {/* Barra de Filtros Avanzada */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Buscador de texto */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Buscar por idioma (inglés, francés, alemán), profesor, salón o nivel..."
                className="input-field"
                style={{ paddingLeft: '2.75rem', width: '100%' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Selectores de Filtro en Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              alignItems: 'center'
            }}>
              {/* Filtro Idioma */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  IDIOMA
                </label>
                <select
                  className="input-field"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Nivel */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  NIVEL ACADÉMICO
                </label>
                <select
                  className="input-field"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  {LEVELS.map(lev => (
                    <option key={lev.value} value={lev.value}>{lev.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Modalidad */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  MODALIDAD
                </label>
                <select
                  className="input-field"
                  value={selectedModality}
                  onChange={(e) => setSelectedModality(e.target.value)}
                >
                  {MODALITIES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Turno */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  TURNO
                </label>
                <select
                  className="input-field"
                  value={selectedTurno}
                  onChange={(e) => setSelectedTurno(e.target.value)}
                >
                  <option value="TODOS">Todos los Turnos</option>
                  <option value="Matutino">Matutino (07:00 a 13:00)</option>
                  <option value="Vespertino">Vespertino (13:00 a 19:00)</option>
                  <option value="Sabatino">Sabatino (08:00 a 14:00)</option>
                </select>
              </div>

              {/* Checkbox solo con cupo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.25rem' }}>
                <input
                  type="checkbox"
                  id="onlyAvailable"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--ipn-guinda)', cursor: 'pointer' }}
                />
                <label htmlFor="onlyAvailable" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  Solo con cupo disponible
                </label>
              </div>
            </div>

            {/* Contador de resultados */}
            <div style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.825rem',
              color: 'var(--text-muted)'
            }}>
              <span>Mostrando <strong>{filteredActivities.length}</strong> de {activities.length} cursos en oferta</span>
              {(selectedLanguage !== 'TODAS' || selectedLevel !== 'TODOS' || selectedModality !== 'TODAS' || selectedTurno !== 'TODOS' || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedLanguage('TODAS');
                    setSelectedLevel('TODOS');
                    setSelectedModality('TODAS');
                    setSelectedTurno('TODOS');
                    setSearchQuery('');
                    setOnlyAvailable(false);
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Grid de Cursos de Idiomas */}
          {filteredActivities.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {filteredActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onViewDetails={onViewActivityDetails}
                  onEnrollDirectly={onEnrollDirectly}
                  isEnrolled={enrolledActivityIds.includes(activity.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)'
            }}>
              <Languages size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No se encontraron cursos con los filtros seleccionados
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Intenta ajustar la búsqueda, restablecer el idioma o seleccionar otro turno.
              </p>
              <button
                onClick={() => {
                  setSelectedLanguage('TODAS');
                  setSelectedLevel('TODOS');
                  setSelectedModality('TODAS');
                  setSelectedTurno('TODOS');
                  setSearchQuery('');
                }}
                className="btn btn-primary"
              >
                Ver Todo el Catálogo
              </button>
            </div>
          )}

          {/* Banner de Pre-registro al final del catálogo */}
          <div style={{
            marginTop: '3.5rem',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--ipn-guinda-dark) 0%, var(--ipn-guinda) 60%, #b45309 100%)',
            color: '#ffffff',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            boxShadow: 'var(--shadow-guinda)'
          }}>
            <div>
              <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
                <Sparkles size={14} /> Inscripciones Abiertas 2026-2
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>
                ¿Listo para iniciar tu proceso en CELEX UPIICSA?
              </h3>
              <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '600px', marginTop: '0.4rem' }}>
                Realiza tu pre-registro digital en menos de 3 minutos. Sube tu comprobante de depósito bancario BBVA y recibe tu confirmación oficial.
              </p>
            </div>

            <button
              onClick={onOpenPreRegister}
              className="btn btn-gold btn-lg"
              style={{ fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              <FileCheck2 size={20} />
              <span>Comenzar Pre-Registro en Línea</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
