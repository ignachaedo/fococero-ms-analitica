/**
 * @fileoverview Transformador de incidentes al modelo dimensional.
 * Convierte payloads crudos de eventos en registros del modelo IFactIncidente
 * para su ingesta en el data warehouse analítico.
 */

import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  IFactIncidente,
  IncidentId,
  GeoHashStr,
} from "../models/fact-incidente.model";

/** Esquema Zod para validar payloads crudos de incidentes */
export const RawIncidenteSchema = z.object({
  idExterno: z.string().optional(),
  origen: z.string(),
  tipo: z.string(),
  nivelUrgencia: z.union([z.number(), z.string()]).optional(),
  ubicacion: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  timestamps: z.object({
    creadoEn: z.union([z.string(), z.date()]),
    resueltoEn: z.union([z.string(), z.date()]).optional(),
  }),
  detallesAdicionales: z.record(z.string(), z.unknown()).optional(),
});

export class IncidenteTransformer {
  /**
   * Mapea un nivel de urgencia numérico a severidad (ALTA, MEDIA, BAJA).
   *
   * @param urgencia - Nivel de urgencia (número o string)
   * @returns "ALTA" si >= 4, "BAJA" si <= 2, "MEDIA" en otros casos
   */
  private static mapearSeveridad(
    urgencia: number | string | undefined,
  ): "ALTA" | "MEDIA" | "BAJA" {
    const nivel = Number(urgencia);
    if (Number.isNaN(nivel)) return "MEDIA";
    if (nivel >= 4) return "ALTA";
    if (nivel <= 2) return "BAJA";
    return "MEDIA";
  }

  /**
   * Calcula el tiempo de respuesta en segundos entre dos fechas.
   *
   * @param inicio - Fecha de inicio del incidente
   * @param fin - Fecha de resolución (opcional)
   * @returns Segundos de diferencia, o null si no hay fecha de fin
   */
  private static calcularTiempoRespuesta(
    inicio: string | Date,
    fin?: string | Date,
  ): number | null {
    if (!fin) return null;
    const ms = new Date(fin).getTime() - new Date(inicio).getTime();
    return ms > 0 ? Math.floor(ms / 1000) : null;
  }

  /**
   * Transforma un payload crudo a un registro IFactIncidente.
   *
   * @param rawPayload - Payload del evento validado contra RawIncidenteSchema
   * @returns Instancia de IFactIncidente lista para persistir
   */
  public static aFactIncidente(rawPayload: unknown): IFactIncidente {
    const raw = RawIncidenteSchema.parse(rawPayload);
    const fechaOcurrencia = new Date(raw.timestamps.creadoEn);

    return {
      id: uuidv4() as unknown as IncidentId,
      fecha_sk: fechaOcurrencia.toISOString().split("T")[0],
      origen: raw.origen.toUpperCase().trim(),
      categoria: raw.tipo.toUpperCase().trim(),
      severidad: this.mapearSeveridad(raw.nivelUrgencia),
      latitud: raw.ubicacion.lat,
      longitud: raw.ubicacion.lng,
      geom: "",
      geohash: "" as unknown as GeoHashStr,
      tiempo_respuesta_segundos: this.calcularTiempoRespuesta(
        raw.timestamps.creadoEn,
        raw.timestamps.resueltoEn,
      ),
      fecha_ocurrencia: fechaOcurrencia,
      metadata: {
        id_externo: raw.idExterno || null,
        ...raw.detallesAdicionales,
      },
      created_at: new Date(),
    };
  }

  /**
   * Transforma un lote de payloads crudos a registros IFactIncidente.
   *
   * @param rawPayloads - Array de payloads a transformar
   * @returns Array de IFactIncidente
   */
  public static aFactIncidenteBatch(rawPayloads: unknown[]): IFactIncidente[] {
    return rawPayloads.map((payload) => this.aFactIncidente(payload));
  }
}
