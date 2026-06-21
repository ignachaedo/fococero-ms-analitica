import { Router } from "express";
import { coreController } from "../controllers/core.controller";

const router = Router();

router.get("/kpis", coreController.obtenerKpis);
router.get("/kpis-ciudadano", coreController.obtenerKpisCiudadano);
router.get("/kpis-brigadista", coreController.obtenerKpisBrigadista);
router.get("/kpis-admin", coreController.obtenerKpisAdmin);
router.get("/tendencias", coreController.obtenerTendencias);
router.get("/distribucion", coreController.obtenerDistribucion);
router.get("/anomalias", coreController.obtenerAnomalias);

export const coreRoutes = router;
