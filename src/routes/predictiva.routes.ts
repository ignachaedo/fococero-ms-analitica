import { Router } from "express";
import { predictivaController } from "../controllers/predictiva.controller";
import { internalAuthMiddleware } from "../middlewares/internalAuth.middleware";
import { RateLimitMiddleware } from "../middlewares/rate-limit.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);
router.use(internalAuthMiddleware);
router.use(RateLimitMiddleware.limit);

router.get("/forecast", predictivaController.obtenerPronostico);

export const predictivaRoutes = router;
