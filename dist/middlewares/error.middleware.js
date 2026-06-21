"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleware = void 0;
const zod_1 = require("zod");
const error_helper_1 = require("../helpers/error.helper");
const logger_helper_1 = require("../helpers/logger.helper");
const respuesta_http_transformer_1 = require("../transformers/respuesta-http.transformer");
class ErrorMiddleware {
    static handle(error, req, res, next) {
        if (error instanceof error_helper_1.AppError) {
            if (!error.isOperational) {
                logger_helper_1.Logger.error("Error de programación crítico", {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                });
                process.exit(1);
            }
            logger_helper_1.Logger.warn(`Error operacional: ${error.message}`, { code: error.code });
            const response = respuesta_http_transformer_1.RespuestaHttpTransformer.error(error.message, error.code);
            res.status(error.statusCode).json(response);
            return;
        }
        if (error instanceof zod_1.ZodError) {
            const detalles = error.issues.map((e) => ({
                campo: e.path.join("."),
                mensaje: e.message,
            }));
            logger_helper_1.Logger.warn("Error de validación de esquema", detalles);
            const response = respuesta_http_transformer_1.RespuestaHttpTransformer.error("Datos de entrada inválidos", "ERR_VALIDATION", detalles);
            res.status(400).json(response);
            return;
        }
        logger_helper_1.Logger.error("Error interno no controlado", {
            name: error.name,
            message: error.message,
            stack: error.stack,
            path: req.originalUrl,
            method: req.method,
        });
        const response = respuesta_http_transformer_1.RespuestaHttpTransformer.error("Error interno del servidor", "ERR_INTERNAL_SERVER_ERROR");
        res.status(500).json(response);
    }
}
exports.ErrorMiddleware = ErrorMiddleware;
//# sourceMappingURL=error.middleware.js.map