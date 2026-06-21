"use strict";
// src/transformers/incidente.transformer.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidenteTransformer = exports.RawIncidenteSchema = void 0;
const uuid_1 = require("uuid");
const zod_1 = require("zod");
exports.RawIncidenteSchema = zod_1.z.object({
    idExterno: zod_1.z.string().optional(),
    origen: zod_1.z.string(),
    tipo: zod_1.z.string(),
    nivelUrgencia: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
    ubicacion: zod_1.z.object({
        lat: zod_1.z.number().min(-90).max(90),
        lng: zod_1.z.number().min(-180).max(180),
    }),
    timestamps: zod_1.z.object({
        creadoEn: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]),
        resueltoEn: zod_1.z.union([zod_1.z.string(), zod_1.z.date()]).optional(),
    }),
    detallesAdicionales: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
});
class IncidenteTransformer {
    static mapearSeveridad(urgencia) {
        const nivel = Number(urgencia);
        if (Number.isNaN(nivel))
            return "MEDIA";
        if (nivel >= 4)
            return "ALTA";
        if (nivel <= 2)
            return "BAJA";
        return "MEDIA";
    }
    static calcularTiempoRespuesta(inicio, fin) {
        if (!fin)
            return null;
        const ms = new Date(fin).getTime() - new Date(inicio).getTime();
        return ms > 0 ? Math.floor(ms / 1000) : null;
    }
    static aFactIncidente(rawPayload) {
        const raw = exports.RawIncidenteSchema.parse(rawPayload);
        const fechaOcurrencia = new Date(raw.timestamps.creadoEn);
        return {
            id: (0, uuid_1.v4)(),
            fecha_sk: fechaOcurrencia.toISOString().split("T")[0],
            origen: raw.origen.toUpperCase().trim(),
            categoria: raw.tipo.toUpperCase().trim(),
            severidad: this.mapearSeveridad(raw.nivelUrgencia),
            latitud: raw.ubicacion.lat,
            longitud: raw.ubicacion.lng,
            geom: "",
            geohash: "",
            tiempo_respuesta_segundos: this.calcularTiempoRespuesta(raw.timestamps.creadoEn, raw.timestamps.resueltoEn),
            fecha_ocurrencia: fechaOcurrencia,
            metadata: {
                id_externo: raw.idExterno || null,
                ...raw.detallesAdicionales,
            },
            created_at: new Date(),
        };
    }
    static aFactIncidenteBatch(rawPayloads) {
        return rawPayloads.map((payload) => this.aFactIncidente(payload));
    }
}
exports.IncidenteTransformer = IncidenteTransformer;
//# sourceMappingURL=incidente.transformer.js.map