"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RespuestaHttpTransformer = void 0;
class RespuestaHttpTransformer {
    static exito(datos, mensaje = "Operación completada con éxito") {
        return {
            exito: true,
            mensaje,
            datos,
            timestamp: new Date().toISOString(),
        };
    }
    static paginada(datos, total, pagina, limite) {
        const totalPaginas = Math.ceil(total / limite);
        return {
            exito: true,
            mensaje: "Datos recuperados exitosamente",
            datos,
            meta: {
                totalRegistros: total,
                paginaActual: pagina,
                totalPaginas,
                tieneMas: pagina < totalPaginas,
            },
            timestamp: new Date().toISOString(),
        };
    }
    static error(mensaje, codigo, detalles) {
        return {
            exito: false,
            error: {
                codigo,
                mensaje,
                detalles,
            },
            timestamp: new Date().toISOString(),
        };
    }
}
exports.RespuestaHttpTransformer = RespuestaHttpTransformer;
//# sourceMappingURL=respuesta-http.transformer.js.map