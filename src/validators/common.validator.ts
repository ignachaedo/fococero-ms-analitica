/**
 * @fileoverview Esquemas Zod reutilizables para el módulo analítico.
 * Proporciona validación de paginación, UUID en parámetros y rangos de fechas.
 */

import { z } from "zod";

/**
 * Esquema para validar parámetros de paginación.
 * pagina por defecto 1, limite por defecto 20 (máximo 100).
 */
export const PaginacionQuerySchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Esquema para validar un UUID en parámetros de ruta.
 */
export const UuidParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * Esquema para validar un rango de fechas (startDate ≤ endDate).
 */
export const RangoFechasSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "La fecha de inicio no puede ser posterior a la fecha de fin",
    path: ["startDate"],
  });
