/**
 * @fileoverview Controlador de consultas geoespaciales analíticas.
 * Expone endpoints para mapas de calor, detalle por geohash
 * y búsqueda por radio de proximidad.
 */

import { Request, Response } from "express";
import { espacialService } from "../services/espacial.service";
import {
  HeatmapQuerySchema,
  GeoHashQuerySchema,
  RadioQuerySchema,
} from "../validators/analitica.validator";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";
import { catchAsync } from "../helpers/catch-async.helper";

export class EspacialController {
  /**
   * Genera un mapa de calor en formato GeoJSON.
   *
   * @param req - Request con query params (límites geográficos y fechas)
   * @param res - Response con FeatureCollection GeoJSON
   */
  public obtenerHeatmap = catchAsync(async (req: Request, res: Response) => {
    const params = HeatmapQuerySchema.parse(req.query);
    const data = await espacialService.generarMapaCalor(params);

    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(
          data,
          "GeoJSON de mapa de calor generado",
        ),
      );
  });

  /**
   * Obtiene detalle de incidentes para un cuadrante (geohash).
   *
   * @param req - Request con query params (geohash, limite)
   * @param res - Response con lista de incidentes
   */
  public obtenerDetalleCuadrante = catchAsync(
    async (req: Request, res: Response) => {
      const params = GeoHashQuerySchema.parse(req.query);
      const data = await espacialService.obtenerDetallePorGeohash(params);

      res
        .status(200)
        .json(
          RespuestaHttpTransformer.exito(data, "Detalle espacial recuperado"),
        );
    },
  );

  /**
   * Obtiene incidentes dentro de un radio alrededor de un punto.
   *
   * @param req - Request con query params (lat, lng, radioMetros, fechas)
   * @param res - Response con lista de incidentes ordenados por distancia
   */
  public obtenerPorRadio = catchAsync(async (req: Request, res: Response) => {
    const params = RadioQuerySchema.parse(req.query);
    const data = await espacialService.obtenerIncidentesPorRadio(params);

    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(
          data,
          "Análisis de proximidad completado",
        ),
      );
  });
}

export const espacialController = new EspacialController();
