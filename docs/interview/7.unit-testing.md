# Unit Testing & QA — Senior Backend Interview Guide

**Master testing strategies, automation, and quality assurance for production banking systems.** Each answer: simple explanation → problem → solution → professional code → interview tip.

---

## Quick Reference — 28 Core Topics

| # | Topic | Key Concept | Level |
|---|-------|-------------|-------|
| 1 | Testing Pyramid | Unit/Integration/E2E balance | ⭐⭐⭐ |
| 2 | Unit Testing | @Mock, isolated, fast | ⭐⭐⭐ |
| 3 | Integration Testing | @SpringBootTest slices | ⭐⭐⭐ |
| 4 | Mockito vs MockBean | Isolation vs context | ⭐⭐⭐ |
| 5 | Test Data Builders | Fluent test setup | ⭐⭐ |
| 6 | Parameterized Tests | Multiple scenarios | ⭐⭐ |
| 7 | Testcontainers | Real DB/Kafka/Redis | ⭐⭐⭐ |
| 8 | WireMock | HTTP stubbing | ⭐⭐ |
| 9 | Async Testing | @Async, Awaitility | ⭐⭐⭐ |
| 10 | Reactive Testing | StepVerifier, reactor | ⭐⭐⭐ |
| 11 | Kafka Testing | @EmbeddedKafka | ⭐⭐⭐ |
| 12 | Contract Testing | Pact, Spring Cloud Contract | ⭐⭐⭐ |
| 13 | Code Coverage | JaCoCo, meaningful % | ⭐⭐ |
| 14 | Mutation Testing | PIT, test quality | ⭐⭐⭐ |
| 15 | Test-Driven Development | Red-Green-Refactor | ⭐⭐ |
| 16 | Fixtures & Factories | Reusable test data | ⭐⭐ |
| 17 | Performance Testing | JMH, load testing | ⭐⭐ |
| 18 | Security Testing | SQL injection, XSS | ⭐⭐ |
| 19 | Flaky Test Detection | Probabilistic failures | ⭐⭐ |
| 20 | Test Isolation | No shared state | ⭐⭐⭐ |
| 21 | AssertJ Fluent API | Readable assertions | ⭐⭐ |
| 22 | MockMvc | Controller testing | ⭐⭐⭐ |
| 23 | RestAssured | API testing DSL | ⭐⭐ |
| 24 | Database Rollback | @Transactional test | ⭐⭐ |
| 25 | Error Path Testing | Exception handling | ⭐⭐⭐ |
| 26 | Continuous Integration | Pipeline quality gates | ⭐⭐⭐ |
| 27 | Test Documentation | Why, not just what | ⭐⭐ |
| 28 | Banking Test Scenarios | Idempotency, audit trails | ⭐⭐⭐ |

---

## Testing Fundamentals

### Q1: Testing Pyramid (Unit/Integration/E2E)

**The simple answer:**
Build many unit tests (fast, cheap), some integration tests (slower), few E2E tests (slow, expensive). Ratio: 70/20/10.

**The problem:**
Too many E2E tests → slow feedback loop, hard to debug failures. Too many unit tests with trivial coverage → wasteful. Wrong balance kills productivity.

**The Pyramid:**

```
        ▲
       ╱│╲
      ╱ │ ╲          E2E (Few, 5-10%): Full user journeys, cross-service
     ╱  │  ╲         Slow (~30s), fragile, expensive
    ╱───┼───╲
   ╱Integration╲      Integration (Some, 20-25%): Service + repository,
  ╱    │     ╲    Controller + service, multiple components
 ╱  ────|────  ╲   Medium speed (~100ms), moderate brittleness
╱─────Unit──────╲
                      Unit (Most, 65-75%): Single class, all deps mocked
                      Fast (<10ms), isolated, deterministic
```

**Implementation (Spring Boot):**

```java
// ✅ Unit Test: Pure business logic, @Mock dependencies
@ExtendWith(MockitoExtension.class)
class MoneyTransferServiceTest {
    @Mock private AccountRepository accountRepo;
    @Mock private AuditService auditService;
    @InjectMocks private MoneyTransferService transferService;

    @Test
    void shouldTransferMoneyWhenSufficientBalance() {
        // Arrange
        Account source = new Account("ACC001", BigDecimal.valueOf(1000));
        Account target = new Account("ACC002", BigDecimal.ZERO);
        
        when(accountRepo.findById("ACC001")).thenReturn(Optional.of(source));
        when(accountRepo.findById("ACC002")).thenReturn(Optional.of(target));
        
        // Act
        transferService.transfer("ACC001", "ACC002", BigDecimal.valueOf(100));
        
        // Assert
        assertThat(source.getBalance()).isEqualTo(BigDecimal.valueOf(900));
        assertThat(target.getBalance()).isEqualTo(BigDecimal.valueOf(100));
        verify(auditService).log(any());
    }
    // Time: <5ms, fully isolated
}

// ✅ Integration Test: Service + real repository (or slice)
@SpringBootTest
@Transactional  // rollback after each test
class MoneyTransferServiceIT {
    @Autowired private MoneyTransferService transferService;
    @Autowired private AccountRepository accountRepo;
    
    @Test
    void shouldPersistTransferToDatabase() {
        Account source = accountRepo.save(new Account("ACC001", BigDecimal.valueOf(1000)));
        accountRepo.save(new Account("ACC002", BigDecimal.ZERO));
        
        transferService.transfer(source.getId(), "ACC002", BigDecimal.valueOf(100));
        
        Account updated = accountRepo.findById(source.getId()).get();
        assertThat(updated.getBalance()).isEqualTo(BigDecimal.valueOf(900));
    }
    // Time: ~100-300ms, tests actual DB behavior
}

// ✅ E2E Test: Full HTTP flow
@SpringBootTest(webEnvironment = RANDOM_PORT)
class MoneyTransferControllerE2E {
    @Autowired private TestRestTemplate restTemplate;
    
    @Test
    void shouldTransferMoneyViaHttp() {
        TransferRequest req = new TransferRequest("ACC001", "ACC002", 100);
        ResponseEntity<Void> response = restTemplate.postForEntity(
            "/api/transfers",
            req,
            Void.class
        );
        
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        // Verify DB was updated
    }
    // Time: 500ms-2s, tests entire stack
}
```

**Coverage strategy (not a target, a guideline):**

```java
// ✅ Aim for 80% line coverage as a healthy target
// ✅ 100% coverage on critical paths: auth, payment, audit
// ❌ Don't chase 100% coverage on trivial code (getters, setters)
// ✅ Use mutation testing (PIT) to verify test quality

// Example: Critical 100%, general 70%
if (amount.signum() <= 0) {
    throw new InvalidAmountException();  // ✅ Must test this
}
```

**Interview tip:**
"Balance matters more than count. 100 weak tests passing on H2 mislead you. Focus on scenario coverage: happy path, edge cases, error paths. Mutation testing reveals weak tests."

---

### Q2: @Mock vs @MockBean (Isolation vs Context)

**The simple answer:**
`@Mock` (Mockito) = pure, no Spring. `@MockBean` (Spring Boot Test) = replaces bean in context. Use `@Mock` for unit tests, `@MockBean` for integration tests.

**The problem:**
`@MockBean` starts the full Spring context (~1-2s). `@Mock` is instant. Using `@MockBean` for every test wastes time. Using `@Mock` for Spring integration tests gives false negatives.

**Comparison:**

| Aspect | @Mock | @MockBean |
|--------|-------|----------|
| Spring context | Not required | Requires full context |
| Speed | <10ms | 500ms-2s (context startup) |
| Dependencies | Mockito only | Spring Boot Test |
| When to use | Pure unit tests | Spring integration tests |
| Replaces in | Test class only | Application context |

**Implementation:**

```java
// ❌ WRONG: Heavy context startup for simple unit test
@SpringBootTest
class PaymentServiceTest {
    @MockBean private PaymentGateway gateway;  // Overkill!
    // Context startup: ~1.5s
    
    @Test
    void shouldRetryOn503() { ... }  // Test runs in 2s total (1.5s startup + 0.5s test)
}

// ✅ RIGHT: Pure Mockito, instant execution
@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {
    @Mock private PaymentGateway gateway;
    @InjectMocks private PaymentService service;
    // No context startup
    
    @Test
    void shouldRetryOn503() {
        when(gateway.charge(any())).thenThrow(new ServiceUnavailableException());
        
        service.processPayment(testPayment());  // Direct method call
        
        verify(gateway, times(3)).charge(any());  // Verified retry
    }
    // Test runs in <10ms
}

// ✅ CORRECT: Use @MockBean only when you need Spring features
@SpringBootTest
@Transactional
class PaymentServiceIT {
    @MockBean private ExternalPaymentGateway gateway;  // External API must be mocked
    @Autowired private PaymentService service;       // Real service
    @Autowired private OrderRepository orderRepo;    // Real DB
    
    @Test
    void shouldPersistOrderAndChargeCard() {
        when(gateway.charge(any())).thenReturn(new ChargeResponse("SUCCESS"));
        
        service.processOrder(order);
        
        // Verify entire flow was persisted
        assertThat(orderRepo.findById(order.getId()).get().getStatus())
            .isEqualTo("PAID");
    }
}
```

**Rule of thumb:**

```
Pure domain logic test               → @Mock
+ Repository + Service test          → @MockBean (only external APIs/services)
+ Controller + HTTP test             → @MockBean
Real integration (actual DB/message) → Testcontainers + real beans
```

**Interview tip:**
"Start with @Mock for 99% of tests. Reach for @MockBean only when you genuinely need Spring infrastructure (transactions, dependency injection, aspect weaving). Measure test execution time—slow tests get skipped."

---

### Q3: Parameterized Tests (Multiple Scenarios)

**The simple answer:**
Run the same test with different inputs without copying code. One test method, many assertions.

**The problem:**
Testing all edge cases (null, empty, max, negative, unicode) repetitively creates massive test classes. Parameterized tests compress them.

**Implementation:**

```java
class MoneyTransferValidationTest {
    
    // ❌ Without parameterization: repetitive, hard to maintain
    @Test
    void shouldRejectNegativeAmount() { ... }
    @Test
    void shouldRejectZeroAmount() { ... }
    @Test
    void shouldRejectNullAmount() { ... }
    @Test
    void shouldRejectAmountExceedingMax() { ... }
    
    // ✅ With JUnit 5 parameterization: concise, maintainable
    @ParameterizedTest(name = "{0}")
    @ValueSource(strings = {"-100", "0", "999999999999"})
    void shouldRejectInvalidAmounts(String amountStr) {
        BigDecimal amount = new BigDecimal(amountStr);
        
        InvalidAmountException exception = assertThrows(
            InvalidAmountException.class,
            () -> transferService.validateAmount(amount)
        );
        
        assertThat(exception.getMessage()).contains("Invalid amount");
    }
    
    // ✅ CSV data provider
    @ParameterizedTest(name = "{0} + {1} = {2}")
    @CsvSource({
        "100, 200, 300",
        "0, 100, 100",
        "100.50, 99.50, 200",
    })
    void shouldCalculateTotalCorrectly(String val1, String val2, String expected) {
        BigDecimal result = calculate(new BigDecimal(val1), new BigDecimal(val2));
        assertThat(result).isEqualByComparingTo(new BigDecimal(expected));
    }
    
    // ✅ Method source for complex objects
    @ParameterizedTest
    @MethodSource("provideValidAccounts")
    void shouldProcessValidAccounts(Account account) {
        assertDoesNotThrow(() -> accountService.validate(account));
    }
    
    private static Stream<Account> provideValidAccounts() {
        return Stream.of(
            new Account("ACC001", BigDecimal.valueOf(1000), "ACTIVE"),
            new Account("ACC002", BigDecimal.ZERO, "ACTIVE"),
            new Account("ACC003", BigDecimal.valueOf(999999), "ACTIVE")
        );
    }
}
```

**Interview tip:**
"Parameterized tests reduce boilerplate 10x. Use @ValueSource for simple types, @CsvSource for tuples, @MethodSource for complex objects. Improves readability and maintainability."

---

## Advanced Testing

### Q4: Testcontainers (Real Services, Not H2)

**The simple answer:**
Testcontainers spins up real Docker containers (PostgreSQL, Redis, Kafka) during tests. Eliminates H2 false positives.

**The problem:**
H2 lacks JSONB, window functions, custom types, syntax differences. Tests pass on H2 but fail in production → expensive false confidence.

**Implementation:**

```java
@Testcontainers
@SpringBootTest
class TransactionRepositoryIT {
    
    // Real PostgreSQL container, fresh for each test
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("banking_test")
        .withUsername("test")
        .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Autowired private TransactionRepository transactionRepo;
    @Autowired private TestEntityManager entityManager;
    
    @Test
    void shouldPersistAndQueryJsonbMetadata() {
        Transaction txn = new Transaction();
        txn.setAmount(BigDecimal.valueOf(100));
        txn.setMetadata(Map.of(
            "source", "mobile_app",
            "device_id", "iPhone14",
            "location", "Phnom Penh"
        ));
        
        transactionRepo.save(txn);
        entityManager.flush();
        
        // JSONB query that fails on H2!
        Transaction found = transactionRepo.findByMetadataSourceQuery("mobile_app");
        assertThat(found).isNotNull();
    }
    
    @Test
    void shouldUseWindowFunctionsForRanking() {
        // Window functions: unavailable on H2
        List<TransactionRank> ranked = transactionRepo
            .findRankedTransactionsByAmount(BigDecimal.valueOf(1000));
        
        assertThat(ranked).isNotEmpty();
    }
}

// Repository with native JSONB and window function queries
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query(value = """
        SELECT t.* FROM transactions t
        WHERE t.metadata->>'source' = :source
        LIMIT 1
        """, nativeQuery = true)
    Transaction findByMetadataSourceQuery(@Param("source") String source);
    
    @Query(value = """
        SELECT id, amount,
               ROW_NUMBER() OVER (ORDER BY amount DESC) as rank
        FROM transactions
        WHERE amount > :threshold
        """, nativeQuery = true)
    List<TransactionRank> findRankedTransactionsByAmount(@Param("threshold") BigDecimal threshold);
}
```

**Docker Compose for complex setups:**

```java
@Testcontainers
class BankingServiceIT {
    
    @Container
    static DockerComposeContainer<?> compose = new DockerComposeContainer<>(
        new File("src/test/resources/docker-compose.test.yml")
    )
        .withExposedService("postgres", 5432)
        .withExposedService("kafka", 9092)
        .withExposedService("redis", 6379);
    
    // Now test full stack: DB + message broker + cache
}
```

**Interview tip:**
"Testcontainers costs ~500ms startup per service, but guarantees production-like behavior. Use for critical paths. Fast unit tests with @Mock stay under 100ms."

---

### Q5: Async & Reactive Testing

**The simple answer:**
Blocking tests fail on async code. Use `Awaitility` for `@Async` methods, `StepVerifier` for reactive streams.

**Testing @Async methods:**

```java
@Service
public class TransactionProcessingService {
    
    public CompletableFuture<String> processTransactionAsync(Transaction txn) {
        return CompletableFuture.supplyAsync(() -> {
            // Long operation (2s)
            Thread.sleep(2000);
            return "PROCESSED";
        });
    }
}

@SpringBootTest
class TransactionServiceAsyncTest {
    @Autowired private TransactionProcessingService service;
    
    // ❌ WRONG: Returns immediately without waiting for async
    @Test
    void shouldProcessAsync_Bad() throws Exception {
        CompletableFuture<String> future = service.processTransactionAsync(txn);
        // Future still computing! Result not ready yet
        assertThat(future.get()).isEqualTo("PROCESSED");  // Flaky if timing off
    }
    
    // ✅ RIGHT: Use Awaitility with configurable polling
    @Test @EnableAutoConfiguration
    void shouldProcessAsync_Good() {
        service.processTransactionAsync(txn);
        
        await()
            .atMost(Duration.ofSeconds(5))
            .pollInterval(Duration.ofMillis(100))
            .until(() -> transactionRepo.findById(txn.getId())
                                       .map(t -> "PROCESSED".equals(t.getStatus()))
                                       .orElse(false));
    }
}
```

**Testing Reactive Streams (Project Reactor):**

```java
@Service
public class TransactionStreamService {
    
    public Flux<Transaction> streamTransactions(String accountId) {
        return Flux.generate(sink -> {
            sink.next(new Transaction("TXN001", BigDecimal.valueOf(100)));
            sink.next(new Transaction("TXN002", BigDecimal.valueOf(200)));
            sink.complete();
        });
    }
}

@SpringBootTest
class TransactionStreamTest {
    @Autowired private TransactionStreamService streamService;
    
    @Test
    void shouldStreamTransactionsInOrder() {
        Flux<Transaction> stream = streamService.streamTransactions("ACC001");
        
        StepVerifier.create(stream)
            .expectNextMatches(t -> t.getAmount().equals(BigDecimal.valueOf(100)))
            .expectNextMatches(t -> t.getAmount().equals(BigDecimal.valueOf(200)))
            .expectComplete()
            .verify(Duration.ofSeconds(5));
    }
    
    @Test
    void shouldErrorOnInvalidAccount() {
        Flux<Transaction> stream = streamService.streamTransactions(null);
        
        StepVerifier.create(stream)
            .expectError(IllegalArgumentException.class)
            .verify(Duration.ofSeconds(5));
    }
}
```

**Testing Kafka Messages (async consumption):**

```java
@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"transactions"})
class TransactionKafkaConsumerIT {
    @Autowired private KafkaTemplate<String, TransactionEvent> kafkaTemplate;
    @Autowired private TransactionRepository transactionRepo;
    
    @Test
    void shouldConsumeAndPersistTransactionEvent() throws Exception {
        TransactionEvent event = new TransactionEvent("ACC001", BigDecimal.valueOf(100));
        
        kafkaTemplate.send("transactions", "TXN001", event).get();  // Send and wait for ack
        
        await()
            .atMost(Duration.ofSeconds(5))
            .until(() -> transactionRepo.findById("TXN001").isPresent());
        
        Transaction persisted = transactionRepo.findById("TXN001").get();
        assertThat(persisted.getAmount()).isEqualByComparingTo(BigDecimal.valueOf(100));
    }
}
```

**Interview tip:**
"Never use Thread.sleep() in tests—flaky and slow. Awaitility for @Async, StepVerifier for Reactor, @EmbeddedKafka for message testing. All offer timeout + polling."

---

## Banking-Specific Testing

### Q6: Idempotency & Transaction Integrity Testing

**The simple answer:**
Banking operations must be idempotent: running twice with the same ID must give the same result as running once. Test this explicitly.

**Implementation:**

```java
@SpringBootTest
@Transactional
class MoneyTransferIdempotencyTest {
    @Autowired private MoneyTransferService transferService;
    @Autowired private AccountRepository accountRepo;
    
    @Test
    void shouldBeIdempotentWithIdempotencyKey() {
        String idempotencyKey = UUID.randomUUID().toString();
        Account source = accountRepo.save(new Account("ACC001", BigDecimal.valueOf(1000)));
        Account target = accountRepo.save(new Account("ACC002", BigDecimal.ZERO));
        
        // First call
        TransferResult result1 = transferService.transfer(
            source.getId(), target.getId(), BigDecimal.valueOf(100), idempotencyKey
        );
        
        // Second call with same idempotency key
        TransferResult result2 = transferService.transfer(
            source.getId(), target.getId(), BigDecimal.valueOf(100), idempotencyKey
        );
        
        // Should return same result and maintain balances
        assertThat(result1.getTransferId()).isEqualTo(result2.getTransferId());
        
        Account sourceAfter = accountRepo.findById(source.getId()).get();
        Account targetAfter = accountRepo.findById(target.getId()).get();
        
        assertThat(sourceAfter.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(900));  // Only deducted once
        assertThat(targetAfter.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(100)); // Only added once
    }
    
    @Test
    void shouldFailIfAmountsConflictWithIdempotencyKey() {
        String idempotencyKey = UUID.randomUUID().toString();
        
        // First transfer: 100
        transferService.transfer(accRes, accDest, BigDecimal.valueOf(100), idempotencyKey);
        
        // Second call: different amount, same key
        IdempotencyConflictException exception = assertThrows(
            IdempotencyConflictException.class,
            () -> transferService.transfer(accRes, accDest, BigDecimal.valueOf(200), idempotencyKey)
        );
        
        assertThat(exception.getMessage()).contains("Conflict");
    }
}

// Service implementing idempotency
@Service
public class MoneyTransferService {
    
    @Autowired private IdempotencyKeyStore idempotencyStore;
    @Autowired private MoneyTransferRepository transferRepo;
    
    @Transactional
    public TransferResult transfer(String fromId, String toId, BigDecimal amount, String idempotencyKey) {
        // Check if already processed
        Optional<TransferResult> cached = idempotencyStore.getResult(idempotencyKey);
        if (cached.isPresent()) {
            return cached.get();  // Return cached result
        }
        
        // Execute transfer
        Transfer transfer = new Transfer(fromId, toId, amount);
        Transfer saved = transferRepo.save(transfer);
        
        TransferResult result = new TransferResult(saved.getId());
        
        // Store result before committing (survive process crash)
        idempotencyStore.storeResult(idempotencyKey, result);
        
        return result;
    }
}
```

**Testing Saga Compensation (Distributed Transactions):**

```java
@SpringBootTest
class TransferSagaCompensationTest {
    
    @Test
    void shouldCompensateOnPaymentFailure() {
        Account source = setupAccount("ACC001", BigDecimal.valueOf(1000));
        Account dest = setupAccount("ACC002", BigDecimal.ZERO);
        
        // Step 1: Reserve funds (succeeds)
        // Step 2: Charge card (fails)
        // Step 3: Should reverse Step 1 (Compensation)
        
        when(paymentGateway.charge(any())).thenThrow(new PaymentDeclinedException());
        
        PaymentException ex = assertThrows(PaymentException.class,
            () -> sagaService.executeTransfer(source, dest, BigDecimal.valueOf(100)));
        
        // Verify compensation: funds returned
        Account sourceAfter = accountRepo.findById(source.getId()).get();
        assertThat(sourceAfter.getBalance()).isEqualByComparingTo(BigDecimal.valueOf(1000));
    }
}
```

**Interview tip:**
"Idempotency is non-negotiable in banking. Test: duplicate calls with same ID return same result, no double-charges. Test compensation when distributed steps fail."

---

## Summary Interview Checklist

- [ ] **Testing pyramid**: 70% unit, 20% integration, 10% E2E
- [ ] **Mockito vs Spring**: @Mock for unit tests, @MockBean for integration
- [ ] **Parameterized tests**: @ValueSource, @CsvSource, @MethodSource
- [ ] **Testcontainers**: Real DB/Kafka/Redis, not H2
- [ ] **Async testing**: Awaitility for @Async, StepVerifier for Reactor
- [ ] **Kafka testing**: @EmbeddedKafka with proper polling
- [ ] **Idempotency**: Test duplicate calls with same ID
- [ ] **Compensation**: Test rollback/reversal in distributed transactions
- [ ] **Error paths**: Every exception should have a test
- [ ] **Database state**: @Transactional rollback, avoid shared state
- [ ] **Mutation testing**: PIT to verify test quality
- [ ] **Code coverage**: 80% general, 100% critical (auth, payment, audit)

---

## Banking Test Scenarios

| Scenario | Pattern | Tools |
|----------|---------|-------|
| **Idempotent transfers** | Idempotency key + result cache | Testcontainers + @Transactional |
| **Saga failure & compensation** | Distributed transaction testing | @MockBean + verify |
| **Concurrent deposits** | Pessimistic lock, race condition | Testcontainers + concurrent threads |
| **Audit trail completeness** | Event sourcing verification | Query DB for events |
| **Rate limiting enforcement** | Sliding window testing | Time-based mocking |
| **Multi-currency conversion** | Exchange rate consistency | ParameterizedTest + edge cases |
| **Account closure cascade** | Referential integrity | Testcontainers + cascade rules |
