/**
 * @fileoverview Helper de logging estructurado usando Pino.
 * Proporciona métodos estáticos info, warn, error, debug con soporte
 * para pretty-print en desarrollo y modo silent en pruebas.
 */

import pino from "pino";

const pinoLogger = pino({
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

/**
 * Logger estructurado con método estáticos.
 * Envuelve Pino y expone API simplificada para toda la aplicación.
 */
export class Logger {
  /**
   * Registra un mensaje informativo.
   *
   * @param message - Mensaje descriptivo
   * @param meta - Metadatos adicionales (objeto, error, etc.)
   */
  public static info(message: string, meta?: unknown): void {
    pinoLogger.info(meta, message);
  }

  /**
   * Registra un mensaje de advertencia.
   *
   * @param message - Mensaje descriptivo
   * @param meta - Metadatos adicionales
   */
  public static warn(message: string, meta?: unknown): void {
    pinoLogger.warn(meta, message);
  }

  /**
   * Registra un mensaje de error.
   *
   * @param message - Mensaje descriptivo del error
   * @param meta - Error o metadatos asociados
   */
  public static error(message: string, meta?: unknown): void {
    pinoLogger.error(meta, message);
  }

  /**
   * Registra un mensaje de depuración.
   *
   * @param message - Mensaje descriptivo
   * @param meta - Metadatos adicionales
   */
  public static debug(message: string, meta?: unknown): void {
    pinoLogger.debug(meta, message);
  }
}
