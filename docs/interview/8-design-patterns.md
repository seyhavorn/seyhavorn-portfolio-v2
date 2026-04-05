# Senior Backend Interview — Design Patterns & Principles (Banking/Fintech)

---

## Part 1: SOLID Principles

---

### Q1. What are the SOLID principles? Why do they matter?

SOLID is a set of 5 rules that help you write code that's **easy to change, easy to test, and easy to understand**.

| Letter | Principle | One-liner |
|---|---|---|
| **S** | Single Responsibility | A class should do one thing only |
| **O** | Open/Closed | Open for extension, closed for modification |
| **L** | Liskov Substitution | A child class should work anywhere its parent does |
| **I** | Interface Segregation | Don't force classes to implement methods they don't need |
| **D** | Dependency Inversion | Depend on abstractions (interfaces), not concrete classes |

**Why it matters:** Without SOLID, you end up with "spaghetti code" — one small change breaks 10 other things. SOLID keeps your code modular and manageable.

---

### Q2. Explain Single Responsibility Principle (SRP) with an example.

**Rule:** A class should have only **one reason to change**.

**Bad — doing too many things:**
```java
public class UserService {
    public void createUser(User user) { /* save to DB */ }
    public void sendWelcomeEmail(User user) { /* send email */ }
    public String generateReport(List<User> users) { /* create PDF */ }
}
```
If email logic changes, you modify `UserService`. If report format changes, you modify `UserService` again. Too many reasons to change.

**Good — each class does one thing:**
```java
public class UserService {
    public void createUser(User user) { /* save to DB */ }
}

public class EmailService {
    public void sendWelcomeEmail(User user) { /* send email */ }
}

public class ReportService {
    public String generateUserReport(List<User> users) { /* create PDF */ }
}
```

Now each class changes for only one reason. Easier to test, easier to maintain.

---

### Q3. Explain Open/Closed Principle (OCP) with an example.

**Rule:** You should be able to **add new behavior without changing existing code**.

**Bad — modifying existing code for every new type:**
```java
public class PaymentProcessor {
    public void process(String type, double amount) {
        if (type.equals("CREDIT_CARD")) {
            // credit card logic
        } else if (type.equals("PAYPAL")) {
            // PayPal logic
        } else if (type.equals("CRYPTO")) {
            // adding new type = modifying this class every time!
        }
    }
}
```

**Good — extend with new classes, don't touch existing ones:**
```java
public interface PaymentMethod {
    void pay(double amount);
}

public class CreditCardPayment implements PaymentMethod {
    public void pay(double amount) { /* credit card logic */ }
}

public class PayPalPayment implements PaymentMethod {
    public void pay(double amount) { /* PayPal logic */ }
}

// Adding crypto? Just add a new class — no existing code changes!
public class CryptoPayment implements PaymentMethod {
    public void pay(double amount) { /* crypto logic */ }
}
```

---

### Q4. Explain Liskov Substitution Principle (LSP) with an example.

**Rule:** If class B extends class A, you should be able to **use B anywhere A is expected** without breaking anything.

**Bad — child breaks parent's behavior:**
```java
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int w) { this.width = w; this.height = w; }  // forces both!
    @Override
    public void setHeight(int h) { this.width = h; this.height = h; }
}

// This breaks:
Rectangle r = new Square();
r.setWidth(5);
r.setHeight(3);
// Expected area = 15, but actual = 9 (because Square forced width = 3 too)
```

**Good — use separate classes or a common interface:**
```java
public interface Shape {
    int getArea();
}

public class Rectangle implements Shape {
    private int width, height;
    public Rectangle(int w, int h) { this.width = w; this.height = h; }
    public int getArea() { return width * height; }
}

public class Square implements Shape {
    private int side;
    public Square(int s) { this.side = s; }
    public int getArea() { return side * side; }
}
```

---

### Q5. Explain Interface Segregation Principle (ISP) with an example.

**Rule:** Don't force a class to implement methods it doesn't need. **Many small interfaces > one big interface.**

**Bad — one fat interface:**
```java
public interface Worker {
    void work();
    void eat();
    void sleep();
}

public class Robot implements Worker {
    public void work() { /* OK */ }
    public void eat() { /* Robots don't eat! Forced to implement empty method */ }
    public void sleep() { /* Robots don't sleep! */ }
}
```

**Good — split into focused interfaces:**
```java
public interface Workable { void work(); }
public interface Eatable { void eat(); }
public interface Sleepable { void sleep(); }

public class Human implements Workable, Eatable, Sleepable {
    public void work() { /* ... */ }
    public void eat() { /* ... */ }
    public void sleep() { /* ... */ }
}

public class Robot implements Workable {
    public void work() { /* Only what it needs */ }
}
```

---

### Q6. Explain Dependency Inversion Principle (DIP) with an example.

**Rule:** High-level code shouldn't depend on low-level code. Both should depend on **abstractions (interfaces)**.

**Think of it like:** A lamp shouldn't be wired directly to your house. It plugs into a **socket** (interface). You can plug in any lamp without rewiring the house.

**Bad — tightly coupled:**
```java
public class OrderService {
    private MySQLDatabase db = new MySQLDatabase();  // directly depends on MySQL

    public void saveOrder(Order order) {
        db.save(order);  // what if we switch to PostgreSQL? Change this class!
    }
}
```

**Good — depend on interface:**
```java
public interface Database {
    void save(Object entity);
}

public class MySQLDatabase implements Database {
    public void save(Object entity) { /* MySQL logic */ }
}

public class PostgreSQLDatabase implements Database {
    public void save(Object entity) { /* PostgreSQL logic */ }
}

public class OrderService {
    private final Database db;  // depends on interface, not implementation

    public OrderService(Database db) {  // injected via constructor
        this.db = db;
    }

    public void saveOrder(Order order) {
        db.save(order);  // works with any database!
    }
}
```

**In Spring Boot:** This is exactly what `@Autowired` and `@Service` do — Spring injects the right implementation for you.

---

## Part 2: Common Design Patterns

---

### Q7. What are design patterns? What are the 3 categories?

Design patterns are **proven solutions to common problems** in software design. Think of them as recipes — you don't invent a new way to make bread every time.

| Category | Purpose | Examples |
|---|---|---|
| **Creational** | How to create objects | Singleton, Factory, Builder |
| **Structural** | How to organize classes | Adapter, Facade, Decorator, Proxy |
| **Behavioral** | How objects communicate | Strategy, Observer, Command, Template Method |

---

### Q8. Explain the Singleton Pattern.

**What:** Only **one instance** of a class exists in the whole application.

**When to use:** Database connection pool, configuration, logging, caching.

```java
public class DatabaseConnection {
    private static volatile DatabaseConnection instance;

    private DatabaseConnection() { }  // private constructor — can't create from outside

    public static DatabaseConnection getInstance() {
        if (instance == null) {                    // first check (no lock)
            synchronized (DatabaseConnection.class) {
                if (instance == null) {            // second check (with lock)
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}
```

**Why double-checked locking?** Without `synchronized`, two threads could create two instances. But `synchronized` is slow — so we check first without lock. Only if it's null, we lock and check again.

**In Spring Boot:** All beans are Singleton by default. You don't need to implement this yourself — just use `@Service`, `@Component`, etc.

---

### Q9. Explain the Factory Pattern.

**What:** A method that creates objects for you **without exposing the creation logic**. The caller says *what* it wants, not *how* to build it.

**When to use:** When object creation is complex, or you need different types based on input.

```java
public interface Notification {
    void send(String message);
}

public class EmailNotification implements Notification {
    public void send(String message) { System.out.println("Email: " + message); }
}

public class SMSNotification implements Notification {
    public void send(String message) { System.out.println("SMS: " + message); }
}

public class PushNotification implements Notification {
    public void send(String message) { System.out.println("Push: " + message); }
}

// The Factory — decides which class to create
public class NotificationFactory {
    public static Notification create(String type) {
        return switch (type) {
            case "EMAIL" -> new EmailNotification();
            case "SMS"   -> new SMSNotification();
            case "PUSH"  -> new PushNotification();
            default      -> throw new IllegalArgumentException("Unknown: " + type);
        };
    }
}

// Usage — caller doesn't know the concrete classes
Notification n = NotificationFactory.create("EMAIL");
n.send("Hello!");
```

**Real-world:** Spring's `BeanFactory`, JDBC's `DriverManager.getConnection()`.

---

### Q10. Explain the Builder Pattern.

**What:** Build a complex object **step by step**. Especially useful when an object has many optional fields.

**When to use:** When constructors have too many parameters (telescope constructor problem).

**Bad — confusing constructor:**
```java
// Which parameter is which??
new User("John", "Doe", 25, "john@email.com", null, true, false, "EN");
```

**Good — Builder pattern:**
```java
public class User {
    private final String firstName;
    private final String lastName;
    private final int age;
    private final String email;
    private final String phone;
    private final boolean active;

    private User(Builder builder) {
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.age = builder.age;
        this.email = builder.email;
        this.phone = builder.phone;
        this.active = builder.active;
    }

    public static class Builder {
        private final String firstName;  // required
        private final String lastName;   // required
        private int age;
        private String email;
        private String phone;
        private boolean active = true;

        public Builder(String firstName, String lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }

        public Builder age(int age) { this.age = age; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder active(boolean active) { this.active = active; return this; }

        public User build() { return new User(this); }
    }
}

// Usage — clean and readable!
User user = new User.Builder("John", "Doe")
    .age(25)
    .email("john@email.com")
    .active(true)
    .build();
```

**In practice:** Use **Lombok's `@Builder`** annotation to generate all this automatically.

---

### Q11. Explain the Strategy Pattern.

**What:** Define a family of algorithms, put each one in a separate class, and make them **interchangeable** at runtime.

**When to use:** When you have multiple ways to do the same thing and want to switch between them.

**Real example — payment processing:**
```java
public interface PaymentStrategy {
    void pay(double amount);
}

public class CreditCardStrategy implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Paid $" + amount + " via Credit Card"); }
}

public class PayPalStrategy implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Paid $" + amount + " via PayPal"); }
}

public class CryptoStrategy implements PaymentStrategy {
    public void pay(double amount) { System.out.println("Paid $" + amount + " via Crypto"); }
}

// Context — uses whatever strategy is given
public class PaymentService {
    private PaymentStrategy strategy;

    public void setStrategy(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    public void checkout(double amount) {
        strategy.pay(amount);
    }
}

// Usage
PaymentService service = new PaymentService();
service.setStrategy(new CreditCardStrategy());  // can switch at runtime
service.checkout(99.99);
```

**In Spring Boot:** Use `@Autowired List<PaymentStrategy>` to automatically inject all implementations, then pick the right one by type.

---

### Q12. Explain the Observer Pattern.

**What:** When one object changes, all objects that are "watching" it get **notified automatically**.

**Think of it like:** YouTube subscriptions. When a channel uploads a video, all subscribers get notified.

```java
public interface EventListener {
    void onEvent(String eventType, String data);
}

public class EmailAlert implements EventListener {
    public void onEvent(String eventType, String data) {
        System.out.println("Email alert: " + eventType + " - " + data);
    }
}

public class SlackAlert implements EventListener {
    public void onEvent(String eventType, String data) {
        System.out.println("Slack message: " + eventType + " - " + data);
    }
}

public class EventPublisher {
    private Map<String, List<EventListener>> listeners = new HashMap<>();

    public void subscribe(String eventType, EventListener listener) {
        listeners.computeIfAbsent(eventType, k -> new ArrayList<>()).add(listener);
    }

    public void publish(String eventType, String data) {
        List<EventListener> subs = listeners.getOrDefault(eventType, List.of());
        for (EventListener listener : subs) {
            listener.onEvent(eventType, data);
        }
    }
}

// Usage
EventPublisher publisher = new EventPublisher();
publisher.subscribe("ORDER_CREATED", new EmailAlert());
publisher.subscribe("ORDER_CREATED", new SlackAlert());
publisher.publish("ORDER_CREATED", "Order #123");
// Both EmailAlert and SlackAlert get notified!
```

**In Spring Boot:** `@EventListener` and `ApplicationEventPublisher` are built-in Observer pattern.

---

### Q13. Explain the Adapter Pattern.

**What:** Makes two **incompatible interfaces work together**. Like using a power adapter when traveling — your plug doesn't fit, so you use an adapter in between.

**When to use:** Integrating with third-party libraries or legacy code that has a different interface.

```java
// Old system — you can't change this
public class OldPaymentGateway {
    public void makePayment(String xmlData) {
        System.out.println("Processing XML payment: " + xmlData);
    }
}

// Your system uses JSON
public interface ModernPayment {
    void pay(String jsonData);
}

// Adapter — converts between the two
public class PaymentAdapter implements ModernPayment {
    private OldPaymentGateway oldGateway;

    public PaymentAdapter(OldPaymentGateway oldGateway) {
        this.oldGateway = oldGateway;
    }

    public void pay(String jsonData) {
        String xmlData = convertJsonToXml(jsonData);  // convert format
        oldGateway.makePayment(xmlData);               // call old system
    }

    private String convertJsonToXml(String json) {
        return "<payment>" + json + "</payment>";  // simplified conversion
    }
}

// Usage — your code works with modern interface
ModernPayment payment = new PaymentAdapter(new OldPaymentGateway());
payment.pay("{amount: 100}");
```

---

### Q14. Explain the Facade Pattern.

**What:** Provides a **simple interface** to a complex system. Like a hotel front desk — you ask one person, and they handle everything behind the scenes.

**When to use:** When a subsystem has many classes and you want to simplify the API.

```java
// Complex subsystem — many classes
public class InventoryService {
    public boolean checkStock(String productId) { return true; }
}
public class PaymentService {
    public boolean charge(String userId, double amount) { return true; }
}
public class ShippingService {
    public String ship(String productId, String address) { return "TRACK123"; }
}
public class NotificationService {
    public void notify(String userId, String message) { }
}

// Facade — one simple method that does everything
public class OrderFacade {
    private InventoryService inventory = new InventoryService();
    private PaymentService payment = new PaymentService();
    private ShippingService shipping = new ShippingService();
    private NotificationService notification = new NotificationService();

    public String placeOrder(String userId, String productId, double amount, String address) {
        if (!inventory.checkStock(productId))
            throw new RuntimeException("Out of stock");

        if (!payment.charge(userId, amount))
            throw new RuntimeException("Payment failed");

        String trackingId = shipping.ship(productId, address);
        notification.notify(userId, "Order shipped! Tracking: " + trackingId);
        return trackingId;
    }
}

// Usage — caller doesn't need to know about 4 different services
OrderFacade facade = new OrderFacade();
String tracking = facade.placeOrder("user1", "prod1", 29.99, "123 Main St");
```

---

### Q15. Explain the Decorator Pattern.

**What:** Add **extra behavior** to an object without changing its original class. Like adding toppings to a pizza — the base pizza doesn't change.

**When to use:** When you want to add features dynamically, without creating many subclasses.

```java
public interface Coffee {
    double getCost();
    String getDescription();
}

public class BasicCoffee implements Coffee {
    public double getCost() { return 2.00; }
    public String getDescription() { return "Basic Coffee"; }
}

// Decorator base
public abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;
    public CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }
}

public class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) { super(coffee); }
    public double getCost() { return coffee.getCost() + 0.50; }
    public String getDescription() { return coffee.getDescription() + " + Milk"; }
}

public class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) { super(coffee); }
    public double getCost() { return coffee.getCost() + 0.25; }
    public String getDescription() { return coffee.getDescription() + " + Sugar"; }
}

// Usage — stack decorators!
Coffee order = new SugarDecorator(new MilkDecorator(new BasicCoffee()));
System.out.println(order.getDescription());  // "Basic Coffee + Milk + Sugar"
System.out.println(order.getCost());          // 2.75
```

**In Java:** `BufferedReader(new FileReader(...))` is a Decorator. In Spring: `@Transactional`, `@Cacheable` are decorator-like (AOP).

---

### Q16. Explain the Template Method Pattern.

**What:** Define the **skeleton of an algorithm** in a parent class. Let child classes fill in specific steps without changing the structure.

**Think of it like:** A recipe template — the steps (prep, cook, serve) are fixed, but *how* you do each step changes for different dishes.

```java
public abstract class DataExporter {
    // Template method — defines the steps (can't be overridden)
    public final void export() {
        fetchData();
        processData();
        writeToFile();
        cleanup();
    }

    protected abstract void fetchData();       // child implements
    protected abstract void processData();     // child implements
    protected abstract void writeToFile();     // child implements

    protected void cleanup() {                 // optional — child can override
        System.out.println("Cleanup done");
    }
}

public class CsvExporter extends DataExporter {
    protected void fetchData() { System.out.println("Fetching from DB"); }
    protected void processData() { System.out.println("Converting to CSV format"); }
    protected void writeToFile() { System.out.println("Writing .csv file"); }
}

public class ExcelExporter extends DataExporter {
    protected void fetchData() { System.out.println("Fetching from DB"); }
    protected void processData() { System.out.println("Converting to Excel format"); }
    protected void writeToFile() { System.out.println("Writing .xlsx file"); }
}

// Usage
DataExporter exporter = new CsvExporter();
exporter.export();  // runs all 4 steps in order
```

**In Spring Boot:** `JdbcTemplate`, `RestTemplate` — the "Template" in the name means this pattern.

---

### Q17. Explain the Command Pattern.

**What:** Turn a request into a standalone **object** that contains all info about the request. This lets you queue, log, undo, or delay operations.

**Think of it like:** A restaurant order ticket. The waiter writes your order on a ticket (command object), gives it to the kitchen. The kitchen can process it now or later.

```java
public interface Command {
    void execute();
    void undo();
}

public class CreateUserCommand implements Command {
    private UserRepository repo;
    private User user;

    public CreateUserCommand(UserRepository repo, User user) {
        this.repo = repo;
        this.user = user;
    }

    public void execute() {
        repo.save(user);
        System.out.println("User created: " + user.getName());
    }

    public void undo() {
        repo.delete(user);
        System.out.println("User creation undone: " + user.getName());
    }
}

// Command invoker — can queue, log, retry commands
public class CommandExecutor {
    private List<Command> history = new ArrayList<>();

    public void run(Command command) {
        command.execute();
        history.add(command);
    }

    public void undoLast() {
        if (!history.isEmpty()) {
            Command last = history.removeLast();
            last.undo();
        }
    }
}
```

**In Spring Boot:** Used in CQRS (Command Query Responsibility Segregation) — separate read and write operations.

---

### Q18. Explain the Proxy Pattern.

**What:** A placeholder object that **controls access** to another object. Like a security guard at a building — you go through the guard before reaching the person inside.

**When to use:** Lazy loading, access control, logging, caching.

```java
public interface DataService {
    String getData(String key);
}

public class RealDataService implements DataService {
    public String getData(String key) {
        System.out.println("Fetching from database...");  // slow operation
        return "data_for_" + key;
    }
}

// Proxy — adds caching + logging without changing the real service
public class CachingProxy implements DataService {
    private RealDataService realService = new RealDataService();
    private Map<String, String> cache = new HashMap<>();

    public String getData(String key) {
        if (cache.containsKey(key)) {
            System.out.println("Cache hit for: " + key);
            return cache.get(key);
        }
        System.out.println("Cache miss for: " + key);
        String result = realService.getData(key);
        cache.put(key, result);
        return result;
    }
}
```

**In Spring Boot:** `@Transactional`, `@Cacheable`, `@Async` all work through proxies. Spring creates a proxy around your bean that adds behavior before/after your method.

---

## Part 3: Other Important Principles

---

### Q19. What is DRY, KISS, and YAGNI?

**DRY — Don't Repeat Yourself**
If you see the same code in 3 places, extract it into a method. One source of truth.

```java
// Bad — repeated validation everywhere
if (email != null && email.contains("@") && email.length() > 5) { ... }  // in 5 places

// Good — one method
public boolean isValidEmail(String email) {
    return email != null && email.contains("@") && email.length() > 5;
}
```

**KISS — Keep It Simple, Stupid**
Don't over-engineer. The simplest solution that works is usually the best.

```java
// Over-engineered
AbstractStrategyBasedValidatorFactoryBean<User> validator = ...

// KISS
if (user.getName().isBlank()) throw new ValidationException("Name required");
```

**YAGNI — You Aren't Gonna Need It**
Don't build features "just in case." Build what you need now. You can always add later.

---

### Q20. What is the Dependency Injection (DI) pattern?

**What:** Instead of a class creating its own dependencies, they are **given to it from outside** (injected).

**Without DI — tightly coupled:**
```java
public class OrderService {
    private EmailService emailService = new EmailService();  // creates its own
}
```

**With DI — loosely coupled:**
```java
public class OrderService {
    private final EmailService emailService;

    public OrderService(EmailService emailService) {  // injected from outside
        this.emailService = emailService;
    }
}
```

**3 types of injection in Spring:**

```java
// 1. Constructor Injection (recommended)
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

// 3. Field Injection (not recommended — hard to test)
@Service
public class OrderService {
    @Autowired
    private EmailService emailService;
}
```

**Why Constructor Injection is best:**
- Dependencies are clear (in the constructor signature)
- Object is always fully initialized
- Easy to test — just pass mocks in the constructor
- Can use `final` fields (immutable)

---

### Q21. What is the Repository Pattern?

**What:** Separates data access logic from business logic. Your service talks to a Repository interface, not directly to the database.

**Think of it like:** A librarian. You don't go into the shelves yourself — you tell the librarian what you want, and they find it.

```java
// Repository interface — your service depends on this
public interface UserRepository {
    User findById(Long id);
    List<User> findByStatus(String status);
    void save(User user);
    void delete(Long id);
}

// Implementation — handles actual database call
@Repository
public class JpaUserRepository implements UserRepository {
    @PersistenceContext
    private EntityManager em;

    public User findById(Long id) { return em.find(User.class, id); }
    public List<User> findByStatus(String status) {
        return em.createQuery("SELECT u FROM User u WHERE u.status = :s", User.class)
                 .setParameter("s", status).getResultList();
    }
    public void save(User user) { em.persist(user); }
    public void delete(Long id) { em.remove(findById(id)); }
}

// Service — doesn't know about JPA, SQL, or database details
@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) { this.repo = repo; }

    public User getUser(Long id) {
        return repo.findById(id);
    }
}
```

**In Spring Boot:** `JpaRepository` gives you all of this for free — just extend the interface.

---

### Q22. What is the DTO (Data Transfer Object) pattern?

**What:** A simple object used to **transfer data** between layers (controller ↔ service ↔ client). It prevents exposing your internal entity structure to the outside world.

**Why?**
- Don't expose database fields like `password`, `createdAt` to the API
- Decouple your API contract from your database schema
- Control exactly what data goes in and out

```java
// Entity — maps to database
@Entity
public class User {
    @Id private Long id;
    private String name;
    private String email;
    private String password;     // don't expose this!
    private LocalDateTime createdAt;
    private boolean deleted;     // don't expose this!
}

// Response DTO — only what the client needs
public record UserResponseDTO(
    Long id,
    String name,
    String email
) {}

// Request DTO — only what the client sends
public record CreateUserDTO(
    @NotBlank String name,
    @Email String email,
    @Size(min = 8) String password
) {}

// Mapping (use MapStruct in real projects)
public class UserMapper {
    public static UserResponseDTO toDTO(User user) {
        return new UserResponseDTO(user.getId(), user.getName(), user.getEmail());
    }
}
```

---

### Q23. What is CQRS (Command Query Responsibility Segregation)?

**What:** Separate **read operations** (queries) from **write operations** (commands) into different models.

**Simple version — separate services:**
```java
// Command side — handles writes
@Service
public class OrderCommandService {
    public void createOrder(CreateOrderDTO dto) { /* validate, save, publish event */ }
    public void cancelOrder(Long orderId) { /* update status, refund */ }
}

// Query side — handles reads (can be optimized separately)
@Service
public class OrderQueryService {
    public OrderDTO getOrder(Long id) { /* simple read, maybe from cache */ }
    public List<OrderSummaryDTO> getRecentOrders(int limit) { /* optimized query */ }
}
```

**Why?**
- Read and write patterns are usually very different
- Reads can use cache, denormalized views, or a read-replica database
- Writes need validation, transactions, and events
- You can scale reads and writes independently

---

### Q24. What is the Circuit Breaker pattern?

**What:** If a service you depend on keeps failing, **stop calling it temporarily** instead of wasting time on requests that will fail.

**Think of it like:** An electrical circuit breaker. If there's a problem, it "trips" and stops electricity until you fix it.

**3 states:**

```
CLOSED  →  calls go through normally
   ↓ (failures exceed threshold)
OPEN    →  all calls fail immediately (don't even try)
   ↓ (after timeout)
HALF-OPEN → let a few calls through to test if service recovered
   ↓ (success?)
CLOSED  ← yes, back to normal
```

**With Resilience4j in Spring Boot:**
```java
@Service
public class PaymentService {

    @CircuitBreaker(name = "payment", fallbackMethod = "paymentFallback")
    public PaymentResponse processPayment(PaymentRequest request) {
        return paymentClient.charge(request);  // calls external service
    }

    // Called when circuit is open or service fails
    public PaymentResponse paymentFallback(PaymentRequest request, Exception ex) {
        return new PaymentResponse("QUEUED", "Payment will be retried later");
    }
}
```

```yaml
# application.yml
resilience4j.circuitbreaker.instances.payment:
  failure-rate-threshold: 50         # open if 50% of calls fail
  wait-duration-in-open-state: 30s   # wait 30s before trying again
  sliding-window-size: 10            # look at last 10 calls
```

---

### Q25. When do you use each design pattern? Quick reference.

| Problem | Pattern | Example |
|---|---|---|
| Need only one instance | **Singleton** | DB connection pool, config |
| Create objects without specifying exact class | **Factory** | Notification types, payment methods |
| Object has many optional fields | **Builder** | User, Order, Configuration |
| Switch algorithms at runtime | **Strategy** | Payment methods, sorting, validation |
| Notify many objects when something changes | **Observer** | Event system, notifications |
| Make incompatible interfaces work together | **Adapter** | Legacy integration, third-party APIs |
| Simplify access to complex system | **Facade** | Order placement, report generation |
| Add behavior without changing class | **Decorator** | Logging, caching, auth wrappers |
| Define algorithm skeleton, let children fill details | **Template Method** | Data exporters, request handlers |
| Turn requests into objects (queue, undo, log) | **Command** | Task queues, CQRS, undo system |
| Control access to an object | **Proxy** | Caching, lazy loading, access control |
| Separate reads from writes | **CQRS** | High-traffic APIs, event sourcing |
| Handle failures gracefully | **Circuit Breaker** | External service calls, microservices |
