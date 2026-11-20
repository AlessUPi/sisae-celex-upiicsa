# SISAE – Módulo CELEX (UPIICSA - IPN)
## Sistema de Administración Escolar para Cursos Extracurriculares de Lenguas Extranjeras

[![Instituto Politécnico Nacional](https://img.shields.io/badge/IPN-UPIICSA-6c1d45.svg)](https://www.upiicsa.ipn.mx)
[![Licenciatura en Ciencias de la Informática](https://img.shields.io/badge/Carrera-Ciencias_de_la_Informática-c59b27.svg)](https://www.upiicsa.ipn.mx)
[![Grupo](https://img.shields.io/badge/Grupo-8CM81-0284c7.svg)](#)
[![Base de Datos](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E.svg)](https://supabase.com)
[![Despliegue Producción](https://img.shields.io/badge/Producción-Vercel-000000.svg)](https://sisae-celex.vercel.app/celex)

---

## 🌐 Enlace Oficial de Producción
**Acceso al sistema en vivo:** [https://sisae-celex.vercel.app/celex](https://sisae-celex.vercel.app/celex)

---

## 📌 1. Información General del Proyecto
* **Institución:** Instituto Politécnico Nacional (IPN)
* **Unidad Académica:** Unidad Profesional Interdisciplinaria de Ingeniería y Ciencias Sociales y Administrativas (UPIICSA)
* **Área Técnica Responsable:** Unidad de Informática (UDI) / Coordinación CELEX
* **Carrera:** Licenciatura en Ciencias de la Informática
* **Secuencia / Grupo:** 8CM81
* **Profesor:** Romero Hernández Antonio
* **Equipo de Desarrollo:**
  * Avelleyra Almanza Ivan Pablo
  * Avila Morales Alejandro
  * Hernández González Fernanda Joanna
  * Hernández Rodríguez Daniel
  * Miranda Cárdenas Juan Carlos

---

## 🚀 2. Propósito y Problemática Atendida
El proyecto **SISAE – Módulo CELEX** digitaliza y centraliza la administración escolar y los trámites de los Cursos Extracurriculares de Lenguas Extranjeras (CELEX) en la UPIICSA:
1. **Atención a dos perfiles de usuarios:** Aspirantes internos del IPN (con validación de boleta de 10 dígitos y RFC) y usuarios externos (con RFC obligatorio y validación de identificación).
2. **Pre-registro en línea en 4 pasos:** Captura de datos personales, selección de idioma (Inglés, Francés, Alemán, Italiano) y horario, carga digital de identificación y comprobante de depósito bancario (Convenio BBVA CIE IPN 1849201).
3. **Bandeja Centralizada de Validación (Mesa de Control UDI):**
   * Revisión estructurada de vouchers bancarios y folios de autorización.
   * Flujo condicional con emisión de **Observaciones** para corrección por el aspirante en caso de comprobantes ilegibles o datos incompletos.
   * **Aprobación y Asignación:** Asignación de grupo, aula/laboratorio multimedia, profesor y horario, generando la **Cédula Oficial de Inscripción con código QR verificable**.
   * Notificaciones automáticas de acuse y resolución mediante Correo Electrónico y WhatsApp.
4. **Visión Multi-Módulo del SISAE:**
   Diseñado como base institucional reutilizable que en sus siguientes etapas integrará los módulos de **Seminarios de Titulación** y **Cursos y Diplomados**.

---

## 🛡️ 3. Estándares Técnicos y Normativos de Seguridad (UDI)
Implementado bajo los requerimientos normativos de la Unidad de Informática:
* **Seguridad en Red y Tránsito:** Cifrado HTTPS / TLS 1.3 con directivas estrictas de Content Security Policy (CSP).
* **Autenticación y Control de Acceso:** Tokens de sesión (JWT) y Control de Acceso Basado en Roles (RBAC) para Alumnos Internos, Externos y Administradores UDI.
* **Integridad de Datos:** Sanitización estricta contra inyección SQL y XSS, Rate Limiting contra ataques de fuerza bruta.
* **Auditoría:** Registro inmutable de eventos de acceso, revisión de vouchers, emisión de observaciones y asignación de grupos en la bitácora institucional.

---

## 💻 4. Ejecución y Despliegue en Producción

### Requisitos Previos:
* Node.js v18+ y npm v9+

### Instalación de dependencias:
```bash
npm install
```

### Ejecución en Modo Desarrollo:
```bash
npm run dev
```

### Compilación para Producción (Production Build):
```bash
npm run build
```
Los archivos optimizados para producción se generan en la carpeta `dist/`.

### Prueba local del Bundle de Producción:
```bash
npm run preview
```

### Despliegue en Firebase Hosting:
Configurado en `firebase.json` con los sitios `celex-upiicsa` y `sisae-celex-upiicsa`:
```bash
firebase deploy --only hosting:celex-upiicsa
```

### Despliegue en Vercel:
Configurado en `vercel.json` con rewrites automáticos para SPA y soporte de rutas bajo `/celex`.

---

## 📂 5. Arquitectura de 3 Capas
* **Capa 1 (Presentación):** React 19, Vite, Lucide Icons, Canvas Confetti, CSS Moderno con variables institucionales del IPN (`#6c1d45`, `#c59b27`).
* **Capa 2 (Lógica de Negocio):**
  * `authService.ts`: Validación de boleta (10 dígitos), RFC oficial con homoclave, sesiones y tokens.
  * `enrollmentService.ts`: Pre-registro, validación administrativa, asignaciones y notificaciones.
  * `activityService.ts`: Filtrado de idiomas, cálculo de cupos y métricas.
  * `announcementService.ts`: Difusión de convocatorias y exámenes diagnósticos.
* **Capa 3 (Datos y Persistencia):**
  * `dbRepository.ts`: Repositorio de datos con persistencia híbrida en tiempo real hacia **PostgreSQL en Supabase**.
  * `supabaseClient.ts`: Conexión cliente segura mediante `@supabase/supabase-js`.
  * `supabase_schema.sql`: Script DDL/DML relacional completo con tablas `alumnos_celex`, `solicitudes_preregistro`, `cursos_idiomas_celex`, `inscripciones_acreditadas` y `bitacora_auditoria_udi`.
  * `dbSeed.ts`: Semillas de cursos (Inglés, Francés, Alemán, Italiano), docentes certificados y registros iniciales.
