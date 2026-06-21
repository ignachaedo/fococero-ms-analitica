"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opsController = exports.OpsController = void 0;
const health_service_1 = require("../services/health.service");
const mantenimiento_service_1 = require("../services/mantenimiento.service");
const respuesta_http_transformer_1 = require("../transformers/respuesta-http.transformer");
const catch_async_helper_1 = require("../helpers/catch-async.helper");
class OpsController {
    checkHealth = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const data = await health_service_1.healthService.check();
        const statusCode = data.status === "OK" ? 200 : 503;
        res.status(statusCode).json(data);
    });
    getMetrics = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const metrics = await health_service_1.healthService.getMetrics();
        res.setHeader("Content-Type", "text/plain");
        res.status(200).send(metrics);
    });
    forzarMantenimiento = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        await mantenimiento_service_1.mantenimientoService.sincronizarDatosBase();
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(null, "Sincronización de vistas materializadas completada"));
    });
    purgarCache = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        await mantenimiento_service_1.mantenimientoService.purgarCaches();
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(null, "Limpieza de caché global completada exitosamente"));
    });
}
exports.OpsController = OpsController;
exports.opsController = new OpsController();
//# sourceMappingURL=ops.controller.js.map