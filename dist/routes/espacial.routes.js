"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.espacialRoutes = void 0;
const express_1 = require("express");
const espacial_controller_1 = require("../controllers/espacial.controller");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const request_logger_middleware_1 = require("../middlewares/request-logger.middleware");
const router = (0, express_1.Router)();
router.use(request_logger_middleware_1.RequestLoggerMiddleware.log);
router.use(rate_limit_middleware_1.RateLimitMiddleware.limit);
router.get("/heatmap", espacial_controller_1.espacialController.obtenerHeatmap);
router.get("/detalle", espacial_controller_1.espacialController.obtenerDetalleCuadrante);
router.get("/radio", espacial_controller_1.espacialController.obtenerPorRadio);
exports.espacialRoutes = router;
//# sourceMappingURL=espacial.routes.js.map