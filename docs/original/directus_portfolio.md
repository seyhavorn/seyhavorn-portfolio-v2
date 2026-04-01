# 📄 Directus CMS Factory — Project Portfolio Documentation

> **A multi-tenant CMS provisioning platform** that orchestrates isolated Directus CMS instances with a Spring Boot backend and delivers dynamic, multilingual public websites powered by Vue 3.

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [High-Level Architecture](#-high-level-architecture)
3. [Project Structure](#-project-structure)
4. [Technology Stack](#-technology-stack)
5. [Module Breakdown](#-module-breakdown)
   - [CMS Backend (Spring Boot)](#1-cms-backend--spring-boot-orchestration-api)
   - [Directus Template (CMS + Public Website)](#2-directus-template--cms--public-website)
6. [Key Features](#-key-features)
7. [Installation & Setup](#-installation--setup)
8. [Configuration](#-configuration)
9. [Deployment](#-deployment)
10. [API Reference](#-api-reference)
11. [Contributing](#-contributing)

---

## 🌐 Overview

**Directus CMS Factory** is an enterprise-grade, multi-tenant content management platform developed by **Bronx Technology**. The system allows operators to provision fully isolated Directus CMS instances on demand — each with its own database, admin panel, and public-facing website — all managed through a centralized Spring Boot API.

### Problem Solved

Organizations with multiple departments, brands, or clients need independent CMS instances without the operational overhead of manual setup. This platform automates the full lifecycle:

| Lifecycle Stage | What the Platform Does |
|---|---|
| **Provisioning** | Creates a new PostgreSQL database, spins up a Directus Docker container, and configures Nginx reverse-proxy — all via a single API call. |
| **Management** | Centralized dashboard for monitoring instance health, managing users/roles/permissions, and organizing by department. |
| **Content Delivery** | Each instance ships with a pre-built Vue 3 SPA that consumes Directus content via its REST API, supporting dynamic pages, blog posts, forms, i18n, and visual editing. |
| **Teardown** | Soft-delete instances with audit trails; containers and databases can be cleaned up gracefully. |

---

## 🏗 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CMS Backend (Spring Boot)                    │
│                         Port 8081 · Java 21                         │
│  ┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │   Auth   │  │  Instance    │  │   User /   │  │  Dashboard   │  │
│  │ (JWT/RSA)│  │ Provisioning │  │   RBAC     │  │  & Health    │  │
│  └──────────┘  └──────┬───────┘  └────────────┘  └──────────────┘  │
│                       │ Docker CLI / Docker Compose                  │
└───────────────────────┼─────────────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────────────┐
          ▼             ▼                     ▼
   ┌────────────┐ ┌────────────┐      ┌────────────┐
   │ CMS DB     │ │ Directus   │ ...  │ Directus   │
   │ (Postgres) │ │ Instance 1 │      │ Instance N │
   │ Port 54324 │ │ (Docker)   │      │ (Docker)   │
   └────────────┘ └─────┬──────┘      └─────┬──────┘
                        │                    │
                  ┌─────┴──────┐       ┌─────┴──────┐
                  │ Instance   │       │ Instance   │
                  │ DB (PG)    │       │ DB (PG)    │
                  │ Port 54325 │       │            │
                  └────────────┘       └────────────┘

   Each Directus Instance Container:
   ┌──────────────────────────────────────────┐
   │  Nginx (Port 80)                         │
   │  ├── /admin/*  → Directus API (:8055)    │
   │  ├── /items/*  → Directus API (:8055)    │
   │  └── /*        → Vue SPA (static files)  │
   │                                          │
   │  Supervisor manages:                     │
   │    • Directus (Node.js :8055)            │
   │    • Nginx (static + reverse proxy)      │
   └──────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
directus/
├── cms-backend/                          # Spring Boot orchestration backend
│   ├── src/main/java/bronx/cms/directus/
│   │   ├── config/                       # Security, RSA keys, data seeder
│   │   ├── controller/                   # REST API controllers
│   │   │   ├── AuthController.java       # JWT login / refresh / logout
│   │   │   ├── DirectusInstanceController.java  # Instance CRUD
│   │   │   ├── DirectusImageInstanceController.java
│   │   │   ├── DashboardController.java  # Aggregated statistics
│   │   │   ├── UserController.java       # User management
│   │   │   ├── RoleController.java       # Role management
│   │   │   ├── PermissionController.java # Permission management
│   │   │   └── DepartmentController.java # Department management
│   │   ├── dto/                          # Request/Response DTOs
│   │   ├── entity/                       # JPA entities
│   │   │   ├── DirectusInstance.java     # Core: tracks provisioned instances
│   │   │   ├── User.java
│   │   │   ├── Role.java
│   │   │   ├── Permission.java
│   │   │   └── Department.java
│   │   ├── enums/                        # PermissionType, etc.
│   │   ├── exception/                    # Global error handling
│   │   ├── mapper/                       # Entity ↔ DTO mappers
│   │   ├── model/                        # Value objects
│   │   ├── repository/                   # JPA + custom repositories
│   │   ├── scheduler/                    # Instance health-check scheduler
│   │   ├── service/                      # Business logic interfaces
│   │   │   └── impl/                     # Service implementations
│   │   │       ├── DirectusInstanceServiceImpl.java
│   │   │       ├── DirectusImageProvisionService.java
│   │   │       └── ...
│   │   └── util/                         # DockerCliUtil, PortUtils, encryptor
│   ├── src/main/resources/
│   │   ├── application.properties        # Spring config (DB, JWT, Docker)
│   │   ├── certs/                        # RSA key pair (private.pem, public.pem)
│   │   ├── db/migration/                 # Flyway SQL migrations
│   │   └── templates/directus/           # Docker Compose & Nginx templates
│   ├── Dockerfile                        # Multi-stage: Maven build → JRE runtime
│   ├── docker-compose.yml                # Backend + 2× PostgreSQL
│   ├── 01_build-images.sh                # Build Docker image
│   ├── 02_save-docker-images.sh          # Export image as .tar
│   └── 03_deploy-docker-image.sh         # Deploy to remote server
│
├── directus-template-uat/                # Directus CMS + Vue 3 public website
│   ├── public-website/                   # Vue 3 SPA (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── components/               # Reusable Vue components
│   │   │   │   ├── Navigation.vue        # Dynamic navigation from CMS
│   │   │   │   ├── Footer.vue            # Dynamic footer from CMS
│   │   │   │   ├── BlockRenderer.vue     # Page-block rendering engine
│   │   │   │   ├── FormSection.vue       # Dynamic form builder
│   │   │   │   ├── PostsSection.vue      # Blog posts listing
│   │   │   │   └── VisualEditingBar.vue  # Directus live editing overlay
│   │   │   ├── pages/                    # Route-level page components
│   │   │   │   ├── HomePage.vue          # Landing page
│   │   │   │   ├── DynamicPage.vue       # CMS-driven pages (slug routing)
│   │   │   │   ├── PostsPage.vue         # Blog listing with filters
│   │   │   │   ├── PostDetail.vue        # Blog post single view
│   │   │   │   ├── FormsPage.vue         # CMS-driven form system
│   │   │   │   └── RedirectsPage.vue     # URL redirection handler
│   │   │   ├── composables/              # Reusable composition functions
│   │   │   │   ├── useFormatDate.ts      # Locale-aware date formatting
│   │   │   │   ├── useGlobals.ts         # Site-wide settings
│   │   │   │   ├── useNavigation.ts      # Navigation data
│   │   │   │   ├── useTranslation.ts     # i18n helpers
│   │   │   │   ├── useLanguageFont.ts    # Dynamic font loading per language
│   │   │   │   ├── useLanguageFlags.ts   # Language flag icons
│   │   │   │   └── useScroll.ts          # Scroll behavior utilities
│   │   │   ├── stores/                   # Pinia state management
│   │   │   │   ├── globals.ts            # Site settings store
│   │   │   │   ├── navigation.ts         # Navigation menu store
│   │   │   │   └── language.ts           # Language/locale store
│   │   │   ├── services/                 # API service layer
│   │   │   │   └── api.ts               # Generic Directus SDK wrapper
│   │   │   ├── types/                    # TypeScript type definitions
│   │   │   │   └── directus.ts           # Full Directus schema types
│   │   │   ├── i18n/                     # Internationalization
│   │   │   │   ├── i18n.ts              # vue-i18n setup
│   │   │   │   └── locales/             # en.ts, km.ts (Khmer)
│   │   │   ├── layouts/                  # Layout wrappers
│   │   │   ├── utils/                    # Directus SDK initialization
│   │   │   └── main.ts                   # App entry point & router
│   │   ├── vite.config.ts                # Vite build configuration
│   │   ├── tailwind.config.js            # Tailwind CSS v4 config
│   │   └── package.json
│   ├── config/                           # Instance configuration templates
│   │   ├── docker-compose.yml            # Reference Directus + PG stack
│   │   ├── directus.conf                 # Nginx config for Directus
│   │   ├── instance.conf                 # Nginx config for provisioned instances
│   │   └── website.conf                  # Nginx config for public website
│   ├── scripts/                          # Automation scripts
│   │   ├── init.sh                       # Container initialization
│   │   ├── update-admin.mjs              # Admin user provisioning
│   │   └── query_perms.mjs              # Permission setup
│   ├── extensions/                       # Directus custom extensions
│   ├── nginx.conf                        # Combined Nginx routing config
│   ├── supervisord.conf                  # Process manager (Directus + Nginx)
│   ├── Dockerfile                        # Multi-stage: Vue build → Directus + Nginx
│   ├── snapshot.yaml                     # Directus schema snapshot
│   └── directus_schema.sql              # Full database schema dump
│
└── docs/                                 # Documentation
```

---

## 🛠 Technology Stack

### Backend (CMS Orchestration API)

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 21 (LTS) | Primary language |
| **Spring Boot** | 3.5.6 | Application framework |
| **Spring Security** | — | Authentication & authorization |
| **OAuth2 Resource Server** | — | JWT (RSA-signed) token validation |
| **Spring Data JPA** | — | Database ORM |
| **Hibernate** | — | JPA implementation |
| **PostgreSQL** | 17 | Relational database |
| **Flyway** | 11.7.2 | Database migrations |
| **Lombok** | — | Boilerplate reduction |
| **Spring Actuator** | — | Health monitoring endpoints |
| **Jib** | 3.4.2 | Container image builder |
| **Docker CLI** | — | Instance provisioning via `ProcessBuilder` |

### CMS Platform

| Technology | Version | Purpose |
|---|---|---|
| **Directus** | 11.10.2 | Headless CMS |
| **@directus/sdk** | 18.0.3 | TypeScript SDK for API access |
| **@directus/visual-editing** | 1.1.0 | In-page visual editor |
| **PostgreSQL** | 16/17 | Directus database |
| **Nginx** | — | Reverse proxy + static file server |
| **Supervisor** | — | Process management (Directus + Nginx) |

### Frontend (Public Website)

| Technology | Version | Purpose |
|---|---|---|
| **Vue 3** | 3.5.24 | UI framework (Composition API) |
| **TypeScript** | 5.8.3 | Type-safe development |
| **Vite** | 6.0.7 | Build tool & dev server |
| **Vue Router** | 4.6.4 | Client-side routing |
| **Pinia** | 3.0.4 | State management |
| **Tailwind CSS** | 4.1.18 | Utility-first styling |
| **vue-i18n** | 11.2.8 | Internationalization (English + Khmer) |
| **@headlessui/vue** | 1.7.23 | Accessible UI primitives |
| **@heroicons/vue** | 2.2.0 | SVG icons |
| **Express** | 5.2.1 | SSR / preview server |

### DevOps & Infrastructure

| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy, SSL termination, static hosting |
| **AWS EC2** | Production hosting |
| **PM2** | Node.js process management (production) |
| **Let's Encrypt** | Free SSL certificates |
| **Shell Scripts** | CI/CD build & deploy automation |

---

## 🧩 Module Breakdown

### 1. CMS Backend — Spring Boot Orchestration API

The backend is the **control plane** that manages the lifecycle of Directus CMS instances.

#### Core Responsibilities

- **Authentication & Authorization**: RSA-signed JWT tokens with access/refresh token rotation and token blacklisting.
- **Directus Instance Provisioning**: Creates a PostgreSQL database, generates a `docker-compose.yml` from templates, and starts a new Directus Docker container — all programmatically via `DockerCliUtil`.
- **Nginx Auto-Proxy**: Automatically generates Nginx reverse-proxy configurations for each new instance, enabling subdomain routing (e.g., `finance.bronxtechnology.online`).
- **Health Monitoring**: A scheduled task (`InstanceHealthScheduler`) periodically checks the health status of all provisioned Directus containers.
- **RBAC System**: Multi-layered Role-Based Access Control with Users → Roles → Permissions.
- **Department Management**: Organizes instances by organizational departments.
- **Dashboard Analytics**: Aggregated statistics (total instances, active/inactive counts, etc.).

#### Architecture Pattern

```
Controller → Service (Interface) → ServiceImpl → Repository (JPA) → PostgreSQL
                                        │
                                        ├→ DockerCliUtil (Docker CLI commands)
                                        ├→ Flyway (per-instance DB migrations)
                                        └→ Nginx template rendering
```

#### Key Design Decisions

- **Soft deletes** via `@SQLDelete` / `@Where` annotations — instances are never hard-deleted.
- **Credential encryption** using `AttributeEncryptor` (JPA `@Convert`) for database passwords stored at rest.
- **Docker-in-Docker** pattern — the backend container mounts the host's Docker socket (`/var/run/docker.sock`) and uses `nsenter` for host-level Nginx reloads.
- **Template-based provisioning** — `.env` files, `docker-compose.yml`, and Nginx configs are rendered from templates with instance-specific values.

---

### 2. Directus Template — CMS + Public Website

Each provisioned Directus instance is a **unified Docker image** that bundles:

1. **Directus CMS** (Node.js, port 8055) — the headless CMS API and admin panel.
2. **Vue 3 SPA** (static files served by Nginx) — the public-facing website.
3. **Nginx** (port 80) — routes traffic between the admin panel, API, and frontend.

#### Unified Container Architecture

Supervisor manages two processes inside a single container:

```
[Supervisor]
  ├── [Directus]  → Node.js on :8055
  │     ├── Admin Panel  (/admin)
  │     ├── REST API     (/items, /auth, /files, ...)
  │     └── WebSocket    (/websocket)
  │
  └── [Nginx]     → Port :80
        ├── /admin/*      → proxy_pass :8055
        ├── /items/*      → proxy_pass :8055
        ├── /assets/*     → proxy_pass :8055
        ├── /websocket    → proxy_pass :8055 (WebSocket upgrade)
        └── /*            → Vue SPA (try_files → index.html)
```

#### Frontend Architecture (Vue 3 SPA)

The public website follows a **component-driven, CMS-first** architecture:

- **Dynamic Page Rendering**: Pages are fetched from Directus by slug (`/:slug`). Each page contains an ordered list of **blocks** rendered by the `BlockRenderer.vue` engine.
- **Block Types**: `hero`, `content`, `rich_text`, `image`, `cta`, `features`, `testimonials`, `gallery`, `team`, `pricing`, `faq`, `stats`, `posts_list`, `posts_featured`, `form_embed`, `button_group`, and more.
- **Internationalization (i18n)**: Full support for English and Khmer (with language-specific font loading). Translations are pulled from both Directus `translations` fields and static `vue-i18n` locale files.
- **Directus Visual Editing**: The `@directus/visual-editing` SDK enables in-context editing with live overlay controls directly on the public website.
- **State Management**: Three Pinia stores — `globals` (site settings), `navigation` (dynamic menus), and `language` (locale state).

#### Content Model

```
globals (Singleton)     ← Site-wide settings, logos, social links
navigation              ← Menu structures (main, footer)
  └── navigation_items  ← Individual menu items (recursive tree)
pages                   ← CMS-managed pages
  └── pages_blocks (M2M junction)
        └── blocks      ← Modular content blocks
posts                   ← Blog articles
  ├── categories (M2O)
  └── authors (M2O → directus_users)
forms                   ← Dynamic form definitions
redirects               ← URL redirect rules
```

---

## ✨ Key Features

### Multi-Tenant Instance Provisioning
- Create fully isolated Directus CMS instances via a single API call
- Each instance gets its own PostgreSQL database, Docker container, and subdomain
- Automated Nginx reverse-proxy configuration for subdomain routing
- Template-based configuration with customizable defaults

### Centralized Management Dashboard
- Real-time monitoring of all provisioned instances
- Health status tracking with scheduled health-check scheduler
- Instance CRUD operations with soft-delete support
- Department-based organization

### Role-Based Access Control (RBAC)
- RSA-signed JWT authentication (access + refresh tokens)
- Token blacklisting for secure logout
- Users → Roles → Permissions hierarchy
- Granular permission types via `PermissionType` enum

### Dynamic, CMS-Driven Public Websites
- Block-based page builder with 15+ block types
- Dynamic navigation menus managed from the CMS
- Blog system with categories, authors, tags, and view tracking
- CMS-driven forms system
- URL redirect management

### Internationalization (i18n)
- Full English and Khmer language support
- CMS-level translations (Directus `translations` fields)
- Static translations via `vue-i18n`
- Language-specific font loading (e.g., Khmer fonts)
- Locale-aware date formatting

### Visual Editing
- In-context editing powered by `@directus/visual-editing`
- Overlay controls on the live public website
- Seamless integration with Directus admin panel

### Production-Ready Infrastructure
- Multi-stage Docker builds for optimized images
- Gzip compression and static asset caching via Nginx
- PM2 process management for production deployments
- Automated backup scripts with rotation
- Let's Encrypt SSL integration
- EC2 deployment guides and scripts

---

## 🚀 Installation & Setup

### Prerequisites

| Requirement | Version |
|---|---|
| Java | 21+ |
| Maven | 3.9+ |
| Node.js | 18+ (20 LTS recommended) |
| Docker | 20.10+ |
| Docker Compose | v2+ |
| PostgreSQL | 16+ (or Docker) |

### 1. Clone the Repository

```bash
git clone <repository-url>
cd directus
```

### 2. Set Up the CMS Backend

```bash
cd cms-backend

# Copy environment configuration
cp .env.example .env
# Edit .env with your database credentials

# Start infrastructure (PostgreSQL databases)
docker compose up -d cmsdb directusdb

# Run the Spring Boot backend
./mvnw spring-boot:run
```

The backend API will be available at `http://localhost:8081`.

### 3. Set Up the Directus CMS Template

```bash
cd directus-template-uat

# Install Directus dependencies
npm install

# Configure environment
# Edit .env (database connection, admin credentials, secrets)

# Bootstrap Directus (first run - creates tables & admin user)
npx directus bootstrap

# Start Directus
npm run dev
```

Directus will be available at `http://localhost:8062`.

### 4. Set Up the Public Website

```bash
cd directus-template-uat/public-website

# Install frontend dependencies
npm install

# Start the Vue dev server
npm run dev
```

The public website dev server will be available at `http://localhost:3001` (or configured port).

### 5. Apply a Directus Template (Optional)

```bash
npx directus-template-cli@latest apply \
  --directusUrl "http://localhost:8062" \
  --userEmail "admin@example.com" \
  --userPassword "admin123" \
  --templateLocation "agency-os" \
  --templateType community
```

---

## ⚙️ Configuration

### CMS Backend (`cms-backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `IMAGE_TAG` | `latest` | Docker image version tag |
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring Boot active profile |
| `PLATFORM` | `linux/amd64` | Docker build platform |
| `POSTGRES_USER` | `homestead` | CMS database username |
| `POSTGRES_PASSWORD` | `secret` | CMS database password |
| `DIRECTUS_DB_USERNAME` | `homestead` | Directus instance DB username |
| `DIRECTUS_DB_PASSWORD` | `secret` | Directus instance DB password |
| `DIRECTUS_DOCKER_IMAGE` | `directus-website-combined-v2:latest` | Docker image for new instances |
| `DIRECTUS_BASE_DOMAIN` | `bronxtechnology.online` | Base domain for subdomains |
| `DIRECTUS_NGINX_AUTO_PROXY` | `true` | Auto-generate Nginx proxy configs |
| `JWT_ACCESS_EXPIRATION_MS` | `900000` (15 min) | Access token TTL |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` (7 days) | Refresh token TTL |
| `SCHEDULING_ENABLED` | `false` | Enable health-check scheduler |

### Directus Instance (`directus-template-uat/.env`)

| Variable | Description |
|---|---|
| `HOST` | Listen address (default `0.0.0.0`) |
| `PORT` | Directus port (default `8062`) |
| `PUBLIC_URL` | Public-facing URL |
| `DB_CLIENT` | Database driver (`pg`) |
| `DB_HOST` / `DB_PORT` / `DB_DATABASE` | PostgreSQL connection |
| `SECRET` | Session/token secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin credentials |
| `CORS_ENABLED` | Enable CORS (`true`) |
| `STORAGE_LOCAL_ROOT` | File upload directory |
| `EXTENSIONS_PATH` | Custom extensions directory |

### Frontend (`public-website/.env.*`)

| Variable | Description |
|---|---|
| `VITE_DIRECTUS_URL` | Directus API base URL |

---

## 🚢 Deployment

### Docker Build & Deploy Pipeline

The project includes a complete CI/CD-ready deployment pipeline:

```bash
# 1. Build Docker image
./01_build-images.sh [version]

# 2. Export image as .tar for transfer
./02_save-docker-images.sh [version]

# 3. Deploy to remote server
./03_deploy-docker-image.sh [version]
```

### Building the Unified Directus Image

The `directus-template-uat/Dockerfile` uses a **multi-stage build**:

1. **Stage 1 (frontend-builder)**: Builds the Vue 3 SPA with `npm run build:prod`
2. **Stage 2 (runtime)**: Installs Directus, copies the built frontend into Nginx's web root, configures Supervisor

```bash
cd directus-template-uat
docker build -t directus-website-combined-v2:latest .
```

### Production Deployment (EC2)

The project includes a comprehensive EC2 Deployment Guide covering:

1. EC2 instance setup (t3.small/t3.medium recommended)
2. Node.js 20 LTS installation via NVM
3. PostgreSQL 16+ installation and configuration
4. Directus project setup and bootstrapping
5. PM2 process management
6. Nginx reverse proxy configuration
7. Let's Encrypt SSL setup
8. Automated backup scripts with cron rotation
9. Monitoring and maintenance procedures

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate and receive JWT tokens |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Invalidate tokens |

### Directus Instances

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/instances` | Provision a new Directus instance |
| `GET` | `/instances` | List all instances |
| `GET` | `/instances/{uuid}` | Get instance details |
| `PUT` | `/instances/{uuid}` | Update instance configuration |
| `DELETE` | `/instances/{uuid}` | Soft-delete an instance |

### Users, Roles & Permissions

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST/PUT/DELETE` | `/users` | User management |
| `GET/POST/PUT/DELETE` | `/roles` | Role management |
| `GET/POST/PUT/DELETE` | `/permissions` | Permission management |

### Departments

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST/PUT/DELETE` | `/departments` | Department management |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Aggregated statistics |

### Response Format

All endpoints return a standardized response:

```json
{
  "success": true,
  "message": "Instance created successfully",
  "data": { ... }
}
```

---

## 🤝 Contributing

1. Follow **Java 21** coding standards for the backend (Spring Boot conventions).
2. Follow **Vue 3 Composition API** patterns for the frontend.
3. Use **snake_case** for all Directus collection and field names.
4. Write TypeScript types for all new Directus collections in `types/directus.ts`.
5. Add Flyway migrations for database schema changes.
6. Test Docker builds locally before pushing.

---

> **Built by Bronx Technology** — Powering enterprise content management at scale.
