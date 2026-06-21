"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtrosRoutes = void 0;
const express_1 = require("express");
const filtros_controller_1 = require("../controllers/filtros.controller");
const internalAuth_middleware_1 = require("../middlewares/internalAuth.middleware");
const request_logger_middleware_1 = require("../middlewares/request-logger.middleware");
const router = (0, express_1.Router)();
router.use(request_logger_middleware_1.RequestLoggerMiddleware.log);
router.use(internalAuth_middleware_1.internalAuthMiddleware);
router.get("/categorias", filtros_controller_1.filtrosController.obtenerCategorias);
router.get("/origenes", filtros_controller_1.filtrosController.obtenerOrigenes);
router.get("/severidades", filtros_controller_1.filtrosController.obtenerSeveridades);
exports.filtrosRoutes = router;
//# sourceMappingURL=filtros.routes.js.map