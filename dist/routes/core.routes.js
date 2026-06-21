"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coreRoutes = void 0;
const express_1 = require("express");
const core_controller_1 = require("../controllers/core.controller");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const request_logger_middleware_1 = require("../middlewares/request-logger.middleware");
const router = (0, express_1.Router)();
router.use(request_logger_middleware_1.RequestLoggerMiddleware.log);
router.use(rate_limit_middleware_1.RateLimitMiddleware.limit);
router.get("/kpis", core_controller_1.coreController.obtenerKpis);
router.get("/kpis-ciudadano", core_controller_1.coreController.obtenerKpisCiudadano);
router.get("/kpis-brigadista", core_controller_1.coreController.obtenerKpisBrigadista);
router.get("/kpis-admin", core_controller_1.coreController.obtenerKpisAdmin);
router.get("/tendencias", core_controller_1.coreController.obtenerTendencias);
router.get("/distribucion", core_controller_1.coreController.obtenerDistribucion);
router.get("/anomalias", core_controller_1.coreController.obtenerAnomalias);
exports.coreRoutes = router;
//# sourceMappingURL=core.routes.js.map