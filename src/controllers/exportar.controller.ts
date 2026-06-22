/**
 * @fileoverview Controlador de exportación de datos analíticos.
 * Permite descargar reportes en formato CSV y PDF.
 */

import { Request, Response } from "express";
import { exportarService } from "../services/exportar.service";
import { StatsQuerySchema } from "../validators/analitica.validator";
import { catchAsync } from "../helpers/catch-async.helper";

export class ExportarController {
  /**
   * Descarga un reporte CSV con datos de incidentes.
   *
   * @param req - Request con query params de filtro
   * @param res - Response con archivo CSV adjunto
   */
  public descargarCsv = catchAsync(async (req: Request, res: Response) => {
    const params = StatsQuerySchema.parse(req.query);
    const { buffer, filename } =
      await exportarService.generarReporteCsv(params);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(buffer);
  });

  /**
   * Descarga un reporte PDF (simulado).
   *
   * @param req - Request con query params de filtro
   * @param res - Response con archivo PDF adjunto
   */
  public descargarPdf = catchAsync(async (req: Request, res: Response) => {
    const params = StatsQuerySchema.parse(req.query);
    const { buffer, filename } =
      await exportarService.generarReportePdf(params);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(buffer);
  });
}

export const exportarController = new ExportarController();
