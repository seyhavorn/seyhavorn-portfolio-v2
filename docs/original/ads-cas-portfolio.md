# Cambodia Agrometeorological Service (ADS-CAS)

## Project Portfolio Documentation

---

## 1. Overview

**Cambodia Agrometeorological Service (CAS)** — codename **CASPEARL** — is a cloud-native, microservices-based early-warning and decision-support platform built to monitor, forecast, and disseminate climate and agricultural hazard information across Cambodia.

The system ingests real-time and modelled weather data (NOAA, ECMWF), processes it through domain-specific risk engines (flood, drought, cyclone, pest & disease), and delivers actionable advisory bulletins and push notifications to government agencies, meteorological officers, and farming communities.

### Highlights at a Glance

| Dimension | Detail |
|---|---|
| **Architecture** | Distributed microservices (12 independently deployable services) |
| **Core Framework** | Spring Boot 3.4 / Spring Cloud 2024.0 / Java 21 |
| **Service Discovery** | Netflix Eureka |
| **API Gateway** | Spring Cloud Gateway (reactive, WebFlux) |
| **Identity & Security** | Keycloak (OAuth 2.0 / OpenID Connect) |
| **Database** | PostgreSQL + PostGIS (geospatial) |
| **Caching** | Redis + Caffeine (multi-layer) |
| **Messaging** | RabbitMQ (AMQP) |
| **Observability** | OpenTelemetry · Prometheus · Grafana |
| **Containerization** | Docker · Docker Compose · Jib (container image build) |
| **API Documentation** | SpringDoc OpenAPI (Swagger UI) |

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
                            ┌──────────────────────┐
                            │    Keycloak (IAM)     │
                            │   OAuth 2.0 / OIDC    │
                            └──────────┬───────────┘
                                       │ JWT
                 ┌─────────────────────┼─────────────────────┐
                 │                     │                     │
                 ▼                     ▼                     ▼
┌────────────────────┐   ┌──────────────────────┐   ┌───────────────────┐
│    Web / Mobile    │──▶│    API Gateway        │──▶│  Discovery Server │
│    Clients         │   │  (Spring Cloud GW)    │   │   (Eureka)        │
└────────────────────┘   └──────────┬───────────┘   └───────────────────┘
                                    │
          ┌──────────┬──────────┬───┴────┬──────────┬──────────┐
          ▼          ▼          ▼        ▼          ▼          ▼
     ┌─────────┐ ┌────────┐ ┌───────┐ ┌────────┐ ┌────────┐ ┌──────────┐
     │ Weather │ │ Flood  │ │Drought│ │Cyclone │ │  Pest  │ │Bulletins │
     │ Service │ │Service │ │Service│ │Service │ │Disease │ │ Service  │
     └────┬────┘ └───┬────┘ └───┬───┘ └───┬────┘ └───┬────┘ └────┬─────┘
          │          │          │         │          │           │
          └──────────┴──────────┴────┬────┴──────────┴───────────┘
                                     │
          ┌──────────┬───────────────┼───────────────┬──────────┐
          ▼          ▼               ▼               ▼          ▼
     ┌─────────┐ ┌────────┐  ┌────────────┐  ┌──────────┐ ┌─────────┐
     │Identity │ │ Alerts │  │   News &   │  │  User-   │ │  Data   │
     │ Service │ │Service │  │Publications│  │  Notify  │ │(NetCDF) │
     └─────────┘ └────────┘  └────────────┘  └──────────┘ └─────────┘
                                     │
                              ┌──────┴──────┐
                              ▼             ▼
                     ┌──────────────┐ ┌──────────┐
                     │  PostgreSQL  │ │  Redis   │
                     │   + PostGIS  │ │  Cache   │
                     └──────────────┘ └──────────┘
```

### 2.2 Key Architectural Patterns

| Pattern | Implementation |
|---|---|
| **Service Discovery** | Eureka Server — all services register and discover peers dynamically |
| **API Gateway** | Spring Cloud Gateway — centralized routing, rate limiting, CORS, JWT validation |
| **Circuit Breaker** | Resilience4j — protects inter-service calls with fallback & retry logic |
| **Batch Processing** | Spring Batch — scheduled ETL pipelines for NetCDF ingestion, risk calculation |
| **Event-Driven** | RabbitMQ (AMQP) in user-notify for asynchronous notification dispatch |
| **Distributed Locking** | ShedLock (Redis-backed) — prevents duplicate scheduled-job executions |
| **Multi-Layer Caching** | Redis (distributed) + Caffeine (local in-memory) |
| **Geospatial Processing** | PostGIS, GeoTools, GeoJSON-Jackson, JTS, Hibernate Spatial |

---

## 3. Project Structure

```
ads-cas/
├── alerts/              # Alert notification service (Telegram bot, AgriMarket integration)
├── bulletins/           # Agrometeorological bulletin generation (dekadal, monthly, seasonal)
├── cyclone/             # Cyclone tracking & risk assessment (KML, geodesic, GeoJSON)
├── data/                # Shared data files (NetCDF, GeoTIFF, boundaries)
├── discovery/           # Service Discovery (Eureka Server)
├── docker-compose/      # Orchestration configs (default, local, observability, Telegram)
├── drought/             # Drought monitoring & forecasting (SPI, RDRIA, MSF03 models)
├── flood/               # Flood risk engine (rainfall × soil moisture × terrain)
├── gateway/             # API Gateway (Spring Cloud Gateway, reactive)
├── identity/            # Identity & access management (Keycloak admin client, JWT)
├── newspublications/    # CMS for news, publications, blog posts (multilingual)
├── pestdisease/         # Pest & disease risk via Growing Degree Days (GDD)
├── user-notify/         # Telegram Bot notification service (AMQP-driven)
├── weather/             # Core weather data platform (observations, NetCDF, FTP, forecasts)
├── images/              # Documentation images
├── 01_build-images.sh   # Build all Docker images
├── 02_save-docker-images.sh # Export Docker images as tar archives
├── 03_deploy-docker-image.sh # Deploy images to target servers
├── CaspearlReadme.md    # Detailed technical documentation
└── README.md            # Quick-start guide
```

---

## 4. Microservice Modules

### 4.1 Discovery Service

| Attribute | Value |
|---|---|
| **Port** | `6062` |
| **Role** | Service registry (Eureka Server) |
| **Key Deps** | `spring-cloud-starter-netflix-eureka-server`, Prometheus, OpenTelemetry |

All downstream microservices register with the Discovery Service on startup, enabling dynamic routing and load-balancing through the API Gateway.

---

### 4.2 Gateway Service

| Attribute | Value |
|---|---|
| **Port** | `6063` |
| **Role** | API Gateway — routing, authentication, rate limiting |
| **Key Deps** | Spring Cloud Gateway, Eureka Client, Resilience4j Circuit Breaker, Redis (reactive rate-limiting), Caffeine, OAuth 2.0 Resource Server |

- **Reactive** (WebFlux-based) for non-blocking request handling
- Centralized JWT validation via Keycloak
- Swagger UI aggregation through SpringDoc WebFlux
- Redis-backed response caching and rate limiting

---

### 4.3 Identity Service

| Attribute | Value |
|---|---|
| **Role** | User & role management, Keycloak administration |
| **Key Deps** | `keycloak-admin-client`, OAuth 2.0 Resource Server, Nimbus JOSE JWT, Caffeine cache |

Wraps the Keycloak Admin API to provide:
- User creation, update, deletion
- Role assignment & group management
- API-key validation and issuance
- JWT token introspection

---

### 4.4 Weather Service

| Attribute | Value |
|---|---|
| **Role** | Core weather data platform — observations, forecasts, rainfall |
| **Key Deps** | Spring Batch, NetCDF (cdm-core, udunits), GeoTools, PostGIS, Redis, Hibernate Spatial, FTP (commons-net) |

**Key capabilities:**
- **Data Ingestion**: Automated FTP downloads of XML weather data; NetCDF ingestion from NOAA and ECMWF models
- **Rainfall Risk Engine**: Threshold-based risk classification (No Risk → Watch → Warning → Alert)
- **Chance of Rain**: IDW (Inverse Distance Weighting) interpolation to aggregate per-step rain probabilities across administrative units
- **Scheduled Pipelines**: Hourly FTP sync, bi-hourly model processing, monthly partition maintenance
- **Geospatial**: GeoJSON and GeoTIFF output, PostGIS spatial queries

---

### 4.5 Flood Service

| Attribute | Value |
|---|---|
| **Role** | Multi-factor flood risk assessment |
| **Key Deps** | Spring Batch, OpenFeign, NetCDF, GeoTools, GeoJSON, JTS, PostGIS |

**Flood Risk Formula:**
```
flood_risk = (rainfall_risk × 0.7) + (soil_moisture_risk × 0.2) + (terrain_risk × 0.1)
```

- **Rainfall Risk** (70%): Sourced from Weather Service precipitation thresholds
- **Soil Moisture Risk** (20%): Classified from NetCDF soil-moisture percentages (≥50% = Alert)
- **Terrain Risk** (10%): Derived from DEM GeoTIFF elevation data (<75m = Alert)
- Final risk level: **NO_RISK** / **WATCH** / **WARNING** / **ALERT**
- ID Poor integration for vulnerability-weighted risk assessment

---

### 4.6 Drought Service

| Attribute | Value |
|---|---|
| **Role** | Drought monitoring, risk classification, and forecasting |
| **Key Deps** | Spring Batch, NetCDF, PostGIS |

- **Models**: RDRIA (Regional Drought and Rice Information Analysis), MSF03 (Multi-Scale 3-month Forecast)
- **Risk Classification**: Based on standardized anomaly thresholds (<0.5 = No Risk, ≥1.5 = Alert)
- **Forecasting**: Persistence and Linear Trend extrapolation up to 2 months ahead
- **Spatial Clipping**: Results clipped to Cambodia bounding box (10.4°–14.7° N, 102.3°–107.6° E)
- Output as GeoJSON with point-level risk assessments

---

### 4.7 Cyclone Service

| Attribute | Value |
|---|---|
| **Role** | Tropical cyclone tracking and risk assessment |
| **Key Deps** | JavaAPIforKml, GeographicLib, Geodesy, GeoJSON-Jackson, NetCDF, PostGIS |

- Parses KML-format cyclone track data
- Computes geodesic distances (Vincenty on WGS-84 ellipsoid)
- Risk zone classification based on proximity to cyclone track
- GeoJSON output for map visualization

---

### 4.8 Pest & Disease Service

| Attribute | Value |
|---|---|
| **Role** | Agriculture pest risk assessment via Growing Degree Days (GDD) |
| **Key Deps** | Spring Batch, NetCDF, PostGIS |

**Supports 8 pest species** with individual base temperatures:

| Pest | Base Temp (°C) |
|---|---|
| Diamondback Moth | 7.0 |
| Green Peach Aphid | 5.29 |
| Lipaphis erysimi | 6.0 |
| Striped Flea Beetle | 11.2 |
| Cutworms | 11.2 |
| Six-spot Leafhopper | 8.4 |
| Cabbage Looper | 10.0 |
| Leaf Miner | 11.6 |

- **Algorithm**: 30-day rolling GDD sum with upper cap (35°C), compared against 1991–2020 climatological norms (μ ± σ classification)
- **Forecasting**: Incomplete-month and next-month forecasts with probability estimation

---

### 4.9 Bulletins Service

| Attribute | Value |
|---|---|
| **Role** | Automated agrometeorological advisory bulletin generation |
| **Key Deps** | Spring Batch, NetCDF, GeoTools, PostGIS, Redis, Caffeine, Microsoft Cognitive Services (text-to-speech) |

Produces three bulletin types:

| Bulletin | Cadence | Content |
|---|---|---|
| **Dekadal** | Every 10 days | Rainfall anomaly maps, ADM2 hotspot narratives |
| **Monthly** | Monthly | Precipitation & temperature ensemble vs. observation analysis |
| **Seasonal** | Monthly (1st day) | Onset/cessation/length anomaly, planting window advisories |

- ADM1/ADM2-level statistical aggregation
- GeoJSON spatial layers for web/mobile visualization
- Crop advisory generation from multi-hazard indicators

---

### 4.10 Alerts Service

| Attribute | Value |
|---|---|
| **Role** | Multi-channel alert dispatch and AgriMarket price integration |
| **Key Deps** | Telegram Bots API, OkHttp, Resilience4j, Spring Retry, MapStruct, Spring Batch, WebFlux |

- **Telegram Bot**: Sends weather alerts, market price updates, and hazard warnings
- **AgriMarket Integration**: Fetches commodity and market data for agricultural advisories
- **Webhook Command System**: Extensible command pattern for bot interactions
- **Circuit Breaker**: Resilience4j wraps external API calls with retry and fallback

---

### 4.11 User Notification Service

| Attribute | Value |
|---|---|
| **Role** | Subscription-based push notification engine |
| **Key Deps** | RabbitMQ (AMQP), Telegram Bot, Redis, ShedLock, MapStruct, OkHttp, Flexmark (HTML→Markdown) |

- **Subscription Management**: Plans, credit-based usage, partner organizations
- **Message Queue**: AMQP-driven asynchronous notification processing
- **Distributed Scheduling**: ShedLock + Redis prevents duplicate job execution across instances
- **Template Engine**: Telegram message templates with HTML-to-Markdown conversion

---

### 4.12 News & Publications Service

| Attribute | Value |
|---|---|
| **Role** | Multilingual content management system (CMS) |
| **Key Deps** | Liquibase, MapStruct, Thumbnailator, PDFBox, Hibernate Spatial |

- **Multilingual**: Full i18n support with post/category translation entities
- **File Management**: Image thumbnailing (Thumbnailator), PDF processing (PDFBox)
- **Database Migrations**: Liquibase for schema version control
- **Blog Engine**: Posts, categories, tags, authors, reviews, visitors, dashboards

---

## 5. Technology Stack

### 5.1 Backend & Frameworks

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 (LTS) | Runtime language |
| Spring Boot | 3.4.5 | Application framework |
| Spring Cloud | 2024.0.0 | Microservices patterns |
| Spring Batch | (via Boot) | ETL & data pipelines |
| Spring Security | (via Boot) | Authentication & authorization |
| Spring WebFlux | (via Boot) | Reactive HTTP clients |

### 5.2 Data & Persistence

| Technology | Purpose |
|---|---|
| PostgreSQL + PostGIS | Relational DB + geospatial extensions |
| Spring Data JPA / Hibernate | ORM and repository pattern |
| Hibernate Spatial | Spatial data types in JPA |
| HikariCP | Connection pooling |
| Liquibase | Schema migration (newspublications) |
| Redis | Distributed caching & rate limiting |
| Caffeine | Local in-memory caching |

### 5.3 Scientific & Geospatial

| Technology | Purpose |
|---|---|
| NetCDF (cdm-core, udunits) | Climate model data I/O |
| GeoTools 33.1 | Geospatial data processing |
| PostGIS JDBC | Spatial DB operations |
| GeoJSON-Jackson | GeoJSON serialization |
| JTS (Topology Suite) | Geometry operations |
| GeographicLib / Geodesy | Geodesic distance computation |
| JavaAPIforKml | KML parsing (cyclone tracks) |

### 5.4 Cloud & DevOps

| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| Jib (Google) | Dockerless container builds |
| Eureka | Service discovery |
| Spring Cloud Gateway | API gateway |
| Resilience4j | Circuit breaker, retry, rate limiter |
| ShedLock | Distributed schedule locking |

### 5.5 Observability

| Technology | Purpose |
|---|---|
| OpenTelemetry (Java Agent) | Distributed tracing |
| Micrometer + Prometheus | Metrics collection |
| Grafana | Monitoring dashboards |
| Spring Actuator | Health checks & endpoints |

### 5.6 Communication & Integration

| Technology | Purpose |
|---|---|
| OpenFeign | Declarative inter-service HTTP clients |
| RabbitMQ (AMQP) | Asynchronous message queue |
| Telegram Bots API | Push notifications to users |
| OkHttp | HTTP client for external API calls |
| Commons-Net (FTP) | Weather data FTP retrieval |
| Microsoft Cognitive Services | Text-to-speech for bulletins |

### 5.7 Developer Tooling

| Technology | Purpose |
|---|---|
| Lombok | Boilerplate reduction |
| MapStruct | Type-safe DTO mapping |
| SpringDoc OpenAPI | Interactive API documentation (Swagger UI) |
| Maven | Build automation |

---

## 6. Installation & Setup

### 6.1 Prerequisites

- **Java 21** (JDK)
- **Maven 3.9+**
- **Docker** & **Docker Compose**
- **PostgreSQL 15+** with PostGIS extension
- **Redis 7+**
- **Keycloak 21+**

### 6.2 Build All Services

```bash
# Clone the repository
git clone <repository-url>
cd ads-cas

# Build all services (skip tests for speed)
mvn clean install -Dmaven.test.skip=true
```

### 6.3 Run Individual Services (Development)

```bash
# Navigate to a specific service
cd weather

# Run with Maven
mvn spring-boot:run
```

### 6.4 Docker Image Build

```bash
# Build all images with default version
./01_build-images.sh

# Build with specific version
./01_build-images.sh 1.0.0

# Build specific services only
./01_build-images.sh 1.0.0 alerts cyclone weather

# Alternative: Jib (no Dockerfile needed)
cd gateway && mvn compile jib:dockerBuild
```

### 6.5 Save & Deploy Docker Images

```bash
# Save all images as individual tar files
./02_save-docker-images.sh 1.0.0

# Save specific images in a combined archive
./02_save-docker-images.sh 1.0.0 combined gateway weather flood

# Deploy to target server
./03_deploy-docker-image.sh 1.0.0 bulletins --clean
```

### 6.6 Docker Compose Deployment

```bash
cd docker-compose/default

# 1. Start infrastructure (PostgreSQL, Redis, Keycloak)
IMAGE_TAG=1.0.0 docker-compose -f docker-compose.infrastructure.yml up -d

# 2. Start observability stack (Prometheus, Grafana, Loki)
IMAGE_TAG=1.0.0 docker-compose -f docker-compose.logging.yml up -d

# 3. Start application services
IMAGE_TAG=1.0.0 docker-compose up -d
```

---

## 7. Configuration

### 7.1 Service Ports & Endpoints

| Service | Port | URL | Notes |
|---|---|---|---|
| Discovery (Eureka) | 6062 | `http://localhost:6062` | Eureka dashboard |
| Gateway | 6063 | `http://localhost:6063` | Unified API entry point |
| Keycloak | 9091 | `http://localhost:9091/auth/admin` | IAM admin console |
| Grafana | 3000 | `http://localhost:3000` | Monitoring dashboards |

### 7.2 Environment Variables

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER-URI` | Keycloak JWT issuer |
| `SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_JWK-SET-URI` | Keycloak JWKS endpoint |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | Eureka server URL |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile |
| `IMAGE_TAG` | Docker image version tag |

### 7.3 Configuration Files

- Each service has its own `application.properties` / `application.yml`
- Shared configurations are managed via environment variables and config profiles
- All scheduled tasks are configured in the **Asia/Phnom_Penh** timezone

---

## 8. Key Features & Capabilities

### 8.1 Climate Hazard Monitoring

- ☁️ **Weather Observations** — Real-time and historical weather data ingestion from FTP/NOAA/ECMWF
- 🌧️ **Rainfall Risk** — Threshold-based alert classification with geospatial mapping
- 🌊 **Flood Risk** — Multi-factor analysis combining rainfall (70%), soil moisture (20%), and terrain (10%)
- 🏜️ **Drought Risk** — Standardized anomaly analysis with 2-month linear-trend forecasting
- 🌀 **Cyclone Tracking** — KML-based track parsing with geodesic proximity risk zones
- 🐛 **Pest & Disease** — GDD-based pest risk for 8 species with climatological comparison

### 8.2 Advisory & Communication

- 📋 **Automated Bulletins** — Dekadal, monthly, and seasonal agrometeorological advisories
- 📱 **Telegram Notifications** — Push alerts for weather warnings, market prices, and hazards
- 📰 **News & Publications** — Multilingual CMS with PDF and image processing
- 🛒 **AgriMarket Integration** — Commodity price monitoring via external API integration

### 8.3 Platform Capabilities

- 🔐 **Enterprise Security** — Keycloak-based SSO, RBAC, and API-key authentication
- 📊 **Full Observability** — OpenTelemetry tracing, Prometheus metrics, Grafana dashboards
- 🔄 **Resilience** — Circuit breakers, retry policies, and distributed lock management
- 🗺️ **Geospatial First** — PostGIS, GeoJSON, GeoTIFF, and IDW interpolation natively supported
- 📦 **DevOps Ready** — Automated Docker builds (Jib), compose orchestration, shell-script deployment pipeline

### 8.4 Data Processing Pipelines

- **Spring Batch ETL**: Scheduled ingestion of NetCDF, XML, and FTP data sources
- **Cron Scheduler**: Hourly to monthly cadences with timezone-aware execution
- **Partition Management**: Automatic PostgreSQL table partitioning for time-series data
- **IDW Interpolation**: Inverse Distance Weighting for spatial gap-filling in weather data

---

## 9. API Documentation

All services expose interactive API documentation via **Swagger UI**:

```
http://localhost:{service-port}/swagger-ui.html
```

The Gateway aggregates all downstream service APIs at:

```
http://localhost:6063/swagger-ui.html
```

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Host                              │
│                                                                 │
│  ┌────────────────────── Infrastructure ─────────────────────┐  │
│  │  PostgreSQL+PostGIS │ Redis │ Keycloak │ RabbitMQ         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────── Observability ────────────────────────┐  │
│  │  Prometheus │ Grafana │ Loki │ Tempo                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────── Application ──────────────────────────┐  │
│  │  Discovery │ Gateway │ Weather │ Flood │ Drought │ ...    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────── Notification ─────────────────────────┐  │
│  │  Alerts Bot │ User-Notify Bot                             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

Docker Compose files organize services into logical tiers:

| File | Content |
|---|---|
| `docker-compose.infrastructure.yml` | PostgreSQL, Redis, Keycloak, RabbitMQ |
| `docker-compose.logging.yml` | Prometheus, Grafana, Loki, Tempo |
| `docker-compose.yml` | All application microservices |
| `docker-compose.telegrambot.yml` | Telegram bot services |

---

## 11. Risk Calculation Algorithms Summary

### Rainfall Risk

```
if precipitation ≥ alert_threshold  → ALERT (3)
if precipitation ≥ warning_threshold → WARNING (2)
if precipitation ≥ watch_threshold  → WATCH (1)
else                                 → NO_RISK (0)
```

### Flood Risk (Weighted Composite)

```
flood_risk = (rainfall_risk × 0.7) + (soil_risk × 0.2) + (terrain_risk × 0.1)
```

### Drought Risk (Standardized Anomaly)

```
if |anomaly| ≥ 1.5 → ALERT (3)
if |anomaly| ≥ 1.0 → WARNING (2)
if |anomaly| ≥ 0.5 → WATCH (1)
else               → NO_RISK (0)
```

### Pest Risk (GDD Climatological Deviation)

```
g = 30-day rolling GDD sum at month end
if g > μ + 2σ → Class 3 (High Risk)
if g > μ + σ  → Class 2 (Moderately Elevated)
if g > μ − σ  → Class 1 (Normal)
else          → Class 0 (Below Normal)
```

---

## 12. Contributing

1. Follow standard Spring Boot layered architecture (Controller → Service → Repository)
2. Use constructor injection for all services
3. Apply `@Transactional` for data mutation operations
4. Keep DTOs lean; heavy computation stays in service layer
5. All scheduled jobs must use the `Asia/Phnom_Penh` timezone
6. Every service must expose health endpoints via Spring Actuator

---

## 13. License

This project is developed for the **Cambodia Ministry of Agriculture, Forestry and Fisheries** as part of the Agrometeorological Decision Support initiative.

---

> *Document generated from project source analysis. Last updated: April 2026.*
