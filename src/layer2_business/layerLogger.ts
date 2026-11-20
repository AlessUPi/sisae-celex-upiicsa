// ============================================================================
// CAPA 2: BITÁCORA Y MONITOR DE TRANSACCIONES ENTRE CAPAS (LAYER LOGGER)
// ============================================================================
// Registra en tiempo real cada interacción entre la Capa 1 (Presentación),
// Capa 2 (Negocio) y Capa 3 (Datos) para fines de auditoría y demostración técnica.

import type { LayerTransactionLog, LayerType } from '../types';

class LayerLoggerService {
  private logs: LayerTransactionLog[] = [];
  private listeners: ((logs: LayerTransactionLog[]) => void)[] = [];

  constructor() {
    this.addLog(
      'CAPA_2_NEGOCIO',
      'SYSTEM_INIT',
      'Servicios de Negocio y Data Repository inicializados correctamente',
      { timestamp: new Date().toISOString() },
      'SUCCESS',
      1
    );
  }

  public addLog(
    capa: LayerType,
    accion: string,
    detalles: string,
    payload?: any,
    estado: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS',
    tiempoEjecucionMs: number = 0
  ) {
    const newLog: LayerTransactionLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('es-MX', { hour12: false }) + '.' + new Date().getMilliseconds(),
      capa,
      accion,
      detalles,
      payload,
      estado,
      tiempoEjecucionMs
    };

    this.logs.unshift(newLog);
    if (this.logs.length > 200) {
      this.logs.pop();
    }

    this.notify();
  }

  public getLogs(): LayerTransactionLog[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.notify();
  }

  public subscribe(listener: (logs: LayerTransactionLog[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.logs]);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l([...this.logs]));
  }
}

export const layerLogger = new LayerLoggerService();
