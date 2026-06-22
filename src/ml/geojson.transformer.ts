/**
 * @fileoverview Transformador de datos geoespaciales a formato GeoJSON.
 * Convierte datos de mapa de calor agregados por geohash en una
 * FeatureCollection GeoJSON estándar para visualización en mapas.
 */

import {
  IMVMapaCalorGeohash,
  IHeatmapGeoJSON,
  IHeatmapFeature,
} from "../models/heatmap.model";
import { decodificarGeohash } from "./geohash.utils";

export class GeoJsonTransformer {
  /**
   * Transforma datos agregados por geohash en una FeatureCollection GeoJSON.
   *
   * @param datosGeohash - Array de datos con geohash, categoría e intensidad
   * @returns FeatureCollection GeoJSON con puntos georreferenciados
   */
  public static aMapaCalor(
    datosGeohash: IMVMapaCalorGeohash[],
  ): IHeatmapGeoJSON {
    const features: IHeatmapFeature[] = datosGeohash.map((dato) => {
      const geohashStr = String(dato.geohash);
      const coordenadas = decodificarGeohash(geohashStr);

      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coordenadas.lng, coordenadas.lat], // Longitud primero en GeoJSON
        },
        properties: {
          weight: dato.intensidad,
          category: dato.categoria,
          geohash: geohashStr,
        },
      };
    });

    return {
      type: "FeatureCollection",
      features,
    };
  }
}
