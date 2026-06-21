"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictivaRoutes = void 0;
const express_1 = require("express");
const predictiva_controller_1 = require("../controllers/predictiva.controller");
const internalAuth_middleware_1 = require("../middlewares/internalAuth.middleware");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const request_logger_middleware_1 = require("../middlewares/request-logger.middleware");
const router = (0, express_1.Router)();
router.use(request_logger_middleware_1.RequestLoggerMiddleware.log);
router.use(internalAuth_middleware_1.internalAuthMiddleware);
router.use(rate_limit_middleware_1.RateLimitMiddleware.limit);
router.get("/forecast", predictiva_controller_1.predictivaController.obtenerPronostico);
exports.predictivaRoutes = router;
//# sourceMappingURL=predictiva.routes.js.map