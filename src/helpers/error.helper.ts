/**
 * @fileoverview Clases de error operativo para el módulo analítico.
 * Proporciona AppError con código interno, UnauthorizedError para
 * errores 401 y ValidationError para errores 400.
 */

/**
 * Error operativo personalizado con código de estado HTTP y código interno.
 * Distingue errores operativos esperados de fallos de programación.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de autorización (401). Mensaje por defecto: "Acceso denegado. Token inválido o ausente."
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Acceso denegado. Token inválido o ausente.") {
    super(message, 401, "ERR_UNAUTHORIZED");
  }
}

/**
 * Error de validación (400). Código interno: ERR_VALIDATION.
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "ERR_VALIDATION");
  }
}
