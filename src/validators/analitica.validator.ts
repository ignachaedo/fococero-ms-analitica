/**
 * @fileoverview Esquemas Zod para validación de consultas analíticas.
 * Define esquemas para estadísticas, mapas de calor, consultas por geohash
 * y búsquedas por radio con coordenadas y fechas.
 */

import { z } from "zod";

/** Enum Zod para niveles de severidad */
const SeveridadEnum = z.enum(["ALTA", "MEDIA", "BAJA"]);

/**
 * Esquema para consultas de estadísticas base.
 * Acepta startDate/endDate opcionales, categorías, y severidad.
 * Valida que startDate no sea posterior a endDate.
 */
export const StatsQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    categorias: z
      .preprocess((val) => {
        if (typeof val === "string")
          return val.split(",").map((s) => s.trim().toUpperCase());
        if (Array.isArray(val)) return val.map((s) => String(s).toUpperCase());
        return val;
      }, z.array(z.string()).min(1))
      .optional(),
    severidad: SeveridadEnum.optional(),
  })
  .refine((data) => {
    if (!data.startDate || !data.endDate) return true;
    return data.startDate <= data.endDate;
  }, {
    message:
      "La fecha de inicio (startDate) no puede ser posterior a la fecha de fin (endDate)",
    path: ["startDate"],
  });

/**
 * Esquema para consultas de mapas de calor.
 * Extiende StatsQuerySchema y añade bounding box (minLat, maxLat, minLng, maxLng).
 * Si se proporciona alguna coordenada, deben estar las 4.
 */
export const HeatmapQuerySchema = StatsQuerySchema.extend({
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),
}).refine(
  (data) => {
    const presentCount = [
      data.minLat,
      data.maxLat,
      data.minLng,
      data.maxLng,
    ].filter((c) => c !== undefined).length;
    return presentCount === 0 || presentCount === 4;
  },
  {
    message:
      "Debe proporcionar las 4 coordenadas del bounding box (minLat, maxLat, minLng, maxLng) o ninguna.",
    path: ["minLat"],
  },
);

/**
 * Esquema para consultas por prefijo de geohash.
 * Requiere un geohash de 4 a 12 caracteres y un límite opcional (default 20, max 100).
 */
export const GeoHashQuerySchema = z.object({
  geohash: z.string().min(4).max(12),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Esquema para consultas por radio geográfico.
 * Extiende StatsQuerySchema y añade latitud, longitud y radio en metros.
 */
export const RadioQuerySchema = StatsQuerySchema.extend({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radioMetros: z.coerce.number().int().min(10).max(5000).default(1000),
});

export type TStatsQuery = z.infer<typeof StatsQuerySchema>;
export type THeatmapQuery = z.infer<typeof HeatmapQuerySchema>;
export type TGeoHashQuery = z.infer<typeof GeoHashQuerySchema>;
export type TRadioQuery = z.infer<typeof RadioQuerySchema>;
