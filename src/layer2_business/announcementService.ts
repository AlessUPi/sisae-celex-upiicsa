// ============================================================================
// CAPA 2: LÓGICA DE NEGOCIO - DIFUSIÓN Y ANUNCIOS (ANNOUNCEMENT SERVICE)
// ============================================================================
// Centraliza la difusión de convocatorias culturales, eventos y avisos urgentes
// para combatir la desinformación en la comunidad de la UPIICSA.

import { dbRepository } from '../layer3_data/dbRepository';
import { layerLogger } from './layerLogger';
import type { Announcement, AnnouncementPriority } from '../types';

class AnnouncementService {
  public getAllAnnouncements(): Announcement[] {
    const list = dbRepository.getAnnouncements();
    // Ordenar: primero fijados, luego urgentes/convocatorias, luego por fecha más reciente
    return [...list].sort((a, b) => {
      if (a.fijado && !b.fijado) return -1;
      if (!a.fijado && b.fijado) return 1;
      return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime();
    });
  }

  public getActiveAnnouncements(): Announcement[] {
    return this.getAllAnnouncements().filter(a => a.activa);
  }

  public getUrgentAnnouncements(): Announcement[] {
    return this.getActiveAnnouncements().filter(a => a.prioridad === 'URGENTE');
  }

  public createOrUpdateAnnouncement(data: Partial<Announcement>): {
    success: boolean;
    message: string;
    announcement?: Announcement;
  } {
    if (!data.titulo || data.titulo.trim().length < 5) {
      return { success: false, message: 'El título del comunicado debe tener al menos 5 caracteres.' };
    }
    if (!data.contenido || data.contenido.trim().length < 10) {
      return { success: false, message: 'El contenido del aviso debe estar redactado con mayor detalle.' };
    }

    const isNew = !data.id;
    const ann: Announcement = {
      id: data.id || 'ann-' + Date.now(),
      titulo: data.titulo.trim(),
      resumen: data.resumen ? data.resumen.trim() : data.titulo.trim(),
      contenido: data.contenido.trim(),
      prioridad: (data.prioridad as AnnouncementPriority) || 'GENERAL',
      autor: data.autor ? data.autor.trim() : 'Coordinación CELEX & Unidad de Informática UPIICSA',
      fechaPublicacion: data.fechaPublicacion || new Date().toISOString().split('T')[0],
      imagenUrl: data.imagenUrl || '',
      activa: data.activa !== undefined ? data.activa : true,
      fijado: data.fijado !== undefined ? data.fijado : false
    };

    layerLogger.addLog(
      'CAPA_3_DATOS',
      isNew ? 'INSERT_INTO_ANUNCIOS' : 'UPDATE_ANUNCIOS',
      `${isNew ? 'Publicando' : 'Actualizando'} aviso: "${ann.titulo}" (${ann.prioridad})`,
      ann,
      'SUCCESS',
      3
    );

    const saved = dbRepository.saveAnnouncement(ann);

    layerLogger.addLog(
      'CAPA_2_NEGOCIO',
      'ANNOUNCEMENT_PUBLISHED',
      `Comunicado oficial listo para difusión en el portal: ${saved.titulo}`,
      { id: saved.id }
    );

    return {
      success: true,
      message: isNew ? '¡Comunicado oficial publicado con éxito!' : '¡Aviso actualizado correctamente!',
      announcement: saved
    };
  }

  public deleteAnnouncement(id: string): { success: boolean; message: string } {
    layerLogger.addLog(
      'CAPA_3_DATOS',
      'DELETE_FROM_ANUNCIOS',
      `Eliminando aviso de difusión ID: ${id}`
    );
    dbRepository.deleteAnnouncement(id);
    return { success: true, message: 'Comunicado retirado de la cartelera.' };
  }
}

export const announcementService = new AnnouncementService();
