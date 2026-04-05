# Senior Backend Developer Interview Guide
## Spring Boot Banking System - Cambodian Bank Context

**Technical Coding Round**  
8 Interview Questions with Detailed Solutions

---

## Interview Questions Overview

| Q | Question | Difficulty | Est. Time |
|---|----------|-----------|-----------|
| 1 | Transaction Management & ACID Properties | Hard | 30-45 min |
| 2 | Concurrency Control: Optimistic vs Pessimistic Locking | Hard | 30-45 min |
| 3 | Message Queue Design for Transaction Processing | Hard | 30-45 min |
| 4 | Distributed Tracing & Observability | Medium-Hard | 30-45 min |
| 5 | API Rate Limiting & Throttling | Medium | 30-45 min |
| 6 | Database Sharding for Account Data | Hard | 30-45 min |
| 7 | Security: PCI-DSS Compliance & Encryption | Hard | 30-45 min |
| 8 | Batch Processing for End-of-Day Settlement | Medium | 30-45 min |

---

## Question 1: Transaction Management & ACID Properties

**Difficulty:** Hard  
**Estimated Time:** 30-45 minutes

### Problem Statement

A bank needs to transfer funds between two accounts atomically. Account A must be debited and Account B credited in a single transaction. If the credit fails, the debit should be rolled back.

Design a Spring Boot service using `@Transactional` that handles this with proper error handling. Include:

1. The service layer method with appropriate isolation level
2. How you'd handle deadlocks when transferring between multiple accounts
3. How you'd implement compensating transactions for distributed scenarios

### Solution & Code

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

### For Distributed Transactions (Saga Pattern)

```java
@Service
public class DistributedTransferService {
    @Autowired
    private TransferSagaOrchestrator sagaOrchestrator;
    
    public void transferWithSaga(String fromAccountId, String toAccountId, 
                                 BigDecimal amount) {
        // Orchestrate steps with compensating transactions
        sagaOrchestrator.startSaga(
            new TransferCommand(fromAccountId, toAccountId, amount),
            // If debit succeeds but credit fails, this compensates
            new CompensatingTransaction(fromAccountId, amount)
        );
    }
}
```

### Key Points

- **Isolation Level:** `READ_COMMITTED` prevents phantom reads while maintaining performance
- **Deadlock Prevention:** Always lock resources in the same order (min/max account ID)
- **Timeout:** 30 seconds prevents long-held locks from blocking other transactions
- **Domain Events:** Publish events for audit trail and notifications
- **Distributed Transactions:** Use Saga pattern with compensating transactions for microservices
- **Optimistic Locking:** Consider `@Version` for high-concurrency scenarios

### Banking Context

Critical for handling multi-account transfers, foreign exchange conversions, and interbank settlements. In Cambodia's banking system, this is essential for FAST (Faster and Secured Transfers) operations.

---

## Question 2: Concurrency Control - Optimistic vs Pessimistic Locking

**Difficulty:** Hard  
**Estimated Time:** 30-45 minutes

### Problem Statement

Your bank needs to update account balances with 10,000 concurrent transactions per second.

Using Spring Data JPA, implement both optimistic and pessimistic locking approaches.

Compare performance trade-offs and when you'd use each for:
- Account balance updates
- Savings account withdrawals
- Investment portfolio updates

### Solution & Code

#### Optimistic Locking (Better for high concurrency, low conflicts)

```java
@Entity
@Table(name = "accounts")
public class Account {
    @Id
    private String id;
    
    @Column(nullable = false)
    private BigDecimal balance;
    
    // Version field prevents lost updates
    @Version
    private Long version;
}

@Service
public class OptimisticLockingService {
    @Autowired
    private AccountRepository repo;
    
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void updateBalance(String accountId, BigDecimal amount) 
            throws OptimisticLockingFailureException {
        
        Account account = repo.findById(accountId)
            .orElseThrow(() -> new AccountNotFoundException());
        
        account.setBalance(account.getBalance().add(amount));
        repo.save(account);  // Will fail if version changed
    }
}

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    // Standard find method - no locking needed
    Account findById(String id);
}
```

#### Pessimistic Locking (Better for high conflicts)

```java
@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Account findByIdWithWriteLock(@Param("id") String id);
    
    @Query("SELECT a FROM Account a WHERE a.id = :id")
    @Lock(LockModeType.PESSIMISTIC_READ)
    Account findByIdWithReadLock(@Param("id") String id);
}

@Service
public class PessimisticLockingService {
    @Autowired
    private AccountRepository repo;
    
    @Transactional
    public void updateBalance(String accountId, BigDecimal amount) 
            throws LockAcquisitionException {
        
        // Acquires exclusive lock on the row
        Account account = repo.findByIdWithWriteLock(accountId);
        account.setBalance(account.getBalance().add(amount));
        repo.save(account);
    }
}
```

### Comparison Table

| Scenario | Optimistic | Pessimistic | Best Choice |
|----------|-----------|------------|-------------|
| High concurrency (10K/sec) | ✓ Better | ✗ Deadlocks | Optimistic |
| Low conflict rate | ✓ Best | ✗ Overkill | Optimistic |
| Frequent retries ok | ✓ Acceptable | ✗ Blocks users | Optimistic |
| High conflict rate | ✗ Many retries | ✓ Better | Pessimistic |
| Read-heavy workload | ✓ No locks | ✗ Shared locks | Optimistic |
| Write-heavy workload | ✗ Conflicts rise | ✓ Serialized | Pessimistic |

### Banking Use Cases

**Account Balance Updates:** Optimistic (mostly reads, few direct conflicts)
- Reason: Multiple transactions read/write different accounts concurrently

**Savings Account Withdrawals:** Pessimistic (must be strictly sequential)
- Reason: Cannot allow overdraft; withdrawal order matters

**Investment Portfolio Updates:** Optimistic (concurrent operations acceptable)
- Reason: Market prices update frequently; eventual consistency is fine

### Key Points

- **Optimistic:** Uses version field to detect conflicts; retry on failure
- **Pessimistic:** Locks row immediately; blocks other transactions
- **Retry Logic:** Implement exponential backoff for optimistic locking retries
- **Monitoring:** Track lock wait times and retry rates in production

### Banking Context

Critical for handling high-frequency trading, real-time balance updates, and concurrent transactions. Cambodia's banking system processes thousands of transactions daily; choose the right strategy for each use case.

---

## Question 3: Message Queue Design for Transaction Processing

**Difficulty:** Hard  
**Estimated Time:** 30-45 minutes

### Problem Statement

Design a Spring Boot system using RabbitMQ that guarantees:

1. No lost transactions during processing
2. No duplicate processing (idempotent)
3. Proper ordering for transfers within account
4. Dead letter queue (DLQ) handling

### Solution & Code

#### Producer - Transactional Outbox Pattern

```java
@Service
public class TransactionProducer {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    @Autowired
    private OutboxRepository outboxRepository;
    
    @Transactional
    public void publishTransferEvent(TransferEvent event) {
        // STEP 1: Store in database outbox table
        TransactionOutbox outbox = new TransactionOutbox()
            .setAggregateId(event.getTransferId())
            .setEventType("TRANSFER_INITIATED")
            .setPayload(jsonConverter.toJson(event))
            .setStatus(OutboxStatus.PENDING);
        
        outboxRepository.save(outbox);
        
        // STEP 2: Publish to message queue
        // Database transaction ensures message is reliable
        rabbitTemplate.convertAndSend(
            "transfers-exchange",
            "transfer.initiated",
            event,
            msg -> {
                msg.getMessageProperties()
                    .setHeader("X-Idempotent-Key", event.getTransferId());
                msg.getMessageProperties()
                    .setHeader("X-Retry-Count", "0");
                return msg;
            }
        );
    }
}
```

#### Consumer - Idempotent Processing

```java
@Service
public class TransferEventConsumer {
    @Autowired
    private TransferService transferService;
    
    @Autowired
    private IdempotencyStore idempotencyStore;
    
    @RabbitListener(queues = "transfer-queue")
    @Transactional
    public void handleTransferEvent(
            TransferEvent event,
            @Header("X-Idempotent-Key") String idempotentKey,
            @Header(name = "X-Retry-Count", required = false) String retryCount) 
            throws Exception {
        
        // Check if already processed using idempotent key
        if (idempotencyStore.hasProcessed(idempotentKey)) {
            log.info("Transfer {} already processed, skipping", idempotentKey);
            return;
        }
        
        try {
            // Process the transfer
            transferService.processTransfer(event);
            
            // Mark as processed
            idempotencyStore.markProcessed(
                idempotentKey, 
                System.currentTimeMillis()
            );
            
        } catch (Exception e) {
            int retries = Integer.parseInt(
                retryCount != null ? retryCount : "0");
            
            if (retries < 3) {
                // Publish to retry queue with exponential backoff
                throw new AmqpRejectAndDontRequeueException(
                    "Retryable error", e);
            } else {
                // Send to DLQ after max retries
                throw new AmqpRejectAndDontRequeueException(
                    "Max retries exceeded", e);
            }
        }
    }
}
```

#### RabbitMQ Configuration

```java
@Configuration
public class RabbitMQConfig {
    
    @Bean
    public Exchange transferExchange() {
        return new TopicExchange("transfers-exchange", true, false);
    }
    
    @Bean
    public Queue transferQueue() {
        return QueueBuilder.durable("transfer-queue")
            .deadLetterExchange("transfers-dlx")
            .ttl(30000)  // Message TTL: 30 seconds
            .maxLength(100000)  // Queue size limit
            .build();
    }
    
    @Bean
    public Queue transferDLQ() {
        return QueueBuilder.durable("transfer-dlq").build();
    }
    
    @Bean
    public Binding transferBinding(
            Queue transferQueue, 
            Exchange transferExchange) {
        return BindingBuilder
            .bind(transferQueue)
            .to(transferExchange)
            .with("transfer.*");
    }
}
```

#### Idempotency Store (Redis-backed)

```java
@Repository
public class IdempotencyStore {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public boolean hasProcessed(String idempotentKey) {
        return Boolean.TRUE.equals(
            redisTemplate.hasKey("processed:" + idempotentKey));
    }
    
    public void markProcessed(String idempotentKey, long timestamp) {
        redisTemplate.opsForValue()
            .set("processed:" + idempotentKey, String.valueOf(timestamp));
        
        // Expire after 24 hours to prevent infinite growth
        redisTemplate.expire("processed:" + idempotentKey, 
            Duration.ofHours(24));
    }
}
```

### Key Patterns Explained

**Transactional Outbox Pattern:**
- Guarantees message delivery even if service crashes
- Database write and message publish are in same transaction

**Idempotent Consumer:**
- Use unique transaction ID as idempotent key
- Check if message was already processed before processing again

**Retry Logic:**
- Exponential backoff before dead letter queue
- Max retries (typically 3) before giving up

**Message Ordering:**
- Use partition key (account ID) to guarantee ordering
- Messages for same account processed sequentially

### Banking Context

Essential for payment processing, settlements, and audit trail in Cambodia's banking system. Guarantees transaction consistency across service boundaries.

---

## Question 4: Distributed Tracing & Observability

**Difficulty:** Medium-Hard  
**Estimated Time:** 30-45 minutes

### Problem Statement

Your bank has multiple microservices: Auth Service, Account Service, Transaction Service, Notification Service.

Implement distributed tracing using Spring Cloud Sleuth + Zipkin to:

1. Track a single payment request across all services
2. Measure latency at each hop
3. Debug failures with correlation IDs
4. Implement custom spans for business logic

### Solution & Code

#### POM.XML Dependencies

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-sleuth-zipkin</artifactId>
</dependency>

<dependency>
    <groupId>io.zipkin.reporter2</groupId>
    <artifactId>zipkin-sender-web</artifactId>
</dependency>
```

#### application.yml Configuration

```yaml
spring:
  zipkin:
    base-url: http://localhost:9411
    sender:
      type: web
  sleuth:
    trace-id128: true  # 128-bit trace ID for better distribution
    sampler:
      probability: 1.0  # 100% sampling in development
      # In production: use 0.1 or adaptive sampler

logging:
  level:
    org.springframework.cloud.sleuth: DEBUG
```

#### Service with Custom Spans

```java
@Service
public class PaymentService {
    @Autowired
    private Tracer tracer;
    
    @Autowired
    private AccountServiceClient accountClient;
    
    @Autowired
    private NotificationServiceClient notificationClient;
    
    public PaymentResponse processPayment(PaymentRequest request) {
        // Automatic trace ID propagation via MDC
        String traceId = tracer.currentSpan().context().traceIdString();
        log.info("Processing payment with trace ID: {}", traceId);
        
        // Create custom span for validation
        Span validationSpan = tracer.nextSpan()
            .name("payment-validation");
        
        try (Tracer.SpanInScope ws = tracer.withSpan(validationSpan.start())) {
            validationSpan.tag("payment.amount", request.getAmount().toString());
            validationSpan.tag("payment.currency", "USD");
            validationSpan.tag("payment.from", request.getFromAccountId());
            validationSpan.tag("payment.to", request.getToAccountId());
            
            validatePayment(request);
            
        } finally {
            validationSpan.finish();
        }
        
        // Account service call - trace automatically propagates via HTTP headers
        Span accountSpan = tracer.nextSpan().name("account-debit");
        try (Tracer.SpanInScope ws = tracer.withSpan(accountSpan.start())) {
            accountSpan.tag("account.id", request.getFromAccountId());
            accountSpan.event("account-debit-start");
            
            AccountResponse response = accountClient.debitAccount(
                request.getFromAccountId(), 
                request.getAmount()
            );
            
            accountSpan.event("account-debit-complete");
        } finally {
            accountSpan.finish();
        }
        
        // Notification service call
        Span notificationSpan = tracer.nextSpan()
            .name("send-notification");
        try (Tracer.SpanInScope ws = tracer.withSpan(
                notificationSpan.start())) {
            notificationSpan.tag("notification.type", "SMS");
            notificationSpan.tag("notification.recipient", 
                request.getToPhoneNumber());
            
            notificationClient.notifyUser(request.getToPhoneNumber());
        } finally {
            notificationSpan.finish();
        }
        
        return PaymentResponse.success(traceId);
    }
}
```

#### Feign Client - Automatic Header Propagation

```java
@FeignClient(name = "account-service")
public interface AccountServiceClient {
    @PostMapping("/api/accounts/debit")
    AccountResponse debitAccount(
        @RequestParam String accountId,
        @RequestParam BigDecimal amount
    );
}
```

Sleuth automatically adds tracing headers (X-Trace-Id, X-Span-Id) to Feign requests.

#### Logging Configuration with Trace ID

```yaml
logging:
  pattern:
    console: "%d{ISO8601} [%X{traceId}] [%X{spanId}] %thread - %msg%n"
    file: "%d{ISO8601} [%X{traceId}] [%X{spanId}] %thread - %msg%n"
```

#### Zipkin Query Example

After processing a payment:

```
Service: PaymentService
Operation: processPayment
Min Duration: 5000ms

Results:
✓ payment-validation: 150ms
✓ account-debit: 3200ms (slow - account service is bottleneck)
✓ send-notification: 400ms
Total: 3750ms
```

### Benefits

- Automatic HTTP header propagation across services
- Correlation ID in logs for easy debugging
- Performance bottleneck identification
- Distributed transaction tracking
- Visual flow in Zipkin UI

### Banking Context

Critical for debugging complex payment flows across multiple banking services and identifying performance bottlenecks in Cambodia's distributed banking infrastructure.

---

## Question 5: API Rate Limiting & Throttling

**Difficulty:** Medium  
**Estimated Time:** 30-45 minutes

### Problem Statement

Design a Spring Boot rate limiting system for:

1. Per-user API rate limiting (100 requests/minute)
2. Per-IP rate limiting (1000 requests/minute)
3. Priority queuing for VIP customers
4. Graceful degradation under load

Use Redis as the distributed store.

### Solution & Code

#### Rate Limiter Service

```java
@Service
public class RateLimiter {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private CustomerService customerService;
    
    public RateLimitResult checkLimit(String userId, String ipAddress) {
        // Check user-based limit
        RateLimitResult userLimit = checkUserLimit(userId);
        if (!userLimit.isAllowed()) {
            return userLimit;
        }
        
        // Check IP-based limit
        RateLimitResult ipLimit = checkIpLimit(ipAddress);
        if (!ipLimit.isAllowed()) {
            return ipLimit;
        }
        
        return RateLimitResult.allowed();
    }
    
    private RateLimitResult checkUserLimit(String userId) {
        String key = "rate-limit:user:" + userId;
        
        // Get customer tier for limit determination
        Customer customer = customerService.getCustomer(userId);
        long limit = customer.isVip() ? 1000L : 100L;
        
        // Increment counter
        Long currentCount = redisTemplate.opsForValue()
            .increment(key);
        
        // Set expiry on first request
        if (currentCount == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }
        
        // Check if exceeded
        if (currentCount > limit) {
            long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            return RateLimitResult.denied(
                "User rate limit exceeded",
                currentCount,
                limit,
                ttl
            );
        }
        
        return RateLimitResult.allowed(limit - currentCount);
    }
    
    private RateLimitResult checkIpLimit(String ipAddress) {
        String key = "rate-limit:ip:" + ipAddress;
        long limit = 1000L;
        
        Long currentCount = redisTemplate.opsForValue()
            .increment(key);
        
        if (currentCount == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }
        
        if (currentCount > limit) {
            long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
            return RateLimitResult.denied(
                "IP rate limit exceeded",
                currentCount,
                limit,
                ttl
            );
        }
        
        return RateLimitResult.allowed(limit - currentCount);
    }
}
```

#### Rate Limit Interceptor

```java
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    @Autowired
    private RateLimiter rateLimiter;
    
    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) throws Exception {
        String userId = request.getHeader("X-User-Id");
        String ipAddress = getClientIp(request);
        
        RateLimitResult result = rateLimiter.checkLimit(userId, ipAddress);
        
        // Set rate limit headers
        response.setHeader("X-RateLimit-Limit", 
            String.valueOf(result.getLimit()));
        response.setHeader("X-RateLimit-Remaining", 
            String.valueOf(result.getRemaining()));
        response.setHeader("X-RateLimit-Reset", 
            String.valueOf(result.getResetAfter()));
        
        if (!result.isAllowed()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            
            response.getWriter().write(jsonConverter.toJson(
                Map.of(
                    "error", result.getMessage(),
                    "retryAfter", result.getResetAfter()
                )
            ));
            return false;
        }
        
        return true;
    }
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor == null || xForwardedFor.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xForwardedFor.split(",")[0];
    }
}
```

#### Configuration Registration

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
    private RateLimitInterceptor rateLimitInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/public/**");
    }
}
```

#### Priority Queue Manager

```java
@Service
public class PriorityQueueManager {
    @Autowired
    private CustomerService customerService;
    
    public RequestPriority getPriority(String userId) {
        Customer customer = customerService.getCustomer(userId);
        
        if (customer.isVip()) {
            return RequestPriority.HIGH;
        } else if (customer.isLargeCorporate()) {
            return RequestPriority.MEDIUM;
        } else {
            return RequestPriority.LOW;
        }
    }
}
```

#### Graceful Degradation with Circuit Breaker

```java
@Service
public class PaymentService {
    
    @CircuitBreaker(name = "payment-service", 
                   fallbackMethod = "paymentFallback")
    @Retry(name = "payment-service")
    @Bulkhead(name = "payment-service", 
             type = Bulkhead.Type.THREADPOOL)
    public PaymentResponse processPayment(PaymentRequest request) {
        // Normal processing
        return paymentGateway.process(request);
    }
    
    // Fallback when service is overloaded
    public PaymentResponse paymentFallback(
            PaymentRequest request, Exception e) {
        log.warn("Payment service overloaded, queuing for later: {}", 
            request.getTransactionId());
        
        return PaymentResponse.queuedForLater(
            "Payment service temporarily unavailable. Your request has been queued.",
            request.getTransactionId()
        );
    }
}
```

#### Resilience4j Configuration

```yaml
resilience4j:
  circuitbreaker:
    instances:
      payment-service:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true
        waitDurationInOpenState: 5s
        failureRateThreshold: 50
        recordExceptions:
          - java.lang.Exception
  
  bulkhead:
    instances:
      payment-service:
        maxConcurrentCalls: 25
        maxWaitDuration: 10ms
  
  retry:
    instances:
      payment-service:
        maxAttempts: 3
        waitDuration: 1000
```

### Banking Context

Essential for protecting banking APIs from abuse and managing load during peak banking hours (month-end, promotions). In Cambodia, Friday afternoons and salary days see 10x normal traffic.

---

## Question 6: Database Sharding for Account Data

**Difficulty:** Hard  
**Estimated Time:** 30-45 minutes

### Problem Statement

Your bank has grown to 10 million accounts. Design a horizontal sharding strategy:

1. Choose a sharding key (account ID, customer ID, region)
2. Implement shard resolution logic
3. Handle cross-shard queries
4. Migration strategy when adding new shards

### Solution & Code

#### Sharding Configuration

```java
@Configuration
public class ShardingConfig {
    // Distribute 10M accounts across 256 shards (40K accounts per shard)
    private static final int SHARD_COUNT = 256;
    
    public int getShardId(String accountId) {
        int hash = Math.abs(accountId.hashCode());
        return hash % SHARD_COUNT;
    }
    
    // For region-based sharding (Cambodia context)
    public int getRegionalShardId(String region) {
        Map<String, Integer> regionShardMap = Map.of(
            "PHNOM_PENH", 0,
            "SIEM_REAP", 1,
            "BATTAMBANG", 2,
            "KAMPONG_CHAM", 3,
            "SIHANOUKVILLE", 4
        );
        return regionShardMap.getOrDefault(region, 0);
    }
}
```

#### Datasource Router

```java
@Configuration
public class ShardDataSourceConfig {
    
    @Bean
    public DataSource shardedDataSource(
            @Value("${db.primary.url}") String primaryUrl) {
        
        Map<Object, Object> targetDataSources = new HashMap<>();
        
        // Create datasource for each of 256 shards
        for (int i = 0; i < 256; i++) {
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(String.format(primaryUrl, i));
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            
            targetDataSources.put("shard_" + i, 
                new HikariDataSource(config));
        }
        
        // Router datasource determines which shard to use
        AbstractRoutingDataSource routingDataSource = 
            new ShardRoutingDataSource();
        routingDataSource.setTargetDataSources(targetDataSources);
        routingDataSource.setDefaultTargetDataSource(
            targetDataSources.get("shard_0"));
        
        return routingDataSource;
    }
}
```

#### Shard Routing Datasource

```java
public class ShardRoutingDataSource extends AbstractRoutingDataSource {
    
    @Override
    protected Object determineCurrentLookupKey() {
        String accountId = ShardContext.getAccountId();
        
        if (accountId == null) {
            return "shard_0";
        }
        
        int shardId = Math.abs(accountId.hashCode()) % 256;
        return "shard_" + shardId;
    }
}
```

#### Thread-Local Context

```java
public class ShardContext {
    private static final ThreadLocal<String> accountIdHolder = 
        new ThreadLocal<>();
    
    public static void setAccountId(String accountId) {
        accountIdHolder.set(accountId);
    }
    
    public static String getAccountId() {
        return accountIdHolder.get();
    }
    
    public static void clear() {
        accountIdHolder.remove();
    }
}
```

#### Repository with Shard Routing

```java
@Repository
public class AccountRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public Account findById(String accountId) {
        ShardContext.setAccountId(accountId);  // Routes to correct shard
        try {
            return jdbcTemplate.queryForObject(
                "SELECT * FROM accounts WHERE id = ?",
                new AccountRowMapper(),
                accountId
            );
        } finally {
            ShardContext.clear();
        }
    }
    
    public void save(Account account) {
        ShardContext.setAccountId(account.getId());
        try {
            jdbcTemplate.update(
                "UPDATE accounts SET balance = ? WHERE id = ?",
                account.getBalance(), account.getId()
            );
        } finally {
            ShardContext.clear();
        }
    }
}
```

#### Cross-Shard Query Pattern (Scatter-Gather)

```java
@Service
public class CrossShardService {
    @Autowired
    private AccountRepository accountRepository;
    
    public List<Account> getAllAccountsForCustomer(String customerId) {
        // Query all shards in parallel
        List<Account> allAccounts = Collections.synchronizedList(
            new ArrayList<>()
        );
        
        IntStream.range(0, 256).parallel().forEach(shardId -> {
            ShardContext.setAccountId(
                String.format("%s_%d", customerId, shardId));
            try {
                List<Account> shardAccounts = 
                    accountRepository.findByCustomerId(customerId);
                allAccounts.addAll(shardAccounts);
            } finally {
                ShardContext.clear();
            }
        });
        
        // Aggregate results
        return allAccounts.stream()
            .sorted(Comparator.comparing(Account::getId))
            .collect(Collectors.toList());
    }
}
```

#### Shard Migration (Adding new shard)

```java
@Service
public class ShardMigrationService {
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private DataSource newShardDataSource;
    
    @Scheduled(cron = "0 0 2 * * *")  // Run at 2 AM
    public void migrateShardData() {
        // 1. Double write: New writes go to both old & new shard
        log.info("Starting shard migration...");
        
        List<Account> accountsForMigration = 
            accountRepository.findAccountsRequiringMigration();
        
        // 2. Batch copy data to new shard
        accountsForMigration.stream()
            .filter(a -> shouldMoveToNewShard(a))
            .forEach(account -> {
                insertIntoNewShard(account);
            });
        
        // 3. Verify data consistency
        List<String> missingAccounts = 
            verifyMigrationCompleteness();
        
        if (!missingAccounts.isEmpty()) {
            log.error("Missing accounts detected: {}", missingAccounts);
            throw new MigrationException("Incomplete migration");
        }
        
        // 4. Gradual traffic switch (canary deployment)
        switchTrafficToNewShard(0.1);  // Start with 10%
        Thread.sleep(300000);  // Wait 5 minutes
        switchTrafficToNewShard(0.5);  // 50%
        Thread.sleep(300000);
        switchTrafficToNewShard(1.0);  // 100%
        
        // 5. Schedule old shard cleanup after verification period
        scheduleOldShardCleanup(Duration.ofDays(7));
        
        log.info("Shard migration completed successfully");
    }
    
    private boolean shouldMoveToNewShard(Account account) {
        // With 512 total shards, accounts hash % 512 >= 256 go to new shards
        return Math.abs(account.getId().hashCode()) % 512 >= 256;
    }
}
```

### Key Strategies

- **Sharding Key:** Account ID (consistent hashing for stability)
- **Shard Count:** 256 (allows future expansion, ~40K accounts per shard)
- **Lookup:** Direct modulo hashing, no lookup table needed
- **Cross-shard:** Scatter-gather with parallel execution
- **Migration:** Double-write during migration, gradual traffic switch

### Banking Context

Required for scaling to millions of accounts while maintaining performance for Cambodia's rapidly growing banking sector. Current growth: 15% annually.

---

## Question 7: Security - PCI-DSS Compliance & Encryption

**Difficulty:** Hard  
**Estimated Time:** 30-45 minutes

### Problem Statement

Implement PCI-DSS compliance for a payment service:

1. Tokenize credit card data
2. Encrypt sensitive data at rest and in transit
3. Implement secure key management
4. Audit logging for compliance

### Solution & Code

#### Credit Card Tokenization Service

```java
@Service
public class CardTokenizationService {
    @Autowired
    private TokenizationGateway gateway;  // Third-party tokenization
    
    @Autowired
    private TokenRepository tokenRepository;
    
    public String tokenizeCard(CardDetails cardDetails) {
        // CRITICAL: Never store raw card data locally
        // Use third-party tokenization service
        
        TokenizationRequest request = TokenizationRequest.builder()
            .cardNumber(cardDetails.getCardNumber())
            .expiryMonth(cardDetails.getExpiryMonth())
            .expiryYear(cardDetails.getExpiryYear())
            .cvv(cardDetails.getCvv())
            .build();
        
        // Get token from external service
        TokenizationResponse response = gateway.tokenize(request);
        String token = response.getToken();
        
        // Store ONLY token and metadata, never card data
        CardToken storedToken = CardToken.builder()
            .customerId(cardDetails.getCustomerId())
            .token(token)
            .last4Digits(cardDetails.getCardNumber()
                .substring(cardDetails.getCardNumber().length() - 4))
            .expiryMonth(cardDetails.getExpiryMonth())
            .expiryYear(cardDetails.getExpiryYear())
            .cardNetwork("VISA")
            .createdAt(Instant.now())
            .build();
        
        tokenRepository.save(storedToken);
        return token;
    }
}
```

#### Encryption at Rest - JPA Attribute Converter

```java
@Component
public class EncryptedStringConverter 
        implements AttributeConverter<String, String> {
    
    @Autowired
    private StringEncryptor stringEncryptor;
    
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute != null ? 
            stringEncryptor.encrypt(attribute) : null;
    }
    
    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData != null ? 
            stringEncryptor.decrypt(dbData) : null;
    }
}

@Entity
@Table(name = "customers")
public class Customer {
    @Id
    private String id;
    
    // Non-sensitive data
    @Column
    private String firstName;
    
    @Column
    private String lastName;
    
    // Sensitive data - automatically encrypted/decrypted
    @Column
    @Convert(converter = EncryptedStringConverter.class)
    private String ssn;
    
    @Column
    @Convert(converter = EncryptedStringConverter.class)
    private String phoneNumber;
    
    @Column
    @Convert(converter = EncryptedStringConverter.class)
    private String email;
}
```

#### Encryption Configuration (Jasypt)

```yaml
jasypt:
  encryptor:
    password: ${ENCRYPTION_PASSWORD}  # From environment variable
    algorithm: PBEWITHMD5ANDDES
    iv-generator-classname: org.jasypt.iv.RandomIvGenerator
```

#### HTTPS Configuration with Certificate Pinning

```java
@Configuration
public class HttpSecurityConfig {
    
    @Bean
    public RestTemplate restTemplate() throws Exception {
        SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
        
        // Load trusted certificates for payment gateway
        KeyStore trustStore = KeyStore.getInstance("JKS");
        try (InputStream is = new FileInputStream(
                "/etc/ssl/certs/payment-gateway-cert.jks")) {
            trustStore.load(is, "password".toCharArray());
        }
        
        TrustManagerFactory tmf = 
            TrustManagerFactory.getInstance("SunX509");
        tmf.init(trustStore);
        
        sslContext.init(null, tmf.getTrustManagers(), 
            new SecureRandom());
        
        HttpClientBuilder httpClientBuilder = HttpClients.custom()
            .setSSLContext(sslContext)
            .setSSLHostnameVerifier(new DefaultHostnameVerifier());
        
        HttpComponentsClientHttpRequestFactory factory = 
            new HttpComponentsClientHttpRequestFactory(
                httpClientBuilder.build());
        
        return new RestTemplate(factory);
    }
}
```

#### Secure Key Management - AWS Secrets Manager

```java
@Configuration
public class KeyManagementConfig {
    
    @Bean
    public String encryptionKey() throws Exception {
        AWSSecretsManager client = 
            AWSSecretsManagerClientBuilder.standard()
                .withRegion("ap-southeast-1")
                .build();
        
        GetSecretValueRequest request = 
            new GetSecretValueRequest()
                .withSecretId("banking-app/encryption-key");
        
        GetSecretValueResult result = client.getSecretValue(request);
        return result.getSecretString();
    }
    
    @Bean
    public StringEncryptor stringEncryptor(String encryptionKey) {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        encryptor.setPassword(encryptionKey);
        encryptor.setPoolSize(1);
        encryptor.setAlgorithm("PBEWithMD5AndDES");
        return encryptor;
    }
}
```

#### Audit Logging Aspect

```java
@Aspect
@Component
public class SensitiveDataAuditAspect {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Around("execution(* *.payment.*(..))")
    public Object auditPaymentOperations(
            ProceedingJoinPoint joinPoint) throws Throwable {
        
        String methodName = joinPoint.getSignature().getName();
        String userId = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        String ipAddress = getClientIp();
        
        AuditLog log = AuditLog.builder()
            .operation(methodName)
            .timestamp(Instant.now())
            .userId(userId)
            .ipAddress(ipAddress)
            .build();
        
        try {
            Object result = joinPoint.proceed();
            log.setStatus("SUCCESS");
            return result;
        } catch (Exception e) {
            log.setStatus("FAILURE");
            log.setErrorMessage(e.getMessage());
            throw e;
        } finally {
            // NEVER log sensitive data (card numbers, SSN, passwords)
            auditLogRepository.save(log);
        }
    }
}
```

#### Audit Log Entity

```java
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String operation;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String ipAddress;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private AuditStatus status;
    
    @Column(length = 500)
    private String errorMessage;
    
    @Column(nullable = false)
    private Instant timestamp;
    
    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
```

### PCI-DSS Compliance Checklist

- ✓ Never store card data (use tokenization)
- ✓ Encrypt data in transit (TLS 1.2+)
- ✓ Encrypt data at rest (AES-256)
- ✓ Secure key management (AWS Secrets Manager)
- ✓ Access controls (Role-Based Access Control)
- ✓ Audit logging (all sensitive operations)
- ✓ Vulnerability scanning (quarterly)
- ✓ Penetration testing (annually)

### Banking Context

Mandatory for handling payments and customer data in Cambodia's regulated banking environment. NBC (National Bank of Cambodia) requires PCI-DSS level 1 compliance for all payment processors.

---

## Question 8: Batch Processing for End-of-Day Settlement

**Difficulty:** Medium  
**Estimated Time:** 30-45 minutes

### Problem Statement

Design a Spring Batch job for end-of-day settlement:

1. Process millions of transactions
2. Calculate interest accrual
3. Generate settlement reports
4. Rollback on validation failures

Use partitioning for parallel processing.

### Solution & Code

#### Batch Job Configuration

```java
@Configuration
@EnableBatchProcessing
public class EODSettlementConfig {
    
    @Bean
    public Job eodSettlementJob(
            JobRepository jobRepository,
            PlatformTransactionManager txMgr,
            JobCompletionListener jobCompletionListener) {
        
        return new JobBuilder("eodSettlement", jobRepository)
            .start(validateDataStep(jobRepository, txMgr))
            .next(processTransactionsStep(jobRepository, txMgr))
            .next(calculateInterestStep(jobRepository, txMgr))
            .next(generateReportStep(jobRepository, txMgr))
            .listener(jobCompletionListener)
            .build();
    }
    
    // STEP 1: Validate data integrity
    @Bean
    public Step validateDataStep(
            JobRepository jobRepository,
            PlatformTransactionManager txMgr) {
        
        return new StepBuilder("validateData", jobRepository)
            .tasklet((contribution, chunkContext) -> {
                // Check for pending transactions
                long pendingCount = transactionRepository
                    .countByStatus(TransactionStatus.PENDING);
                
                if (pendingCount > 0) {
                    throw new BatchProcessingException(
                        "Cannot start EOD: " + pendingCount + 
                        " transactions still pending");
                }
                
                log.info("Data validation passed");
                return RepeatStatus.FINISHED;
            }, txMgr)
            .build();
    }
    
    // STEP 2: Process transactions (partitioned for parallel)
    @Bean
    public Step processTransactionsStep(
            JobRepository jobRepository,
            PlatformTransactionManager txMgr) {
        
        return new StepBuilder("processTransactions", jobRepository)
            .partitioner("partitionedTransactions", 
                new TransactionPartitioner())
            .step(transactionPartitionStep(jobRepository, txMgr))
            .gridSize(10)  // 10 parallel threads
            .taskExecutor(batchTaskExecutor())
            .build();
    }
    
    @Bean
    public TaskExecutor batchTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(300);
        executor.initialize();
        return executor;
    }
    
    // Each partition processes account range
    @Bean
    public Step transactionPartitionStep(
            JobRepository jobRepository,
            PlatformTransactionManager txMgr) {
        
        return new StepBuilder("transactionPartition", jobRepository)
            .<TransactionRecord, ProcessedTransaction>chunk(1000, txMgr)
            .reader(partitionedTransactionReader())
            .processor(transactionProcessor())
            .writer(transactionWriter())
            .faultTolerant()
            .skipLimit(10)
            .skip(DataAccessException.class)
            .noSkip(InvalidTransactionException.class)
            .retryLimit(3)
            .retry(TemporaryServiceException.class)
            .listener(new ChunkListener())
            .build();
    }
    
    @Bean
    @StepScope
    public PartitionedItemReader<TransactionRecord> 
            partitionedTransactionReader(
            @Value("#{stepExecutionContext['minId']}") Long minId,
            @Value("#{stepExecutionContext['maxId']}") Long maxId) {
        
        return new TransactionReader(minId, maxId, transactionRepository);
    }
    
    @Bean
    public ItemProcessor<TransactionRecord, ProcessedTransaction> 
            transactionProcessor() {
        
        return transaction -> {
            // Validate transaction
            validateTransaction(transaction);
            
            ProcessedTransaction processed = 
                new ProcessedTransaction()
                .setTransactionId(transaction.getId())
                .setAmount(transaction.getAmount())
                .setStatus(TransactionStatus.SETTLED)
                .setSettledAt(Instant.now());
            
            return processed;
        };
    }
    
    @Bean
    public ItemWriter<ProcessedTransaction> transactionWriter() {
        return transactions -> {
            for (ProcessedTransaction tx : transactions) {
                transactionRepository.updateStatus(
                    tx.getTransactionId(), 
                    TransactionStatus.SETTLED
                );
            }
        };
    }
    
    // STEP 3: Calculate interest accrual
    @Bean
    public Step calculateInterestStep(
            JobRepository jobRepository,
            PlatformTransactionManager txMgr) {
        
        return new StepBuilder("calculateInterest", jobRepository)
            .<SavingsAccount, InterestCalculation>chunk(100, txMgr)
            .reader(savingsAccountReader())
            .processor(interestProcessor())
            .writer(interestWriter())
            .build();
    }
    
    @Bean
    public ItemReader<SavingsAccount> savingsAccountReader() {
        JdbcPagingItemReader<SavingsAccount> reader = 
            new JdbcPagingItemReader<>();
        reader.setDataSource(dataSource);
        reader.setPageSize(100);
        reader.setRowMapper(new SavingsAccountRowMapper());
        
        SqlPagingQueryProviderFactoryBean queryProvider = 
            new SqlPagingQueryProviderFactoryBean();
        queryProvider.setDataSource(dataSource);
        queryProvider.setSelectClause("SELECT *");
        queryProvider.setFromClause("FROM savings_accounts");
        queryProvider.setSortKey("id");
        
        reader.setQueryProvider(queryProvider.getObject());
        return reader;
    }
    
    @Bean
    public ItemProcessor<SavingsAccount, InterestCalculation> 
            interestProcessor() {
        
        return account -> {
            // Daily interest = balance * (annual_rate / 365)
            BigDecimal dailyRate = account.getAnnualRate()
                .divide(BigDecimal.valueOf(365), 6, 
                    RoundingMode.HALF_UP);
            
            BigDecimal interest = account.getBalance()
                .multiply(dailyRate);
            
            return new InterestCalculation()
                .setAccountId(account.getId())
                .setDailyInterest(interest)
                .setCalculatedAt(Instant.now());
        };
    }
    
    @Bean
    public ItemWriter<InterestCalculation> interestWriter() {
        return calculations -> {
            for (InterestCalculation calc : calculations) {
                // Credit interest to account
                accountRepository.creditInterest(
                    calc.getAccountId(), 
                    calc.getDailyInterest()
                );
            }
        };
    }
    
    // STEP 4: Generate settlement reports
    @Bean
    public Step generateReportStep(
            JobRepository jobRepository,
            PlatformTransactionManager txMgr) {
        
        return new StepBuilder("generateReport", jobRepository)
            .tasklet((contribution, chunkContext) -> {
                // Generate settlement report
                EODReport report = new EODReport()
                    .setReportDate(LocalDate.now())
                    .setTotalTransactions(
                        transactionRepository.countSettled(
                            LocalDate.now()))
                    .setTotalAmount(
                        transactionRepository.sumSettled(
                            LocalDate.now()))
                    .setTotalInterest(
                        interestRepository.sumForDate(
                            LocalDate.now()))
                    .setGeneratedAt(Instant.now());
                
                reportRepository.save(report);
                
                // Send to regulatory body (NBC Cambodia)
                regulatoryReportService.submitReport(report);
                
                log.info("EOD report generated for {}", 
                    report.getReportDate());
                
                return RepeatStatus.FINISHED;
            }, txMgr)
            .listener(new StepExecutionListener())
            .build();
    }
}
```

#### Partitioner - Divides work by account ranges

```java
@Component
public class TransactionPartitioner implements Partitioner {
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Override
    public Map<String, ExecutionContext> partition(int gridSize) {
        Map<String, ExecutionContext> partitions = new HashMap<>();
        
        // Get min/max transaction IDs to distribute work
        long minId = transactionRepository.getMinId();
        long maxId = transactionRepository.getMaxId();
        long partitionSize = (maxId - minId) / gridSize;
        
        for (int i = 0; i < gridSize; i++) {
            ExecutionContext context = new ExecutionContext();
            long start = minId + (i * partitionSize);
            long end = minId + ((i + 1) * partitionSize);
            
            context.putLong("minId", start);
            context.putLong("maxId", end);
            
            partitions.put("partition_" + i, context);
        }
        
        return partitions;
    }
}
```

#### Error Handling & Rollback

```java
@Component
public class JobCompletionListener implements JobExecutionListener {
    
    @Autowired
    private SettlementRepository settlementRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.FAILED) {
            // Rollback all changes made during this job
            rollbackSettlement(jobExecution.getJobInstance().getId());
            
            // Notify operations team immediately
            notificationService.alertOperations(
                "CRITICAL: EOD Settlement Failed\n" +
                "Job ID: " + jobExecution.getId() + "\n" +
                "Reason: " + 
                jobExecution.getExitStatus().getExitDescription()
            );
            
            log.error("EOD Settlement failed: {}", 
                jobExecution.getExitStatus().getExitDescription());
        } else {
            log.info("EOD Settlement completed successfully");
            notificationService.notifySuccess(
                "EOD Settlement complete for " + LocalDate.now()
            );
        }
    }
    
    private void rollbackSettlement(Long jobId) {
        // Restore accounts to pre-settlement state using savepoints
        settlementRepository.rollbackByJobId(jobId);
    }
}
```

#### Chunk Listener for Monitoring

```java
@Component
public class ChunkListener implements ChunkListener {
    
    @Override
    public void afterChunk(ChunkContext context) {
        int itemsProcessed = context.getStepContext()
            .getStepExecution()
            .getWriteCount();
        
        log.info("Processed {} transactions in chunk", itemsProcessed);
    }
    
    @Override
    public void onChunkError(ChunkContext context, Throwable throwable) {
        log.error("Chunk processing failed", throwable);
    }
}
```

### Scheduling the Batch Job

```java
@Component
public class EODScheduler {
    
    @Autowired
    private JobLauncher jobLauncher;
    
    @Autowired
    @Qualifier("eodSettlementJob")
    private Job eodSettlementJob;
    
    @Scheduled(cron = "0 30 23 * * ?")  // Run at 11:30 PM daily
    public void scheduleEODSettlement() throws Exception {
        JobParameters jobParameters = new JobParametersBuilder()
            .addLocalDateTime("runTime", LocalDateTime.now())
            .toJobParameters();
        
        JobExecution execution = jobLauncher.run(
            eodSettlementJob, 
            jobParameters
        );
        
        log.info("EOD Settlement job started: {}", execution.getId());
    }
}
```

### Performance Optimization

- **Chunk Size:** 1000 (balance between memory and batch round trips)
- **Partitions:** 10 (one per CPU core)
- **Connection Pooling:** Use HikariCP with proper sizing
- **Monitoring:** Use Spring Batch Admin to track job execution

### Banking Context

Essential for daily reconciliation and settlement in Cambodia's banking system with millions of daily transactions. Must complete within 2-hour window before the next business day begins.

---

## Interview Tips for Senior Developers

1. **Think out loud** - Explain your approach before coding
2. **Discuss trade-offs** - Time vs space, consistency vs availability
3. **Ask clarifying questions** - Constraints, scale, existing infrastructure
4. **Show domain knowledge** - Reference NBC regulations, SWIFT, FAST
5. **Consider edge cases** - Concurrent users, network failures, data corruption
6. **Production-ready code** - Error handling, logging, monitoring
7. **Cambodian banking specifics** - Multi-currency (KHR/USD), local regulations
8. **Emphasize scalability** - System must handle millions of daily transactions
9. **Mention testing** - Unit tests, integration tests, load testing
10. **Discuss monitoring** - APM tools, alerting, SLOs

---

## Key Banking Concepts for Cambodia

- **NBC:** National Bank of Cambodia - regulatory authority
- **FAST:** Faster and Secured Transfers - local interbank system
- **SWIFT:** Society for Worldwide Interbank Financial Telecommunication
- **Multi-currency:** KHR (Cambodian Riel) and USD widely used
- **PCI-DSS:** Payment Card Industry Data Security Standard
- **AML/KYC:** Anti-Money Laundering / Know Your Customer compliance
- **Settlement:** End-of-day reconciliation of all transactions

---

Good luck with your interview! 🚀
