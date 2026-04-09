# Banking System Architecture — Interview Guide

**Master banking-specific system design.** Each answer: simple explanation → technical depth → code example → interview tip.

---

## Quick Reference — 18 Core Topics

| Priority | # | Topic | Key Point |
|----------|---|-------|-----------|
| 🔴 Critical | 1 | Transaction Consistency | **Saga + Outbox pattern** |
| 🔴 Critical | 2 | Prevent Double-Spending | **Idempotency key + Redis + DB constraint** |
| 🔴 Critical | 3 | Concurrency & Locking | **Distributed locks for race conditions** |
| 🔴 Critical | 4 | Security | **OAuth2, encryption, mTLS** |
| 🟠 High | 5 | Audit Trails & Event Sourcing | **Every change is immutable** |
| 🟠 High | 6 | Database Isolation Levels | **SERIALIZABLE for transfers** |
| 🟠 High | 7 | Rate Limiting & Fraud | **Redis sliding window** |
| 🟡 Important | 8 | CQRS for High Traffic | **Separate read/write models** |
| 🟡 Important | 9 | Graceful Degradation | **Circuit breakers + fallbacks** |
| 🟡 Important | 10 | Observability & Monitoring | **RED metrics + distributed tracing** |
| 🔵 Core | 11 | Monolith vs Microservices | **Team size + domain clarity** |
| 🔵 Core | 12 | API Versioning | **URI versioning, 12-month deprecation** |
| 🔵 Core | 13 | Notification System | **Async Kafka, regulatory alerts** |
| 🔵 Core | 14 | Back-pressure | **Bounded queues, rate limiting** |
| 🔵 Core | 15 | Database-per-Service | **Data isolation, saga consistency** |
| 🟢 Extended | 16 | Multi-tenant Platform | **Row-level isolation or separate schemas** |
| 🟢 Extended | 17 | Bulk Payment Processing | **ISO 20022, idempotent file processing** |
| 🟢 Extended | 18 | Spring Boot Payment API | **Idempotency key implementation** |

---

## 🔴 CRITICAL: Data Integrity & Consistency

### Q1. How Do You Guarantee Transaction Consistency?

**The simple answer:**
A transfer $100 from Account A to Account B must either complete fully or not at all. No partial transfers.

**The problem:**
In microservices, Account A (Service 1) and Account B (Service 2) have separate databases. Local transactions won't work.

### Three Approaches

**Option 1: Two-Phase Commit (2PC)**
```
Coordinator: "Prepare to commit?"
  Service 1: "Yes, I can debit Account A"
  Service 2: "Yes, I can credit Account B"
Coordinator: "Commit!"
  Both commit simultaneously
```

✅ Guarantees consistency  
❌ Blocks resources  
❌ Coordinator becomes single point of failure  
❌ **Rarely used in modern banking**

**Option 2: Saga Pattern (PREFERRED for Banking)**

Sequence of local transactions + compensating transactions if failure occurs.

```
1. Debit Account A → Event: "DEBIT_COMPLETED"
2. Credit Account B → Event: "CREDIT_COMPLETED"
3. Send notification → Event: "NOTIFICATION_SENT"

If Step 2 fails (insufficient funds in B's bank):
   Trigger compensation: Credit Account A (reverse Step 1)
   Send failure notification
```

`Two styles:`
- **Choreography:** Services react to events (loose coupling, hard to track)
- **Orchestration:** Central orchestrator drives steps (clearer, easier to debug, **preferred**)

**Option 3: Outbox Pattern (Ensures DB + Event Sync)**

```java
@Transactional
public void transferFunds(TransferRequest req) {
    // 1. Update database
    accountRepo.debit(req.from(), req.amount());
    
    // 2. Write event to OUTBOX table (same transaction)
    outboxRepo.save(new OutboxEvent("TRANSFER_INITIATED", req));
    
    // After commit, CDC picks up outbox & publishes to Kafka
    // Guarantees: If DB updates, event will be published
}
```

**Why it matters:** Ensures database writes and events are atomic. No "phantom events" (published but not saved).

**Interview tip:** Always mention **Outbox Pattern** for banking. It's the gold standard because it prevents:
- Events published without DB updates
- DB updates without events
- Message delivery issues between DB and event broker

**Spring Boot Implementation (Detailed):**
```java
@Service
public class TransferService {
    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;
    
    @Transactional(isolation = Isolation.READ_COMMITTED, 
                   rollbackFor = Exception.class, 
                   timeout = 30)
    public void transferFunds(String fromAccountId, String toAccountId, 
                             BigDecimal amount) throws InsufficientFundsException {
        
        // DEADLOCK PREVENTION: Lock accounts in consistent order
        // Always lock by account ID in ascending order
        Account accountA = accountRepository.findByIdWithLock(
            Math.min(Long.parseLong(fromAccountId), 
                     Long.parseLong(toAccountId)));
        Account accountB = accountRepository.findByIdWithLock(
            Math.max(Long.parseLong(fromAccountId), 
                     Long.parseLong(toAccountId)));
        
        // Validate sufficient balance
        if (fromAccountId.equals(accountA.getId())) {
            if (accountA.getBalance().compareTo(amount) < 0) {
                throw new InsufficientFundsException("Not enough balance");
            }
            accountA.setBalance(accountA.getBalance().subtract(amount));
            accountB.setBalance(accountB.getBalance().add(amount));
        } else {
            // Swap logic if necessary
            if (accountB.getBalance().compareTo(amount) < 0) {
                throw new InsufficientFundsException("Not enough balance");
            }
            accountB.setBalance(accountB.getBalance().subtract(amount));
            accountA.setBalance(accountA.getBalance().add(amount));
        }
        
        // Publish domain event for audit logging
        applicationEventPublisher.publishEvent(
            new TransferCompletedEvent(fromAccountId, toAccountId, amount));
        
        // Save both accounts atomically
        accountRepository.save(accountA);
        accountRepository.save(accountB);
    }
}
```

---

### Q2. How Do You Prevent Double-Spending (Idempotency)?

**The simple answer:**
Customer clicks "Pay $100" twice (or mobile app auto-retries after timeout). Should only charge $100, not $200.

**The problem:**
Network timeouts cause retries. Without idempotency, duplicate payments happen.

### Triple-Layer Implementation

**Layer 1: Idempotency Key (Frontend)**
```
Client generates UUID: "550e8400-e29b-41d4-a716-446655440000"
Sends with payment request:

POST /api/transfer
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

**Layer 2: Fast Check (Redis)**
```java
// Before processing, check Redis
Optional<PaymentResponse> cached = 
    redis.get("idempotency:" + key);
if (cached.isPresent()) {
    return cached.get();  // Return immediately
}
```

**Layer 3: Database Constraint**
```sql
-- Prevents duplicates even if Redis misses
CREATE UNIQUE INDEX idx_idempotency 
  ON transfers(idempotency_key);
```

**Full implementation:**
```java
public PaymentResponse processPayment(String idempotencyKey, PaymentRequest req) {
    // 1. Check Redis (microseconds)
    Optional<PaymentResponse> cached = redis.get("idempotency:" + idempotencyKey);
    if (cached.isPresent()) return cached.get();
    
    // 2. Acquire distributed lock
    RLock lock = redisson.getLock("payment:" + idempotencyKey);
    if (!lock.tryLock(5, 30, TimeUnit.SECONDS)) {
        throw new ConcurrentPaymentException();
    }
    
    try {
        // 3. Double-check in DB
        Optional<PaymentResult> existing = 
            transferRepo.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) return existing.get();
        
        // 4. Process payment
        PaymentResponse response = executeTransfer(req);
        
        // 5. Cache result
        redis.setex("idempotency:" + idempotencyKey, 86400, response);
        return response;
    } finally {
        lock.unlock();
    }
}
```

**Key points:**
- ✅ Redis catches 99% of duplicates (fast)
- ✅ Lock prevents concurrent processing
- ✅ DB constraint catches edge cases

**Interview tip:** This is **critical for banking**. Mention the triple-layer approach to show depth.

**Detailed Idempotency Store Implementation:**
```java
@Repository
public class IdempotencyStore {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private TransferRepository transferRepo;
    
    public Optional<PaymentResponse> get(String idempotencyKey) {
        String cached = redisTemplate.opsForValue().get("idempotency:" + idempotencyKey);
        if (cached != null) {
            return Optional.of(deserialize(cached));
        }
        return Optional.empty();
    }
    
    public void store(String idempotencyKey, PaymentResponse response, long ttlSeconds) {
        String serialized = serialize(response);
        redisTemplate.opsForValue().set("idempotency:" + idempotencyKey, serialized, ttlSeconds, TimeUnit.SECONDS);
    }
    
    public boolean isProcessed(String idempotencyKey) {
        return transferRepo.existsByIdempotencyKey(idempotencyKey);
    }
}
```

---

### Q3. How Do You Handle Concurrency & Distributed Locking?

**The problem:**
Two simultaneous withdraw requests: Account has $100, both try to withdraw $60. Result should be $-20 error, not two successful $60 withdrawals.

**Four strategies (in order of preference):**

**Option 1: Optimistic Locking (Low contention)**
```java
@Entity
public class Account {
    @Version
    private Long version;
    private BigDecimal balance;
}

@Transactional
public void withdraw(Long accountId, BigDecimal amount) {
    Account acc = repo.findById(accountId).get();
    acc.setBalance(acc.getBalance().subtract(amount));
    repo.save(acc);  // Saves with version increment
    // If another thread updated first, throws OptimisticLockException
}
```

**Option 2: Pessimistic Locking (High contention)**
```sql
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- Database locks row until transaction completes
```

**Option 3: Redis Distributed Lock (Cross-DB)**
```java
RLock lock = redisson.getLock("account:" + accountId);
if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
    try {
        Account acc = repo.findById(accountId).get();
        withdraw(acc, amount);
    } finally {
        lock.unlock();
    }
}
```

**Option 4: Database Constraint (Atomic)**
```sql
UPDATE accounts 
SET balance = balance - 100 
WHERE id = 1 AND balance >= 100;
-- Atomic: No race condition possible
```

**When to use which:**
- **Optimistic:** Many reads, few writes (balance inquiries)
- **Pessimistic:** Many writes to same row (withdrawal queue)
- **Redis:** Cross-service transactions (Account + Ledger services)
- **Constraint:** Single-database transfers (most reliable)

**Spring Boot Optimistic Locking Service:**
```java
@Service
public class OptimisticLockingService {
    @Autowired
    private AccountRepository repo;
    
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void updateBalance(String accountId, BigDecimal amount) 
            throws OptimisticLockException {
        Account account = repo.findById(accountId).orElseThrow();
        account.setBalance(account.getBalance().add(amount));
        repo.save(account);  // Version check happens here
    }
}

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    @Lock(LockModeType.OPTIMISTIC)
    Optional<Account> findById(String id);
}
```

**Spring Boot Pessimistic Locking Service:**
```java
@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    Optional<Account> findByIdWithLock(@Param("id") String id);
}

@Service
public class PessimisticLockingService {
    @Autowired
    private AccountRepository repo;
    
    @Transactional
    public void updateBalance(String accountId, BigDecimal amount) {
        Account account = repo.findByIdWithLock(accountId).orElseThrow();
        account.setBalance(account.getBalance().add(amount));
        repo.save(account);
    }
}
```

---

### Q4. What Are the Security Pillars (OAuth2, JWT, Encryption)?

**The simple answer:**
Three layers: Prove who you are (authentication) → Prove what you can do (authorization) → Protect data (encryption).

### Authentication (OAuth2/OIDC)

```
1. User clicks "Login with Bank"
2. Redirect to Keycloak (auth server)
3. User enters credentials
4. Keycloak returns ID token + access token + refresh token
5. App stores tokens; uses access token for API calls
```

**Token lifespans (banking standard):**
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (long-lived, in DB)
- If access token stolen: Max 15 min damage
- If refresh token stolen: Can rotate it immediately

### JWT Structure

```
Header.Payload.Signature

eyJhbGciOiJSUzI1NiJ9.  // Header: algorithm=RS256
eyJzdWIiOiJ1c2VyXzEiLCJleHAiOjE2Nzg5MDEyMDB9.  // Payload: user, expiration
gF3...  // Signature verified with public key
```

**Spring Boot JWT verification:**
```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, 
                                   HttpServletResponse res,
                                   FilterChain chain) {
        String token = extractToken(req);
        if (token != null && jwtUtil.isValid(token)) {
            String username = jwtUtil.getUsername(token);
            SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(
                    username, null, jwtUtil.getAuthorities(token)));
        }
        chain.doFilter(req, res);
    }
}
```

### Encryption (Data at Rest & in Transit)

**Data at Rest (in database):**
```java
// Encrypt PII, account numbers
String encrypted = cipher.encrypt(accountNumber); // AES-256-GCM
repo.save(new Account(encrypted));

// Hash passwords (never store plaintext)
String hashed = bcrypt.hash(password);  // bcrypt or Argon2
```

**Data in Transit (between services):**
```yaml
# Enforce mTLS between microservices
security:
  mutual-tls:
    enabled: true
    cert-path: /etc/ssl/certs/client.crt
    key-path: /etc/ssl/private/client.key
```

**Key management:**
- Use HashiCorp Vault or AWS KMS
- Rotate encryption keys regularly
- Never hardcode secrets in code

**Interview tip:** Security in banking is multi-layered. Show you understand all three: authentication, encryption at rest, encryption in transit.

**Detailed Security Implementations:**

**Credit Card Tokenization Service:**
```java
@Service
public class CardTokenizationService {
    @Autowired
    private TokenRepository tokenRepo;
    
    @Autowired
    private EncryptionService encryptionService;
    
    public String tokenize(String cardNumber) {
        String token = UUID.randomUUID().toString();
        String encryptedCard = encryptionService.encrypt(cardNumber);
        tokenRepo.save(new Token(token, encryptedCard));
        return token;
    }
    
    public String detokenize(String token) {
        Token tokenEntity = tokenRepo.findByToken(token);
        return encryptionService.decrypt(tokenEntity.getEncryptedCard());
    }
}
```

**Encryption at Rest - JPA Attribute Converter:**
```java
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {
    @Autowired
    private EncryptionService encryptionService;
    
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute != null ? encryptionService.encrypt(attribute) : null;
    }
    
    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData != null ? encryptionService.decrypt(dbData) : null;
    }
}

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    private String id;
    
    @Convert(converter = EncryptedStringConverter.class)
    private String accountNumber;
    
    private String hashedPassword; // bcrypt hash
}
```

**Audit Logging Aspect:**
```java
@Aspect
@Component
public class SensitiveDataAuditAspect {
    @Autowired
    private AuditLogRepository auditRepo;
    
    @After("@annotation(AuditSensitive)")
    public void logSensitiveOperation(JoinPoint joinPoint) {
        AuditLog log = new AuditLog();
        log.setOperation(joinPoint.getSignature().getName());
        log.setUser(SecurityContextHolder.getContext().getAuthentication().getName());
        log.setTimestamp(LocalDateTime.now());
        auditRepo.save(log);
    }
}
```

---

## 🟠 HIGH PRIORITY: Compliance & Data Safety

### Q5. Why Audit Trails & Event Sourcing Matter in Banking

**The problem:**
NBC (National Bank of Cambodia) requires: "Prove why Account X has balance Y." Every change must be traceable.

**Traditional approach (current state):**
```
Account table:
| ID | Balance |
| 1  | 5,000   |

Question: Was the balance ever 10,000? No idea. We overwrote it.
```

**Event Sourcing (immutable event log):**
```
Events table:
| ID | Type       | Amount | Balance | Timestamp |
| 1  | OPENED     | 0      | 0       | Jan 1     |
| 2  | DEPOSIT    | 10,000 | 10,000  | Jan 2     |
| 3  | WITHDRAW   | 5,000  | 5,000   | Jan 3     |

Current balance: Replay events → $5,000
Balance on Jan 2: Replay up to Jan 2 → $10,000
Full audit trail: Every change recorded forever
```

**Benefits for banking:**
✅ 100% audit trail (regulatory requirement)  
✅ Dispute resolution: "What was my balance at 3:47 PM?"  
✅ Fraud investigation: Replay to detect anomalies  
✅ Interest calculation: Accurate balance history  
✅ Compliance reporting: Reconstruct any state  

**Implementation (Spring Boot + Axon Framework):**
```java
@Aggregate
public class BankAccount {
    @AggregateIdentifier
    private String accountId;
    private BigDecimal balance;
    
    public void withdraw(BigDecimal amount) {
        if (balance.compareTo(amount) < 0) {
            throw new InsufficientFundsException();
        }
        
        // Publish event
        AggregateLifecycle.apply(
            new MoneyWithdrawnEvent(accountId, amount)
        );
    }
    
    @EventSourcingHandler
    public void on(MoneyWithdrawnEvent event) {
        this.balance = balance.subtract(event.getAmount());
    }
}
```

**Interview tip:** Event sourcing is **natural for banking**. Temenos (the #1 core banking system globally) uses it internally.

---

### Q6. Which Database Isolation Level for Banking?

**The problem:**
Concurrent transactions can cause:
- **Dirty Read:** Read uncommitted data (another transaction rolled back)
- **Non-Repeatable Read:** Same query returns different results
- **Phantom Read:** New rows appear mid-transaction

**Four isolation levels:**

| Level | Dirty Read | Non-Repeatable | Phantom | Performance | When to use |
|-------|-----------|----------------|---------|-------------|------------|
| **Read Uncommitted** | ✅ Possible | ✅ Possible | ✅ Possible | Fastest | Not for banking |
| **Read Committed** | ❌ No | ✅ Possible | ✅ Possible | Good | General queries |
| **Repeatable Read** | ❌ No | ❌ No | ✅ Possible | Okay | Reports, dashboards |
| **Serializable** | ❌ No | ❌ No | ❌ No | Slowest | Critical transfers |

**Banking recommendation:**
Use **Repeatable Read** + **Pessimistic Locking** on critical rows:

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    // SELECT FOR UPDATE locks rows until transaction ends
    Account from = accountRepo.findByIdForUpdate(fromId);
    Account to = accountRepo.findByIdForUpdate(toId);
    
    from.debit(amount);
    to.credit(amount);
    
    // Atomic: No race conditions
}
```

**Why this works:**
- Repeatable Read prevents most concurrency issues
- Pessimistic lock on critical data (account balances)
- Transaction commits atomically

---

### Q7. Rate Limiting & Fraud Detection

**The problem:**
Attackers try brute-forcing OTPs, card PINs, or executing 10,000 "test" transactions (card testing).

**Rate limiting (prevent abuse):**
```
Max 5 failed login attempts per user per 15 minutes
Return 429 Too Many Requests
Include Retry-After header
```

**Implementation (Redis sliding window):**
```java
public boolean isRateLimited(String userId) {
    String key = "rate:" + userId + ":" + currentMinute();
    Long count = redis.incr(key);
    
    if (count == 1) {
        redis.expire(key, 60);  // 1-minute window
    }
    
    return count > LIMIT;  // e.g., LIMIT = 100
}
```

**Banking-specific limits:**

| Endpoint | Limit | Reason |
|----------|-------|--------|
| Login | 5 per 15 min | Prevent brute-force |
| Password reset | 3 per hour | Prevent account takeover |
| Fund transfer | 100 per day | Fraud prevention |
| Balance inquiry | 500 per hour | Prevent polling attacks |
| OTP validation | 3 per 15 min | Pin code protection |

**Fraud detection (async rules engine):**
```
Transaction → Kafka topic → Fraud Detection Service
                              ├── Check transaction limits
                              ├── Check geography (London→NY in 10 min?)
                              ├── Check linked accounts (unusual transfers?)
                              └── If suspicious: Block & alert user
```

**Detailed Rate Limiter Service:**
```java
@Service
public class RateLimiter {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public boolean isAllowed(String key, int limit, int windowSeconds) {
        String redisKey = "rate:" + key;
        long currentTime = System.currentTimeMillis() / 1000;
        
        // Add current request timestamp
        redisTemplate.opsForZSet().add(redisKey, String.valueOf(currentTime), currentTime);
        
        // Remove old entries outside the window
        redisTemplate.opsForZSet().removeRangeByScore(redisKey, 0, currentTime - windowSeconds);
        
        // Count requests in window
        Long count = redisTemplate.opsForZSet().zCard(redisKey);
        
        // Set expiration for cleanup
        redisTemplate.expire(redisKey, windowSeconds, TimeUnit.SECONDS);
        
        return count <= limit;
    }
}

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    @Autowired
    private RateLimiter rateLimiter;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String userId = getUserId(request);
        String endpoint = request.getRequestURI();
        
        if (!rateLimiter.isAllowed(userId + ":" + endpoint, 100, 3600)) { // 100 per hour
            response.setStatus(429);
            response.setHeader("Retry-After", "3600");
            return false;
        }
        return true;
    }
}
```

---

## 🟡 IMPORTANT: Scale & Resilience

### Q8. CQRS for High-Traffic Banking Dashboards

**The problem:**
Dashboard fetches: past 3 months of transactions, balance history, analytics. Running these heavy reads on the **write database** slows down payments.

**Solution: CQRS (Command Query Responsibility Segregation)**

Separate write and read models.

```
[ Write Model ]
├─ Payment Service
├─ Strict validation
├─ PostgreSQL (normalized)
└─ Publishes "TransferCompleted" event

              ↓ (Kafka event stream)

[ Read Model (denormalized) ]
├─ Async listener
├─ ElasticSearch / Read replica
├─ Optimized queries for dashboards
└─ Dashboard queries read-only DB
```

**Example:**
```java
// WRITE side (strict)
@Service
public class TransferService {
    @Transactional
    public void executeTransfer(TransferRequest req) {
        accountRepo.debit(req.from(), req.amount());
        accountRepo.credit(req.to(), req.amount());
        
        // Publish event
        eventBus.publish(new TransferCompletedEvent(req));
    }
}

// READ side (optimized for dashboard)
@Service
public class DashboardService {
    @KafkaListener(topics = "transfer-events")
    public void onTransferCompleted(TransferCompletedEvent event) {
        // Update denormalized read model
        dashboardDb.upsert(new DashboardTransaction(
            event.getFrom(),
            event.getTo(),
            event.getAmount(),
            event.getTimestamp()
        ));
    }
}

// Fast dashboard queries
@RestController
public class DashboardController {
    @GetMapping("/dashboard/{userId}/transactions")
    public List<Transaction> getTransactions(@PathVariable Long userId) {
        // Queries read DB (denormalized, indexed for speed)
        return dashboardDb.findByUser(userId);
    }
}
```

**Benefits:**
✅ Write model stays normalized (consistency)  
✅ Read model stays denormalized (speed)  
✅ Scaling independent: 100 write servers, 1000 read replicas  

---

### Q9. Graceful Degradation & Circuit Breakers

**The problem:**
Bank relies on SMS provider, NBC Bakong, Visa network. If SMS goes down, entire app crashes? No.

**Solution: Circuit Breaker + Fallbacks**

```
Closed (normal) ─────[failures spike]─→ Open (circuit tripped)
                                           ↓ [waits]
                                         Half-Open [test request]
                                           ↓
                                    Success ─→ Closed
                                    Failure → Open
```

**Implementation (Resilience4j):**
```java
@Service
public class PaymentService {
    @CircuitBreaker(
        name = "smsProvider",
        fallbackMethod = "sendSmsFallback"
    )
    public void sendPaymentSMS(String phone, String message) {
        smsProvider.send(phone, message);
    }
    
    public void sendSmsFallback(String phone, String message, Exception ex) {
        // Circuit open: fallback to email
        emailProvider.sendPaymentAlert(phone, message);
        logger.warn("SMS failed; sent via email instead");
    }
}
```

**Fallback strategies per service:**
- **SMS provider down** → Fallback to email
- **Live exchange rate API down** → Return cached rate from 1 hour ago + disclaimer
- **KYC verification down** → Block new accounts (fail-closed, never compromise compliance)
- **Notification service down** → Queue notifications, retry later (fail-open, non-critical)

**Key principle:** Never fail silently. Degrade gracefully with explicit feedback.

---

### Q10. Observability: RED Metrics + Distributed Tracing

**The problem:**
Payment took 45 seconds. Why? Was it the Payment Service, Account Service, or database?

**Solution:**
Use **distributed tracing** to track requests across services + **RED metrics** to measure health.

**Distributed Tracing (OpenTelemetry/Zipkin):**
```
Request arrives at API Gateway:
  ├─ Trace-ID: "a1b2c3d4" (unique per request)
  │
  ├─ Payment Service (span 1)
  │  └─ Account Service (span 2)
  │     └─ Database Query (span 3)
  │
  └─ Visualization in Zipkin/Jaeger shows the full flow + latencies
```

**RED Metrics (per service):**
```
R: Rate (requests/second)
E: Errors (failed requests)
D: Duration (response time: P50, P95, P99)

Example:
  Payment Service: 500 req/sec, 0.1% errors, P99=45ms
  Account Service: 2000 req/sec, 0.05% errors, P99=12ms
  Database: 3000 queries/sec, 1% slow queries (>100ms)
```

**USE Metrics (infrastructure):**
```
U: Utilization (CPU, memory, disk)
S: Saturation (queue lengths)
E: Errors (network failures, disk errors)
```

**Spring Boot integration:**
```java
@Configuration
public class ObservabilityConfig {
    @Bean
    MeterBinder customMetrics() {
        return (registry) -> {
            new Gauge.builder("transfers.total", atomicLong, AtomicLong::get)
                .register(registry);
        };
    }
}
```

**Detailed Service with Custom Spans:**
```java
@Service
public class PaymentService {
    @Autowired
    private Tracer tracer;
    
    @Autowired
    private AccountServiceClient accountClient;
    
    @NewSpan("processPayment")
    public PaymentResponse processPayment(PaymentRequest req) {
        Span span = tracer.currentSpan();
        span.tag("amount", req.getAmount().toString());
        span.tag("currency", req.getCurrency());
        
        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            // Validation span
            Span validationSpan = tracer.nextSpan().name("validatePayment");
            try (Tracer.SpanInScope vs = tracer.withSpanInScope(validationSpan)) {
                validatePayment(req);
                validationSpan.tag("status", "success");
            } catch (Exception e) {
                validationSpan.tag("error", e.getMessage());
                throw e;
            } finally {
                validationSpan.end();
            }
            
            // Debit account span
            Span debitSpan = tracer.nextSpan().name("debitAccount");
            try (Tracer.SpanInScope ds = tracer.withSpanInScope(debitSpan)) {
                accountClient.debitAccount(req.getFromAccount(), req.getAmount());
                debitSpan.tag("status", "success");
            } finally {
                debitSpan.end();
            }
            
            return new PaymentResponse("SUCCESS");
        }
    }
}
```

Expose to Prometheus → Grafana dashboard → alerts on SLA violations.

---

## Core Patterns (Detailed Coverage in Backend & Spring Boot Modules)

### Q11-Q18: Advanced Topics

These topics are covered in detail in separate modules:
- **Q11: Monolith vs Microservices** → See Backend Architecture (Q1)
- **Q12: API Versioning** → See Backend Architecture (Q3)
- **Q13: Notification System** → See Backend Architecture (Q7)
- **Q14: Back-pressure** → See Backend Architecture (Q10)
- **Q15: Database-per-Service** → Microservices pattern
- **Q16: Multi-tenant Platform** → Distributed systems
- **Q17: Bulk Payment Processing** → File processing patterns
- **Q18: Idempotent Payment API** → See Q2 above (full Spring Boot code)

---

## Interview Checklist — Banking System Design

- [ ] **Distributed Transactions:** Can explain Saga + Outbox pattern
- [ ] **Idempotency:** Know triple-layer approach (Redis + Lock + DB)
- [ ] **Concurrency:** Can choose between optimistic/pessimistic locking
- [ ] **Security:** Understand OAuth2, JWT, encryption layers
- [ ] **Audit Trails:** Know why Event Sourcing matters for compliance
- [ ] **Isolation Levels:** SERIALIZABLE for transfers
- [ ] **Circuit Breakers:** Know when to fail-closed vs fail-open
- [ ] **CQRS:** Can separate read and write models for scale
- [ ] **Observability:** Can explain RED metrics + tracing
- [ ] **Rate Limiting:** Sliding window counter in Redis
- [ ] **Idempotent APIs:** Code example using Idempotency-Key
- [ ] **Graceful Degradation:** Never fail silently

---

## Key Banking Design Principles

1. **Consistency > Availability** — Customer seeing "Please wait" is better than wrong balance
2. **Fail-closed for compliance** — Block transactions when unsure (KYC, AML)
3. **Fail-open for non-critical** — Queue notifications even if service slow
4. **Immutable audit trail** — Every change recorded forever
5. **Triple-layer defense** — Cache + lock + database for critical operations
6. **Async everywhere** — Never block for external calls
7. **No silent failures** — Always inform user what happened

