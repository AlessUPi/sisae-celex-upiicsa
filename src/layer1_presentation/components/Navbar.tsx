import React, { useState } from 'react';
import { 
  Layers, 
  LogOut, 
  LogIn, 
  UserCheck, 
  ShieldCheck, 
  Sun, 
  Moon, 
  BookOpen, 
  CalendarDays, 
  BellRing, 
  Menu, 
  X, 
  FileCheck2,
  Award
} from 'lucide-react';
import type { AuthSession } from '../../types';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';

interface NavbarProps {
  session: AuthSession;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenPreRegister: () => void;
  onOpenLayerInspector: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenPreRegister,
  onOpenLayerInspector,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    // Sincronizar ruta en barra de direcciones de forma amigable (celex)
    if (window.history && window.history.pushState) {
      const subpath = tab === 'inicio' ? '' : `/${tab}`;
      const newUrl = window.location.pathname.includes('/celex') 
        ? `/celex${subpath}` 
        : `${window.location.pathname.split('#')[0]}#${tab}`;
      window.history.pushState(null, '', newUrl);
    }
  };

  return (
    <header className="navbar-wrapper no-print" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
    }}>
      {/* Encabezado Institucional Oficial SAES UPIICSA con Logos en Cada Extremo */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.65rem 1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Extremo Izquierdo: Escudo Oficial IPN */}
          <div 
            onClick={() => handleTabClick('inicio')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              flexShrink: 0 
            }}
            title="Instituto Politécnico Nacional"
          >
            <div style={{
              backgroundColor: '#ffffff',
              padding: '4px 6px',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={logoIpn} 
                alt="Logo Oficial IPN" 
                style={{ 
                  height: '52px', 
                  width: 'auto', 
                  objectFit: 'contain' 
                }} 
              />
            </div>
          </div>

          {/* Centro: Títulos Institucionales SAES UPIICSA */}
          <div 
            onClick={() => handleTabClick('inicio')}
            style={{ 
              textAlign: 'center', 
              cursor: 'pointer', 
              flexGrow: 1,
              padding: '0 0.5rem'
            }}
          >
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: 'var(--ipn-guinda-dark)',
              textTransform: 'uppercase'
            }}>
              Instituto Politécnico Nacional
            </div>
            <div style={{
              fontSize: '0.98rem',
              fontWeight: 900,
              letterSpacing: '-0.01em',
              color: 'var(--ipn-guinda)',
              textTransform: 'uppercase',
              lineHeight: 1.25,
              marginTop: '1px'
            }}>
              Unidad Profesional Interdisciplinaria de Ingeniería y Ciencias Sociales y Administrativas
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '3px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ fontWeight: 800, color: 'var(--ipn-guinda)' }}>SISAE</span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: 'var(--ipn-oro-dark)' }}>Sistema de Administración Escolar</span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: 'var(--ipn-guinda)' }}>Módulo CELEX UPIICSA</span>
            </div>
          </div>

          {/* Extremo Derecho: Escudo Oficial UPIICSA */}
          <div 
            onClick={() => handleTabClick('inicio')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer', 
              flexShrink: 0 
            }}
            title="UPIICSA - Instituto Politécnico Nacional"
          >
            <div style={{
              backgroundColor: '#ffffff',
              padding: '4px 6px',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={logoUpiicsa} 
                alt="Logo Oficial UPIICSA" 
                style={{ 
                  height: '52px', 
                  width: 'auto', 
                  objectFit: 'contain' 
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navegación y Pestañas Estilo SAES */}
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.55rem',
        paddingBottom: '0.55rem'
      }}>
        {/* Enlaces de Navegación de Escritorio */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => handleTabClick('inicio')}
            className={`btn btn-sm ${activeTab === 'inicio' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            <BookOpen size={16} />
            <span>Oferta de Idiomas</span>
          </button>

          <button
            onClick={onOpenPreRegister}
            className="btn btn-sm btn-gold"
            style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', fontWeight: 700 }}
          >
            <FileCheck2 size={16} />
            <span>Pre-Registro en Línea</span>
          </button>

          <button
            onClick={() => handleTabClick('convocatorias')}
            className={`btn btn-sm ${activeTab === 'convocatorias' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            <BellRing size={16} />
            <span>Convocatorias</span>
          </button>

          <button
            onClick={() => handleTabClick('horarios')}
            className={`btn btn-sm ${activeTab === 'horarios' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
          >
            <CalendarDays size={16} />
            <span>Horarios</span>
          </button>

          {/* Botón directo al Portal Oficial SAES UPIICSA (Calificaciones) */}
          <button
            onClick={() => handleTabClick('saes')}
            className={`btn btn-sm ${activeTab === 'saes' ? 'btn-gold' : 'btn-secondary'}`}
            style={{ 
              borderRadius: 'var(--radius-full)', 
              whiteSpace: 'nowrap',
              backgroundColor: activeTab === 'saes' ? '#f2780c' : undefined,
              color: activeTab === 'saes' ? '#ffffff' : undefined,
              borderColor: '#f2780c',
              fontWeight: 700
            }}
            title="Vista oficial con diseño idéntico al SAES UPIICSA para consulta de calificaciones"
          >
            <span>🏛️ Portal SAES (Calificaciones)</span>
          </button>

          {/* Botón especial del Visor de Arquitectura SISAE */}
          <button
            onClick={onOpenLayerInspector}
            className="btn btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              whiteSpace: 'nowrap'
            }}
            title="Arquitectura de 3 Capas, Estándares de Seguridad UDI y Modelo SISAE Multi-Módulo"
          >
            <Layers size={16} />
            <span>Arquitectura SISAE</span>
          </button>
        </nav>

        {/* Acciones de Usuario & Tema (Escritorio) */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Switch Dark/Light Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          >
            {darkMode ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6c1d45" />}
          </button>

          {session.isAuthenticated && session.user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {session.user.rol === 'ADMIN' ? (
                <button
                  onClick={() => handleTabClick('admin')}
                  className={`btn btn-sm ${activeTab === 'admin' ? 'btn-gold' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <ShieldCheck size={16} color="#9e7b1a" />
                  <span>Coordinador UDI</span>
                </button>
              ) : session.user.rol === 'DOCENTE' ? (
                <button
                  onClick={() => handleTabClick('docente')}
                  className={`btn btn-sm ${activeTab === 'docente' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <Award size={16} />
                  <span>Portal Docente (Calificaciones)</span>
                </button>
              ) : (
                <button
                  onClick={() => handleTabClick('alumno')}
                  className={`btn btn-sm ${activeTab === 'alumno' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <UserCheck size={16} />
                  <span>Mi Portal CELEX</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-md)' }}
                title="Cerrar Sesión Segura"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <LogIn size={16} />
              <span>Acceso / Login</span>
            </button>
          )}
        </div>

        {/* Botón Hamburguesa Móvil */}
        <div style={{ display: 'none' }} className="mobile-only">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem' }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="mobile-only" style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <button
            onClick={() => handleTabClick('inicio')}
            className={`btn btn-block ${activeTab === 'inicio' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BookOpen size={18} />
            <span>Oferta de Idiomas</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenPreRegister();
            }}
            className="btn btn-block btn-gold"
          >
            <FileCheck2 size={18} />
            <span>Pre-Registro en Línea</span>
          </button>

          <button
            onClick={() => handleTabClick('convocatorias')}
            className={`btn btn-block ${activeTab === 'convocatorias' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <BellRing size={18} />
            <span>Convocatorias y Avisos</span>
          </button>

          <button
            onClick={() => handleTabClick('horarios')}
            className={`btn btn-block ${activeTab === 'horarios' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <CalendarDays size={18} />
            <span>Horarios CELEX</span>
          </button>

          <button
            onClick={() => handleTabClick('saes')}
            className="btn btn-block"
            style={{ backgroundColor: '#f2780c', color: '#ffffff', fontWeight: 700 }}
          >
            <span>🏛️ Portal SAES (Calificaciones Oficiales)</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenLayerInspector();
            }}
            className="btn btn-block"
            style={{ background: '#0284c7', color: '#ffffff' }}
          >
            <Layers size={18} />
            <span>Arquitectura SISAE & UDI</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>

            {session.isAuthenticated ? (
              <button onClick={onLogout} className="btn btn-secondary">
                <LogOut size={18} />
              </button>
            ) : null}
          </div>

          {session.isAuthenticated && session.user ? (
            <button
              onClick={() => handleTabClick(session.user?.rol === 'ADMIN' ? 'admin' : session.user?.rol === 'DOCENTE' ? 'docente' : 'alumno')}
              className="btn btn-primary btn-block"
              style={{ marginTop: '0.5rem' }}
            >
              {session.user.rol === 'ADMIN' ? <ShieldCheck size={18} /> : session.user.rol === 'DOCENTE' ? <Award size={18} /> : <UserCheck size={18} />}
              <span>{session.user.rol === 'ADMIN' ? 'Panel de Coordinación UDI' : session.user.rol === 'DOCENTE' ? 'Portal Docente (Calificaciones)' : 'Mi Portal del Alumno'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="btn btn-primary btn-block"
              style={{ marginTop: '0.5rem' }}
            >
              <LogIn size={18} />
              <span>Iniciar Sesión / Registro</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
