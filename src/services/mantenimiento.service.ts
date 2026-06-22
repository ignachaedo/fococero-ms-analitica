/**
 * @fileoverview Servicio de mantenimiento del data warehouse analítico.
 * Refresca vistas materializadas y purga cachés globales para mantener
 * la consistencia de los datos agregados.
 */

import { analiticaRepository } from "../repositories/analitica.repository";
import { reportesCache } from "../cache/reportes.cache";

class MantenimientoService {
  /**
   * Refresca las vistas materializadas e invalida los cachés globales.
   */
  public async sincronizarDatosBase(): Promise<void> {
    await analiticaRepository.refrescarVistasMaterializadas();
    await reportesCache.invalidarCachesGlobales();
  }

  /**
   * Invalida todos los cachés globales del sistema.
   */
  public async purgarCaches(): Promise<void> {
    await reportesCache.invalidarCachesGlobales();
  }
}

export const mantenimientoService = new MantenimientoService();
