# Senior Backend Interview — Banking & Fintech Systems

> These topics are heavily emphasized in banking interviews. Master them thoroughly, as they address regulatory compliance, financial integrity, and system resilience.

---

## 🔴 Critical Path: Data Integrity & Security

### Q1. How do you guarantee Transaction Consistency and ACID properties in a distributed banking system?

**The Challenge:** In microservice architectures, a transfer from Account A (Service 1) to Account B (Service 2) cannot be wrapped in a simple local database transaction. 

**The Solution:**
1. **Saga Pattern (Choreography or Orchestration):**
   - Use an orchestrator to manage the sequence of local transactions.
   - If subtracting from Account A succeeds but adding to Account B fails, the orchestrator triggers a **compensating transaction** to refund Account A.
2. **Two-Phase Commit (2PC):**
   - Strictly guarantees consistency across different databases.
   - *However*, 2PC is usually avoided in modern microservices due to severe performance bottlenecks and the risk of deadlocks if the coordinator fails.
3. **Outbox Pattern:**
   - To ensure a database update and a published event (e.g., to Kafka) occur atomically, save the event into an `outbox` table within the *same* database transaction as the balance update.
   - A separate worker reads the `outbox` table and publishes the messages to the broker, ensuring at-least-once delivery.

---

### Q2. How do you prevent double-spending and ensure Idempotency in payment APIs?

**The Challenge:** Network timeouts might cause a client to click "Pay" twice, sending two identical requests. If processed twice, the user gets double-charged.

**The Solution:**
1. **Idempotency Key:**
   - The frontend generates a unique `Idempotency-Key` (UUID) per transaction attempt and sends it in the HTTP header.
2. **Database Constraint:**
   - The backend stores this key in an `idempotency_records` table with a `UNIQUE` constraint. If the same key is inserted again, the DB rejects it.
3. **Caching Layer (Fast Reject):**
   - Before hitting the DB, check a fast store (like Redis). 
   - If the key exists and the transaction is currently `PROCESSING`, return `409 Conflict` (or wait).
   - If the transaction is `COMPLETED`, immediately return the cached successful response without executing business logic.

---

### Q3. How do you handle Distributed Locking and Concurrency for concurrent balance updates?

**The Challenge:** If two requests try to withdraw $50 from a $100 account at the exact same millisecond, race conditions might result in a final balance of $50 instead of $0 (or a negative balance).

**The Solution:**
1. **Optimistic Locking (for low contention):**
   - Use a `@Version` field in JPA.
   - `UPDATE account SET balance = 50, version = 2 WHERE id = 1 AND version = 1;`
   - If another transaction updated the version first, this query affects 0 rows, throwing an `OptimisticLockException`. The transaction can then be retried.
2. **Pessimistic Locking (for high contention):**
   - Use `SELECT ... FOR UPDATE;` to lock the specific row in the database until the transaction commits. 
   - *Trade-off:* Reduces throughput but guarantees absolute safety.
3. **Redis Distributed Locks (Redisson):**
   - If updating a user's wallet spans multiple databases or requires external API calls, use Redis to acquire a mutex on `wallet_lock:{user_id}` before processing.

---

### Q4. What are the key strategies for Security (OAuth2, JWT, and Data Encryption) in Fintech?

**The Challenge:** Financial data is the most targeted by malicious actors.

**The Solution:**
1. **Authentication (OAuth2 & JWT):**
   - Implement OpenID Connect (OIDC) through providers like Keycloak.
   - Keep JWT lifespans short (e.g., 5-15 mins) and enforce strict refresh token rotation.
   - Sign JWTs using asymmetric encryption (RS256) so microservices can verify tokens using a public key without calling the auth server.
2. **Data-at-Rest Encryption:**
   - Encrypt PII (Personally Identifiable Information), PAN (Primary Account Numbers), and passwords using robust algorithms (e.g., AES-256-GCM for data, bcrypt/Argon2 for passwords).
   - Use Vault (HashiCorp) or AWS KMS to rotate encryption keys.
3. **Data-in-Transit Encryption:**
   - Enforce mTLS (Mutual TLS) between microservices to prevent man-in-the-middle attacks within the internal network.

---

## 🟠 High Priority: Compliance, Data Safety & Anti-Fraud

### Q5. Why do banks care about Audit Trails, and what is Event Sourcing?

**The Challenge:** The National Bank of Cambodia (NBC) and other regulators require banks to prove *why* a balance is what it is, tracking every change.

**The Solution:**
Instead of storing the *current state* of an account, **Event Sourcing** stores a sequence of *state-changing events*. 
- **Example:** Instead of `balance = 100`, the DB stores `[Opened: 0] -> [Deposit: 150] -> [Withdraw: 50]`.
- **Benefit:** 100% accurate audit trail. The current balance is derived by replaying the events. Everything is immutable; if a mistake occurs, a new compensating event is appended.

### Q6. Which Database Isolation Level is required for financial transactions?

**The Challenge:** Concurrent transactions can lead to phenomena like Dirty Reads, Non-Repeatable Reads, or Phantom Reads.

**The Solution:**
- **Read Committed (Default for PG/SQL Server):** Safe for most general queries but vulnerable to non-repeatable reads.
- **Repeatable Read (Default for MySQL InnoDB):** Prevents non-repeatable reads. Good for financial reports.
- **Serializable (Highest Level):** The database acts as if transactions are executed strictly sequentially. This prevents *all* concurrency anomalies but severely limits throughput. 
*Recommendation for Banking:* Use **Repeatable Read/Read Committed** combined with **Pessimistic Locking** (`SELECT FOR UPDATE`) on the specific rows being modified to balance performance and strict correctness.

### Q7. How do you implement Rate Limiting and Fraud Detection?

**The Challenge:** Attackers might try brute-forcing OTPs, card pins, or executing a high volume of tiny transactions (card testing).

**The Solution:**
1. **Rate Limiting:**
   - Use Redis combined with the **Token Bucket** algorithm (e.g., via Spring Cloud Gateway + Redis Rate Limiter).
   - Block requests at the API Gateway level (e.g., max 5 failed login attempts per user per minute).
2. **Fraud Detection Engine:**
   - Stream transactions asynchronously to a rules engine (e.g., Drools or a Machine Learning model) via Kafka.
   - Detect anomalies: e.g., A transaction from Phnom Penh followed by a transaction in London 10 minutes later triggers a block.

---

## 🟡 Important Architecture Patterns for Scale

### Q8. How do you optimize high-traffic banking dashboards using CQRS?

**The Challenge:** When an app opens, it fetches transaction history, balances, and analytics. Running heavy reads against the primary transactional database (Write DB) slows down critical payments.

**The Solution: CQRS (Command Query Responsibility Segregation)**
- Separate the Write Model (Command) and the Read Model (Query).
- **Writes:** Processed by a microservice handling business logic and strict validation, writing to a normalized PostgreSQL DB.
- **Reads:** Processed asynchronously. Changes in the primary DB trigger events (via Debezium/Kafka) that update a denormalized Read DB (like ElasticSearch or a read-replica PG). The mobile app queries this Read DB, which is optimized for fast, complex reads.

### Q9. Explain Graceful Degradation and Circuit Breakers in banking systems.

**The Challenge:** Bank systems rely on third parties (e.g., Visa network, SMS providers, NBC Bakong core). If the SMS provider goes down, the entire app shouldn't crash.

**The Solution:**
- **Circuit Breaker (Resilience4j):** Wraps external calls. If failures cross a threshold (e.g., 50% failures in 10s), the circuit "opens" and blocks further calls instantly, preventing resource exhaustion (cascading failure).
- **Fallback Methods:** When the circuit is open, execute graceful degradation. E.g., if the live real-time currency exchange API is down, fallback to returning the exchange rates cached from 1 hour ago.

### Q10. What metrics matter most in Observability & Monitoring?

**The Challenge:** SLAs (Service Level Agreements) require high uptime, and errors in banking must be proactively caught before users notice.

**The Solution:**
1. **Distributed Tracing (OpenTelemetry / Zipkin):** Append a unique `Trace-ID` to track requests as they hop across API Gateway, Auth Service, and Payment Service.
2. **RED Metrics** (For Services):
   - **R**ate: Number of requests per second.
   - **E**rrors: Number of failed requests.
   - **D**uration: Response times (P95, P99).
3. **USE Metrics** (For infrastructure):
   - **U**tilization (CPU/Memory).
   - **S**aturation (Queue lengths).
   - **E**rrors (Disk or network faults).

---

## 🔵 Extended Banking Scenarios (from Backend & Spring Boot modules)

### Q11. Explain the difference between monolithic and microservices architecture. When would you choose each in a banking context?

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

### Q12. Describe your approach to API versioning in a banking system.

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

---

### Q13. How would you design a notification system for a banking application?

**Architecture:**
```text
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
4. **Rate limiting per user:** Prevent notification fatigue — max N notifications per hour per user. Aggregate similar events.
5. **Priority levels:**
   - **P0 (Critical):** Unauthorized transaction alerts, OTP codes → skip rate limits, fastest path
   - **P1 (Important):** Transfer confirmations, payment receipts → standard processing
   - **P2 (Informational):** Marketing promotions, account updates → batched, respect quiet hours

---

### Q14. Explain back-pressure. How do you handle it in a high-throughput banking system?

**Back-pressure** is a mechanism to slow down producers when consumers cannot keep up. Without it, the system either crashes (OOM) or drops transactions — both unacceptable in banking.

**Where back-pressure occurs in banking:**
- **Salary day surge:** All companies process payroll simultaneously → payment service overwhelmed
- **Month-end reconciliation:** Batch processing generates millions of events
- **Mobile app launch:** New feature rollout causes traffic spike

**Strategies:**
**1. Bounded queues + rejection policy:** Use thread pool executors with bounded queues and a `CallerRunsPolicy`.
**2. Rate limiting at the gateway:** Reject excess traffic with `429 Too Many Requests`.
**3. Kafka consumer throttling:** Pause and resume consumers when downstream is slow. Monitor consumer lag.
**4. Prioritized processing:** Not all transactions are equal.
```java
if (transaction.getType() == TransactionType.INTERBANK_TRANSFER) {
    highPriorityQueue.send(transaction);  // process immediately
} else {
    lowPriorityQueue.send(transaction);   // can wait
}
```
> **Banking insight:** The worst thing is *silent* data loss. In banking, you **never drop a financial transaction** — you queue it, slow it down, or reject it with a clear error. But you never silently lose it.

---

### Q15. How do you implement the Database-per-Service pattern in a banking system?

**Principle:** Each microservice has its own private database. Other services must go through the service's API.

```text
[ Account Service ] → [ Accounts DB (PostgreSQL) ]
[ Payment Service ] → [ Payments DB (PostgreSQL) ]
[ KYC Service ]     → [ KYC DB (PostgreSQL + Document Store) ]
[ Notification Service ] → [ Notifications DB (PostgreSQL) + Redis ]
[ Audit Service ]   → [ Audit DB (Cassandra - append-only) ]
```

**Banking-specific challenges and solutions:**
1. **Cross-service queries:** A BFF (Backend-for-Frontend) aggregates data, or CQRS maintains a denormalized read-only view.
2. **Data consistency across services (fund transfer):** Use the Saga Pattern and the Outbox Pattern.
3. **Regulatory reporting:** Stream data changes (CDC) to a Data Warehouse. **Never query production microservice databases for reports**.
4. **KYC data access:** The KYC service is the single source of truth for customer identity, ensuring **data privacy regulations** are enforced centrally.

---

### Q16. How would you design a multi-tenant banking platform?

**Multi-tenancy** allows a single platform to serve multiple banks or branches while keeping their data isolated.

**Data isolation strategies:**
1. **Separate databases per tenant (bank):**
   - Strongest isolation. Required by some regulators.
   - Expensive — many database instances to manage.
2. **Shared database, separate schemas:**
   - Good isolation. Moderate cost. Schema migrations must be applied to all schemas.
3. **Shared database, shared schema with row-level isolation:**
   ```sql
   SELECT * FROM accounts WHERE bank_id = 'bank_a' AND customer_id = ?;
   ```
   - Cheapest and most scalable, but absolute highest risk of cross-tenant data leaks.

**Enforcing tenant isolation in Spring Boot:**
Use Hibernate `@FilterDef` and `@Filter` to automatically apply a `bank_id` where clause to every query seamlessly.

Other considerations include rate limiting per bank, separate encryption keys per bank, billing per bank, and bank-specific regulatory compliance.

---

### Q17. Design a system for handling payment file processing (ISO 20022 / bulk payments).

**Problem:** Banks receive bulk payment files (SWIFT MT, ISO 20022 XML) containing thousands of individual payment instructions that must be processed reliably.

**Architecture:**
```text
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
                    └─→ [Compliance Service] (sanctions check)
```

**Key design decisions:**
- **Idempotent processing:** Each payment instruction has a unique reference (UETR for SWIFT). Use as deduplication key.
- **Transactional outbox:** Never publish payment events without persisting the payment record.
- **Status tracking:** RECEIVED → VALIDATED → SCREENING → PROCESSING → COMPLETED/FAILED
- **Reconciliation:** End-of-day batch job matches sent payments with received confirmations.

---

### Q18. How do you prevent double-spending or handle idempotent requests in a Spring Boot payment API?

An API is **idempotent** if making multiple identical requests has the same effect as making a single request. 

**Implementation Strategy:**
1. **Idempotency Key (Header):** The client generates a unique UUID (`Idempotency-Key`).
2. **Database Constraint:** Store the key in a table (`idempotency_records`) with a `UNIQUE` constraint.
3. **Redis Lock / Cache (Fast Reject):** Before hitting the DB, check if the key exists in Redis. If yes, immediately return the cached response.
4. **Processing:**
   - If key doesn't exist, acquire a distributed lock on the key.
   - Process the payment and save the result in the `idempotency_records` table and cache the response in Redis.
   - Release the lock.

**Spring Boot Code Example:**
```java
@PostMapping("/pay")
public ResponseEntity<?> processPayment(
    @RequestHeader("Idempotency-Key") String idempotencyKey,
    @RequestBody PaymentRequest request) {
    
    // 1. Check Redis for existing result
    Optional<PaymentResponse> cached = idempotencyService.getResponse(idempotencyKey);
    if (cached.isPresent()) return ResponseEntity.ok(cached.get());

    // 2. Process within distributed lock
    return lockService.executeWithLock(idempotencyKey, () -> {
        PaymentResponse response = paymentStrategy.process(request);
        idempotencyService.saveResponse(idempotencyKey, response);
        return ResponseEntity.ok(response);
    });
}
```
