"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoJsonTransformer = void 0;
const geohash_utils_1 = require("./geohash.utils");
class GeoJsonTransformer {
    /**
     * Transforma los datos agregados por geohash en una colección de Features GeoJSON.
     */
    static aMapaCalor(datosGeohash) {
        const features = datosGeohash.map((dato) => {
            const geohashStr = String(dato.geohash);
            const coordenadas = (0, geohash_utils_1.decodificarGeohash)(geohashStr);
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
exports.GeoJsonTransformer = GeoJsonTransformer;
//# sourceMappingURL=geojson.transformer.js.map