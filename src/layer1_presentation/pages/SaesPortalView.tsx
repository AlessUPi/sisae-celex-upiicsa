import React, { useState } from 'react';
import type { AuthSession, Enrollment, Student } from '../../types';
import logoIpn from '../../assets/logo_ipn.png';
import logoUpiicsa from '../../assets/logo_upiicsa.jpg';

interface SaesPortalViewProps {
  session: AuthSession;
  enrollments: Enrollment[];
  students: Student[];
  onBackToSisae: () => void;
  onSelectCourseDetails?: (courseId: string) => void;
}

interface CurricularCourse {
  gpo: string;
  materia: string;
  p1: string;
  p2: string;
  p3: string;
  ext: string;
  finalScore: string;
  finalText: string;
}

// Datos exactos de materias curriculares capturadas en el SAES UPIICSA (como en la imagen del usuario)
const CURRICULAR_COURSES_ALEJANDRO: CurricularCourse[] = [
  {
    gpo: '8CM81',
    materia: 'C801-DISEÑO DE PROYECTOS DE SISTEMAS INFORMÁTICOS',
    p1: '-',
    p2: '-',
    p3: '-',
    ext: '-',
    finalScore: '-',
    finalText: ''
  },
  {
    gpo: '8CM80',
    materia: 'C804-GESTIÓN DE PROYECTOS',
    p1: '8',
    p2: '10',
    p3: '-',
    ext: '-',
    finalScore: '9',
    finalText: '9 (nueve)'
  },
  {
    gpo: '8CV80',
    materia: 'C802-ARQUITECTURA DE LAS ORGANIZACIONES',
    p1: '8',
    p2: '8',
    p3: '-',
    ext: '-',
    finalScore: '8',
    finalText: '8 (ocho)'
  },
  {
    gpo: '8CM80',
    materia: 'C805-MEJORES PRÁCTICAS DE TECNOLOGÍAS DE INFORMACIÓN',
    p1: '9',
    p2: '10',
    p3: '-',
    ext: '-',
    finalScore: '10',
    finalText: '10 (diez)'
  },
  {
    gpo: '8CX82',
    materia: 'C807-PROYECTO TERMINAL',
    p1: '-',
    p2: '-',
    p3: '-',
    ext: '-',
    finalScore: '-',
    finalText: ''
  }
];

// Conversión de números a texto en español para formato SAES oficial
const numberToWords = (num: number): string => {
  const words: Record<number, string> = {
    0: 'cero', 1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco',
    6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
    11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince',
    16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
    21: 'veintiuno', 22: 'veintidós', 23: 'veintitrés', 24: 'veinticuatro', 25: 'veinticinco',
    26: 'veintiséis', 27: 'veintisiete', 28: 'veintiocho', 29: 'veintinueve', 30: 'treinta',
    40: 'cuarenta', 50: 'cincuenta', 60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa', 100: 'cien'
  };

  if (words[num]) return words[num];
  if (num > 30 && num < 100) {
    const tens = Math.floor(num / 10) * 10;
    const units = num % 10;
    return `${words[tens]} y ${words[units]}`;
  }
  return num.toString();
};

export const SaesPortalView: React.FC<SaesPortalViewProps> = ({
  session,
  enrollments,
  students,
  onBackToSisae
}) => {
  // Selección de Alumno Activo en el SAES
  const [selectedBoleta, setSelectedBoleta] = useState<string>(() => {
    if (session.isAuthenticated && session.user?.rol === 'ALUMNO') {
      return session.user.identificador;
    }
    return '2022600790'; // Alejandro Avila Morales por defecto (como en la imagen del usuario)
  });

  // Modo de visualización: Curricular, CELEX o Integrado
  const [viewMode, setViewMode] = useState<'CURRICULAR' | 'CELEX' | 'INTEGRADO'>('CURRICULAR');

  // Navegación en el árbol lateral del SAES
  const [activeSideMenu, setActiveSideMenu] = useState<string>('CALIFICACIONES');
  const [activeTopTab, setActiveTopTab] = useState<string>('ALUMNOS');

  // Buscar información del alumno seleccionado
  const currentStudent = students.find(s => s.boleta === selectedBoleta) || {
    boleta: selectedBoleta,
    nombreCompleto: selectedBoleta === '2022600790' 
      ? 'ALEJANDRO AVILA MORALES' 
      : (session.user?.nombre || 'ALEJANDRO AVILA MORALES'),
    carrera: 'Ingeniería en Inteligencia Artificial'
  };

  // Filtrar inscripciones CELEX del alumno
  const studentCelexEnrollments = enrollments.filter(e => 
    (e.alumnoBoleta === selectedBoleta || (selectedBoleta === '2022600790' && e.alumnoBoleta === '2022601144')) &&
    e.estado !== 'CANCELADO'
  );

  // Mapear inscripciones CELEX al formato de tabla SAES
  const celexTableRows = studentCelexEnrollments.map(e => {
    const evalData = e.evaluacion;
    const finalScore = evalData?.calificacionFinal ?? (e.estado === 'ACREDITADO' ? 87 : undefined);
    const finalFormatted = finalScore !== undefined ? `${finalScore} (${numberToWords(finalScore)})` : '-';
    
    return {
      gpo: e.grupo || 'CEX-01',
      materia: `CEX-${e.idioma.toUpperCase()} ${e.nivel.toUpperCase()} (${e.profesorNombre || 'CELEX UPIICSA'})`,
      p1: evalData?.primerOrdinario !== undefined ? evalData.primerOrdinario.toString() : '88',
      p2: evalData?.segundoOrdinario !== undefined ? evalData.segundoOrdinario.toString() : '85',
      p3: evalData?.tareasActividades !== undefined ? evalData.tareasActividades.toString() : '90',
      ext: '-',
      finalScore: finalScore !== undefined ? finalScore.toString() : '-',
      finalText: finalFormatted,
      profesor: e.profesorNombre,
      publicada: evalData ? evalData.publicada : true
    };
  });

  // Generación de la cadena de verificación criptográfica estilo SAES (como en la imagen)
  const generateVerificationString = () => {
    if (viewMode === 'CURRICULAR') {
      return '2022600790-8CM80-C804-810--9(nueve).8CM80-C805-910-10(diez).8CM81-C801---.8CV80-C802-88-8(ocho).8CX82-C807---';
    }
    if (celexTableRows.length > 0) {
      return `${currentStudent.boleta}-${celexTableRows.map(r => `${r.gpo}-${r.p1}${r.p2}-${r.finalText}`).join('.')}`;
    }
    return `${currentStudent.boleta}-8CM80-C804-810--9(nueve).8CM80-C805-910-10(diez).8CM81-C801---.8CV80-C802-88-8(ocho).8CX82-C807---`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      fontFamily: 'Arial, Helvetica, sans-serif',
      backgroundColor: '#f6f6f6',
      minHeight: '100vh',
      color: '#333333',
      fontSize: '12px'
    }}>
      {/* 1. Barra de Herramientas de Integración SISAE (Exclusiva para navegación rápida) */}
      <div className="no-print" style={{
        backgroundColor: '#2d3748',
        color: '#ffffff',
        padding: '0.4rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        borderBottom: '2px solid #f2780c'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ 
            backgroundColor: '#f2780c', 
            color: '#ffffff', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontWeight: 800,
            fontSize: '11px'
          }}>
            VISTA OFICIAL SAES
          </span>
          <span style={{ fontWeight: 600 }}>
            Sistema de Administración Escolar • Consulta de Calificaciones en Tiempo Real (UPIICSA)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Selector de Alumno para Pruebas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#cbd5e1' }}>Estudiante en pantalla:</span>
            <select
              value={selectedBoleta}
              onChange={(e) => setSelectedBoleta(e.target.value)}
              style={{
                backgroundColor: '#1a202c',
                color: '#ffffff',
                border: '1px solid #4a5568',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: 700
              }}
            >
              <option value="2022600790">2022600790 - Alejandro Avila Morales (Captura Original)</option>
              <option value="2023600123">2023600123 - Daniel Hernández Rodríguez</option>
              {session.isAuthenticated && session.user?.rol === 'ALUMNO' && session.user.identificador !== '2022600790' && session.user.identificador !== '2023600123' && (
                <option value={session.user.identificador}>
                  {session.user.identificador} - {session.user.nombre} (Mi Sesión)
                </option>
              )}
            </select>
          </div>

          <button
            onClick={onBackToSisae}
            style={{
              backgroundColor: '#6c1d45',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ← Volver a SISAE CELEX
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', backgroundColor: '#ffffff', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        
        {/* 2. ENCABEZADO INSTITUCIONAL OFICIAL (IDÉNTICO A LA FOTO DEL SAES) */}
        <header style={{
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #d0d0d0',
          backgroundColor: '#ffffff'
        }}>
          {/* Escudo IPN Guinda */}
          <div style={{ flexShrink: 0, width: '90px', display: 'flex', alignItems: 'center' }}>
            <img 
              src={logoIpn} 
              alt="IPN" 
              style={{ maxHeight: '78px', width: 'auto', objectFit: 'contain' }} 
            />
          </div>

          {/* Texto Institucional en Guinda / Rojo Quemado */}
          <div style={{ textAlign: 'center', flexGrow: 1, padding: '0 1rem' }}>
            <h1 style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#701b33',
              margin: 0,
              letterSpacing: '0.5px',
              lineHeight: 1.35,
              textTransform: 'uppercase'
            }}>
              UNIDAD PROFESIONAL INTERDISCIPLINARIA DE INGENIERÍA Y<br />
              CIENCIAS SOCIALES Y ADMINISTRATIVAS
            </h1>
          </div>

          {/* Escudo UPIICSA y símbolo terminal */}
          <div style={{ flexShrink: 0, width: '120px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
            <img 
              src={logoUpiicsa} 
              alt="UPIICSA" 
              style={{ maxHeight: '72px', width: 'auto', objectFit: 'contain' }} 
            />
            {/* Íconos clásicos del portal SAES (@ y nodo) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '20px', color: '#006633', fontWeight: 900 }}>
              <span style={{ lineHeight: 1 }}>@</span>
              <span style={{ fontSize: '13px', lineHeight: 1, color: '#f2780c' }}>☊</span>
            </div>
          </div>
        </header>

        {/* 3. MENÚ HORIZONTAL CLÁSICO DE PESTAÑAS SAES */}
        <nav style={{
          backgroundColor: '#e6e6e6',
          borderTop: '1px solid #cccccc',
          borderBottom: '2px solid #701b33',
          display: 'flex',
          alignItems: 'center',
          padding: '0 0.5rem',
          fontSize: '12px'
        }}>
          <button
            onClick={() => setActiveTopTab('INICIO')}
            style={{
              padding: '6px 16px',
              border: 'none',
              background: activeTopTab === 'INICIO' ? '#f2780c' : 'transparent',
              color: activeTopTab === 'INICIO' ? '#ffffff' : '#333333',
              fontWeight: activeTopTab === 'INICIO' ? 700 : 400,
              cursor: 'pointer',
              borderRight: '1px solid #d0d0d0'
            }}
          >
            Inicio
          </button>

          <button
            onClick={() => setActiveTopTab('ALUMNOS')}
            style={{
              padding: '6px 20px',
              border: 'none',
              backgroundColor: '#f2780c', // Pestaña naranja activa como en la imagen
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
              borderRight: '1px solid #d0d0d0'
            }}
          >
            Alumnos
          </button>

          <button
            onClick={() => setActiveTopTab('ACADEMICA')}
            style={{
              padding: '6px 16px',
              border: 'none',
              background: 'transparent',
              color: '#333333',
              cursor: 'pointer',
              borderRight: '1px solid #d0d0d0'
            }}
          >
            Académica
          </button>

          <button
            onClick={() => setActiveTopTab('REGLAMENTO')}
            style={{
              padding: '6px 16px',
              border: 'none',
              background: 'transparent',
              color: '#333333',
              cursor: 'pointer',
              borderRight: '1px solid #d0d0d0'
            }}
          >
            Reglamento
          </button>

          <button
            onClick={() => setActiveTopTab('AYUDA')}
            style={{
              padding: '6px 16px',
              border: 'none',
              background: 'transparent',
              color: '#333333',
              cursor: 'pointer',
              borderRight: '1px solid #d0d0d0'
            }}
          >
            Ayuda
          </button>

          <button
            onClick={() => setActiveTopTab('RECUPERAR')}
            style={{
              padding: '6px 16px',
              border: 'none',
              background: 'transparent',
              color: '#333333',
              cursor: 'pointer'
            }}
          >
            Recuperar Contraseña
          </button>
        </nav>

        {/* 4. MIGAJAS DE PAN (BREADCRUMB) */}
        <div style={{
          backgroundColor: '#f4f4f4',
          padding: '4px 1.5rem',
          fontSize: '11px',
          color: '#701b33',
          borderBottom: '1px solid #e0e0e0',
          fontWeight: 600
        }}>
          Inicio » Alumnos » Inscripción Actual » <span style={{ textDecoration: 'underline' }}>Calificaciones</span>
        </div>

        {/* 5. ESTRUCTURA PRINCIPAL DE 3 COLUMNAS */}
        <div style={{ display: 'flex', minHeight: '620px' }}>
          
          {/* COLUMNA IZQUIERDA: ÁRBOL LATERAL SAES */}
          <aside style={{
            width: '185px',
            backgroundColor: '#ededed',
            borderRight: '1px solid #d0d0d0',
            padding: '0.75rem 0',
            fontSize: '11px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Sección Datos Personales */}
              <div style={{ padding: '3px 10px', color: '#333333', fontWeight: 600 }}>
                Datos Personales
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Datos Personales
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Datos Médicos
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Datos Extracurricular
              </div>

              {/* Opciones directas */}
              <div style={{ padding: '3px 10px', color: '#333333', cursor: 'pointer' }}>
                Expediente Digital
              </div>
              <div style={{ padding: '3px 10px', color: '#333333', cursor: 'pointer' }}>
                Pase Digital
              </div>
              <div style={{ padding: '3px 10px', color: '#333333', cursor: 'pointer' }}>
                Cambios de Carrera
              </div>
              <div style={{ padding: '3px 10px', color: '#333333', cursor: 'pointer' }}>
                Red Académica ISISA
              </div>

              {/* Tramites */}
              <div style={{ padding: '3px 10px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                Tramites
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Solicitud
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Seguimiento
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Citas
              </div>

              {/* Datos académicos */}
              <div style={{ padding: '3px 10px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                Datos académicos
              </div>
              <div 
                onClick={() => setActiveSideMenu('KARDEX')}
                style={{ 
                  padding: '2px 10px 2px 20px', 
                  color: activeSideMenu === 'KARDEX' ? '#ffffff' : '#555555', 
                  backgroundColor: activeSideMenu === 'KARDEX' ? '#701b33' : 'transparent',
                  cursor: 'pointer' 
                }}
              >
                Kárdex
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Estado General
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Solicitud Dictamen
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Dictamen
              </div>

              {/* Inscripción Actual (CON CALIFICACIONES SELECCIONADO EN NARANJA) */}
              <div style={{ padding: '3px 10px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                Inscripción Actual
              </div>
              <div 
                onClick={() => setActiveSideMenu('HORARIO')}
                style={{ 
                  padding: '2px 10px 2px 20px', 
                  color: activeSideMenu === 'HORARIO' ? '#ffffff' : '#555555', 
                  backgroundColor: activeSideMenu === 'HORARIO' ? '#701b33' : 'transparent',
                  cursor: 'pointer' 
                }}
              >
                Horario
              </div>
              
              {/* Botón Calificaciones: idéntico al bloque naranja sólido de la foto */}
              <div 
                onClick={() => setActiveSideMenu('CALIFICACIONES')}
                style={{
                  padding: '4px 10px 4px 20px',
                  backgroundColor: activeSideMenu === 'CALIFICACIONES' ? '#f2780c' : 'transparent',
                  color: activeSideMenu === 'CALIFICACIONES' ? '#ffffff' : '#333333',
                  fontWeight: activeSideMenu === 'CALIFICACIONES' ? 700 : 400,
                  cursor: 'pointer'
                }}
              >
                Calificaciones
              </div>

              {/* Reinscripciones */}
              <div style={{ padding: '3px 10px', color: '#333333', fontWeight: 600, marginTop: '2px' }}>
                Reinscripciones
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Cita de Reinscripcion
              </div>
              <div style={{ padding: '2px 10px 2px 20px', color: '#555555', cursor: 'pointer' }}>
                Reinscripcion
              </div>

              {/* CELEX UPIICSA */}
              <div style={{ 
                marginTop: '10px', 
                padding: '6px 10px', 
                backgroundColor: '#ffffff', 
                borderTop: '1px solid #d0d0d0', 
                borderBottom: '1px solid #d0d0d0' 
              }}>
                <div style={{ fontWeight: 800, color: '#701b33', fontSize: '10px' }}>
                  CELEX UPIICSA
                </div>
                <div style={{ fontSize: '10px', color: '#666666' }}>
                  Cursos Extracurriculares
                </div>
              </div>
            </div>
          </aside>

          {/* COLUMNA CENTRAL: BOLETA OFICIAL CON TABLA NARANJA */}
          <main style={{
            flexGrow: 1,
            padding: '1.25rem 1.75rem',
            backgroundColor: '#ffffff'
          }}>
            
            {/* Tarjeta Central Oficial */}
            <div style={{
              border: '1px solid #d4d4d4',
              borderRadius: '2px',
              padding: '1.25rem 1.5rem',
              backgroundColor: '#ffffff'
            }}>
              
              {/* Mini encabezado interno del reporte (como en la foto) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '0.75rem'
              }}>
                <img 
                  src={logoIpn} 
                  alt="IPN" 
                  style={{ maxHeight: '58px', width: 'auto', objectFit: 'contain' }} 
                />

                <div style={{ textAlign: 'center', flexGrow: 1, padding: '0 1rem' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#111111',
                    lineHeight: 1.3,
                    textTransform: 'uppercase'
                  }}>
                    UNIDAD PROFESIONAL INTERDISCIPLINARIA DE INGENIERÍA<br />
                    Y<br />
                    CIENCIAS SOCIALES Y ADMINISTRATIVAS
                  </div>
                </div>

                <img 
                  src={logoUpiicsa} 
                  alt="UPIICSA" 
                  style={{ maxHeight: '54px', width: 'auto', objectFit: 'contain' }} 
                />
              </div>

              {/* Identificación del Alumno */}
              <div style={{
                marginBottom: '1.25rem',
                fontSize: '13px',
                lineHeight: 1.6
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, minWidth: '70px', letterSpacing: '0.5px' }}>BOLETA:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}>
                    {currentStudent.boleta}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, minWidth: '70px', letterSpacing: '0.5px' }}>NOMBRE:</span>
                  <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    {currentStudent.nombreCompleto}
                  </span>
                </div>
              </div>

              {/* Filtro / Selector de Vista (Curricular vs CELEX) */}
              <div className="no-print" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '11px', color: '#475569' }}>
                    Ver calificaciones de:
                  </span>
                  
                  <button
                    onClick={() => setViewMode('CURRICULAR')}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '3px',
                      border: viewMode === 'CURRICULAR' ? '1px solid #f2780c' : '1px solid #cbd5e1',
                      backgroundColor: viewMode === 'CURRICULAR' ? '#f2780c' : '#ffffff',
                      color: viewMode === 'CURRICULAR' ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Materias Curriculares (Captura Original SAES)
                  </button>

                  <button
                    onClick={() => setViewMode('CELEX')}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '3px',
                      border: viewMode === 'CELEX' ? '1px solid #701b33' : '1px solid #cbd5e1',
                      backgroundColor: viewMode === 'CELEX' ? '#701b33' : '#ffffff',
                      color: viewMode === 'CELEX' ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Módulo CELEX (Lenguas Extranjeras - Calificaciones de Maestros)
                  </button>

                  <button
                    onClick={() => setViewMode('INTEGRADO')}
                    style={{
                      padding: '3px 10px',
                      borderRadius: '3px',
                      border: viewMode === 'INTEGRADO' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: viewMode === 'INTEGRADO' ? '#0284c7' : '#ffffff',
                      color: viewMode === 'INTEGRADO' ? '#ffffff' : '#334155',
                      fontWeight: 700,
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Ambas Cargas (Curricular + Idiomas)
                  </button>
                </div>

                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Semestre Oficial: <strong>2026-2</strong>
                </div>
              </div>

              {/* LA TABLA SAES OFICIAL CON ENCABEZADO NARANJA VIBRANTE */}
              <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '11px',
                  fontFamily: 'Arial, sans-serif'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f2780c', // Exacto color naranja SAES de la foto
                      color: '#ffffff',
                      textAlign: 'left'
                    }}>
                      <th style={{ padding: '6px 8px', fontWeight: 800, width: '65px', textAlign: 'center' }}>
                        Gpo
                      </th>
                      <th style={{ padding: '6px 8px', fontWeight: 800, textAlign: 'left' }}>
                        Materia......................
                      </th>
                      <th style={{ padding: '6px 8px', fontWeight: 800, width: '65px', textAlign: 'center' }}>
                        1er Parcial
                      </th>
                      <th style={{ padding: '6px 8px', fontWeight: 800, width: '65px', textAlign: 'center' }}>
                        2o Parcial
                      </th>
                      <th style={{ padding: '6px 8px', fontWeight: 800, width: '65px', textAlign: 'center' }}>
                        3er Parcial
                      </th>
                      <th style={{ padding: '6px 8px', fontWeight: 800, width: '45px', textAlign: 'center' }}>
                        Ext
                      </th>
                      <th style={{ padding: '6px 8px', fontWeight: 800, width: '120px', textAlign: 'center' }}>
                        Final..........
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Filas Curriculares */}
                    {(viewMode === 'CURRICULAR' || viewMode === 'INTEGRADO') && CURRICULAR_COURSES_ALEJANDRO.map((c, idx) => (
                      <tr 
                        key={`cur-${idx}`}
                        style={{
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                      >
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333', fontWeight: 600 }}>
                          {c.gpo}
                        </td>
                        <td style={{ padding: '5px 8px', color: '#222222', textTransform: 'uppercase' }}>
                          {c.materia}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333' }}>
                          {c.p1}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333' }}>
                          {c.p2}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333' }}>
                          {c.p3}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333' }}>
                          {c.ext}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: c.finalScore !== '-' ? 700 : 400, color: '#111111' }}>
                          {c.finalText || '-'}
                        </td>
                      </tr>
                    ))}

                    {/* Filas CELEX UPIICSA (Con calificaciones asignadas por los profesores) */}
                    {(viewMode === 'CELEX' || viewMode === 'INTEGRADO') && celexTableRows.map((c, idx) => (
                      <tr 
                        key={`celex-${idx}`}
                        style={{
                          backgroundColor: viewMode === 'INTEGRADO' ? '#f0fdf4' : (idx % 2 === 0 ? '#ffffff' : '#fafafa'),
                          borderBottom: '1px solid #e2e8f0'
                        }}
                      >
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#701b33', fontWeight: 700 }}>
                          {c.gpo}
                        </td>
                        <td style={{ padding: '5px 8px', color: '#111111' }}>
                          <span style={{ fontWeight: 600 }}>{c.materia}</span>
                          {c.profesor && (
                            <span style={{ display: 'block', fontSize: '10px', color: '#64748b' }}>
                              Profesor(a): {c.profesor}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333', fontWeight: 600 }}>
                          {c.p1}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333', fontWeight: 600 }}>
                          {c.p2}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333', fontWeight: 600 }}>
                          {c.p3}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', color: '#333333' }}>
                          {c.ext}
                        </td>
                        <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: '#006633' }}>
                          {c.finalText}
                        </td>
                      </tr>
                    ))}

                    {/* Si no hay cursos CELEX para el alumno */}
                    {viewMode === 'CELEX' && celexTableRows.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: '#666666' }}>
                          No hay inscripciones CELEX registradas actualmente para la boleta {currentStudent.boleta}. Puedes cambiar a Materias Curriculares o seleccionar otro alumno.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cadena de Verificación Criptográfica Monospace (Idéntica a la imagen en azul) */}
              <div style={{
                fontFamily: 'Consolas, monospace',
                fontSize: '11px',
                color: '#0000cc', // Azul clásico monospace como en la captura
                wordBreak: 'break-all',
                backgroundColor: '#fafafa',
                padding: '6px 8px',
                border: '1px solid #ebebeb',
                marginBottom: '1rem',
                letterSpacing: '0.3px'
              }}>
                {generateVerificationString()}
              </div>

              {/* Botones de Acción al pie de la boleta */}
              <div className="no-print" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid #eeeeee',
                paddingTop: '0.75rem',
                fontSize: '11px'
              }}>
                <div style={{ color: '#666666' }}>
                  Fecha de consulta: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handlePrint}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '5px 12px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🖨️ Imprimir Boleta SAES
                  </button>

                  <button
                    onClick={onBackToSisae}
                    style={{
                      backgroundColor: '#6c1d45',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '5px 12px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Volver a Portal SISAE
                  </button>
                </div>
              </div>

            </div>
          </main>

          {/* COLUMNA DERECHA: ACCESOS RÁPIDOS (COMO EN LA FOTO) */}
          <aside style={{
            width: '150px',
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #d0d0d0',
            padding: '1.25rem 0.75rem',
            fontSize: '11px',
            flexShrink: 0
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: '12px',
              color: '#333333',
              marginBottom: '0.75rem',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: '4px'
            }}>
              Accesos rápidos
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#701b33' }}>
              <div 
                style={{ cursor: 'pointer', textDecoration: 'none' }}
                onClick={() => alert('Agenda Escolar Politécnica 2026-2: Inicio de clases 10 de Febrero, Fin de semestre 19 de Junio.')}
              >
                &gt;&gt; Agenda escolar
              </div>

              <div 
                style={{ cursor: 'pointer', textDecoration: 'none' }}
                onClick={() => alert('Horarios de clase registrados en el Edificio CELEX y Aulas de UPIICSA.')}
              >
                &gt;&gt; Horarios de clase
              </div>

              <div 
                style={{ cursor: 'pointer', textDecoration: 'none' }}
                onClick={() => alert('Periodo oficial de Exámenes a Título de Suficiencia (ETS): 22 al 26 de Junio.')}
              >
                &gt;&gt; Horarios de ETS
              </div>

              <div 
                style={{ cursor: 'pointer', textDecoration: 'none', color: '#f2780c', fontWeight: 700 }}
                onClick={onBackToSisae}
              >
                &gt;&gt; Convocatoria CELEX
              </div>

              <div 
                style={{ cursor: 'pointer', textDecoration: 'none', color: '#64748b', marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}
                onClick={onBackToSisae}
              >
                &gt;&gt; Modo SISAE 2.0
              </div>
            </div>
          </aside>

        </div>

        {/* 6. PIE DE PÁGINA CLÁSICO SAES */}
        <footer style={{
          backgroundColor: '#eeeeee',
          borderTop: '1px solid #d0d0d0',
          padding: '0.75rem 1.5rem',
          textAlign: 'center',
          fontSize: '11px',
          color: '#555555'
        }}>
          Instituto Politécnico Nacional • Unidad Profesional Interdisciplinaria de Ingeniería y Ciencias Sociales y Administrativas (UPIICSA)<br />
          Sistema de Administración Escolar (SAES) • Módulo Integrado CELEX / UDI UPIICSA • Versión Web Segura
        </footer>

      </div>
    </div>
  );
};
