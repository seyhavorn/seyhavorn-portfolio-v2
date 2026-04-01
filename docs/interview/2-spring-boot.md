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
