/**
 * @fileoverview Servicio de health check para ms-analitica.
 * Verifica el estado de las dependencias críticas: PostgreSQL, Redis y RabbitMQ,
 * y retorna un estado agregado del microservicio.
 */

import { dbPool } from "../config/db";
import { redisCache } from "../config/redis";
import { rabbitMQBus } from "../config/rabbitmq";

/** Estado de salud del microservicio */
export interface IHealthStatus {
  status: "OK" | "DEGRADED" | "DOWN";
  timestamp: string;
  services: {
    database: "UP" | "DOWN";
    redis: "UP" | "DOWN";
    rabbitmq: "UP" | "DOWN";
  };
}

class HealthService {
  /**
   * Verifica el estado de todas las dependencias del microservicio.
   *
   * @description Evalúa PostgreSQL (query SELECT 1), Redis (conexión abierta)
   * y RabbitMQ (canal disponible). Retorna OK si todas están UP,
   * DEGRADED si alguna falla, DOWN si todas fallan.
   *
   * @returns Estado de salud con detalle por servicio
   */
  public async check(): Promise<IHealthStatus> {
    let dbStatus: "UP" | "DOWN";
    let redisStatus: "UP" | "DOWN";
    let mqStatus: "UP" | "DOWN";

    try {
      await dbPool.query("SELECT 1");
      dbStatus = "UP";
    } catch {
      dbStatus = "DOWN";
    }

    try {
      const client = redisCache["client"];
      redisStatus = client && client.isOpen ? "UP" : "DOWN";
    } catch {
      redisStatus = "DOWN";
    }

    try {
      const channel = rabbitMQBus.getChannel();
      mqStatus = channel ? "UP" : "DOWN";
    } catch {
      mqStatus = "DOWN";
    }

    const allUp =
      dbStatus === "UP" && redisStatus === "UP" && mqStatus === "UP";
    const allDown =
      dbStatus === "DOWN" && redisStatus === "DOWN" && mqStatus === "DOWN";

    return {
      status: allUp ? "OK" : allDown ? "DOWN" : "DEGRADED",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
        rabbitmq: mqStatus,
      },
    };
  }

  /**
   * Genera métricas de uso de memoria del proceso en formato Prometheus.
   *
   * @returns Métricas de memory RSS, heap total y heap usado
   */
  public async getMetrics(): Promise<string> {
    const memoryUsage = process.memoryUsage();
    return (
      [
        "# HELP process_resident_memory_bytes Resident memory size in bytes.",
        "# TYPE process_resident_memory_bytes gauge",
        `process_resident_memory_bytes ${memoryUsage.rss}`,
        "# HELP process_heap_total_bytes Total heap size in bytes.",
        "# TYPE process_heap_total_bytes gauge",
        `process_heap_total_bytes ${memoryUsage.heapTotal}`,
        "# HELP process_heap_used_bytes Used heap size in bytes.",
        "# TYPE process_heap_used_bytes gauge",
        `process_heap_used_bytes ${memoryUsage.heapUsed}`,
      ].join("\n") + "\n"
    );
  }
}

export const healthService = new HealthService();
