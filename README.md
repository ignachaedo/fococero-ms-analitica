# ms-analitica

> Microservicio de Analítica Espacial y Procesamiento de Datos para FocoCero. Calcula KPIs operacionales, genera mapas de calor geoespaciales, ejecuta modelos predictivos de incidentes y consume eventos del bus de mensajería para mantener actualizadas las estadísticas en tiempo real.

![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen) ![Express](https://img.shields.io/badge/Express-5.2.1-blue) ![License](https://img.shields.io/badge/license-ISC-blue)

---

## 1. Descripción

Centraliza la inteligencia de datos de FocoCero. Procesa la información cruda de incidentes y la transforma en métricas accionables:

- **KPIs centralizados**: Totales, promedios de respuesta, nivel de riesgo global y distribuciones por categoría/severidad.
- **Mapas de calor en tiempo real**: Agrupa incidentes por geohash y genera GeoJSON listo para renderizar en mapas.
- **Pronóstico de incidentes**: Medias móviles (ventana de 14 días) para predecir la carga esperada a 7 días.
- **Detección de anomalías**: Motor estadístico basado en z-score (>2 desviaciones estándar) que dispara alertas.
- **Ingesta asíncrona**: Consume eventos del bus RabbitMQ para poblar la tabla de hechos (`fact_incidente`) desacoplado del resto del sistema.
- **Tareas programadas**: Cron que refresca vistas materializadas (3:00 AM) y ejecuta el detector de anomalías (cada hora).

---

## 2. Stack Tecnológico

| Categoría | Tecnología | Propósito |
|-----------|-----------|-----------|
| Runtime | Node.js ≥20 | Entorno de ejecución |
| Framework | Express v5 | Servidor HTTP (`path-to-regexp` v8) |
| Base de datos | PostgreSQL 15 + PostGIS | Tabla `fact_incidente` y vistas materializadas |
| Caché | Redis 7 | KPIs y mapas de calor cacheados (TTL 1 h) + mutex distribuido |
| Mensajería | RabbitMQ 3 | Consumo de eventos `fococero.events` con DLQ |
| Geo / ML | Turf.js v7, z-score propio | GeoJSON, cálculo de riesgo, detección de anomalías |
| Métricas | prom-client | Endpoint `/metrics` en formato Prometheus |
| Logging | pino + morgan | Logs JSON estructurados y trazas HTTP |
| Docs | swagger-ui-express | OpenAPI 3.0 en `/api/v1/analitica/docs` |
| Jobs | node-cron | Mantenimiento nocturno y detección horaria |
| Discovery | eureka-js-client | Registro en Eureka Server |

---

## 3. Requisitos

- **Node.js** ≥ 20.0.0, **npm** ≥ 9.x
- **PostgreSQL** 15 con PostGIS, **Redis** 7, **RabbitMQ** 3.x
- **Eureka Server** (Steeltoe) — opcional

---

## 4. Variables de Entorno

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `PORT` | ✅ | — | Puerto (3007 recomendado) |
| `NODE_ENV` | ❌ | `development` | Modo de ejecución |
| `INTERNAL_SECRET_TOKEN` | ✅ | — | Token de autenticación interna entre microservicios |
| `API_GATEWAY_URL` | ✅ | — | URL del gateway (CORS) |
| `EUREKA_HOST` | ❌ | `localhost` | Host de Eureka |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | ✅ | — | Credenciales PostgreSQL (`fococero_analitica`) |
| `DB_HOST` / `DB_HOST_LOCAL` | ✅ | — | Host de PostgreSQL |
| `DB_PORT` / `DB_PORT_LOCAL` | ✅ | — | Puerto de PostgreSQL |
| `REDIS_HOST` / `REDIS_HOST_LOCAL` | ✅ | — | Host de Redis |
| `REDIS_PORT` / `REDIS_PORT_LOCAL` | ✅ | — | Puerto de Redis |
| `RABBITMQ_URL` / `RABBITMQ_URL_LOCAL` | ❌ | `amqp://localhost` | URL de RabbitMQ |

> Las variantes `_LOCAL` se usan cuando `DB_HOST !== "db-fococero"`, apuntando a servicios locales durante desarrollo fuera de Docker.

---

## 5. Instalación

```bash
npm install
cp .env.example .env   # editar con valores correspondientes
npm run dev             # desarrollo con hot-reload
npm run build && npm start  # producción
```

Asegúrate de que PostgreSQL, Redis y RabbitMQ estén corriendo antes de iniciar.

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Hot-reload con ts-node-dev |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta compilado en producción |
| `npm test` | Tests con Jest |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## 6. Endpoints

Todas las rutas se montan bajo `/api/v1/analitica` (y también `/api/analitica` para compatibilidad con el gateway).

### Core — KPIs y Estadísticas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/core/kpis` | KPIs principales: total incidentes, tiempo promedio de respuesta, riesgo global |
| `GET` | `/core/kpis-ciudadano` | KPIs filtrados por `x-user-id` |
| `GET` | `/core/kpis-brigadista` | KPIs tácticos para brigadistas |
| `GET` | `/core/kpis-admin` | KPIs globales para administradores |
| `GET` | `/core/tendencias` | Serie de tiempo diaria para gráficos de líneas |
| `GET` | `/core/distribucion` | Distribución por categoría y severidad |
| `GET` | `/core/anomalias` | Anomalías estadísticas (z-score > 2) |

### Espacial — Mapas de Calor

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/espacial/heatmap` | FeatureCollection GeoJSON para mapa de calor |
| `GET` | `/espacial/detalle` | Detalle de incidentes por geohash |
| `GET` | `/espacial/radio` | Incidentes en radio circular (lat, lng, radioMetros) |

### Predictiva

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/predictiva/forecast` | Pronóstico a 7 días (medias móviles) |

### Filtros — Metadatos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/filtros/categorias` | Catálogo de categorías |
| `GET` | `/filtros/origenes` | Fuentes de datos activas |
| `GET` | `/filtros/severidades` | Niveles: ALTA, MEDIA, BAJA |

### Exportación

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/exportar/csv` | Descarga reporte CSV |
| `GET` | `/exportar/pdf` | Descarga reporte PDF |

### Operaciones

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/ops/health` | Health check detallado (DB, Redis, RabbitMQ) | Pública |
| `GET` | `/ops/metrics` | Métricas Prometheus | Pública |
| `POST` | `/ops/mantenimiento/sincronizar` | Fuerza sincronización de vistas materializadas | Interna |
| `POST` | `/ops/cache/purgar` | Invalida todo el caché Redis | Interna |

### Parámetros comunes

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `startDate` / `endDate` | ISO 8601 | Rango de fechas (opcional, si se omite se usa todo el histórico) |
| `categorias` | string | Lista separada por comas (ej: `INCENDIO,QUEMA`) |
| `severidad` | enum | `ALTA`, `MEDIA` o `BAJA` |

Los endpoints espaciales aceptan además `minLat`/`maxLat`/`minLng`/`maxLng` (bounding box, las 4 o ninguna), `geohash` + `limite`, y `lat`/`lng`/`radioMetros` (10–5000 m).

---

## 7. Swagger

Documentación interactiva OpenAPI 3.0 en:

```
http://localhost:3007/api/v1/analitica/docs
```

Servida mediante `swagger-ui-express`. Incluye todos los endpoints, esquemas `StatsQuery` y `ApiResponse`, y ejemplos de uso. La definición está en `src/docs/swagger.config.ts`.

---

## 8. Redis Caching

El servicio usa Redis 7 como caché distribuida con TTL de 1 hora.

| Clave | Contenido | TTL |
|-------|-----------|-----|
| `stats:<sha256(params)>` | KPIs y estadísticas procesadas | 3600 s |
| `heatmap:<sha256(params)>` | GeoJSON de mapa de calor | 3600 s |

El hash SHA-256 se genera con los parámetros ordenados alfabéticamente, garantizando que peticiones idénticas reutilicen la misma entrada.

**Mutex distribuido** (`RedisMutex`): Evita el efecto thundering herd usando `SET lock:<recurso> LOCKED NX EX 15`. Si un hilo gana el lock, calcula los datos y los escribe en caché; los demás esperan (hasta 100 reintentos con 50 ms de intervalo) y luego leen desde caché.

**Invalidación**: `POST /ops/cache/purgar` elimina todas las claves `stats:*` y `heatmap:*`.

---

## 9. RabbitMQ — Consumo de Eventos

### Topología

```
Exchange: fococero.events (topic, durable)
  └─ routing key: incidente.*
       └─ Queue: analitica.incidentes.queue (durable)
            ├─ ACK   → IngestaService.procesarEventoIncidente()
            └─ NACK  → DLX: fococero.dlx (topic)
                         └─ Queue: analitica.incidentes.dlq
                              └─ DlqConsumer → log crítico + ACK
```

| Consumidor | Cola | Propósito |
|-----------|------|-----------|
| `IncidenteConsumer` | `analitica.incidentes.queue` | Transforma el payload y lo ingesta en `fact_incidente` |
| `DlqConsumer` | `analitica.incidentes.dlq` | Drena mensajes fallidos con log crítico (`x-first-death-reason`) |

**Ciclo de vida**:
1. Otro microservicio publica en `fococero.events` con routing key `incidente.*`.
2. `IncidenteConsumer` recibe, transforma con `IncidenteTransformer` y persiste mediante `IngestaService`.
3. Si falla, el mensaje va a la DLQ `analitica.incidentes.dlq` vía el DLX `fococero.dlx`.
4. `DlqConsumer` registra el error con metadatos y hace ACK.

> No hay reintentos automáticos en la cola principal. Mensajes fallidos van directamente a DLQ.

---

## 10. Seguridad

**Autenticación interna** — Todas las rutas (excepto `/health` y `/metrics`) validan el header:
```
x-internal-token: <INTERNAL_SECRET_TOKEN>
```
Si es inválido o ausente: `401 Acceso denegado`.

**Rate limiting** (endpoints espaciales, predictiva, exportación): 30 peticiones por IP en ventana de 60 segundos. Headers `X-RateLimit-Limit` y `X-RateLimit-Remaining`. Respuesta `429` al exceder.

**Helmet**: Políticas CSP restrictivas, `X-Content-Type-Options`, `X-Frame-Options`.

**CORS**: Restringido al origen definido en `API_GATEWAY_URL`.

**Secretos**: Variables sensibles validadas con `env-var` + Zod. No se loguean tokens ni contraseñas.

---

## 11. Eureka — Service Discovery

| Parámetro | Valor |
|-----------|-------|
| App ID | `ms-analitica` |
| Hostname | `ms-analitica` (o `$HOSTNAME`) |
| Puerto | `envs.PORT` |
| Health check | `GET /health` |
| Eureka host | `envs.EUREKA_HOST` (default `eureka-server:8761`) |

**Flujo**: `bootstrap()` → `initEureka()` → `eurekaClient.start()`. En shutdown controlado (`SIGINT`/`SIGTERM`), se retira de Eureka antes de cerrar el servidor HTTP. Timeout de seguridad: 10 s.

```json
GET /health → { "status": "UP", "service": "ms-analitica", "timestamp": "..." }
```

---

## Estructura del Proyecto

```
src/
├── app.ts                     # Express setup, middlewares, rutas
├── index.ts                   # Bootstrap, conexiones, graceful shutdown
├── cache/                     # Redis: reportes.cache.ts, redis.mutex.ts
├── config/                    # envs, db, redis, rabbitmq, eureka, logger
├── controllers/               # Handlers HTTP
├── docs/                      # swagger.config.ts (OpenAPI 3.0)
├── events/                    # RabbitMQ: IncidenteConsumer, DlqConsumer
├── helpers/                   # Logger, AppError, catchAsync
├── jobs/                      # Cron: MantenimientoJob (3 AM), AnomaliasJob (c/hora)
├── middlewares/               # internalAuth, metrics, rate-limit, error
├── ml/                        # anomalias.detector, riesgo.calculator, geojson.transformer
├── models/                    # Interfaces del dominio
├── repositories/              # Acceso a PostgreSQL
├── routes/                    # Definiciones Express
├── services/                  # Lógica de negocio (core, espacial, predictiva, ingesta, etc.)
├── transformers/              # Transformación de datos
└── validators/                # Esquemas Zod en español
```

---

## Jobs Programados

| Job | Cron | Descripción |
|-----|------|-------------|
| `MantenimientoJob` | `0 3 * * *` | Sincroniza vistas materializadas en PostgreSQL |
| `AnomaliasJob` | `0 * * * *` | Ejecuta detección con ventana de 30 días y notifica anomalías críticas |

---

## Monitoreo

**Métricas Prometheus**: `GET /metrics` expone contadores HTTP, duración de respuestas y errores desde `prom-client`.

**Logs**: Estructurados en JSON con `pino`. Trazas HTTP con `morgan` (timestamp, método, ruta, status, duración).
