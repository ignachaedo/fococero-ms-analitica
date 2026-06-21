"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioQuerySchema = exports.GeoHashQuerySchema = exports.HeatmapQuerySchema = exports.StatsQuerySchema = void 0;
const zod_1 = require("zod");
const SeveridadEnum = zod_1.z.enum(["ALTA", "MEDIA", "BAJA"]);
exports.StatsQuerySchema = zod_1.z
    .object({
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
    categorias: zod_1.z
        .preprocess((val) => {
        if (typeof val === "string")
            return val.split(",").map((s) => s.trim().toUpperCase());
        if (Array.isArray(val))
            return val.map((s) => String(s).toUpperCase());
        return val;
    }, zod_1.z.array(zod_1.z.string()).min(1))
        .optional(),
    severidad: SeveridadEnum.optional(),
})
    .refine((data) => data.startDate <= data.endDate, {
    message: "La fecha de inicio (startDate) no puede ser posterior a la fecha de fin (endDate)",
    path: ["startDate"],
});
exports.HeatmapQuerySchema = exports.StatsQuerySchema.extend({
    minLat: zod_1.z.coerce.number().min(-90).max(90).optional(),
    maxLat: zod_1.z.coerce.number().min(-90).max(90).optional(),
    minLng: zod_1.z.coerce.number().min(-180).max(180).optional(),
    maxLng: zod_1.z.coerce.number().min(-180).max(180).optional(),
}).refine((data) => {
    const presentCount = [
        data.minLat,
        data.maxLat,
        data.minLng,
        data.maxLng,
    ].filter((c) => c !== undefined).length;
    return presentCount === 0 || presentCount === 4;
}, {
    message: "Debe proporcionar las 4 coordenadas del bounding box (minLat, maxLat, minLng, maxLng) o ninguna.",
    path: ["minLat"],
});
exports.GeoHashQuerySchema = zod_1.z.object({
    geohash: zod_1.z.string().min(4).max(12),
    limite: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.RadioQuerySchema = exports.StatsQuerySchema.extend({
    lat: zod_1.z.coerce.number().min(-90).max(90),
    lng: zod_1.z.coerce.number().min(-180).max(180),
    radioMetros: zod_1.z.coerce.number().int().min(10).max(5000).default(1000),
});
//# sourceMappingURL=analitica.validator.js.map