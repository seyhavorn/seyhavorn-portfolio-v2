# Senior Backend Developer (Banking/Fintech) — Interview Study Guide

A comprehensive Q&A collection tailored for **Senior Backend Developer** interviews at **Banks and Financial Institutions** in Cambodia. All answers are crafted with banking-domain context, regulatory awareness, and production-grade fintech architecture patterns.

---

## 🏦 Target Position

**Senior Backend Developer — Banking / Fintech**
- **Core Stack:** Java 21, Spring Boot 3, Microservices, PostgreSQL
- **Domain Focus:** Core Banking, Digital Banking, Payment Systems, Transaction Processing
- **Key Concerns:** Data consistency, regulatory compliance (NBC), high availability, security

---

## Table of Contents

| # | Topic | Questions | File |
|---|-------|-----------|------|
| 0 | **Behavioral & HR Questions** | 14 Q&A (banking-tailored scripts) | [0-behavioral-questions.md](./0-behavioral-questions.md) |
| 1 | **Backend Architecture & System Design** | 18 Q&A | [1-backend.md](./1-backend.md) |
| 2 | **Spring Boot** | 45 Q&A | [2-spring-boot.md](./2-spring-boot.md) |
| 3 | **Database & Persistence** | 15 Q&A | [3-database.md](./3-database.md) |
| 4 | **DevOps & Cloud Infrastructure** | 12 Q&A | [4-devops.md](./4-devops.md) |
| 5 | **AI Integration** | 6 Q&A | [5-ai-integration.md](./5-ai-integration.md) |
| 6 | **Unit Testing & Quality Assurance** | 8 Q&A | [6-unit-testing.md](./6-unit-testing.md) |
| 7 | **Data Structures & Algorithms (DSA)** | 30 Q&A | [7-dsa.md](./7-dsa.md) |
| 8 | **Design Patterns & SOLID** | 25 Q&A | [8-design-patterns.md](./8-design-patterns.md) |
| 9 | **Questions to Ask HR & Manager** | 42 Questions | [9-questions-to-ask.md](./9-questions-to-ask.md) |

**Total: 215+ Questions & Answers**

---

## 🏦 Banking-Specific Focus Areas

> These topics are **heavily emphasized** in banking interviews. Master them thoroughly.

| Priority | Topic | Why Banks Care |
|----------|-------|---------------|
| 🔴 Critical | Transaction consistency & ACID | Incorrect balances = regulatory violation |
| 🔴 Critical | Idempotency & double-spending prevention | Duplicate payments = financial loss |
| 🔴 Critical | Security (OAuth2, JWT, encryption) | Banking data is the #1 target for attackers |
| 🔴 Critical | Distributed locking & concurrency | Concurrent balance updates must be serialized |
| 🟠 High | Audit trails & event sourcing | NBC (National Bank of Cambodia) requires full audit |
| 🟠 High | Database isolation levels | Race conditions in transfers = data corruption |
| 🟠 High | Rate limiting & fraud detection | Protect against brute-force and abuse |
| 🟡 Important | CQRS & read/write separation | High-traffic banking dashboards need read optimization |
| 🟡 Important | Graceful degradation & circuit breakers | Bank services must never fully go down |
| 🟡 Important | Observability & monitoring | SLA compliance requires comprehensive monitoring |

---

## Quick Reference — Key Topics Per File

### 0. Behavioral & HR
Tell me about yourself (banking-tailored script), Why should we hire you, Strengths & Weaknesses, Challenging projects (fintech context), Handling failure (production incident stories), Team conflict, Tight deadlines, Why banking, Why leaving, 5-year plan, Motivation, Prioritization, Salary expectations, Tips for Cambodian engineers

### 1. Backend Architecture
Monolith vs Microservices (banking context), Distributed Transactions (Saga for payments), API Versioning, CAP Theorem (banking trade-offs), Rate Limiting (fraud prevention), CQRS & Event Sourcing (audit trails), Notification System Design, Graceful Degradation, Idempotency (payment APIs), Back-pressure, Distributed Locking (balance updates), Multi-tenant SaaS (banking platform)

### 2. Spring Boot
DI & Stereotypes, Auto-configuration, Security & JWT (Keycloak for banking), Actuator (production monitoring), DB Migrations (zero-downtime in banking), Bean Lifecycle, Profiles, @Transactional Pitfalls (critical for banking), MVC vs WebFlux, Spring Cloud, Caching (balance caching strategies), AOP (audit logging), @Async, Exception Handling (banking error codes), Bean Validation, Test Slices, Scheduling (end-of-day reconciliation), Event-Driven (transaction events), N+1 Problem, Pagination, MapStruct, OpenAPI, Keycloak/OAuth2 (banking SSO), Spring Batch ETL (statement generation), Distributed Locking, Request Tracing, Dead Letter Queues, Performance Diagnostics

### 3. Database
Indexes (transaction table optimization), Query Optimization, SQL vs NoSQL (banking use cases), Connection Pooling, N+1 Problem, Transaction Isolation Levels (SERIALIZABLE for transfers), Sharding (multi-branch), Replication, PostGIS, Table Partitioning (transaction history), Deadlocks (concurrent transfers), Keyset Pagination, Materialized Views (reports), CAP Theorem, Schema Migrations in CI/CD

### 4. DevOps
CI/CD Pipelines (banking compliance), Docker Best Practices, Kubernetes, Secrets Management (PCI DSS), Observability, Blue-Green & Canary Deployments, Log Aggregation, Infrastructure as Code, Docker Compose, Shell-Script Deployment, Docker Swarm

### 5. AI Integration
LLM API Integration, RAG Pattern, Hallucination Mitigation, Cost Optimization, SSE Streaming, Document Processing (KYC automation)

### 6. Unit Testing
Testing Pyramid, Slice Tests, @Mock vs @MockBean, Testable Code Design, Async Testing, Testcontainers (PostgreSQL), Contract Testing, Mutation Testing

### 7. DSA
Array vs LinkedList, HashMap Internals, Sorting, Trees & Graphs, Stack & Queue, BST, Dynamic Programming, Two Pointers, Big O, Reverse LinkedList, Valid Parentheses, Dijkstra's, Recursion vs Iteration, Two Sum, Anagrams, Binary Search, Merge Intervals, LRU Cache, Kadane's Algorithm

### 8. Design Patterns & SOLID
SOLID Principles, Singleton, Factory, Builder, Strategy (payment routing), Observer (transaction events), Adapter (legacy banking integration), Facade, Decorator, Template Method, Command (CQRS), Proxy, DRY/KISS/YAGNI, DI Pattern, Repository, DTO, CQRS, Circuit Breaker

### 9. Questions to Ask
Team & role questions, Technology & practices, Growth & culture, Compensation & benefits, Work environment, Company culture, Hiring process, Red flags, Banking-specific questions (compliance, on-call, change management)
