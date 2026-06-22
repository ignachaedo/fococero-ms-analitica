/**
 * @fileoverview Servicio de exportación de datos analíticos.
 * Genera reportes en formato CSV y PDF (simulado) a partir de
 * los datos de incidentes almacenados en el data warehouse.
 */

import { analiticaRepository } from "../repositories/analitica.repository";
import { TStatsQuery } from "../validators/analitica.validator";

export class ExportarService {
  /**
   * Genera un reporte CSV con BOM (UTF-8) de los datos de incidentes.
   *
   * @param params - Parámetros de consulta con rango de fechas
   * @returns Objeto con buffer del archivo y nombre sugerido
   * @throws Error - Si no hay datos disponibles para el rango seleccionado
   */
  public async generarReporteCsv(
    params: TStatsQuery,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const datosDb = await analiticaRepository.obtenerEstadisticasBase(params);

    if (datosDb.length === 0) {
      throw new Error("No hay datos disponibles para el rango seleccionado");
    }

    const cabeceras = Object.keys(datosDb[0]).join(",");
    const filas = datosDb.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csvString = [cabeceras, ...filas].join("\n");
    const buffer = Buffer.from("\uFEFF" + csvString, "utf8");

    const timestamp = new Date().toISOString().split("T")[0];

    return {
      buffer,
      filename: `fococero_export_${timestamp}.csv`,
    };
  }

  /**
   * Genera un reporte PDF (simulado - implementación base).
   *
   * @param _params - Parámetros de consulta (no utilizados actualmente)
   * @returns Objeto con buffer del PDF simulado y nombre sugerido
   */
  public async generarReportePdf(
    _params: TStatsQuery, 
  ): Promise<{ buffer: Buffer; filename: string }> {
    const timestamp = new Date().toISOString().split("T")[0];

    const pdfSimulado = Buffer.from(
      "%PDF-1.4\n%Reporte Gerencial FocoCero\n",
      "utf8",
    );

    return {
      buffer: pdfSimulado,
      filename: `fococero_reporte_${timestamp}.pdf`,
    };
  }
}

export const exportarService = new ExportarService();
