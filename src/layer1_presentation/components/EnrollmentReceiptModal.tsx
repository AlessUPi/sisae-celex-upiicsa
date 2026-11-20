import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import type { Enrollment } from '../../types';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';

interface EnrollmentReceiptModalProps {
  enrollment: Enrollment | null;
  onClose: () => void;
}

export const EnrollmentReceiptModal: React.FC<EnrollmentReceiptModalProps> = ({
  enrollment,
  onClose
}) => {
  if (!enrollment) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrUrl = enrollment.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `SISAE-CELEX-IPN|FOLIO:${enrollment.folio}|BOLETA:${enrollment.alumnoBoleta}|CURSO:${enrollment.actividadNombre}|GRUPO:${enrollment.grupo}|VALIDADO_UDI`
  )}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '720px', backgroundColor: '#ffffff', color: '#111827' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado no imprimible */}
        <div className="modal-header no-print" style={{ backgroundColor: 'var(--bg-alt)', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <CheckCircle2 size={20} color="var(--color-success)" />
            <span>Cédula Oficial de Inscripción SISAE - CELEX</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* CONTENIDO DEL COMPROBANTE OFICIAL IMPRIMIBLE */}
        <div className="modal-body" style={{ padding: '2rem' }}>
          <div style={{
            border: '2px solid #6c1d45',
            borderRadius: '12px',
            padding: '1.75rem',
            position: 'relative',
            backgroundColor: '#ffffff'
          }}>
            {/* Membrete Oficial IPN & UPIICSA & CELEX con Escudos Institucionales */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #6c1d45',
              paddingBottom: '1rem',
              marginBottom: '1.25rem',
              gap: '1rem'
            }}>
              {/* Escudo IPN */}
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <img 
                  src={logoIpn} 
                  alt="Escudo Oficial IPN" 
                  style={{ height: '64px', width: 'auto', objectFit: 'contain' }} 
                />
              </div>

              {/* Título Institucional */}
              <div style={{ textAlign: 'center', flexGrow: 1 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6c1d45', letterSpacing: '0.06em' }}>
                  INSTITUTO POLITÉCNICO NACIONAL
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                  UPIICSA • UNIDAD DE INFORMÁTICA (UDI)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#4b5563', fontWeight: 600 }}>
                  Centro de Cursos Extracurriculares de Lenguas Extranjeras (CELEX)
                </div>
              </div>

              {/* Escudo UPIICSA y Folio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
                <img 
                  src={logoUpiicsa} 
                  alt="Escudo Oficial UPIICSA" 
                  style={{ height: '64px', width: 'auto', objectFit: 'contain' }} 
                />
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'inline-block'
                  }}>
                    FOLIO: {enrollment.folio}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem' }}>
                    Periodo Escolar 2026-2
                  </div>
                </div>
              </div>
            </div>

            {/* Título de la Cédula */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#6c1d45', textTransform: 'uppercase' }}>
                Cédula Oficial de Inscripción en Lengua Extranjera
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#4b5563' }}>
                Documento Institucional de Asignación Académica y Acreditación de Cuota Bancaria
              </p>
            </div>

            {/* Datos del Alumno / Aspirante */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6c1d45', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Datos Generales del Estudiante
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#6b7280' }}>Nombre Completo:</span>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{enrollment.alumnoNombre}</div>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Boleta IPN / RFC:</span>
                  <div style={{ fontWeight: 700, color: '#111827' }}>
                    {enrollment.alumnoBoleta}
                    {enrollment.alumnoRfc && enrollment.alumnoRfc !== enrollment.alumnoBoleta && (
                      <span style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', fontWeight: 500 }}>
                        RFC: {enrollment.alumnoRfc}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Tipo de Usuario:</span>
                  <div style={{ fontWeight: 600, color: '#111827' }}>
                    {enrollment.alumnoTipo === 'INTERNO_IPN' ? 'Comunidad Interna IPN (UPIICSA)' : 'Comunidad Externa / General'}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Programa Académico:</span>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{enrollment.alumnoCarrera}</div>
                </div>
              </div>
            </div>

            {/* Datos de Asignación del Curso */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6c1d45', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Detalles del Curso Asignado
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: '#6b7280' }}>Curso & Nivel:</span>
                  <div style={{ fontWeight: 800, color: '#6c1d45', fontSize: '0.95rem' }}>
                    {enrollment.actividadNombre}
                  </div>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Grupo Asignado:</span>
                  <div style={{ fontWeight: 800, color: '#111827' }}>{enrollment.grupo || '1CE01'}</div>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Horario & Días:</span>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{enrollment.horarioTexto}</div>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Salón / Laboratorio:</span>
                  <div style={{ fontWeight: 700, color: '#111827' }}>{enrollment.salon}</div>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Docente Titular:</span>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{enrollment.profesorNombre}</div>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Fecha de Validación:</span>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{enrollment.fechaInscripcion}</div>
                </div>
              </div>
            </div>

            {/* Validación Bancaria y Código QR */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '1.5rem',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <ShieldCheck size={18} />
                  <span>CUOTA Y DEPÓSITO VALIDADO POR LA UDI</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
                  <div><strong>Convenio Bancario:</strong> BBVA CIE 1849201</div>
                  <div><strong>Referencia Validada:</strong> {enrollment.referenciaBancariaValidada}</div>
                  <div><strong>Monto Cubierto:</strong> ${enrollment.montoPagado || 850}.00 MXN</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                    Sello Digital: SHA256-CELEX-IPN-9842F-VALID
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div style={{ textAlign: 'center' }}>
                <img
                  src={qrUrl}
                  alt="QR Verificación CELEX"
                  style={{ width: '110px', height: '110px', borderRadius: '4px', border: '1px solid #94a3b8' }}
                />
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.2rem' }}>
                  Escanear para verificar
                </div>
              </div>
            </div>

            {/* Firmas Institucionales */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ borderBottom: '1px solid #94a3b8', height: '35px' }}></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', marginTop: '0.4rem' }}>
                  Firma del Aspirante / Alumno
                </div>
                <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Aceptación de lineamientos CELEX</div>
              </div>

              <div>
                <div style={{ borderBottom: '1px solid #94a3b8', height: '35px' }}></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', marginTop: '0.4rem' }}>
                  Unidad de Informática (UDI)
                </div>
                <div style={{ fontSize: '0.65rem', color: '#6b7280' }}>Sello y Validación Electrónica UPIICSA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del Modal (No imprimibles) */}
        <div className="modal-footer no-print" style={{
          backgroundColor: 'var(--bg-alt)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar
          </button>

          <button onClick={handlePrint} className="btn btn-primary" style={{ fontWeight: 700 }}>
            <Printer size={18} />
            <span>Imprimir Cédula Oficial / Guardar en PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
