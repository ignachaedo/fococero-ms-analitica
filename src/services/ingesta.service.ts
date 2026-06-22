/**
 * @fileoverview Servicio de ingesta de datos al data warehouse.
 * Procesa eventos de incidentes (individuales o en lote), los transforma
 * al modelo dimensional y los persiste en la tabla de hechos (fact_incidentes).
 * Asegura la existencia de registros en la dimensión tiempo antes de insertar.
 */

import { analiticaRepository } from "../repositories/analitica.repository";
import { IncidenteTransformer } from "../transformers/incidente.transformer";
import { IFactIncidente } from "../models/fact-incidente.model";

class IngestaService {
  /**
   * Procesa un evento de incidente individual: transforma y persiste.
   *
   * @param rawPayload - Payload crudo del evento de incidente
   */
  public async procesarEventoIncidente(rawPayload: unknown): Promise<void> {
    const incidente = IncidenteTransformer.aFactIncidente(rawPayload);

    await analiticaRepository.asegurarDimensionTiempo(
      incidente.fecha_ocurrencia,
    );
    await analiticaRepository.ingestarIncidente(incidente);
  }

  /**
   * Procesa un lote de eventos de incidentes en paralelo.
   *
   * @description Transforma todos los payloads, asegura las dimensiones
   * de tiempo únicas y persiste los incidentes en paralelo.
   *
   * @param rawPayloads - Array de payloads crudos de incidentes
   */
  public async procesarLoteIncidentes(rawPayloads: unknown[]): Promise<void> {
    const incidentes: IFactIncidente[] =
      IncidenteTransformer.aFactIncidenteBatch(rawPayloads);

    const fechasUnicas = new Map<string, Date>();
    for (const inc of incidentes) {
      if (!fechasUnicas.has(inc.fecha_sk)) {
        fechasUnicas.set(inc.fecha_sk, inc.fecha_ocurrencia);
      }
    }

    const promesasDimensiones = Array.from(fechasUnicas.values()).map((fecha) =>
      analiticaRepository.asegurarDimensionTiempo(fecha),
    );
    await Promise.all(promesasDimensiones);

    const promesasIngesta = incidentes.map((inc: IFactIncidente) =>
      analiticaRepository.ingestarIncidente(inc),
    );
    await Promise.all(promesasIngesta);
  }
}

export const ingestaService = new IngestaService();
