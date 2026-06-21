"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.espacialController = exports.EspacialController = void 0;
const espacial_service_1 = require("../services/espacial.service");
const analitica_validator_1 = require("../validators/analitica.validator");
const respuesta_http_transformer_1 = require("../transformers/respuesta-http.transformer");
const catch_async_helper_1 = require("../helpers/catch-async.helper");
class EspacialController {
    obtenerHeatmap = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.HeatmapQuerySchema.parse(req.query);
        const data = await espacial_service_1.espacialService.generarMapaCalor(params);
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, "GeoJSON de mapa de calor generado"));
    });
    obtenerDetalleCuadrante = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.GeoHashQuerySchema.parse(req.query);
        const data = await espacial_service_1.espacialService.obtenerDetallePorGeohash(params);
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, "Detalle espacial recuperado"));
    });
    obtenerPorRadio = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const params = analitica_validator_1.RadioQuerySchema.parse(req.query);
        const data = await espacial_service_1.espacialService.obtenerIncidentesPorRadio(params);
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, "Análisis de proximidad completado"));
    });
}
exports.EspacialController = EspacialController;
exports.espacialController = new EspacialController();
//# sourceMappingURL=espacial.controller.js.map