"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.opsRoutes = void 0;
const express_1 = require("express");
const ops_controller_1 = require("../controllers/ops.controller");
const internalAuth_middleware_1 = require("../middlewares/internalAuth.middleware");
const request_logger_middleware_1 = require("../middlewares/request-logger.middleware");
const router = (0, express_1.Router)();
router.use(request_logger_middleware_1.RequestLoggerMiddleware.log);
router.get("/health", ops_controller_1.opsController.checkHealth);
router.get("/metrics", ops_controller_1.opsController.getMetrics);
router.post("/mantenimiento/sincronizar", internalAuth_middleware_1.internalAuthMiddleware, ops_controller_1.opsController.forzarMantenimiento);
router.post("/cache/purgar", internalAuth_middleware_1.internalAuthMiddleware, ops_controller_1.opsController.purgarCache);
exports.opsRoutes = router;
//# sourceMappingURL=ops.routes.js.map