# Design Patterns & SOLID Principles — Senior Backend Interview Guide

**Master design patterns and SOLID principles for clean, maintainable code.** Each answer: simple explanation → problem → solution → professional code → interview tip.

---

## Quick Reference — 25 Core Topics

| Category | # | Topic | Key Concept | Practice |
|----------|---|-------|-------------|----------|
| **SOLID** | 1 | Single Responsibility | One reason to change | ⭐⭐⭐ Critical |
| **SOLID** | 2 | Open/Closed | Extend, don't modify | ⭐⭐⭐ Critical |
| **SOLID** | 3 | Liskov Substitution | Swap safely | ⭐⭐ Important |
| **SOLID** | 4 | Interface Segregation | Small interfaces | ⭐⭐ Important |
| **SOLID** | 5 | Dependency Inversion | Abstract first | ⭐⭐⭐ Critical |
| **Creational** | 6 | Singleton | One instance only | ⭐⭐ Common |
| **Creational** | 7 | Factory | Create without knowing type | ⭐⭐⭐ Very Common |
| **Creational** | 8 | Builder | Construct complex objects | ⭐⭐⭐ Very Common |
| **Structural** | 9 | Adapter | Connect incompatible interfaces | ⭐⭐ Common |
| **Structural** | 10 | Facade | Simplify complex subsystems | ⭐⭐ Common |
| **Structural** | 11 | Decorator | Add behavior dynamically | ⭐⭐⭐ Very Common |
| **Structural** | 12 | Proxy | Control access via placeholder | ⭐⭐⭐ Very Common |
| **Behavioral** | 13 | Strategy | Switch algorithms | ⭐⭐⭐ Very Common |
| **Behavioral** | 14 | Observer | Notify on change | ⭐⭐⭐ Very Common |
| **Behavioral** | 15 | Command | Turn requests into objects | ⭐⭐ Common |
| **Behavioral** | 16 | Template Method | Define algorithm skeleton | ⭐⭐ Common |
| **Architectural** | 17 | Dependency Injection | Inject dependencies | ⭐⭐⭐ Critical |
| **Architectural** | 18 | Repository | Abstract data access | ⭐⭐⭐ Critical |
| **Architectural** | 19 | DTO | Transfer data safely | ⭐⭐⭐ Critical |
| **Architectural** | 20 | CQRS | Separate reads from writes | ⭐⭐⭐ Advanced |
| **Principles** | 21 | DRY, KISS, YAGNI | Code quality rules | ⭐⭐⭐ Critical |
| **Resilience** | 22 | Circuit Breaker | Fail gracefully | ⭐⭐⭐ Critical |
| **Banking** | 23 | Saga Pattern | Distributed transactions | ⭐⭐⭐ Banking-specific |
| **Banking** | 24 | Outbox Pattern | Ensure atomicity | ⭐⭐⭐ Banking-specific |
| **Testing** | 25 | Testability | Design for testing | ⭐⭐⭐ Critical |

---

## SOLID Principles — Write Code That Doesn't Break

### Q1: Single Responsibility Principle (SRP)

**The simple answer:**  
A class should have **only one reason to change**. If you can't describe what a class does in one sentence without using "and", it violates SRP.

**The problem:**  
```java
// ❌ BAD: UserService does everything
public class UserService {
    public void createUser(User user) { /* DB */ }
    public void sendEmail(User user) { /* Email */ }
    public String generateReport(List<User> users) { /* PDF */ }
    public void logActivity(String action) { /* Logging */ }
}
// Change email provider? Modify UserService. Change logger? Modify UserService.
// Too many reasons to change one class.
```

**The solution:**  
```java
// ✅ GOOD: Each class has one reason to change

@Service
public class UserService {
    private final UserRepository userRepository;
    private final EventPublisher eventPublisher;

    public UserService(UserRepository userRepository, EventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    public User createUser(UserDTO dto) {
        User user = new User(dto.getName(), dto.getEmail());
        User saved = userRepository.save(user);
        eventPublisher.publish(new UserCreatedEvent(saved));
        return saved;
    }
}

@Service
public class EmailService {
    private final EmailProvider emailProvider;

    public EmailService(EmailProvider emailProvider) {
        this.emailProvider = emailProvider;
    }

    public void sendWelcomeEmail(User user) {
        EmailMessage message = new EmailMessage(
            user.getEmail(),
            "Welcome!",
            "Welcome to our platform, " + user.getName()
        );
        emailProvider.send(message);
    }
}

@Service
public class ReportService {
    private final UserRepository userRepository;
    private final PdfGenerator pdfGenerator;

    public ReportService(UserRepository userRepository, PdfGenerator pdfGenerator) {
        this.userRepository = userRepository;
        this.pdfGenerator = pdfGenerator;
    }

    public byte[] generateUserReport(ReportCriteria criteria) {
        List<User> users = userRepository.findByCriteria(criteria);
        return pdfGenerator.generate(users);
    }
}

@Service
public class ActivityLogger {
    private final AuditRepository auditRepository;

    public ActivityLogger(AuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public void logActivity(String userId, String action) {
        AuditLog log = new AuditLog(userId, action, LocalDateTime.now());
        auditRepository.save(log);
    }
}
```

**Interview tip:**  
"SRP makes code testable and maintainable. I can test `UserService` without mocking an email provider. Each class has one reason to change, so changes are isolated. This is the foundation of SOLID."

---

### Q2: Open/Closed Principle (OCP)

**The simple answer:**  
**Open for extension, closed for modification.** Add new features without changing existing code.

**The problem:**  
```java
// ❌ BAD: Adding new payment method requires modifying existing code
public class PaymentProcessor {
    public void processPayment(String type, double amount) {
        if (type.equals("CREDIT_CARD")) {
            // validate credit card
            // debit account
        } else if (type.equals("PAYPAL")) {
            // PayPal-specific logic
        } else if (type.equals("CRYPTO")) {
            // Crypto-specific logic
        }
        // Adding bank transfer? Modify this method again!
    }
}
```

**The solution:**  
```java
// ✅ GOOD: Use polymorphism to extend without modifying

public interface PaymentMethod {
    void validate(PaymentRequest request) throws PaymentException;
    void process(PaymentRequest request) throws PaymentException;
    String getMethodName();
}

@Component
public class CreditCardPayment implements PaymentMethod {
    @Override
    public void validate(PaymentRequest request) {
        if (request.getCardNumber() == null || request.getCardNumber().length() != 16) {
            throw new PaymentException("Invalid card number");
        }
    }

    @Override
    public void process(PaymentRequest request) {
        // Call credit card processor
        // Debit account
        // Return transaction ID
    }

    @Override
    public String getMethodName() {
        return "CREDIT_CARD";
    }
}

@Component
public class PayPalPayment implements PaymentMethod {
    @Override
    public void validate(PaymentRequest request) {
        if (request.getPayPalEmail() == null) {
            throw new PaymentException("PayPal email required");
        }
    }

    @Override
    public void process(PaymentRequest request) {
        // Call PayPal API
    }

    @Override
    public String getMethodName() {
        return "PAYPAL";
    }
}

@Service
public class PaymentService {
    private final Map<String, PaymentMethod> paymentMethods;

    public PaymentService(List<PaymentMethod> methods) {
        this.paymentMethods = new HashMap<>();
        for (PaymentMethod method : methods) {
            this.paymentMethods.put(method.getMethodName(), method);
        }
    }

    public PaymentResult process(PaymentRequest request) {
        PaymentMethod method = paymentMethods.get(request.getPaymentType());
        if (method == null) {
            throw new PaymentException("Payment method not supported: " + request.getPaymentType());
        }

        method.validate(request);
        method.process(request);
        return new PaymentResult("SUCCESS", request.getAmount());
    }
}
```

**Adding new payment method:** Just create a new class implementing `PaymentMethod`. No existing code changes.

**Interview tip:**  
"OCP keeps code flexible. When new requirements come (new payment providers, new notification channels), I extend with new classes instead of modifying existing ones. This reduces regression risk and makes code easier to test."

---

### Q3: Liskov Substitution Principle (LSP)

**The simple answer:**  
If class B extends class A, use B anywhere A is expected without breaking anything.

**The problem:**  
```java
// ❌ BAD: Square violates Liskov
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int w) { 
        this.width = w; 
        this.height = w;  // Forces height = width!
    }
    @Override
    public void setHeight(int h) { 
        this.height = h; 
        this.width = h;   // Forces width = height!
    }
}

// This breaks:
public void printArea(Rectangle r) {
    r.setWidth(5);
    r.setHeight(3);
    System.out.println(r.getArea());  // Expects 15, gets 9 for Square!
}
```

**The solution:**  
```java
// ✅ GOOD: Use composition instead of inheritance

public interface Shape {
    int getArea();
    int getPerimeter();
}

public class Rectangle implements Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public int getArea() {
        return width * height;
    }

    @Override
    public int getPerimeter() {
        return 2 * (width + height);
    }
}

public class Square implements Shape {
    private final int side;

    public Square(int side) {
        this.side = side;
    }

    @Override
    public int getArea() {
        return side * side;
    }

    @Override
    public int getPerimeter() {
        return 4 * side;
    }
}

// Safe to use polymorphically
public void printArea(Shape shape) {
    System.out.println("Area: " + shape.getArea());
}
```

**Interview tip:**  
"LSP prevents subtle bugs in polymorphic code. If a subclass violates the parent's contract, it breaks code that uses the parent type. I prefer composition over inheritance to avoid this problem."

---

### Q4: Interface Segregation Principle (ISP)

**The simple answer:**  
**Many small, focused interfaces > one big interface that does everything.** Don't force implementations to depend on methods they don't use.

**The problem:**  
```java
// ❌ BAD: One fat interface
public interface Worker {
    void work();
    void eat();
    void sleep();
    void getPaid();
}

public class Robot implements Worker {
    public void work() { System.out.println("Working..."); }
    public void eat() { /* Robots don't eat! Empty */ }
    public void sleep() { /* Robots don't sleep! Empty */ }
    public void getPaid() { /* Robots don't need money! Empty */ }
}
```

**The solution:**  
```java
// ✅ GOOD: Small, focused interfaces

public interface Workable {
    void work();
}

public interface Eatable {
    void eat();
}

public interface Sleepable {
    void sleep();
}

public interface Payable {
    void getPaid();
}

public class Human implements Workable, Eatable, Sleepable, Payable {
    @Override
    public void work() { System.out.println("Working..."); }

    @Override
    public void eat() { System.out.println("Eating..."); }

    @Override
    public void sleep() { System.out.println("Sleeping..."); }

    @Override
    public void getPaid() { System.out.println("Getting paid..."); }
}

public class Robot implements Workable {
    @Override
    public void work() { System.out.println("Working..."); }
    // No unnecessary methods!
}
```

**Interview tip:**  
"ISP makes code more flexible. If I need an object that can work without sleeping or eating, I implement only `Workable`. This is especially important in large systems where interfaces grow too large."

---

### Q5: Dependency Inversion Principle (DIP)

**The simple answer:**  
Depend on **abstractions (interfaces), not concrete classes.** High-level code shouldn't depend on low-level code; both depend on abstractions.

**The problem:**  
```java
// ❌ BAD: Tightly coupled to specific database
@Service
public class UserService {
    // Direct dependency on MySQL!
    private final MySQLDatabase database = new MySQLDatabase();

    public User getUser(Long id) {
        return database.findById("users", id);
    }
}

// If you switch to PostgreSQL, refactor UserService. Hundreds of services coupled to MySQL.
```

**The solution:**  
```java
// ✅ GOOD: Depend on Database interface

public interface Database {
    <T> T findById(String table, Long id);
    <T> void save(String table, T entity);
}

public class MySQLDatabase implements Database {
    @Override
    public <T> T findById(String table, Long id) {
        // MySQL-specific logic
        return null;
    }

    @Override
    public <T> void save(String table, T entity) {
        // MySQL-specific logic
    }
}

public class PostgreSQLDatabase implements Database {
    @Override
    public <T> T findById(String table, Long id) {
        // PostgreSQL-specific logic
        return null;
    }

    @Override
    public <T> void save(String table, T entity) {
        // PostgreSQL-specific logic
    }
}

@Service
public class UserService {
    private final Database database;  // Depends on abstraction!

    public UserService(Database database) {
        this.database = database;
    }

    public User getUser(Long id) {
        return database.findById("users", id);
    }

    public void saveUser(User user) {
        database.save("users", user);
    }
}

// Usage in Spring Boot
@Configuration
public class DatabaseConfig {
    @Bean
    public Database database() {
        // Switch implementation here, no code changes needed
        return new PostgreSQLDatabase();
    }
}
```

**Interview tip:**  
"DIP makes code flexible. I can swap database implementations, payment providers, or logging frameworks without changing business logic. In Spring Boot, `@Autowired` and constructor injection enforce DIP automatically."

---

## Creational Patterns — Object Creation

### Q6: Singleton Pattern

**The simple answer:**  
Only **one instance** of a class exists in the entire application. Used for shared resources.

**Real-world use:**  Database connection pool, configuration manager, logger.

**Production implementation (thread-safe):**  
```java
public class DatabaseConnectionPool {
    private static volatile DatabaseConnectionPool instance;
    private final HikariDataSource dataSource;

    private DatabaseConnectionPool() {
        this.dataSource = new HikariDataSource(new HikariConfig() {{
            setJdbcUrl("jdbc:postgresql://localhost/mydb");
            setUsername("user");
            setPassword("password");
            setMaximumPoolSize(20);
        }});
    }

    public static DatabaseConnectionPool getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnectionPool.class) {
                if (instance == null) {
                    instance = new DatabaseConnectionPool();
                }
            }
        }
        return instance;
    }

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
}

// Usage
DatabaseConnectionPool pool = DatabaseConnectionPool.getInstance();
Connection conn = pool.getConnection();
```

**In Spring Boot:** All `@Service`, `@Component`, `@Repository` beans are Singletons by default.

```java
@Configuration
public class SingletonConfig {
    @Bean
    public DatabaseConnectionPool databasePool() {
        return DatabaseConnectionPool.getInstance();
    }
}
```

**Interview tip:**  
"Singleton is overused. Spring manages singletons for you. Pure Singleton pattern (double-checked locking) is only for non-Spring contexts. In Spring, just use `@Bean` or `@Service`."

---

### Q7: Factory Pattern

**The simple answer:**  
A method that creates objects **without exposing creation logic.** Caller says *what* it needs, not *how* to build it.

**Production example — Payment factory:**  
```java
public interface PaymentGateway {
    PaymentResult charge(String accountId, BigDecimal amount) throws PaymentException;
}

public class StripeGateway implements PaymentGateway {
    private final StripeClient stripeClient;

    public StripeGateway(StripeClient stripeClient) {
        this.stripeClient = stripeClient;
    }

    @Override
    public PaymentResult charge(String accountId, BigDecimal amount) throws PaymentException {
        try {
            ChargeResponse response = stripeClient.charge(accountId, amount);
            return new PaymentResult(response.getId(), PaymentStatus.SUCCESS);
        } catch (StripeException e) {
            throw new PaymentException("Stripe error: " + e.getMessage(), e);
        }
    }
}

public class PayPalGateway implements PaymentGateway {
    private final PayPalClient payPalClient;

    public PayPalGateway(PayPalClient payPalClient) {
        this.payPalClient = payPalClient;
    }

    @Override
    public PaymentResult charge(String accountId, BigDecimal amount) throws PaymentException {
        try {
            PaymentResponse response = payPalClient.execute(accountId, amount);
            return new PaymentResult(response.getTransactionId(), PaymentStatus.SUCCESS);
        } catch (PayPalException e) {
            throw new PaymentException("PayPal error: " + e.getMessage(), e);
        }
    }
}

@Component
public class PaymentGatewayFactory {
    private final StripeClient stripeClient;
    private final PayPalClient payPalClient;

    public PaymentGatewayFactory(StripeClient stripeClient, PayPalClient payPalClient) {
        this.stripeClient = stripeClient;
        this.payPalClient = payPalClient;
    }

    public PaymentGateway create(PaymentProvider provider) {
        return switch (provider) {
            case STRIPE -> new StripeGateway(stripeClient);
            case PAYPAL -> new PayPalGateway(payPalClient);
            default -> throw new IllegalArgumentException("Unknown provider: " + provider);
        };
    }
}

// Usage
@Service
public class OrderService {
    private final PaymentGatewayFactory gatewayFactory;

    @Transactional
    public void completeOrder(Order order, PaymentProvider provider) {
        PaymentGateway gateway = gatewayFactory.create(provider);
        PaymentResult result = gateway.charge(order.getAccountId(), order.getTotal());
        order.setPaymentResult(result);
    }
}
```

**Interview tip:**  
"Factory decouples concrete classes from client code. Adding a new payment provider only requires creating a new `PaymentGateway` implementation and updating the factory. No changes to `OrderService`."

---

### Q8: Builder Pattern

**The simple answer:**  
Build complex objects **step by step** with a fluent API. Great for objects with many optional parameters.

**Production example:**  
```java
public class BankTransfer {
    private final String transactionId;
    private final String fromAccount;
    private final String toAccount;
    private final BigDecimal amount;
    private final String currency;
    private final LocalDateTime timestamp;
    private final String description;
    private final boolean isUrgent;
    private final String reference;

    private BankTransfer(Builder builder) {
        this.transactionId = builder.transactionId;
        this.fromAccount = builder.fromAccount;
        this.toAccount = builder.toAccount;
        this.amount = builder.amount;
        this.currency = builder.currency;
        this.timestamp = builder.timestamp;
        this.description = builder.description;
        this.isUrgent = builder.isUrgent;
        this.reference = builder.reference;
    }

    public static class Builder {
        private final String transactionId;
        private final String fromAccount;
        private final String toAccount;
        private final BigDecimal amount;
        private String currency = "USD";
        private LocalDateTime timestamp = LocalDateTime.now();
        private String description = "";
        private boolean isUrgent = false;
        private String reference = "";

        public Builder(String transactionId, String from, String to, BigDecimal amount) {
            this.transactionId = transactionId;
            this.fromAccount = from;
            this.toAccount = to;
            this.amount = amount;
        }

        public Builder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public Builder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder urgent(boolean isUrgent) {
            this.isUrgent = isUrgent;
            return this;
        }

        public Builder reference(String reference) {
            this.reference = reference;
            return this;
        }

        public BankTransfer build() {
            return new BankTransfer(this);
        }
    }

    // Getters...
}

// Usage — clean and readable!
BankTransfer transfer = new BankTransfer.Builder("TXN-123", "ACC-001", "ACC-002", new BigDecimal("1000.00"))
    .currency("KHR")
    .urgent(true)
    .description("Salary payment")
    .reference("PAYROLL-APR-2024")
    .build();
```

**With Lombok (reduces boilerplate):**  
```java
@Builder
@Getter
public class BankTransfer {
    private final String transactionId;
    private final String fromAccount;
    private final String toAccount;
    private final BigDecimal amount;
    private final String currency;
}

// Usage is identical
```

**Interview tip:**  
"Builder is perfect when constructors would have too many parameters. It's self-documenting: you can see exactly what you're setting. Use Lombok's `@Builder` in real projects to avoid boilerplate."

---

## Structural Patterns — Object Composition

### Q9: Adapter Pattern

**The simple answer:**  
Make two **incompatible interfaces work together** without changing either. Like a power adapter when traveling.

**Production example:**  
```java
// Old legacy payment system (can't change)
public class LegacyPaymentGateway {
    public String executeTransfer(String xmlPayload) {
        // Expects XML, returns XML
        return "<response><status>OK</status></response>";
    }
}

// New system uses JSON
public interface ModernPaymentProcessor {
    PaymentResponse process(PaymentRequest request) throws PaymentException;
}

// Adapter bridges the gap
@Component
public class LegacyPaymentAdapter implements ModernPaymentProcessor {
    private final LegacyPaymentGateway legacyGateway;
    private final XmlToJsonConverter converter;

    public LegacyPaymentAdapter(LegacyPaymentGateway legacyGateway, XmlToJsonConverter converter) {
        this.legacyGateway = legacyGateway;
        this.converter = converter;
    }

    @Override
    public PaymentResponse process(PaymentRequest request) throws PaymentException {
        try {
            // Convert JSON → XML
            String xmlRequest = converter.toXml(request);
            
            // Call legacy system
            String xmlResponse = legacyGateway.executeTransfer(xmlRequest);
            
            // Convert XML → JSON response
            return converter.toPaymentResponse(xmlResponse);
        } catch (Exception e) {
            throw new PaymentException("Legacy gateway error: " + e.getMessage(), e);
        }
    }
}

// Usage — client uses modern interface
@Service
public class OrderService {
    private final ModernPaymentProcessor paymentProcessor;

    public void processPayment(Order order) {
        PaymentRequest request = new PaymentRequest(order.getAmount(), order.getCurrency());
        PaymentResponse response = paymentProcessor.process(request);
    }
}
```

**Interview tip:**  
"Adapter is essential when integrating legacy systems or third-party APIs. It isolates incompatible interfaces into a separate class, keeping business logic clean."

---

### Q10: Facade Pattern

**The simple answer:**  
Provide a **simple interface** to a complex subsystem. Like a hotel concierge: you ask one person, they handle everything.

**Production example:**  
```java
// Complex subsystem (many classes)
@Service
public class InventoryService {
    public boolean checkAvailability(String productId, int quantity) {
        // Check 3 warehouses, calculate current stock...
        return true;
    }
}

@Service
public class PaymentService {
    public PaymentResult charge(String accountId, BigDecimal amount) {
        // Validate account, check fraud, process...
        return new PaymentResult("SUCCESS");
    }
}

@Service
public class ShippingService {
    public ShipmentTracking ship(String productId, Address destination) {
        // Calculate route, assign carrier, generate label...
        return new ShipmentTracking("TRACK123");
    }
}

@Service
public class NotificationService {
    public void notifyOrderPlaced(Order order) {
        // Send email, SMS, push notification...
    }
}

// Facade — one simple method
@Service
public class OrderManagementFacade {
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    private final ShippingService shippingService;
    private final NotificationService notificationService;

    public OrderManagementFacade(InventoryService inventoryService,
                                 PaymentService paymentService,
                                 ShippingService shippingService,
                                 NotificationService notificationService) {
        this.inventoryService = inventoryService;
        this.paymentService = paymentService;
        this.shippingService = shippingService;
        this.notificationService = notificationService;
    }

    @Transactional
    public PaymentResult placeOrder(OrderRequest request) {
        // 1. Check inventory
        if (!inventoryService.checkAvailability(request.getProductId(), request.getQuantity())) {
            throw new OutOfStockException("Product not available");
        }

        // 2. Process payment
        PaymentResult paymentResult = paymentService.charge(
            request.getAccountId(),
            request.getTotal()
        );
        if (!paymentResult.isSuccess()) {
            throw new PaymentFailedException("Payment declined");
        }

        // 3. Ship product
        ShipmentTracking tracking = shippingService.ship(
            request.getProductId(),
            request.getDeliveryAddress()
        );

        // 4. Notify customer
        Order order = new Order(request, paymentResult, tracking);
        notificationService.notifyOrderPlaced(order);

        return paymentResult;
    }
}

// Usage — client sees one simple method
@RestController
@RequestMapping("/orders")
public class OrderController {
    private final OrderManagementFacade orderFacade;

    @PostMapping
    public PaymentResult createOrder(@RequestBody OrderRequest request) {
        return orderFacade.placeOrder(request);
    }
}
```

**Interview tip:**  
"Facade is critical for large systems. Instead of a client directly calling 10 different services, it goes through the facade. This simplifies client code and makes it easier to change the implementation."

---

### Q11: Decorator Pattern

**The simple answer:**  
Add **new behavior to objects dynamically** without changing their class. Stack decorators for combined behavior.

**Production example — API request logging and monitoring:**  
```java
public interface HttpClient {
    HttpResponse execute(HttpRequest request) throws IOException;
}

public class StandardHttpClient implements HttpClient {
    @Override
    public HttpResponse execute(HttpRequest request) throws IOException {
        URLConnection connection = request.getUrl().openConnection();
        connection.setConnectTimeout(5000);
        return new HttpResponse(connection.getInputStream());
    }
}

// Decorator 1: Add logging
public class LoggingHttpClientDecorator implements HttpClient {
    private final HttpClient delegate;
    private final Logger logger;

    public LoggingHttpClientDecorator(HttpClient delegate) {
        this.delegate = delegate;
        this.logger = LoggerFactory.getLogger(getClass());
    }

    @Override
    public HttpResponse execute(HttpRequest request) throws IOException {
        logger.info("Sending request to: {}", request.getUrl());
        long start = System.currentTimeMillis();
        try {
            HttpResponse response = delegate.execute(request);
            long duration = System.currentTimeMillis() - start;
            logger.info("Request completed in {}ms with status: {}", duration, response.getStatus());
            return response;
        } catch (IOException e) {
            logger.error("Request failed: {}", e.getMessage(), e);
            throw e;
        }
    }
}

// Decorator 2: Add retry logic
public class RetryHttpClientDecorator implements HttpClient {
    private final HttpClient delegate;
    private static final int MAX_RETRIES = 3;

    public RetryHttpClientDecorator(HttpClient delegate) {
        this.delegate = delegate;
    }

    @Override
    public HttpResponse execute(HttpRequest request) throws IOException {
        IOException lastException = null;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                return delegate.execute(request);
            } catch (IOException e) {
                lastException = e;
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(1000 * attempt);  // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new IOException("Interrupted during retry", ie);
                    }
                }
            }
        }
        throw lastException;
    }
}

// Decorator 3: Add timeout
public class TimeoutHttpClientDecorator implements HttpClient {
    private final HttpClient delegate;
    private final long timeoutMs;

    public TimeoutHttpClientDecorator(HttpClient delegate, long timeoutMs) {
        this.delegate = delegate;
        this.timeoutMs = timeoutMs;
    }

    @Override
    public HttpResponse execute(HttpRequest request) throws IOException {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        try {
            Future<HttpResponse> future = executor.submit(() -> delegate.execute(request));
            return future.get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            throw new IOException("Request timeout after " + timeoutMs + "ms", e);
        } catch (ExecutionException | InterruptedException e) {
            throw new IOException("Request execution failed", e);
        } finally {
            executor.shutdownNow();
        }
    }
}

// Usage — stack decorators!
@Configuration
public class HttpClientConfig {
    @Bean
    public HttpClient httpClient() {
        HttpClient base = new StandardHttpClient();
        
        // Decorate: add logging, then retry, then timeout
        HttpClient withLogging = new LoggingHttpClientDecorator(base);
        HttpClient withRetry = new RetryHttpClientDecorator(withLogging);
        HttpClient withTimeout = new TimeoutHttpClientDecorator(withRetry, 10000);
        
        return withTimeout;
    }
}

// Result: A request goes through: Timeout → Retry → Logging → StandardHttpClient
```

**In Spring Boot:** `@Transactional`, `@Cacheable`, `@Async` work through decorators (AOP-generated proxies).

**Interview tip:**  
"Decorator is powerful for cross-cutting concerns: logging, caching, transactions, monitoring. Spring uses it extensively through AOP proxies. Always think: can I add this behavior as a decorator instead of modifying the class?"

---

### Q12: Proxy Pattern

**The simple answer:**  
A **placeholder object** that controls access to another object. Useful for lazy loading, access control, and caching.

**Production example — API caching proxy:**  
```java
public interface ExchangeRateService {
    BigDecimal getRate(String from, String to) throws Exception;
}

public class RealExchangeRateService implements ExchangeRateService {
    private final RestTemplate restTemplate;

    public RealExchangeRateService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public BigDecimal getRate(String from, String to) throws Exception {
        String url = "https://api.exchangerate-api.com/v4/latest/" + from;
        ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);
        return response.getRates().get(to);
    }
}

// Proxy with caching
@Component
public class CachingExchangeRateProxy implements ExchangeRateService {
    private final RealExchangeRateService realService;
    private final Redis redisCache;
    private static final long CACHE_TTL = 3600;  // 1 hour

    public CachingExchangeRateProxy(RealExchangeRateService realService, Redis redisCache) {
        this.realService = realService;
        this.redisCache = redisCache;
    }

    @Override
    public BigDecimal getRate(String from, String to) throws Exception {
        String cacheKey = "rate:" + from + ":" + to;
        
        // Check cache first
        String cached = redisCache.get(cacheKey);
        if (cached != null) {
            return new BigDecimal(cached);
        }

        // If not cached, fetch from real service
        BigDecimal rate = realService.getRate(from, to);
        
        // Store in cache
        redisCache.setex(cacheKey, CACHE_TTL, rate.toPlainString());
        
        return rate;
    }
}

// Usage — client doesn't know about caching
@Service
public class TransferService {
    private final ExchangeRateService exchangeRateService;

    @Transactional
    public void exchangeMoney(String from, String to, BigDecimal amount) {
        BigDecimal rate = exchangeRateService.getRate(from, to);
        BigDecimal converted = amount.multiply(rate);
        // Process transfer...
    }
}
```

**Interview tip:**  
"Proxy adds behavior without modifying the real object. Use it for: lazy loading (load object only when needed), caching (avoid expensive operations), access control (check permissions before delegating), logging."

---

## Behavioral Patterns — Object Communication

### Q13: Strategy Pattern

**The simple answer:**  
Define **multiple algorithms and switch between them at runtime** based on input or configuration.

**Production example:**  
```java
public interface DiscountStrategy {
    BigDecimal calculate(BigDecimal originalPrice, ShoppingCart cart);
}

@Component
public class PercentageDiscountStrategy implements DiscountStrategy {
    @Override
    public BigDecimal calculate(BigDecimal originalPrice, ShoppingCart cart) {
        BigDecimal discountPercent = new BigDecimal("10");
        return originalPrice.multiply(discountPercent.divide(new BigDecimal("100")));
    }
}

@Component
public class FixedAmountDiscountStrategy implements DiscountStrategy {
    @Override
    public BigDecimal calculate(BigDecimal originalPrice, ShoppingCart cart) {
        return new BigDecimal("50");
    }
}

@Component
public class VolumeDiscountStrategy implements DiscountStrategy {
    @Override
    public BigDecimal calculate(BigDecimal originalPrice, ShoppingCart cart) {
        if (cart.getItemCount() > 10) {
            return originalPrice.multiply(new BigDecimal("0.20"));  // 20% off
        }
        return BigDecimal.ZERO;
    }
}

@Service
public class PricingService {
    private final Map<String, DiscountStrategy> strategies;

    public PricingService(List<DiscountStrategy> strategyList) {
        this.strategies = new HashMap<>();
        this.strategies.put("PERCENTAGE", new PercentageDiscountStrategy());
        this.strategies.put("FIXED", new FixedAmountDiscountStrategy());
        this.strategies.put("VOLUME", new VolumeDiscountStrategy());
    }

    public BigDecimal calculateFinalPrice(ShoppingCart cart, String discountType) {
        DiscountStrategy strategy = strategies.get(discountType);
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown discount type: " + discountType);
        }

        BigDecimal discount = strategy.calculate(cart.getTotal(), cart);
        return cart.getTotal().subtract(discount);
    }
}

// Usage
@RestController
class OrderController {
    private final PricingService pricingService;

    @PostMapping("/checkout")
    public OrderResult checkout(@RequestBody CheckoutRequest request) {
        BigDecimal finalPrice = pricingService.calculateFinalPrice(
            request.getCart(),
            request.getDiscountType()  // "PERCENTAGE", "FIXED", "VOLUME"
        );
        return new OrderResult(finalPrice);
    }
}
```

**Interview tip:**  
"Strategy avoids massive if-else chains. Each strategy is independent, testable, and swappable. When new discount rules come, just add a new strategy—no changes to existing code."

---

### Q14: Observer Pattern

**The simple answer:**  
Objects **"observe" an event and react automatically** when it occurs. Like YouTube subscriptions: subscribe once, get notified of every upload.

**Production example:**  
```java
public interface OrderEventListener {
    void onOrderCreated(Order order);
    void onOrderConfirmed(Order order);
    void onOrderShipped(Order order);
}

@Component
public class EmailNotificationListener implements OrderEventListener {
    private final EmailService emailService;

    public EmailNotificationListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @Override
    public void onOrderCreated(Order order) {
        emailService.send(order.getCustomerEmail(), 
            "Order Created", 
            "Your order #" + order.getId() + " has been created.");
    }

    @Override
    public void onOrderConfirmed(Order order) {
        emailService.send(order.getCustomerEmail(),
            "Order Confirmed",
            "Your order #" + order.getId() + " has been confirmed.");
    }

    @Override
    public void onOrderShipped(Order order) {
        emailService.send(order.getCustomerEmail(),
            "Order Shipped",
            "Your order #" + order.getId() + " has shipped! Tracking: " + order.getTrackingId());
    }
}

@Component
public class SMSNotificationListener implements OrderEventListener {
    private final SmsService smsService;

    @Override
    public void onOrderCreated(Order order) {
        smsService.send(order.getCustomerPhone(), "Order #" + order.getId() + " created");
    }

    @Override
    public void onOrderConfirmed(Order order) {
        smsService.send(order.getCustomerPhone(), "Order #" + order.getId() + " confirmed");
    }

    @Override
    public void onOrderShipped(Order order) {
        smsService.send(order.getCustomerPhone(), "Order #" + order.getId() + " shipped!");
    }
}

@Component
public class AnalyticsListener implements OrderEventListener {
    private final Analytics analytics;

    @Override
    public void onOrderCreated(Order order) {
        analytics.trackEvent("order_created", Map.of("amount", order.getTotal()));
    }

    @Override
    public void onOrderConfirmed(Order order) {
        analytics.trackEvent("order_confirmed", Map.of("amount", order.getTotal()));
    }

    @Override
    public void onOrderShipped(Order order) {
        analytics.trackEvent("order_shipped", Map.of("orderId", order.getId()));
    }
}

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final List<OrderEventListener> listeners;

    public OrderService(OrderRepository orderRepository, List<OrderEventListener> listeners) {
        this.orderRepository = orderRepository;
        this.listeners = listeners;
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        orderRepository.save(order);

        // Notify all observers
        for (OrderEventListener listener : listeners) {
            listener.onOrderCreated(order);
        }

        return order;
    }

    @Transactional
    public void confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Notify all observers
        for (OrderEventListener listener : listeners) {
            listener.onOrderConfirmed(order);
        }
    }
}
```

**With Spring Events (cleaner):**  
```java
// Event
@Getter
public class OrderCreatedEvent {
    private final Order order;
    public OrderCreatedEvent(Order order) { this.order = order; }
}

// Listener 1
@Component
public class EmailNotificationHandler {
    private final EmailService emailService;

    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        emailService.send(...);
    }
}

// Listener 2
@Component
public class AnalyticsHandler {
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        analytics.track(...);
    }
}

// Publisher
@Service
public class OrderService {
    private final ApplicationEventPublisher eventPublisher;

    public void createOrder(OrderRequest request) {
        Order order = orderRepository.save(new Order(request));
        eventPublisher.publishEvent(new OrderCreatedEvent(order));
    }
}
```

**Interview tip:**  
"Observer decouples event producers from event handlers. Services don't need to know who listens—they just publish events. Add new listeners without changing existing code. Spring's `@EventListener` is built-in Observer pattern."

---

### Q15: Command Pattern

**The simple answer:**  
Turn a request into a **standalone object** containing all info about the request. Enables queuing, logging, undoing, or delaying operations.

**Production example — background task queue:**  
```java
public interface Command {
    void execute() throws Exception;
    void rollback() throws Exception;
}

public class TransferMoneyCommand implements Command {
    private final AccountRepository accountRepository;
    private final String fromAccountId;
    private final String toAccountId;
    private final BigDecimal amount;

    public TransferMoneyCommand(AccountRepository accountRepository,
                               String fromAccountId,
                               String toAccountId,
                               BigDecimal amount) {
        this.accountRepository = accountRepository;
        this.fromAccountId = fromAccountId;
        this.toAccountId = toAccountId;
        this.amount = amount;
    }

    @Override
    public void execute() throws Exception {
        Account from = accountRepository.findById(fromAccountId).orElseThrow();
        Account to = accountRepository.findById(toAccountId).orElseThrow();

        from.debit(amount);
        to.credit(amount);

        accountRepository.saveAll(List.of(from, to));
    }

    @Override
    public void rollback() throws Exception {
        Account from = accountRepository.findById(fromAccountId).orElseThrow();
        Account to = accountRepository.findById(toAccountId).orElseThrow();

        from.credit(amount);
        to.debit(amount);

        accountRepository.saveAll(List.of(from, to));
    }
}

@Service
public class CommandExecutor {
    private final Queue<Command> commandQueue = new LinkedList<>();

    public void executeAsync(Command command) {
        commandQueue.add(command);
        processQueue();
    }

    private void processQueue() {
        while (!commandQueue.isEmpty()) {
            Command command = commandQueue.poll();
            try {
                command.execute();
            } catch (Exception e) {
                try {
                    command.rollback();
                } catch (Exception rollbackError) {
                    // Log critical error
                }
            }
        }
    }
}

// Usage
@Service
public class TransferService {
    private final CommandExecutor commandExecutor;
    private final AccountRepository accountRepository;

    public void transferMoneyAsync(String from, String to, BigDecimal amount) {
        Command command = new TransferMoneyCommand(accountRepository, from, to, amount);
        commandExecutor.executeAsync(command);
    }
}
```

**Interview tip:**  
"Command encapsulates requests as objects. Use it for: background job queues, undo/redo, auditing, and retries. In banking, Command pattern often pairs with Saga pattern for distributed transactions."

---

### Q16: Template Method Pattern

**The simple answer:**  
Define the **skeleton of an algorithm** in a parent class. Subclasses fill in specific steps without changing the overall structure.

**Production example — data export framework:**  
```java
public abstract class DataExporter {
    // Template method — defines structure
    public final ExportResult export(ExportRequest request) {
        validateRequest(request);
        List<Data> data = fetchData(request);
        List<Data> processedData = processData(data);
        writeToFile(processedData, request);
        cleanup();
        return new ExportResult("SUCCESS", request.getOutputPath());
    }

    protected void validateRequest(ExportRequest request) {
        if (request.getOutputPath() == null) {
            throw new IllegalArgumentException("Output path required");
        }
    }

    protected abstract List<Data> fetchData(ExportRequest request);
    protected abstract List<Data> processData(List<Data> data);
    protected abstract void writeToFile(List<Data> data, ExportRequest request);

    protected void cleanup() {
        // Optional: subclasses override if needed
    }
}

public class CsvExporter extends DataExporter {
    @Override
    protected List<Data> fetchData(ExportRequest request) {
        return databaseService.query(request.getSql());
    }

    @Override
    protected List<Data> processData(List<Data> data) {
        return CsvConverter.toCsv(data);
    }

    @Override
    protected void writeToFile(List<Data> data, ExportRequest request) {
        FileWriter writer = new FileWriter(request.getOutputPath());
        for (Data d : data) {
            writer.write(d.toCsvLine());
        }
        writer.close();
    }
}

public class ExcelExporter extends DataExporter {
    @Override
    protected List<Data> fetchData(ExportRequest request) {
        return databaseService.query(request.getSql());
    }

    @Override
    protected List<Data> processData(List<Data> data) {
        return ExcelConverter.toExcel(data);
    }

    @Override
    protected void writeToFile(List<Data> data, ExportRequest request) {
        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet();
        int rowNum = 0;
        for (Data d : data) {
            Row row = sheet.createRow(rowNum++);
            d.fillExcelRow(row);
        }
        try (FileOutputStream fos = new FileOutputStream(request.getOutputPath())) {
            workbook.write(fos);
        }
    }
}

// Usage
@Service
public class ReportService {
    public ExportResult generateReport(ReportRequest request) {
        DataExporter exporter = request.getFormat().equals("CSV")
            ? new CsvExporter()
            : new ExcelExporter();

        return exporter.export(new ExportRequest(request));
    }
}
```

**Interview tip:**  
"Template Method fixes the algorithm structure and lets subclasses specialize specific steps. Don't abuse it—use composition (Strategy pattern) when algorithm switching is frequent. In Spring Boot, `JdbcTemplate`, `RestTemplate` use this pattern."

---

## Architectural Patterns

### Q17: Dependency Injection (DI)

**The simple answer:**  
Objects **don't create their dependencies; they receive them** from outside (usually a framework). Enables loose coupling and better testing.

**Production example:**  
```java
// ❌ BAD: Tightly coupled
@Service
public class OrderService {
    private EmailService emailService = new EmailService();  // Creates own dependency
    private PaymentService paymentService = new PaymentService();

    public void placeOrder(Order order) {
        paymentService.charge(order);
        emailService.sendConfirmation(order);
    }
}

// Testing is hard — you can't replace PaymentService with a mock

// ✅ GOOD: Dependencies injected
@Service
public class OrderService {
    private final EmailService emailService;
    private final PaymentService paymentService;

    // Constructor injection (recommended)
    public OrderService(EmailService emailService, PaymentService paymentService) {
        this.emailService = emailService;
        this.paymentService = paymentService;
    }

    public void placeOrder(Order order) {
        paymentService.charge(order);
        emailService.sendConfirmation(order);
    }
}

// Testing
@Test
public void testPlaceOrder() {
    EmailService mockEmail = mock(EmailService.class);
    PaymentService mockPayment = mock(PaymentService.class);

    OrderService orderService = new OrderService(mockEmail, mockPayment);
    orderService.placeOrder(new Order(...));

    verify(mockPayment).charge(any());
    verify(mockEmail).sendConfirmation(any());
}
```

**Three DI approaches (Spring Boot):**  
```java
// 1. Constructor Injection (PREFERRED)
@Service
public class OrderService {
    private final EmailService emailService;

    public OrderService(EmailService emailService) {
        this.emailService = emailService;
    }
}

// 2. Setter Injection
@Service
public class OrderService {
    private EmailService emailService;

    @Autowired
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}

// 3. Field Injection (NOT RECOMMENDED)
@Service
public class OrderService {
    @Autowired
    private EmailService emailService;  // Hard to test, unpredictable initialization
}
```

**Interview tip:**  
"Use constructor injection—it makes dependencies explicit, enables testing with mocks, and allows `final` fields. Spring's IoC container automatically wires dependencies. Never use field injection in production code."

---

### Q18: Repository Pattern

**The simple answer:**  
An **abstraction layer between business logic and data access**. Your service talks to a Repository interface, not directly to the database.

**Production example:**  
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusAndCreatedDateAfter(UserStatus status, LocalDateTime date);
}

// Service depends on interface, not implementation
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        User user = new User(
            request.getName(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            UserStatus.ACTIVE
        );

        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
    }
}

// Testing with mock repository
@Test
public class UserServiceTest {
    private UserRepository mockRepository;
    private PasswordEncoder mockEncoder;
    private UserService userService;

    @Before
    public void setup() {
        mockRepository = mock(UserRepository.class);
        mockEncoder = mock(PasswordEncoder.class);
        userService = new UserService(mockRepository, mockEncoder);
    }

    @Test
    public void testRegisterUser() {
        when(mockRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(mockEncoder.encode("password123")).thenReturn("hashed");
        when(mockRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        UserRegistrationRequest request = new UserRegistrationRequest("John", "test@example.com", "password123");
        User result = userService.registerUser(request);

        assertEquals("John", result.getName());
        verify(mockRepository).save(any(User.class));
    }
}
```

**Interview tip:**  
"Repository abstracts data access. I can swap PostgreSQL for MongoDB by creating a new Repository implementation—services don't change. It's essential for testability and flexibility."

---

### Q19: Data Transfer Object (DTO)

**The simple answer:**  
Simple objects that **carry data between layers** without business logic. Protects internal entity structure and controls API contracts.

**Production example:**  
```java
// Entity — maps to database
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    private String name;
    private String email;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String passwordHash;  // Don't expose to API
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean deleted;  // Internal flag
}

// Response DTO — only what client should see
@Data
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
}

// Request DTO — validation rules
@Data
public class UserRegistrationDTO {
    @NotBlank(message = "Name required")
    private String name;

    @Email(message = "Valid email required")
    private String email;

    @Size(min = 8, message = "Password min 8 characters")
    private String password;
}

// Update DTO
@Data
public class UserUpdateDTO {
    @NotBlank
    private String name;

    @Email
    private String email;
}

// Mapping interface (MapStruct)
@Mapper
public interface UserMapper {
    UserResponseDTO toResponseDTO(User user);
    User toEntity(UserRegistrationDTO dto);
    void updateEntity(UserUpdateDTO dto, @Mapping(target = "id", ignore = true) User user);
}

// Service usage
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public UserResponseDTO register(UserRegistrationDTO dto) {
        User user = userMapper.toEntity(dto);
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        User saved = userRepository.save(user);
        return userMapper.toResponseDTO(saved);
    }

    public UserResponseDTO getUser(Long id) {
        return userRepository.findById(id)
            .map(userMapper::toResponseDTO)
            .orElseThrow();
    }

    @Transactional
    public UserResponseDTO updateUser(Long id, UserUpdateDTO dto) {
        User user = userRepository.findById(id).orElseThrow();
        userMapper.updateEntity(dto, user);
        return userMapper.toResponseDTO(userRepository.save(user));
    }
}

// Controller
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public UserResponseDTO register(@Valid @RequestBody UserRegistrationDTO dto) {
        return userService.register(dto);
    }

    @GetMapping("/{id}")
    public UserResponseDTO getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PutMapping("/{id}")
    public UserResponseDTO updateUser(@PathVariable Long id,
                                      @Valid @RequestBody UserUpdateDTO dto) {
        return userService.updateUser(id, dto);
    }
}
```

**Interview tip:**  
"DTOs decouple API contracts from database schemas. If I change database fields, the API stays the same. DTOs also enable validation at API boundaries. Always use separate DTOs for request/response to control what data flows in/out."

---

### Q20: CQRS (Command Query Responsibility Segregation)

**The simple answer:**  
Separate **read operations (queries)** from **write operations (commands)** into different models. Enables independent scaling and optimization.

**Production example:**  
```java
// Command side — handles writes
public record TransferMoneyCommand(
    String fromAccountId,
    String toAccountId,
    BigDecimal amount,
    String idempotencyKey
) {}

@Service
public class TransferCommandService {
    private final AccountRepository accountRepository;
    private final EventBus eventBus;

    @Transactional
    public void executeTransfer(TransferMoneyCommand command) {
        Account from = accountRepository.findByIdForUpdate(command.fromAccountId());
        Account to = accountRepository.findByIdForUpdate(command.toAccountId());

        if (from.getBalance().compareTo(command.amount()) < 0) {
            throw new InsufficientFundsException();
        }

        from.debit(command.amount());
        to.credit(command.amount());

        accountRepository.saveAll(List.of(from, to));

        // Publish event for other services
        eventBus.publish(new MoneyTransferredEvent(
            command.fromAccountId(),
            command.toAccountId(),
            command.amount(),
            LocalDateTime.now()
        ));
    }
}

// Read side — optimized for queries (from event listeners)
@Entity
@Table(name = "dashboard_transactions")
@Data
public class TransactionSummary {
    @Id
    private String transactionId;
    private String fromAccount;
    private String toAccount;
    private BigDecimal amount;
    private LocalDateTime timestamp;
}

@Repository
public interface TransactionSummaryRepository extends JpaRepository<TransactionSummary, String> {
    List<TransactionSummary> findByFromAccountOrderByTimestampDesc(String accountId);
    List<TransactionSummary> findByToAccountOrderByTimestampDesc(String accountId);
    List<TransactionSummary> findByTimestampBetween(LocalDateTime from, LocalDateTime to);
}

// Read model updater
@Component
public class TransactionSummaryUpdater {
    private final TransactionSummaryRepository repository;

    @EventListener
    @Async
    public void onMoneyTransferred(MoneyTransferredEvent event) {
        TransactionSummary summary = new TransactionSummary();
        summary.setTransactionId(UUID.randomUUID().toString());
        summary.setFromAccount(event.getFromAccountId());
        summary.setToAccount(event.getToAccountId());
        summary.setAmount(event.getAmount());
        summary.setTimestamp(event.getTimestamp());

        repository.save(summary);
    }
}

// Query side — fast reads
@Service
public class ReportQueryService {
    private final TransactionSummaryRepository summaryRepository;

    public List<TransactionDTO> getAccountTransactions(String accountId, int limit) {
        return summaryRepository.findByFromAccountOrderByTimestampDesc(accountId)
            .stream()
            .limit(limit)
            .map(this::toDTO)
            .collect(toList());
    }

    public BigDecimal calculateDailyTotal(String accountId, LocalDate date) {
        return summaryRepository.findByTimestampBetween(
            date.atStartOfDay(),
            date.plusDays(1).atStartOfDay()
        )
        .stream()
        .filter(t -> t.getFromAccount().equals(accountId))
        .map(TransactionSummary::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

// API exposes commands and queries separately
@RestController
@RequestMapping("/api/transfers")
public class TransferController {
    private final TransferCommandService commandService;
    private final ReportQueryService reportService;

    @PostMapping
    public void transfer(@RequestBody TransferMoneyCommand command) {
        commandService.executeTransfer(command);
    }

    @GetMapping("/{accountId}")
    public List<TransactionDTO> getTransactions(@PathVariable String accountId) {
        return reportService.getAccountTransactions(accountId, 100);
    }

    @GetMapping("/{accountId}/daily-total")
    public BigDecimal getDailyTotal(@PathVariable String accountId,
                                    @RequestParam LocalDate date) {
        return reportService.calculateDailyTotal(accountId, date);
    }
}
```

**Benefits:**  
- Write model: Normalized, consistent, slower (ensures ACID)
- Read model: Denormalized, optimized for queries, fast (can eventually consistent)
- Scale independently: 100 write servers, 5000 read replicas

**Interview tip:**  
"CQRS is overkill for small systems but essential for high-traffic platforms. Separate write and read concerns—writes validate strictly, reads are ultra-fast. Perfect for banking with heavy dashboards and light transaction endpoints."

---

## Core Principles & Advanced Topics

### Q21: DRY, KISS, YAGNI

**DRY — Don't Repeat Yourself:**  
If code appears 3+ times, extract it. One source of truth.

```java
// ❌ BAD: Validation repeated
public class UserController {
    @PostMapping("/register")
    public void register(@RequestBody UserDTO user) {
        if (user.getEmail() == null || !user.getEmail().contains("@")) 
            throw new ValidationException("Invalid email");
        if (user.getPassword() == null || user.getPassword().length() < 8)
            throw new ValidationException("Password min 8 chars");
    }
}

public class AdminController {
    @PostMapping("/users")
    public void createUser(@RequestBody UserDTO user) {
        if (user.getEmail() == null || !user.getEmail().contains("@")) 
            throw new ValidationException("Invalid email");
        if (user.getPassword() == null || user.getPassword().length() < 8)
            throw new ValidationException("Password min 8 chars");
    }
}

// ✅ GOOD: Extract to shared validator
@Component
public class UserValidator {
    public void validate(UserDTO user) {
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            throw new ValidationException("Invalid email");
        }
        if (user.getPassword() == null || user.getPassword().length() < 8) {
            throw new ValidationException("Password min 8 chars");
        }
    }
}
```

**KISS — Keep It Simple, Stupid:**  
The simplest solution that works is usually the best. Avoid over-engineering.

```java
// ❌ Over-engineered: Complex factory with reflection
public class TransactionProcessorFactory {
    public TransactionProcessor create(Class<?> processorClass) {
        try {
            Constructor<?> constructor = processorClass.getDeclaredConstructor();
            constructor.setAccessible(true);
            return (TransactionProcessor) constructor.newInstance();
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}

// ✅ KISS: Simple enum
public enum TransactionProcessorFactory {
    TRANSFER(new TransferProcessor()),
    PAYMENT(new PaymentProcessor()),
    WITHDRAWAL(new WithdrawalProcessor());

    private final TransactionProcessor processor;

    TransactionProcessorFactory(TransactionProcessor processor) {
        this.processor = processor;
    }

    public TransactionProcessor get() {
        return processor;
    }
}
```

**YAGNI — You Aren't Gonna Need It:**  
Don't build features "just in case." Build what you need now.

```java
// ❌ YAGNI violation: Premature optimization
public class UserCache {
    private final Map<Long, User> cache = new ConcurrentHashMap<>();
    private final ScheduledExecutor scheduler = Executors.newScheduledThreadPool(5);
    private final Semaphore semaphore = new Semaphore(100);

    public User get(Long id) {
        // Complex caching logic nobody asked for yet
    }
}

// ✅ YAGNI: Start simple, add caching only when needed
@Service
public class UserService {
    private final UserRepository userRepository;

    public User getUser(Long id) {
        return userRepository.findById(id).orElseThrow();
    }
}

// Later, if caching is needed, add it via decorator or @Cacheable
@Service
public class CachedUserService {
    @Cacheable(value = "users")
    public User getUser(Long id) {
        return userService.getUser(id);
    }
}
```

**Interview tip:**  
"DRY prevents bugs when code changes. KISS keeps code readable. YAGNI prevents junk features. Start with KISS, refactor to DRY when you see patterns, use YAGNI to avoid waste. These three keep code maintainable."

---

### Q22: Circuit Breaker Pattern

**The simple answer:**  
If an external service keeps failing, **stop calling it for a while** instead of wasting resources.

**Production implementation:**  
```java
@Service
public class PaymentService {
    private final RestTemplate restTemplate;

    @CircuitBreaker(
        name = "payment_gateway",
        fallbackMethod = "processingFallback"
    )
    public PaymentResult processPayment(PaymentRequest request) {
        String url = "https://payment-provider.com/charge"\;
        return restTemplate.postForObject(url, request, PaymentResult.class);
    }

    public PaymentResult processingFallback(PaymentRequest request, Exception ex) {
        logger.error("Circuit open; using fallback for payment", ex);
        return new PaymentResult(
            "PENDING",  // Mark as pending, will retry later
            "Gateway temporarily unavailable; will retry"
        );
    }
}

@Configuration
public class CircuitBreakerConfig {
    @Bean
    public CircuitBreakerConfigCustomizer circuitBreakerCustomizer() {
        return circuitBreakerRegistry -> circuitBreakerRegistry
            .getConfiguration(DEFAULT)
            .custom(circuitBreakerConfig()
                .failureRateThreshold(50)  // Open if 50% of calls fail
                .waitDurationInOpenState(Duration.ofSeconds(30))
                .permittedNumberOfCallsInHalfOpenState(3)
                .slidingWindowSize(10)
                .build()
            );
    }
}
```

**Interview tip:**  
"Circuit Breaker prevents cascading failures. When one service is down, don't hammer it with requests—pause and retry later. Essential for microservices resilience."

---

### Q23: Saga Pattern (Banking)

**The simple answer:**  
Coordinate distributed transactions across multiple services using a sequence of local transactions + compensating steps if anything fails.

**Production example:**  
```java
public class MoneyTransferSaga {
    private final AccountService accountService;
    private final NotificationService notificationService;

    @Transactional
    public void executeTransfer(TransferRequest request) {
        String sagaId = UUID.randomUUID().toString();

        try {
            // Step 1: Debit source account
            AccountDebitCommand debitCommand = new AccountDebitCommand(
                sagaId,
                request.getFromAccount(),
                request.getAmount()
            );
            accountService.debit(debitCommand);

            // Step 2: Credit destination account
            AccountCreditCommand creditCommand = new AccountCreditCommand(
                sagaId,
                request.getToAccount(),
                request.getAmount()
            );
            accountService.credit(creditCommand);

            // Step 3: Notify user
            NotificationCommand notifyCommand = new NotificationCommand(
                sagaId,
                request.getUserId(),
                "Transfer completed"
            );
            notificationService.notify(notifyCommand);

        } catch (InsufficientFundsException e) {
            // Compensation: Reverse debit (credit back)
            accountService.compensateDebit(sagaId, request.getFromAccount(), request.getAmount());
            notificationService.notifyFailure(sagaId, request.getUserId(), "Insufficient funds");
            throw e;
        }
        catch (AccountNotFound ex) {
            // Compensation: Reverse both debit and credit
            accountService.compensateDebit(sagaId, request.getFromAccount(), request.getAmount());
            accountService.compensateCredit(sagaId, request.getToAccount(), request.getAmount());
            throw ex;
        }
    }
}
```

**Interview tip:**  
"Saga pattern ensures eventual consistency in distributed systems. If any step fails, compensate previous steps. It's the standard for banking—never use 2PC (two-phase commit)."

---

### Q24: Outbox Pattern (Banking Critical)

**The simple answer:**  
Ensure database writes and event publishing are **atomic**. Write both to the same transaction.

**Production implementation:**  
```java
// Outbox row written in same transaction as domain change
@Entity
@Table(name = "outbox_events")
@Data
public class OutboxEvent {
    @Id
    private String eventId;
    private String aggregateId;
    private String eventType;
    private String payload;  // JSON
    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;  // NULL until published
}

@Service
public class TransferService {
    private final TransferRepository transferRepository;
    private final OutboxRepository outboxRepository;

    @Transactional  // All-or-nothing
    public void executeTransfer(TransferRequest request) {
        String transferId = UUID.randomUUID().toString();

        // 1. Update domain
        Transfer transfer = new Transfer(transferId, request);
        transferRepository.save(transfer);

        // 2. Write to OUTBOX (same transaction)
        OutboxEvent event = new OutboxEvent(
            UUID.randomUUID().toString(),
            transferId,
            "MoneyTransferred",
            new JSONObject()
                .put("fromAccount", request.getFromAccount())
                .put("toAccount", request.getToAccount())
                .put("amount", request.getAmount())
                .toString(),
            LocalDateTime.now(),
            null  // Not yet published
        );
        outboxRepository.save(event);
        // Transaction commits: EITHER both save OR both rollback
    }
}

// Separate CDC service publishes Outbox rows
@Component
public class OutboxPublisher {
    @Scheduled(fixedDelay = 1000)  // Run every second
    public void publishOutboxEvents() {
        List<OutboxEvent> unpublished = outboxRepository.findByPublishedAtIsNull();

        for (OutboxEvent event : unpublished) {
            try {
                kafkaTemplate.send("transfer-events", event.getPayload());
                event.setPublishedAt(LocalDateTime.now());
                outboxRepository.save(event);
            } catch (Exception e) {
                logger.error("Failed to publish event: {}", event.getEventId(), e);
                // Retry on next run
            }
        }
    }
}
```

**Interview tip:**  
"Outbox Pattern is **critical for banking**. It guarantees: If database update succeeds, event WILL eventually be published. If it fails, neither happens. No phantom events. This is the gold standard for consistency."

---

### Q25: Testability & Design for Testing

**The simple answer:**  
**Well-designed code is easy to test.** If something is hard to test, redesign it.

**Production patterns:**  
```java
// ❌ HARD TO TEST: Static methods, global state
public class PaymentCalculator {
    public static BigDecimal calculate(BigDecimal amount) {
        BigDecimal rate = ExchangeRateService.getCurrentRate();  // Static call!
        return amount.multiply(rate);
    }
}

// ❌ Hard to mock ExchangeRateService

// ✅ EASY TO TEST: Inject dependencies
@Service
public class PaymentCalculator {
    private final ExchangeRateService exchangeRateService;

    public PaymentCalculator(ExchangeRateService exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }

    public BigDecimal calculate(BigDecimal amount) {
        BigDecimal rate = exchangeRateService.getCurrentRate();
        return amount.multiply(rate);
    }
}

// ✅ Easy to test with mock
@Test
public void testCalculate() {
    ExchangeRateService mockService = mock(ExchangeRateService.class);
    when(mockService.getCurrentRate()).thenReturn(new BigDecimal("4050"));

    PaymentCalculator calculator = new PaymentCalculator(mockService);
    BigDecimal result = calculator.calculate(new BigDecimal("100"));

    assertEquals(new BigDecimal("405000"), result);
}
```

**Design patterns that improve testability:**  
1. **Dependency Injection** — Inject mocks
2. **Single Responsibility** — Test one thing per class
3. **Repository Pattern** — Mock data access
4. **Strategy Pattern** — Swap implementations for testing
5. **Facade Pattern** — Mock subsystems

**Interview tip:**  
"Testability is a sign of good design. If code is easy to test, it's decoupled, focused, and single-responsibility. I always ask: 'Can I test this without mocking 10 dependencies?' If not, refactor."

---

## Summary Interview Checklist

- [ ] SOLID principles: Can explain all 5 with real-world examples
- [ ] Creational patterns: Singleton, Factory, Builder
- [ ] Structural patterns: Adapter, Facade, Decorator, Proxy
- [ ] Behavioral patterns: Strategy, Observer, Command, Template Method
- [ ] Dependency Injection: Constructor > Setter > Field
- [ ] Repository Pattern: Abstract data access
- [ ] DTO Pattern: Protect entity structures
- [ ] CQRS: Separate reads and writes
- [ ] Circuit Breaker: Handle external failures
- [ ] Saga Pattern: Distributed transactions (banking)
- [ ] Outbox Pattern: Atomic publish (banking)
- [ ] DRY, KISS, YAGNI: Code quality principles
- [ ] Testability: Code design for testing
- [ ] Code examples: Can write production-grade code

---

## Banking-Specific Pattern Summary

| Pattern | Problem | Solution | Banking Use |
|---------|---------|----------|-------------|
| **Saga** | Distributed transactions | Orchestrated local transactions | Multi-service transfers |
| **Outbox** | Atomicity of DB + events | Write both in one transaction | Event-driven consistency |
| **CQRS** | Heavy read traffic | Separate read/write models | Dashboards + transactions |
| **Circuit Breaker** | External service failures | Stop calling, retry later | Payment gateway resilience |
| **Repository** | Data access coupling | Abstract via interface | Easy to swap implementations |
| **DTO** | Entity exposure | Separate req/resp objects | API contract security |

