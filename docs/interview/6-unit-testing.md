# Senior Backend Interview — Unit Testing & Quality Assurance

---

### Q1. Explain the testing pyramid. How do you balance unit, integration, and end-to-end tests?

**The Testing Pyramid:**

```
        /\
       /E2E\          Few — slow, fragile, expensive
      /------\
     / Integr \       Some — medium speed
    /----------\
   /   Unit     \     Many — fast, isolated, cheap
  /--------------\
```

**Unit Tests:**
- Test a single class/method in isolation with all dependencies mocked
- Run in milliseconds — thousands per second
- High coverage of business logic, edge cases, error handling

**Integration Tests:**
- Test interaction between components (service + repository, controller + service)
- Use `@SpringBootTest` (full context) or slice tests (`@DataJpaTest`, `@WebMvcTest`)
- Run in seconds — keep to critical paths

**End-to-End Tests:**
- Test the full system from HTTP request to DB and back
- Use tools like RestAssured, Playwright, or Testcontainers
- Run in minutes — only test the most critical user journeys

**Coverage philosophy:**
- Target ~80% line coverage as a guideline, not a goal
- 100% coverage with trivial tests is worse than 70% with meaningful tests
- Use mutation testing (PIT) to verify test quality

---

### Q2. How do you unit test a Spring Boot service that depends on a database and external API?

**Unit test (pure, no Spring context):**
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepository;
    @Mock private PaymentClient paymentClient;
    @InjectMocks private OrderService orderService;

    @Test
    void shouldThrowWhenPaymentFails() {
        when(paymentClient.charge(any())).thenThrow(new PaymentException("declined"));
        assertThrows(OrderException.class, () -> orderService.placeOrder(testOrder()));
        verify(orderRepository, never()).save(any());
    }
}
```

**Repository slice test (`@DataJpaTest`):**
```java
@DataJpaTest
class OrderRepositoryTest {
    @Autowired private OrderRepository repo;

    @Test
    void shouldFindPendingOrdersByUser() { ... }
}
```

**Controller slice test (`@WebMvcTest`):**
```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired private MockMvc mvc;
    @MockBean private OrderService orderService;

    @Test
    void shouldReturn404WhenOrderNotFound() throws Exception {
        when(orderService.findById(99L)).thenThrow(new NotFoundException());
        mvc.perform(get("/api/orders/99"))
           .andExpect(status().isNotFound());
    }
}
```

**External HTTP API stubbing (WireMock):**
```java
@RegisterExtension
WireMockExtension wm = WireMockExtension.newInstance()
    .options(wireMockConfig().dynamicPort()).build();

@Test
void shouldHandlePaymentApiTimeout() {
    wm.stubFor(post("/payments").willReturn(aResponse().withFixedDelay(5000)));
    // assert timeout handling
}
```

---

### Q3. What is the difference between @Mock and @MockBean?

| | `@Mock` (Mockito) | `@MockBean` (Spring Boot Test) |
|--|--|--|
| Spring context | Not required | Requires Spring context |
| Speed | Very fast | Slower (context startup) |
| Used with | `@ExtendWith(MockitoExtension.class)` | `@SpringBootTest`, `@WebMvcTest` |
| Behavior | Pure Mockito mock | Replaces bean in ApplicationContext |
| Use when | Pure unit test | Need Spring infrastructure |

**Rule of thumb:** Prefer `@Mock` for service/domain logic tests. Use `@MockBean` only when you genuinely need the Spring infrastructure.

---

### Q4. How do you write testable code? What design patterns help?

**1. Dependency Injection — inject, don't instantiate:**
```java
// Bad — hard to test
public class OrderService {
    private PaymentClient client = new PaymentClient();
}

// Good — inject the dependency
public class OrderService {
    private final PaymentClient client;
    public OrderService(PaymentClient client) { this.client = client; }
}
```

**2. Single Responsibility** — one reason to change per class.

**3. Avoid static methods** — can't be mocked. Prefer instance methods via DI.

**4. Ports & Adapters (Hexagonal Architecture):**
```
[Controller] → [Application Service] → [Domain Logic]
                                      ↕
                          [Port/Interface] → [Adapter] → [DB / API]
```
Domain logic only knows the port interface. In tests, swap with in-memory fake.

**5. Avoid leaking framework concerns** — domain objects should be plain Java.

---

### Q5. How do you test async or event-driven code?

**Spring @Async methods:**
```java
@Test
void shouldProcessOrderAsync() {
    orderService.processAsync(order);
    await().atMost(5, SECONDS)
           .until(() -> orderRepository.findById(order.getId())
                                       .map(o -> "PROCESSED".equals(o.getStatus()))
                                       .orElse(false));
}
```

**Kafka consumer tests (`@EmbeddedKafka`):**
```java
@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = {"orders"})
class OrderConsumerTest {
    @Autowired KafkaTemplate<String, String> kafkaTemplate;

    @Test
    void shouldConsumeOrderEvent() throws Exception {
        kafkaTemplate.send("orders", "{\"orderId\":\"123\"}");
        await().atMost(10, SECONDS)
               .until(() -> repo.findById("123").isPresent());
    }
}
```

**Reactive streams (Project Reactor):**
```java
@Test
void shouldEmitOrderEvents() {
    Flux<OrderEvent> events = orderService.streamEvents(userId);
    StepVerifier.create(events)
        .expectNextMatches(e -> e.type().equals("ORDER_PLACED"))
        .expectNextMatches(e -> e.type().equals("PAYMENT_CONFIRMED"))
        .expectComplete()
        .verify(Duration.ofSeconds(5));
}
```

**Key principles:**
- Never use `Thread.sleep()` — flaky and slow. Use Awaitility.
- Make consumers idempotent
- Test error paths: deserialization failure, retry exhaustion, DLQ

---

### Q6. What are Testcontainers? Why use them over H2?

**Testcontainers** spins up real, lightweight Docker containers (PostgreSQL, Redis, Kafka) during JUnit tests.

**Why not H2 (in-memory)?**
- H2 has subtle SQL syntax and behavior differences from PostgreSQL/MySQL
- JSONB columns, window functions, stored procedures may not exist in H2
- Tests pass on H2 but fail in production — false confidence

**Example:**
```java
@Testcontainers
@SpringBootTest
class OrderRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("testdb");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired private OrderRepository repo;

    @Test
    void shouldPersistOrderWithJsonbColumn() {
        Order order = new Order();
        order.setMetadata(Map.of("source", "web", "priority", "high"));
        repo.save(order);
        // This would FAIL on H2 if using JSONB type!
        assertThat(repo.findById(order.getId())).isPresent();
    }
}
```

**Best practice:** Use Testcontainers for integration tests, H2 is acceptable only if your schema is trivially simple.

---

### Q7. How do you implement contract testing between microservices?

**Problem:** Service A depends on Service B's API. Service B changes its response format → Service A breaks in production.

**Consumer-Driven Contract Testing (Pact / Spring Cloud Contract):**

1. **Consumer** defines expected interactions (request + expected response).
2. These contracts are shared with the **Provider**.
3. Provider runs the contracts against its actual implementation. If any contract fails, the CI pipeline breaks.

**Spring Cloud Contract example:**

**Consumer side (stub):**
```groovy
// contract definition
Contract.make {
    request {
        method 'GET'
        url '/api/users/1'
    }
    response {
        status 200
        body([id: 1, name: "John", email: "john@example.com"])
    }
}
```

**Provider side (verifier):**
```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
@AutoConfigureStubRunner(ids = "com.example:user-service:+:stubs:8080")
class UserClientContractTest {
    @Autowired UserClient userClient;

    @Test
    void shouldReturnUserFromStub() {
        User user = userClient.getUser(1L);
        assertThat(user.getName()).isEqualTo("John");
    }
}
```

**Why it matters:** Catches API breaking changes before deployment. No need to spin up all services locally. Each team can develop independently with confidence.

---

### Q8. How do you measure and improve test quality beyond code coverage?

**Code coverage is necessary but not sufficient.** 100% line coverage can still have tests that don't catch real bugs.

**Mutation Testing (PIT):**
Automatically modifies (mutates) your code (e.g., changes `>` to `>=`, replaces `return true` with `return false`) and runs your tests. If a test fails → the mutant is "killed" (good). If tests still pass → the mutant survived (your test is weak).

```xml
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <configuration>
        <targetClasses>com.example.service.*</targetClasses>
        <mutators>STRONGER</mutators>
    </configuration>
</plugin>
```

**Other quality metrics:**
- **Test execution time:** Slow tests get skipped. Keep unit tests < 1ms each.
- **Flaky test rate:** Track tests that pass/fail randomly. Fix or quarantine them.
- **Critical path coverage:** Ensure 100% coverage on payment, auth, and data integrity paths — even if overall is 70%.
- **Boundary value analysis:** Always test edge cases (null, empty, max int, negative, unicode).
