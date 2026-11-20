// ============================================================================
// SISTEMA DE ADMINISTRACIÓN ESCOLAR (SISAE) – MÓDULO CELEX UPIICSA IPN
// CAPA 2: LÓGICA DE NEGOCIO - AUTENTICACIÓN Y ROLES (AUTH SERVICE)
// ============================================================================

import { dbRepository } from '../layer3_data/dbRepository';
import { layerLogger } from './layerLogger';
import type { AuthSession, Student, CareerUPIICSA, TurnoType, TipoAspirante } from '../types';

const SESSION_STORAGE_KEY = 'sisae_celex_auth_session';

class AuthService {
  private session: AuthSession = {
    user: null,
    isAuthenticated: false
  };

  private listeners: ((session: AuthSession) => void)[] = [];

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        this.session = JSON.parse(stored);
        layerLogger.addLog(
          'CAPA_2_NEGOCIO',
          'RESTORE_SESSION',
          `Sesión restaurada para: ${this.session.user?.nombre} (${this.session.user?.rol})`,
          { userId: this.session.user?.id },
          'SUCCESS',
          2
        );
      }
    } catch {
      this.session = { user: null, isAuthenticated: false };
    }
  }

  public getSession(): AuthSession {
    return this.session;
  }

  public subscribe(listener: (session: AuthSession) => void): () => void {
    this.listeners.push(listener);
    listener(this.session);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.session));
    this.listeners.forEach(l => l(this.session));
  }

  // -------------------------------------------------------------------------
  // REGLAS DE VALIDACIÓN DE NEGOCIO
  // -------------------------------------------------------------------------
  public validateBoleta(boleta: string): { valid: boolean; error?: string } {
    const cleanBoleta = boleta.trim();
    if (!cleanBoleta) {
      return { valid: false, error: 'La boleta es requerida para estudiantes del IPN.' };
    }
    const boletaRegex = /^\d{10}$/;
    if (!boletaRegex.test(cleanBoleta)) {
      return {
        valid: false,
        error: 'La boleta IPN debe contener exactamente 10 dígitos numéricos (ej. 2023600123).'
      };
    }
    return { valid: true };
  }

  public validateRfc(rfc: string): { valid: boolean; error?: string } {
    const cleanRfc = rfc.trim().toUpperCase();
    if (!cleanRfc) {
      return { valid: false, error: 'El RFC es obligatorio para el registro en CELEX.' };
    }
    // Formato estándar de RFC mexicano (12 o 13 caracteres con homoclave)
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(cleanRfc)) {
      return {
        valid: false,
        error: 'El RFC debe contener entre 12 y 13 caracteres alfanuméricos válidos (ej. HERA030415XX8).'
      };
    }
    return { valid: true };
  }

  public validateCurp(curp: string): { valid: boolean; error?: string } {
    const cleanCurp = curp.trim().toUpperCase();
    if (!cleanCurp) {
      return { valid: false, error: 'La clave de identificación es obligatoria.' };
    }
    return { valid: true };
  }

  // -------------------------------------------------------------------------
  // LOGIN DE USUARIO (ALUMNO O ADMINISTRADOR UDI)
  // -------------------------------------------------------------------------
  public login(identificador: string, password?: string): { success: boolean; message: string; session?: AuthSession } {
    const cleanId = identificador.trim();

    layerLogger.addLog(
      'CAPA_2_NEGOCIO',
      'AUTH_LOGIN_REQUEST',
      `Intento de autenticación para identificador: ${cleanId}`,
      { identificador: cleanId }
    );

    // 1. Caso Administrador / Coordinador UDI - CELEX UPIICSA
    if (cleanId.toLowerCase() === 'admin' || cleanId.toLowerCase() === 'coordinador' || cleanId.toLowerCase() === 'udi') {
      if (!password || password === 'admin123' || password === 'admin') {
        this.session = {
          user: {
            id: 'admin-udi-celex-01',
            identificador: 'admin',
            nombre: 'Ing. Mario Bizarro Moreno',
            correo: 'udi.celex.upiicsa@ipn.mx',
            rol: 'ADMIN',
            tipoAspirante: 'INTERNO_IPN'
          },
          token: `jwt-sisae-udi-${Date.now()}`,
          isAuthenticated: true
        };

        dbRepository.addAuditLog({
          usuario: 'Ing. Mario Bizarro Moreno (Admin UDI)',
          rol: 'ADMIN',
          accion: 'LOGIN_ADMIN_SUCCESS',
          ipOrigen: '148.204.64.2 (UDI Nodo Central)',
          detalles: 'Acceso autenticado al panel administrativo del módulo CELEX.',
          modulo: 'CELEX',
          nivelSeguridad: 'SUCCESS'
        });

        this.notify();
        return { success: true, message: 'Bienvenido al panel del Coordinador UDI - CELEX', session: this.session };
      } else {
        return { success: false, message: 'Contraseña de administrador incorrecta (Usa "admin123").' };
      }
    }

    // 2. Caso Alumno / Aspirante (por Boleta o por RFC o CURP o Correo)
    const student = dbRepository.getStudents().find(
      s => s.boleta.toLowerCase() === cleanId.toLowerCase() ||
           (s.rfc && s.rfc.toLowerCase() === cleanId.toLowerCase()) ||
           (s.curp && s.curp.toLowerCase() === cleanId.toLowerCase()) ||
           s.correo.toLowerCase() === cleanId.toLowerCase()
    );

    if (student) {
      this.session = {
        user: {
          id: student.id,
          identificador: student.boleta,
          rfc: student.rfc,
          curp: student.curp,
          nombre: student.nombreCompleto,
          correo: student.correo,
          rol: 'ALUMNO',
          tipoAspirante: student.tipoAspirante,
          carrera: student.carrera,
          semestre: student.semestre,
          turno: student.turno
        },
        token: `jwt-sisae-std-${Date.now()}`,
        isAuthenticated: true
      };

      dbRepository.addAuditLog({
        usuario: `${student.nombreCompleto} (${student.boleta})`,
        rol: 'ALUMNO',
        accion: 'LOGIN_STUDENT_SUCCESS',
        ipOrigen: '148.204.67.12 (Red UPIICSA)',
        detalles: `Inicio de sesión exitoso en el portal del alumno CELEX (${student.tipoAspirante}).`,
        modulo: 'CELEX',
        nivelSeguridad: 'INFO'
      });

      this.notify();
      return { success: true, message: `Bienvenido(a), ${student.nombreCompleto}`, session: this.session };
    }

    return {
      success: false,
      message: 'No se encontró ningún alumno con esa Boleta, RFC o Correo. Si es tu primera vez, puedes registrarte o utilizar un acceso rápido de prueba.'
    };
  }

  // -------------------------------------------------------------------------
  // REGISTRO DE NUEVO ALUMNO / ASPIRANTE (CON RFC)
  // -------------------------------------------------------------------------
  public registerStudent(data: {
    tipoAspirante: TipoAspirante;
    boleta?: string;
    rfc: string;
    curp?: string;
    nombreCompleto: string;
    correo: string;
    telefono: string;
    carrera: CareerUPIICSA;
    semestre?: number;
    turno: TurnoType;
    password?: string;
  }): { success: boolean; message: string; student?: Student } {
    if (data.tipoAspirante === 'INTERNO_IPN' && data.boleta) {
      const boletaValidation = this.validateBoleta(data.boleta);
      if (!boletaValidation.valid) {
        return { success: false, message: boletaValidation.error! };
      }
    }

    const rfcValidation = this.validateRfc(data.rfc);
    if (!rfcValidation.valid) {
      return { success: false, message: rfcValidation.error! };
    }

    const cleanBoleta = data.tipoAspirante === 'INTERNO_IPN' 
      ? (data.boleta || '').trim() 
      : `EXT-${data.rfc.trim().toUpperCase().substring(0, 10)}`;

    const existing = dbRepository.getStudents().find(s => 
      s.boleta.toLowerCase() === cleanBoleta.toLowerCase() ||
      (s.rfc && s.rfc.toUpperCase() === data.rfc.trim().toUpperCase())
    );
    if (existing) {
      return { success: false, message: 'Ya existe un usuario registrado con esa Boleta o RFC.' };
    }

    const newStudent: Student = {
      id: `alu-${Date.now()}`,
      boleta: cleanBoleta,
      rfc: data.rfc.trim().toUpperCase(),
      curp: data.curp ? data.curp.trim().toUpperCase() : undefined,
      nombreCompleto: data.nombreCompleto.trim(),
      correo: data.correo.trim().toLowerCase(),
      telefono: data.telefono.trim(),
      tipoAspirante: data.tipoAspirante,
      carrera: data.carrera,
      semestre: data.semestre || 1,
      turno: data.turno,
      nivelesAcreditados: [],
      creditosAcumulados: 0,
      password: data.password || 'ipn12345',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    dbRepository.saveStudent(newStudent);

    this.session = {
      user: {
        id: newStudent.id,
        identificador: newStudent.boleta,
        rfc: newStudent.rfc,
        curp: newStudent.curp,
        nombre: newStudent.nombreCompleto,
        correo: newStudent.correo,
        rol: 'ALUMNO',
        tipoAspirante: newStudent.tipoAspirante,
        carrera: newStudent.carrera,
        semestre: newStudent.semestre,
        turno: newStudent.turno
      },
      token: `jwt-sisae-new-${Date.now()}`,
      isAuthenticated: true
    };

    dbRepository.addAuditLog({
      usuario: `${newStudent.nombreCompleto} (${newStudent.boleta})`,
      rol: 'ALUMNO',
      accion: 'REGISTRO_NUEVO_ASPIRANTE',
      ipOrigen: '148.204.67.12',
      detalles: `Nuevo aspirante ${data.tipoAspirante} registrado en SISAE-CELEX.`,
      modulo: 'CELEX',
      nivelSeguridad: 'SUCCESS'
    });

    this.notify();
    return { success: true, message: 'Registro institucional completado exitosamente.', student: newStudent };
  }

  // -------------------------------------------------------------------------
  // INICIOS RÁPIDOS PARA DEMOSTRACIÓN INSTITUCIONAL
  // -------------------------------------------------------------------------
  public quickDemoLogin(role: 'ALUMNO_INTERNO' | 'ALUMNO_EXTERNO' | 'ADMIN' | 'ALUMNO') {
    if (role === 'ADMIN') {
      this.login('admin', 'admin123');
    } else if (role === 'ALUMNO_EXTERNO') {
      this.login('ROAA980512RB1');
    } else {
      // Alumno interno por defecto
      this.login('2023600123');
    }
  }

  public logout() {
    const prevUser = this.session.user?.nombre || 'Usuario';
    this.session = { user: null, isAuthenticated: false };
    localStorage.removeItem(SESSION_STORAGE_KEY);

    dbRepository.addAuditLog({
      usuario: prevUser,
      rol: 'ALUMNO',
      accion: 'LOGOUT',
      ipOrigen: '148.204.67.12',
      detalles: 'Cierre de sesión de usuario en SISAE-CELEX.',
      modulo: 'CELEX',
      nivelSeguridad: 'INFO'
    });

    this.notify();
  }
}

export const authService = new AuthService();
