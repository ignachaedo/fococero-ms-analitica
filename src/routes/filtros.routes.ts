import { Router } from "express";
import { filtrosController } from "../controllers/filtros.controller";
import { internalAuthMiddleware } from "../middlewares/internalAuth.middleware";
import { RequestLoggerMiddleware } from "../middlewares/request-logger.middleware";

const router = Router();

router.use(RequestLoggerMiddleware.log);
router.use(internalAuthMiddleware);

router.get("/categorias", filtrosController.obtenerCategorias);
router.get("/origenes", filtrosController.obtenerOrigenes);
router.get("/severidades", filtrosController.obtenerSeveridades);

export const filtrosRoutes = router;
