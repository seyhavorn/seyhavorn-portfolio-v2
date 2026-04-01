# Senior Backend Interview — Backend Architecture & System Design

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

### Q6. Explain CQRS and Event Sourcing. When are they appropriate?

**CQRS (Command Query Responsibility Segregation):**
Separates the write model (commands) from the read model (queries) into different models or even different databases.

- **Write side:** Handles business logic, validation, and persistence. Optimized for consistency.
- **Read side:** Serves denormalized views optimized for query performance. Often uses a different data store (e.g., Elasticsearch, Redis, or a read-optimized projection).

**Event Sourcing:**
Instead of storing the *current state* of an entity, you store every *event* (state change) that happened to it, as an immutable append-only log.

```
OrderCreated → ItemAdded → ItemAdded → PaymentReceived → OrderShipped
```

To get the current state, you replay the events. Snapshots are used to avoid replaying from the beginning every time.

**When to use:**
- Systems requiring full audit trails (finance, healthcare, compliance)
- Complex domains where replaying history is valuable (undo, reprocessing)
- Systems with very different read/write patterns (high reads, low writes)

**When NOT to use:**
- Simple CRUD applications — massive over-engineering
- Teams without experience in event-driven architectures
- When eventual consistency between read and write models is not acceptable

---

### Q7. How would you design a notification system that handles millions of users?

**Architecture:**
```
Event Source → Message Broker (Kafka) → Notification Service → Channel Adapters
                                                              ├── Push (FCM/APNs)
                                                              ├── Email (SES/SendGrid)
                                                              ├── SMS (Twilio)
                                                              └── In-App (WebSocket)
```

**Key design decisions:**

1. **Async processing:** Never send notifications synchronously. Publish events to Kafka; consumers process and route to appropriate channels.

2. **User preferences:** Users subscribe to notification topics. Store preferences in a fast lookup (Redis). Check preferences before sending.

3. **Rate limiting per user:** Prevent notification fatigue — max N notifications per hour per user. Aggregate similar events.

4. **Template engine:** Notification content should be template-driven, not hardcoded. Support i18n.

5. **Delivery guarantees:** Use at-least-once delivery with idempotency. Track notification IDs to prevent duplicates.

6. **Retry and DLQ:** Transient failures (push service down) retry with exponential backoff. Permanent failures (invalid device token) go to Dead Letter Queue for cleanup.

7. **Priority levels:** Critical (security alerts) skip rate limits and use faster paths. Marketing notifications are low-priority and batched.

---

### Q8. How do you handle graceful degradation and fault tolerance in a distributed system?

**Key patterns:**

**Circuit Breaker (Resilience4j):**
When a downstream service fails repeatedly, "trip" the circuit to fail-fast instead of waiting for timeouts. After a cooldown, allow test requests to check recovery.

**Bulkhead Pattern:**
Isolate resources per downstream service. If Service A is slow, it shouldn't consume all threads and starve calls to Service B. Use separate thread pools or semaphores.

**Timeout + Retry with Backoff:**
```java
@Retry(name = "paymentService", maxAttempts = 3)
@TimeLimiter(name = "paymentService", timeoutDuration = "2s")
@CircuitBreaker(name = "paymentService", fallbackMethod = "fallback")
public CompletableFuture<PaymentResult> charge(PaymentRequest req) { ... }
```

**Fallback strategies:**
- Return cached data (stale but available)
- Return default/degraded response
- Queue the operation for later processing
- Show a user-friendly message instead of an error

**Design principles:**
- Design for failure — assume every external call can fail
- Distinguish transient (retry) vs permanent (fail) errors
- Health checks on all external dependencies
- Chaos engineering — inject failures in staging to validate resilience

---

### Q9. What is idempotency and why is it critical in backend systems? How do you implement it?

**Idempotency** means performing the same operation multiple times produces the same result as performing it once. This is essential because network failures, retries, and message broker redeliveries can cause duplicate requests.

**Why it matters:**
- A user clicks "Pay" twice → should only be charged once
- Kafka consumer crashes mid-processing and retries → should not create duplicate records
- API Gateway retries a timed-out request → should not trigger the action again

**Implementation strategies:**

**Strategy 1 — Idempotency Key (API level):**
```java
@PostMapping("/payments")
public ResponseEntity<Payment> createPayment(
    @RequestHeader("Idempotency-Key") String idempotencyKey,
    @RequestBody PaymentRequest request) {

    // Check if this key was already processed
    Optional<Payment> existing = paymentRepo.findByIdempotencyKey(idempotencyKey);
    if (existing.isPresent()) return ResponseEntity.ok(existing.get());

    // Process and store with the key
    Payment payment = paymentService.process(request);
    payment.setIdempotencyKey(idempotencyKey);
    paymentRepo.save(payment);
    return ResponseEntity.status(201).body(payment);
}
```

**Strategy 2 — Database unique constraint:**
```sql
CREATE UNIQUE INDEX idx_payments_idempotency ON payments(idempotency_key);
```
Duplicate inserts throw a constraint violation → catch and return the existing record.

**Strategy 3 — Deduplication table for event consumers:**
```java
// Kafka consumer
public void handleOrderEvent(OrderEvent event) {
    if (processedEventRepo.existsById(event.eventId())) return; // already processed
    orderService.process(event);
    processedEventRepo.save(new ProcessedEvent(event.eventId()));
}
```

**HTTP methods and idempotency:**
| Method | Idempotent? | Notes |
|--------|------------|-------|
| GET | Yes | Read-only, no side effects |
| PUT | Yes | Full replacement — same payload, same result |
| DELETE | Yes | Deleting an already-deleted resource is still "deleted" |
| POST | **No** | Creates new resources — needs explicit idempotency key |
| PATCH | Depends | Can be idempotent if designed carefully |

---

### Q10. Explain back-pressure. How do you handle it in a high-throughput system?

**Back-pressure** is a mechanism to slow down producers when consumers cannot keep up with the rate of incoming data. Without it, the system either crashes (OOM) or drops messages silently.

**Where back-pressure occurs:**
- A Kafka consumer processes 100 msg/s but the producer pushes 10,000 msg/s → consumer lag grows infinitely
- A REST API receives a traffic spike but the database can only handle 500 queries/s → connection pool exhausts
- A microservice calls a downstream service that becomes slow → thread pool fills up

**Strategies:**

**1. Bounded queues + rejection policy:**
```java
ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
executor.setCorePoolSize(10);
executor.setMaxPoolSize(50);
executor.setQueueCapacity(200);           // bounded queue
executor.setRejectedExecutionHandler(new CallerRunsPolicy()); // back-pressure to caller
```

**2. Rate limiting at the gateway:**
Reject excess traffic with `429 Too Many Requests` instead of letting it overwhelm downstream services.

**3. Kafka consumer throttling:**
- Control `max.poll.records` (batch size)
- Use `pause()` and `resume()` on consumer when downstream is slow
- Monitor consumer lag — scale consumers when lag increases

**4. Reactive streams (built-in back-pressure):**
```java
// Project Reactor — subscriber controls demand
Flux.range(1, 1_000_000)
    .onBackpressureBuffer(1000)    // buffer up to 1000
    .onBackpressureDrop(dropped -> log.warn("Dropped: {}", dropped))
    .subscribe(item -> process(item));
```

**5. Load shedding:** When under extreme load, intentionally reject low-priority requests to preserve capacity for critical operations.

> Senior insight: The worst thing is *silent* back-pressure failure — data loss without any alert. Always monitor queue depths, consumer lag, and rejection counts.

---

### Q11. What are the different data consistency patterns in distributed systems?

| Pattern | Consistency | Performance | Use Case |
|---------|------------|-------------|----------|
| **Strong Consistency** | Every read returns the latest write | Slowest | Financial transactions, inventory |
| **Eventual Consistency** | Reads may return stale data temporarily | Fastest | Social feeds, analytics, caches |
| **Causal Consistency** | Related operations are seen in order | Moderate | Chat messages, comment threads |
| **Read-your-writes** | A user always sees their own updates immediately | Moderate | User profile edits, shopping cart |

**Strong Consistency techniques:**
- Synchronous replication (all replicas acknowledge before responding)
- Two-phase commit (distributed DB transactions)
- Consensus protocols (Raft, Paxos)

**Eventual Consistency techniques:**
- Async replication, CDC (Change Data Capture)
- Event-driven architecture with idempotent consumers
- Conflict resolution: Last-Writer-Wins (LWW), CRDTs, or application-level merge logic

**Read-your-writes pattern:**
```java
// After user updates their profile:
// Option 1: Read from primary (not replica) for this user's session
// Option 2: Cache the write locally and merge with DB reads
// Option 3: Use a session-sticky load balancer to route to the same replica
```

> Senior insight: Most systems need **mixed consistency** — strong for payments, eventual for activity feeds. Use the weakest consistency level that meets each business requirement.

---

### Q12. What is a Service Mesh? When would you introduce one?

**A Service Mesh** is an infrastructure layer that manages service-to-service communication. It handles networking concerns (retries, timeouts, mTLS, load balancing, observability) **outside** of your application code via sidecar proxies.

**Architecture:**
```
            ┌────────────────┐
            │   Control Plane│  (Istiod / Linkerd control plane)
            │  - Config      │  - Pushes routing rules to sidecars
            │  - Certificates│  - Manages mTLS certificates
            │  - Policies    │  - Collects telemetry
            └───────┬────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
┌────▼────┐   ┌────▼────┐   ┌────▼────┐
│ Sidecar │   │ Sidecar │   │ Sidecar │
│ (Envoy) │   │ (Envoy) │   │ (Envoy) │
│ ┌─────┐ │   │ ┌─────┐ │   │ ┌─────┐ │
│ │Svc A│ │   │ │Svc B│ │   │ │Svc C│ │
│ └─────┘ │   │ └─────┘ │   │ └─────┘ │
└─────────┘   └─────────┘   └─────────┘
```

**What it provides (without changing app code):**
- **mTLS:** Automatic mutual TLS between all services — zero-trust networking
- **Traffic management:** Canary deployments, A/B testing, traffic splitting
- **Observability:** Automatic distributed tracing, metrics, access logs
- **Resilience:** Retries, timeouts, circuit breakers at the infrastructure level
- **Access control:** Fine-grained service-to-service authorization policies

**Popular implementations:** Istio (feature-rich, complex), Linkerd (lightweight, simpler), Consul Connect

**When to introduce one:**
- You have 20+ microservices and networking concerns are duplicated in every service
- You need mTLS across all services without modifying each one
- You want infrastructure-level observability and traffic control
- Your team has Kubernetes expertise

**When NOT to:**
- Less than 5-10 services — overkill and adds operational complexity
- Team lacks Kubernetes expertise
- Latency overhead of sidecar proxies is unacceptable (adds ~1-3ms per hop)

---

### Q13. How do you implement the Database-per-Service pattern in microservices?

**Principle:** Each microservice has its own private database that only it can access. Other services must go through the service's API. This ensures loose coupling, independent deployments, and technology freedom.

```
[ Order Service ] → [ Orders DB (PostgreSQL) ]
[ Product Service ] → [ Products DB (MongoDB) ]
[ Search Service ] → [ Search Index (Elasticsearch) ]
[ Session Service ] → [ Sessions (Redis) ]
```

**Challenges and solutions:**

**1. Cross-service queries (joins across databases):**
- **API Composition:** An API Gateway or BFF (Backend-for-Frontend) calls multiple services and aggregates the results in memory.
- **CQRS Read Model:** Maintain a denormalized read-only projection that combines data from multiple services via event consumption.

**2. Data consistency across services:**
- Use the **Saga Pattern** with compensating transactions (see Q2).
- **Outbox Pattern:** Write events to an `outbox` table in the same transaction as the business data. A separate process (Debezium CDC) publishes events to Kafka.

**3. Reporting and analytics:**
- Don't query production microservice databases for reports.
- Stream data changes (CDC) to a Data Warehouse (Snowflake, BigQuery) for analytics.
- Use domain events to build materialized views optimized for reporting.

**4. Data ownership disputes:**
- Use Domain-Driven Design (DDD) bounded contexts to define clear data ownership.
- If two services need the same data, one service is the "source of truth" and publishes events. The other consumes and keeps a local copy.

---

### Q14. When would you use synchronous (REST/gRPC) vs asynchronous (Kafka/RabbitMQ) communication between services?

| Aspect | Synchronous (REST/gRPC) | Asynchronous (Message Broker) |
|--------|------------------------|------------------------------|
| **Coupling** | Tight — caller waits for response | Loose — fire and forget |
| **Latency** | Low for simple calls | Higher (queue processing time) |
| **Availability** | Both services must be up | Tolerates temporary downtime |
| **Complexity** | Simple request-response | Needs broker, consumer logic, DLQ |
| **Use when** | Need immediate response | Can process later, need fault tolerance |

**Use synchronous when:**
- The caller needs an immediate answer (e.g., "Is this user authenticated?")
- Simple request-response patterns (GET user by ID)
- Low-latency requirements
- Use gRPC over REST for internal service-to-service calls (binary protocol, schema enforcement, streaming)

**Use asynchronous when:**
- The operation can be processed later (send email, generate report)
- You need to decouple services (order placed → inventory reserved → payment charged)
- Traffic is bursty and you need to smooth it out (message queue acts as a buffer)
- You need guaranteed delivery even if the downstream service is temporarily down

**Hybrid pattern (common in practice):**
```
User → [API Gateway] → [Order Service] (sync REST)
                             │
                             ▼ (async event to Kafka)
                      [Inventory Service]
                      [Notification Service]
                      [Analytics Service]
```
The user gets an immediate synchronous response ("Order placed"), while multiple downstream services process the event asynchronously.

---

### Q15. How do you implement distributed locking? What are the risks?

**Problem:** In a multi-instance deployment, two instances might process the same job simultaneously (e.g., scheduled task, payment processing, resource allocation).

**Solution 1 — Redis Distributed Lock (Redisson):**
```java
RLock lock = redissonClient.getLock("process-payment:" + orderId);
boolean acquired = lock.tryLock(5, 30, TimeUnit.SECONDS); // wait 5s, hold 30s
try {
    if (acquired) {
        paymentService.process(orderId);
    }
} finally {
    if (acquired) lock.unlock();
}
```

**Solution 2 — Database advisory lock (PostgreSQL):**
```sql
SELECT pg_try_advisory_lock(hashtext('process-payment-' || order_id));
-- do work
SELECT pg_advisory_unlock(hashtext('process-payment-' || order_id));
```

**Solution 3 — ZooKeeper / etcd:**
- Consensus-based, strongest guarantees
- Higher operational overhead

**Risks and mitigations:**

| Risk | Mitigation |
|------|-----------|
| **Lock holder crashes** | Always set a TTL/lease. Lock auto-expires after N seconds. |
| **Clock skew** | Use Redlock algorithm (lock across multiple independent Redis instances) |
| **Lock contention** | Design to minimize lock scope and duration. Lock per resource, not globally. |
| **Deadlocks** | Always acquire locks in consistent order. Use timeouts. |
| **Split-brain** | Use consensus-based systems (ZooKeeper/etcd) for critical locks |

> Senior insight: If you need distributed locks frequently, it may be a design smell. Consider redesigning with partitioning (each instance owns a subset of work) or idempotent operations instead.

---

### Q16. How would you design a multi-tenant SaaS backend?

**Multi-tenancy** allows a single application to serve multiple customers (tenants) while keeping their data isolated.

**Data isolation strategies:**

**1. Separate databases per tenant:**
```
Tenant A → database_tenant_a
Tenant B → database_tenant_b
```
- Strongest isolation. Easy compliance (GDPR data deletion = drop database).
- Expensive — many database instances to manage. Hard to apply schema changes across all.

**2. Shared database, separate schemas:**
```
Tenant A → schema_tenant_a.users
Tenant B → schema_tenant_b.users
```
- Good isolation. Moderate cost.
- Schema migrations must be applied to all schemas.

**3. Shared database, shared schema (row-level isolation):**
```sql
SELECT * FROM users WHERE tenant_id = 'tenant_a';
```
- Cheapest. Easiest to manage. Most scalable.
- Risk: forgetting `tenant_id` filter → data leak. Must enforce at the framework level.

**Enforcing tenant isolation in Spring Boot:**
```java
// Hibernate filter — auto-applies tenant_id to all queries
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
@Entity
public class Order {
    @Column(name = "tenant_id")
    private String tenantId;
}

// Activate in a request filter
Session session = entityManager.unwrap(Session.class);
session.enableFilter("tenantFilter").setParameter("tenantId", currentTenantId());
```

**Other considerations:**
- **Rate limiting per tenant** — prevent one tenant from consuming all resources
- **Custom domains** — tenant-a.myapp.com, tenant-b.myapp.com
- **Billing per tenant** — track resource usage (API calls, storage)
- **Tenant-specific config** — feature flags, branding, custom workflows

---

### Q17. How do you ensure backward compatibility when evolving APIs and data schemas?

**API backward compatibility rules:**

| Change Type | Backward Compatible? |
|---|---|
| Adding a new optional field to response | ✅ Yes |
| Adding a new optional query parameter | ✅ Yes |
| Adding a new endpoint | ✅ Yes |
| Removing a field from response | ❌ No |
| Renaming a field | ❌ No |
| Changing a field type (string → number) | ❌ No |
| Making an optional field required | ❌ No |

**Strategies for breaking changes:**

**1. Tolerant Reader pattern:** Design consumers to ignore unknown fields. Use `@JsonIgnoreProperties(ignoreUnknown = true)` in Jackson.

**2. Field deprecation over removal:**
```java
public class UserResponse {
    private String fullName;              // new field

    @Deprecated
    @JsonProperty("first_name")
    private String firstName;             // keep for 2 releases, then remove
}
```

**3. Expand-Contract for database changes:**
(See Spring Boot Q5 — never drop columns until old code is fully retired)

**4. Consumer-Driven Contract Testing (Pact):**
Consumers define the minimum response they need. Provider's CI verifies that all consumer contracts still pass before deploying.

**5. Feature flags for gradual rollout:**
```java
if (featureFlags.isEnabled("new-pricing-model", tenantId)) {
    return newPricingEngine.calculate(order);
} else {
    return legacyPricingEngine.calculate(order);
}
```

---

### Q18. Design a system for handling large file uploads (100MB–5GB).

**Problem:** Large file uploads over a standard REST endpoint will time out, consume too much memory, or fail due to network instability.

**Solution — Multipart/Chunked Upload to Object Storage:**

```
Client → [API Gateway] → [Upload Service] → [S3 / MinIO]
                               │
                               ▼ (async event)
                         [Processing Service]
                         (virus scan, resize, extract metadata)
```

**Step-by-step flow:**

**1. Initiate upload — get a pre-signed URL:**
```java
@PostMapping("/uploads/initiate")
public UploadSession initiateUpload(@RequestBody UploadRequest req) {
    String uploadId = s3Client.createMultipartUpload(bucket, key);
    return new UploadSession(uploadId, key, generatePresignedUrls(uploadId, req.parts()));
}
```

**2. Client uploads chunks directly to S3:**
- No data passes through your backend server → saves bandwidth and memory
- Each chunk is 5-10MB. If a chunk fails, only retry that chunk.

**3. Complete upload:**
```java
@PostMapping("/uploads/{uploadId}/complete")
public FileMetadata completeUpload(@PathVariable String uploadId, @RequestBody List<PartETag> parts) {
    s3Client.completeMultipartUpload(bucket, key, uploadId, parts);
    kafkaTemplate.send("file-uploaded", new FileUploadedEvent(key)); // trigger processing
    return new FileMetadata(key, size, contentType);
}
```

**Key design decisions:**
- **Pre-signed URLs:** Client uploads directly to S3 — your server never handles the raw bytes
- **Resumability:** Track which chunks were uploaded. Client can resume after a disconnect.
- **Virus scanning:** Use ClamAV or AWS Guard Duty on the uploaded file before making it available
- **Progress tracking:** Client reports chunk completion to your API. Store progress in Redis for real-time UI updates.
- **Size limits:** Enforce per-tenant limits. Reject oversized files at initiation time.
- **CDN:** Serve uploaded files via CloudFront/CDN for fast downloads.
