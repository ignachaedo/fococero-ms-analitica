"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreController = exports.CoreController = void 0;
const core_service_1 = require("../services/core.service");
const analitica_validator_1 = require("../validators/analitica.validator");
const respuesta_http_transformer_1 = require("../transformers/respuesta-http.transformer");
const catch_async_helper_1 = require("../helpers/catch-async.helper");
class CoreController {
    /**
     * Obtiene los indicadores clave de desempeño (KPIs)
     * Endpoint: GET /api/v1/analitica/core/kpis
     */
    obtenerKpis = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        // 1. Validación y transformación de Query Params vía Zod
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        // 2. Delegación al servicio especializado
        const data = await core_service_1.coreService.calcularKpis(params);
        // 3. Respuesta estandarizada
        res.status(200).json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, 'KPIs calculados exitosamente'));
    });
    /**
     * Obtiene las series de tiempo para gráficos de tendencias
     * Endpoint: GET /api/v1/analitica/core/tendencias
     */
    obtenerTendencias = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const data = await core_service_1.coreService.calcularTendencias(params);
        res.status(200).json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, 'Serie de tiempo de tendencias generada'));
    });
    /**
     * Obtiene la distribución de incidentes por categorías
     * Endpoint: GET /api/v1/analitica/core/distribucion
     */
    obtenerDistribucion = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const data = await core_service_1.coreService.calcularDistribucion(params);
        res.status(200).json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, 'Distribución por categorías procesada'));
    });
    /**
     * Ejecuta el motor de detección de anomalías estadísticas
     * Endpoint: GET /api/v1/analitica/core/anomalias
     */
    obtenerAnomalias = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const data = await core_service_1.coreService.detectarAnomalias(params);
        res.status(200).json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, 'Análisis de detección de anomalías completado'));
    });
    /**
     * Obtiene KPIs filtrados para un ciudadano
     * Endpoint: GET /api/v1/analitica/core/kpis-ciudadano
     */
    obtenerKpisCiudadano = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const userId = req.headers['x-user-id'] || '';
        const data = await core_service_1.coreService.calcularKpisCiudadano(params, userId);
        res.status(200).json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, 'KPIs ciudadano calculados exitosamente'));
    });
    /**
     * Obtiene KPIs tácticos para brigadistas
     * Endpoint: GET /api/v1/analitica/core/kpis-brigadista
     */
    obtenerKpisBrigadista = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const data = await core_service_1.coreService.calcularKpisBrigadista(params);
        res.status(200).json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, 'KPIs brigadista calculados exitosamente'));
    });
    /**
     * Obtiene KPIS globales del sistema para administradores
     * Endpoint: GET /api/v1/analitica/core/kpis-admin
     */
    obtenerKpisAdmin = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.StatsQuerySchema.parse(req.query);
        const data = await core_service_1.coreService.calcularKpisAdmin(params);
        res.status(200).json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, 'KPIs globales calculados exitosamente'));
    });
}
exports.CoreController = CoreController;
// Exportamos la instancia lista para ser usada en las rutas
exports.coreController = new CoreController();
//# sourceMappingURL=core.controller.js.map