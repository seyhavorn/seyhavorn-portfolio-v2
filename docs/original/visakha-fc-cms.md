# Visakha FC — Content Management System (CMS)

> **A comprehensive admin platform for managing club members, digital file archives, reporting analytics, and operational workflows for Visakha Football Club.**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Core Modules & Features](#core-modules--features)
6. [Authentication & Security](#authentication--security)
7. [State Management](#state-management)
8. [Environment Configuration](#environment-configuration)
9. [Installation & Setup](#installation--setup)
10. [Available Scripts](#available-scripts)
11. [Key Technical Highlights](#key-technical-highlights)
12. [My Contributions](#my-contributions)

---

## Project Overview

**Visakha FC CMS** is a feature-rich, enterprise-grade Content Management System built for **Visakha Football Club (Cambodia)**. It serves as the central administrative hub for day-to-day club operations, enabling staff to manage club members across multiple divisions and departments, process membership card requests, upload and organize digital media assets, generate statistical reports, and administer user access with role-based permissions.

The platform is designed with **Khmer-language localization** at its core, using custom Khmer fonts (KhmerOS Siemreap) and a full i18n translation layer. It features a professional, themeable admin dashboard built on the Metronic Angular template with a custom navy-blue brand palette tailored to Visakha FC's identity.

| Attribute        | Detail                                  |
| ---------------- | --------------------------------------- |
| **Client**       | Visakha Football Club (Cambodia)        |
| **Type**         | Internal Admin CMS / Back-Office Portal |
| **Platform**     | Web (SPA)                               |
| **Architecture** | Modular Angular SPA + RESTful API       |
| **Deployment**   | AWS Elastic Beanstalk (Staging) / Bronx Technology (Production) |

---

## Technology Stack

### Frontend Core

| Technology              | Version | Purpose                              |
| ----------------------- | ------- | ------------------------------------ |
| **Angular**             | 8.2.x   | Core SPA framework                   |
| **TypeScript**          | 3.4.x   | Type-safe JavaScript superset        |
| **RxJS**                | 6.5.x   | Reactive programming & async streams |
| **SCSS**                | —       | Component & global styling           |
| **Angular Material**    | 8.2.x   | UI component library (tables, forms, dialogs) |
| **Angular CDK**         | 8.2.x   | Component Dev Kit overlay & utilities |

### State Management

| Technology              | Version | Purpose                              |
| ----------------------- | ------- | ------------------------------------ |
| **NgRx Store**          | 8.6.x   | Centralized state management         |
| **NgRx Effects**        | 8.6.x   | Side-effect handling                 |
| **NgRx Router Store**   | 8.6.x   | Router-state synchronization         |
| **NgRx Entity**         | 8.6.x   | Entity collection management         |
| **ngrx-store-freeze**   | 0.2.x   | Immutability enforcement (dev)       |

### UI & Visualization

| Technology                      | Purpose                                   |
| ------------------------------- | ----------------------------------------- |
| **Metronic Admin Template**     | Base admin dashboard layout & theme       |
| **Chart.js / Chartist**         | Data visualization & charting             |
| **Google Charts (Angular)**     | Interactive statistical charts            |
| **FullCalendar**                | Event & schedule calendar views           |
| **ngx-lightbox**                | Image gallery lightbox viewer             |
| **ngx-image-cropper**           | Image cropping before upload              |
| **ngx-daterangepicker-material**| Date-range picker for report filtering    |
| **SweetAlert2**                 | Modern confirmation & notification dialogs|
| **highlight.js**                | Code syntax highlighting                  |
| **ng-inline-svg**               | Inline SVG icon rendering                 |

### Utilities & Services

| Technology                 | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| **ngx-translate**          | Multi-language i18n (Khmer localization) |
| **ngx-permissions**        | Declarative role-based UI permissions    |
| **ngx-pagination**         | Client-side data pagination              |
| **ngx-clipboard**          | Clipboard copy utility                   |
| **ngx-perfect-scrollbar**  | Custom scrollbar rendering               |
| **Moment.js**              | Date/time formatting & manipulation      |
| **Lodash**                 | Utility functions for data manipulation  |
| **FileSaver**              | Client-side file download utility        |
| **SheetJS (xlsx)**         | Excel spreadsheet export                 |
| **jsPDF + html2canvas**    | PDF report generation from HTML          |
| **AGM (Angular Google Maps)** | Google Maps integration               |
| **HammerJS**               | Touch gesture support                    |

### DevOps & Tooling

| Technology                 | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| **Angular CLI**            | Build, serve, test, lint                 |
| **Karma + Jasmine**        | Unit testing framework                   |
| **Protractor**             | End-to-end testing                       |
| **TSLint + Codelyzer**     | Code linting & Angular best-practices    |
| **Webpack Bundle Analyzer**| Bundle size analysis & optimization      |

---

## Architecture

The application follows a **modular, layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Angular Application                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Auth    │  │ Dashboard│  │  Member  │  │ Report  │ │
│  │ Module   │  │  Module  │  │  Module  │  │ Module  │ │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │            │             │              │       │
│  ┌────┴────┐  ┌────┴─────┐ ┌────┴─────┐  ┌────┴────┐  │
│  │ Setting │  │  File    │ │  Users   │  │  Theme  │  │
│  │ Module  │  │  Upload  │ │  Module  │  │  Module │  │
│  └────┬────┘  └────┬─────┘ └────┬─────┘  └────┬────┘  │
│       │            │            │              │       │
├───────┴────────────┴────────────┴──────────────┴───────┤
│                     Core Module                         │
│  ┌──────┐ ┌────────┐ ┌────────┐ ┌───────┐ ┌────────┐  │
│  │Models│ │Services│ │Reducers│ │Resolves│ │ Pipes  │  │
│  └──────┘ └────────┘ └────────┘ └───────┘ └────────┘  │
├─────────────────────────────────────────────────────────┤
│          HTTP Interceptors (Token + Error)               │
├─────────────────────────────────────────────────────────┤
│          NgRx Store (State Management Layer)             │
├─────────────────────────────────────────────────────────┤
│               RESTful API Backend                        │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

- **Lazy-Loaded Feature Modules** — Each major feature (Member, Report, Setting, File Upload, Users) is a standalone Angular module loaded on-demand to optimize initial bundle size.
- **Route Resolvers** — 16 custom resolvers pre-fetch data before route activation, ensuring components receive fully-loaded data upon initialization.
- **HTTP Interceptors** — A `TokenInterceptor` automatically attaches JWT Authorization headers and handles 401 redirects; an `ErrorInterceptor` provides centralized error handling.
- **NgRx State Management** — Centralized store with actions, reducers, effects, and selectors following the Redux pattern for predictable state transitions.
- **Role-Based Access Control** — `AuthGuard` and `RoleGuard` enforce route-level permissions (e.g., `HQ ADMIN` role required for all main modules).
- **Abstract Service Pattern** — A base `AbstractService` provides common HTTP operations, extended by domain-specific services.

---

## Project Structure

```
visakha-fc-cms/
├── angular.json                   # Angular CLI workspace configuration
├── package.json                   # Dependencies & scripts
├── proxyconfig.json               # Dev proxy configuration (API forwarding)
├── tsconfig.json                  # TypeScript compiler settings
├── tslint.json                    # Linting rules
├── browserslist                   # Target browser compatibility
├── docs/                          # Project documentation
├── e2e/                           # End-to-end test suite (Protractor)
│
└── src/
    ├── index.html                 # Application entry HTML
    ├── main.ts                    # Bootstrap entry point
    ├── styles.scss                # Global styles & Metronic theme overrides
    ├── polyfills.ts               # Browser polyfills
    ├── environments/
    │   ├── environment.ts         # Development environment config
    │   ├── environment.prod.ts    # Production environment config
    │   └── environment.staging.ts # Staging environment config
    │
    ├── assets/
    │   ├── css/demo1/             # Metronic theme CSS bundles & skins
    │   ├── js/demo1/              # Metronic JS bundles
    │   ├── vendors/global/        # Third-party vendor bundles
    │   └── media/fonts/           # Custom Khmer fonts
    │
    └── app/
        ├── app.module.ts          # Root NgModule
        ├── app-routing.module.ts  # Top-level route definitions
        ├── app.component.ts       # Root component (token refresh logic)
        ├── material.module.ts     # Centralized Angular Material imports
        ├── token.interceptor.ts   # JWT token injection interceptor
        ├── error.interceptor.ts   # Global HTTP error interceptor
        │
        ├── core/                  # Shared core module
        │   ├── core.module.ts     # Core directives, pipes, providers
        │   ├── auth/              # Authentication (guards, actions, effects, selectors)
        │   │   ├── _actions/      # NgRx auth actions
        │   │   ├── _data-sources/ # Auth data sources
        │   │   ├── _effects/      # Auth side effects
        │   │   ├── _guards/       # AuthGuard + RoleGuard
        │   │   ├── _models/       # Auth data models
        │   │   ├── _reducers/     # Auth state reducers
        │   │   ├── _selectors/    # Auth state selectors
        │   │   ├── _server/       # Mock server utilities
        │   │   └── _services/     # Auth HTTP services
        │   │
        │   ├── models/            # 29+ TypeScript interfaces & models
        │   │   ├── member.ts, event.ts, department.ts, ...
        │   │   └── v2/            # V2 API models (cards, counts)
        │   │
        │   ├── services/          # 22+ domain HTTP services
        │   │   ├── member.service.ts
        │   │   ├── event.service.ts
        │   │   ├── department.service.ts
        │   │   ├── export-excel.service.ts
        │   │   ├── file-upload.service.ts
        │   │   ├── report.service.ts
        │   │   └── v2/            # V2 API services (cards, reports)
        │   │
        │   ├── resolves/          # 16 route resolver services
        │   ├── reducers/          # NgRx root state configuration
        │   ├── _pipes/            # 9+ custom pipes (Khmer date, gender, status, etc.)
        │   ├── _base/
        │   │   ├── layout/        # Layout directives & services
        │   │   └── crud/          # CRUD utility services
        │   └── _config/
        │       ├── demo1/         # Theme layout configuration
        │       └── i18n/          # Khmer language translation files
        │
        └── views/
            ├── themes/demo1/      # Main theme shell
            │   ├── theme.module.ts
            │   ├── pages-routing.module.ts  # Central feature routing
            │   ├── base/          # Base layout component
            │   ├── header/        # Top navigation bar
            │   ├── aside/         # Left sidebar menu
            │   ├── footer/        # Footer component
            │   ├── brand/         # Brand/logo component
            │   ├── content/       # Main content area + error pages
            │   └── subheader/     # Breadcrumb & page title bar
            │
            ├── partials/          # Reusable UI partials
            │   ├── content/       # Content-level partial components
            │   └── layout/        # Layout-level partial components
            │
            └── pages/             # Feature pages (lazy-loaded)
                ├── auth/          # Login, forgot password, PIN verify, etc.
                ├── dashboard/     # Admin dashboard with charts
                ├── member/        # Member CRUD, cards, departments
                ├── file-upload/   # File/document management system
                ├── report/        # Reporting & analytics
                ├── setting/       # System settings (users, banners)
                └── users/         # User profile management
```

---

## Core Modules & Features

### 1. 🔐 Authentication Module

A complete authentication system with multi-step security:

- **Login** — Credential-based authentication with API token exchange
- **Two-Factor Authentication (2FA)** — PIN-based secondary verification
- **Forget Password** — Self-service password reset flow with email verification
- **Token Refresh** — Automatic background token renewal before expiry to maintain seamless sessions
- **Route Guards** — `AuthGuard` prevents unauthenticated access; `RoleGuard` enforces role-based permissions (e.g., `HQ ADMIN`)

### 2. 📊 Dashboard Module

A data-rich analytics dashboard providing at-a-glance operational insights:

- **Member Statistics Table** — Division-level breakdown showing total members, requested/processing/issued/pending card counts
- **Chart Visualizations** — General data charts and historical trend comparisons using Chart.js and Google Charts
- **Data Pre-loading** — Automatically caches divisions, departments, and provinces into localStorage for performance optimization across the application

### 3. 👥 Member Management Module

The largest and most complex module — a complete member lifecycle management system:

- **Member Directory** — Searchable, sortable, paginated member listings with Angular Material tables
- **Data Entry** — Full CRUD (Create/Read/Update/Delete) forms for member registration
- **Member Detail View** — Comprehensive profile pages with all member information
- **Department & Division Management** — Hierarchical organizational structure navigation
- **Membership Card Workflow** — End-to-end card request, processing, and issuance tracking
  - Card request submission by division
  - Card status tracking (Requested → Processing → Issued)
  - Department-level card count aggregations
- **Payment Detail Tracking** — Member payment and transaction history
- **Image Cropping** — Built-in photo cropping for member profile pictures
- **Advanced Filtering** — Multi-criteria member search and filter capabilities

### 4. 📁 File Upload & Document Management Module

A comprehensive digital asset management system organized by organizational tier:

- **Category-Based Organization** — Files organized under categories viewable via overview pages
- **Tier-Specific Views** — Separate listing views for:
  - Academy files
  - Management files
  - Senior Team files
  - Staff files
- **File Operations** — Upload, edit, and detail view with full metadata
- **Position & Title Management** — Configure file classification hierarchies
- **Category Modals** — Inline category creation and editing

### 5. 📈 Reporting & Analytics Module

A powerful reporting suite for decision-making and compliance:

- **Member Reports** — Comprehensive member data reports with filtering
- **Division Analytics** — Member count aggregation by division with drill-down to departments
- **Department Analytics** — Granular department-level member distribution reports
- **Monthly Member Reports** — Time-series member growth and activity tracking
- **Excel Export** — One-click export of report data to `.xlsx` format via SheetJS
- **PDF Generation** — HTML-to-PDF report rendering using jsPDF + html2canvas

### 6. ⚙️ Settings & Administration Module

System-wide configuration and administration tools:

- **User Administration** — Manage admin users with role assignment and permission configuration
- **Role Management** — Define and assign roles with granular access levels
- **Banner Management** — Upload and manage promotional banners with image cropping
- **Image Cropping** — Integrated cropper for banner asset preparation

### 7. 👤 User Profile Module

Self-service user profile management for authenticated administrators.

---

## Authentication & Security

### Token Management

The application implements a robust JWT-based authentication flow:

```
Login → Access Token + Refresh Token → Auto-Refresh Before Expiry
```

- **Token Storage** — Tokens stored in `localStorage` under keys: `hqtoken`, `hqRefreshToken`, `hqTokenExpiresIn`, `hqTokentDateTime`
- **Automatic Refresh** — A background `setInterval` refreshes the token `5 seconds` before expiry, calculated from `expires_in`
- **Interceptor Injection** — The `TokenInterceptor` automatically attaches `Authorization`, `Content-Language: kh`, and CORS headers to every outgoing HTTP request
- **401 Handling** — Unauthorized responses trigger automatic redirect to the login page
- **Route Exclusions** — Token refresh and external API calls (e.g., `jsonip.com`) are excluded from token injection

### Error Handling

The `ErrorInterceptor` provides centralized error processing:
- Captures HTTP error responses globally
- Distinguishes between application errors (via custom headers) and server errors
- Aggregates validation errors from structured server responses
- Propagates formatted error messages to consuming components

### Route Protection

```
AuthGuard → Checks authentication status
    ↓
RoleGuard → Verifies user role against route's required roles
    ↓
Route Resolver → Pre-fetches route data
    ↓
Component → Renders with pre-loaded data
```

All main feature routes require the `HQ ADMIN` role, enforced at the routing level.

---

## State Management

The application uses **NgRx** (Redux pattern for Angular) for centralized state management:

### Store Architecture

```
NgRx Store
├── Auth State (login status, user info, permissions)
├── Router State (synchronized via @ngrx/router-store)
└── Feature States (per lazy-loaded module)
```

### Key Components

| Component        | Description                                                |
| ---------------- | ---------------------------------------------------------- |
| **Actions**      | Typed event dispatchers for auth and feature operations     |
| **Reducers**     | Pure functions producing new state from actions             |
| **Effects**      | Side-effect handlers for async operations (API calls)      |
| **Selectors**    | Memoized state queries for component consumption           |
| **Store Freeze** | Development-time immutability enforcement via `ngrx-store-freeze` |

---

## Environment Configuration

The application supports **three deployment environments**, each with isolated API endpoints and configuration:

| Environment   | API Base URL                                                         | Google Maps | reCAPTCHA |
| ------------- | -------------------------------------------------------------------- | :---------: | :-------: |
| **Development** | `https://apix.bronxtechnology.online`                              | ✅          | ✅        |
| **Staging**     | `http://uyfcdev-env.eba-sqtn4jkr.us-west-2.elasticbeanstalk.com`  | ✅          | ✅        |
| **Production**  | `https://apix.klocknow.com/v2`                                    | ✅          | ✅        |

### Proxy Configuration

Development proxy rules forward API requests to avoid CORS issues:

| Path Pattern    | Target                                                            |
| --------------- | ----------------------------------------------------------------- |
| `/production/*` | `https://apix.klocknow.com/v2/`                                  |
| `/uyfcapi/*`    | `http://uyfcapi.dev/`                                            |
| `/staging/*`    | `http://uyfcdev-env.eba-sqtn4jkr.us-west-2.elasticbeanstalk.com` |

---

## Installation & Setup

### Prerequisites

- **Node.js** — v10.x or v12.x recommended (for Angular 8 compatibility)
- **npm** — v6.x+
- **Angular CLI** — v8.3.x (`npm install -g @angular/cli@8.3.23`)

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd visakha-fc-cms

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
# → App runs at http://localhost:4200

# 4. Start with API proxy forwarding
npm run proxy
# → Uses proxyconfig.json to forward API calls

# 5. Build for production
npm run build
# → Output: dist/production/
```

---

## Available Scripts

| Script           | Command                               | Description                                     |
| ---------------- | ------------------------------------- | ----------------------------------------------- |
| `start`          | `ng serve`                            | Start development server on `localhost:4200`     |
| `proxy`          | `ng serve --proxy-config proxyconfig.json` | Start with API proxy forwarding            |
| `build`          | `ng build --prod`                     | AOT production build to `dist/production/`      |
| `test`           | `ng test`                             | Run unit tests via Karma                        |
| `lint`           | `ng lint`                             | Run TSLint code analysis                        |
| `e2e`            | `ng e2e`                              | Run end-to-end tests via Protractor             |
| `bundle-report`  | `webpack-bundle-analyzer dist/...`    | Analyze production bundle sizes                 |

---

## Key Technical Highlights

### Custom Localization (Khmer Language)

- **Custom Khmer Font** — KhmerOS Siemreap loaded via `@font-face` and applied globally across `html`, `body`, Material tables, and list components
- **i18n Translation Layer** — Full Khmer translations loaded at application bootstrap via `ngx-translate`
- **Khmer Date Pipe** — Custom Angular pipe for formatting dates in the Khmer calendar system
- **Content-Language Header** — All API requests include `Content-Language: kh` for server-side localization

### Custom Pipes (Data Transformation)

| Pipe               | Purpose                                |
| ------------------- | -------------------------------------- |
| `KhmerDatePipe`     | Khmer calendar date formatting         |
| `StatusPipe`        | Human-readable status labels           |
| `CardStatusPipe`    | Membership card status display         |
| `GenderPipe`        | Gender code to label transformation    |
| `MemberRolePipe`    | Role enum to display name              |
| `MemberTypePipe`    | Member type classification display     |
| `LanguageLevelPipe` | Language proficiency level formatting  |
| `PhoneNumberPipe`   | Phone number formatting                |

### Theming & Branding

- **Metronic Admin Template** — Professional admin UI foundation with customized navy-blue color scheme (`#1D2852` primary, `#1A2449` accent)
- **Responsive Layout** — Sidebar navigation, header, subheader breadcrumbs, and footer
- **Splash Screen** — Branded loading animation during initial app load
- **Custom Button Styles** — Sky-blue branded buttons (`.btn-sky`, `.btn-sky-dark`)

### Export & Reporting Capabilities

- **Excel Export Service** — Dedicated `ExportExcelService` using SheetJS for spreadsheet generation
- **PDF Generation** — HTML-to-canvas rendering with jsPDF for printable reports
- **Client-Side File Download** — FileSaver.js for triggering browser downloads

---

## My Contributions

As a **key developer** on this project, my responsibilities and contributions included:

- **Frontend Architecture & Development** — Designed and implemented the modular Angular architecture with lazy-loaded feature modules, NgRx state management, and a scalable service layer
- **Member Management System** — Built the complete member lifecycle management module including CRUD operations, hierarchical department/division navigation, and the card request workflow
- **Reporting & Analytics** — Developed the reporting suite with interactive charts, division/department drill-down analytics, and Excel/PDF export capabilities
- **Authentication & Security** — Implemented JWT-based authentication with automatic token refresh, two-factor PIN verification, HTTP interceptors for token injection, and role-based route guards
- **File & Document Management** — Created the tiered file upload system with category organization, image cropping, and metadata management
- **Khmer Localization** — Integrated full Khmer language support including custom date pipes, translation files, and Khmer font rendering
- **Settings & Administration** — Built user administration interfaces with role management and banner management with image cropping
- **API Integration** — Designed and implemented all HTTP service layers with route resolvers for optimized data pre-fetching across 22+ domain services
- **UI/UX Customization** — Customized the Metronic admin template with Visakha FC's brand identity, including custom color palettes, sidebar theming, and responsive layout adjustments

---

## Summary

| Metric                  | Value                                |
| ----------------------- | ------------------------------------ |
| **Framework**           | Angular 8.2 + TypeScript 3.4        |
| **State Management**    | NgRx 8.6 (Store, Effects, Entity)   |
| **UI Library**          | Angular Material 8.2 + Metronic     |
| **API Services**        | 22+ domain services + 3 v2 services |
| **Data Models**         | 29+ TypeScript interfaces/models    |
| **Route Resolvers**     | 16 pre-fetch resolvers              |
| **Custom Pipes**        | 9+ transformation pipes             |
| **Feature Modules**     | 7 lazy-loaded modules               |
| **Auth Security**       | JWT + 2FA + Role Guards             |
| **Environments**        | Development, Staging, Production    |
| **Localization**        | Khmer (KH) with custom fonts        |
| **Export Formats**       | Excel (.xlsx) + PDF                 |

---

*Documentation generated on April 1, 2026.*
