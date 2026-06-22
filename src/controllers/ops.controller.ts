/**
 * @fileoverview Controlador de operaciones del sistema analítico.
 * Endpoints de health check, métricas, sincronización de vistas
 * materializadas y purga de cachés.
 */

import { Request, Response } from "express";
import { healthService } from "../services/health.service";
import { mantenimientoService } from "../services/mantenimiento.service";
import { RespuestaHttpTransformer } from "../transformers/respuesta-http.transformer";
import { catchAsync } from "../helpers/catch-async.helper";

export class OpsController {
  /**
   * Verifica el estado de salud del microservicio y sus dependencias.
   *
   * @param req - Request
   * @param res - Response con estado OK/DEGRADED/DOWN
   */
  public checkHealth = catchAsync(async (req: Request, res: Response) => {
    const data = await healthService.check();
    const statusCode = data.status === "OK" ? 200 : 503;

    res.status(statusCode).json(data);
  });

  /**
   * Expone métricas de memoria del proceso en formato Prometheus.
   *
   * @param req - Request
   * @param res - Response con Content-Type text/plain
   */
  public getMetrics = catchAsync(async (req: Request, res: Response) => {
    const metrics = await healthService.getMetrics();
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(metrics);
  });

  /**
   * Refresca vistas materializadas y purga cachés globales.
   *
   * @param req - Request
   * @param res - Response con confirmación
   */
  public forzarMantenimiento = catchAsync(
    async (req: Request, res: Response) => {
      await mantenimientoService.sincronizarDatosBase();

      res
        .status(200)
        .json(
          RespuestaHttpTransformer.exito(
            null,
            "Sincronización de vistas materializadas completada",
          ),
        );
    },
  );

  /**
   * Purga todos los cachés globales del sistema.
   *
   * @param req - Request
   * @param res - Response con confirmación
   */
  public purgarCache = catchAsync(async (req: Request, res: Response) => {
    await mantenimientoService.purgarCaches();

    res
      .status(200)
      .json(
        RespuestaHttpTransformer.exito(
          null,
          "Limpieza de caché global completada exitosamente",
        ),
      );
  });
}

export const opsController = new OpsController();
