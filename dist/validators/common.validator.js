"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangoFechasSchema = exports.UuidParamSchema = exports.PaginacionQuerySchema = void 0;
const zod_1 = require("zod");
exports.PaginacionQuerySchema = zod_1.z.object({
    pagina: zod_1.z.coerce.number().int().min(1).default(1),
    limite: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
exports.UuidParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
});
exports.RangoFechasSchema = zod_1.z
    .object({
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
})
    .refine((data) => data.startDate <= data.endDate, {
    message: "La fecha de inicio no puede ser posterior a la fecha de fin",
    path: ["startDate"],
});
//# sourceMappingURL=common.validator.js.map