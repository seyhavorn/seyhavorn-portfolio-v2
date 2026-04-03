# Senior Backend Interview — Spring Boot

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

### Q9. How do Spring Profiles work? How do you manage configuration across environments?

**Spring Profiles** allow you to define environment-specific beans and configuration. Only configuration belonging to the active profile(s) is loaded.

**Activating a profile:**
```yaml
spring:
  profiles:
    active: dev
```
```bash
java -jar app.jar --spring.profiles.active=prod
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
        return new RedisCacheManager(...);
    }
}

@Configuration
@Profile("dev")
public class DevCacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}
```

---

### Q10. What are the common pitfalls of @Transactional in Spring?

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
Spring `@Transactional` works via AOP proxy. Internal method calls bypass the proxy. **Fix:** Extract into a separate bean.

**Pitfall 2 — Wrong exception type:**
```java
@Transactional  // only rolls back on RuntimeException by default!
public void process() throws IOException {
    repo.save(entity);
    throw new IOException("fail");  // Transaction COMMITS!
}
// Fix:
@Transactional(rollbackFor = Exception.class)
```

**Pitfall 3 — Private or final methods:**
`@Transactional` does not work on `private` or `final` methods because CGLIB proxies cannot override them.

**Pitfall 4 — Read-only optimization missed:**
```java
@Transactional(readOnly = true)
public List<Order> findAll() { ... }
```
`readOnly = true` disables dirty checking in Hibernate and can enable read replicas.

**Pitfall 5 — Long transactions:**
Holding a transaction open while calling an external API keeps the DB connection locked. Do external calls outside the transactional boundary.

---

### Q11. Compare Spring MVC (blocking) vs Spring WebFlux (reactive). When would you choose WebFlux?

**Spring MVC (Servlet-based, blocking):**
- One thread per request. Thread blocks during I/O.
- Scales by adding more threads (Tomcat default = 200).
- Simple, familiar, easier to debug.

**Spring WebFlux (Reactive, non-blocking):**
- Event-loop model with a small number of threads (= CPU cores).
- Thread is never blocked — yields during I/O.
- Uses `Mono<T>` and `Flux<T>`.

```java
// MVC — blocking
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userService.findById(id);  // blocks thread
}

// WebFlux — reactive
@GetMapping("/users/{id}")
public Mono<User> getUser(@PathVariable Long id) {
    return userService.findById(id);  // returns immediately
}
```

**Choose WebFlux when:**
- Very high concurrency (10,000+ simultaneous connections)
- Streaming use cases (SSE, WebSockets, LLM token streaming)
- API Gateway or proxy services

**Stay with MVC when:**
- CPU-intensive workloads
- Team lacks reactive experience
- Standard CRUD applications

---

### Q12. What are the key components of Spring Cloud for microservices?

| Component | Purpose | Implementation |
|---|---|---|
| **Service Discovery** | Register and find services | Eureka, Consul, Kubernetes |
| **API Gateway** | Single entry point, routing | Spring Cloud Gateway |
| **Config Server** | Centralized configuration | Spring Cloud Config (Git-backed) |
| **Circuit Breaker** | Prevent cascading failures | Resilience4j |
| **Load Balancing** | Client-side load distribution | Spring Cloud LoadBalancer |
| **Distributed Tracing** | Track requests across services | Micrometer Tracing + Zipkin |
| **Message Bus** | Broadcast config changes | Spring Cloud Bus (Kafka/RabbitMQ) |

**Circuit Breaker example:**
```java
@CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
public PaymentResponse charge(PaymentRequest req) {
    return paymentClient.charge(req);
}

public PaymentResponse paymentFallback(PaymentRequest req, Throwable t) {
    return PaymentResponse.deferred("Payment will be retried");
}
```

**States:** Closed → Open (fail-fast) → Half-Open (test requests)

---

### Q13. Explain caching strategies in Spring Boot.

```java
@EnableCaching

@Cacheable(value = "users", key = "#id")
public User findById(Long id) { ... }

@CachePut(value = "users", key = "#user.id")
public User update(User user) { ... }

@CacheEvict(value = "users", key = "#id")
public void delete(Long id) { ... }
```

**Cache providers:** ConcurrentMapCache (dev), Redis (distributed), Caffeine (in-memory with TTL).

| Strategy | How it works | Trade-off |
|---|---|---|
| **TTL** | Expires after N seconds | Simple but briefly stale |
| **Write-through** | `@CachePut` on every write | Always fresh, extra write latency |
| **Cache-aside** | `@Cacheable` on read, `@CacheEvict` on write | Most common pattern |
| **Event-driven** | Kafka/Redis pub-sub invalidation | Best for multi-instance |

---

### Q14. What is AOP (Aspect-Oriented Programming) in Spring?

**AOP** separates cross-cutting concerns (logging, security, transactions) from business logic.

**Terms:** Aspect (`@Aspect`), Advice (Before/After/Around), Join Point (method invocation), Pointcut (which methods to target).

```java
@Aspect
@Component
public class PerformanceAspect {
    @Around("@annotation(LogExecutionTime)")
    public Object logTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        log.info("{} executed in {}ms",
            joinPoint.getSignature().getName(),
            System.currentTimeMillis() - start);
        return result;
    }
}
```

**How Spring implements AOP:** Proxy-based (JDK Dynamic Proxy or CGLIB). This is why `@Transactional`, `@Cacheable`, `@Async` don't work on self-invocation — internal calls bypass the proxy.

---

### Q15. Explain the @Async annotation. What are its pitfalls?

`@Async` allows methods to execute in a separate thread, returning control to the caller immediately.

**Setup:**
```java
@EnableAsync
@Configuration
public class AsyncConfig implements AsyncConfigurer {
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
```

**Usage:**
```java
@Async
public CompletableFuture<Report> generateReport(Long userId) {
    Report report = heavyComputation(userId);
    return CompletableFuture.completedFuture(report);
}
```

**Pitfalls:**
1. **Self-invocation doesn't work** — same as `@Transactional`. Must be called from another bean.
2. **Void methods swallow exceptions** — use `AsyncUncaughtExceptionHandler` to handle.
3. **Default executor is `SimpleAsyncTaskExecutor`** which creates a new thread per call (no pooling). Always configure a custom `ThreadPoolTaskExecutor`.
4. **Return type must be `void` or `CompletableFuture`/`Future`** — other return types are silently ignored.
5. **`@Transactional` + `@Async` together is dangerous** — the transaction runs in a new thread context, isolated from the caller's transaction.

---

### Q16. What is the difference between @RequestParam, @PathVariable, @RequestBody, and @RequestHeader?

| Annotation | Source | Example |
|---|---|---|
| `@PathVariable` | URL path segment | `GET /users/123` → `@PathVariable Long id` |
| `@RequestParam` | Query string parameter | `GET /users?name=John` → `@RequestParam String name` |
| `@RequestBody` | HTTP request body (JSON) | `POST /users` with JSON body → `@RequestBody UserDTO user` |
| `@RequestHeader` | HTTP header value | `Authorization: Bearer xxx` → `@RequestHeader String authorization` |

```java
@PostMapping("/orders/{id}/items")
public ResponseEntity<Order> addItem(
    @PathVariable Long id,                    // from URL path
    @RequestParam(defaultValue = "1") int qty, // from query string
    @RequestBody ItemDTO item,                 // from JSON body
    @RequestHeader("X-Request-Id") String reqId // from header
) { ... }
```

---

### Q17. How do you implement global exception handling in Spring Boot?

Use `@RestControllerAdvice` (or `@ControllerAdvice`) to centralize error handling across all controllers.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
        return new ErrorResponse("NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult()
            .getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                FieldError::getDefaultMessage,
                (a, b) -> a
            ));
        return new ErrorResponse("VALIDATION_FAILED", errors);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return new ErrorResponse("INTERNAL_ERROR", "Something went wrong");
    }
}
```

**Best practices:**
- Return a consistent error response DTO with `code`, `message`, `timestamp`
- Never expose stack traces in production
- Use specific exception classes for each error case
- Order `@ExceptionHandler` from most specific to most general

---

### Q18. How does Bean Validation work in Spring Boot? Explain @Valid vs @Validated.

**Bean Validation (JSR 380)** integrates with Spring Boot via `spring-boot-starter-validation` (Hibernate Validator).

```java
public class CreateUserRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotNull
    private String email;

    @Size(min = 8, max = 100, message = "Password must be 8-100 chars")
    private String password;

    @Min(value = 18, message = "Must be at least 18")
    private int age;
}

@PostMapping("/users")
public ResponseEntity<User> create(@Valid @RequestBody CreateUserRequest req) {
    // If validation fails, MethodArgumentNotValidException is thrown
}
```

**@Valid vs @Validated:**

| Feature | `@Valid` (JSR) | `@Validated` (Spring) |
|---------|---------------|----------------------|
| Source | `jakarta.validation` | `org.springframework` |
| Groups support | No | Yes — `@Validated(OnCreate.class)` |
| Where | Method params, nested objects | Method params, class-level |
| Nested cascading | Yes | No (requires `@Valid` on nested field) |

**Validation groups example:**
```java
public interface OnCreate {}
public interface OnUpdate {}

public class UserDTO {
    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    private Long id;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    private String name;
}

@PostMapping
public User create(@Validated(OnCreate.class) @RequestBody UserDTO dto) { ... }

@PutMapping("/{id}")
public User update(@Validated(OnUpdate.class) @RequestBody UserDTO dto) { ... }
```

**Custom validator:**
```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface ValidPhone {
    String message() default "Invalid phone number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneValidator implements ConstraintValidator<ValidPhone, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        return value != null && value.matches("^\\+?[0-9]{9,15}$");
    }
}
```

---

### Q19. What testing strategies do you use in Spring Boot? Explain the test slice annotations.

**Testing pyramid in Spring Boot:**

| Level | Annotation | What it tests | Speed |
|-------|-----------|---------------|-------|
| Unit | `@ExtendWith(MockitoExtension.class)` | Service logic in isolation | ⚡ Fast |
| Slice | `@WebMvcTest`, `@DataJpaTest` | One layer only | 🔶 Medium |
| Integration | `@SpringBootTest` | Full application context | 🐢 Slow |

**Test slice annotations — load only what's needed:**

```java
// Controller layer only (no service/repository beans loaded)
@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean UserService userService;  // mock the dependency

    @Test
    void shouldReturnUser() throws Exception {
        given(userService.findById(1L)).willReturn(new User(1L, "John"));

        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("John"));
    }
}

// Repository layer only (embedded DB + JPA)
@DataJpaTest
class UserRepositoryTest {
    @Autowired UserRepository repo;
    @Autowired TestEntityManager em;

    @Test
    void shouldFindByEmail() {
        em.persist(new User("john@test.com"));
        User found = repo.findByEmail("john@test.com");
        assertThat(found).isNotNull();
    }
}

// Full integration test
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderIntegrationTest {
    @Autowired TestRestTemplate restTemplate;

    @Test
    void shouldCreateOrder() {
        ResponseEntity<Order> res = restTemplate
            .postForEntity("/api/orders", new OrderDTO(...), Order.class);
        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

**Other slices:** `@JsonTest` (serialization), `@RestClientTest` (REST clients), `@JdbcTest` (JDBC only).

**Testcontainers** for real DB testing:
```java
@Testcontainers
@SpringBootTest
class RealDbTest {
    @Container
    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:15");

    @DynamicPropertySource
    static void dbProps(DynamicPropertyRegistry reg) {
        reg.add("spring.datasource.url", pg::getJdbcUrl);
        reg.add("spring.datasource.username", pg::getUsername);
        reg.add("spring.datasource.password", pg::getPassword);
    }
}
```

---

### Q20. How do you schedule tasks in Spring Boot?

**Enable scheduling:**
```java
@EnableScheduling
@Configuration
public class SchedulingConfig { }
```

**Fixed rate vs Fixed delay vs Cron:**

```java
@Component
public class ReportScheduler {

    // Runs every 5 seconds regardless of completion time
    @Scheduled(fixedRate = 5000)
    public void fixedRateTask() { ... }

    // Waits 5 seconds AFTER the previous execution finishes
    @Scheduled(fixedDelay = 5000)
    public void fixedDelayTask() { ... }

    // Runs at 2 AM every day
    @Scheduled(cron = "0 0 2 * * *")
    public void dailyReport() { ... }

    // Externalized cron expression
    @Scheduled(cron = "${report.cron:0 0 2 * * *}")
    public void configurableTask() { ... }
}
```

**Pitfalls:**
1. **Single-threaded by default** — all `@Scheduled` methods share one thread. If one blocks, others are delayed:
```java
@Bean
public TaskScheduler taskScheduler() {
    ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
    scheduler.setPoolSize(5);
    return scheduler;
}
```
2. **No distributed lock** — multiple app instances run the same task. Use **ShedLock** for distributed locking:
```java
@SchedulerLock(name = "dailyReport", lockAtLeastFor = "5m", lockAtMostFor = "30m")
@Scheduled(cron = "0 0 2 * * *")
public void dailyReport() { ... }
```

---

### Q21. How do you implement event-driven communication within a Spring Boot app?

**Application Events** provide loose coupling between components within the same application.

```java
// 1. Define the event
public class OrderCreatedEvent {
    private final Long orderId;
    private final String customerEmail;
    // constructor, getters
}

// 2. Publish the event
@Service
@RequiredArgsConstructor
public class OrderService {
    private final ApplicationEventPublisher publisher;

    @Transactional
    public Order createOrder(OrderDTO dto) {
        Order order = repository.save(mapToEntity(dto));
        publisher.publishEvent(new OrderCreatedEvent(order.getId(), dto.getEmail()));
        return order;
    }
}

// 3. Listen to the event
@Component
public class OrderNotificationListener {

    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        emailService.sendConfirmation(event.getCustomerEmail(), event.getOrderId());
    }
}

// Async listener (non-blocking)
@Async
@EventListener
public void onOrderCreatedAsync(OrderCreatedEvent event) { ... }

// Transactional listener (runs after transaction commits)
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void afterOrderCommitted(OrderCreatedEvent event) { ... }
```

**When to use each:**
- `@EventListener` — default synchronous, runs in same thread & transaction
- `@Async @EventListener` — fire-and-forget, separate thread
- `@TransactionalEventListener` — only fires after the transaction succeeds (prevents sending emails for rolled-back orders)

---

### Q22. Explain the N+1 query problem in JPA/Hibernate and how to fix it.

**The problem:** Loading a parent entity and then lazily loading each child entity causes 1 query for the parent + N queries for N children.

```java
// Entity
@Entity
public class Author {
    @OneToMany(mappedBy = "author", fetch = FetchType.LAZY)
    private List<Book> books;
}

// This triggers N+1
List<Author> authors = authorRepo.findAll();     // 1 query for authors
for (Author a : authors) {
    a.getBooks().size();  // 1 query per author → N queries!
}
```

**Solutions:**

**1. JOIN FETCH (JPQL):**
```java
@Query("SELECT a FROM Author a JOIN FETCH a.books")
List<Author> findAllWithBooks();
// 1 single query with JOIN
```

**2. @EntityGraph:**
```java
@EntityGraph(attributePaths = {"books"})
@Query("SELECT a FROM Author a")
List<Author> findAllWithBooks();
```

**3. @BatchSize (Hibernate):**
```java
@OneToMany(mappedBy = "author")
@BatchSize(size = 20)
private List<Book> books;
// Loads children in batches of 20 instead of one-by-one
```

**4. Projection / DTO query:**
```java
@Query("SELECT new com.app.dto.AuthorBookDTO(a.name, b.title) " +
       "FROM Author a JOIN a.books b")
List<AuthorBookDTO> findAuthorBooks();
// No entity, no lazy loading issue
```

**Detection:** Enable Hibernate statistics or use `datasource-proxy` to log query counts in tests.

---

### Q23. How does pagination and sorting work in Spring Data JPA?

Spring Data provides `Pageable` and `Sort` abstractions out of the box.

```java
// Repository — no extra code needed (built into JpaRepository)
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategory(String category, Pageable pageable);
}

// Controller
@GetMapping("/products")
public Page<Product> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(defaultValue = "createdAt") String sortBy,
    @RequestParam(defaultValue = "desc") String direction
) {
    Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
    Pageable pageable = PageRequest.of(page, size, sort);
    return productRepo.findByCategory("electronics", pageable);
}
```

**Response structure (`Page<T>`):**
```json
{
  "content": [ ... ],
  "totalElements": 150,
  "totalPages": 8,
  "number": 0,
  "size": 20,
  "first": true,
  "last": false
}
```

**Performance tips:**
- Use `Slice<T>` instead of `Page<T>` to avoid the extra `COUNT` query when you only need "has next page"
- For large datasets, use **keyset pagination** (cursor-based) instead of offset:
```java
@Query("SELECT p FROM Product p WHERE p.id > :cursor ORDER BY p.id")
Slice<Product> findNextPage(@Param("cursor") Long lastId, Pageable pageable);
```

---

### Q24. What is MapStruct and why use it over manual mapping?

**MapStruct** is a compile-time code generator for mapping between DTOs and entities. It eliminates boilerplate and is type-safe.

```java
@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDTO toDto(User entity);

    User toEntity(CreateUserRequest request);

    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    @Mapping(target = "active", constant = "true")
    @Mapping(source = "createdAt", target = "registeredDate", dateFormat = "yyyy-MM-dd")
    UserDetailDTO toDetailDto(User user);

    // List mapping generated automatically
    List<UserDTO> toDtoList(List<User> entities);

    // Partial update (null fields in DTO leave entity unchanged)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(UpdateUserRequest dto, @MappingTarget User entity);
}
```

**Why MapStruct over manual mapping or ModelMapper:**

| Feature | MapStruct | ModelMapper | Manual |
|---------|-----------|-------------|--------|
| Performance | Compile-time (zero runtime overhead) | Reflection-based (slow) | Fastest |
| Type safety | Compile-time checks | Runtime errors | Compile-time checks |
| Boilerplate | None (auto-generated) | None | Lots |
| Debugging | Generated source visible | Black box | Fully transparent |

---

### Q25. How do you document REST APIs in Spring Boot?

**SpringDoc OpenAPI** (successor to SpringFox) auto-generates OpenAPI 3.0 docs from your code.

**Setup:**
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
</dependency>
```

**Customizing:**
```java
@Operation(summary = "Create a new user", description = "Registers a new user account")
@ApiResponses({
    @ApiResponse(responseCode = "201", description = "User created"),
    @ApiResponse(responseCode = "400", description = "Validation failed"),
    @ApiResponse(responseCode = "409", description = "Email already exists")
})
@PostMapping("/users")
public ResponseEntity<UserDTO> create(@Valid @RequestBody CreateUserRequest req) { ... }

// Schema customization on DTO
public class CreateUserRequest {
    @Schema(description = "User's email", example = "john@example.com")
    private String email;
}
```

**Global config:**
```java
@Bean
public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(new Info().title("My API").version("1.0"))
        .addSecurityItem(new SecurityRequirement().addList("Bearer"))
        .components(new Components()
            .addSecuritySchemes("Bearer",
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")));
}
```

Access Swagger UI at `http://localhost:8080/swagger-ui.html`

---

### Q26. What is @ConfigurationProperties and how is it different from @Value?

**@ConfigurationProperties** binds external configuration to a typed Java object:

```yaml
# application.yml
app:
  mail:
    host: smtp.gmail.com
    port: 587
    from: noreply@app.com
    templates:
      welcome: "Welcome, {{name}}!"
      reset: "Reset your password"
```

```java
@ConfigurationProperties(prefix = "app.mail")
@Validated
public record MailProperties(
    @NotBlank String host,
    @Min(1) int port,
    @Email String from,
    Map<String, String> templates
) {}

// Enable scanning
@EnableConfigurationProperties(MailProperties.class)
```

**Comparison:**

| Feature | `@Value` | `@ConfigurationProperties` |
|---------|---------|---------------------------|
| Binding | Single property | Entire object tree |
| Type safety | Runtime failure on mismatch | Compile-time + validation |
| Relaxed binding | No | Yes (`app.mail-host` = `app.mailHost`) |
| Validation | No | Yes (with `@Validated`) |
| Nested objects | Manual | Automatic |
| IDE support | No autocomplete | Full autocomplete with processor |

**Rule of thumb:** Use `@Value` for 1–2 simple values; use `@ConfigurationProperties` for structured configuration.

---

### Q27. How does Spring Boot handle graceful shutdown?

Graceful shutdown ensures in-flight requests complete before the application stops.

**Enable it:**
```yaml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s  # max wait time
```

**What happens on shutdown:**
1. App receives `SIGTERM` (Docker, K8s)
2. No new requests are accepted (returns 503)
3. Active requests continue processing (up to timeout)
4. `@PreDestroy` methods execute
5. Application context closes
6. JVM exits

**Custom shutdown hooks:**
```java
@Component
public class CleanupService implements DisposableBean {
    @Override
    public void destroy() {
        // Close connections, flush caches, finish background tasks
        log.info("Cleaning up resources...");
    }
}

// Or using @PreDestroy
@PreDestroy
public void onShutdown() {
    messageConsumer.stop();
    executorService.shutdown();
}
```

**Kubernetes readiness:**
```yaml
# K8s pod spec
lifecycle:
  preStop:
    exec:
      command: ["sh", "-c", "sleep 10"]  # Allow deregistration
terminationGracePeriodSeconds: 60
```

---

### Q28. What is the difference between Mono and Flux in Spring WebFlux?

| Concept | `Mono<T>` | `Flux<T>` |
|---------|----------|----------|
| Emits | 0 or 1 element | 0 to N elements |
| Use case | Single result (findById, save) | Collection or stream |
| Analogy | `Optional<T>` / `CompletableFuture<T>` | `List<T>` / `Stream<T>` |

```java
// Mono — single item
Mono<User> findById(Long id);
Mono<Void> delete(Long id);

// Flux — multiple items
Flux<User> findAll();
Flux<ServerSentEvent<String>> stream();

// Operators
Mono<UserDTO> dto = userService.findById(id)
    .map(user -> mapper.toDto(user))              // transform
    .switchIfEmpty(Mono.error(new NotFoundException()))  // fallback
    .doOnSuccess(u -> log.info("Found user: {}", u));   // side effect

// Combining
Mono<OrderSummary> summary = Mono.zip(
    orderService.getOrder(id),
    paymentService.getPayment(id),
    shippingService.getTracking(id)
).map(tuple -> new OrderSummary(tuple.getT1(), tuple.getT2(), tuple.getT3()));
// All three calls execute in parallel!
```

**Key rule:** Never call `.block()` on a Mono/Flux inside a reactive pipeline — it defeats the purpose and can cause deadlocks.

---

### Q29. What is Spring Boot's multi-module project structure and when to use it?

A multi-module Maven/Gradle project splits the application into independent modules with clear boundaries.

```
my-app/
├── pom.xml (parent)
├── common/              → Shared DTOs, utils, exceptions
│   └── pom.xml
├── domain/              → Entities, repository interfaces
│   └── pom.xml
├── service/             → Business logic
│   └── pom.xml
├── api/                 → REST controllers, security config
│   └── pom.xml
└── worker/              → Scheduled tasks, message consumers
    └── pom.xml
```

**Benefits:**
- **Enforced architecture:** Module A can't accidentally depend on module B
- **Faster builds:** Only rebuild changed modules
- **Separate deployables:** `api` and `worker` can be deployed independently
- **Team boundaries:** Different teams own different modules

**Parent POM setup:**
```xml
<modules>
    <module>common</module>
    <module>domain</module>
    <module>service</module>
    <module>api</module>
    <module>worker</module>
</modules>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

**When to use:** When your codebase has 50+ classes, multiple entry points (API + worker), or multiple teams contributing.

---

### Q30. What is Spring AI and how do you integrate LLMs into a Spring Boot app?

**Spring AI** is the official Spring project for integrating AI models (OpenAI, Ollama, Azure, etc.) into Spring Boot applications.

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
```

**Basic chat:**
```java
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatClient chatClient;

    public String ask(String question) {
        return chatClient.prompt()
            .user(question)
            .call()
            .content();
    }
}
```

**RAG (Retrieval-Augmented Generation):**
```java
@Service
public class KnowledgeService {
    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    public String askWithContext(String question) {
        // 1. Retrieve relevant documents from vector store
        List<Document> docs = vectorStore.similaritySearch(
            SearchRequest.query(question).withTopK(5)
        );

        // 2. Augment prompt with retrieved context
        String context = docs.stream()
            .map(Document::getContent)
            .collect(Collectors.joining("\n"));

        return chatClient.prompt()
            .system("Answer based on the following context:\n" + context)
            .user(question)
            .call()
            .content();
    }
}
```

**Structured output (type-safe responses):**
```java
record MovieRecommendation(String title, String genre, int year, String reason) {}

MovieRecommendation movie = chatClient.prompt()
    .user("Recommend a sci-fi movie from the 2020s")
    .call()
    .entity(MovieRecommendation.class);
// Returns a typed Java object, not raw text!
```

**Key concepts:**
- **ChatClient** — unified API across providers (OpenAI, Ollama, Anthropic)
- **VectorStore** — stores embeddings for RAG (PGVector, Redis, Chroma)
- **Function Calling** — let the LLM invoke Java methods as tools
- **Advisors** — middleware for logging, message history, RAG

---

### Q31. What is OpenFeign and how does it simplify inter-service communication?

**OpenFeign** is a declarative HTTP client that lets you define REST calls as interfaces — no manual `RestTemplate` or `WebClient` code.

**Setup:**
```java
@SpringBootApplication
@EnableFeignClients
public class FloodServiceApplication { }

// Declarative client — interface only, no implementation needed
@FeignClient(name = "weather-service", fallback = WeatherClientFallback.class)
public interface WeatherClient {

    @GetMapping("/api/weather/rainfall/{stationId}")
    RainfallResponse getRainfall(@PathVariable String stationId);

    @GetMapping("/api/weather/forecast")
    List<ForecastDTO> getForecast(
        @RequestParam double lat,
        @RequestParam double lon,
        @RequestParam int days
    );
}
```

**How it works with Eureka:**
1. `name = "weather-service"` matches the Eureka service name
2. Feign resolves the actual host:port from Eureka registry
3. Spring Cloud LoadBalancer distributes requests across instances
4. No hardcoded URLs — works seamlessly in dynamic environments

**Fallback with Resilience4j:**
```java
@Component
public class WeatherClientFallback implements WeatherClient {
    @Override
    public RainfallResponse getRainfall(String stationId) {
        return RainfallResponse.empty(); // return cached or default data
    }

    @Override
    public List<ForecastDTO> getForecast(double lat, double lon, int days) {
        return Collections.emptyList();
    }
}
```

**Configuration:**
```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          weather-service:
            connect-timeout: 5000
            read-timeout: 10000
            logger-level: BASIC
      circuitbreaker:
        enabled: true
```

**OpenFeign vs WebClient vs RestTemplate:**

| Feature | OpenFeign | WebClient | RestTemplate |
|---------|-----------|-----------|-------------|
| Style | Declarative (interface) | Programmatic (builder) | Programmatic |
| Blocking | Yes | Non-blocking (reactive) | Yes |
| Load balancing | Built-in via Eureka | Via `@LoadBalanced` | Via `@LoadBalanced` |
| Error handling | Fallback classes | `.onErrorResume()` | Try-catch |
| Best for | Service-to-service REST | Reactive/streaming | Legacy apps |

---

### Q32. How do you integrate Keycloak with Spring Boot for OAuth 2.0 / OpenID Connect?

**Keycloak** is an open-source Identity and Access Management (IAM) server that provides SSO, OAuth 2.0, and OpenID Connect.

**Architecture in a microservices system:**
```
Client → API Gateway → Keycloak (validate JWT)
                 ↓
         Microservices (Resource Servers)
```

**Spring Boot as OAuth2 Resource Server:**
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://keycloak:9091/realms/my-realm
          jwk-set-uri: http://keycloak:9091/realms/my-realm/protocol/openid-connect/certs
```

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtConverter()))
            )
            .build();
    }

    // Extract roles from Keycloak JWT (roles are nested in realm_access.roles)
    private JwtAuthenticationConverter jwtConverter() {
        JwtGrantedAuthoritiesConverter rolesConverter = new JwtGrantedAuthoritiesConverter();
        rolesConverter.setAuthoritiesClaimName("realm_access.roles");
        rolesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(rolesConverter);
        return converter;
    }
}
```

**Keycloak Admin Client (managing users programmatically):**
```java
@Service
@RequiredArgsConstructor
public class KeycloakUserService {
    private final Keycloak keycloak;

    public void createUser(CreateUserRequest req) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setEnabled(true);

        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType("password");
        cred.setValue(req.getPassword());
        cred.setTemporary(false);
        user.setCredentials(List.of(cred));

        keycloak.realm("my-realm").users().create(user);
    }
}
```

**Keycloak vs Spring Security (custom JWT):**

| Aspect | Keycloak | Custom JWT |
|--------|---------|-----------|
| User management | Built-in UI, APIs, SSO | Custom code (UserDetailsService) |
| Social login | Google, GitHub, etc. out of the box | Manual OAuth2 client config |
| MFA | Built-in | Third-party integration |
| Complexity | More infra (runs as a service) | Lighter, embedded |
| Best for | Enterprise, multi-app SSO | Simple single-app auth |

---

### Q33. What is Jib and how does it differ from traditional Docker builds?

**Jib** (by Google) builds optimized container images for Java applications **without a Dockerfile** and **without Docker installed**.

**Usage:**
```xml
<!-- Maven plugin -->
<plugin>
    <groupId>com.google.cloud.tools</groupId>
    <artifactId>jib-maven-plugin</artifactId>
    <version>3.4.0</version>
    <configuration>
        <from>
            <image>eclipse-temurin:21-jre-alpine</image>
        </from>
        <to>
            <image>registry.example.com/weather-service</image>
            <tags>
                <tag>${project.version}</tag>
                <tag>latest</tag>
            </tags>
        </to>
        <container>
            <jvmFlags>
                <jvmFlag>-XX:+UseContainerSupport</jvmFlag>
                <jvmFlag>-XX:MaxRAMPercentage=75.0</jvmFlag>
            </jvmFlags>
            <ports><port>8080</port></ports>
            <user>1000</user>
        </container>
    </configuration>
</plugin>
```

```bash
# Build and push to registry (no Docker daemon needed)
mvn compile jib:build

# Build to local Docker daemon
mvn compile jib:dockerBuild
```

**Jib vs Dockerfile:**

| Aspect | Jib | Dockerfile |
|--------|-----|-----------|
| Docker required? | No | Yes |
| Build speed | Fast (layer caching, no rebuild if deps unchanged) | Slower (rebuilds from changed layer) |
| Image size | Optimized (separates deps/resources/classes into layers) | Depends on Dockerfile quality |
| Reproducibility | Deterministic by default | Depends on `RUN` commands |
| Customization | Limited to Java apps | Full flexibility |
| Multi-stage build | Not needed (only bundles app) | Required for minimal images |

**How Jib optimizes layers:**
```
Layer 1: Base image (JRE)           → cached, rarely changes
Layer 2: Dependencies (JARs)        → cached until pom.xml changes
Layer 3: Resources (config files)   → cached until resources change  
Layer 4: Application classes        → rebuilt on code change (smallest layer)
```

This means code changes only rebuild the smallest layer (~1MB), making builds and pushes much faster.

---

### Q34. How do you design a data ingestion ETL pipeline with Spring Batch for scientific data?

**Use case:** Ingest climate model data from NetCDF files, FTP servers, or external APIs, process it through domain-specific risk engines, and store results in PostgreSQL + PostGIS.

**Pipeline architecture:**
```
FTP Server / NOAA / ECMWF
        ↓ (Scheduled download)
    Raw Data (NetCDF, XML, CSV)
        ↓ (Spring Batch)
    Parse → Validate → Transform → Spatial Join → Risk Classify
        ↓
    PostgreSQL + PostGIS (partitioned tables)
        ↓ (Notification)
    RabbitMQ → Telegram Alert Service
```

**Multi-step batch job:**
```java
@Configuration
public class WeatherPipelineConfig {

    @Bean
    public Job weatherIngestionJob(Step downloadStep, Step parseStep,
                                    Step riskCalcStep, Step notifyStep) {
        return new JobBuilder("weatherIngestionJob", jobRepository)
            .start(downloadStep)                    // Download from FTP
            .next(parseStep)                        // Parse NetCDF into entities
            .next(riskCalcStep)                     // Calculate risk levels
            .next(notifyStep)                       // Publish alerts
            .listener(jobCompletionListener())       // Cleanup & logging
            .build();
    }

    @Bean
    public Step parseStep() {
        return new StepBuilder("parseNetCDF", jobRepository)
            .<NetCdfRecord, WeatherObservation>chunk(1000, txManager)
            .reader(netCdfItemReader())              // Custom ItemReader for NetCDF
            .processor(weatherProcessor())           // Validate, transform coords
            .writer(jpaItemWriter())                 // Batch insert to PostgreSQL
            .faultTolerant()
            .skipLimit(500)
            .skip(InvalidDataException.class)        // Skip corrupted records
            .listener(skipListener())                // Log skipped records
            .build();
    }
}
```

**Table partitioning for time-series data:**
```sql
-- Parent table
CREATE TABLE weather_observations (
    id          BIGSERIAL,
    station_id  VARCHAR(20),
    observed_at TIMESTAMPTZ NOT NULL,
    temperature DECIMAL(5,2),
    rainfall    DECIMAL(8,2),
    location    GEOMETRY(Point, 4326)
) PARTITION BY RANGE (observed_at);

-- Auto-create monthly partitions
CREATE TABLE weather_observations_2026_04
    PARTITION OF weather_observations
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
```

**Scheduling with ShedLock (multi-instance safe):**
```java
@Scheduled(cron = "0 0 */2 * * *")  // Every 2 hours
@SchedulerLock(name = "weatherIngestion", lockAtMostFor = "90m")
public void runIngestion() {
    jobLauncher.run(weatherIngestionJob,
        new JobParametersBuilder()
            .addLong("timestamp", System.currentTimeMillis())
            .toJobParameters());
}
```

**Key design decisions:**
- **Chunk size tuning:** 500–2000 records per chunk. Too small = overhead, too large = memory pressure
- **Partition maintenance:** Scheduled job creates next month's partitions and drops old ones (>2 years)
- **Idempotent ingestion:** Use composite unique constraint (station_id + observed_at) to prevent duplicate records on re-run
- **Monitoring:** Expose Spring Batch metrics via Actuator — job duration, records read/written/skipped

---

### Q35. How does OpenFeign handle inter-service communication with authentication propagation?

When microservices call each other, the JWT token from the original request must be forwarded to downstream services.

**Token propagation with RequestInterceptor:**
```java
@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor bearerTokenInterceptor() {
        return template -> {
            // Get the current request's JWT from SecurityContext
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth instanceof JwtAuthenticationToken jwt) {
                template.header("Authorization", "Bearer " + jwt.getToken().getTokenValue());
            }
        };
    }
}

// Apply to specific Feign client
@FeignClient(name = "weather-service", configuration = FeignConfig.class)
public interface WeatherClient {
    @GetMapping("/api/weather/stations")
    List<StationDTO> getStations();
}
```

**Error decoding:**
```java
@Component
public class FeignErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        return switch (response.status()) {
            case 404 -> new ResourceNotFoundException("Resource not found: " + methodKey);
            case 401 -> new UnauthorizedException("Token expired or invalid");
            case 503 -> new ServiceUnavailableException("Downstream service unavailable");
            default -> new FeignException.FeignServerException(
                response.status(), "Error calling: " + methodKey,
                response.request(), null, null);
        };
    }
}
```

**Logging:**
```yaml
logging:
  level:
    com.example.client.WeatherClient: DEBUG

spring:
  cloud:
    openfeign:
      client:
        config:
          weather-service:
            logger-level: FULL  # NONE, BASIC, HEADERS, FULL
```

---

### Q36. Explain Keycloak Authentication Flows. When do you enable each flow?

Keycloak supports multiple **OAuth 2.0 / OpenID Connect authentication flows**. Each flow defines *how* a client obtains an access token. You enable/disable them per-client in the Keycloak Admin Console.

**Flow Overview:**

| Flow | Enabled By Default? | Purpose |
|------|:---:|---------|
| **Standard flow** | ✅ | Authorization Code flow — the most secure, recommended for web apps |
| **Direct access grants** | ✅ | Resource Owner Password Credentials — username/password login via API |
| **Service accounts roles** | ✅ | Client Credentials — machine-to-machine authentication |
| **Implicit flow** | ❌ | Legacy SPA flow — deprecated, replaced by Standard flow + PKCE |
| **Standard Token Exchange** | ❌ | Exchange one token type for another (delegation, impersonation) |
| **OAuth 2.0 Device Authorization Grant** | ❌ | For devices with no browser (Smart TV, CLI, IoT) |
| **OIDC CIBA Grant** | ❌ | Client-Initiated Backchannel Authentication — decoupled auth |

---

#### 1. Standard Flow (Authorization Code Flow) ✅

The **most secure** and recommended flow for web/mobile applications. The user is redirected to Keycloak's login page, authenticates, and is redirected back with an **authorization code** that the backend exchanges for tokens.

```
Browser → Redirect to Keycloak Login Page
       → User authenticates
       → Keycloak redirects back with ?code=abc123
       → Backend exchanges code for access_token + refresh_token (server-side)
```

**When to enable:**
- Web applications (frontend + backend)
- Mobile apps (with PKCE — Proof Key for Code Exchange)
- Any scenario where the user interacts with a browser

**Spring Boot configuration:**
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: my-web-app
            client-secret: ${KEYCLOAK_CLIENT_SECRET}
            scope: openid, profile, email
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        provider:
          keycloak:
            issuer-uri: http://keycloak:9091/realms/my-realm
```

**With PKCE (for public clients like SPAs/mobile):**
```
Client generates code_verifier (random string)
           → hash it → code_challenge
           → send code_challenge with auth request
           → send code_verifier with token exchange
           → Keycloak verifies hash matches
```
This prevents authorization code interception attacks — no client secret needed.

---

#### 2. Direct Access Grants (Resource Owner Password Credentials) ✅

The client collects the username/password directly and sends them to Keycloak's token endpoint. **No browser redirect** — purely API-based login.

```bash
# Get token via API
curl -X POST http://keycloak:9091/realms/my-realm/protocol/openid-connect/token \
  -d "grant_type=password" \
  -d "client_id=my-app" \
  -d "client_secret=secret" \
  -d "username=john" \
  -d "password=pass123" \
  -d "scope=openid"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 300,
  "token_type": "Bearer"
}
```

**When to enable:**
- **Backend-for-frontend** (BFF) pattern — your backend handles login on behalf of the frontend
- **Testing and development** — quick token acquisition for API testing
- **Migration** — transitioning from custom username/password auth to Keycloak

**When NOT to use in production:**
- The client sees the user's raw password — security risk if the client is compromised
- OAuth 2.1 deprecates this grant type
- Prefer **Standard flow** whenever a browser is available

**Spring Boot — calling Keycloak token endpoint:**
```java
@Service
public class AuthService {
    private final WebClient webClient;

    public TokenResponse login(String username, String password) {
        return webClient.post()
            .uri("http://keycloak:9091/realms/my-realm/protocol/openid-connect/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters
                .fromFormData("grant_type", "password")
                .with("client_id", clientId)
                .with("client_secret", clientSecret)
                .with("username", username)
                .with("password", password)
                .with("scope", "openid"))
            .retrieve()
            .bodyToMono(TokenResponse.class)
            .block();
    }
}
```

---

#### 3. Service Accounts Roles (Client Credentials Flow) ✅

Used for **machine-to-machine** communication where no user is involved. The client authenticates with its own credentials (client_id + client_secret) to get a token.

```bash
curl -X POST http://keycloak:9091/realms/my-realm/protocol/openid-connect/token \
  -d "grant_type=client_credentials" \
  -d "client_id=weather-service" \
  -d "client_secret=service-secret"
```

**When to enable:**
- Microservice-to-microservice calls (e.g., Weather Service → Flood Service)
- Background jobs / scheduled tasks that call protected APIs
- External system integrations (third-party webhooks calling your API)

**Spring Boot configuration:**
```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          weather-service:
            client-id: weather-service
            client-secret: ${WEATHER_SERVICE_SECRET}
            authorization-grant-type: client_credentials
            scope: openid
        provider:
          weather-service:
            issuer-uri: http://keycloak:9091/realms/my-realm
```

```java
// Use OAuth2AuthorizedClientManager for automatic token management
@Bean
public WebClient weatherServiceClient(OAuth2AuthorizedClientManager clientManager) {
    ServletOAuth2AuthorizedClientExchangeFilterFunction oauth2 =
        new ServletOAuth2AuthorizedClientExchangeFilterFunction(clientManager);
    oauth2.setDefaultClientRegistrationId("weather-service");

    return WebClient.builder()
        .apply(oauth2.oauth2Configuration())
        .baseUrl("http://weather-service")
        .build();
}
```

---

#### 4. Implicit Flow ❌ (Deprecated)

Tokens are returned directly in the URL fragment (`#access_token=...`). **Do NOT use** — tokens are exposed in browser history and URL logs.

**Replaced by:** Standard flow + PKCE for SPAs.

---

#### 5. Standard Token Exchange ❌

Allows exchanging one token for another — used for **delegation** and **impersonation** scenarios.

```
User A's token → Exchange → Token acting as User B (impersonation)
User's token → Exchange → Narrower-scoped token for a downstream service
```

**When to enable:**
- Admin needs to act on behalf of a user (support troubleshooting)
- A service needs a more restricted token for calling another service
- Cross-realm token exchange

---

#### 6. OAuth 2.0 Device Authorization Grant ❌

For devices **without a browser** (Smart TVs, CLI tools, IoT devices).

```
Device → Request device code from Keycloak
       → Display code + URL to user: "Go to https://login.example.com and enter code: ABCD-1234"
       → User logs in on their phone/laptop
       → Device polls Keycloak until user completes login
       → Device receives access_token
```

**When to enable:** CLI tools, Smart TV apps, kiosk devices.

---

#### 7. OIDC CIBA Grant ❌

**Client-Initiated Backchannel Authentication** — the client requests authentication, but the user authenticates on a **separate device** (push notification, SMS, etc.).

```
Banking App → Request auth for user → Keycloak sends push to user's phone
           → User approves on phone → App receives token
```

**When to enable:** Banking apps, high-security workflows requiring out-of-band confirmation.

---

#### Decision Matrix — Which Flow to Use?

| Scenario | Flow |
|----------|------|
| Web app with login page | **Standard flow** (Authorization Code) |
| SPA (React/Vue) | **Standard flow + PKCE** |
| Mobile app | **Standard flow + PKCE** |
| API login (username/password) | **Direct access grants** (for BFF/testing only) |
| Microservice-to-microservice | **Service accounts** (Client Credentials) |
| Background jobs / cron | **Service accounts** (Client Credentials) |
| CLI / IoT devices | **Device Authorization Grant** |
| Admin impersonation | **Token Exchange** |
| Banking / high-security | **CIBA** |



