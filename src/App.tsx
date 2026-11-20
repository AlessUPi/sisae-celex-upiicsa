import { useState, useEffect } from 'react';
import { Navbar } from './layer1_presentation/components/Navbar';
import { Footer } from './layer1_presentation/components/Footer';
import { HomePage } from './layer1_presentation/pages/HomePage';
import { StudentDashboard } from './layer1_presentation/pages/StudentDashboard';
import { AdminDashboard } from './layer1_presentation/pages/AdminDashboard';
import { AuthModal } from './layer1_presentation/components/AuthModal';
import { ActivityDetailModal } from './layer1_presentation/components/ActivityDetailModal';
import { PreRegistrationModal } from './layer1_presentation/components/PreRegistrationModal';
import { EnrollmentReceiptModal } from './layer1_presentation/components/EnrollmentReceiptModal';
import { LayerInspectorModal } from './layer1_presentation/components/LayerInspectorModal';
import { AnnouncementsSection } from './layer1_presentation/components/AnnouncementsSection';
import { WeeklyScheduleView } from './layer1_presentation/components/WeeklyScheduleView';

import { authService } from './layer2_business/authService';
import { activityService } from './layer2_business/activityService';
import { announcementService } from './layer2_business/announcementService';
import { dbRepository } from './layer3_data/dbRepository';
import type { 
  AuthSession, 
  CelexCourse, 
  Enrollment, 
  Announcement, 
  Teacher, 
  Student, 
  PreRegistrationRequest 
} from './types';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [session, setSession] = useState<AuthSession>(authService.getSession());
  const [activeTab, setActiveTab] = useState<string>('inicio');

  // Datos reactivos de Capa 3 (Repositorio)
  const [activities, setActivities] = useState<CelexCourse[]>(activityService.getAllActivities());
  const [teachers, setTeachers] = useState<Teacher[]>(dbRepository.getTeachers());
  const [students, setStudents] = useState<Student[]>(dbRepository.getStudents());
  const [enrollments, setEnrollments] = useState<Enrollment[]>(dbRepository.getEnrollments());
  const [announcements, setAnnouncements] = useState<Announcement[]>(announcementService.getAllAnnouncements());
  const [requests, setRequests] = useState<PreRegistrationRequest[]>(dbRepository.getRequests());

  // Estados de Modales
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPreRegisterModalOpen, setIsPreRegisterModalOpen] = useState(false);
  const [isLayerInspectorOpen, setIsLayerInspectorOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<CelexCourse | null>(null);
  const [receiptEnrollment, setReceiptEnrollment] = useState<Enrollment | null>(null);

  // Subscripciones a servicios y sincronización de URL celex
  useEffect(() => {
    // Sincronizar ruta inicial si contiene /celex/ o hash
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase().replace('#', '');
    
    if (hash === 'alumno' || path.endsWith('/alumno')) {
      setActiveTab('alumno');
    } else if (hash === 'admin' || path.endsWith('/admin')) {
      setActiveTab('admin');
    } else if (hash === 'horarios' || path.endsWith('/horarios')) {
      setActiveTab('horarios');
    } else if (hash === 'convocatorias' || path.endsWith('/convocatorias')) {
      setActiveTab('convocatorias');
    } else if (hash === 'registro' || path.endsWith('/registro')) {
      setIsPreRegisterModalOpen(true);
    }

    const unsubAuth = authService.subscribe(setSession);
    const unsubDb = dbRepository.subscribe(() => {
      setActivities(activityService.getAllActivities());
      setTeachers(dbRepository.getTeachers());
      setStudents(dbRepository.getStudents());
      setEnrollments(dbRepository.getEnrollments());
      setAnnouncements(announcementService.getAllAnnouncements());
      setRequests(dbRepository.getRequests());
    });

    const handlePopState = () => {
      const h = window.location.hash.toLowerCase().replace('#', '');
      if (h) setActiveTab(h);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubAuth();
      unsubDb();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Efecto para clase del body en Modo Oscuro
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  const refreshData = () => {
    setActivities(activityService.getAllActivities());
    setTeachers(dbRepository.getTeachers());
    setStudents(dbRepository.getStudents());
    setEnrollments(dbRepository.getEnrollments());
    setAnnouncements(announcementService.getAllAnnouncements());
    setRequests(dbRepository.getRequests());
  };

  // Manejo de Pre-registro directo desde catálogo
  const handleStartPreRegister = (course?: CelexCourse) => {
    setSelectedActivity(course || null);
    setIsPreRegisterModalOpen(true);
  };

  const handleLogout = () => {
    authService.logout();
    setActiveTab('inicio');
  };

  const handleQuickDemoStudent = () => {
    authService.quickDemoLogin('ALUMNO_INTERNO');
    setActiveTab('alumno');
  };

  const handleQuickDemoExterno = () => {
    authService.quickDemoLogin('ALUMNO_EXTERNO');
    setActiveTab('alumno');
  };

  const handleQuickDemoAdmin = () => {
    authService.quickDemoLogin('ADMIN');
    setActiveTab('admin');
  };

  // IDs de actividades en las que el usuario actual está inscrito
  const myEnrolledIds = session.user?.rol === 'ALUMNO'
    ? enrollments
        .filter(e => e.alumnoBoleta === session.user?.identificador && e.estado !== 'CANCELADO')
        .map(e => e.actividadId)
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Barra de Navegación Institucional */}
      <Navbar
        session={session}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenPreRegister={() => handleStartPreRegister()}
        onOpenLayerInspector={() => setIsLayerInspectorOpen(true)}
        onLogout={handleLogout}
      />

      {/* Contenido Principal según la pestaña activa */}
      <main style={{ flexGrow: 1 }}>
        {activeTab === 'inicio' && (
          <HomePage
            session={session}
            activities={activities}
            announcements={announcements}
            totalRequests={requests.length}
            onViewActivityDetails={(act) => setSelectedActivity(act)}
            onEnrollDirectly={(act) => handleStartPreRegister(act)}
            onOpenPreRegister={() => handleStartPreRegister()}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onQuickDemoStudent={handleQuickDemoStudent}
            onQuickDemoExterno={handleQuickDemoExterno}
            onQuickDemoAdmin={handleQuickDemoAdmin}
            enrolledActivityIds={myEnrolledIds}
          />
        )}

        {activeTab === 'convocatorias' && (
          <div style={{ padding: '2rem 0' }}>
            <AnnouncementsSection announcements={announcements} />
          </div>
        )}

        {activeTab === 'horarios' && (
          <div style={{ padding: '3rem 0' }}>
            <div className="container">
              <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Horario Oficial de Lenguas Extranjeras (CELEX)</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Consulta los salones en el Edificio CELEX, laboratorios de cómputo y horarios para el semestre 2026-2 en la UPIICSA.
                </p>
              </div>
              <WeeklyScheduleView
                activities={activities}
                onSelectActivity={(act) => setSelectedActivity(act)}
              />
            </div>
          </div>
        )}

        {activeTab === 'alumno' && (
          <StudentDashboard
            session={session}
            activities={activities}
            enrollments={enrollments}
            onViewActivityDetails={(act) => setSelectedActivity(act)}
            onRefreshData={refreshData}
            onOpenPreRegister={() => handleStartPreRegister()}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            activities={activities}
            teachers={teachers}
            students={students}
            enrollments={enrollments}
            announcements={announcements}
            onRefreshData={refreshData}
            onOpenLayerInspector={() => setIsLayerInspectorOpen(true)}
          />
        )}
      </main>

      {/* Pie de Página Institucional */}
      <Footer />

      {/* MODAL DE AUTENTICACIÓN Y REGISTRO */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          const sess = authService.getSession();
          if (sess.user?.rol === 'ADMIN') {
            setActiveTab('admin');
          } else if (sess.user?.rol === 'ALUMNO') {
            setActiveTab('alumno');
          }
        }}
      />

      {/* MODAL DE PRE-REGISTRO EN LÍNEA (4 PASOS CON VALIDACIÓN BANCARIA) */}
      <PreRegistrationModal
        isOpen={isPreRegisterModalOpen}
        onClose={() => setIsPreRegisterModalOpen(false)}
        preSelectedCourse={selectedActivity}
        courses={activities}
        session={session}
        onSuccess={() => {
          refreshData();
          if (session.isAuthenticated) {
            setActiveTab('alumno');
          }
        }}
      />

      {/* MODAL DE DETALLES DEL CURSO DE IDIOMA */}
      <ActivityDetailModal
        activity={selectedActivity}
        session={session}
        isEnrolled={selectedActivity ? myEnrolledIds.includes(selectedActivity.id) : false}
        onClose={() => setSelectedActivity(null)}
        onStartPreRegister={(course) => handleStartPreRegister(course)}
        onOpenAuth={() => {
          setSelectedActivity(null);
          setIsAuthModalOpen(true);
        }}
      />

      {/* MODAL DE FICHA OFICIAL CON CÓDIGO QR */}
      <EnrollmentReceiptModal
        enrollment={receiptEnrollment}
        onClose={() => setReceiptEnrollment(null)}
      />

      {/* MODAL INSPECTOR DE ARQUITECTURA SISAE Y ESTÁNDARES UDI */}
      <LayerInspectorModal
        isOpen={isLayerInspectorOpen}
        onClose={() => setIsLayerInspectorOpen(false)}
      />
    </div>
  );
}
