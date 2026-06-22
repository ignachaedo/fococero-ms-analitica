/**
 * @fileoverview Controlador de análisis predictivo.
 * Genera pronósticos de incidentes usando modelos estadísticos.
 */

import { Request, Response } from "express";
import { predictivaService } from "../services/predictiva.service";
import { StatsQuerySchema } from "../validators/analitica.validator";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";
import { catchAsync } from "../helpers/catch-async.helper";

export class PredictivaController {
  /**
   * Obtiene un pronóstico de incidentes para los próximos 7 días.
   *
   * @param req - Request con query params de filtro
   * @param res - Response con array de puntos de pronóstico
   */
  public obtenerPronostico = catchAsync(async (req: Request, res: Response) => {
    const params = StatsQuerySchema.parse(req.query);
    const data = await predictivaService.generarPronostico(params);

    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(data, "Pronóstico predictivo generado"),
      );
  });
}

export const predictivaController = new PredictivaController();
