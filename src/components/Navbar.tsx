import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Activity } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onOpenBooking: () => void;
}

export default function Navbar({ darkMode, setDarkMode, onOpenBooking }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`navbar-header glass ${scrolled ? 'scrolled' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: scrolled ? '1px solid var(--border-color)' : 'none',
        background: scrolled ? 'var(--glass-bg)' : 'transparent',
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 800, fontSize: '22px' }}>
          <Activity size={28} style={{ color: 'var(--color-primary)' }} />
          <span>Medi<span className="text-gradient">Care</span></span>
        </a>

        {/* Desktop Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-menu">
          <a href="#home" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color var(--transition-fast)' }}>Inicio</a>
          <a href="#services" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color var(--transition-fast)' }}>Servicios</a>
          <a href="#about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color var(--transition-fast)' }}>Nosotros</a>
          <a href="#testimonials" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color var(--transition-fast)' }}>Testimonios</a>
          <a href="#contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '15px', transition: 'color var(--transition-fast)' }}>Contacto</a>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Theme Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color var(--transition-fast)',
            }}
            title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Booking Button */}
          <button 
            className="btn btn-primary desktop-menu" 
            onClick={onOpenBooking}
            style={{ padding: '8px 16px', fontSize: '14px', borderRadius: 'var(--border-radius-sm)' }}
          >
            Agendar Cita
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '8px',
              display: 'none', // Managed by CSS / inline styles for small devices
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* CSS injection for desktop vs mobile menus */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
      `}</style>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div 
          className="glass animate-fade-in"
          style={{
            position: 'absolute',
            top: '80px',
            left: 0,
            right: 0,
            padding: '24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-md)',
            zIndex: 999,
          }}
        >
          <a href="#home" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, padding: '8px 0' }}>Inicio</a>
          <a href="#services" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, padding: '8px 0' }}>Servicios</a>
          <a href="#about" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, padding: '8px 0' }}>Nosotros</a>
          <a href="#testimonials" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, padding: '8px 0' }}>Testimonios</a>
          <a href="#contact" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, padding: '8px 0' }}>Contacto</a>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setIsOpen(false);
              onOpenBooking();
            }}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Agendar Cita
          </button>
        </div>
      )}
    </header>
  );
}
