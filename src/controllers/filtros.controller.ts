/**
 * @fileoverview Controlador de filtros dinámicos del dashboard.
 * Expone endpoints para obtener listas de categorías, orígenes y severidades.
 */

import { Request, Response } from "express";
import { filtrosService } from "../services/filtros.service";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";
import { catchAsync } from "../helpers/catch-async.helper";

export class FiltrosController {
  /**
   * Obtiene la lista de categorías de incidentes para filtros.
   *
   * @param req - Request
   * @param res - Response con array de categorías
   */
  public obtenerCategorias = catchAsync(async (req: Request, res: Response) => {
    const data = await filtrosService.listarCategorias();
    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(
          data,
          "Filtros de categoría recuperados",
        ),
      );
  });

  /**
   * Obtiene la lista de orígenes de incidentes para filtros.
   *
   * @param req - Request
   * @param res - Response con array de orígenes
   */
  public obtenerOrigenes = catchAsync(async (req: Request, res: Response) => {
    const data = await filtrosService.listarOrigenes();
    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(data, "Filtros de origen recuperados"),
      );
  });

  /**
   * Obtiene la lista de niveles de severidad para filtros.
   *
   * @param req - Request
   * @param res - Response con array de severidades
   */
  public obtenerSeveridades = catchAsync(
    async (req: Request, res: Response) => {
      const data = await filtrosService.listarSeveridades();
      res
        .status(200)
        .json(
          RespuestaHttpTransformer.exito(
            data,
            "Filtros de severidad recuperados",
          ),
        );
    },
  );
}

export const filtrosController = new FiltrosController();
