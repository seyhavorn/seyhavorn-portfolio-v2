# Spring Boot Core Concepts Guide
## Complete Reference for Backend Developers

---

## Table of Contents

1. [Introduction to Spring Boot](#introduction)
2. [Spring Boot Architecture](#architecture)
3. [Dependency Injection & IoC](#di-ioc)
4. [Application Properties & Configuration](#configuration)
5. [Spring Boot Starters](#starters)
6. [Embedded Servers](#embedded-servers)
7. [Auto-Configuration](#auto-configuration)
8. [Spring Data JPA](#spring-data-jpa)
9. [REST Controllers](#rest-controllers)
10. [Exception Handling](#exception-handling)
11. [Validation](#validation)
12. [Security](#security)
13. [Actuator & Monitoring](#actuator)
14. [Testing](#testing)
15. [Profiles & Environments](#profiles)

---

## Introduction to Spring Boot {#introduction}

Spring Boot is a framework that simplifies the development of production-grade Spring applications by providing:

- **Opinionated defaults** - Smart defaults for common use cases
- **Standalone applications** - Run as JAR with embedded server
- **Production-ready** - Built-in monitoring, metrics, health checks
- **Convention over configuration** - Minimal boilerplate code
- **Rapid development** - Quick start and fast iteration

### Why Spring Boot?

Traditional Spring requires extensive XML configuration. Spring Boot eliminates this:

```java
// OLD WAY (Traditional Spring) - web.xml + Spring XML config files
<bean id="userService" class="com.example.UserService">
    <property name="userRepository" ref="userRepository"/>
</bean>

// NEW WAY (Spring Boot) - Just a POJO with annotation
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

### Key Benefits

| Feature | Benefit |
|---------|---------|
| Embedded Server | No need for separate application server (Tomcat, Jetty) |
| Auto-Configuration | Automatically configures Spring and 3rd party libraries |
| Starters | Pre-configured dependency sets for common scenarios |
| Actuator | Built-in endpoints for monitoring and management |
| Profiles | Easy environment-specific configuration |
| CLI Tool | Rapid development with groovy scripts |

---

## Spring Boot Architecture {#architecture}

### Request Lifecycle

```
1. HTTP Request arrives
   ↓
2. DispatcherServlet (front controller)
   ↓
3. Handler Mapping (finds correct controller method)
   ↓
4. Controller executes business logic
   ↓
5. Service/Repository layer processes data
   ↓
6. Response returned as JSON/XML/HTML
   ↓
7. HTTP Response sent back
```

### Layered Architecture

```
┌─────────────────────────────────┐
│   Presentation Layer            │  Controllers, REST endpoints
│   (@RestController, @Controller)│
├─────────────────────────────────┤
│   Business Logic Layer          │  Services
│   (@Service)                    │
├─────────────────────────────────┤
│   Data Access Layer             │  Repositories
│   (@Repository)                 │
├─────────────────────────────────┤
│   Database                      │  MySQL, PostgreSQL, etc.
└─────────────────────────────────┘
```

### Component Scanning

Spring Boot automatically discovers components in your application:

```java
@SpringBootApplication  // Enables component scanning, auto-config, configs
public class BankingApplication {
    public static void main(String[] args) {
        SpringApplication.run(BankingApplication.class, args);
    }
}

// @SpringBootApplication = @Configuration + @ComponentScan + @EnableAutoConfiguration

@Component          // Generic component
@Service            // Business logic
@Repository         // Data access
@Controller         // Web MVC controller
@RestController     // REST API controller (returns JSON)
@Configuration      // Java-based configuration
```

---

## Dependency Injection & IoC {#di-ioc}

### What is Dependency Injection?

Instead of an object creating its dependencies, they are "injected" from outside:

```java
// BAD: Class creates its own dependency (tight coupling)
public class UserService {
    private UserRepository repository = new UserRepository();  // Hard to test!
}

// GOOD: Dependency injected (loose coupling)
@Service
public class UserService {
    @Autowired
    private UserRepository repository;  // Spring injects this
}
```

### Three Types of Injection

#### 1. Constructor Injection (RECOMMENDED)

```java
@Service
public class UserService {
    private final UserRepository repository;
    private final EmailService emailService;
    
    // Constructor injection - best for testing
    public UserService(UserRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }
}
```

**Advantages:**
- Makes dependencies explicit
- Immutable fields (final)
- Easy to test (pass mocks)
- No null pointer exceptions

#### 2. Setter Injection

```java
@Service
public class UserService {
    private UserRepository repository;
    
    @Autowired
    public void setRepository(UserRepository repository) {
        this.repository = repository;
    }
}
```

**Disadvantages:**
- Dependencies not obvious
- Can lead to null pointer exceptions
- Harder to test

#### 3. Field Injection

```java
@Service
public class UserService {
    @Autowired
    private UserRepository repository;  // Field injection
}
```

**Disadvantages:**
- Cannot be used in unit tests without Spring context
- Looks clean but hard to test

### Inversion of Control Container

Spring maintains a container of all beans:

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(
            Application.class, args
        );
        
        // Access beans from container
        UserService userService = context.getBean(UserService.class);
        userService.getUser("123");
    }
}
```

### Bean Scopes

```java
@Scope("singleton")  // Default - one instance for entire application
@Service
public class UserService { }

@Scope("prototype")  // New instance each time
@Service
public class RequestContext { }

@Scope("request")    // New instance per HTTP request (web only)
@Component
public class UserRequest { }

@Scope("session")    // One instance per HTTP session
@Component
public class SessionData { }
```

---

## Application Properties & Configuration {#configuration}

### application.properties

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api/v1

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/bankingdb
spring.datasource.username=root
spring.datasource.password=secret123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Logging Configuration
logging.level.root=INFO
logging.level.com.example=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# Application Name and Version
spring.application.name=banking-service
app.version=1.0.0
```

### application.yml (YAML format)

```yaml
server:
  port: 8080
  servlet:
    context-path: /api/v1

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bankingdb
    username: root
    password: secret123
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect

logging:
  level:
    root: INFO
    com.example: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"

app:
  version: 1.0.0
```

### Environment-Specific Configuration

```
src/main/resources/
├── application.properties          (default)
├── application-dev.properties      (dev profile)
├── application-test.properties     (test profile)
├── application-prod.properties     (production)
```

**application-dev.properties:**
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/bankingdb_dev
logging.level.root=DEBUG
```

**application-prod.properties:**
```properties
server.port=80
spring.datasource.url=jdbc:mysql://prod-db:3306/bankingdb
logging.level.root=WARN
spring.jpa.show-sql=false
```

### Accessing Properties in Code

```java
@Component
public class AppConfig {
    
    // Method 1: @Value annotation
    @Value("${server.port}")
    private int port;
    
    @Value("${app.version}")
    private String version;
    
    // Method 2: Constructor injection
    public AppConfig(@Value("${server.port}") int port) {
        this.port = port;
    }
    
    // Method 3: ConfigurationProperties
    @Bean
    public DataSourceProperties dataSourceProperties() {
        return new DataSourceProperties();
    }
}
```

### ConfigurationProperties (Type-Safe)

```java
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private String version;
    private Database database;
    
    // Getters and setters
    public static class Database {
        private String url;
        private String username;
        // Getters and setters
    }
}

// In application.yml:
app:
  name: banking-app
  version: 1.0.0
  database:
    url: jdbc:mysql://localhost/bankingdb
    username: root
```

---

## Spring Boot Starters {#starters}

Starters are pre-configured dependency descriptors that simplify Maven/Gradle configuration.

### Common Starters

```xml
<!-- Web Application -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Actuator (Monitoring) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<!-- Testing -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<!-- Logging -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-logging</artifactId>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### What Each Starter Includes

**spring-boot-starter-web:**
- Spring MVC
- Embedded Tomcat
- Jackson (JSON serialization)
- Validation
- Logging

**spring-boot-starter-data-jpa:**
- Spring Data JPA
- Hibernate ORM
- Database transaction management
- Spring Data repository support

---

## Embedded Servers {#embedded-servers}

Spring Boot includes an embedded web server - no need to deploy WAR files!

### Default Embedded Server

```java
@SpringBootApplication
public class BankingApplication {
    public static void main(String[] args) {
        // Tomcat starts automatically on port 8080
        SpringApplication.run(BankingApplication.class, args);
    }
}
```

### Changing Embedded Server

**application.properties:**
```properties
# Use Jetty instead of Tomcat
# Exclude Tomcat from spring-boot-starter-web
# Add Jetty dependency in pom.xml
```

**pom.xml:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-tomcat</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- Add Jetty -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jetty</artifactId>
</dependency>
```

### Server Configuration

```properties
# Port
server.port=9090

# Context path
server.servlet.context-path=/api/v1

# Thread pool
server.tomcat.threads.max=100
server.tomcat.threads.min-spare=10

# Connection timeout
server.tomcat.connection-timeout=20000

# Shutdown
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=10s
```

---

## Auto-Configuration {#auto-configuration}

Spring Boot automatically configures your application based on jar dependencies on the classpath.

### How Auto-Configuration Works

```
1. Spring Boot scans the classpath
2. Finds @SpringBootApplication annotation
3. Enables @EnableAutoConfiguration (implicit)
4. Loads all auto-configuration classes from
   META-INF/spring.factories
5. Each auto-config class checks conditions (@ConditionalOnClass, etc.)
6. Applies configuration if conditions met
```

### Example: DataSource Auto-Configuration

```java
// Spring Boot automatically creates DataSource bean if:
// 1. H2, MySQL, or PostgreSQL driver is on classpath
// 2. spring.datasource.* properties are configured

// This bean is created automatically (you don't need to define it)
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnProperty(prefix = "spring.datasource", name = "url")
public class DataSourceAutoConfiguration {
    
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource(hikariConfig);
    }
}
```

### Disabling Auto-Configuration

```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### Common Auto-Configurations

| Starter | Auto-Configuration |
|---------|-------------------|
| spring-boot-starter-web | DispatcherServlet, Tomcat, Jackson |
| spring-boot-starter-data-jpa | DataSource, EntityManagerFactory, JpaTransactionManager |
| spring-boot-starter-security | Spring Security filters, authentication |
| spring-boot-starter-actuator | Health checks, metrics endpoints |

---

## Spring Data JPA {#spring-data-jpa}

JPA (Java Persistence API) with Spring Data provides an abstraction over databases.

### Setting Up JPA

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

### Defining Entities

```java
@Entity
@Table(name = "accounts")
public class Account {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "account_number", nullable = false, unique = true)
    private String accountNumber;
    
    @Column(nullable = false)
    private BigDecimal balance;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @Version
    private Long version;  // For optimistic locking
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
    
    // Getters and setters
}
```

### Entity Relationships

```java
// ONE-TO-MANY (Customer has many Accounts)
@Entity
public class Customer {
    @Id
    private Long id;
    
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Account> accounts = new ArrayList<>();
}

// MANY-TO-ONE (Account belongs to Customer)
@Entity
public class Account {
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;
}

// MANY-TO-MANY (Student takes many Courses, Course has many Students)
@Entity
public class Student {
    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses;
}
```

### Creating Repositories

```java
// Spring Data JPA automatically implements CRUD operations
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    // Query methods - Spring generates SQL automatically
    Account findByAccountNumber(String accountNumber);
    
    List<Account> findByCustomerId(Long customerId);
    
    List<Account> findByBalanceGreaterThan(BigDecimal amount);
    
    // Custom query with @Query
    @Query("SELECT a FROM Account a WHERE a.customer.id = :customerId AND a.balance > :minBalance")
    List<Account> findRichAccountsByCustomer(
        @Param("customerId") Long customerId,
        @Param("minBalance") BigDecimal minBalance
    );
    
    // Native SQL query
    @Query(value = "SELECT * FROM accounts WHERE balance > ?1", nativeQuery = true)
    List<Account> findRichAccounts(BigDecimal minBalance);
    
    // Delete custom
    @Modifying
    @Query("DELETE FROM Account a WHERE a.customer.id = :customerId")
    void deleteByCustomerId(@Param("customerId") Long customerId);
    
    // Custom count
    long countByCustomerId(Long customerId);
}
```

### Repository CRUD Operations

```java
@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;
    
    // CREATE
    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }
    
    // READ
    public Account getAccount(Long id) {
        return accountRepository.findById(id)
            .orElseThrow(() -> new AccountNotFoundException(id));
    }
    
    // UPDATE
    public Account updateAccount(Long id, Account updatedAccount) {
        Account account = getAccount(id);
        account.setBalance(updatedAccount.getBalance());
        return accountRepository.save(account);
    }
    
    // DELETE
    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }
    
    // FIND ALL
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }
}
```

---

## REST Controllers {#rest-controllers}

Controllers handle HTTP requests and return responses.

### Basic REST Controller

```java
@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {
    
    @Autowired
    private AccountService accountService;
    
    // GET /api/v1/accounts
    @GetMapping
    public List<AccountDTO> getAllAccounts() {
        return accountService.getAllAccounts()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // GET /api/v1/accounts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AccountDTO> getAccount(@PathVariable Long id) {
        Account account = accountService.getAccount(id);
        return ResponseEntity.ok(convertToDTO(account));
    }
    
    // POST /api/v1/accounts
    @PostMapping
    public ResponseEntity<AccountDTO> createAccount(
            @RequestBody @Valid CreateAccountRequest request) {
        Account account = accountService.createAccount(
            new Account(request.getAccountNumber(), request.getBalance())
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(convertToDTO(account));
    }
    
    // PUT /api/v1/accounts/{id}
    @PutMapping("/{id}")
    public ResponseEntity<AccountDTO> updateAccount(
            @PathVariable Long id,
            @RequestBody @Valid UpdateAccountRequest request) {
        Account account = accountService.updateAccount(id,
            new Account(request.getBalance())
        );
        return ResponseEntity.ok(convertToDTO(account));
    }
    
    // DELETE /api/v1/accounts/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
    
    private AccountDTO convertToDTO(Account account) {
        return new AccountDTO(
            account.getId(),
            account.getAccountNumber(),
            account.getBalance()
        );
    }
}
```

### Request/Response Binding

```java
// Request body binding
@PostMapping
public Account create(@RequestBody Account account) {
    return accountService.save(account);
}

// Path variables
@GetMapping("/{id}")
public Account getById(@PathVariable Long id) {
    return accountService.findById(id);
}

// Query parameters
@GetMapping("/search")
public List<Account> search(
        @RequestParam String accountNumber,
        @RequestParam(defaultValue = "0") int page) {
    return accountService.search(accountNumber, page);
}

// Request headers
@GetMapping
public List<Account> getAllAccounts(
        @RequestHeader("Authorization") String token) {
    return accountService.getAllAccounts();
}

// Cookie values
@GetMapping
public List<Account> getAllAccounts(
        @CookieValue("JSESSIONID") String sessionId) {
    return accountService.getAllAccounts();
}
```

### ResponseEntity for Status Codes

```java
@PostMapping
public ResponseEntity<Account> create(@RequestBody Account account) {
    Account saved = accountService.save(account);
    
    return ResponseEntity
        .status(HttpStatus.CREATED)  // 201
        .header("X-Custom-Header", "value")
        .body(saved);
}

// or using ResponseEntity builder
return ResponseEntity.created(URI.create("/accounts/" + saved.getId()))
    .body(saved);

// 200 OK
return ResponseEntity.ok(account);

// 204 No Content
return ResponseEntity.noContent().build();

// 404 Not Found
return ResponseEntity.notFound().build();

// 400 Bad Request
return ResponseEntity.badRequest().build();
```

---

## Exception Handling {#exception-handling}

Centralized exception handling using @ControllerAdvice.

### Custom Exceptions

```java
public class AccountNotFoundException extends RuntimeException {
    public AccountNotFoundException(Long id) {
        super("Account not found with id: " + id);
    }
}

public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
}
```

### Global Exception Handler

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(AccountNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAccountNotFound(
            AccountNotFoundException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(Instant.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Not Found")
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(InsufficientFundsException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientFunds(
            InsufficientFundsException ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(Instant.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Bad Request")
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex,
            HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(Instant.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Internal Server Error")
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(error);
    }
}

// Error Response DTO
@Data
@Builder
public class ErrorResponse {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
}
```

### Exception in Controller Method

```java
@Service
public class AccountService {
    @Autowired
    private AccountRepository accountRepository;
    
    public Account withdraw(Long accountId, BigDecimal amount) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new AccountNotFoundException(accountId));
        
        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                "Insufficient balance. Available: " + account.getBalance()
            );
        }
        
        account.setBalance(account.getBalance().subtract(amount));
        return accountRepository.save(account);
    }
}
```

---

## Validation {#validation}

Spring Boot supports Bean Validation (JSR-380) with Hibernate Validator.

### Validation Annotations

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {
    
    @NotBlank(message = "Account number cannot be blank")
    @Size(min = 10, max = 20, message = "Account number must be 10-20 characters")
    private String accountNumber;
    
    @NotNull(message = "Initial balance cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Balance must be greater than 0")
    private BigDecimal initialBalance;
    
    @NotNull(message = "Account type cannot be null")
    private AccountType accountType;
    
    @Email(message = "Email should be valid")
    private String email;
    
    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 100, message = "Age must not exceed 100")
    private int age;
}

public enum AccountType {
    SAVINGS, CHECKING, INVESTMENT
}
```

### Using @Valid in Controller

```java
@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {
    
    @PostMapping
    public ResponseEntity<AccountDTO> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {
        // Validation happens automatically
        // If invalid, returns 400 Bad Request with error details
        
        Account account = new Account(
            request.getAccountNumber(),
            request.getInitialBalance()
        );
        
        Account saved = accountService.save(account);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new AccountDTO(saved));
    }
}
```

### Custom Validation Annotation

```java
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = AccountNumberValidator.class)
public @interface ValidAccountNumber {
    String message() default "Invalid account number format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class AccountNumberValidator 
        implements ConstraintValidator<ValidAccountNumber, String> {
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return true;
        // Account number must start with country code + year
        return value.matches("KH\\d{4}\\d{8}");
    }
}

// Usage
@ValidAccountNumber
private String accountNumber;
```

---

## Security {#security}

Spring Security provides authentication, authorization, and protection against common attacks.

### Basic Spring Security Setup

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()  // For REST APIs (enable for traditional forms)
            .authorizeRequests()
                .antMatchers("/api/public/**").permitAll()  // Public endpoints
                .antMatchers("/api/admin/**").hasRole("ADMIN")  // Admin only
                .antMatchers("/api/user/**").hasRole("USER")  // User only
                .anyRequest().authenticated()  // Require auth for others
            .and()
            .httpBasic()  // HTTP Basic authentication
            .and()
            .sessionManagement()
                .sessionFixation().migrateSession()  // Prevent session fixation
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED);
        
        return http.build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // Hash passwords with BCrypt
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
```

### User Details Service

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) 
            throws UsernameNotFoundException {
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> 
                new UsernameNotFoundException("User not found: " + username)
            );
        
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .authorities(user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList()))
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(false)
            .build();
    }
}
```

### Accessing Current User

```java
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @GetMapping("/profile")
    public UserProfile getCurrentUser() {
        Authentication auth = SecurityContextHolder
            .getContext().getAuthentication();
        String username = auth.getName();
        
        return userService.getUserProfile(username);
    }
    
    // or using @AuthenticationPrincipal
    @GetMapping("/profile")
    public UserProfile getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        return userService.getUserProfile(userDetails.getUsername());
    }
}
```

### JWT (Token-Based) Authentication

```java
@Configuration
public class JwtSecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/auth/login").permitAll()
                .anyRequest().authenticated()
            .and()
            .addFilterBefore(new JwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        
        return http.build();
    }
}

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        try {
            String token = extractTokenFromRequest(request);
            
            if (token != null && jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                
                UserDetails userDetails = 
                    userDetailsService.loadUserByUsername(username);
                
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                
                SecurityContextHolder.getContext()
                    .setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication: {}", ex.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

## Actuator & Monitoring {#actuator}

Spring Boot Actuator provides built-in endpoints for monitoring and managing your application.

### Adding Actuator

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### Configuration

```properties
# Enable all actuator endpoints
management.endpoints.web.exposure.include=*

# Or expose specific endpoints
management.endpoints.web.exposure.include=health,metrics,info

# Change actuator base path
management.endpoints.web.base-path=/actuator

# Detailed health info
management.endpoint.health.show-details=always
```

### Built-in Endpoints

```
GET /actuator                    # All available endpoints
GET /actuator/health             # Application health
GET /actuator/metrics            # Metrics list
GET /actuator/metrics/{name}     # Specific metric
GET /actuator/env                # Environment properties
GET /actuator/configprops        # Configuration properties
GET /actuator/loggers            # Logger configuration
PUT /actuator/loggers/{name}     # Change log level
GET /actuator/threaddump        # Thread dump
GET /actuator/heapdump          # Heap dump
POST /actuator/shutdown          # Graceful shutdown
GET /actuator/info               # Application info
```

### Example Responses

**Health Check:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 1099511627776,
        "free": 499040149504,
        "threshold": 10485760
      }
    }
  }
}
```

**Metrics:**
```json
{
  "names": [
    "jvm.memory.used",
    "jvm.threads.live",
    "process.cpu.usage",
    "http.server.requests",
    "db.connection.active"
  ]
}
```

### Custom Metrics

```java
@Component
public class BankingMetrics {
    
    private final MeterRegistry meterRegistry;
    private final AtomicInteger activeTransfers;
    
    public BankingMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.activeTransfers = new AtomicInteger(0);
        
        meterRegistry.gauge("transfers.active", activeTransfers);
    }
    
    public void recordTransferSuccess() {
        meterRegistry.counter("transfers.success").increment();
    }
    
    public void recordTransferFailure() {
        meterRegistry.counter("transfers.failure").increment();
    }
    
    public void recordTransactionAmount(BigDecimal amount) {
        meterRegistry.counter("transactions.amount.total",
            "currency", "USD"
        ).increment(amount.doubleValue());
    }
}
```

### Custom Health Indicator

```java
@Component
public class BankingSystemHealthIndicator 
        extends AbstractHealthIndicator {
    
    @Autowired
    private BankingSystemClient bankingClient;
    
    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        try {
            boolean systemUp = bankingClient.isSystemHealthy();
            
            if (systemUp) {
                builder.up()
                    .withDetail("status", "Banking system operational");
            } else {
                builder.down()
                    .withDetail("status", "Banking system unavailable");
            }
        } catch (Exception ex) {
            builder.down()
                .withException(ex);
        }
    }
}
```

---

## Testing {#testing}

Spring Boot provides excellent testing support with Spring Boot Test.

### Adding Test Dependencies

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

### Unit Testing

```java
public class AccountServiceTest {
    
    // Mocking dependencies
    private AccountService accountService;
    
    @Mock
    private AccountRepository accountRepository;
    
    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        accountService = new AccountService(accountRepository);
    }
    
    @Test
    public void testGetAccount_WhenExists() {
        // Arrange
        Long accountId = 1L;
        Account mockAccount = new Account();
        mockAccount.setId(accountId);
        mockAccount.setBalance(BigDecimal.valueOf(1000));
        
        when(accountRepository.findById(accountId))
            .thenReturn(Optional.of(mockAccount));
        
        // Act
        Account result = accountService.getAccount(accountId);
        
        // Assert
        assertNotNull(result);
        assertEquals(accountId, result.getId());
        assertEquals(BigDecimal.valueOf(1000), result.getBalance());
        
        // Verify
        verify(accountRepository, times(1)).findById(accountId);
    }
    
    @Test
    public void testGetAccount_WhenNotExists() {
        // Arrange
        Long accountId = 999L;
        when(accountRepository.findById(accountId))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(AccountNotFoundException.class, () -> {
            accountService.getAccount(accountId);
        });
    }
}
```

### Integration Testing

```java
@SpringBootTest
@AutoConfigureMockMvc
public class AccountControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private AccountRepository accountRepository;
    
    @BeforeEach
    public void setup() {
        accountRepository.deleteAll();
    }
    
    @Test
    public void testGetAllAccounts() throws Exception {
        // Arrange
        Account account = new Account();
        account.setAccountNumber("KH2024000123");
        account.setBalance(BigDecimal.valueOf(5000));
        accountRepository.save(account);
        
        // Act & Assert
        mockMvc.perform(get("/api/v1/accounts"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].accountNumber")
                .value("KH2024000123"));
    }
    
    @Test
    public void testCreateAccount_Success() throws Exception {
        String json = """
            {
                "accountNumber": "KH2024000456",
                "balance": 1000.00,
                "accountType": "SAVINGS"
            }
            """;
        
        mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.accountNumber")
                .value("KH2024000456"));
    }
    
    @Test
    public void testCreateAccount_InvalidData() throws Exception {
        String json = """
            {
                "accountNumber": "",
                "balance": -100
            }
            """;
        
        mockMvc.perform(post("/api/v1/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }
}
```

### Testing with Database (H2 In-Memory)

```properties
# application-test.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
```

---

## Profiles & Environments {#profiles}

Manage different configurations for different environments.

### Profile-Specific Configuration Files

```
src/main/resources/
├── application.properties          # Default (all profiles)
├── application-dev.properties      # Development profile
├── application-test.properties     # Test profile
├── application-prod.properties     # Production profile
```

### Activating Profiles

**Via application.properties:**
```properties
spring.profiles.active=dev
```

**Via application.yml:**
```yaml
spring:
  profiles:
    active: dev
```

**Via environment variable:**
```bash
export SPRING_PROFILES_ACTIVE=prod
java -jar app.jar
```

**Via command line:**
```bash
java -jar app.jar --spring.profiles.active=prod
```

**Via IDE (Eclipse):**
```
Run Configurations > Arguments > VM arguments:
-Dspring.profiles.active=dev
```

### Profile-Specific Beans

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        // H2 in-memory database for development
        return DataSourceBuilder.create()
            .driverClassName("org.h2.Driver")
            .url("jdbc:h2:mem:devdb")
            .username("sa")
            .password("")
            .build();
    }
    
    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        // Production MySQL database
        return DataSourceBuilder.create()
            .driverClassName("com.mysql.cj.jdbc.Driver")
            .url(System.getenv("DB_URL"))
            .username(System.getenv("DB_USER"))
            .password(System.getenv("DB_PASSWORD"))
            .build();
    }
}
```

### Profile-Specific Properties

**application-dev.properties:**
```properties
server.port=8080
spring.jpa.show-sql=true
logging.level.root=DEBUG
app.cache.enabled=false
```

**application-prod.properties:**
```properties
server.port=8080
server.ssl.enabled=true
server.ssl.key-store=${SSL_KEYSTORE_PATH}
server.ssl.key-store-password=${SSL_PASSWORD}
spring.jpa.show-sql=false
logging.level.root=WARN
app.cache.enabled=true
```

---

## Best Practices

### 1. Project Structure

```
banking-app/
├── src/main/java/com/example/banking/
│   ├── BankingApplication.java          # Main entry point
│   ├── config/                          # Configuration classes
│   ├── controller/                      # REST controllers
│   ├── service/                         # Business logic
│   ├── repository/                      # Data access
│   ├── entity/                          # JPA entities
│   ├── dto/                             # Data transfer objects
│   ├── exception/                       # Custom exceptions
│   ├── security/                        # Security configurations
│   └── util/                            # Utility classes
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties
│   └── application-prod.properties
├── src/test/java/                       # Unit and integration tests
├── pom.xml                              # Maven configuration
└── README.md
```

### 2. Use Constructor Injection

```java
@Service
public class UserService {
    private final UserRepository repository;
    
    // Constructor injection - testable and immutable
    public UserService(UserRepository repository) {
        this.repository = repository;
    }
}
```

### 3. Use DTO (Data Transfer Object)

```java
@Entity
public class User {
    // Domain entity with business logic
}

@Data
public class UserDTO {
    // DTO for API responses (only exposed fields)
    private Long id;
    private String username;
    // Password NOT included in DTO!
}
```

### 4. Separate Concerns

```
Controller → Service → Repository → Database

Controller: Handle HTTP requests/responses
Service: Business logic
Repository: Data access (CRUD)
```

### 5. Use Spring Data JPA Queries

```java
// Good - Query method (Spring generates SQL)
Account account = repository.findByAccountNumber("KH2024000123");

// Avoid - Fetching all and filtering in code
List<Account> all = repository.findAll();
Account account = all.stream()
    .filter(a -> a.getAccountNumber().equals("KH2024000123"))
    .findFirst()
    .orElse(null);
```

### 6. Handle Exceptions Globally

```java
// Good - Centralized exception handling
@ControllerAdvice
public class GlobalExceptionHandler { }

// Avoid - Scattered exception handling in controllers
@RestController
public class UserController {
    try {
        // code
    } catch (Exception ex) {
        // handle locally
    }
}
```

### 7. Use Transactional Annotations

```java
@Service
public class PaymentService {
    
    @Transactional  // Automatic rollback on exception
    public void transferMoney(String from, String to, BigDecimal amount) {
        accountRepository.debit(from, amount);
        accountRepository.credit(to, amount);
        // Rollback both if credit fails
    }
}
```

### 8. Validate Input

```java
// Good - Validate at entry point
@PostMapping
public ResponseEntity<User> create(
        @Valid @RequestBody CreateUserRequest request) {
    User user = userService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(user);
}

// Avoid - No validation
@PostMapping
public ResponseEntity<User> create(@RequestBody User user) {
    User created = userService.create(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}
```

### 9. Use Logging

```java
@RestController
public class AccountController {
    private static final Logger log = LoggerFactory
        .getLogger(AccountController.class);
    
    @GetMapping("/{id}")
    public Account getAccount(@PathVariable Long id) {
        log.info("Fetching account with id: {}", id);
        try {
            Account account = accountService.getAccount(id);
            log.debug("Account found: {}", account);
            return account;
        } catch (Exception ex) {
            log.error("Error fetching account: {}", id, ex);
            throw ex;
        }
    }
}
```

### 10. Document APIs

```java
@RestController
@RequestMapping("/api/accounts")
public class AccountController {
    
    /**
     * Retrieve an account by its ID
     * 
     * @param id The account ID
     * @return Account details
     * @throws AccountNotFoundException if account doesn't exist
     */
    @GetMapping("/{id}")
    public Account getAccount(@PathVariable Long id) {
        return accountService.getAccount(id);
    }
}
```

---

## Common Interview Questions

### Q1: What is Spring Boot auto-configuration?
Spring Boot automatically configures your application based on jar dependencies on the classpath. It uses @ConditionalOnClass, @ConditionalOnProperty annotations to apply configurations only when certain conditions are met.

### Q2: Difference between @Controller and @RestController?
- @Controller returns view (for traditional MVC)
- @RestController returns data as JSON/XML (for REST APIs) and includes @ResponseBody

### Q3: How does dependency injection work?
Spring maintains a bean container (ApplicationContext) that manages object creation and injection. When a class needs a dependency, Spring automatically provides it via constructor, setter, or field injection.

### Q4: What's the purpose of @Component, @Service, @Repository?
- @Component: Generic component
- @Service: Business logic (more semantic)
- @Repository: Data access layer (provides exception translation)

### Q5: How do you externalize configuration?
Using application.properties or application.yml files, environment variables, or command-line arguments. Spring Boot loads these and makes them available via @Value or @ConfigurationProperties.

### Q6: What is JPA and why use Spring Data JPA?
JPA is a standard for object-relational mapping. Spring Data JPA simplifies it by providing repositories that automatically implement CRUD operations and query methods.

### Q7: How does @Transactional work?
Spring creates a proxy around the method. When called, it starts a transaction, executes the method, and commits. If an exception occurs (RuntimeException), it rolls back.

### Q8: What are different types of injections?
Constructor injection (best), Setter injection, and Field injection. Constructor injection is preferred because it makes dependencies explicit and enables immutability.

---

## Conclusion

Spring Boot is a powerful framework that simplifies Spring development. Key takeaways:

1. Use auto-configuration to avoid boilerplate
2. Leverage Spring Data JPA for database operations
3. Build RESTful APIs with @RestController
4. Handle exceptions centrally with @ControllerAdvice
5. Use constructor injection for dependencies
6. Validate inputs with @Valid
7. Profile configurations for different environments
8. Monitor applications with Actuator
9. Write tests with Spring Boot Test
10. Follow best practices and conventions

Happy coding! 🚀
