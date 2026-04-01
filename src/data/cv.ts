// ── Duration helpers ────────────────────────────────────────────────
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Calculate human-readable duration between two dates. */
function calcDuration(
  startYear: number,
  startMonth: number,
  endYear?: number,
  endMonth?: number,
): string {
  const now = new Date();
  const eYear = endYear ?? now.getFullYear();
  const eMonth = endMonth ?? now.getMonth() + 1; // 1-indexed

  let totalMonths = (eYear - startYear) * 12 + (eMonth - startMonth) + 1; // +1 to include current month (matches LinkedIn)
  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years > 0 && months > 0)
    return `${years} yr${years > 1 ? "s" : ""} ${months} mo${months > 1 ? "s" : ""}`;
  if (years > 0) return `${years} yr${years > 1 ? "s" : ""}`;
  if (months > 0) return `${months} mo${months > 1 ? "s" : ""}`;
  return "< 1 mo";
}

/** Format "MMM YYYY – MMM YYYY · duration" or "MMM YYYY – Present · duration". */
function formatPeriod(
  startYear: number,
  startMonth: number,
  endYear?: number,
  endMonth?: number,
): string {
  const startLabel = `${MONTH_NAMES[startMonth - 1]} ${startYear}`;
  const endLabel =
    endYear && endMonth ? `${MONTH_NAMES[endMonth - 1]} ${endYear}` : "Present";
  const dur = calcDuration(startYear, startMonth, endYear, endMonth);
  return `${startLabel} – ${endLabel} · ${dur}`;
}

// ── Career-wide start date (internship) ─────────────────────────────
const CAREER_START_YEAR = 2022;
const CAREER_START_MONTH = 5; // May

const cvData = {
  personalInfo: {
    firstName: "Seyha",
    lastName: "Vorn",
    // photoUrl: new URL("../assets/vornseyha.png", import.meta.url).href,
    photoUrl: new URL("../assets/seyhavorn_stand_optimized.jpg", import.meta.url).href,
    title: "Senior Software Engineer · Full Stack",
    experienceDuration: calcDuration(CAREER_START_YEAR, CAREER_START_MONTH),
    location: "Phnom Penh, Cambodia · On-site / Remote",
    email: "vornseyha4758@gmail.com",
    linkedin: "linkedin.com/in/seyha-vorn",
    linkedinUrl: "https://www.linkedin.com/in/seyha-vorn/",
    github: "github.com/seyhavorn",
    githubUrl: "https://github.com/seyhavorn",
  },
  profile: {
    summary: `Senior Full Stack Software Engineer with ${calcDuration(CAREER_START_YEAR, CAREER_START_MONTH)} of progressive experience. Expert in Spring Boot microservices, Laravel, and Angular/Vue.js ecosystems. Proven track record in AI integration (RAG, Spring AI, Ollama, OpenAI), cloud infrastructure (AWS, Docker, Kubernetes), and high-performance database optimization. Passionate about building scalable, intelligent systems and mentoring engineering teams.`,
  },
  experiences: [
    {
      company: "BRONX Technology Co., Ltd.",
      totalDuration: calcDuration(CAREER_START_YEAR, CAREER_START_MONTH),
      location: "Phnom Penh, Cambodia",
      type: "Full-time",
      jobs: [
        {
          title: "Senior Software Engineer",
          period: formatPeriod(2025, 8), // Aug 2025 – Present (dynamic)
          location: "Phnom Penh, Cambodia · On-site",
          description:
            "Leading backend architecture and microservices design for core platform services. Driving AI integration using Spring AI, RAG pipelines, Ollama, and OpenAI. Owning server setup, domain configuration, and container orchestration on Ubuntu. Mentoring engineers, overseeing DB performance tuning, and establishing cross-team API contracts with observability practices.",
          tags: [
            { name: "Spring Boot", type: "green" },
            { name: "Microservices", type: "green" },
            { name: "Laravel", type: "purple" },
            { name: "Angular", type: "green" },
            { name: "VueJs", type: "green" },
            { name: "Spring AI", type: "green" },
            { name: "RAG", type: "green" },
            { name: "Ollama", type: "green" },
            { name: "OpenAI", type: "green" },
            { name: "MCP", type: "green" },
            { name: "GraphQL", type: "blue" },
            { name: "PostgreSQL", type: "blue" },
            { name: "Redis", type: "blue" },
            { name: "DB Performance", type: "blue" },
            { name: "Docker/Kubernetes", type: "blue" },
            { name: "Amazon Web Service", type: "blue" },
            { name: "Pipeline", type: "blue" },
            { name: "DevOps", type: "blue" },
            { name: "Ubuntu Server", type: "blue" },
            { name: "Domain Config", type: "blue" },
            { name: "cPanel", type: "blue" },
            { name: "JUnit", type: "amber" },
            { name: "MockMvc", type: "amber" },
            { name: "AI Testing", type: "amber" },
            { name: "Observability", type: "amber" },
            { name: "Speech & Image Gen", type: "amber" },
            { name: "Software Design", type: "purple" },
            { name: "System Design", type: "purple" },
          ],
        },
        {
          title: "Software Engineer",
          period: formatPeriod(2024, 3, 2025, 7), // Mar 2024 – Jul 2025
          location: "Phnom Penh, Cambodia · On-site",
          description:
            "Built and maintained scalable RESTful and GraphQL APIs using Spring Boot microservices architecture. Contributed to frontend delivery with Angular and Vue.js. Improved service reliability through JUnit and MockMvc testing. Managed deployments via Docker, Kubernetes, and CI/CD pipelines on AWS and cPanel, following solid software design principles.",
          tags: [
            { name: "Spring Boot", type: "green" },
            { name: "Microservices", type: "green" },
            { name: "Laravel", type: "purple" },
            { name: "Angular", type: "green" },
            { name: "VueJs", type: "green" },
            { name: "GraphQL", type: "blue" },
            { name: "PostgreSQL", type: "blue" },
            { name: "Redis", type: "blue" },
            { name: "Docker/Kubernetes", type: "blue" },
            { name: "Amazon Web Service", type: "blue" },
            { name: "Pipeline", type: "blue" },
            { name: "DevOps", type: "blue" },
            { name: "cPanel", type: "blue" },
            { name: "JUnit", type: "amber" },
            { name: "MockMvc", type: "amber" },
            { name: "Software Design", type: "purple" },
          ],
        },
        {
          title: "Junior Software Engineer",
          period: formatPeriod(2022, 8, 2024, 2), // Aug 2022 – Feb 2024
          location: "Cambodia · On-site",
          description:
            "Developed full-stack web applications using Laravel and NestJS on the backend, and Angular with TypeScript on the frontend. Built and consumed RESTful APIs serving both web and mobile clients. Crafted responsive UIs with Bootstrap, HTML, CSS, and jQuery. Managed PostgreSQL databases and participated in Agile sprints and code reviews.",
          tags: [
            { name: "PHP", type: "green" },
            { name: "Laravel", type: "purple" },
            { name: "NestJS", type: "green" },
            { name: "Angular", type: "green" },
            { name: "TypeScript", type: "green" },
            { name: "JavaScript", type: "blue" },
            { name: "REST API", type: "blue" },
            { name: "PostgreSQL", type: "blue" },
            { name: "Bootstrap", type: "blue" },
            { name: "HTML", type: "blue" },
            { name: "CSS", type: "amber" },
            { name: "jQuery", type: "blue" },
          ],
        },
        {
          title: "Software Engineer Internship",
          period: formatPeriod(2022, 5, 2022, 7), // May 2022 – Jul 2022
          location: "Phnom Penh, Cambodia",
          description:
            "Built and maintained web modules using Laravel and PHP within a production codebase. Developed responsive UI components with Bootstrap, HTML, and CSS, and enhanced interactivity through jQuery and JavaScript. Worked with PostgreSQL to design and query relational data structures for internal applications.",
          tags: [
            { name: "PHP", type: "green" },
            { name: "Laravel", type: "purple" },
            { name: "JavaScript", type: "blue" },
            { name: "REST API", type: "blue" },
            { name: "PostgreSQL", type: "blue" },
            { name: "Bootstrap", type: "blue" },
            { name: "HTML", type: "blue" },
            { name: "CSS", type: "amber" },
            { name: "jQuery", type: "blue" },
          ],
        },
      ],
    },
  ],
  skillCategories: [
    {
      label: "Backend",
      icon: "server",
      skills: [
        { name: "Spring Boot / Java", percentage: 95 },
        { name: "Microservices", percentage: 95 },
        { name: "Laravel / PHP", percentage: 85 },
        { name: "NestJS / Node.js", percentage: 70 },
        { name: "REST API / GraphQL", percentage: 90 },
      ],
    },
    {
      label: "Frontend",
      icon: "code",
      skills: [
        { name: "Angular / TypeScript", percentage: 80 },
        { name: "Vue.js / Nuxt.js", percentage: 80 },
        { name: "JavaScript / jQuery", percentage: 75 },
        { name: "CSS / SCSS / Bootstrap / Tailwind", percentage: 75 },
      ],
    },
    {
      label: "Database & Cache",
      icon: "database",
      skills: [
        { name: "PostgreSQL", percentage: 85 },
        { name: "MySQL", percentage: 80 },
        { name: "Redis", percentage: 75 },
        { name: "DB Performance Tuning", percentage: 75 },
      ],
    },
    {
      label: "DevOps & Cloud",
      icon: "cloud",
      skills: [
        { name: "Docker / Kubernetes", percentage: 80 },
        { name: "CI/CD Pipeline", percentage: 80 },
        { name: "AWS", percentage: 70 },
        { name: "Ubuntu Server / cPanel", percentage: 80 },
      ],
    },
    {
      label: "AI / LLM",
      icon: "cpu",
      skills: [
        { name: "Spring AI / OpenAI", percentage: 75 },
        { name: "RAG Pipelines", percentage: 75 },
        { name: "Ollama (Local LLM)", percentage: 70 },
        { name: "Speech & Image Gen", percentage: 65 },
      ],
    },
    {
      label: "Testing & Quality",
      icon: "check-circle",
      skills: [
        { name: "JUnit / MockMvc", percentage: 80 },
        { name: "AI Testing", percentage: 65 },
        { name: "Observability", percentage: 70 },
      ],
    },
  ],
  // kept for backward compatibility
  skills: [
    { name: "Spring Boot / Java", percentage: 95 },
    { name: "Microservices", percentage: 95 },
    { name: "Laravel / PHP", percentage: 85 },
    { name: "Angular / Vue.js", percentage: 80 },
    { name: "PostgreSQL / MySQL", percentage: 85 },
    { name: "Docker / Kubernetes", percentage: 80 },
    { name: "REST API / GraphQL", percentage: 90 },
    { name: "CI / CD", percentage: 80 },
    { name: "Spring AI / RAG", percentage: 75 },
    { name: "AWS / Cloud", percentage: 70 },
  ],
  stack: [
    "Spring Boot",
    "Angular",
    "Vue.js",
    "Laravel",
    "NestJS",
    "Docker",
    "K8s",
    "Redis",
    "PostgreSQL",
    "MySQL",
    "GitHub CI",
    "AWS",
    "Spring AI",
    "Ollama",
    "GraphQL",
  ],
  education: {
    degree: "BSc Computer Science",
    school: "Royal University of Phnom Penh",
    year: "2018 – 2022",
  },
  languages: [
    { name: "Khmer", level: "native" },
    { name: "English", level: "professional" },
  ],
  certifications: [
    {
      title: "AWS Cloud Practitioner",
      issuer: "Amazon Web Services",
      year: "2024",
      icon: "cloud",
    },
    {
      title: "Spring Professional",
      issuer: "VMware / Broadcom",
      year: "2024",
      icon: "leaf",
    },
    {
      title: "Docker Certified Associate",
      issuer: "Docker Inc.",
      year: "2023",
      icon: "box",
    },
  ],
  projects: [
    {
      title: "Cambodia Agrometeorological Service (CAS)",
      description:
        "Government-grade agrometeorological platform with 12 Spring Boot microservices and a Vue 3 public website, delivering real-time weather forecasts, multi-hazard early warnings (floods, drought, cyclones, pests), and crop advisories to farming communities across Cambodia.",
      techStack: [
        "Java 21",
        "Spring Boot",
        "Spring Cloud",
        "Vue 3",
        "Leaflet",
        "PostgreSQL + PostGIS",
        "Redis",
        "Docker",
        "Keycloak",
        "Prometheus",
      ],
      link: "https://cas.appchamka.com/",
      type: "Full Stack · Microservices",
    },
    {
      title: "Enterprise Task Management System (TMS)",
      description:
        "Enterprise-grade frontend application with 25+ lazy-loaded Angular modules for field operations, asset maintenance, and inventory management — featuring real-time WebSocket notifications, multi-tier approval workflows, and analytics dashboards.",
      techStack: [
        "Angular 17",
        "NgRx",
        "RxJS",
        "PrimeNG",
        "ApexCharts",
        "Pusher",
        "SheetJS",
      ],
      link: "https://github.com/seyhavorn",
      type: "Frontend · Enterprise",
    },
    {
      title: "AIS CMS — Multi-Tenant Directus Admin",
      description:
        "Enterprise administration platform for orchestrating multi-tenant Directus CMS instances — provisioning, monitoring, and lifecycle management of isolated containers per government department with RBAC, HMAC-SHA256 security, and real-time analytics.",
      techStack: [
        "Vue 3",
        "TypeScript",
        "Pinia",
        "Nuxt UI",
        "ApexCharts",
        "JWT",
        "HMAC-SHA256",
      ],
      link: "https://github.com/seyhavorn",
      type: "Full Stack · CMS",
    },
    {
      title: "Customer Relationship Management (CRM)",
      description:
        "Enterprise CRM backend (558+ Java files, 29 REST controllers) managing customers, product catalogs, inventory, sales orders, invoices, and payments — with Two-Tier caching (Caffeine + Redis), rate limiting, and full-text search.",
      techStack: [
        "Java 21",
        "Spring Boot",
        "PostgreSQL + PostGIS",
        "Redis",
        "Caffeine",
        "Liquibase",
        "MapStruct",
        "Docker",
      ],
      link: "https://github.com/seyhavorn",
      type: "Backend · DDD",
    },
    {
      title: "Directus CMS Factory",
      description:
        "Multi-tenant CMS provisioning platform that orchestrates fully isolated Directus instances on demand — each with its own database, Docker container, admin panel, and public Vue 3 website — via a centralized Spring Boot API.",
      techStack: [
        "Java 21",
        "Spring Boot",
        "PostgreSQL",
        "Docker",
        "Nginx",
        "Directus 11",
        "Vue 3",
        "Tailwind CSS",
      ],
      link: "https://github.com/seyhavorn",
      type: "Full Stack · Platform",
    },
    {
      title: "SMS Gateway",
      description:
        "Provider-agnostic, multi-tenant SMS gateway with Command/Strategy pattern architecture, supporting pluggable providers (PlasGate, NomSa), OTP lifecycle management, per-client JWT auth, and Redis-based credit tracking.",
      techStack: [
        "Java 21",
        "Spring Boot",
        "Spring WebFlux",
        "PostgreSQL",
        "Redis",
        "RabbitMQ",
        "Resilience4j",
        "Docker",
      ],
      link: "https://github.com/seyhavorn",
      type: "Backend",
    },
    {
      title: "Cambodia Quality Horticulture (CQH)",
      description:
        "Bilingual (English/Khmer) PWA for pest & disease identification, crop protection protocols, and agrochemical databases — with 32 admin CRUD controllers, a tree-structured disease identification key, and offline-first field use.",
      techStack: [
        "Laravel 9",
        "Vue.js 3",
        "Vuetify 3",
        "MySQL",
        "PWA",
        "Laravel Backpack",
      ],
      link: "https://github.com/seyhavorn",
      type: "Full Stack · PWA",
    },
    {
      title: "UYFC HQ Admin",
      description:
        "Headquarters administration platform for UYFC managing nationwide membership, membership card issuance workflows, event scheduling, and reporting with multi-library chart analytics and Excel/PDF export across all provincial branches.",
      techStack: [
        "Angular 8",
        "NgRx",
        "Angular Material",
        "Chart.js",
        "Google Charts",
        "SheetJS",
        "jsPDF",
      ],
      link: "https://github.com/seyhavorn",
      type: "Frontend · Enterprise",
    },
    {
      title: "Visakha FC CMS",
      description:
        "Enterprise CMS for Visakha Football Club managing club members, digital media assets, and membership card issuance — with tiered file management, reporting analytics, Khmer localization, and custom brand theming.",
      techStack: [
        "Angular 8",
        "NgRx",
        "Angular Material",
        "Laravel",
        "PostgreSQL",
        "SheetJS",
        "jsPDF",
      ],
      link: "https://github.com/seyhavorn",
      type: "Full Stack · CMS",
    },
    {
      title: "HRMS Transaction Worker",
      description:
        "Spring Boot background worker service for executing transactional workflows within an HRMS system — processing contract generation, multi-level approval chains, employee onboarding tasks, and payroll event triggers with reliability and audit logging.",
      techStack: [
        "Java 21",
        "Spring Boot",
        "Spring Batch",
        "PostgreSQL",
        "RabbitMQ",
        "Docker",
      ],
      link: "https://github.com/seyhavorn",
      type: "Backend · Worker",
    },
  ],
  services: [
    {
      title: "Backend & Microservices Architecture",
      description:
        "Designing scalable, fault-tolerant backend systems using Spring Boot and Laravel. I build APIs that are secure, fast, and structured for modern demands.",
      icon: "server",
    },
    {
      title: "AI & LLM Integration",
      description:
        "Building intelligent systems with RAG pipelines, Spring AI, Ollama, and OpenAI — including speech generation, image generation, and MCP-based tool orchestration.",
      icon: "cpu",
    },
    {
      title: "Full Stack Web Development",
      description:
        "Creating premium, sleek, and highly interactive frontend interfaces using Vue.js and Angular that communicate flawlessly with complex core platforms.",
      icon: "code",
    },
    {
      title: "DevOps, Cloud & Server Setup",
      description:
        "Configuring Ubuntu servers, domain routing, cPanel, Docker/K8s container orchestration, and automated CI/CD pipelines on AWS and GitHub Actions.",
      icon: "cloud",
    },
    {
      title: "Database Optimization",
      description:
        "Writing complex procedural SQL, tuning query performance, and designing producer/consumer patterns in PostgreSQL and MySQL for high-throughput systems.",
      icon: "database",
    },
  ],
};

export { cvData };
