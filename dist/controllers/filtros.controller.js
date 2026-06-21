"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtrosController = exports.FiltrosController = void 0;
const filtros_service_1 = require("../services/filtros.service");
const respuesta_http_transformer_1 = require("../transformers/respuesta-http.transformer");
const catch_async_helper_1 = require("../helpers/catch-async.helper");
class FiltrosController {
    obtenerCategorias = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const data = await filtros_service_1.filtrosService.listarCategorias();
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, "Filtros de categoría recuperados"));
    });
    obtenerOrigenes = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const data = await filtros_service_1.filtrosService.listarOrigenes();
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, "Filtros de origen recuperados"));
    });
    obtenerSeveridades = (0, catch_async_helper_1.catchAsync)(async (req, res) => {
        const data = await filtros_service_1.filtrosService.listarSeveridades();
        res
            .status(200)
            .json(respuesta_http_transformer_1.RespuestaHttpTransformer.exito(data, "Filtros de severidad recuperados"));
    });
}
exports.FiltrosController = FiltrosController;
exports.filtrosController = new FiltrosController();
//# sourceMappingURL=filtros.controller.js.map