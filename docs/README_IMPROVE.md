# 🧑‍💻 Vorn Seyha — Portfolio CV

> A modern, data-driven portfolio CV built with **Vue 3**, **TypeScript**, **Vite**, and **Tailwind CSS**.  
> Features glassmorphism design, animated backgrounds, and an interactive experience timeline.

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Data | Centralized `cv.ts` data file |

---

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev -- --port 4000

# Build for production
npm run build
```

---

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── assets/              # Profile photo and static assets
│   ├── components/
│   │   ├── CvHeader.vue     # Name, title, contact links
│   │   ├── CvProfile.vue    # Professional summary
│   │   ├── CvServices.vue   # What I Do section (5 services)
│   │   ├── CvProjects.vue   # Featured projects
│   │   ├── CvExperience.vue # Work experience timeline
│   │   └── CvSidebar.vue    # Skills, certifications, education, languages
│   ├── data/
│   │   └── cv.ts            # ✅ Single source of truth for all CV content
│   └── App.vue              # Root layout with animated background
```

---

## ✏️ Updating Content

All CV content lives in **`src/data/cv.ts`**. Edit this file to update:
- Personal info, summary, experience, skills, projects, services, certifications

---

## 📈 Career Improvement Roadmap

> Based on current experience (3 yrs 11 mos at BRONX Technology Co., Ltd.)

### 1. 🏅 Get Real Certifications

| Certification | Why | Timeline |
|---|---|---|
| **AWS Solutions Architect – Associate** | Validates existing AWS usage formally | ~2 months |
| **CKA (Certified Kubernetes Administrator)** | Directly matches daily K8s work | ~2 months |
| **Spring Professional (6.x)** | Validates core Spring Boot expertise | ~1 month |

---

### 2. 🤖 Go Deeper on AI Engineering

Currently have RAG/Spring AI started. Next level:

- **Vector databases** — `pgvector` (PostgreSQL), Weaviate, or Qdrant
- **LLM fine-tuning** — LoRA fine-tuning on local models via Ollama
- **Agentic AI / Multi-agent systems** — MCP tool-calling agents and pipelines
- **AI Observability** — LangSmith or Spring AI tracing for RAG pipelines
- **LangChain4j** — Java-native LLM framework popular in enterprise

---

### 3. 🧪 Testing & Code Quality (Weakest Area)

| Practice | Tool |
|---|---|
| Integration testing with real containers | **Testcontainers** (PostgreSQL, Redis) |
| Contract testing between microservices | **Pact** / Spring Cloud Contract |
| Code coverage enforcement in CI | **SonarQube** |
| Load & performance testing | **Gatling** or **k6** |

---

### 4. 🏗️ Make System Design Visible

At Senior level, system design evidence matters. Action items:

- Write **2–3 technical blog posts** (Dev.to / Medium):
  - *"Building RAG pipelines with Spring AI"*
  - *"Microservices patterns in production"*
  - *"DB performance tuning in PostgreSQL"*
- Add **architecture diagrams** to GitHub repos (Mermaid / draw.io)
- Document real tradeoff decisions in project READMEs

---

### 5. 💻 Strengthen GitHub Presence

Recruiters will check. Prioritize:

- Pin **3–5 projects** with proper READMEs, demo GIFs, tech explanations
- Publish the **RAG AI assistant** as a real public demo repo
- Make **1–2 open-source contributions** to Spring Boot or Laravel ecosystem

---

### 6. 📊 Quantify Achievements

Replace vague descriptions with measurable impact:

| ❌ Vague | ✅ Quantified |
|---|---|
| "Improved service reliability through testing" | "Reduced API error rate by 40% via JUnit integration tests and CI gate enforcement" |
| "Managed deployments via Docker and Kubernetes" | "Deployed 8 microservices across 3 environments with zero-downtime rolling updates" |

---

### 7. 🧩 Deepen TypeScript / Node.js

NestJS is in the Junior role but underweighted overall. To unlock non-Java opportunities:

- Build a public **NestJS + Prisma + PostgreSQL** API project
- Showcase TypeScript-first backend architecture

---

## 🗺️ 6-Month Plan

```
Month 1–2  →  AWS SAA Cert + Testcontainers in current project
Month 2–3  →  CKA Cert + AI agent project (real GitHub repo, public)
Month 3–4  →  2 technical blog posts + system design diagrams
Month 4–5  →  Spring Professional Cert + pgvector/vector DB integration
Month 5–6  →  Open source contribution + quantify all CV bullet points
```

---

## 🧑‍💼 About

**Vorn Seyha** — Senior Software Engineer at BRONX Technology Co., Ltd.  
📧 seyha.vorn@gmail.com  
🔗 [linkedin.com/in/seyha-vorn](https://www.linkedin.com/in/seyha-vorn/)  
💻 [github.com/seyhavorn](https://github.com/seyhavorn)
