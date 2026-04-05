# Senior Backend Interview — Backend Architecture & System Design (Banking/Fintech)

---

### Q1. Explain the difference between monolithic and microservices architecture. When would you choose each in a banking context?

**Monolithic Architecture** packages all application components (UI, business logic, data access) into a single deployable unit.

- Simple to develop, test, and deploy initially
- All modules share the same process and memory space
- Scaling means scaling the entire application, even if only one component is under load
- A bug in one module can bring down the whole system

**Microservices Architecture** decomposes the application into small, independently deployable services, each owning its own data and business domain.

- Each service can be scaled, deployed, and updated independently
- Technology heterogeneity: each service can use the best tool for the job
- Introduces complexity: distributed tracing, service discovery (Eureka, Consul), inter-service communication (REST, gRPC, messaging), and network latency

**When to choose Monolith (banking context):**
- Small fintech startup where speed of iteration matters
- Small team (< 10 engineers)
- Single-product bank (e.g., just mobile wallet) where domain boundaries aren't clear yet

**When to choose Microservices (banking context):**
- Core banking system with distinct domains: accounts, payments, loans, KYC, notifications
- Different services have different scaling requirements (e.g., payment processing peaks during salary days)
- Regulatory isolation: KYC/AML service can be audited independently from loan origination
- Teams are organized by banking domain (accounts team, payments team, compliance team)

> A senior answer acknowledges that microservices are not inherently better — they trade one set of problems for another. In banking, the key driver is **regulatory isolation** and **independent deployability** for critical financial services.

---

### Q2. How do you handle distributed transactions across multiple microservices? (Critical for banking)

In a distributed banking system, a fund transfer may involve the Account Service (debit), Payment Service (transfer), and Notification Service (confirmation). Traditional ACID transactions across services are impractical.

**Two-Phase Commit (2PC):**
- Coordinator asks all participants to prepare, then commits or aborts
- Rarely used in microservices — blocks resources, coordinator is a single point of failure
- **Exception:** Some core banking platforms (e.g., Temenos T24) still use 2PC internally

**Saga Pattern (preferred for banking microservices):**
A saga is a sequence of local transactions, each publishing events to trigger the next step. If a step fails, compensating transactions undo previous steps.

- **Choreography-based Saga:** Services react to events. Decoupled, but harder to track the overall flow.
- **Orchestration-based Saga:** A central orchestrator (e.g., using Temporal, Camunda, or a state machine) drives the saga steps. Easier to reason about and debug. **Preferred for banking** — you need a clear audit trail.

**Banking transfer saga example:**
```
1. Account Service: Debit $100 from Account A → publish "DEBIT_COMPLETED"
2. Payment Service: Credit $100 to Account B → publish "CREDIT_COMPLETED"
3. Notification Service: Send transfer confirmation → publish "NOTIFICATION_SENT"

If step 2 fails (insufficient funds on receiving bank):
   Compensate step 1: Credit $100 back to Account A → publish "DEBIT_REVERSED"
   Send failure notification to customer
```

**Outbox Pattern (ensuring event-data consistency):**
```java
@Transactional
public void transferFunds(TransferRequest req) {
    // 1. Update account balance in SAME transaction
    accountRepo.debit(req.fromAccount(), req.amount());
    
    // 2. Write event to outbox table in SAME transaction
    outboxRepo.save(new OutboxEvent("TRANSFER_INITIATED", req));
    // Debezium CDC publishes to Kafka after commit
}
```

**Tools:** Temporal, Camunda (popular in banks), Axon Framework, or custom Kafka-based sagas.

> **Banking interview insight:** Always mention the **Outbox Pattern** — it's the gold standard for ensuring transactional consistency between your database writes and your event publications. Banks cannot afford "phantom events" (events published but data not committed).

---

### Q3. Describe your approach to API versioning in a banking system.

**Common strategies:**

1. **URI Versioning** — `/api/v1/accounts`, `/api/v2/accounts`
   - Simple, explicit, cache-friendly
   - **Preferred in banking** — clear, auditable, easy for compliance documentation

2. **Header Versioning** — `Accept: application/vnd.bank.v2+json`
   - Cleaner URLs, but harder to test in browsers

3. **Query Parameter** — `/api/accounts?version=2`
   - Easy but often messy and inconsistent

**Best practices for banking APIs:**
- Never break backward compatibility without a **deprecation period (minimum 12 months for banking APIs)** — third-party integrators need time to adapt
- Use consumer-driven contract testing (Pact) to validate compatibility
- Document deprecations clearly with `Deprecation` and `Sunset` HTTP headers
- **Maintain at most 2 active major versions** at a time
- Use OpenAPI/Swagger with version-specific specs
- **Banking regulators may audit your API changelog** — maintain detailed records of all API changes

> The key senior insight: versioning is a last resort. Prefer additive, backward-compatible changes (new optional fields) over introducing new versions. In banking, API stability is paramount because downstream systems (mobile apps, ATMs, partner integrations) may not update frequently.

---

### Q4. What is the CAP theorem and how does it impact database decisions in banking?

**CAP Theorem** states that a distributed system can guarantee at most two of three properties simultaneously:

- **Consistency (C):** Every read receives the most recent write
- **Availability (A):** Every request receives a response (not necessarily the latest data)
- **Partition Tolerance (P):** The system continues operating despite network partitions

**Key insight:** Network partitions are inevitable in distributed systems, so P is non-negotiable. The real choice is between **CP** and **AP**.

| Database | CAP Position | Banking Use Case |
|----------|-------------|-----------------|
| PostgreSQL (single node) | CA | Core banking, account balances |
| Cassandra | AP | Transaction history, audit logs |
| MongoDB | CP (default) | Document storage, loan applications |
| Redis | AP | Session cache, rate limiting |
| etcd / ZooKeeper | CP | Distributed locking, config coordination |

**Banking impact:**
- For **account balances and transfers** → **CP is mandatory** (strong consistency, e.g., PostgreSQL with SERIALIZABLE isolation). You cannot show a customer a wrong balance.
- For **transaction history views** → **AP is acceptable** (eventual consistency, replicated read views). A 2-second delay in showing a completed transfer is fine.
- For **audit logs** → **CP** (every audit record must be durable and consistent)
- For **rate limiting / session cache** → **AP** (fast, eventual consistency is acceptable)

> **Banking interview insight:** Banks **always** choose CP for financial data. The correct answer is: "We never sacrifice consistency for availability when money is involved. We sacrifice availability — a customer seeing a 'please wait' message is infinitely better than seeing a wrong balance."

---

### Q5. How would you design a rate-limiting system for a banking API?

**Why rate limiting matters in banking:**
- Prevent brute-force attacks on authentication endpoints
- Protect against DDoS and abuse
- Comply with **PCI DSS** — rate limiting is a security requirement
- Prevent runaway API consumers from overwhelming the system
- **Fraud detection** — excessive transaction attempts may indicate card testing

**Algorithms:**

- **Token Bucket:** A bucket holds N tokens. Each request consumes one token. Tokens refill at a fixed rate. Allows bursts up to bucket size.
- **Sliding Window Counter:** More accurate, no boundary spikes.

**Implementation with Redis:**
```java
// Sliding window counter using Redis INCR + EXPIRE
String key = "rate:" + userId + ":" + currentMinute();
long count = redisTemplate.opsForValue().increment(key);
if (count == 1) redisTemplate.expire(key, 1, TimeUnit.MINUTES);
if (count > LIMIT) throw new RateLimitExceededException();
```

**Banking-specific rate limits:**
| Endpoint | Limit | Rationale |
|----------|-------|-----------|
| Login attempts | 5 per 15 min per user | Prevent brute-force |
| Password reset | 3 per hour | Prevent account takeover |
| Fund transfer | 100 per day per account | Fraud prevention |
| Balance inquiry | 500 per hour | Prevent excessive polling |
| KHQR generation | 50 per hour | Resource protection |
| API key (partner) | 10,000 per hour | SLA management |

**Design considerations:**
- Return `429 Too Many Requests` with `Retry-After` header
- Use a distributed counter (Redis) for multi-instance deployments
- **Log all rate limit violations** — they may indicate attacks (alert security team)
- Different limits for authenticated vs anonymous users
- **Exponential lockout** for login failures (5 min → 15 min → 1 hour)

---

### Q6. Explain CQRS and Event Sourcing. How are they used in banking?

**CQRS (Command Query Responsibility Segregation):**
Separates the write model (commands) from the read model (queries) into different models or even different databases.

- **Write side:** Handles business logic, validation, and persistence. Optimized for consistency.
- **Read side:** Serves denormalized views optimized for query performance.

**Event Sourcing:**
Instead of storing the *current state* of an entity, you store every *event* (state change) that happened to it, as an immutable append-only log.

```
AccountCreated → DepositReceived($500) → WithdrawalMade($200) → TransferSent($100)
Current balance: $500 - $200 - $100 = $200
```

To get the current state, you replay the events. Snapshots are used to avoid replaying from the beginning every time.

**Why banking LOVES event sourcing:**
- **Full audit trail** — every state change is recorded forever (NBC compliance)
- **Regulatory reporting** — reconstruct any account state at any point in time
- **Dispute resolution** — "What was the balance at 3:47 PM on March 15?" → replay events up to that timestamp
- **Fraud investigation** — replay sequence of events to detect anomalies
- **Interest calculation** — replay balance history to compute daily interest accurately

**When NOT to use:**
- Simple CRUD applications — massive over-engineering
- Teams without experience in event-driven architectures
- When eventual consistency between read and write models is not acceptable for the specific use case

> **Banking interview insight:** Event sourcing is a natural fit for banking because **regulators require full audit trails**. Many core banking systems (Temenos, Finastra) are built on event sourcing internally. Mention this to show domain awareness.

---

### Q7. How would you design a notification system for a banking application?

**Architecture:**
```
Transaction Event → Message Broker (Kafka) → Notification Service → Channel Adapters
                                                                   ├── Push (FCM/APNs)
                                                                   ├── Email (SES/SendGrid)
                                                                   ├── SMS (Twilio/local telco)
                                                                   └── In-App (WebSocket)
```

**Banking-specific design decisions:**

1. **Async processing:** Never send notifications synchronously. Publish events to Kafka; consumers process and route to appropriate channels.

2. **Regulatory notifications:** Some notifications are **mandatory by regulation** (e.g., transaction alerts for amounts > $100, suspicious activity alerts). These must have **guaranteed delivery** and **audit logging**.

3. **User preferences:** Users subscribe to notification topics. Store preferences in Redis. **But regulatory notifications bypass user preferences** — you must send them regardless.

4. **Rate limiting per user:** Prevent notification fatigue — max N notifications per hour per user. Aggregate similar events (e.g., batch multiple small transactions into one summary).

5. **Template engine with i18n:** Support **Khmer and English** notification templates for Cambodian banks.

6. **Delivery guarantees:** Use at-least-once delivery with idempotency. Track notification IDs to prevent duplicates.

7. **Priority levels:**
   - **P0 (Critical):** Unauthorized transaction alerts, OTP codes → skip rate limits, fastest path
   - **P1 (Important):** Transfer confirmations, payment receipts → standard processing
   - **P2 (Informational):** Marketing promotions, account updates → batched, respect quiet hours

8. **Retry and DLQ:** Transient failures retry with exponential backoff. Permanent failures go to Dead Letter Queue. **Alert compliance team if mandatory regulatory notifications fail to deliver.**

---

### Q8. How do you handle graceful degradation and fault tolerance in a banking system?

**Key patterns:**

**Circuit Breaker (Resilience4j):**
When a downstream service fails repeatedly, "trip" the circuit to fail-fast instead of waiting for timeouts. After a cooldown, allow test requests to check recovery.

**Bulkhead Pattern:**
Isolate resources per downstream service. If the loan service is slow, it shouldn't consume all threads and starve the payment service.

**Timeout + Retry with Backoff:**
```java
@Retry(name = "paymentGateway", maxAttempts = 3)
@TimeLimiter(name = "paymentGateway", timeoutDuration = "2s")
@CircuitBreaker(name = "paymentGateway", fallbackMethod = "fallback")
public CompletableFuture<PaymentResult> processPayment(PaymentRequest req) { ... }
```

**Banking-specific fallback strategies:**
- **Balance inquiry fails** → Return last cached balance with "As of [timestamp]" indicator
- **Transfer to external bank fails** → Queue the transfer and notify customer "Transfer pending"
- **KYC verification service down** → Block new account creation (never bypass compliance)
- **Notification service down** → Queue notifications, never block the transaction itself
- **Payment gateway down** → Return "Service temporarily unavailable, please try again"

**Design principles for banking:**
- **Never silently fail on financial operations** — always inform the customer
- **Never approximate financial data** — if you can't get accurate data, say so
- **Compliance services must be fail-closed** — if KYC/AML check fails, block the transaction
- **Non-critical services can be fail-open** — notifications, analytics can degrade gracefully

---

### Q9. What is idempotency and why is it critical in banking? How do you implement it?

**Idempotency** means performing the same operation multiple times produces the same result as performing it once. This is **the most critical concept in banking backend engineering**.

**Why it matters in banking:**
- A customer clicks "Transfer $500" twice → should only transfer once
- Mobile app retries after network timeout → should not create duplicate transfer
- Kafka consumer crashes mid-processing and retries → should not credit account twice
- **A single duplicate transaction means financial loss and regulatory scrutiny**

**Implementation strategies:**

**Strategy 1 — Idempotency Key (API level):**
```java
@PostMapping("/transfers")
public ResponseEntity<TransferResult> initiateTransfer(
    @RequestHeader("Idempotency-Key") String idempotencyKey,
    @RequestBody TransferRequest request) {

    // Check if this key was already processed
    Optional<TransferResult> existing = transferRepo.findByIdempotencyKey(idempotencyKey);
    if (existing.isPresent()) return ResponseEntity.ok(existing.get());

    // Process and store with the key
    TransferResult result = transferService.execute(request);
    result.setIdempotencyKey(idempotencyKey);
    transferRepo.save(result);
    return ResponseEntity.status(201).body(result);
}
```

**Strategy 2 — Database unique constraint:**
```sql
CREATE UNIQUE INDEX idx_transfers_idempotency ON transfers(idempotency_key);
```

**Strategy 3 — Redis fast-reject + DB fallback:**
```java
public TransferResult processTransfer(String idempotencyKey, TransferRequest req) {
    // 1. Fast check in Redis
    String cached = redis.get("idempotency:" + idempotencyKey);
    if (cached != null) return deserialize(cached);

    // 2. Acquire distributed lock
    RLock lock = redisson.getLock("transfer-lock:" + idempotencyKey);
    try {
        if (lock.tryLock(5, 30, TimeUnit.SECONDS)) {
            // 3. Double-check in database
            Optional<TransferResult> existing = transferRepo.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) return existing.get();

            // 4. Process transfer
            TransferResult result = executeTransfer(req);
            
            // 5. Cache in Redis + save in DB
            redis.setex("idempotency:" + idempotencyKey, 86400, serialize(result));
            return result;
        }
    } finally {
        if (lock.isHeldByCurrentThread()) lock.unlock();
    }
}
```

**HTTP methods and idempotency:**
| Method | Idempotent? | Banking Example |
|--------|------------|-----------------|
| GET | Yes | Get account balance |
| PUT | Yes | Update customer profile (full replacement) |
| DELETE | Yes | Deactivate account |
| POST | **No** | Create transfer — **needs explicit idempotency key** |
| PATCH | Depends | Update notification preferences |

> **Banking interview must-answer:** When asked about idempotency, always mention the **triple-layer approach**: Redis fast-reject → distributed lock → database constraint. This shows you understand that idempotency at scale requires multiple defense layers.

---

### Q10. Explain back-pressure. How do you handle it in a high-throughput banking system?

**Back-pressure** is a mechanism to slow down producers when consumers cannot keep up. Without it, the system either crashes (OOM) or drops transactions — both unacceptable in banking.

**Where back-pressure occurs in banking:**
- **Salary day surge:** All companies process payroll simultaneously → payment service overwhelmed
- **Month-end reconciliation:** Batch processing generates millions of events
- **Mobile app launch:** New feature rollout causes traffic spike
- **Fraud detection service:** Checking every transaction becomes a bottleneck during peaks

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
- Monitor consumer lag — **scale consumers when lag increases**

**4. Prioritized processing:**
```java
// In banking, not all transactions are equal
if (transaction.getType() == TransactionType.INTERBANK_TRANSFER) {
    highPriorityQueue.send(transaction);  // process immediately
} else if (transaction.getType() == TransactionType.STATEMENT_GENERATION) {
    lowPriorityQueue.send(transaction);   // can wait
}
```

**5. Load shedding:** Under extreme load, reject low-priority requests (marketing notifications, report generation) to preserve capacity for critical operations (transfers, balance inquiries).

> **Banking insight:** The worst thing is *silent* data loss. In banking, you **never drop a financial transaction** — you queue it, slow it down, or reject it with a clear error. But you never silently lose it.

---

### Q11. What are the different data consistency patterns in distributed systems?

| Pattern | Consistency | Performance | Banking Use Case |
|---------|------------|-------------|-----------------|
| **Strong Consistency** | Every read returns the latest write | Slowest | Account balances, transfer processing |
| **Eventual Consistency** | Reads may return stale data temporarily | Fastest | Transaction history views, analytics |
| **Causal Consistency** | Related operations are seen in order | Moderate | Chat support threads, audit logs |
| **Read-your-writes** | A user always sees their own updates immediately | Moderate | After transfer: customer sees updated balance |

**Strong Consistency techniques:**
- Synchronous replication (all replicas acknowledge before responding)
- Two-phase commit (distributed DB transactions)
- Consensus protocols (Raft, Paxos)

**Read-your-writes pattern (critical for banking UX):**
```java
// After customer initiates a transfer:
// Option 1: Read from primary (not replica) for this customer's session
// Option 2: Cache the write locally and merge with DB reads
// Option 3: Use a session-sticky load balancer
```

> **Banking insight:** Most banking systems need **mixed consistency** — strong for balances and transfers, eventual for transaction history and dashboards. Use the **strongest consistency level where money is involved**, and the weakest acceptable level everywhere else for performance.

---

### Q12. What is a Service Mesh? When would you introduce one in banking?

**A Service Mesh** is an infrastructure layer that manages service-to-service communication via sidecar proxies.

**What it provides:**
- **mTLS:** Automatic mutual TLS between all services — zero-trust networking (PCI DSS requirement)
- **Traffic management:** Canary deployments, A/B testing, traffic splitting
- **Observability:** Automatic distributed tracing, metrics, access logs
- **Access control:** Fine-grained service-to-service authorization

**Popular implementations:** Istio (feature-rich), Linkerd (lightweight), Consul Connect

**When to introduce in banking:**
- You have 20+ microservices and need consistent mTLS across all of them
- **PCI DSS compliance** requires encrypted communication between all services
- You need fine-grained authorization (e.g., only Payment Service can call Account Service's debit endpoint)
- You want infrastructure-level observability without modifying each service

**When NOT to:**
- Less than 5-10 services — overkill
- Team lacks Kubernetes expertise
- Latency overhead of sidecar proxies is unacceptable for real-time trading systems

---

### Q13. How do you implement the Database-per-Service pattern in a banking system?

**Principle:** Each microservice has its own private database. Other services must go through the service's API.

```
[ Account Service ] → [ Accounts DB (PostgreSQL) ]
[ Payment Service ] → [ Payments DB (PostgreSQL) ]
[ KYC Service ]     → [ KYC DB (PostgreSQL + Document Store) ]
[ Notification Service ] → [ Notifications DB (PostgreSQL) + Redis ]
[ Audit Service ]   → [ Audit DB (Cassandra - append-only) ]
```

**Banking-specific challenges and solutions:**

**1. Cross-service queries (e.g., "Show customer's full financial profile"):**
- **API Composition:** A BFF (Backend-for-Frontend) calls Account, Payment, Loan services and aggregates
- **CQRS Read Model:** Maintain a denormalized read-only view that combines data via event consumption

**2. Data consistency across services (fund transfer):**
- Use the **Saga Pattern** with compensating transactions
- **Outbox Pattern:** Write events to an `outbox` table in the same transaction as the business data. Debezium CDC publishes events to Kafka.

**3. Regulatory reporting:**
- Stream data changes (CDC) to a Data Warehouse for regulatory reports
- **Never query production microservice databases for reports** — use dedicated reporting replicas

**4. KYC data access:**
- The KYC service is the single source of truth for customer identity
- Other services get customer data via API calls, never direct DB access
- This ensures **data privacy regulations** are enforced centrally

---

### Q14. When would you use synchronous (REST/gRPC) vs asynchronous (Kafka/RabbitMQ) communication in banking?

| Aspect | Synchronous (REST/gRPC) | Asynchronous (Message Broker) |
|--------|------------------------|------------------------------|
| **Coupling** | Tight — caller waits for response | Loose — fire and forget |
| **Latency** | Low for simple calls | Higher (queue processing time) |
| **Availability** | Both services must be up | Tolerates temporary downtime |
| **Use when** | Need immediate response | Can process later |

**Use synchronous when (banking examples):**
- Balance inquiry → customer expects immediate answer
- Authentication check → must respond before allowing access
- Account validation → "Does this account exist?" before initiating transfer
- Use **gRPC** for internal service-to-service calls (binary protocol, faster)

**Use asynchronous when (banking examples):**
- Transaction notification → can be sent seconds later
- Statement generation → background batch processing
- Fraud scoring → async enrichment after transaction is recorded
- Audit event publishing → must not block the transaction

**Hybrid pattern (most common in banking):**
```
Customer → [API Gateway] → [Payment Service] (sync REST response: "Transfer initiated")
                              │
                              ▼ (async events to Kafka)
                       [Account Service]      → Update balances
                       [Notification Service] → Send SMS/push
                       [Audit Service]        → Record event
                       [Fraud Engine]         → Analyze pattern
```

---

### Q15. How do you implement distributed locking? What are the risks? (Critical for banking)

**Problem:** In a multi-instance banking deployment, two instances might process the same transfer simultaneously — resulting in double-debit or double-credit.

**Solution 1 — Redis Distributed Lock (Redisson):**
```java
RLock lock = redissonClient.getLock("account-lock:" + accountId);
boolean acquired = lock.tryLock(5, 30, TimeUnit.SECONDS);
try {
    if (acquired) {
        // Read current balance
        BigDecimal balance = accountRepo.getBalance(accountId);
        // Validate sufficient funds
        if (balance.compareTo(amount) < 0) throw new InsufficientFundsException();
        // Debit
        accountRepo.debit(accountId, amount);
    }
} finally {
    if (acquired) lock.unlock();
}
```

**Solution 2 — PostgreSQL advisory lock:**
```sql
SELECT pg_try_advisory_lock(hashtext('account-' || account_id));
-- do work
SELECT pg_advisory_unlock(hashtext('account-' || account_id));
```

**Solution 3 — Optimistic locking with @Version (for low-contention):**
```java
@Entity
public class Account {
    @Version
    private Long version;  // JPA auto-increments on each update
    
    private BigDecimal balance;
}
// If two transactions read version=5 and both try to update,
// only one succeeds. The other gets OptimisticLockException → retry.
```

**Risks and mitigations:**
| Risk | Mitigation |
|------|-----------| 
| **Lock holder crashes** | Always set a TTL/lease. Lock auto-expires after N seconds. |
| **Clock skew** | Use Redlock algorithm (lock across multiple Redis instances) |
| **Lock contention** | Lock per account, not globally. Keep lock scope minimal. |
| **Deadlocks** | Always acquire locks in consistent order (sort account IDs). |

> **Banking interview insight:** If you need distributed locks frequently, consider redesigning. For account balance updates, **optimistic locking (@Version)** with retry is often simpler and sufficient for most banking operations. Reserve distributed locks (Redisson) for scenarios with high contention or external system coordination.

---

### Q16. How would you design a multi-tenant banking platform?

**Multi-tenancy** allows a single platform to serve multiple banks or branches while keeping their data isolated.

**Data isolation strategies (banking context):**

**1. Separate databases per tenant (bank):**
```
Bank A → database_bank_a
Bank B → database_bank_b
```
- **Strongest isolation.** Required by some regulators.
- Easy compliance — each bank's data is physically separate.
- Expensive — many database instances to manage.

**2. Shared database, separate schemas:**
```
Bank A → schema_bank_a.accounts
Bank B → schema_bank_b.accounts
```
- Good isolation. Moderate cost.
- Schema migrations must be applied to all schemas.

**3. Shared database, shared schema with row-level isolation:**
```sql
SELECT * FROM accounts WHERE bank_id = 'bank_a' AND customer_id = ?;
```
- Cheapest and most scalable.
- **Risk:** Forgetting `bank_id` filter → data leak between banks. Critical in banking.

**Enforcing tenant isolation in Spring Boot:**
```java
@FilterDef(name = "bankFilter", parameters = @ParamDef(name = "bankId", type = String.class))
@Filter(name = "bankFilter", condition = "bank_id = :bankId")
@Entity
public class Account {
    @Column(name = "bank_id")
    private String bankId;
}

// Activate in a request filter — EVERY query is automatically filtered
Session session = entityManager.unwrap(Session.class);
session.enableFilter("bankFilter").setParameter("bankId", currentBankId());
```

**Other banking-specific considerations:**
- **Rate limiting per bank** — prevent one bank from consuming all resources
- **Separate encryption keys per bank** — if one bank is compromised, others are safe
- **Billing per bank** — track API calls, storage, transactions per tenant
- **Compliance per bank** — different banks may have different regulatory requirements

---

### Q17. How do you ensure backward compatibility when evolving banking APIs?

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

**Banking-specific strategies:**

**1. Tolerant Reader pattern:**
```java
@JsonIgnoreProperties(ignoreUnknown = true)  // Ignore fields I don't know about
public class TransferResponse { ... }
```

**2. Field deprecation over removal:**
```java
public class AccountResponse {
    private String accountNumber;           // new field (IBAN format)

    @Deprecated
    @JsonProperty("account_no")
    private String accountNo;               // keep for 12+ months in banking
}
```

**3. Consumer-Driven Contract Testing (Pact):**
Mobile app team defines what they need from the API. Backend CI verifies all consumer contracts pass before deploying.

**4. Change Advisory Board (banking-specific):**
In banking, breaking API changes require formal approval from a Change Advisory Board (CAB). This is not just a technical decision — it involves compliance, operations, and business stakeholders.

---

### Q18. Design a system for handling payment file processing (ISO 20022 / bulk payments).

**Problem:** Banks receive bulk payment files (SWIFT MT, ISO 20022 XML) containing thousands of individual payment instructions that must be processed reliably.

**Architecture:**
```
SFTP Upload → [File Ingestion Service] → Object Storage (S3)
                    │
                    ▼ (async event)
            [File Parser Service]
                    │
                    ▼ (individual payment events to Kafka)
            [Payment Processing Service]
                    │
                    ├─→ [Account Service] (debit/credit)
                    ├─→ [Fraud Engine] (screening)
                    ├─→ [Compliance Service] (sanctions check)
                    └─→ [Notification Service] (confirmation)
                    │
                    ▼
            [Reconciliation Service] (end-of-day matching)
```

**Key design decisions:**
- **Idempotent processing:** Each payment instruction has a unique reference (UETR for SWIFT). Use as deduplication key.
- **Transactional outbox:** Never publish payment events without first persisting the payment record.
- **Status tracking:** Each payment goes through statuses: RECEIVED → VALIDATED → SCREENING → PROCESSING → COMPLETED/FAILED
- **Reconciliation:** End-of-day batch job matches sent payments with received confirmations
- **Audit trail:** Every status change is recorded with timestamp, user, and reason
- **Error handling:** Failed payments go to manual review queue — never silently dropped
