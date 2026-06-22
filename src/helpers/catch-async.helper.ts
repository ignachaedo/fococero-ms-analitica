/**
 * @fileoverview Helper para capturar errores asíncronos en controladores Express.
 * Envuelve funciones async para que errores no capturados sean delegados
 * automáticamente al middleware de manejo de errores vía next().
 */

import { Request, Response, NextFunction } from "express";

/**
 * Envuelve una función async de Express para capturar errores automáticamente.
 * Los errores lanzados dentro de fn son pasados a next() en lugar de
 * generar una promesa rechazada no capturada.
 *
 * @param fn - Función async que maneja la solicitud (req, res, next)
 * @returns Función Express estándar que ejecuta fn y captura errores
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
