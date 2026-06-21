"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const envs_1 = require("./config/envs");
// Importación de Clases de Middleware
const request_logger_middleware_1 = require("./middlewares/request-logger.middleware");
const internalAuth_middleware_1 = require("./middlewares/internalAuth.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const metrics_middleware_1 = require("./middlewares/metrics.middleware");
// Helpers, Rutas y Config Docs
const error_helper_1 = require("./helpers/error.helper");
const index_1 = __importDefault(require("./routes/index"));
const swagger_config_1 = require("./docs/swagger.config"); // Asegúrate que exporte el JSON/Objeto
const app = (0, express_1.default)();
// Configuración para proxies (Docker/Load Balancers)
app.set("trust proxy", 1);
// ============================================================================
// 📖 1. DOCUMENTACIÓN (SWAGGER)
// ============================================================================
app.use("/api/v1/analitica/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_config_1.swaggerDocument));
// ============================================================================
// 🛡️ 2. SEGURIDAD Y MIDDLEWARES BASE
// ============================================================================
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:"],
        },
    },
}));
app.use((0, cors_1.default)({ origin: envs_1.envs.API_GATEWAY_URL || 'http://localhost:3000' }));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev")); // Ver logs de peticiones estilo ms-geo
// ============================================================================
// 📊 3. MONITOREO Y TRAZABILIDAD
// ============================================================================
app.use(request_logger_middleware_1.RequestLoggerMiddleware.log);
// 📊 Monitoreo de métricas (Prometheus)
app.use(metrics_middleware_1.metricsMiddleware);
// Endpoint de métricas Prometheus
app.get("/metrics", metrics_middleware_1.metricsHandler);
app.get("/health", (_req, res) => {
    res.json({
        status: "UP",
        service: "ms-analitica",
        timestamp: new Date().toISOString(),
    });
});
// ============================================================================
// 🚦 4. RUTAS Y SEGURIDAD INTERNA
// ============================================================================
app.use(internalAuth_middleware_1.internalAuthMiddleware);
// Registro de rutas (soporta ambas variantes de path por si el gateway no reescribe)
app.use("/api/v1/analitica", index_1.default);
app.use("/api/analitica", index_1.default);
// Manejo de rutas no encontradas
app.use((req, _res, next) => {
    next(new error_helper_1.AppError(`Ruta no encontrada: ${req.originalUrl}`, 404, "ERR_NOT_FOUND"));
});
app.use(error_middleware_1.ErrorMiddleware.handle);
exports.default = app;
//# sourceMappingURL=app.js.map