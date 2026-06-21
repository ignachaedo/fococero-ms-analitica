import { Router } from "express";
import { opsController } from "../controllers/ops.controller";
import { internalAuthMiddleware } from "../middlewares/internalAuth.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);

router.get("/health", opsController.checkHealth);
router.get("/metrics", opsController.getMetrics);

router.post(
  "/mantenimiento/sincronizar",
  internalAuthMiddleware,
  opsController.forzarMantenimiento,
);
router.post(
  "/cache/purgar",
  internalAuthMiddleware,
  opsController.purgarCache,
);

export const opsRoutes = router;
