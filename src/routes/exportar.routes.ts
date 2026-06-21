import { Router } from "express";
import { exportarController } from "../controllers/exportar.controller";
import { internalAuthMiddleware } from "../middlewares/internalAuth.middleware";
import { RateLimitMiddleware } from "../middlewares/rate-limit.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);
router.use(internalAuthMiddleware);
router.use(RateLimitMiddleware.limit);

router.get("/csv", exportarController.descargarCsv);
router.get("/pdf", exportarController.descargarPdf);

export const exportarRoutes = router;
