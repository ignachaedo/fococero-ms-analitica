"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnomaliasDetector = void 0;
class AnomaliasDetector {
    static analizarTendencias(datos) {
        if (datos.length < 7) {
            return [];
        }
        const totalesPorDia = new Map();
        for (const fila of datos) {
            const actual = totalesPorDia.get(fila.fecha) || 0;
            totalesPorDia.set(fila.fecha, actual + fila.total_incidentes);
        }
        const valores = Array.from(totalesPorDia.values());
        const media = this.calcularMedia(valores);
        const desviacionEstandar = this.calcularDesviacionEstandar(valores, media);
        const anomalias = [];
        for (const [fecha, total] of totalesPorDia.entries()) {
            const zScore = desviacionEstandar === 0 ? 0 : (total - media) / desviacionEstandar;
            if (zScore > 2.0) {
                anomalias.push({
                    fecha,
                    total,
                    mediaEsperada: Number(media.toFixed(2)),
                    desviacionEstandar: Number(desviacionEstandar.toFixed(2)),
                    zScore: Number(zScore.toFixed(2)),
                    esCritica: zScore > 3.0,
                });
            }
        }
        return anomalias.sort((a, b) => b.zScore - a.zScore);
    }
    static calcularMedia(valores) {
        const suma = valores.reduce((acc, val) => acc + val, 0);
        return suma / valores.length;
    }
    static calcularDesviacionEstandar(valores, media) {
        const sumaDiferenciasCuadradas = valores.reduce((acc, val) => {
            const diferencia = val - media;
            return acc + diferencia * diferencia;
        }, 0);
        return Math.sqrt(sumaDiferenciasCuadradas / valores.length);
    }
}
exports.AnomaliasDetector = AnomaliasDetector;
//# sourceMappingURL=anomalias.detector.js.map