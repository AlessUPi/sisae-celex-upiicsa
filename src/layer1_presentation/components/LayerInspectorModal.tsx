import React, { useState, useEffect } from 'react';
import { 
  X, 
  Layers, 
  Database, 
  Layout, 
  Download, 
  Copy, 
  Check, 
  Activity, 
  ShieldCheck, 
  Server, 
  Smartphone, 
  Lock 
} from 'lucide-react';
import { generateFullSQLScript } from '../../layer3_data/sqlGenerator';
import { dbRepository } from '../../layer3_data/dbRepository';
import type { AuditSecurityLog } from '../../types';

interface LayerInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LayerInspectorModal: React.FC<LayerInspectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'DIAGRAM' | 'STANDARDS' | 'LOGS' | 'SQL'>('DIAGRAM');
  const [auditLogs, setAuditLogs] = useState<AuditSecurityLog[]>([]);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [sqlContent, setSqlContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAuditLogs(dbRepository.getAuditLogs());
      setSqlContent(generateFullSQLScript());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sisae_celex_upiicsa_schema_${new Date().toISOString().split('T')[0]}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '960px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="modal-header" style={{
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #334155'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Layers size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.05em' }}>
                UPIICSA IPN • UNIDAD DE INFORMÁTICA (UDI)
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>
                Arquitectura del Sistema SISAE – Módulo CELEX
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '0.4rem', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* Barra de Pestañas */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-alt)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 1.5rem',
          gap: '0.5rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('DIAGRAM')}
            style={{
              padding: '0.85rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'DIAGRAM' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'DIAGRAM' ? 'var(--ipn-guinda)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'DIAGRAM' ? '3px solid var(--ipn-guinda)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Layout size={16} />
            <span>Diagrama de Arquitectura</span>
          </button>

          <button
            onClick={() => setActiveTab('STANDARDS')}
            style={{
              padding: '0.85rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'STANDARDS' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'STANDARDS' ? 'var(--ipn-guinda)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'STANDARDS' ? '3px solid var(--ipn-guinda)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ShieldCheck size={16} />
            <span>Estándares UDI & Seguridad</span>
          </button>

          <button
            onClick={() => setActiveTab('LOGS')}
            style={{
              padding: '0.85rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'LOGS' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'LOGS' ? 'var(--ipn-guinda)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'LOGS' ? '3px solid var(--ipn-guinda)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Activity size={16} />
            <span>Bitácora de Auditoría en Vivo</span>
          </button>

          <button
            onClick={() => setActiveTab('SQL')}
            style={{
              padding: '0.85rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'SQL' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'SQL' ? 'var(--ipn-guinda)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'SQL' ? '3px solid var(--ipn-guinda)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Database size={16} />
            <span>Script SQL Relacional</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        <div className="modal-body" style={{ padding: '1.75rem', overflowY: 'auto', flexGrow: 1 }}>
          {/* TAB 1: DIAGRAMA DE ARQUITECTURA */}
          {activeTab === 'DIAGRAM' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Diseño Conceptual y Arquitectura del SAE-CELEX (Páginas 26-27 del Documento)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  El modelo contempla el acceso multiplataforma desde computadoras y teléfonos inteligentes mediante protocolos seguros TLS 1.3, capa perimetral WAF/Gateway, backend desacoplado, almacenamiento con cifrado en reposo y canales externos de notificación.
                </p>
              </div>

              {/* Diagrama de Bloques Interactivo */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                alignItems: 'stretch'
              }}>
                {/* 1. Clientes */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid #0284c7',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  textAlign: 'center'
                }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <Smartphone size={22} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Dispositivos de Usuario</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    PC / Smartphone / Navegador Web
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', backgroundColor: 'var(--bg-alt)', padding: '0.4rem', borderRadius: '4px' }}>
                    Protocolo: <strong>HTTPS / TLS 1.3</strong>
                  </div>
                </div>

                {/* 2. Capa Perimetral */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid #6c1d45',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  textAlign: 'center'
                }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(108, 29, 69, 0.15)', color: '#6c1d45', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <ShieldCheck size={22} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Capa Perimetral</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    WAF + API Gateway UDI
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', backgroundColor: 'var(--bg-alt)', padding: '0.4rem', borderRadius: '4px' }}>
                    Rate Limiting • Protección DDoS
                  </div>
                </div>

                {/* 3. Servidor de Aplicaciones */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid #c59b27',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  textAlign: 'center'
                }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(197, 155, 39, 0.15)', color: '#c59b27', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <Server size={22} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>SAE-CELEX Backend</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    API RESTful / Node.js & TypeScript
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', backgroundColor: 'var(--bg-alt)', padding: '0.4rem', borderRadius: '4px' }}>
                    Tokens JWT • Control RBAC
                  </div>
                </div>

                {/* 4. Base de Datos & Servicios Externos */}
                <div style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '2px solid #10b981',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  textAlign: 'center'
                }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                    <Database size={22} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>PostgreSQL en la Nube</h4>
                  <p style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '0.25rem' }}>
                    ● Conectado a Supabase (SSL / TLS 1.3)
                  </p>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', backgroundColor: 'var(--bg-alt)', padding: '0.4rem', borderRadius: '4px' }}>
                    WhatsApp API & Gateway Correo
                  </div>
                </div>
              </div>

              {/* Modelo Multi-Módulo SISAE (Preguntas 8 y 9 p. 22 del documento) */}
              <div style={{
                backgroundColor: 'var(--bg-alt)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem'
              }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ipn-guinda)', marginBottom: '0.5rem' }}>
                  Ecosistema Escolar Multi-Módulo (SISAE)
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Como se especifica en la entrevista con la Unidad de Informática (Ing. Mario Bizarro Moreno), SISAE es el modelo general de administración escolar sobre el cual se incorporan tres áreas institucionales:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--ipn-guinda)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ipn-guinda)' }}>1. Módulo CELEX (Activo)</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Cursos de Lenguas Extranjeras, pre-registro, validación de depósitos bancarios y asignación de aulas.
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--ipn-oro)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ipn-oro-dark)' }}>2. Seminarios de Titulación</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Registro de egresados, asignación de asesores y validación de créditos/idioma completado.
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid #0284c7' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0284c7' }}>3. Cursos y Diplomados</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Educación continua, certificaciones de actualización tecnológica y seguimiento curricular.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ESTÁNDARES UDI & SEGURIDAD */}
          {activeTab === 'STANDARDS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Cumplimiento de Estándares de la Unidad de Informática (UDI)
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Lineamientos normativos institucionales detallados en las páginas 9 a 13 y 24 a 25 del documento técnico:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--ipn-guinda)', marginBottom: '0.5rem' }}>
                    <Lock size={18} />
                    <span>Protección de Datos & Cifrado</span>
                  </div>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                    <li>Cifrado en tránsito forzado: HTTPS / TLS 1.3</li>
                    <li>Cifrado en reposo para credenciales con Argon2 / bcrypt</li>
                    <li>Manejo seguro de vouchers y documentos personales</li>
                  </ul>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--color-info)', marginBottom: '0.5rem' }}>
                    <ShieldCheck size={18} />
                    <span>Control de Acceso (RBAC)</span>
                  </div>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                    <li>Tokens de sesión estructurados (JWT)</li>
                    <li>Roles diferenciados: Alumno Interno, Externo y Admin UDI</li>
                    <li>Principio de privilegios mínimos en endpoints</li>
                  </ul>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--color-warning)', marginBottom: '0.5rem' }}>
                    <Server size={18} />
                    <span>Protección contra Vulnerabilidades</span>
                  </div>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                    <li>Sanitización estricta contra inyecciones SQL y XSS</li>
                    <li>Rate Limiting para evitar ataques de fuerza bruta</li>
                    <li>Política de Content Security Policy (CSP) en producción</li>
                  </ul>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                    <Activity size={18} />
                    <span>Auditoría y Trazabilidad</span>
                  </div>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                    <li>Registro inmutable de accesos, revisiones y asignaciones</li>
                    <li>Trazabilidad de comprobantes bancarios verificados</li>
                    <li>Monitoreo en tiempo real de actividad anómala</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BITÁCORA DE AUDITORÍA */}
          {activeTab === 'LOGS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  Eventos de Seguridad y Trazabilidad Registrados ({auditLogs.length})
                </h3>
                <span className="badge badge-info">Auditoría UDI Activa</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'var(--bg-alt)',
                      borderLeft: `4px solid ${
                        log.nivelSeguridad === 'SUCCESS' ? 'var(--color-success)' :
                        log.nivelSeguridad === 'WARNING' ? 'var(--color-warning)' :
                        log.nivelSeguridad === 'CRITICAL' ? 'var(--color-danger)' : '#0284c7'
                      }`,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong>{log.accion}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.timestamp} • {log.ipOrigen}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {log.detalles}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Usuario: <strong>{log.usuario}</strong> ({log.rol})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SCRIPT SQL */}
          {activeTab === 'SQL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    Esquema Relacional DDL y Datos Semilla DML
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Compatible con MySQL 8.0+, PostgreSQL 15+ y SQL Server
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleCopySQL} className="btn btn-secondary btn-sm">
                    {copiedSQL ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                    <span>{copiedSQL ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>
                  <button onClick={handleDownloadSQL} className="btn btn-primary btn-sm">
                    <Download size={14} />
                    <span>Descargar .sql</span>
                  </button>
                </div>
              </div>

              <pre style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                overflowX: 'auto',
                maxHeight: '400px'
              }}>
                <code>{sqlContent}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{
          padding: '1rem 1.75rem',
          backgroundColor: 'var(--bg-alt)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cerrar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
