"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsQuerySchema = exports.HeatmapQuerySchema = exports.GeoBoundsSchema = exports.CategoryFilterSchema = exports.DateRangeSchema = void 0;
const zod_1 = require("zod");
exports.DateRangeSchema = zod_1.z
    .object({
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
})
    .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "startDate must be before or equal to endDate",
    path: ["startDate"],
});
exports.CategoryFilterSchema = zod_1.z.object({
    categorias: zod_1.z.array(zod_1.z.string()).optional(),
    severidad: zod_1.z.enum(["ALTA", "MEDIA", "BAJA"]).optional(),
});
exports.GeoBoundsSchema = zod_1.z
    .object({
    minLat: zod_1.z.coerce.number().min(-90).max(90),
    maxLat: zod_1.z.coerce.number().min(-90).max(90),
    minLng: zod_1.z.coerce.number().min(-180).max(180),
    maxLng: zod_1.z.coerce.number().min(-180).max(180),
})
    .refine((data) => data.minLat <= data.maxLat && data.minLng <= data.maxLng, {
    message: "Invalid geographical bounds",
});
exports.HeatmapQuerySchema = exports.DateRangeSchema.merge(exports.CategoryFilterSchema).merge(exports.GeoBoundsSchema.partial());
exports.StatsQuerySchema = exports.DateRangeSchema.merge(exports.CategoryFilterSchema);
//# sourceMappingURL=analytics.dto.js.map