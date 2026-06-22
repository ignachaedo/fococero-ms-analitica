/**
 * @fileoverview Repositorio de datos analíticos para el data warehouse.
 * Encapsula el acceso a tablas del esquema analítico (fact_incidentes, dim_tiempo,
 * vistas materializadas) con consultas espaciales PostGIS y filtros dinámicos.
 */

import { dbPool } from "../config/db";
import {
  IFactIncidente,
  ISerieTiempoDiaria,
} from "../models/fact-incidente.model";
import { TStatsQuery, THeatmapQuery } from "../validators/analitica.validator";

class AnaliticaRepository {
  /**
   * Construye dinámicamente la cláusula WHERE para consultas analíticas.
   *
   * @param params - Parámetros de filtro (startDate, endDate, categorias, severidad)
   * @param startIdx - Índice inicial para los parámetros con bind (default 1)
   * @returns Objeto con cláusula WHERE, valores y próximo índice disponible
   */
  private construirFiltrosBase(
    params: Partial<TStatsQuery>,
    startIdx = 1,
  ): { where: string; values: unknown[]; nextIdx: number } {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = startIdx;

    if (params.startDate) {
      conditions.push(`fecha_ocurrencia >= $${idx++}`);
      values.push(params.startDate);
    }

    if (params.endDate) {
      conditions.push(`fecha_ocurrencia <= $${idx++}`);
      values.push(params.endDate);
    }

    if (params.categorias && params.categorias.length > 0) {
      conditions.push(`categoria = ANY($${idx++})`);
      values.push(params.categorias);
    }

    if (params.severidad) {
      conditions.push(`severidad = $${idx++}`);
      values.push(params.severidad);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return { where, values, nextIdx: idx };
  }

  /**
   * Obtiene estadísticas base de incidentes con filtros dinámicos.
   *
   * @param params - Parámetros de consulta y filtros
   * @returns Lista de incidentes filtrados
   */
  public async obtenerEstadisticasBase(
    params: TStatsQuery,
  ): Promise<IFactIncidente[]> {
    const { where, values } = this.construirFiltrosBase(params);
    const query = `
            SELECT id, fecha_sk, origen, categoria, severidad, latitud, longitud, 
                   tiempo_respuesta_segundos, fecha_ocurrencia 
            FROM fact_incidentes 
            ${where}
            ORDER BY fecha_ocurrencia ASC
        `;
    const result = await dbPool.query(query, values);
    return result.rows;
  }

  /**
   * Obtiene datos geoespaciales para generar mapas de calor.
   *
   * @param params - Parámetros con filtros temporales y límites geográficos (bounding box)
   * @returns Lista de incidentes con latitud, longitud, severidad y categoría
   */
  public async obtenerDatosMapaCalor(
    params: THeatmapQuery,
  ): Promise<IFactIncidente[]> {
    const { where, values, nextIdx } = this.construirFiltrosBase(params);
    let finalWhere = where;
    const idx = nextIdx; // Quitamos el let y lo dejamos constante

    if (
      params.minLat !== undefined &&
      params.maxLat !== undefined &&
      params.minLng !== undefined &&
      params.maxLng !== undefined
    ) {
      const prefix = finalWhere ? " AND" : "WHERE";
      finalWhere += `${prefix} geom && ST_MakeEnvelope($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, 4326)`;
      values.push(params.minLng, params.minLat, params.maxLng, params.maxLat);
      // Aquí ya no sumamos idx += 4 porque no se usa después. ESLint feliz.
    }

    const query = `SELECT latitud, longitud, severidad, categoria FROM fact_incidentes ${finalWhere}`;
    const result = await dbPool.query(query, values);
    return result.rows;
  }

  /**
   * Obtiene incidentes cuyo geohash comienza con el prefijo dado.
   *
   * @param geohash - Prefijo de geohash para filtrar
   * @param limite - Cantidad máxima de resultados
   * @returns Lista de incidentes en esa región
   */
  public async obtenerIncidentesPorGeohash(
    geohash: string,
    limite: number,
  ): Promise<IFactIncidente[]> {
    const query = `
            SELECT id, categoria, severidad, latitud, longitud, fecha_ocurrencia, metadata
            FROM fact_incidentes
            WHERE geohash LIKE $1 || '%'
            ORDER BY fecha_ocurrencia DESC
            LIMIT $2
        `;
    const result = await dbPool.query(query, [geohash, limite]);
    return result.rows;
  }

  /**
   * Obtiene incidentes dentro de un radio geográfico usando ST_DWithin.
   *
   * @param lat - Latitud del punto central
   * @param lng - Longitud del punto central
   * @param radioMetros - Radio de búsqueda en metros
   * @param startDate - Fecha de inicio del rango
   * @param endDate - Fecha de fin del rango
   * @returns Lista de incidentes ordenados por distancia ascendente
   */
  public async obtenerIncidentesPorRadio(
    lat: number,
    lng: number,
    radioMetros: number,
    startDate: Date,
    endDate: Date,
  ): Promise<IFactIncidente[]> {
    const query = `
            SELECT id, categoria, severidad, latitud, longitud, fecha_ocurrencia
            FROM fact_incidentes
            WHERE fecha_ocurrencia >= $1 AND fecha_ocurrencia <= $2
            AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5)
            ORDER BY ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography) ASC
        `;
    const result = await dbPool.query(query, [
      startDate,
      endDate,
      lng,
      lat,
      radioMetros,
    ]);
    return result.rows;
  }

  /**
   * Obtiene serie de tiempo diaria de total de incidentes.
   *
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @returns Array con fecha_sk y total_incidentes por día
   */
  public async obtenerSerieTiempoDiaria(
    startDate: Date,
    endDate: Date,
  ): Promise<ISerieTiempoDiaria[]> {
    const query = `
            SELECT fecha_sk, COUNT(id) as total_incidentes
            FROM fact_incidentes
            WHERE fecha_ocurrencia >= $1 AND fecha_ocurrencia <= $2
            GROUP BY fecha_sk
            ORDER BY fecha_sk ASC
        `;
    const result = await dbPool.query(query, [startDate, endDate]);
    return result.rows;
  }

  /**
   * Obtiene nombres de categorías de incidentes únicos (para filtros).
   *
   * @returns Array de nombres de categorías ordenados alfabéticamente
   */
  public async obtenerCategoriasUnicas(): Promise<string[]> {
    const result = await dbPool.query(
      "SELECT DISTINCT categoria FROM fact_incidentes WHERE categoria IS NOT NULL ORDER BY categoria ASC",
    );
    return result.rows.map((row) => row.categoria);
  }

  /**
   * Obtiene orígenes de incidentes únicos (para filtros).
   *
   * @returns Array de orígenes ordenados alfabéticamente
   */
  public async obtenerOrigenesUnicos(): Promise<string[]> {
    const result = await dbPool.query(
      "SELECT DISTINCT origen FROM fact_incidentes WHERE origen IS NOT NULL ORDER BY origen ASC",
    );
    return result.rows.map((row) => row.origen);
  }

  /**
   * Obtiene niveles de severidad únicos (para filtros).
   *
   * @returns Array de severidades ordenadas alfabéticamente
   */
  public async obtenerSeveridadesUnicas(): Promise<string[]> {
    const result = await dbPool.query(
      "SELECT DISTINCT severidad FROM fact_incidentes WHERE severidad IS NOT NULL ORDER BY severidad ASC",
    );
    return result.rows.map((row) => row.severidad);
  }

  /**
   * Asegura que exista un registro en dim_tiempo para la fecha dada (UPSERT).
   *
   * @param fecha - Fecha para la que se requiere la dimensión
   */
  public async asegurarDimensionTiempo(fecha: Date): Promise<void> {
    const query = `
            INSERT INTO dim_tiempo (fecha_sk, fecha_completa, anio, mes, dia, dia_semana, es_fin_semana)
            VALUES ($1, $2, EXTRACT(YEAR FROM $2::date), EXTRACT(MONTH FROM $2::date), EXTRACT(DAY FROM $2::date), EXTRACT(ISODOW FROM $2::date), EXTRACT(ISODOW FROM $2::date) IN (6, 7))
            ON CONFLICT (fecha_sk) DO NOTHING
        `;
    const fechaSk = fecha.toISOString().split("T")[0];
    await dbPool.query(query, [fechaSk, fecha]);
  }

  /**
   * Inserta un incidente en fact_incidentes con geolocalización PostGIS.
   * Usa ON CONFLICT DO NOTHING para evitar duplicados por ID.
   *
   * @param inc - Registro IFactIncidente a insertar
   */
  public async ingestarIncidente(inc: IFactIncidente): Promise<void> {
    const query = `
            INSERT INTO fact_incidentes (
                id, fecha_sk, origen, categoria, severidad, latitud, longitud, 
                geom, geohash, tiempo_respuesta_segundos, fecha_ocurrencia, metadata, created_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, 
                ST_SetSRID(ST_MakePoint($7, $6), 4326), ST_GeoHash(ST_SetSRID(ST_MakePoint($7, $6), 4326), 9), 
                $8, $9, $10, $11
            )
            ON CONFLICT (id) DO NOTHING
        `;
    await dbPool.query(query, [
      inc.id,
      inc.fecha_sk,
      inc.origen,
      inc.categoria,
      inc.severidad,
      inc.latitud,
      inc.longitud,
      inc.tiempo_respuesta_segundos,
      inc.fecha_ocurrencia,
      inc.metadata,
      inc.created_at,
    ]);
  }

  /**
   * Refresca las vistas materializadas del esquema analítico.
   */
  public async refrescarVistasMaterializadas(): Promise<void> {
    await dbPool.query(
      "REFRESH MATERIALIZED VIEW CONCURRENTLY vw_incidentes_agregados",
    );
  }
}

export const analiticaRepository = new AnaliticaRepository();
