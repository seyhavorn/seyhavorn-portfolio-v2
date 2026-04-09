# Spring Boot Interview Guide — Progressive Detail

**Quick reference for Spring Boot questions.** Master these 15 core concepts.

---

## Core Concepts at a Glance

| # | Topic | Key Point |
|---|-------|-----------|
| 1 | Dependency Injection (DI) | **Constructor injection is preferred** |
| 2 | Auto-configuration | **@ConditionalOnClass, @ConditionalOnMissingBean** |
| 3 | Spring Security | **Stateless JWT flow** |
| 4 | Actuator | **Secure it; use separate port in prod** |
| 5 | DB Migrations | **Expand-Contract pattern for zero downtime** |
| 6 | Transactional Pitfalls | **Self-invocation, exception types, long transactions** |
| 7 | Bean Lifecycle | **Understand all 8 phases** |
| 8 | Profiles | **Dev/staging/prod configs** |
| 9 | Exception Handling | **@RestControllerAdvice for centralized errors** |
| 10 | Caching | **@Cacheable, @CachePut, @CacheEvict** |
| 11 | AOP | **@Aspect for cross-cutting concerns** |
| 12 | Testing Slices | **@DataJpaTest, @WebMvcTest, @SpringBootTest** |
| 13 | Spring Cloud | **Service discovery, config, circuit breaker** |
| 14 | @Async | **Configure ThreadPoolTaskExecutor properly** |
| 15 |Null Safety| **@NonNull, @Nullable annotations** |

---

## Q1. Dependency Injection (DI) & Spring Stereotypes

**Simple answer:**
DI means your dependencies are provided to you, not created inside. Spring manages this.

### The Annotations

**@Component** — Generic Spring-managed bean  
**@Service** — Business logic (same as @Component, just semantics)  
**@Repository** — Data access (wraps exceptions into Spring's @repository.DataAccessException)  
**@Controller** — Web handlers (for MVC, returns views)  
**@RestController** — Web handlers (for REST,returns JSON via @ResponseBody)  

### Injection Styles

```java
// 1. Constructor injection (PREFERRED — immutable, testable)
@Service
public class OrderService {
    private final OrderRepository repo;
    
    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }
}

// 2. Field injection (NOT RECOMMENDED — harder to test)
@Service
public class OrderService {
    @Autowired
    private OrderRepository repo;
}

// 3. Setter injection (for optional dependencies)
@Service
public class OrderService {
    private OrderRepository repo;
    
    @Autowired
    public void setRepository(OrderRepository repo) {
        this.repo = repo;
    }
}
```

### Bean Scopes

| Scope | Meaning | Use Case |
|-------|---------|----------|
| `singleton` (default) | One instance per context | Services, repositories |
| `prototype` | New instance per injection | Stateful objects |
| `request` | One per HTTP request | Web-specific state |
| `session` | One per session | User-specific data |

**Interview tip:** Constructor injection is "best practice" because it makes dependencies explicit and objects immutable.

---

## Q2. Spring Boot Auto-Configuration

**Simple answer:**
Spring Boot automatically configures beans based on what's on your classpath. You don't need boilerplate XML.

### How It Works

1. `@SpringBootApplication` includes `@EnableAutoConfiguration`
2. Spring scans `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
3. Each entry is a `@Configuration` class with conditions:
   - `@ConditionalOnClass` — Only if a class exists
   - `@ConditionalOnMissingBean` — Only if no custom bean exists
   - `@ConditionalOnProperty` — Only if config property is set

### Example

```java
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
@ConditionalOnProperty(name="spring.datasource.url")
public class DataSourceAutoConfiguration {
    @Bean
    public DataSource dataSource() { ... }
}
```

### Debugging

Run with `--debug` flag:
```bash
java -jar app.jar --debug
```
Prints a report of which auto-configurations were applied and why.

### Overriding

Define your own bean → `@ConditionalOnMissingBean` ensures Spring's default is skipped.

```java
@Bean
public DataSource myDataSource() {  // Spring won't auto-configure if you define this
    return new MyCustomDataSource();
}
```

**Interview tip:** Auto-configuration is magic if you understand the conditions.

---

## Q3. Spring Security & JWT

**Simple answer:**
Spring Security handles authentication (who are you?) and authorization (what can you access?).

### Authentication Flow

1. Request hits `SecurityFilterChain`
2. `UsernamePasswordAuthenticationFilter` extracts credentials
3. `AuthenticationManager` → `AuthenticationProvider`
4. Provider calls `UserDetailsService.loadUserByUsername()`
5. Password validated; `Authentication` stored in `SecurityContextHolder`

###JWT Implementation

```java
// 1. Custom JWT filter
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, 
                                   HttpServletResponse res,
                                   FilterChain filterChain) {
        String token = extractToken(req);  // From "Authorization: Bearer xxx"
        
        if (token != null && jwtUtil.isValid(token)) {
            String username = jwtUtil.getUsername(token);
            List<GrantedAuthority> roles = jwtUtil.getAuthorities(token);
            
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(username, null, roles);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        filterChain.doFilter(req, res);
    }
}

// 2. Configure as stateless (no sessions)
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http.sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests()
            .requestMatchers("/public/**").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated();
        return http.build();
    }
}
```

### Token Strategy for Banking

- **Access token:** 15 minutes (short-lived)
- **Refresh token:** 7 days (long-lived, stored in DB for revocation)
- **Token refresh endpoint:** Exchange refresh token for new access token

**Interview tip:** Explain the stateless JWT flow; mention refresh token strategy.

---

## Q4. Spring Boot Actuator

**Simple answer:**
Actuator exposes HTTP endpoints for monitoring and metrics. Secure it in production.

### Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/actuator/health` | Application health (DB, disk, custom checks) |
| `/actuator/metrics` | JVM, HTTP, business metrics |
| `/actuator/info` | App version, git commit, metadata |
| `/actuator/env` | Environment properties |
| `/actuator/logs` | View/change log levels at runtime |
| `/actuator/threaddump` | JVM thread dump (for debugging) |
| `/actuator/httptrace` | Recent HTTP requests |

### Securing in Production

**Option 1: Restrict via Spring Security**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,info
  endpoint:
    health:
      show-details: when-authorized
```

**Option 2: Separate management port (RECOMMENDED)**
```yaml
management:
  server:
    port: 8081  # Not exposed externally; internal access only
  endpoints:
    web:
      exposure:
        include: "*"
```

### Integration with Prometheus

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

Expose at `/actuator/prometheus` → Prometheus scrapes → Grafana visualizes.

**Interview tip:** Always mention securing actuator in prod. Exposing "/env" exposes secrets!

---

## Q5. Database Migrations (Zero-Downtime Pattern)

**Challenge:**
Old and new app versions run simultaneously during rolling deployment. Migrations must be compatible with both.

### Expand-Contract Pattern

**Phase 1 — Expand (backward compatible)**
```sql
-- Safe: nullable column, no constraint
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
```
Both old (ignores new column) and new app versions work.

**Phase 2 — Migrate Data** (separate operation)
```sql
-- Can run as background job
UPDATE users SET full_name = first_name || ' ' || last_name;
```

**Phase 3 — Contract** (only after old version fully retired)
```sql
-- Safe: new version required it; old version gone
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE users DROP COLUMN first_name;
ALTER TABLE users DROP COLUMN last_name;
```

### Rules

❌ Don't drop/rename columns in same release that removes their usage  
❌ Don't add NOT NULL columns without defaults  
✅ Test migrations against production-sized datasets  
✅ Use Flyway or Liquibase with Spring Boot (auto-runs on startup)  

**Interview tip:** Show you understand the complexity of zero-downtime deployments.

---

## Q6. @Transactional Pitfalls (CRITICAL FOR BANKING)

**Pitfall 1: Self-invocation (MOST COMMON)**

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

Spring's `@Transactional` works via AOP proxies. Internal calls bypass the proxy.

**Fix:**
```java
@Service
public class OrderService {
    @Autowired
    private OrderService self;  // Inject itself
    
    public void process() {
        self.save();  // Now goes through proxy
    }
    
    @Transactional
    public void save() { ... }
}
```

**Pitfall 2: Wrong exception type**

```java
@Transactional  // Only rolls back on RuntimeException by default!
public void process() throws IOException {
    repo.save(entity);
    throw new IOException("Failed");  // Transaction COMMITS!
}
```

**Fix:**
```java
@Transactional(rollbackFor = Exception.class)
```

**Pitfall 3: Private or final methods**

Proxies can't override `private` or `final` methods. Use public methods.

**Pitfall 4: Missed read-only optimization**

```java
@Transactional(readOnly = true)
public List<Order> findAll() { ... }
```

`readOnly=true` disables Hibernate dirty checking and enables read replicas.

**Pitfall 5: Long-running transactions**

```java
@Transactional
public void process() {
    saveToDb();
    callExternalAPI();  // Blocks DB connection while waiting!
}
```

**Fix:** Call external APIs outside the transaction.

```java
public void process() {
    saveToDb();        // Transactional
    callExternalAPI(); // No transaction
}

@Transactional
private void saveToDb() { ... }
```

**Interview tip:** Self-invocation is the #1 cause of hidden bugs in Spring apps.

---

## Q7. Bean Lifecycle (8 Phases)

Understand this for debugging bean-related issues.

1. **Instantiation** — Constructor called; object created
2. **Populate Properties** — Dependency injection happens
3. **Set Bean Name** — Spring calls `setBeanName()` if implementing `BeanNameAware`
4. **BeanPostProcessor.postProcessBeforeInitialization()** — Just before init
5. **Initialization** — `@PostConstruct` methods called; `AfterPropertiesSet` interface
6. **Custom init-method** — Custom method specified in `@Bean(initMethod="...")"`
7. **BeanPostProcessor.postProcessAfterInitialization()** — AOP proxies created here
8. **Ready for use** — Bean lives in context
9. **Destruction** — When context closes:
   - `@PreDestroy` methods called
   - `DisposableBean.destroy()` called
   - Custom destroy-method called

**Interview tip:** This is rarely asked but shows deep Spring knowledge if mentioned.

---

## Q8. Spring Profiles (Dev/Staging/Prod)

**Simple answer:**
Profiles let you load different configurations per environment without rebuilding.

### Activate a Profile

```properties
# application.properties
spring.profiles.active=prod
```

```bash
# Or via command line
java -jar app.jar --spring.profiles.active=prod
export SPRING_PROFILES_ACTIVE=prod && java -jar app.jar
```

### Profile-Specific Config Files

```
application.properties          # Loaded always
application-dev.properties      # Loaded when profile=dev
application-staging.properties  # Loaded when profile=staging
application-prod.properties     # Loaded when profile=prod
```

### Profile-Specific Beans

```java
@Configuration
@Profile("prod")
public class ProdConfig {
    @Bean
    public CacheManager cacheManager() {
        return new RedisCacheManager(...);  // Prod: Redis
    }
}

@Configuration
@Profile("dev")
public class DevConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();  // Dev: In-memory
    }
}
```

### Banking Use Case

```yaml
# application-prod.yml
spring:
  datasource:
    url: [production-db]
    hikari:
      maximum-pool-size: 50
  redis:
    url: [production-redis]
logging:
  level: WARN
```

**Interview tip:** Show you understand config management across environments.

---

## Q9. Exception Handling (@RestControllerAdvice)

**Simple answer:**
Centralize exception handling across all controllers. Return consistent error responses.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse(404, "Resource not found", ex.getMessage());
    }
    
    @ExceptionHandler(TransactionException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleTransaction(TransactionException ex) {
        return new ErrorResponse(409, "Transaction failed", ex.getMessage());
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneric(Exception ex) {
        return new ErrorResponse(500, "Internal error", "Please contact support");
    }
}
```

### Banking Error Codes

```java
public enum BankingErrorCode {
    INSUFFICIENT_FUNDS(4001, "Account has insufficient funds"),
    ACCOUNT_LOCKED(4002, "Account is locked"),
    TRANSFER_LIMIT_EXCEEDED(4003, "Daily transfer limit exceeded"),
    INVALID_RECIPIENT(4004, "Recipient account does not exist"),
    SYSTEM_ERROR(5001, "Internal banking system error");
    
    private int code;
    private String message;
}
```

**Interview tip:** Banking requires specific error codes for client integration.

---

## Q10. Caching Strategies

**Simple answer:**
Cache expensive computations. Invalidate when data changes.

### Annotations

```java
// Load from cache if exists; otherwise compute and cache
@Cacheable(value = "users", key = "#id")
public User findById(Long id) { ... }

// Always compute and update cache
@CachePut(value = "users", key = "#user.id")
public User update(User user) { ... }

// Remove from cache
@CacheEvict(value = "users", key = "#id")
public void delete(Long id) { ... }

// Clear entire cache
@CacheEvict(value = "users", allEntries = true)
public void clearCache() { ... }
```

### Cache Providers

| Provider | Where | TTL | Use Case |
|----------|-------|-----|----------|
| ConcurrentMapCache | In-memory | None | Dev only |
| Caffeine | In-memory | Per entry | Single instance |
| Redis | Distributed | Configurable | Multi-instance |

### Banking: Cache with Caution

✅ **Safe to cache:** User profiles, account metadata, exchange rates  
❌ **NEVER cache:** Account balances, transaction history, permissions  

Why? Cached balance might show wrong amount to user.

**Interview tip:** Show you understand what's safe to cache in banking.

---

## Q11. Quick Remaining Topics

### AOP (Aspect-Oriented Programming)
- Separates cross-cutting concerns (logging, security) from business logic
- `@Aspect` + `@Around` for method timing
- Remember: Proxies, self-invocation issue

### Testing Slices
- `@DataJpaTest` — Test repositories only (no full context)
- `@WebMvcTest` — Test controllers only
- `@SpringBootTest` — Full integration test (slow)

### Spring Cloud
- **Service Discovery:** Eureka (find services dynamically)
- **Config Server:** Centralized configuration (Git-backed)
- **Circuit Breaker:** Resilience4j (fail gracefully)
- **Load Balancer:** Distribute requests across instances

### @Async
- Execute methods in separate thread
- Configure `ThreadPoolTaskExecutor` properly (don't use default)
- Return `CompletableFuture<T>` or `Future<T>`
- Doesn't work with self-invocation (same proxy issue)

---

---

## Laravel vs Spring Boot — Key Differences

This comparison helps if you're transitioning from Laravel or deciding between them.

### Quick Comparison Table

| Aspect | Laravel | Spring Boot |
|--------|---------|------------|
| **Language** | PHP | Java |
| **Type system** | Dynamic (loosely typed) | Static (strongly typed) |
| **Performance** | Good for small/medium apps | Excellent for high concurrency |
| **Learning curve** | Gentler | Steeper |
| **Package manager** | Composer | Maven/Gradle |
| **ORM** | Eloquent (intuitive) | Hibernate/JPA (powerful) |
| **Dependency Injection** | Service Container (simple) | Spring IoC (comprehensive) |
| **Testing** | PHPUnit, Pest | JUnit, Mockito, TestContainers |
| **Concurrency** | Single-threaded per request | Multi-threaded, async capable |
| **Transactions** | Simple but limited | Explicit, powerful @Transactional |
| **Banking use** | Not common | Industry standard |
| **Scaling** | Horizontal (more servers) | Vertical + horizontal |

---

### 1. Language & Type System

**Laravel:**
```php
// Loosely typed — PHP doesn't enforce types at compile time
public function transfer($amount, $account) {
    $balance = $this->getBalance($account);
    if ($balance >= $amount) {
        $this->debit($account, $amount);
    }
}

// Runtime errors can happen
transfer("abc", null);  // No error until execution
```

**Spring Boot:**
```java
// Strongly typed — compile-time checking
public void transfer(BigDecimal amount, Account account) {
    BigDecimal balance = this.getBalance(account);
    if (balance.compareTo(amount) >= 0) {
        this.debit(account, amount);
    }
}

// Compile error
transfer("abc", null);  // ❌ Type mismatch detected immediately
```

**Banking implication:** Type safety prevents entire classes of bugs. Spring's strict typing catches financial calculation errors at compile time.

---

### 2. Dependency Injection

**Laravel (Service Container):**
```php
// Simple but implicit
class OrderService {
    public function __construct(protected OrderRepository $repo) {}
}

// In container
app()->bind(OrderService::class, fn() => new OrderService(...));

// Usage (auto-resolved)
$service = app(OrderService::class);
```

**Spring Boot (Spring IoC Container):**
```java
// Constructor injection (explicit, testable)
@Service
public class OrderService {
    private final OrderRepository repo;
    
    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }
}

// Spring auto-wires it
@Autowired
private OrderService service;  // Fully initialized
```

**Key difference:** Spring IoC is more explicit and provides better control over bean lifecycle phases.

---

### 3. Database & ORM

**Laravel (Eloquent):**
```php
// Intuitive, readable
$users = User::where('balance', '>', 1000)
            ->with('accounts')  // Eager loading
            ->get();

// Migration
Schema::create('users', function(Blueprint $table) {
    $table->id();
    $table->string('email');
    $table->decimal('balance', 10, 2);
});

// Easy to understand, lower boilerplate
```

**Spring Boot (Hibernate/JPA):**
```java
// More verbose but more powerful
List<User> users = userRepository.findByBalanceGreaterThan(1000);
// Or custom query
@Query("SELECT u FROM User u WHERE u.balance > :balance")
List<User> findRichUsers(@Param("balance") BigDecimal balance);

// Entity definition
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal balance;
}

// Migration (Liquibase/Flyway)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    balance DECIMAL(10, 2)
);
```

**Banking context:**
- **Laravel:** Works fine for small systems
- **Spring Boot:** Better for complex domain models, multiple relationships, and strict consistency requirements

---

### 4. Concurrency & Performance

**Laravel (Request-per-thread model):**
```
Request 1 → Process → Response (entire thread blocks)
Request 2 → Process → Response (separate thread blocks)

Scaling = add more servers/processes (horizontal only)
```

**Spring Boot (JVM multi-threading):**
```
Request 1 → Handler → Async call → Response
Request 2 → Handler → Async call → Response

Both handled by same thread pool (vertical + horizontal scaling)
```

**Banking example:**
Payment API during salary day (10,000 requests/minute):
- **Laravel:** 10,000 child processes needed → high memory, high latency
- **Spring Boot:** Thread pool of 200, all requests queued efficiently → lower latency

---

### 5. Transactions & Data Consistency

**Laravel (Basic transactions):**
```php
DB::transaction(function () {
    Account::where('id', 1)->decrement('balance', 100);
    Account::where('id', 2)->increment('balance', 100);
});

// Simple but limited
// No @Transactional with rollbackFor conditions
// No distributed transaction support
```

**Spring Boot (Powerful @Transactional):**
```java
@Transactional(rollbackFor = {InsufficientFundsException.class})
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    Account from = accountRepo.findById(fromId).orElseThrow();
    Account to = accountRepo.findById(toId).orElseThrow();
    
    if (from.getBalance().compareTo(amount) < 0) {
        throw new InsufficientFundsException();  // Transaction rolls back
    }
    
    from.debit(amount);
    to.credit(amount);
}

// Distributed transaction support (Outbox pattern)
@Transactional
public void transferWithEvent(TransferRequest req) {
    accountRepo.debit(req.from(), req.amount());
    outboxRepo.save(new OutboxEvent("TRANSFER_INITIATED", req));
    // Event published after commit → at-most-once delivery
}

// Isolation levels
@Transactional(isolation = Isolation.SERIALIZABLE)
public void criticalTransfer() { ... }
```

**Banking implication:** Spring provides explicit transaction control critical for banking. Laravel is too simple for complex financial operations.

---

### 6. Testing

**Laravel:**
```php
// PHPUnit
public function test_transfer_success() {
    $from = User::factory()->create(['balance' => 1000]);
    $to = User::factory()->create(['balance' => 0]);
    
    transfer($from->id, $to->id, 100);
    
    $this->assertEquals(900, $from->fresh()->balance);
    $this->assertEquals(100, $to->fresh()->balance);
}
```

**Spring Boot:**
```java
// JUnit 5 + Mockito + TestContainers
@SpringBootTest
class TransferServiceTest {
    @Autowired
    private TransferService service;
    
    @Container
    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:15");
    
    @Test
    void testTransferSuccess() {
        User from = userRepo.save(new User(1000));
        User to = userRepo.save(new User(0));
        
        service.transfer(from.getId(), to.getId(), new BigDecimal("100"));
        
        assertEquals(new BigDecimal("900"), userRepo.findById(from.getId()).getBalance());
        assertEquals(new BigDecimal("100"), userRepo.findById(to.getId()).getBalance());
    }
}

// Slice testing
@DataJpaTest  // Only load JPA layer (faster)
class AccountRepositoryTest { ... }

@WebMvcTest  // Only load web layer
class TransferControllerTest { ... }
```

**Key difference:** Spring offers test slices (load only necessary components). Laravel loads entire framework.

---

### 7. Ecosystem & Libraries

**Laravel:**
- **ORM:** Eloquent (built-in)
- **Testing:** PHPUnit (built-in)
- **API:** Laravel Sanctum (JWT)
- **Queue:** Laravel Queue (Redis, SQS)
- **Caching:** Laravel Cache (Redis, File)

All integrated, developer-friendly, but fewer choices.

**Spring Boot:**
- **ORM:** Hibernate, Eclipselink, etc. (pick your own)
- **Testing:** JUnit, TestNG, Mockito, etc. (ecosystem)
- **Security:** Spring Security, Keycloak, OAuth2 (comprehensive)
- **Message Queue:** Spring Cloud Stream (Kafka, RabbitMQ, etc.)
- **Caching:** Spring Cache (Redis, Caffeine, etc.)

More choices, steeper learning curve, but more powerful.

---

### 8. Why Banks Choose Spring Boot (Not Laravel)

✅ **Type safety** — Compile-time error detection for financial calculations  
✅ **Concurrency** — Handles 10,000+ simultaneous requests  
✅ **Transactions** — Explicit transaction control with rollback conditions  
✅ **Distributed systems** — Saga patterns, event sourcing support  
✅ **Performance** — Vertical scaling capability  
✅ **Audit trails** — AOP makes cross-cutting concerns (logging) easy  
✅ **Industry standard** — Temenos, Finastra use Java/Spring  
✅ **Security** — Spring Security is battle-tested for PCI DSS  

❌ **Laravel limitations for banking:**
- Single-threaded model limits concurrency
- Loose typing risks financial calculation errors
- Limited transaction control (no isolation levels)
- Ecosystem smaller (fewer battle-tested libraries)

---

### 9. When to Choose Each?

**Choose Laravel when:**
- Building small/medium web apps (< 100 req/sec)
- Team knows PHP better than Java
- Speed of development is priority over performance
- Simple CRUD applications
- MVP that needs quick iteration

**Choose Spring Boot when:**
- Building high-concurrency systems (> 1000 req/sec)
- Financial/banking domain (mandatory)
- Distributed architecture needed (microservices)
- Type safety is important
- Long-term maintainability matters
- Team has Java experience

---

### 10. Transitioning from Laravel to Spring Boot

**Mental shifts:**
1. **Type everything** — Java forces types; use them as documentation
2. **Dependency injection is explicit** — Constructor injection isn't magic; it's clear contracts
3. **Transactions need control** — No magic; you control rollback via `rollbackFor`
4. **Testing requires setup** — But gives precise control (test slices, mocks)
5. **Concurrency is explicit** — Use @Async, ThreadPools, not just queue jobs

**Comfort building:**
1. Start with simple Spring Boot CRUD
2. Learn @Transactional gotchas first (self-invocation)
3. Understand Spring Security (similar to Laravel Sanctum but more powerful)
4. Master testing with @DataJpaTest and @WebMvcTest
5. Then tackle microservices (Saga, Kafka, distributed transactions)

---

## Interview Checklist

- [ ] Know constructor injection is preferred
- [ ] Understand @Transactional self-invocation pitfall
- [ ] Can explain JWT stateless flow
- [ ] Know Expand-Contract migration pattern
- [ ] Understand CAP theorem (consistency > availability for banking)
- [ ] Can code a simple @RestControllerAdvice
- [ ] Know when to @Cacheable (user profiles yes, balances no)
- [ ] Understand Spring profiles for multi-environment config
- [ ] Can compare Laravel vs Spring Boot (when asked)
- [ ] Know why banks use Spring Boot not Laravel

