/**
 * @fileoverview Transformador de datos estadísticos para dashboards.
 * Procesa datos crudos agregados y calcula KPIs, tendencias y distribuciones.
 */
export class EstadisticasTransformer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Calcula KPIs agregados: total de incidentes y promedio de respuesta.
   *
   * @param datos - Array de datos estadísticos procesados
   * @returns Objeto con total y promedioRespuesta
   */
  public static extraerKpis(datos: any[]) {
    return {
      total: datos.reduce((acc, curr) => acc + curr.total_incidentes, 0),
      promedioRespuesta:
        datos.reduce((acc, curr) => acc + curr.prom_respuesta_seg, 0) /
        (datos.length || 1),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Extrae series de tiempo para gráficos de tendencias.
   *
   * @param datos - Array de datos estadísticos
   * @returns Array de puntos {x: fecha, y: total_incidentes}
   */
  public static extraerTendencias(datos: any[]) {
    return datos.map((d) => ({ x: d.fecha, y: d.total_incidentes }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  /**
   * Calcula la distribución de incidentes agrupados por categoría.
   *
   * @param datos - Array de datos estadísticos
   * @returns Array de {name: categoría, value: total}
   */
  public static extraerDistribucion(datos: any[]) {
    const map: Record<string, number> = {};
    datos.forEach((d) => {
      map[d.categoria] = (map[d.categoria] || 0) + d.total_incidentes;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }
}
