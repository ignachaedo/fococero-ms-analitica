/**
 * @fileoverview Servicio de obtención de filtros dinámicos para el dashboard.
 * Proporciona listas de categorías, orígenes y severidades únicas,
 * con caché Redis para evitar consultas repetitivas a la base de datos.
 */

import { analiticaRepository } from "../repositories/analitica.repository";
import { redisCache } from "../config/redis";
import { RedisMutex } from "../cache/redis.mutex";

class FiltrosService {
  private async obtenerFiltroGenerico(
    clave: string,
    fetchFn: () => Promise<string[]>,
  ): Promise<string[]> {
    const cacheKey = `analitica:filtros:${clave}`;
    const lockKey = `lock:filtros:${clave}`;
    const client = redisCache["client"];

    const cached = await client.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const acquired = await RedisMutex.adquirirBloqueo(lockKey, 10);
    if (!acquired) {
      await RedisMutex.esperarBloqueo(lockKey);
      const retryCached = await client.get(cacheKey);
      if (retryCached) return JSON.parse(retryCached);
      throw new Error("Timeout al sincronizar filtros desde caché");
    }

    try {
      const data = await fetchFn();
      await client.setEx(cacheKey, 3600, JSON.stringify(data));
      return data;
    } finally {
      await RedisMutex.liberarBloqueo(lockKey);
    }
  }

  /**
   * Obtiene la lista de categorías de incidentes únicas.
   *
   * @returns Array de nombres de categorías ordenados alfabéticamente
   */
  public async listarCategorias(): Promise<string[]> {
    return this.obtenerFiltroGenerico("categorias", () =>
      analiticaRepository.obtenerCategoriasUnicas(),
    );
  }

  /**
   * Obtiene la lista de orígenes de incidentes únicos.
   *
   * @returns Array de nombres de orígenes ordenados alfabéticamente
   */
  public async listarOrigenes(): Promise<string[]> {
    return this.obtenerFiltroGenerico("origenes", () =>
      analiticaRepository.obtenerOrigenesUnicos(),
    );
  }

  /**
   * Obtiene la lista de niveles de severidad únicos.
   *
   * @returns Array de niveles de severidad ordenados alfabéticamente
   */
  public async listarSeveridades(): Promise<string[]> {
    return this.obtenerFiltroGenerico("severidades", () =>
      analiticaRepository.obtenerSeveridadesUnicas(),
    );
  }
}

export const filtrosService = new FiltrosService();
