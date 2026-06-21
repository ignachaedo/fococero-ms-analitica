"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analiticaRepository = void 0;
const db_1 = require("../config/db");
class AnaliticaRepository {
    construirFiltrosBase(params, startIdx = 1) {
        const conditions = [];
        const values = [];
        let idx = startIdx;
        if (params.startDate) {
            conditions.push(`fecha_ocurrencia >= $${idx++}`);
            values.push(params.startDate);
        }
        if (params.endDate) {
            conditions.push(`fecha_ocurrencia <= $${idx++}`);
            values.push(params.endDate);
        }
        if (params.categorias && params.categorias.length > 0) {
            conditions.push(`categoria = ANY($${idx++})`);
            values.push(params.categorias);
        }
        if (params.severidad) {
            conditions.push(`severidad = $${idx++}`);
            values.push(params.severidad);
        }
        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        return { where, values, nextIdx: idx };
    }
    async obtenerEstadisticasBase(params) {
        const { where, values } = this.construirFiltrosBase(params);
        const query = `
            SELECT id, fecha_sk, origen, categoria, severidad, latitud, longitud, 
                   tiempo_respuesta_segundos, fecha_ocurrencia 
            FROM fact_incidentes 
            ${where}
            ORDER BY fecha_ocurrencia ASC
        `;
        const result = await db_1.dbPool.query(query, values);
        return result.rows;
    }
    async obtenerDatosMapaCalor(params) {
        const { where, values, nextIdx } = this.construirFiltrosBase(params);
        let finalWhere = where;
        const idx = nextIdx; // Quitamos el let y lo dejamos constante
        if (params.minLat !== undefined &&
            params.maxLat !== undefined &&
            params.minLng !== undefined &&
            params.maxLng !== undefined) {
            const prefix = finalWhere ? " AND" : "WHERE";
            finalWhere += `${prefix} geom && ST_MakeEnvelope($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}, 4326)`;
            values.push(params.minLng, params.minLat, params.maxLng, params.maxLat);
            // Aquí ya no sumamos idx += 4 porque no se usa después. ESLint feliz.
        }
        const query = `SELECT latitud, longitud, severidad, categoria FROM fact_incidentes ${finalWhere}`;
        const result = await db_1.dbPool.query(query, values);
        return result.rows;
    }
    async obtenerIncidentesPorGeohash(geohash, limite) {
        const query = `
            SELECT id, categoria, severidad, latitud, longitud, fecha_ocurrencia, metadata
            FROM fact_incidentes
            WHERE geohash LIKE $1 || '%'
            ORDER BY fecha_ocurrencia DESC
            LIMIT $2
        `;
        const result = await db_1.dbPool.query(query, [geohash, limite]);
        return result.rows;
    }
    async obtenerIncidentesPorRadio(lat, lng, radioMetros, startDate, endDate) {
        const query = `
            SELECT id, categoria, severidad, latitud, longitud, fecha_ocurrencia
            FROM fact_incidentes
            WHERE fecha_ocurrencia >= $1 AND fecha_ocurrencia <= $2
            AND ST_DWithin(geom::geography, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5)
            ORDER BY ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography) ASC
        `;
        const result = await db_1.dbPool.query(query, [
            startDate,
            endDate,
            lng,
            lat,
            radioMetros,
        ]);
        return result.rows;
    }
    async obtenerSerieTiempoDiaria(startDate, endDate) {
        const query = `
            SELECT fecha_sk, COUNT(id) as total_incidentes
            FROM fact_incidentes
            WHERE fecha_ocurrencia >= $1 AND fecha_ocurrencia <= $2
            GROUP BY fecha_sk
            ORDER BY fecha_sk ASC
        `;
        const result = await db_1.dbPool.query(query, [startDate, endDate]);
        return result.rows;
    }
    async obtenerCategoriasUnicas() {
        const result = await db_1.dbPool.query("SELECT DISTINCT categoria FROM fact_incidentes WHERE categoria IS NOT NULL ORDER BY categoria ASC");
        return result.rows.map((row) => row.categoria);
    }
    async obtenerOrigenesUnicos() {
        const result = await db_1.dbPool.query("SELECT DISTINCT origen FROM fact_incidentes WHERE origen IS NOT NULL ORDER BY origen ASC");
        return result.rows.map((row) => row.origen);
    }
    async obtenerSeveridadesUnicas() {
        const result = await db_1.dbPool.query("SELECT DISTINCT severidad FROM fact_incidentes WHERE severidad IS NOT NULL ORDER BY severidad ASC");
        return result.rows.map((row) => row.severidad);
    }
    async asegurarDimensionTiempo(fecha) {
        const query = `
            INSERT INTO dim_tiempo (fecha_sk, fecha_completa, anio, mes, dia, dia_semana, es_fin_semana)
            VALUES ($1, $2, EXTRACT(YEAR FROM $2::date), EXTRACT(MONTH FROM $2::date), EXTRACT(DAY FROM $2::date), EXTRACT(ISODOW FROM $2::date), EXTRACT(ISODOW FROM $2::date) IN (6, 7))
            ON CONFLICT (fecha_sk) DO NOTHING
        `;
        const fechaSk = fecha.toISOString().split("T")[0];
        await db_1.dbPool.query(query, [fechaSk, fecha]);
    }
    async ingestarIncidente(inc) {
        const query = `
            INSERT INTO fact_incidentes (
                id, fecha_sk, origen, categoria, severidad, latitud, longitud, 
                geom, geohash, tiempo_respuesta_segundos, fecha_ocurrencia, metadata, created_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, 
                ST_SetSRID(ST_MakePoint($7, $6), 4326), ST_GeoHash(ST_SetSRID(ST_MakePoint($7, $6), 4326), 9), 
                $8, $9, $10, $11
            )
            ON CONFLICT (id) DO NOTHING
        `;
        await db_1.dbPool.query(query, [
            inc.id,
            inc.fecha_sk,
            inc.origen,
            inc.categoria,
            inc.severidad,
            inc.latitud,
            inc.longitud,
            inc.tiempo_respuesta_segundos,
            inc.fecha_ocurrencia,
            inc.metadata,
            inc.created_at,
        ]);
    }
    async refrescarVistasMaterializadas() {
        await db_1.dbPool.query("REFRESH MATERIALIZED VIEW CONCURRENTLY vw_incidentes_agregados");
    }
}
exports.analiticaRepository = new AnaliticaRepository();
//# sourceMappingURL=analitica.repository.js.map