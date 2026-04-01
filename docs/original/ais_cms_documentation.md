# AIS CMS — Admin Panel

> **Enterprise-Grade Content Management System Administration Platform**
> Built with Vue 3, TypeScript, Nuxt UI, and Pinia — designed for multi-tenant Directus CMS instance orchestration, role-based access control, and departmental content governance.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Module Breakdown](#module-breakdown)
- [Authentication & Security](#authentication--security)
- [Internationalization](#internationalization)
- [Build & Deployment](#build--deployment)
- [Usage](#usage)

---

## Overview

**AIS CMS Admin Panel** is a comprehensive, full-featured administration platform developed for the **Cambodia Agrometeorological Information Service (AIS)**. It serves as the centralized control hub for managing multi-tenant Directus CMS instances, organizational departments, user accounts, role-based permissions, and platform-wide settings.

The platform empowers administrators to **provision, monitor, start/stop, and manage** isolated Directus CMS instances assigned to different government departments — all from a single, unified dashboard with real-time health monitoring and full lifecycle management.

### Highlights

| Aspect             | Detail                                                                 |
|--------------------|------------------------------------------------------------------------|
| **Type**           | Single-Page Application (SPA) — Admin Panel                           |
| **Domain**         | Agrometeorological Information Service (Cambodia)                      |
| **Purpose**        | Multi-tenant CMS orchestration & administration                       |
| **Users**          | System Administrators, Department Managers, Content Operators          |
| **Architecture**   | Component-based SPA with service-layer abstraction                     |
| **Authentication** | JWT-based with access/refresh token rotation & HMAC request signing    |

---

## Key Features

### 🏗️ Directus Instance Management (CMS Factory)
- Create, update, and delete Directus CMS instances per department
- Full container lifecycle control: **start, stop, restart, deactivate**
- Real-time health status monitoring & log viewing
- Instance cloning for rapid department onboarding
- Domain-based routing & port configuration

### 👥 User Management
- Complete CRUD operations for user accounts
- Assign roles and direct permissions to users
- Department-scoped user organization
- User profile management & status tracking (Active / Inactive / Pending)
- Admin flag for super-user privileges

### 🔐 Role-Based Access Control (RBAC)
- Granular permission system with module-level scoping (e.g., `CMS_CREATE`, `DASHBOARD_READ`)
- Dynamic role creation with permission matrix assignment
- Route-level permission guards with automatic redirection
- Combined role + direct user permissions (union-based authorization)

### 🏢 Department Management
- Organizational department CRUD with department head assignment
- Department code and status management
- Link departments to Directus instances and users

### 📊 Dashboard & Analytics
- Real-time statistical overview: total instances, departments, users, roles
- Active vs. inactive instance breakdown
- Interactive charts powered by ApexCharts
- Visitor analytics by province, district, and country

### ⚙️ Settings Management
- Platform-wide configuration management
- System preferences & operational settings

### 🌐 Internationalization (i18n)
- Full bilingual support: **English (en)** and **Khmer (km)**
- Dynamic page titles synchronized with locale changes
- Language persistence via `localStorage`
- Accept-Language header injection for API-level localization

### 🔒 Security Layer
- JWT access + refresh token rotation with `HttpOnly` cookie support
- HMAC-SHA256 request signing (session-based)
- Site-secret header enforcement (`X-Site-Secret`)
- Session management with automatic renewal
- Production console suppression for security hardening
- 403 Forbidden handling with graceful redirection

---

## Technology Stack

### Core Framework & Language

| Technology        | Version     | Purpose                                         |
|-------------------|-------------|-------------------------------------------------|
| **Vue 3**         | ^3.5        | Reactive UI framework (Composition API)         |
| **TypeScript**    | ~5.8        | Type-safe development                           |
| **Vite**          | ^7.0        | Next-gen build tool & dev server                |
| **Pinia**         | ^3.0        | State management (stores)                       |
| **Vue Router**    | ^4.5        | SPA routing with navigation guards              |

### UI & Styling

| Technology        | Version     | Purpose                                         |
|-------------------|-------------|-------------------------------------------------|
| **Nuxt UI**       | ^4.3        | Pre-built Vue component library                 |
| **SASS**          | ^1.92       | CSS preprocessor for custom styling             |
| **Heroicons**     | —           | Icon set (integrated via Nuxt UI)               |

### Data & API

| Technology        | Version     | Purpose                                         |
|-------------------|-------------|-------------------------------------------------|
| **Fetch API**     | Native      | HTTP client (custom `ApiService` wrapper)       |
| **Axios**         | ^1.12       | Available as alternate HTTP client               |
| **js-cookie**     | ^3.0        | Cookie management for JWT tokens                |
| **jwt-decode**    | ^4.0        | Client-side JWT token inspection                |

### Utilities & Libraries

| Technology            | Version     | Purpose                                     |
|-----------------------|-------------|---------------------------------------------|
| **Vue I18n**          | ^10.0       | Internationalization framework              |
| **VueUse**            | ^13.6       | Vue Composition API utilities               |
| **date-fns**          | ^4.1        | Date manipulation & formatting              |
| **lodash-es**         | ^4.17       | Utility functions (tree-shakeable)          |
| **vue3-apexcharts**   | ^1.8        | Interactive chart components                |
| **vue-gtag**          | ^3.6        | Google Analytics 4 integration              |

### Development & Build

| Technology              | Version     | Purpose                                   |
|-------------------------|-------------|-------------------------------------------|
| **vue-tsc**             | ^2.2        | TypeScript type checking for Vue          |
| **PostCSS Preset Env**  | ^10.4       | CSS future syntax support                 |
| **Vite Dev Tools**      | ^8.0        | Enhanced development experience           |

---

## Architecture

The application follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        VIEWS LAYER                          │
│  (Pages: Dashboard, CMS, Users, Roles, Departments, etc.)  │
├─────────────────────────────────────────────────────────────┤
│                     COMPONENTS LAYER                        │
│  (Layout: Sidebar, Header, Navbar │ Common: Buttons, etc.) │
├─────────────────────────────────────────────────────────────┤
│                    COMPOSABLES LAYER                        │
│  (useNavigation, useDynamicTitle, useGlobalLoading, etc.)   │
├─────────────────────────────────────────────────────────────┤
│                      STORES LAYER                           │
│      (Pinia: auth store, language store)                    │
├─────────────────────────────────────────────────────────────┤
│                     SERVICES LAYER                          │
│  Core: ApiService, SessionManager │ Modules: login,        │
│  directus-factory, visitor, encryption                      │
├─────────────────────────────────────────────────────────────┤
│                   CORE / FOUNDATION                         │
│  Config │ Constants │ Types │ Utils │ Plugins               │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Singleton Pattern** — `ApiService`, `SessionManager` are singleton instances
- **Service Layer Pattern** — All API calls abstracted into dedicated service classes
- **Composable Pattern** — Reusable logic encapsulated as Vue composables
- **Guard Pattern** — Route-level permission enforcement via `beforeEach` guards
- **Token Refresh Pattern** — Transparent access token renewal on 401 responses
- **Factory Pattern** — `DirectusFactoryService` manages CMS instance lifecycle

---

## Project Structure

```
cms/
├── index.html                          # SPA entry point
├── package.json                        # Dependencies & scripts
├── vite.config.ts                      # Vite build configuration
├── tsconfig.json                       # TypeScript configuration
├── .env                                # Base environment variables
├── .env.development                    # Development environment
├── .env.production                     # Production environment
├── .github/                            # CI/CD & GitHub configuration
│
├── public/                             # Static assets
│
└── src/
    ├── main.ts                         # Application bootstrap & plugin registration
    ├── App.vue                         # Root component (UApp + RouterView)
    │
    ├── assets/
    │   ├── css/                        # Global stylesheets (main.css, navbar.css)
    │   ├── fonts/                      # Custom font files
    │   ├── icons/                      # Icon assets
    │   ├── image/                      # Image assets
    │   ├── logo/                       # Brand logos
    │   └── *.svg                       # SVG assets (Cambodia maps, etc.)
    │
    ├── components/
    │   ├── common/                     # Reusable UI components
    │   │   ├── ActiveIcon.vue          # Status indicator
    │   │   ├── Button.vue             # Custom button
    │   │   ├── ColorModeButton.vue    # Dark/light mode toggle
    │   │   ├── Divider.vue            # Horizontal divider
    │   │   ├── DividerVertical.vue    # Vertical divider
    │   │   ├── LanguageSwitchButton.vue # EN/KM language toggle
    │   │   └── SearchableSelect.vue   # Searchable dropdown
    │   └── layout/                     # Layout components
    │       ├── AdminLayout.vue        # Admin page wrapper
    │       ├── FooterPage.vue         # Footer component
    │       ├── MainLayout.vue         # Main content layout
    │       ├── NavbarPage.vue         # Top navigation bar
    │       ├── PageLayout.vue         # Generic page wrapper
    │       └── LanguageDropDown.vue   # Language selector dropdown
    │
    ├── composables/                    # Vue Composition API hooks
    │   ├── useApiErrorHandler.ts      # Centralized API error handling
    │   ├── useDynamicTitle.ts         # Route-aware page title management
    │   ├── useGlobalLoading.ts        # Global loading state management
    │   ├── useNavigation.ts           # Reusable navigation methods
    │   └── useScreenSize.ts           # Responsive breakpoint detection
    │
    ├── core/
    │   ├── config/
    │   │   ├── api.config.ts          # API base URL & timeout settings
    │   │   ├── global-timezone.config.ts # Phnom Penh timezone (UTC+7)
    │   │   └── timeout.config.ts      # Request timeout defaults
    │   ├── constants/
    │   │   ├── api.constants.ts       # API endpoint definitions & config
    │   │   └── login.constants.ts     # Token key names & auth constants
    │   ├── helpers/                    # Helper functions (extensible)
    │   ├── plugins/
    │   │   ├── errorHandler.ts        # Vue global error handler plugin
    │   │   └── global-timezone.plugin.ts # Timezone plugin (Asia/Phnom_Penh)
    │   ├── services/
    │   │   ├── core/
    │   │   │   ├── api.service.ts     # HTTP client (fetch-based, singleton)
    │   │   │   └── api.session.manager.ts # HMAC session signing manager
    │   │   └── modules/
    │   │       ├── directus-factory.service.ts # CMS instance CRUD & lifecycle
    │   │       ├── encryption.service.ts      # JWE token encryption/decryption
    │   │       ├── login.service.ts            # Authentication service
    │   │       └── visitor.service.ts          # Visitor analytics tracking
    │   ├── types/
    │   │   ├── api.types.ts           # API response/error type definitions
    │   │   └── login/                 # Login-specific type definitions
    │   └── utils/
    │       ├── auth.utils.ts          # Token validation & refresh logic
    │       ├── datetime.utils.ts      # Date/time formatting utilities
    │       ├── news.utils.ts          # News content helpers
    │       ├── phnom-penh-timezone.utils.ts # Cambodia timezone utilities
    │       └── svg-validator.ts       # SVG upload validation
    │
    ├── data/                           # Static data / seed files
    │   ├── departments.json           # Department seed data
    │   ├── directus-instances.json    # Instance configuration data
    │   ├── permissions.json           # Permission definitions
    │   ├── roles.json                 # Role definitions
    │   ├── settings.json              # Settings configuration
    │   └── users.json                 # User seed data
    │
    ├── i18n/
    │   ├── i18n.ts                    # Vue I18n configuration
    │   └── locales/
    │       ├── en.ts                  # English translations (~25KB)
    │       └── km.ts                  # Khmer translations (~48KB)
    │
    ├── router/
    │   └── index.ts                   # Route definitions & permission guards
    │
    ├── stores/
    │   ├── auth.ts                    # Authentication state (Pinia)
    │   └── language.ts                # Language preference state (Pinia)
    │
    ├── types/
    │   └── dom-to-image-more.d.ts     # Third-party type declarations
    │
    └── views/
        └── admins/
            ├── LoginPage.vue          # Authentication login page
            ├── DefaultLayout.vue      # Authenticated layout shell
            ├── layout/
            │   ├── AdminLayout.vue    # Admin area layout
            │   ├── AdminSidebar.vue   # Navigation sidebar
            │   ├── AdminHeader.vue    # Top header bar
            │   ├── AdminBody.vue      # Content area
            │   └── MenuItem.ts        # Menu item type definitions
            ├── base/
            │   ├── blog/              # Blog base components
            │   ├── chart/             # Chart base components
            │   ├── modal/             # Modal base components
            │   └── table/             # Table base components
            └── adminPages/
                └── components/
                    ├── Dashboard.vue              # Analytics dashboard
                    ├── Forbidden.vue              # 403 error page
                    ├── directus/
                    │   ├── DirectusManagement.vue       # Instance list & management
                    │   ├── CreateDirectusInstance.vue   # Instance creation wizard
                    │   └── DirectusInstanceDetail.vue   # Instance detail & controls
                    ├── department/
                    │   └── DepartmentManagement.vue     # Department CRUD
                    ├── users/
                    │   ├── UserManagement.vue           # User list & management
                    │   └── UserDetail.vue               # User detail & profile
                    ├── roles/
                    │   └── RoleManagement.vue           # Role & permission matrix
                    ├── permissions/
                    │   └── PermissionManagement.vue     # Permission catalog
                    └── settings/
                        └── SettingsManagement.vue       # Platform settings
```

---

## Installation & Setup

### Prerequisites

- **Node.js** ≥ 18 (see `.nvmrc`)
- **npm** ≥ 9
- Backend API server running (Spring Boot / Java backend)

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd cms

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:5173 (default Vite port)
```

### Available Scripts

| Command              | Description                                           |
|----------------------|-------------------------------------------------------|
| `npm run dev`        | Start development server                              |
| `npm run dev:prod`   | Start dev server with production environment          |
| `npm run build`      | Type-check + build for production                     |
| `npm run build:dev`  | Build with development environment                    |
| `npm run build:prod` | Build with production environment                     |
| `npm run test`       | Run TypeScript type checking (`vue-tsc`)              |
| `npm run preview`    | Preview production build locally                      |
| `npm run clean`      | Remove `dist/` and Vite cache                         |

---

## Configuration

### Environment Variables

The application uses **Vite's environment variable** system with mode-specific `.env` files:

| Variable                     | Description                         | Example                                      |
|------------------------------|-------------------------------------|----------------------------------------------|
| `VITE_API_URL_TARGET`        | Backend API base URL                | `http://localhost:8081`                       |
| `VITE_API_URL`               | API path prefix (for proxy)         | `/api`                                       |
| `VITE_API_TIMEOUT`           | Request timeout (ms)                | `10000`                                      |
| `VITE_SITE_SECRET`           | Site authentication secret          | *(secret string)*                            |
| `VITE_SECRETE_INIT`          | Session initialization key          | *(secret string)*                            |
| `VITE_ENV`                   | Environment identifier              | `development` / `production`                 |
| `VITE_GA_ENABLED`            | Enable Google Analytics             | `true` / `false`                             |
| `VITE_GA_MEASUREMENT_ID`     | GA4 Measurement ID                  | `G-XXXXXXXXXX`                               |
| `VITE_BUILD_ANALYZE`         | Enable bundle analysis              | `false`                                      |
| `VITE_BUILD_SOURCEMAP`       | Generate source maps                | `false`                                      |
| `VITE_PWA_ENABLED`           | Enable PWA features                 | `true`                                       |
| `RETRY_ATTEMPTS`             | API retry count                     | `3`                                          |

### Vite Proxy Configuration

The development server proxies all `/api` requests to the backend server, enabling CORS-free local development:

```typescript
proxy: {
  '/api': {
    target: env.VITE_API_URL_TARGET,  // e.g., http://localhost:8081
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ''),
  },
}
```

### Build Optimization

Production builds include:
- **Manual chunk splitting** — Vue ecosystem bundled separately from chart libraries
- **Chunk size warning** threshold set to 2000KB
- **Hashed filenames** for cache busting (`assets/[name]-[hash].js`)
- **Output directory**: `ais-admin/`

---

## Module Breakdown

### 1. Directus Instance Management (CMS Factory)

The core module of the platform. Manages the lifecycle of containerized Directus CMS instances:

- **List & Search** — View all instances with status indicators
- **Create** — Provision new instances with database, port, domain, and admin credentials
- **Detail View** — Full instance configuration with health monitoring
- **Lifecycle Controls** — Start, stop, restart, deactivate containers
- **Log Viewer** — Real-time container log streaming (configurable line count)
- **Clone** — Duplicate an instance with a new domain for rapid deployment

### 2. User Management

Full user lifecycle management with RBAC integration:

- **User List** — Filterable, sortable user table
- **Create/Edit** — User form with role & department assignment
- **Profile** — Self-service profile viewing (reuses `UserDetail` component)
- **Role Assignment** — Assign roles to users via dedicated endpoint
- **Permission Assignment** — Direct permission grants (bypass role-based)

### 3. Role & Permission System

Granular authorization management:

- **Permission Catalog** — View all system permissions with module & category metadata
- **Role Builder** — Create roles with a permission matrix selector
- **Permission Scopes** — Module-prefixed (e.g., `CMS_CREATE`, `DASHBOARD_READ`, `USER_DELETE`)

### 4. Department Management

Organizational structure for multi-tenant content governance:

- **Department CRUD** — Create, update, delete departments
- **Department Head** — Assign head with name, email, and phone
- **Status Management** — Active/Inactive status toggling

### 5. Dashboard

Analytics and monitoring overview:

- **Statistics Cards** — Total instances, departments, users, roles
- **Instance Health** — Active vs. inactive instance breakdown
- **Visitor Analytics** — Geographic visitor data (province, district, country)
- **ApexCharts** — Interactive, responsive chart visualizations

---

## Authentication & Security

### Token Flow

```
┌──────────┐     POST /auth/login      ┌──────────┐
│  Client  │ ────────────────────────► │  Backend │
│          │ ◄──────────────────────── │          │
│          │   Set-Cookie: access_token │          │
│          │   Set-Cookie: refresh_token│          │
└──────────┘                           └──────────┘
     │
     │  Subsequent requests:
     │  Authorization: Bearer <access_token>
     │  X-Site-Secret: <site_secret>
     │
     ▼  On 401 (token expired):
     │  POST /auth/refresh → new access_token
     │  Retry original request transparently
```

### Security Features

| Feature                        | Implementation                                       |
|--------------------------------|------------------------------------------------------|
| **JWT Token Storage**          | `HttpOnly` cookies + localStorage fallback           |
| **Token Refresh**              | Automatic on 401 response (transparent to UI)        |
| **HMAC Request Signing**       | SHA-256 signatures with session key + nonce          |
| **Site Secret**                | `X-Site-Secret` header on every request              |
| **Route Guards**               | `beforeEach` navigation guard with permission checks |
| **Production Hardening**       | `console.log` / `console.debug` suppressed           |
| **Session Management**         | Singleton `SessionManager` with 30-min refresh window|
| **Error Filtering**            | Aria-hidden & network error console filtering        |

---

## Internationalization

The application supports two languages with full coverage:

| Language | Code | Translation File Size | Coverage   |
|----------|------|-----------------------|------------|
| English  | `en` | ~25 KB                | Full       |
| Khmer    | `km` | ~48 KB                | Full       |

### How It Works

1. **Locale Persistence** — Language preference saved to `localStorage` under key `lang`
2. **Dynamic Page Titles** — `useDynamicTitle` composable updates `document.title` on route/locale change
3. **API Localization** — `Accept-Language` header sent with every API request
4. **Component-Level** — All UI labels use `$t('key')` translation functions

---

## Build & Deployment

### Production Build

```bash
# Full production build (type-check → compile → bundle)
npm run build:prod
```

Output is generated in the `ais-admin/` directory, ready for static hosting or server deployment.

### Build Output Structure

```
ais-admin/
├── index.html
└── assets/
    ├── vendor-vue-[hash].js        # Vue ecosystem chunk
    ├── vendor-charts-[hash].js     # ApexCharts chunk
    ├── index-[hash].js             # Application entry
    ├── [component]-[hash].js       # Lazy-loaded route chunks
    └── [name]-[hash].[ext]         # CSS, fonts, images
```

### Deployment Considerations

- Configure server to redirect all routes to `index.html` (SPA routing)
- Set appropriate CORS headers on the backend API
- Ensure environment variables are correctly set for production
- Backend API should be accessible at the configured `VITE_API_URL_TARGET`

---

## Usage

### Accessing the Admin Panel

1. Navigate to the application URL
2. Log in with your administrator credentials
3. You will be redirected to the first permitted module based on your role:
   - **Dashboard** (if `DASHBOARD_*` permissions)
   - **CMS Management** (if `CMS_*` permissions)
   - **Departments** (if `DEPARTMENT_*` permissions)
   - And so on...

### Managing CMS Instances

1. Navigate to **CMS Management** via the sidebar
2. Click **Create Instance** to provision a new Directus CMS
3. Fill in: department, name, domain, admin credentials
4. Monitor instance health from the management list
5. Use action buttons to **start**, **stop**, **restart**, or view **logs**

### Managing Users & Permissions

1. Navigate to **Users** → view/create/edit user accounts
2. Navigate to **Roles** → create roles with specific permission sets
3. Navigate to **Permissions** → view the full permission catalog
4. Assign roles to users or grant direct permissions as needed

---

## Summary

The **AIS CMS Admin Panel** is a production-grade, enterprise administration platform that demonstrates:

- **Modern Vue 3 architecture** with Composition API and TypeScript
- **Multi-tenant CMS orchestration** — full Directus instance lifecycle management
- **Enterprise security** — JWT rotation, HMAC signing, route-level RBAC
- **Internationalization** — Complete bilingual support (English + Khmer)
- **Clean code architecture** — Service layer abstraction, composable patterns, Pinia stores
- **Production readiness** — Optimized builds, code splitting, error handling, analytics

---

*Documentation generated on April 1, 2026*
