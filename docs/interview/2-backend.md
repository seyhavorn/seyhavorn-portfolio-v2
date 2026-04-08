# Backend Architecture & System Design — Simplified for Interviews

**Quick reference for backend design questions.** Each answer starts simple, adds depth.

---

## Questions at a Glance

| # | Topic | Key Point |
|---|-------|-----------|
| 1 | Monolith vs Microservices | **Choose based on team size & domain clarity, not hype** |
| 2 | Distributed Transactions | **Saga pattern + Outbox pattern** (not 2PC) |
| 3 | API Versioning | **URI versioning** (/v1, /v2) for banking |
| 4 | CAP Theorem | **Always choose CP for financial data** |
| 5 | Rate Limiting | **Sliding window + Redis** |
| 6 | CQRS & Event Sourcing | **Full audit trail, replay history** |
| 7 | Notification System | **Async Kafka → multiple channels** |
| 8 | Graceful Degradation | **Fail-safe, never silent failures** |
| 9 | Idempotency | **Triple layer: Redis + Lock + DB constraint** |
| 10 | Back-pressure | **Bounded queues + rate limiting** |

---

## Q1. Monolithic vs Microservices Architecture

**The simple answer:**
Monolith = One big app. Microservices = Small independent apps. Choose based on team and domain clarity, not hype.

### When Monolith Makes Sense
- Small team (< 10 engineers)
- Unclear domain boundaries
- Speed of iteration is critical
- Single product (e.g., just a mobile wallet)

### When Microservices Make Sense
- Large team organized by domain (Accounts, Payments, KYC teams)
- Clear business domain boundaries
- Different services have different scaling needs
- Regulatory isolation required (audit KYC independently)

### In Banking
> Banks choose microservices because:
> - **Payment processing peaks** during salary day; Account queries don't
> - **Regulatory isolation:** KYC/AML audited separately from loan origination
> - **Independent deployments:** Can deploy payment feature without touching KYC
> - **Different tech:**Customer-facing APIs might be REST; internal payment orchestration might be gRPC

**Interview tip:** The right answer isn't "microservices are better." It's "choose based on your constraints."

---

## Q2. How to Handle Distributed Transactions (Critical for Banking)

**The problem:**
Transfer $100: Account Service (debit) → Payment Service (credit) → Notification Service (alert). Traditional ACID transactions don't work across services.

### Three Approaches

**Option 1: Two-Phase Commit (2PC)**
- Coordinator says "prepare" to all services
- If all say "yes," coordinator says "commit"
- ❌ Blocks resources, single point of failure
- ❌ Rarely used in modern microservices

**Option 2: Saga Pattern (Preferred for Banking)**
- Sequence of local transactions + compensating transactions
- If step fails, reverse previous steps

Example:
```
1. Debit $100 from Account A → event "DEBIT_COMPLETED"
2. Credit $100 to Account B → event "CREDIT_COMPLETED"
3. Send notification

If step 2 fails:
   Reverse step 1: Credit $100 back to Account A
   Log failure
```

**Option 3: Outbox Pattern (Ensures consistency)**
```java
@Transactional
public void transferFunds(TransferRequest req) {
    // 1. Debit account in SAME transaction
    accountRepo.debit(req.fromAccount(), req.amount());
    
    // 2. Write event to outbox table in SAME transaction
    outboxRepo.save(new OutboxEvent("TRANSFER_INITIATED", req));
    // After commit, CDC (Change Data Capture) picks up outbox
    // and publishes to Kafka
}
```

**Interview tip:** Always mention the **Outbox Pattern** for banking. It's the gold standard because it ensures at-most-once delivery (no phantom events).

---

## Q3. API Versioning in Banking

**The simple answer:**
Never break backward compatibility without warning. Plan for 12+ months of parallel versions.

### Three Strategies

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URI** | /api/v1/accounts, /api/v2/accounts | Clear, auditable, caching works | URL has version |
| **Header** | Accept: application/vnd.bank.v2+json | Cleaner URLs | Hard to test in browser |
| **Query** | /api/accounts?version=2 | Easy | Messy, inconsistent |

### Banking Best Practices
- **Maintain 2 active versions max** (v1 and v2; deprecate v0)
- **12-month deprecation period minimum** (third-party integrators need time)
- **Use OpenAPI docs per version** (v1.yml, v2.yml)
- **Document ALL API changes** (regulators may audit)
- **Prefer additive changes** (add optional fields) over versioning

**Interview tip:** Versioning is a last resort. Design APIs to be extensible without breaking changes.

---

## Q4. CAP Theorem & Banking

**CAP Theorem:** In distributed systems, pick 2 of 3:
- **C**onsistency: Every read gets the latest data
- **A**vailability: Every request gets a response
- **P**artition tolerance: System survives network failures

*Network failures are inevitable, so P is non-negotiable. Real choice: CP vs AP.*

### Banking's Clear Position

**Account balances** → **Choose CP** (Consistency)
- A customer seeing a wrong balance is worse than seeing "Please wait"
- Use PostgreSQL single-node or strong consistency mode

**Transaction history** → **Choose AP** (Availability)
- A 2-second delay showing a completed transfer is fine
- Use Cassandra or replicated read replicas

**Audit logs** → **Choose CP** (Consistency)
- Every audit record must be exactly right
- Non-negotiable for compliance

**Session cache** → **Choose AP** (Availability)
- If Redis cache is slow, use local cache
- Eventually consistent is fine

**Interview tip:** Banks never sacrifice consistency for availability when money is involved. They sacrifice availability (show "please wait") instead.

---

## Q5. Rate Limiting for Banking APIs

**Why it matters:**
- Prevent brute-force login attacks
- Protect against DDoS
- **PCI DSS compliance** requires rate limiting
- Fraud detection: 100 transfer requests per second = suspicious

### Implementation

**Sliding Window Counter** (better than Token Bucket):
```java
String key = "rate:" + userId + ":" + currentMinute();
long count = redis.incr(key);
if (count == 1) redis.expire(key, 60);  // 1-minute window
if (count > LIMIT) throw new RateLimitExceededException();
```

### Banking-Specific Limits

| Endpoint | Limit | Why |
|----------|-------|-----|
| Login | 5 per 15 min | Prevent brute-force |
| Fund transfer | 100 per day | Fraud prevention |
| Password reset | 3 per hour | Account takeover prevention |
| Balance inquiry | 500 per hour | Prevent polling attacks |

**Handling limits:**
- Return `429 Too Many Requests`
- Include `Retry-After` header
- **Log all violations** (may indicate attacks)
- **Exponential lockout** for login (5 min → 15 min → 1 hour)

---

## Q6. CQRS & Event Sourcing (Why Banks Love Them)

**CQRS (Command Query Responsibility Segregation):**
Separate writes (commands) from reads (queries).

**Event Sourcing:**
Don't store *current state*; store every *event* (state change).

Example:
```
Events: AccountCreated → Deposit($500) → Withdrawal($200) → Transfer($100)
Current balance: $500 - $200 - $100 = $200

To get state at 3:47 PM yesterday: Replay events up to that time
To get all account states: Replay all events
```

### Why Banking Loves Event Sourcing

✅ **Full audit trail** — Every change is recorded forever (NBC requirement)  
✅ **Dispute resolution** — "What was the balance at 3:47 PM on March 15?"  
✅ **Regulatory reporting** — Reconstruct any account state at any time  
✅ **Fraud investigation** — Replay events to detect anomalies  
✅ **Interest calculation** — Replay balance history to compute daily interest  

### When NOT to Use

❌ Simple CRUD apps (over-engineering)  
❌ Eventual consistency unacceptable  
❌ Team inexperienced with event-driven architecture  

**Interview tip:** Event sourcing is natural for banking. Many core banking systems (Temenos, Finastra) use it internally.

---

##Q7. Notification System Design

**Simple architecture:**
```
Transaction Event → Kafka → Notification Service → SMS/Email/Push
```

### Banking Considerations

**1. Regulatory notifications mandatory**
- Some alerts required by law (transactions > $10,000, suspicious activity)
- Must send regardless of user preferences
- **Alert compliance team if delivery fails**

**2. Async always**
- Never send sync; always publish to Kafka
- Consumer retries with dead letter queue
- Track by idempotency key to prevent duplicates

**3. Rate limits per user**
- Max N notifications per hour (prevent fatigue)
- But regulatory notifications bypass limits

**4. Priority levels**
- **P0:** OTP codes, unauthorized alerts → fastest path, skip rate limits
- **P1:** Transfer confirmations, payment receipts → normal processing
- **P2:** Marketing, account updates → batched, respect quiet hours

**5. Delivery guarantees**
- At-least-once delivery (idempotency keys prevent duplicates)
- Failed mandatory notifications → alert compliance
- Log all notifications for audit

---

## Q8. Graceful Degradation & Fault Tolerance

**Principle:** Never fail silently. Always tell the customer what happened.

### Patterns

**Circuit Breaker** (Resilience4j):
- When service fails repeatedly, "trip" circuit
- Fail-fast instead of waiting for timeouts
- After cooldown, test if service recovered

**Bulkhead Pattern:**
- Isolate resources per downstream service
- If loan service is slow, payment service isn't starved

**Fallback Strategies for Banking:**
- Balance inquiry fails → Return cached balance ("As of 2 min ago")
- Transfer to external bank fails → Queue transfer ("Transfer pending")
- KYC verification fails → **Block new accounts** (never bypass compliance)
- Notification service fails → Queue it, never block the transfer

**Design principles:**
- ✅ **Financial operations:** Never silently fail; always inform customer
- ✅ **Financial data:** Never approximate; say "unavailable" if you can't be accurate
- ✅ **Compliance:** Fail-closed (reject if you're unsure)
- ✅ **Non-critical services:** Can fail-open (notifications, analytics)

---

## Q9. Idempotency (Most Critical Concept in Banking)

**Simple definition:**
Performing the same operation multiple times = performing it once.

### Why It Matters in Banking

Customer clicks "Transfer $500" twice → Should transfer exactly once.  
Mobile app retries after timeout → Should not duplicate transfer.  
Kafka consumer crashes → Retry shouldn't create duplicate.  
**One duplicate = regulatory incident + financial loss.**

### Triple-Layer Implementation

**Layer 1: Fast check (Redis)**
```java
String cached = redis.get("idempotency:" + key);
if (cached != null) return cached;  // Instant response
```

**Layer 2: Distributed lock**
```java
RLock lock = redis.getLock("transfer:" + key);
if (!lock.tryLock(timeout)) throw new ConcurrentTransferException();
```

**Layer 3: Database constraint**
```sql
CREATE UNIQUE INDEX idx_transfers_idempotency ON transfers(idempotency_key);
```

### HTTP & Idempotency

| Method | Idempotent? | Example |
|--------|-------------|---------|
| GET | ✅ Yes | Get balance |
| PUT | ✅ Yes | Update profile (full replace) |
| DELETE | ✅ Yes | Close account |
| POST | ❌ **No** | Create transfer — needs explicit idempotency key |

**Interview tip:** Idempotency is THE critical concept in banking. Always mention the triple-layer approach.

---

## Q10. Back-pressure in High-Throughput Systems

**Definition:**
Mechanism to slow down producers when consumers can't keep up.

### Where It Happens in Banking

- **Salary day:** 1 million payroll transactions simultaneously
- **Month-end:** Batch reconciliation generates millions of events
- **Mobile launch:** Traffic spike from new feature

### Strategies

**1. Bounded queues:**
```java
executor.setQueueCapacity(1000);  // Don't buffer infinitely
executor.setRejectedExecutionHandler(new CallerRunsPolicy());  // Block caller
```

**2. Rate limiting at gateway:**
Reject excess with `429 Too Many Requests` instead of queuing infinitely.

**3. Kafka consumer throttling:**
- Control batch size with `max.poll.records`
- `pause()` / `resume()` consumer when downstream is slow
- Monitor consumer lag; scale when it increases

**4. Prioritized processing:**
```java
if (transaction.type() == INTERBANK) {
    highPriorityQueue.send();  // Process immediately
} else if (transaction.type() == STATEMENT) {
    lowPriorityQueue.send();   // Can wait
}
```

**Principle:** Never silently drop financial transactions. Queue, slow, or reject — but never lose data.

---

## Quick Memory Aids

**Monolith vs Microservices:** Team size + domain clarity, not hype  
**Distributed Transactions:** Saga + Outbox pattern  
**CAP:** Banks always choose CP for financial data  
**Idempotency:** Redis + Lock + DB Constraint (triple layer)  
**Degradation:** Fail gracefully, never silently  
**Back-pressure:** Bounded queues + rate limiting

