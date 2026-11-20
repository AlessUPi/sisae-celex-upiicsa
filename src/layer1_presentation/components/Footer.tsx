import React from 'react';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';

export const Footer: React.FC = () => {
  return (
    <footer className="no-print" style={{
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      borderTop: '1px solid #1e293b',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Columna 1: Identidad Institucional con Logos Oficiales */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                padding: '4px 8px',
                borderRadius: '8px',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                <img 
                  src={logoIpn} 
                  alt="IPN" 
                  title="Instituto Politécnico Nacional"
                  style={{ height: '38px', width: 'auto', objectFit: 'contain' }} 
                />
                <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
                <img 
                  src={logoUpiicsa} 
                  alt="UPIICSA" 
                  title="UPIICSA"
                  style={{ height: '38px', width: 'auto', objectFit: 'contain' }} 
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#ffffff' }}>
                  SISAE <span style={{ color: 'var(--ipn-oro)' }}>CELEX</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  UPIICSA • Instituto Politécnico Nacional
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Sistema de Administración Escolar (SISAE) – Módulo CELEX. 
              Plataforma integral para la consulta de oferta académica de lenguas extranjeras, pre-registro digital, validación estructurada de pagos y asignación de grupos.
            </p>

            <div style={{
              display: 'inline-block',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(108, 29, 69, 0.4)',
              border: '1px solid rgba(108, 29, 69, 0.7)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#f9d976'
            }}>
              "La Técnica al Servicio de la Patria"
            </div>
          </div>

          {/* Columna 2: Cursos y Horarios */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
              Oferta de Lenguas Extranjeras
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <li>🇬🇧 Inglés (Básico 1-5, Intermedio 1-5, Avanzado 1-5)</li>
              <li>🇫🇷 Francés (Preparación DELF A1 a B2)</li>
              <li>🇩🇪 Alemán (Técnico para Ingenierías Goethe A1-B1)</li>
              <li>🇮🇹 Italiano (Preparación CILS A1-B2)</li>
              <li>🎯 Taller de Preparación TOEFL ITP (Titulación IPN)</li>
              <li>📋 Modalidades: Regular (Semanal), Intensiva y Sabatina</li>
            </ul>
          </div>

          {/* Columna 3: Información de Contacto & Ubicación */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
              Contacto & Ubicación CELEX
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={18} color="var(--ipn-oro)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Edificio CELEX - Av. Té 950, Col. Granjas México, Alcaldía Iztacalco, C.P. 08400, Ciudad de México.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Phone size={18} color="var(--ipn-oro)" style={{ flexShrink: 0 }} />
                <span>55 5624 2000 Ext. 70201 / 70205</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={18} color="var(--ipn-oro)" style={{ flexShrink: 0 }} />
                <span>celex.upiicsa@ipn.mx • udi.upiicsa@ipn.mx</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <span>Unidad de Informática (UDI) • Seguridad TLS 1.3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Créditos del Proyecto Académico */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            © 2026 Instituto Politécnico Nacional • UPIICSA • Licenciatura en Ciencias de la Informática (8CM81)
          </div>
          <div>
            Profesor: <strong>Romero Hernández Antonio</strong> • Equipo de Desarrollo SISAE-CELEX
          </div>
        </div>
      </div>
    </footer>
  );
};
