# Senior Backend Developer — Full Interview Answers

---

## 1. Backend

---

### Q1. Explain the difference between monolithic and microservices architecture. When would you choose each?

**Monolithic Architecture** packages all application components (UI, business logic, data access) into a single deployable unit.

- Simple to develop, test, and deploy initially
- All modules share the same process and memory space
- Scaling means scaling the entire application, even if only one component is under load
- A bug in one module can bring down the whole system

**Microservices Architecture** decomposes the application into small, independently deployable services, each owning its own data and business domain.

- Each service can be scaled, deployed, and updated independently
- Technology heterogeneity: each service can use the best tool for the job
- Introduces complexity: distributed tracing, service discovery (Eureka, Consul), inter-service communication (REST, gRPC, messaging), and network latency

**When to choose Monolith:**
- Early-stage startup where speed of iteration matters
- Small team (< 10 engineers)
- Domain is not well understood yet — premature decomposition leads to wrong service boundaries

**When to choose Microservices:**
- Large teams where independent deployment cycles reduce bottlenecks
- Different services have different scaling requirements
- High availability and fault isolation are critical

> A senior answer acknowledges that microservices are not inherently better — they trade one set of problems for another.

---

### Q2. How do you handle distributed transactions across multiple microservices?

In a distributed system, traditional ACID transactions across services are impractical. The main approaches are:

**Two-Phase Commit (2PC):**
- Coordinator asks all participants to prepare, then commits or aborts
- Rarely used in microservices — blocks resources, coordinator is a single point of failure, and network partitions can leave participants in an uncertain state

**Saga Pattern (preferred):**
A saga is a sequence of local transactions, each publishing events or messages to trigger the next step. If a step fails, compensating transactions undo previous steps.

- **Choreography-based Saga:** Services react to events. Decoupled, but harder to track the overall flow.
- **Orchestration-based Saga:** A central orchestrator (e.g., using Temporal or a state machine) drives the saga steps. Easier to reason about and debug.

**Eventual Consistency:**
Accept that the system will be temporarily inconsistent and design compensating logic, idempotent consumers, and retry mechanisms accordingly.

**Tools:** Axon Framework, Eventuate, Temporal, or custom Kafka-based sagas.

> Strong answers include a real scenario, e.g., "In an order service, we used an orchestration saga: place order → reserve inventory → charge payment. If payment failed, we published a compensation event to release inventory."

---

### Q3. Describe your approach to API versioning in a large-scale system.

**Common strategies:**

1. **URI Versioning** — `/api/v1/users`, `/api/v2/users`
   - Simple, explicit, cache-friendly
   - Breaks REST purity (version is not a resource attribute)

2. **Header Versioning** — `Accept: application/vnd.myapp.v2+json`
   - Cleaner URLs, but harder to test in browsers

3. **Query Parameter** — `/api/users?version=2`
   - Easy but often messy and inconsistent

**Best practices:**
- Never break backward compatibility without a deprecation period (minimum 6 months)
- Use consumer-driven contract testing (Pact) to validate compatibility between producer and consumer
- Document deprecations clearly with `Deprecation` and `Sunset` HTTP headers
- Maintain at most 2 active major versions at a time
- Use OpenAPI/Swagger with version-specific specs

> The key senior insight: versioning is a last resort. Prefer additive, backward-compatible changes (new optional fields) over introducing new versions.

---

### Q4. What is the CAP theorem and how does it impact your database and architecture decisions?

**CAP Theorem** states that a distributed system can guarantee at most two of three properties simultaneously:

- **Consistency (C):** Every read receives the most recent write
- **Availability (A):** Every request receives a response (not necessarily the latest data)
- **Partition Tolerance (P):** The system continues operating despite network partitions

**Key insight:** Network partitions are inevitable in distributed systems, so P is non-negotiable. The real choice is between **CP** and **AP**.

| Database | CAP Position | Notes |
|----------|-------------|-------|
| PostgreSQL (single node) | CA | Partitions not expected |
| Cassandra | AP | Tunable consistency levels |
| MongoDB | CP (default) | Can be tuned toward AP |
| ZooKeeper / etcd | CP | Used for coordination |
| DynamoDB | AP | Eventual consistency by default |

**Practical impact:**
- For financial transactions → CP (strong consistency, e.g., PostgreSQL with serializable isolation)
- For user activity feeds, caches, analytics → AP (eventual consistency is acceptable)
- Use CQRS + event sourcing to separate read (eventually consistent) and write (strongly consistent) models

---

### Q5. How would you design a rate-limiting system for a public API?

**Algorithms:**

- **Token Bucket:** A bucket holds N tokens. Each request consumes one token. Tokens refill at a fixed rate. Allows bursts up to bucket size.
- **Leaky Bucket:** Requests are queued and processed at a fixed rate. Smooths out bursts.
- **Fixed Window Counter:** Count requests per window (e.g., per minute). Simple but allows double the rate at window boundaries.
- **Sliding Window Log / Counter:** More accurate, no boundary spikes. Slightly more memory-intensive.

**Implementation with Redis:**
```java
// Sliding window counter using Redis INCR + EXPIRE
String key = "rate:" + userId + ":" + currentMinute();
long count = redisTemplate.opsForValue().increment(key);
if (count == 1) redisTemplate.expire(key, 1, TimeUnit.MINUTES);
if (count > LIMIT) throw new RateLimitExceededException();
```

**Design considerations:**
- Rate limit per user, per API key, per IP, or per endpoint (different limits)
- Return `429 Too Many Requests` with `Retry-After` header
- Use a distributed counter (Redis) for multi-instance deployments
- Implement soft limits with warnings before hard cutoff
- Separate limits for authenticated vs anonymous users
- Use API Gateway (Kong, AWS API Gateway) for centralized enforcement

---

## 2. Spring Boot

---

### Q1. Explain Spring's dependency injection and the difference between @Component, @Service, @Repository, and @Controller.

**Dependency Injection (DI)** is a design pattern where an object's dependencies are provided externally rather than created internally. Spring's IoC (Inversion of Control) container manages object creation and wiring.

**Stereotype Annotations — all are specializations of `@Component`:**

| Annotation | Layer | Extra Behavior |
|-----------|-------|---------------|
| `@Component` | Generic | Basic Spring-managed bean |
| `@Service` | Business logic | Semantic clarity only |
| `@Repository` | Data access | Wraps persistence exceptions into Spring's `DataAccessException` hierarchy |
| `@Controller` | Web (MVC) | Marks as request handler, works with `@RequestMapping` |
| `@RestController` | Web (REST) | `@Controller` + `@ResponseBody` |

**Bean Scopes:**
- `singleton` (default) — one instance per Spring context
- `prototype` — new instance per injection
- `request` / `session` — one per HTTP request/session (web apps)

**Injection styles:**
- Constructor injection (preferred — immutable, testable)
- Field injection (`@Autowired` on field — harder to test)
- Setter injection (optional dependencies)

---

### Q2. How does Spring Boot auto-configuration work under the hood?

Spring Boot auto-configuration eliminates boilerplate setup by automatically configuring beans based on what's on the classpath.

**Mechanism:**
1. `@SpringBootApplication` includes `@EnableAutoConfiguration`
2. Spring Boot scans `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (Boot 2.7+) or `META-INF/spring.factories` (earlier)
3. Each entry is a `@Configuration` class annotated with conditions:
   - `@ConditionalOnClass` — only activate if a class exists on classpath
   - `@ConditionalOnMissingBean` — only activate if no user-defined bean exists
   - `@ConditionalOnProperty` — activate based on a config property

**Example:**
```java
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
public class DataSourceAutoConfiguration {
    @Bean
    public DataSource dataSource() { ... }
}
```

**Debugging:** Run with `--debug` flag to print a conditions report showing which auto-configurations were applied and why.

**Overriding:** Define your own bean of the same type — `@ConditionalOnMissingBean` ensures Spring's default is skipped.

---

### Q3. How does Spring Security handle authentication and authorization? How would you implement JWT?

**Authentication flow:**
1. Request hits `SecurityFilterChain`
2. `UsernamePasswordAuthenticationFilter` (or custom filter) extracts credentials
3. `AuthenticationManager` delegates to `AuthenticationProvider`
4. Provider calls `UserDetailsService.loadUserByUsername()` to fetch user
5. Password is validated; `Authentication` object is stored in `SecurityContextHolder`

**Authorization:**
- URL-based: `http.authorizeHttpRequests().requestMatchers("/admin/**").hasRole("ADMIN")`
- Method-based: `@PreAuthorize("hasRole('ADMIN')")` on service methods

**JWT Implementation:**

```java
// 1. Custom filter extending OncePerRequestFilter
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, ...) {
        String token = extractToken(req); // from Authorization header
        if (token != null && jwtUtil.isValid(token)) {
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                    jwtUtil.getUsername(token), null,
                    jwtUtil.getAuthorities(token));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(req, res);
    }
}

// 2. Configure stateless session
http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    .and().addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
```

**Token refresh strategy:** Issue short-lived access tokens (15 min) and long-lived refresh tokens (7 days). Refresh tokens stored in DB for revocation support.

---

### Q4. What are Spring Boot Actuator endpoints and how do you secure them in production?

Spring Boot Actuator exposes built-in HTTP endpoints for monitoring and management.

**Key endpoints:**

| Endpoint | Purpose |
|---------|---------|
| `/actuator/health` | Application health (DB, disk, custom) |
| `/actuator/metrics` | JVM, HTTP, custom metrics |
| `/actuator/info` | App metadata (version, git commit) |
| `/actuator/env` | Environment properties |
| `/actuator/loggers` | View/change log levels at runtime |
| `/actuator/threaddump` | JVM thread dump |
| `/actuator/httptrace` | Recent HTTP requests |

**Securing in production:**

Option 1 — Restrict via Spring Security:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, info
```
```java
http.requestMatcher(EndpointRequest.toAnyEndpoint())
    .authorizeRequests().anyRequest().hasRole("ACTUATOR_ADMIN");
```

Option 2 — Separate management port (most secure):
```yaml
management:
  server:
    port: 8081  # Not exposed externally, only internal network
```

**Integration:** Expose metrics to Prometheus via `micrometer-registry-prometheus`, visualize in Grafana.

---

### Q5. How do you handle database migrations in a Spring Boot app with zero downtime?

**Tools:** Flyway or Liquibase — both integrate with Spring Boot and run migrations automatically on startup.

**Zero-downtime migration strategy — Expand-Contract Pattern:**

Zero-downtime means old and new versions of the app must run simultaneously during deployment (blue-green or rolling).

**Step 1 — Expand (backward compatible):**
```sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255); -- nullable, no constraint yet
```
Both old and new app versions work. Old version ignores the column.

**Step 2 — Migrate data:**
```sql
UPDATE users SET full_name = first_name || ' ' || last_name;
```
Run as a background job or migration script.

**Step 3 — Contract (after full rollout):**
```sql
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```
Only safe once old app version is fully retired.

**Rules:**
- Never drop or rename a column in the same release that removes its usage in code
- Never add a NOT NULL column without a default in a live migration
- Test migrations against a production-size dataset

---

## 3. Database

---

### Q1. Explain the difference between clustered and non-clustered indexes. How do you decide what to index?

**Clustered Index:**
- Defines the physical order of rows on disk
- Only one per table (in most databases)
- In PostgreSQL, use `CLUSTER` command; in MySQL/InnoDB, the primary key is always the clustered index
- Range queries on the clustered key are fast (rows are physically adjacent)

**Non-Clustered Index:**
- A separate B-tree structure storing index key + pointer (row ID) to the actual row
- Multiple allowed per table
- Requires an extra lookup to fetch the full row (unless it's a covering index)

**Covering Index:** Includes all columns needed by a query, eliminating the row lookup:
```sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at);
-- Covers: SELECT status, created_at FROM orders WHERE user_id = ?
```

**Composite Index Column Order:**
- Put equality conditions first, range conditions last
- `WHERE user_id = ? AND created_at > ?` → index on `(user_id, created_at)`

**When to index:**
- Columns frequently used in WHERE, JOIN ON, ORDER BY
- High cardinality columns (many distinct values)
- Foreign keys (often missed — causes slow joins)

**When NOT to index:**
- Low cardinality columns (boolean, status with 2-3 values)
- Tables with heavy write load (indexes slow down INSERT/UPDATE/DELETE)
- Small tables (full scan is faster)

---

### Q2. How do you approach query optimization when a query is slow?

**Step-by-step process:**

1. **Identify the slow query** — pg_stat_statements (PostgreSQL), slow query log (MySQL)

2. **Run EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 AND status = 'PENDING';
```
Look for: Sequential Scans on large tables, high row estimates vs actuals, nested loop vs hash join.

3. **Check for missing indexes** — seq scan on a large table is usually the culprit

4. **Fix N+1 queries** — use JOIN FETCH or batch loading instead of per-entity queries

5. **Avoid SELECT *** — fetch only needed columns; reduces I/O and prevents over-fetching

6. **Optimize JOINs** — ensure JOIN columns are indexed, avoid joining on unindexed expressions

7. **Use query result caching** — Spring Cache (`@Cacheable`) with Redis for expensive, infrequently-changing queries

8. **Connection pool tuning** — ensure HikariCP pool size matches DB capacity; too small causes queue, too large causes DB contention

9. **Pagination** — never load unbounded result sets; use keyset pagination for large datasets instead of OFFSET

---

### Q3. When would you use SQL vs NoSQL? Describe a scenario where you switched and why.

**Use SQL (Relational) when:**
- Data has well-defined relationships and schema
- ACID transactions are required (financial, inventory)
- Complex queries with multiple JOINs
- Data integrity and referential constraints matter

**Use NoSQL when:**
- Schema is flexible or evolving rapidly
- Horizontal scaling is needed (sharding)
- Access pattern is known and simple (key-value lookups)
- High write throughput or time-series data

**NoSQL types and use cases:**

| Type | Example | Use Case |
|------|---------|----------|
| Document | MongoDB, Couchbase | User profiles, product catalogs |
| Key-Value | Redis, DynamoDB | Sessions, caches, leaderboards |
| Column-family | Cassandra | Time-series, IoT data |
| Graph | Neo4j | Social networks, recommendations |

**Example scenario:**
> "We started with PostgreSQL for a user activity feed. As the user base grew to millions, the `activity` table had billions of rows. Queries slowed despite indexing. We migrated the feed to Cassandra, partitioning by `user_id` and clustering by `timestamp DESC`. Read latency dropped from 800ms to 12ms. Relational data (users, accounts) stayed in PostgreSQL."

---

### Q4. Explain database connection pooling and how to tune it for high-traffic applications.

**Why pooling?** Opening a new DB connection is expensive (TCP handshake, authentication, memory allocation). A connection pool maintains a set of pre-opened connections and reuses them.

**HikariCP** (Spring Boot default):
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000   # 30s max wait for a connection
      idle-timeout: 600000        # 10min idle connection lifetime
      max-lifetime: 1800000       # 30min max connection lifetime
```

**Pool size formula (from HikariCP docs):**
```
pool_size = (core_count * 2) + effective_spindle_count
```
For a 4-core server with SSD: `(4 * 2) + 1 = 9`. More connections doesn't always mean more throughput — it increases context switching.

**Common mistakes:**
- Pool too large → DB runs out of connections, context switching overhead
- Pool too small → threads queue waiting for connections
- Not monitoring pool metrics → silent starvation

**Monitoring:**
- Actuator exposes HikariCP metrics: `hikaricp.connections.active`, `hikaricp.connections.pending`
- Alert on `pending > 0` for sustained periods

---

### Q5. What is the N+1 problem and how do you detect and fix it in JPA/Hibernate?

**The Problem:**
When fetching a list of N entities, JPA lazily loads each relationship with a separate query — resulting in 1 (list) + N (per-entity) = N+1 queries.

```java
// This triggers N+1 — one query per order to load its items
List<Order> orders = orderRepo.findAll(); // 1 query
for (Order o : orders) {
    o.getItems().size(); // N queries (lazy load)
}
```

**Detection:**
```yaml
spring:
  jpa:
    properties:
      hibernate:
        generate_statistics: true
logging:
  level:
    org.hibernate.stat: debug
```
Or use p6spy / datasource-proxy to log and count all SQL statements in tests.

**Fix 1 — JOIN FETCH in JPQL:**
```java
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.userId = :userId")
List<Order> findWithItems(@Param("userId") Long userId);
```

**Fix 2 — @EntityGraph:**
```java
@EntityGraph(attributePaths = {"items", "customer"})
List<Order> findByStatus(String status);
```

**Fix 3 — Batch fetching:**
```java
@OneToMany
@BatchSize(size = 50) // Loads items for 50 orders in one query
private List<Item> items;
```

**Fix 4 — DTO projections** (most efficient — no entity overhead):
```java
@Query("SELECT new com.example.OrderDTO(o.id, o.status, i.name) FROM Order o JOIN o.items i")
List<OrderDTO> findOrderSummaries();
```

---

## 4. DevOps

---

### Q1. Walk me through your CI/CD pipeline setup for a Spring Boot application.

**Typical pipeline stages:**

```
Code Push → CI Build → Unit Tests → Integration Tests
→ Docker Build → Push to Registry → Deploy to Staging
→ Smoke Tests → Deploy to Production → Health Check
```

**Tool stack example (GitHub Actions + AWS ECS):**

```yaml
# .github/workflows/deploy.yml
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      - name: Build & Test
        run: ./mvnw clean verify
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Push to ECR
        run: docker push $ECR_REGISTRY/myapp:${{ github.sha }}
      - name: Deploy to ECS
        run: aws ecs update-service --force-new-deployment
```

**Environment promotion:**
- `main` branch → deploy to staging automatically
- Production deploy requires manual approval or tagged release

**Rollback strategy:**
- Keep previous Docker image tag in registry
- ECS/Kubernetes: roll back to previous task definition/deployment
- Feature flags to disable new code without redeployment

**Secrets:** Never in code or environment variables in plain text. Use AWS Secrets Manager, GitHub Secrets, or Vault.

---

### Q2. How do you containerize a Spring Boot application? Best practices for the Dockerfile?

**Multi-stage Dockerfile (best practice):**

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q        # Cache dependencies layer
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Run (minimal image)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/*.jar app.jar

# JVM container-aware flags
ENTRYPOINT ["java",
  "-XX:+UseContainerSupport",
  "-XX:MaxRAMPercentage=75.0",
  "-jar", "app.jar"]
```

**Best practices:**
- Multi-stage build — don't ship the JDK or Maven in the final image
- Use JRE not JDK in runtime image
- Non-root user — reduces attack surface
- `.dockerignore` — exclude target/, .git, IDE files
- `-XX:+UseContainerSupport` — JVM respects container memory limits (Java 11+)
- `-XX:MaxRAMPercentage=75.0` — leaves headroom for OS and non-heap memory
- Pin base image version for reproducibility

---

### Q3. Explain Kubernetes key concepts: Pod, Deployment, Service, Ingress, ConfigMap, Secret.

| Resource | Purpose |
|---------|---------|
| **Pod** | Smallest deployable unit — one or more containers sharing network and storage |
| **Deployment** | Manages desired state of Pods; handles rolling updates and rollbacks |
| **Service** | Stable network endpoint for a set of Pods (ClusterIP / NodePort / LoadBalancer) |
| **Ingress** | HTTP routing rules — maps hostnames/paths to Services; TLS termination |
| **ConfigMap** | Non-sensitive configuration (env vars, config files) injected into Pods |
| **Secret** | Sensitive config (passwords, tokens) — base64 encoded, optionally encrypted at rest |

**Deployment example with liveness and readiness probes:**
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 5
```

**Liveness vs Readiness:**
- Liveness: "Is the app alive?" — failure triggers restart
- Readiness: "Is the app ready to receive traffic?" — failure removes from Service load balancer (safe for zero-downtime deployments)

**HPA (Horizontal Pod Autoscaler):** Scales Pods based on CPU/memory or custom metrics from Prometheus.

---

### Q4. How do you manage application secrets and configurations across environments?

**Rule #1: Never commit secrets to version control.**

**Configuration management:**
- Spring profiles (`application-dev.yml`, `application-prod.yml`) for non-sensitive config
- ConfigMaps in Kubernetes for environment-specific values
- Spring Cloud Config Server for centralized config across many services

**Secrets management options:**

| Tool | When to use |
|------|------------|
| **HashiCorp Vault** | Multi-cloud, dynamic secrets, lease-based rotation |
| **AWS Secrets Manager** | AWS-native, auto-rotation, IAM integration |
| **Kubernetes Secrets** | Simple setups; use with Sealed Secrets or External Secrets Operator |
| **Azure Key Vault / GCP Secret Manager** | Cloud-native equivalents |

**Kubernetes External Secrets Operator pattern:**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  secretStoreRef:
    name: aws-secrets-manager
  target:
    name: db-secret
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: prod/myapp/db
        property: password
```

**Secret rotation:** Secrets should have TTLs and be rotated automatically. Apps should handle credential refresh without restart (dynamic datasource reconfiguration).

---

### Q5. What is your observability strategy? How do you implement logging, metrics, and tracing?

**The Three Pillars of Observability:**

**1. Logs — Structured JSON logging:**
```java
// Use SLF4J + Logback with JSON encoder
log.info("Order processed", kv("orderId", id), kv("userId", userId), kv("duration_ms", elapsed));
```
- Ship to ELK Stack (Elasticsearch + Logstash + Kibana) or Grafana Loki
- Always include correlation ID / trace ID in every log line
- Log at appropriate levels — avoid INFO spam in hot paths

**2. Metrics — Micrometer + Prometheus + Grafana:**
```java
// Custom metric example
Counter.builder("orders.processed")
    .tag("status", "success")
    .register(meterRegistry)
    .increment();
```
```yaml
management:
  metrics:
    export:
      prometheus:
        enabled: true
  endpoints:
    web:
      exposure:
        include: prometheus, health, metrics
```
Key metrics: HTTP latency (p50, p95, p99), error rates, JVM memory/GC, DB pool saturation, queue depth.

**3. Distributed Tracing — OpenTelemetry + Jaeger/Zipkin:**
```xml
<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
```
- Trace ID propagated automatically across HTTP (via headers) and Kafka (via message headers)
- Visualize end-to-end request flows in Jaeger UI
- Sample 100% in dev, 1-5% in production (tail-based sampling for errors)

**Correlation ID pattern:**
```java
// In a filter/interceptor
MDC.put("traceId", request.getHeader("X-Trace-Id"));
// Included in every log line automatically via Logback pattern
```

---

## 5. AI Integration

---

### Q1. How would you integrate an LLM API into a backend service? What challenges do you anticipate?

**Integration with Spring Boot (WebClient for non-blocking calls):**
```java
@Service
public class LlmService {
    private final WebClient webClient;

    public Mono<String> complete(String prompt) {
        return webClient.post()
            .uri("https://api.anthropic.com/v1/messages")
            .header("x-api-key", apiKey)
            .bodyValue(Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 1000,
                "messages", List.of(Map.of("role", "user", "content", prompt))
            ))
            .retrieve()
            .bodyToMono(LlmResponse.class)
            .map(r -> r.content().get(0).text())
            .timeout(Duration.ofSeconds(30))
            .onErrorReturn("Service temporarily unavailable");
    }
}
```

**Key challenges and mitigations:**

| Challenge | Mitigation |
|----------|-----------|
| High latency (1–30s) | Async/reactive calls, streaming responses, timeout handling |
| Non-determinism | Structured output prompting, output validation, temperature=0 for deterministic tasks |
| Cost | Caching, prompt compression, model tiering |
| Prompt injection | Input sanitization, system prompt hardening, output validation |
| Rate limits | Exponential backoff with jitter, request queuing |
| Token limits | Chunking long inputs, summarization pipelines |
| Hallucinations | RAG for factual queries, confidence thresholds, human review |

**Caching deterministic responses:**
```java
@Cacheable(value = "llm-responses", key = "#prompt.hashCode()")
public String cachedComplete(String prompt) { ... }
```

---

### Q2. Explain RAG (Retrieval-Augmented Generation). How would you implement it in a Java/Spring backend?

**What is RAG?**
RAG grounds LLM responses in your own data by retrieving relevant context at query time and injecting it into the prompt. This reduces hallucinations and enables the LLM to answer questions about proprietary or recent information it wasn't trained on.

**Pipeline:**
```
Document Ingestion:
  Raw Docs → Chunking → Embedding Model → Vector Store

Query Time:
  User Query → Embed Query → Similarity Search → Top-K Chunks
            → Inject into Prompt → LLM → Answer
```

**Implementation with Spring AI + pgvector:**
```java
// 1. Ingest documents
@Service
public class DocumentIngestionService {
    private final VectorStore vectorStore;
    private final TokenTextSplitter splitter;

    public void ingest(Resource document) {
        List<Document> docs = new TikaDocumentReader(document).get();
        List<Document> chunks = splitter.apply(docs); // ~500 token chunks with overlap
        vectorStore.add(chunks); // Embeds and stores in pgvector
    }
}

// 2. Query with context
public String queryWithRag(String userQuestion) {
    List<Document> context = vectorStore.similaritySearch(
        SearchRequest.query(userQuestion).withTopK(5)
    );
    String contextText = context.stream()
        .map(Document::getContent)
        .collect(Collectors.joining("\n\n"));

    String prompt = """
        Answer based on the following context:
        %s

        Question: %s
        """.formatted(contextText, userQuestion);

    return llmService.complete(prompt);
}
```

**Key design decisions:**
- Chunk size (300–1000 tokens) and overlap (10-20%) affect retrieval quality
- Embedding model must match at query and ingestion time
- Re-ranking (cross-encoder) improves precision after initial retrieval
- Metadata filtering (e.g., by document type, date) narrows the search space

---

### Q3. How do you handle non-determinism and hallucinations from LLMs in a production system?

**Non-determinism strategies:**
- Set `temperature=0` for tasks requiring consistent, deterministic output
- Use structured output / JSON mode to constrain response format
- Prompt the model to say "I don't know" rather than guess

**Hallucination mitigation:**
- Use RAG to ground responses in verified source documents
- Prompt: "Answer only based on the provided context. If the answer is not in the context, say 'I don't have enough information.'"
- Validate output against known schemas or business rules
- Use a second LLM call as a verifier/judge for high-stakes responses

**Structured output (enforced schema):**
```java
// Prompt engineering approach
String prompt = """
    Respond ONLY with valid JSON matching this schema:
    {"category": string, "confidence": number (0-1), "summary": string}
    Do not include any other text.
    """;

// Parse and validate
ObjectMapper mapper = new ObjectMapper();
MyResponse response = mapper.readValue(llmOutput, MyResponse.class);
if (response.confidence() < 0.7) {
    escalateToHumanReview(response);
}
```

**Human-in-the-loop for high-stakes decisions:**
- Never automate irreversible actions (payments, deletions) based solely on LLM output
- Route low-confidence or out-of-scope responses to human agents
- Log all LLM inputs/outputs for audit and retraining

---

### Q4. What strategies would you use to reduce LLM API costs at scale?

LLM APIs charge per token (input + output). At scale, costs can be significant.

**Strategy 1 — Semantic caching:**
Cache responses not by exact prompt match, but by semantic similarity. If a new query is within a threshold distance of a cached query, return the cached response.
```java
// Use Redis + embedding similarity
float[] queryEmbedding = embedService.embed(userQuery);
Optional<CachedResponse> cached = semanticCache.findSimilar(queryEmbedding, threshold=0.95);
if (cached.isPresent()) return cached.get().response();
```

**Strategy 2 — Model tiering:**
- Use cheap/fast models (e.g., Claude Haiku, GPT-4o mini) for simple classification, extraction, routing
- Reserve expensive models for complex reasoning, generation
- Route based on task complexity or user tier

**Strategy 3 — Prompt compression:**
- Remove unnecessary whitespace, redundant instructions
- Compress context using summarization before injection
- Use shorter system prompts, avoid repeating instructions

**Strategy 4 — Batching (for async workloads):**
- Anthropic and OpenAI offer batch APIs at 50% discount for non-real-time jobs
- Useful for: bulk document processing, report generation, nightly analytics

**Strategy 5 — Output length control:**
- Set `max_tokens` aggressively per task type
- Prompt the model to be concise: "Respond in 2-3 sentences maximum"

**Strategy 6 — Monitor and attribute costs:**
- Track token usage per feature, per user tier, per model
- Set spending alerts and per-user quotas
- Use this data to prioritize optimization efforts

---

## 6. Unit Testing

---

### Q1. Explain the testing pyramid. How do you balance unit, integration, and end-to-end tests?

**The Testing Pyramid:**

```
        /\
       /E2E\          Few — slow, fragile, expensive
      /------\
     / Integr \       Some — medium speed
    /----------\
   /   Unit     \     Many — fast, isolated, cheap
  /--------------\
```

**Unit Tests:**
- Test a single class/method in isolation with all dependencies mocked
- Run in milliseconds — thousands per second
- High coverage of business logic, edge cases, error handling

**Integration Tests:**
- Test interaction between components (service + repository, controller + service)
- Use `@SpringBootTest` (full context) or slice tests (`@DataJpaTest`, `@WebMvcTest`)
- Run in seconds — keep to critical paths

**End-to-End Tests:**
- Test the full system from HTTP request to DB and back
- Use tools like RestAssured, Playwright, or Testcontainers
- Run in minutes — only test the most critical user journeys

**Coverage philosophy:**
- Target ~80% line coverage as a guideline, not a goal
- 100% coverage with trivial tests is worse than 70% with meaningful tests
- Use mutation testing (PIT Mutation Testing) to verify test quality — it mutates your code and checks if tests catch the mutations

---

### Q2. How do you unit test a Spring Boot service that depends on a database and external API?

**Unit test (pure, no Spring context):**
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldThrowWhenPaymentFails() {
        when(paymentClient.charge(any())).thenThrow(new PaymentException("declined"));
        assertThrows(OrderException.class, () -> orderService.placeOrder(testOrder()));
        verify(orderRepository, never()).save(any()); // compensating logic
    }
}
```

**Repository slice test (`@DataJpaTest`):**
```java
@DataJpaTest // Loads only JPA layer, uses H2 by default
class OrderRepositoryTest {
    @Autowired private OrderRepository repo;

    @Test
    void shouldFindPendingOrdersByUser() {
        // ...
    }
}
```

**Controller slice test (`@WebMvcTest`):**
```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired private MockMvc mvc;
    @MockBean private OrderService orderService; // mocked in Spring context

    @Test
    void shouldReturn404WhenOrderNotFound() throws Exception {
        when(orderService.findById(99L)).thenThrow(new NotFoundException());
        mvc.perform(get("/api/orders/99"))
           .andExpect(status().isNotFound());
    }
}
```

**External HTTP API stubbing (WireMock):**
```java
@RegisterExtension
WireMockExtension wm = WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

@Test
void shouldHandlePaymentApiTimeout() {
    wm.stubFor(post("/payments").willReturn(aResponse().withFixedDelay(5000)));
    // assert timeout handling
}
```

---

### Q3. What is the difference between @Mock and @MockBean?

| | `@Mock` (Mockito) | `@MockBean` (Spring Boot Test) |
|--|--|--|
| Spring context | Not required | Requires Spring context |
| Speed | Very fast (no context startup) | Slower (full or partial context) |
| Used with | `@ExtendWith(MockitoExtension.class)` | `@SpringBootTest`, `@WebMvcTest` |
| Behavior | Pure Mockito mock | Replaces/registers bean in ApplicationContext |
| Use when | Pure unit test | Need Spring infrastructure (security, MVC, etc.) |

```java
// @Mock — no Spring context, fast
@ExtendWith(MockitoExtension.class)
class ServiceTest {
    @Mock UserRepository repo;
    @InjectMocks UserService service;
}

// @MockBean — Spring context, use when you need the full stack
@WebMvcTest(UserController.class)
class ControllerTest {
    @MockBean UserService service; // replaces real bean in context
    @Autowired MockMvc mvc;
}
```

**Rule of thumb:** Prefer `@Mock` for service/domain logic tests. Use `@MockBean` only when you genuinely need the Spring infrastructure (e.g., testing security rules, MVC binding, filter chains).

---

### Q4. How do you write testable code? What design patterns help?

**Core principles:**

**1. Dependency Injection — inject, don't instantiate:**
```java
// Bad — hard to test
public class OrderService {
    private PaymentClient client = new PaymentClient(); // can't mock
}

// Good — inject the dependency
public class OrderService {
    private final PaymentClient client;
    public OrderService(PaymentClient client) { this.client = client; }
}
```

**2. Single Responsibility — one reason to change:**
A class that does validation + business logic + persistence is hard to test any one concern without triggering the others.

**3. Avoid static methods and Singletons:**
Static calls can't be mocked. Prefer instance methods injected via DI.

**4. Ports & Adapters (Hexagonal Architecture):**
```
[HTTP Controller] → [Application Service] → [Domain Logic]
                                          ↕
                              [Port/Interface] → [Adapter] → [DB / API]
```
The domain logic only knows about the port interface. In tests, swap the adapter with an in-memory fake. No Spring context needed for domain tests.

**5. Avoid leaking framework concerns into domain:**
Domain objects should be plain Java. No `@Entity`, no `@Autowired` in core business classes.

---

### Q5. How do you test async or event-driven code?

**Spring @Async methods:**
```java
// Use Awaitility to poll until condition is true
@Test
void shouldProcessOrderAsync() {
    orderService.processAsync(order);

    await().atMost(5, SECONDS)
           .until(() -> orderRepository.findById(order.getId())
                                       .map(o -> "PROCESSED".equals(o.getStatus()))
                                       .orElse(false));
}
```

**Kafka consumer tests (`@EmbeddedKafka`):**
```java
@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"orders"})
class OrderConsumerTest {

    @Autowired KafkaTemplate<String, String> kafkaTemplate;
    @Autowired OrderRepository repo;

    @Test
    void shouldConsumeOrderEvent() throws Exception {
        kafkaTemplate.send("orders", "{\"orderId\":\"123\",\"status\":\"PLACED\"}");

        await().atMost(10, SECONDS)
               .until(() -> repo.findById("123").isPresent());
    }
}
```

**Reactive streams (Project Reactor):**
```java
@Test
void shouldEmitOrderEvents() {
    Flux<OrderEvent> events = orderService.streamEvents(userId);

    StepVerifier.create(events)
        .expectNextMatches(e -> e.type().equals("ORDER_PLACED"))
        .expectNextMatches(e -> e.type().equals("PAYMENT_CONFIRMED"))
        .expectComplete()
        .verify(Duration.ofSeconds(5));
}
```

**Key principles for async tests:**
- Never use `Thread.sleep()` — flaky and slow. Use Awaitility instead.
- Make consumers idempotent and test that behavior explicitly
- Use `@EmbeddedKafka` for integration; mock the consumer trigger in unit tests
- Test error paths: what happens when deserialization fails, retries exhaust, DLQ is used

---

---

### Q6. What is the difference between @Controller and @RestController?

**@Controller:**
- Used to mark a class as a Spring MVC controller.
- Typically used in traditional web applications where the controller returns a view (e.g., HTML/JSP pages).
- To return data (like JSON or XML) instead of a view, you must use `@ResponseBody` on the method.

**@RestController:**
- A convenience annotation introduced in Spring 4.0.
- It is a combination of `@Controller` and `@ResponseBody`.
- Automatically serializes the returned objects into JSON or XML and writes them directly into the HTTP response body.
- Used specifically for creating RESTful APIs.

---

### Q7. Explain the relationship between Spring Data JPA, Hibernate, and JDBC.

**JDBC (Java Database Connectivity):**
- The low-level standard Java API for connecting to databases and executing raw SQL. It requires a lot of boilerplate code (opening connections, prepared statements, handling result sets, catching checked exceptions).

**Hibernate:**
- An implementation of the JPA (Java Persistence API) specification.
- It is an Object-Relational Mapping (ORM) framework that sits on top of JDBC. It maps Java objects to database tables and translates JPQL/HQL queries into actual SQL queries.

**Spring Data JPA:**
- An abstraction layer built on top of the JPA provider (which is usually Hibernate by default in Spring Boot).
- It drastically reduces boilerplate code by allowing you to define repository interfaces (e.g., `interface UserRepository extends JpaRepository<User, Long>`).
- Spring automatically generates the implementation of these interfaces at runtime, providing basic CRUD operations and query derivation from method names (e.g., `findByEmail`).

---

### Q8. Describe the Spring Bean Life Cycle.

The lifecycle of a Spring Bean is managed by the Spring IoC (Inversion of Control) container:

1. **Instantiation:** The container instantiates the bean (usually via constructor).
2. **Populate Properties:** Spring injects the declared dependencies (Dependency Injection).
3. **BeanNameAware / BeanFactoryAware:** If the bean implements these interfaces, Spring passes the bean's name or the factory instance.
4. **Pre-Initialization (BeanPostProcessor):** `postProcessBeforeInitialization()` is called. This is where `@PostConstruct` annotated methods are executed.
5. **Initialization:** Custom init methods (like `afterPropertiesSet` if implementing `InitializingBean`, or a custom init-method in XML/`@Bean`) are called.
6. **Post-Initialization (BeanPostProcessor):** `postProcessAfterInitialization()` is called. This is often where AOP proxies are created around the bean.
7. **Ready for Use:** The bean is fully initialized and lives in the context.
8. **Destruction:** When the application context closes, `@PreDestroy` methods are called, followed by `destroy()` (if implementing `DisposableBean`) or custom destroy methods.

---

## 7. Data Structures & Algorithms (DSA)

---

### Q1. Describe the difference between an Array and a LinkedList. When would you use each?

**Array (ArrayList in Java):**
- **Memory Allocation:** Stores elements in contiguous memory locations.
- **Access Time:** O(1) time complexity for accessing an element by index because the memory address is easily calculated.
- **Insert/Delete:** O(n) time complexity for inserting or deleting elements (especially at the beginning or middle) because subsequent elements must be shifted.
- **Use when:** You need fast, frequent read access by index, and the size is relatively static or additions happen mostly at the end.

**LinkedList:**
- **Memory Allocation:** Elements (nodes) are scattered in memory. Each node contains the data and a reference (pointer) to the next (and possibly previous) node.
- **Access Time:** O(n) time complexity for accessing an element because you must traverse from the head node.
- **Insert/Delete:** O(1) time complexity for insertions/deletions *if you already have the reference to the node*, because it involves merely updating pointers.
- **Use when:** You need frequent insertions and deletions in the middle of the list, and random access by index is rarely needed. Frequently used to implement Queues or Stacks.

---

### Q2. How does a HashMap work internally in Java?

A `HashMap` stores key-value pairs and provides O(1) average time complexity for `get()` and `put()` operations.

**Internal workings:**
1. **Hashing:** When `put(key, value)` is called, the HashMap calculates the hash code of the key (`key.hashCode()`). It then applies a secondary hash function to mitigate poor hash functions and calculates the index (bucket) in the underlying array.
2. **Collision:** If two different keys map to the same bucket index (a collision), Java stores them in a LinkedList at that specific bucket.
3. **Equals:** When `get(key)` is called, it calculates the hash to find the bucket. If there are multiple entries in the bucket (a LinkedList), it uses the `key.equals()` method to traverse the list and find the exact matching key to return the corresponding value.
4. **Treeifying (Java 8+):** To prevent performance degradation from long collision lists (O(n)), if a single bucket gets more than 8 elements, the LinkedList is converted into a Balanced Tree (Red-Black Tree), improving worst-case search time in that bucket from O(n) to O(log n).

---

### Q3. Explain the time complexity of common sorting algorithms. Which ones are used in practice?

| Algorithm | Average Time | Worst Case Time | Space Complexity | Notes |
|---|---|---|---|---|
| **Bubble Sort** | O(n^2) | O(n^2) | O(1) | Educational only; never used in production. |
| **Insertion Sort** | O(n^2) | O(n^2) | O(1) | Fast for very small or nearly sorted datasets. |
| **Merge Sort** | O(n log n) | O(n log n) | O(n) | Stable sort. Good for LinkedLists and large datasets. Used in Java's `Arrays.sort()` for Objects. |
| **Quick Sort** | O(n log n) | O(n^2) | O(log n) | Very fast in practice. Prone to worst-case if pivot is bad, but randomized/median-of-three mitigates this. Used in Java's `Arrays.sort()` for primitives (Dual-Pivot Quicksort). |

---

### Q4. What is the difference between a Tree and a Graph? Explain BFS and DFS.

**Tree vs. Graph:**
- A **Graph** is a collection of nodes (vertices) connected by edges. It can have cycles (loops) and disconnected components.
- A **Tree** is a special type of Graph that is connected, undirected, and has **no cycles**. It possesses a hierarchical structure with a single root node.

**Traversal Algorithms:**
- **BFS (Breadth-First Search):** Explores the graph level by level, moving uniformly outward from the starting node. It evaluates all immediate neighbors before moving to the next level of neighbors.
  - *Implementation:* Uses a **Queue** (FIFO).
  - *Use cases:* Finding the shortest path in an unweighted graph, peer-to-peer networks.
- **DFS (Depth-First Search):** Explores as far down a single branch/path as possible before backtracking.
  - *Implementation:* Uses a **Stack** (LIFO) or recursion.
  - *Use cases:* Topological sorting, finding connected components, solving mazes/puzzles, cycle detection.

---

### Q5. What is a Stack and a Queue? Give real-world backend examples.

**Stack (LIFO — Last In, First Out):**
- Think of a stack of plates. The last plate placed on top is the first one removed.
- Operations: `push()` (add to top), `pop()` (remove from top), `peek()` (view top) — all O(1).
- **Backend examples:**
  - **Call stack / recursion:** Every method call pushes a frame onto the call stack.
  - **Undo functionality:** Each action is pushed; undo pops the last action.
  - **Expression parsing:** Evaluating mathematical expressions, matching parentheses `(){}[]`.
  - **DFS traversal:** Uses a stack (explicitly or via recursion).

**Queue (FIFO — First In, First Out):**
- Think of a line at a ticket counter. The first person in line is served first.
- Operations: `enqueue()` (add to rear), `dequeue()` (remove from front) — all O(1).
- **Backend examples:**
  - **Message queues:** Kafka, RabbitMQ — messages processed in order.
  - **Task/job scheduling:** Background jobs processed in the order they arrive.
  - **Rate limiting:** Request queue with fixed processing rate.
  - **BFS traversal:** Uses a queue to explore level by level.

**Priority Queue (Heap):**
- A specialized queue where elements are dequeued based on priority, not insertion order.
- Implemented as a binary heap — O(log n) insert, O(log n) remove, O(1) peek.
- **Backend examples:** Task scheduling by priority, Dijkstra's shortest path algorithm, load balancer routing to least-loaded server.

---

### Q6. What is a Binary Search Tree (BST)? What problem does a balanced BST solve?

**Binary Search Tree (BST):**
A BST is a binary tree where for every node:
- All values in the **left subtree** are **less than** the node's value.
- All values in the **right subtree** are **greater than** the node's value.

This property enables efficient searching:
```
        8
       / \
      3   10
     / \    \
    1   6   14
       / \
      4   7
```
- **Search, Insert, Delete:** O(log n) average — at each step, we eliminate half the tree.

**The Problem — Degenerate Trees:**
If elements are inserted in sorted order (1, 2, 3, 4, 5...), the BST degenerates into a linked list:
```
1
 \
  2
   \
    3
     \
      4
```
Now all operations become O(n) — no better than a list.

**Solution — Self-Balancing BSTs:**
- **AVL Tree:** Strictly balanced (height difference between left/right subtrees ≤ 1). Faster reads, more rotations on writes.
- **Red-Black Tree:** Loosely balanced (longest path ≤ 2x shortest path). Fewer rotations on writes. Used internally by Java's `TreeMap`, `TreeSet`, and `HashMap` (for treeified buckets).

---

### Q7. Explain Dynamic Programming. How do you identify a DP problem?

**Dynamic Programming (DP)** is an optimization technique that solves complex problems by breaking them into overlapping subproblems and caching their results to avoid redundant computation.

**Two key properties to identify a DP problem:**
1. **Optimal Substructure:** The optimal solution to the problem can be constructed from optimal solutions to its subproblems.
2. **Overlapping Subproblems:** The same subproblems are solved multiple times (unlike Divide and Conquer where subproblems don't overlap).

**Two approaches:**

**Top-Down (Memoization) — Recursion + Cache:**
```java
// Fibonacci with memoization
Map<Integer, Long> memo = new HashMap<>();
public long fib(int n) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);
    long result = fib(n - 1) + fib(n - 2);
    memo.put(n, result);
    return result;
}
// Time: O(n), Space: O(n)
```

**Bottom-Up (Tabulation) — Iterative + Table:**
```java
public long fib(int n) {
    if (n <= 1) return n;
    long prev2 = 0, prev1 = 1;
    for (int i = 2; i <= n; i++) {
        long curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
// Time: O(n), Space: O(1)
```

**Common DP problems in interviews:**
- Fibonacci sequence, Climbing Stairs
- Longest Common Subsequence (LCS)
- Knapsack Problem (0/1)
- Coin Change
- Longest Increasing Subsequence

---

### Q8. Explain the Two Pointers technique. Provide examples.

**Two Pointers** is a technique where two references (indices or iterators) traverse a data structure simultaneously, typically from different positions or at different speeds, to solve problems efficiently in O(n) time instead of O(n²).

**Pattern 1 — Opposite ends (sorted array):**
```java
// Two Sum on a sorted array
public int[] twoSum(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) return new int[]{left, right};
        else if (sum < target) left++;
        else right--;
    }
    return new int[]{};  // not found
}
// Time: O(n), Space: O(1)
```

**Pattern 2 — Slow/Fast pointers (linked list cycle detection — Floyd's Algorithm):**
```java
public boolean hasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;       // moves 1 step
        fast = fast.next.next;  // moves 2 steps
        if (slow == fast) return true;  // cycle detected
    }
    return false;
}
```

**Pattern 3 — Sliding Window (subarray problems):**
```java
// Max sum subarray of size k
public int maxSumSubarray(int[] arr, int k) {
    int windowSum = 0, maxSum = 0;
    for (int i = 0; i < arr.length; i++) {
        windowSum += arr[i];
        if (i >= k) windowSum -= arr[i - k];
        if (i >= k - 1) maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}
```

---

### Q9. What is Big O notation? Explain common complexities with examples.

**Big O notation** describes the upper bound of an algorithm's time or space requirements as the input size (n) grows. It tells us how an algorithm *scales*.

| Complexity | Name | Example | Practical Feel |
|---|---|---|---|
| **O(1)** | Constant | HashMap `get()`, array access by index | Instant regardless of data size |
| **O(log n)** | Logarithmic | Binary search, balanced BST lookup | Doubling data adds one step |
| **O(n)** | Linear | Single loop through array, LinkedList search | 2x data = 2x time |
| **O(n log n)** | Linearithmic | Merge Sort, Quick Sort (average) | Optimal comparison-based sort |
| **O(n²)** | Quadratic | Nested loops, Bubble Sort | 2x data = 4x time; avoid for large n |
| **O(2ⁿ)** | Exponential | Recursive Fibonacci (without memo), power set | Doubles with each +1 to input |
| **O(n!)** | Factorial | Generating all permutations | Totally impractical for n > 15 |

**Rules for calculating Big O:**
1. **Drop constants:** O(2n) → O(n)
2. **Drop lower-order terms:** O(n² + n) → O(n²)
3. **Different inputs = different variables:** Two arrays → O(n + m), not O(n)
4. **Nested loops multiply:** Loop inside loop on same data → O(n × n) = O(n²)

---

### Q10. Solve: Reverse a linked list. Explain your approach.

This is one of the most classic interview coding problems.

**Iterative approach (preferred):**
```java
public ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode next = curr.next;  // save next node
        curr.next = prev;           // reverse the pointer
        prev = curr;                // advance prev
        curr = next;                // advance curr
    }
    return prev;  // prev is the new head
}
// Time: O(n), Space: O(1)
```

**Step-by-step walkthrough for `1 → 2 → 3 → null`:**
```
Step 0: prev=null, curr=1→2→3
Step 1: prev=1→null, curr=2→3
Step 2: prev=2→1→null, curr=3
Step 3: prev=3→2→1→null, curr=null
Return prev → 3→2→1→null
```

**Recursive approach:**
```java
public ListNode reverseList(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = reverseList(head.next);
    head.next.next = head;  // reverse the link
    head.next = null;        // break old link
    return newHead;
}
// Time: O(n), Space: O(n) — recursion stack
```

---

## 8. Additional Spring Boot Deep Dives

---

### Q1. How do Spring Profiles work? How do you manage configuration across environments?

**Spring Profiles** allow you to define environment-specific beans and configuration. Only configuration belonging to the active profile(s) is loaded.

**Activating a profile:**
```yaml
# application.yml — default for all environments
spring:
  profiles:
    active: dev   # can be overridden at runtime
```
```bash
# Override at runtime
java -jar app.jar --spring.profiles.active=prod
# Or via environment variable
SPRING_PROFILES_ACTIVE=prod java -jar app.jar
```

**Profile-specific config files:**
```
application.yml          → loaded always (defaults)
application-dev.yml      → loaded when profile = dev
application-staging.yml  → loaded when profile = staging
application-prod.yml     → loaded when profile = prod
```

**Profile-specific beans:**
```java
@Configuration
@Profile("prod")
public class ProdCacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new RedisCacheManager(...);  // Redis in prod
    }
}

@Configuration
@Profile("dev")
public class DevCacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();  // In-memory for dev
    }
}
```

**Best practice:** Keep `application.yml` as the shared defaults. Override only what changes per environment in the profile-specific files.

---

### Q2. What are the common pitfalls of `@Transactional` in Spring?

`@Transactional` is powerful but has several traps that even experienced developers fall into:

**Pitfall 1 — Self-invocation (most common):**
```java
@Service
public class OrderService {
    public void process() {
        this.save();  // @Transactional on save() is IGNORED!
    }

    @Transactional
    public void save() { ... }
}
```
Spring `@Transactional` works via AOP proxy. Internal method calls bypass the proxy. **Fix:** Extract the transactional method into a separate bean, or use `@Transactional` on the calling method instead.

**Pitfall 2 — Wrong exception type:**
```java
@Transactional  // only rolls back on unchecked exceptions (RuntimeException) by default!
public void process() throws IOException {
    repo.save(entity);
    throw new IOException("fail");  // Transaction COMMITS, not rolls back!
}
// Fix:
@Transactional(rollbackFor = Exception.class)
```

**Pitfall 3 — Private or final methods:**
`@Transactional` does not work on `private` or `final` methods because CGLIB proxies cannot override them.

**Pitfall 4 — Read-only optimization missed:**
```java
@Transactional(readOnly = true)  // hints the DB and Hibernate to optimize
public List<Order> findAll() { ... }
```
Setting `readOnly = true` for queries disables dirty checking in Hibernate and can enable read replicas at the DB driver level.

**Pitfall 5 — Long transactions:**
Holding a transaction open while calling an external API or doing heavy computation keeps the DB connection locked. **Fix:** Keep transactions short; do external calls outside the transactional boundary.

---

### Q3. Compare Spring MVC (blocking) vs Spring WebFlux (reactive). When would you choose WebFlux?

**Spring MVC (Servlet-based, blocking):**
- One thread per request (thread-per-request model).
- Thread blocks while waiting for DB, HTTP calls, or I/O.
- Scales by adding more threads (e.g., Tomcat default = 200 threads).
- Simple, familiar, easier to debug.

**Spring WebFlux (Reactive, non-blocking):**
- Uses an event-loop model (like Node.js) with a small number of threads (typically = CPU cores).
- Thread is never blocked — yields while waiting for I/O and picks up another request.
- Uses `Mono<T>` (0 or 1 result) and `Flux<T>` (0 to N results) instead of blocking return types.
- Scales by handling more concurrent requests per thread.

```java
// MVC — blocking
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userService.findById(id);  // blocks thread until DB responds
}

// WebFlux — reactive
@GetMapping("/users/{id}")
public Mono<User> getUser(@PathVariable Long id) {
    return userService.findById(id);  // returns immediately, callback when ready
}
```

**When to choose WebFlux:**
- Very high concurrency with many simultaneous connections (e.g., 10,000+ concurrent requests)
- Streaming use cases (Server-Sent Events, WebSockets, LLM token streaming)
- API Gateway or proxy services with heavy I/O wait

**When to stay with MVC:**
- CPU-intensive workloads (reactive doesn't help here)
- Team is not experienced with reactive programming (debugging is much harder)
- Most traditional CRUD applications (MVC is more than sufficient)

---

### Q4. What are the key components of Spring Cloud for microservices?

**Spring Cloud** provides tools to build distributed systems and microservice architectures:

| Component | Purpose | Implementation |
|---|---|---|
| **Service Discovery** | Register and find services dynamically | Eureka, Consul, Kubernetes |
| **API Gateway** | Single entry point, routing, rate limiting | Spring Cloud Gateway |
| **Config Server** | Centralized, versioned configuration | Spring Cloud Config (Git-backed) |
| **Circuit Breaker** | Prevent cascading failures | Resilience4j (replaced Hystrix) |
| **Load Balancing** | Client-side load distribution | Spring Cloud LoadBalancer |
| **Distributed Tracing** | Track requests across services | Micrometer Tracing + Zipkin/Jaeger |
| **Message Bus** | Broadcast config changes, events | Spring Cloud Bus (Kafka/RabbitMQ) |

**Circuit Breaker example (Resilience4j):**
```java
@CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
public PaymentResponse charge(PaymentRequest req) {
    return paymentClient.charge(req);  // might fail or timeout
}

public PaymentResponse paymentFallback(PaymentRequest req, Throwable t) {
    return PaymentResponse.deferred("Payment will be retried");
}
```

**Circuit breaker states:**
- **Closed:** Normal operation, requests pass through.
- **Open:** Too many failures detected; requests immediately fail-fast without calling the downstream service.
- **Half-Open:** After a cooldown period, a limited number of test requests are allowed through to check if the downstream service has recovered.

---

### Q5. Explain caching strategies in Spring Boot. How do you avoid stale data?

**Spring Cache Abstraction:**
```java
@EnableCaching  // on @SpringBootApplication

@Cacheable(value = "users", key = "#id")        // read from cache
public User findById(Long id) { ... }

@CachePut(value = "users", key = "#user.id")     // always update cache
public User update(User user) { ... }

@CacheEvict(value = "users", key = "#id")         // remove from cache
public void delete(Long id) { ... }

@CacheEvict(value = "users", allEntries = true)   // clear entire cache
public void refreshAll() { ... }
```

**Cache providers:**
- **ConcurrentMapCache** — Simple in-memory (dev only, no TTL, no distribution).
- **Redis** — Distributed, supports TTL, pub/sub for invalidation.
- **Caffeine** — High-performance in-memory with TTL, max size, statistics.

**Strategies to avoid stale data:**

| Strategy | How it works | Trade-off |
|---|---|---|
| **TTL (Time-To-Live)** | Cache expires after N seconds | Simple but data can be stale for up to TTL duration |
| **Write-through** | `@CachePut` updates cache on every write | Always fresh, but adds write latency |
| **Cache-aside (lazy loading)** | `@Cacheable` loads on read, `@CacheEvict` on write | Most common; brief staleness window between evict and next read |
| **Event-driven invalidation** | Kafka/Redis pub-sub notifies all instances to evict | Best for multi-instance deployments |

**Redis TTL configuration:**
```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 600000  # 10 minutes in milliseconds
```

---

### Q6. What is AOP (Aspect-Oriented Programming) in Spring? Give practical examples.

**AOP** allows you to separate cross-cutting concerns (logging, security, transactions, monitoring) from the core business logic.

**Key terminology:**
- **Aspect:** A class containing the cross-cutting logic (annotated with `@Aspect`).
- **Advice:** The action taken (what to do) — Before, After, Around, AfterReturning, AfterThrowing.
- **Join Point:** A point in execution (in Spring, always a method invocation).
- **Pointcut:** An expression that selects which join points the advice applies to.

**Practical Example 1 — Execution time logging:**
```java
@Aspect
@Component
public class PerformanceAspect {

    @Around("@annotation(LogExecutionTime)")
    public Object logTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long elapsed = System.currentTimeMillis() - start;
        log.info("{} executed in {}ms",
            joinPoint.getSignature().getName(), elapsed);
        return result;
    }
}

// Usage:
@LogExecutionTime
public List<Order> findExpensiveQuery() { ... }
```

**Practical Example 2 — Audit logging:**
```java
@Aspect
@Component
public class AuditAspect {

    @AfterReturning(pointcut = "execution(* com.example.service.*.*(..))",
                    returning = "result")
    public void auditServiceCalls(JoinPoint jp, Object result) {
        log.info("Method: {}, Args: {}, Result: {}",
            jp.getSignature().getName(),
            Arrays.toString(jp.getArgs()),
            result);
    }
}
```

**How Spring implements AOP:**
- Spring uses **proxy-based AOP** (not bytecode weaving like AspectJ).
- For classes implementing an interface → JDK Dynamic Proxy.
- For classes without an interface → CGLIB proxy (subclass-based).
- This is why `@Transactional`, `@Cacheable`, `@Async` don't work on self-invocation — internal calls bypass the proxy.

---

*End of Answer Guide*
