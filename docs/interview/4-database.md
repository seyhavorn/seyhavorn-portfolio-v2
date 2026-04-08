# Database & Persistence — Senior Backend Interview Guide

**Master database design, optimization, and architecture for banking systems.** Each answer: simple explanation → problem → solution → professional code → interview tip.

---

## Quick Reference — 25 Core Topics

| # | Topic | Key Concept | Level |
|---|-------|-------------|-------|
| 1 | Clustered vs Non-Clustered Indexes | B-tree structures | ⭐⭐⭐ |
| 2 | Index Design Strategy | Composite indexes | ⭐⭐⭐ |
| 3 | Query Optimization | EXPLAIN ANALYZE | ⭐⭐⭐ |
| 4 | N+1 Problem | JOIN FETCH | ⭐⭐⭐ |
| 5 | Connection Pooling | HikariCP tuning | ⭐⭐⭐ |
| 6 | Pagination Strategy | Keyset vs OFFSET | ⭐⭐ |
| 7 | Isolation Levels | SERIALIZABLE | ⭐⭐⭐ |
| 8 | Deadlock Prevention | Resource ordering | ⭐⭐ |
| 9 | Master-Slave Replication | Async replication | ⭐⭐⭐ |
| 10 | Read Replicas | Route reads | ⭐⭐⭐ |
| 11 | Sharding Strategy | Hash-based | ⭐⭐ |
| 12 | Table Partitioning | Range partition | ⭐⭐⭐ |
| 13 | Database Migrations | Flyway/Liquibase | ⭐⭐⭐ |
| 14 | Schema Design | Normalization | ⭐⭐⭐ |
| 15 | Materialized Views | Pre-computed results | ⭐⭐ |
| 16 | JSONB & Flexible Schema | Modern PostgreSQL | ⭐⭐ |
| 17 | Window Functions | PARTITION BY | ⭐⭐⭐ |
| 18 | Full-Text Search | GiST indexing | ⭐⭐ |
| 19 | Geospatial (PostGIS) | Location-based queries | ⭐⭐ |
| 20 | Transaction Consistency | Saga + Outbox | ⭐⭐⭐ |
| 21 | Audit Trails | Event sourcing | ⭐⭐⭐ |
| 22 | Multi-currency Support | Exchange rates | ⭐⭐ |
| 23 | CAP Theorem | CP vs AP systems | ⭐⭐⭐ |
| 24 | Query Monitoring | pg_stat_statements | ⭐⭐ |
| 25 | Disaster Recovery | Backup & replication | ⭐⭐⭐ |

---

## Indexing & Query Optimization

### Q1: Clustered vs Non-Clustered Indexes

**The simple answer:**
A **clustered index** defines physical row order on disk (one per table). A **non-clustered index** is a separate structure with pointers to rows.

**The problem:**
Queries scan entire tables without indexes. Even with wrong column order, indexes can fail to help. Clustered index choice is permanent—critical for performance.

**Clustered Index (Physical Order):**
```sql
-- MySQL/InnoDB: Primary key is clustered by default
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY,          -- This is the clustered index
    user_id BIGINT NOT NULL,
    balance DECIMAL(19, 2),
    created_at TIMESTAMP
);
-- Rows physically stored ordered by id; range queries on id are fastest
```

**Non-Clustered Index (Separate Structure):**
```sql
-- Separate B-tree: stores (user_id, created_at) → cluster key (id)
CREATE INDEX idx_accounts_user_created ON accounts(user_id, created_at DESC);
-- Query execution:
-- 1. Search index for user_id = 123 → finds (user_id, created_at) tuples
-- 2. Follow pointer to cluster key (id) → go to actual row
-- 3. Fetch: balance, status, account_number
```

**Covering Index (Avoid Row Lookup):**
```sql
-- Include all columns needed; database never fetches the full row
CREATE INDEX idx_cover ON accounts(user_id, created_at) INCLUDE (balance, status);

-- This query is satisfied 100% by the index:
SELECT balance, status FROM accounts 
WHERE user_id = 123 AND created_at > NOW() - INTERVAL '30 days';
-- ✅ Index seek + no row lookup = fast!
```

**Composite Index Column Order:**
```sql
-- Query: WHERE user_id = 123 AND created_at > '2024-01-01' AND status = 'ACTIVE'
-- Rule: Equality predicates FIRST, range predicates LAST

-- ✅ CORRECT: Equality → Equality → Range
CREATE INDEX idx_good ON accounts(user_id, status, created_at);

-- ❌ WRONG: Range before other column
CREATE INDEX idx_bad ON accounts(created_at, user_id, status);
-- After created_at > ?, can't use index for user_id efficiently
```

**When to Index:**
- Columns in WHERE clauses (selectivity < 95%)
- Columns in JOIN ON conditions
- Foreign keys (prevent O(N) joins)
- ORDER BY columns
- High cardinality: many distinct values

**When NOT to Index:**
- Low cardinality: status (3 values), is_active (2 values)
- Heavy writes: 1000+ INSERT/UPDATE/DELETE per second
- Small tables: < 100K rows

**Professional Implementation (JPA):**
```java
@Entity
@Table(name = "accounts", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_balance_status", columnList = "balance DESC, status"),
    @Index(name = "idx_date_status", columnList = "created_at DESC, status")
})
public class Account {
    @Id
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false, length = 20)
    private String status;
}
```

**Interview tip:**
"Index strategy: (1) Measure baseline with EXPLAIN ANALYZE, (2) Add indexes on high-selectivity WHERE columns, (3) Use composite indexes with equality first, range last, (4) Monitor impact before/after. Never assume—measure."

---

### Q2: Query Optimization (EXPLAIN ANALYZE)

**The simple answer:**
`EXPLAIN ANALYZE` reveals how the database executes a query. Look for sequential scans, N+1 patterns, and missing indexes.

**The Process:**

```sql
EXPLAIN ANALYZE
SELECT t.id, t.amount, a.account_number
FROM transfers t
JOIN accounts a ON t.account_id = a.id
WHERE t.created_at > NOW() - INTERVAL '30 days'
AND t.status = 'PENDING'
ORDER BY t.amount DESC
LIMIT 100;

-- Output shows:
-- Seq Scan on transfers t (cost=0.00..4000.00 rows=500000) ❌ SLOW!
-- Hash Join with accounts — missing index
```

**Optimization Steps:**

```java
@Service
public class QueryOptimizationService {
    
    // ❌ BAD: N+1 lazy loading (1 + 100 queries)
    @Transactional(readOnly = true)
    public List<TransferDTO> getTransfersNPlus1() {
        List<Transfer> transfers = transferRepository.findByStatusAndCreatedAtAfter(
            "PENDING",
            LocalDateTime.now().minusDays(30)
        );  // 1 query
        
        return transfers.stream()
            .map(t -> {
                Account acc = accountRepository.findById(t.getAccountId()).get();  // N queries!
                return new TransferDTO(t, acc);
            })
            .collect(toList());
    }
    
    // ✅ GOOD: JOIN FETCH eliminates N+1
    @Transactional(readOnly = true)
    public List<TransferDTO> getTransfersOptimized() {
        return transferRepository.findByStatusWithRelations(
            "PENDING",
            LocalDateTime.now().minusDays(30)
        );
    }
    
    // ✅ BEST: Native query (projection)
    @Transactional(readOnly = true)
    public List<TransferDTO> getTransfersNativeFastest() {
        String sql = """
            SELECT t.id, t.amount, t.status, a.account_number, a.balance
            FROM transfers t
            JOIN accounts a ON t.account_id = a.id
            WHERE t.status = :status
            AND t.created_at > NOW() - INTERVAL '30 days'
            ORDER BY t.amount DESC
            LIMIT 100
            """;
        
        return jdbcTemplate.query(sql, 
            Map.of("status", "PENDING"), 
            (rs, _) -> new TransferDTO(rs.getLong("id"), rs.getBigDecimal("amount")));
    }
}

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    @Query("""
        SELECT DISTINCT t FROM Transfer t
        JOIN FETCH t.account a
        WHERE t.status = :status
        AND t.createdAt > :createdAfter
        ORDER BY t.amount DESC
        """)
    List<Transfer> findByStatusWithRelations(
        @Param("status") String status,
        @Param("createdAfter") LocalDateTime createdAfter
    );
}
```

**Interview tip:**
"EXPLAIN ANALYZE is mandatory for slow queries. The execution plan tells you exactly what to fix. Common: add index on WHERE column, fix N+1 with JOIN FETCH, use covering indexes."

---

### Q3: N+1 Query Problem

**The simple answer:**
Loading N entities with lazy-loaded relationships causes 1 + N queries instead of 1.

**The Problem:**

```java
// ❌ BAD: 1 + 100 = 101 queries!
List<Order> orders = orderRepo.findByUserId(userId);     // Query 1
for (Order o : orders) {
    o.getItems().forEach(...);                     // Queries 2-101
}
```

**Solution 1: JOIN FETCH**

```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        WHERE o.userId = :userId
        """)
    List<Order> findByUserIdWithItems(@Param("userId") Long userId);
}
```

**Solution 2: @EntityGraph**

```java
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = {"items", "customer"})
    List<Order> findByUserId(Long userId);
}
```

**Solution 3: Batch Fetching**

```java
@Entity
public class Order {
    @OneToMany(fetch = FetchType.LAZY)
    @BatchSize(size = 50)  // Load items 50 at a time
    private List<Item> items;
}
// For 100 orders: 1 (orders) + 2 (items batches) = 3 queries
```

**Solution 4: DTO Projection (Best)**

```java
@Query("""
    SELECT new com.example.OrderDTO(o.id, o.userId, COUNT(i))
    FROM Order o
    LEFT JOIN o.items i
    WHERE o.userId = :userId
    GROUP BY o.id, o.userId
    """)
List<OrderDTO> findOrderSummaries(@Param("userId") Long userId);
```

**Interview tip:**
"N+1 is invisible until production with real data. Always use EntityGraph/JOIN FETCH for relationships. Test with 10K records, not 10."

---

### Q4: Connection Pooling (HikariCP)

**The simple answer:**
Reuse database connections instead of opening new ones. Opening a connection: 100-500ms. Reusing: < 1ms.

**Configuration:**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/banking_db
    hikari:
      maximum-pool-size: 20               # Peak connections
      minimum-idle: 5                     # Minimum idle kept ready
      connection-timeout: 30000           # 30s max wait
      idle-timeout: 600000                # 10min close idle
      max-lifetime: 1800000               # 30min force reconnect
      leak-detection-threshold: 60000     # Warn if held > 60s
```

**Pool Size Formula:**

```
pool_size = (CPU_cores * 2) + effective_spindles

Examples:
- 4-core SSD: (4 * 2) + 1 = 9
- 8-core SSD: (8 * 2) + 1 = 17
```

**Monitoring:**

```java
@Configuration
public class HikariMonitoringConfig {
    @Bean
    public MeterBinder hikariMetrics(DataSource dataSource) {
        return (registry) -> {
            HikariDataSource hikari = (HikariDataSource) dataSource;
            
            Gauge.builder("hikaricp.connections.active", 
                hikari::getActiveConnections).register(registry);
            
            Gauge.builder("hikaricp.connections.pending",
                hikari::getThreadsAwaitingConnection).register(registry);  // Alert if > 0
        };
    }
}
```

**Interview tip:**
"HikariCP is Spring's default. Pool size = (CPU_cores * 2) + spindles. Monitor active/pending queue. Leaks (unreturned connections) exhaust pools in minutes."

---

### Q5: Pagination (OFFSET vs Keyset)

**The simple answer:**
`OFFSET` pagination gets slow (scans all skipped rows). **Keyset pagination** stays O(1) via index cursor.

**The Problem:**

```sql
-- Page 100: offset 1000—database scans 1000 rows (slow!)
SELECT * FROM transactions
ORDER BY created_at DESC
LIMIT 10 OFFSET 1000;
```

**Solution: Keyset Pagination**

```sql
-- Use cursor: (created_at, id) < ('2024-01-15 18:30', 5012)
-- Index jump instantly (O(1))
SELECT * FROM transactions
WHERE (created_at, id) < ('2024-01-15 18:30', 5012)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```

**Spring Implementation:**

```java
@Service
public class TransactionPaginationService {
    
    public PageResponse<TransactionDTO> getTransactions(String cursor, int pageSize) {
        Pair<LocalDateTime, Long> decodedCursor = decodeCursor(cursor);
        
        List<Transaction> transactions = transactionRepo.findAfterCursor(
            decodedCursor.getLeft(),
            decodedCursor.getRight(),
            pageSize + 1
        );
        
        boolean hasNext = transactions.size() > pageSize;
        if (hasNext) {
            transactions = transactions.subList(0, pageSize);
        }
        
        String nextCursor = hasNext 
            ? encodeCursor(transactions.get(pageSize - 1).getCreatedAt(),
                          transactions.get(pageSize - 1).getId())
            : null;
        
        return new PageResponse<>(toDTO(transactions), nextCursor, hasNext);
    }
}

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("""
        SELECT t FROM Transaction t
        WHERE (t.createdAt, t.id) < (:createdAt, :id)
        ORDER BY t.createdAt DESC, t.id DESC
        LIMIT :pageSize
        """)
    List<Transaction> findAfterCursor(
        @Param("createdAt") LocalDateTime createdAt,
        @Param("id") Long id,
        @Param("pageSize") int pageSize
    );
}
```

**Interview tip:**
"OFFSET fine for small datasets. For 1M+ rows, use Keyset pagination with base64 cursors. You can't jump to page 500, but users browse sequentially anyway."

---

## Transactions & Consistency

### Q6: Isolation Levels (ACID)

**The simple answer:**
Four isolation levels control what stale data transactions can see. Higher = stronger consistency, lower throughput.

**Levels:**

| Level | Dirty Read | Non-Repeatable | Phantom | Use Case |
|-------|-----------|-----------|---------|----------|
| READ COMMITTED | ❌ No | Yes | Yes | Most transactions |
| REPEATABLE READ | ❌ No | No | Yes | Financial reports |
| SERIALIZABLE | ❌ No | No | No | Critical conflicts |

**Spring Configuration:**

```java
@Service
public class TransactionLevelService {
    
    // READ COMMITTED (default, good balance)
    @Transactional
    public void transferFunds(String fromId, String toId, BigDecimal amount) {
        Account from = accountRepo.lockById(fromId);  // SELECT ... FOR UPDATE
        Account to = accountRepo.lockById(toId);
        
        from.debit(amount);
        to.credit(amount);
    }
    
    // REPEATABLE READ for consistent reads
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BigDecimal calculateDailyBalance(String accountId, LocalDate date) {
        // All reads see consistent snapshot from transaction start
        BigDecimal balance = accountRepo.findById(accountId).get().getBalance();
        List<Transaction> txs = transactionRepo.findByAccountAndDate(accountId, date);
        return balance;
    }
    
    // SERIALIZABLE (slowest, use rarely)
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void largeTransfer(TransferRequest req) {
        // Complete isolation from concurrent changes
        Account from = accountRepo.findById(req.fromId()).get();
        Account to = accountRepo.findById(req.toId()).get();
        
        from.debit(req.amount());
        to.credit(req.amount());
    }
}
```

**Interview tip:**
"For banking: REPEATABLE_READ + pessimistic locks. SERIALIZABLE is overkill. Lock small amounts, hold briefly."

---

## Replication & Scaling

### Q7: Master-Slave Replication

**The simple answer:**
Master handles writes. Replicas copy the write log and handle reads. Scales read throughput 10x.

**Spring Configuration:**

```java
@Configuration
public class ReplicationDataSourceConfig {
    
    @Bean(name = "masterDataSource")
    @Primary
    public DataSource masterDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:postgresql://master:5432/db")
            .username(System.getenv("DB_USER"))
            .password(System.getenv("DB_PASSWORD"))
            .build();
    }
    
    @Bean(name = "replicaDataSource")
    public DataSource replicaDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://replica:5432/db");
        config.setUsername(System.getenv("DB_USER"));
        config.setPassword(System.getenv("DB_PASSWORD"));
        config.setMaximumPoolSize(30);  // More for reads
        config.setReadOnly(true);
        return new HikariDataSource(config);
    }
    
    @Bean
    public DataSource routingDataSource(
        @Qualifier("masterDataSource") DataSource master,
        @Qualifier("replicaDataSource") DataSource replica) {
        
        return new AbstractRoutingDataSource() {
            {
                setTargetDataSources(Map.of("MASTER", master, "REPLICA", replica));
                setDefaultTargetDataSource(master);
            }
            
            @Override
            protected Object determineCurrentLookupKey() {
                return TransactionSynchronizationManager.isCurrentTransactionReadOnly()
                    ? "REPLICA" : "MASTER";
            }
        };
    }
}

@Service
public class AccountService {
    @Transactional(readOnly = true)
    public Account getAccount(Long id) {
        return accountRepo.findById(id).get();  // Routes to replica
    }
    
    @Transactional
    public Account createAccount(Account account) {
        return accountRepo.save(account);  // Routes to master
    }
}
```

**Interview tip:**
"Replicas scale reads but add lag (eventual consistency). Use `@Transactional(readOnly=true)` to auto-route. After critical writes, read master to avoid stale data."

---

### Q8: Sharding (Horizontal Partitioning)

**The simple answer:**
Split mega-table across multiple databases. Each shard holds a subset based on a **shard key**.

**Strategies:**

```java
public class ShardingStrategy {
    private final int TOTAL_SHARDS = 4;
    
    // Hash-based: Even distribution
    public int getShardByHash(String userId) {
        return Math.abs(userId.hashCode() % TOTAL_SHARDS);
    }
    
    // Range-based: Geographic
    public int getShardByRegion(String region) {
        return switch(region) {
            case "US" -> 0;
            case "EU" -> 1;
            case "ASIA" -> 2;
            default -> 3;
        };
    }
}

@Service
public class ShardedTransactionService {
    private final Map<Integer, TransactionRepository> shards;
    
    public List<Transaction> getUserTransactions(String userId) {
        int shard = shardingStrategy.getShardByHash(userId);
        return shards.get(shard).findByUserId(userId);
    }
    
    // Cross-shard aggregation (expensive)
    public long countAllPendingTransactions() {
        long total = 0;
        for (int i = 0; i < TOTAL_SHARDS; i++) {
            total += shards.get(i).countByStatus("PENDING");
        }
        return total;
    }
}
```

**Interview tip:**
"Sharding is a last resort. Try replicas, caching, optimization first. When you shard: choose stable keys, distribute evenly, accept cross-shard queries are forbidden."

---

## Banking-Specific Patterns

### Q9: Saga Pattern (Distributed Transactions)

**The simple answer:**
Coordinate multi-service operations with compensation steps if anything fails.

**Implementation:**

```java
@Service
public class TransferSaga {
    private final AccountService accountService;
    private final NotificationService notificationService;
    
    @Transactional
    public void executeTransfer(TransferRequest request) {
        try {
            // Step 1: Debit source
            accountService.debit(request.fromId(), request.amount());
            
            // Step 2: Credit destination
            accountService.credit(request.toId(), request.amount());
            
            // Step 3: Notify
            notificationService.notify(request.userId(), "Transfer complete");
            
        } catch (InsufficientFundsException e) {
            // Compensation: Reverse debit
            accountService.credit(request.fromId(), request.amount());
            notificationService.notify(request.userId(), "Transfer failed");
            throw e;
        }
    }
}
```

**With Outbox Pattern:**

```java
@Service
public class TransferWithOutbox {
    private final AccountRepository accountRepo;
    private final OutboxRepository outboxRepo;
    
    @Transactional
    public void executeTransfer(TransferRequest request) {
        // 1. Debit and credit
        accountRepo.debit(request.fromId(), request.amount());
        accountRepo.credit(request.toId(), request.amount());
        
        // 2. Write to OUTBOX (SAME TRANSACTION)
        // Guarantees: If commit succeeds, event WILL be published
        outboxRepo.save(new OutboxEvent(
            UUID.randomUUID().toString(),
            "TransferCompleted",
            toJSON(request)
        ));
    }
}

// Background publisher
@Component
public class OutboxPublisher {
    @Scheduled(fixedDelay = 1000)
    public void publishEvents() {
        List<OutboxEvent> unpublished = outboxRepo.findByPublishedAtIsNull();
        
        for (OutboxEvent event : unpublished) {
            try {
                kafkaTemplate.send("transfer-events", event.getPayload());
                event.setPublishedAt(LocalDateTime.now());
                outboxRepo.save(event);
            } catch (Exception e) {
                // Retry next run
            }
        }
    }
}
```

**Interview tip:**
"Saga + Outbox: Ensures eventual consistency across services. Outbox guarantees atomic DB + event publish. Gold standard for banking."

---

### Q10: Event Sourcing (Audit Trails)

**The simple answer:**
Store every state change as an immutable event. Reconstruct any past state. Regulatory requirement for banking.

**Implementation:**

```sql
-- Event log (immutable append-only)
CREATE TABLE account_events (
    event_id BIGSERIAL PRIMARY KEY,
    aggregate_id BIGINT NOT NULL,       -- account_id
    event_type VARCHAR(50) NOT NULL,    -- "Opened", "Deposited"
    event_data JSONB NOT NULL,          -- Event payload
    timestamp TIMESTAMP NOT NULL,
    version BIGINT NOT NULL,
    UNIQUE(aggregate_id, version)
);
```

**Spring Implementation (Axon):**

```java
// Events
public record AccountOpenedEvent(String accountId, BigDecimal balance) {}
public record MoneyWithdrawnEvent(String accountId, BigDecimal amount) {}

// Aggregate
@Aggregate
public class BankAccount {
    @AggregateIdentifier
    private String accountId;
    private BigDecimal balance;
    
    @CommandHandler
    public void handle(WithdrawCommand cmd) {
        if (balance.compareTo(cmd.amount()) < 0) {
            throw new InsufficientFundsException();
        }
        AggregateLifecycle.apply(new MoneyWithdrawnEvent(accountId, cmd.amount()));
    }
    
    @EventSourcingHandler
    public void on(MoneyWithdrawnEvent event) {
        this.balance = balance.subtract(event.amount());
    }
}

// Audit service: query history
@Service
public class AuditService {
    public BigDecimal getBalanceAt(String accountId, LocalDateTime pointInTime) {
        List<DomainEventMessage<?>> events = eventStore.readEvents(accountId);
        
        BigDecimal balance = BigDecimal.ZERO;
        for (DomainEventMessage<?> msg : events) {
            if (msg.getTimestamp().isBefore(pointInTime)) {
                if (msg.getPayload() instanceof MoneyWithdrawnEvent e) {
                    balance = balance.subtract(e.amount());
                }
            }
        }
        return balance;
    }
}
```

**Interview tip:**
"Event sourcing is table-stakes for banking. Enables dispute resolution, fraud analysis, and regulatory proof. Reconstructing past state is trivial."

---

## Summary Interview Checklist

- [ ] Indexing: Composite with equality first, range last
- [ ] Query optimization: EXPLAIN ANALYZE workflow
- [ ] N+1 prevention: EntityGraph, batch fetching, DTO projections
- [ ] Connection pooling: HikariCP with (cores * 2) + spindles
- [ ] Keyset pagination: O(1) performance
- [ ] Isolation levels: REPEATABLE_READ + locks for banking
- [ ] Master-slave: Read replicas for scale
- [ ] Saga + Outbox: Distributed transaction consistency
- [ ] Event sourcing: Immutable audit trails
- [ ] Monitoring: pg_stat_statements, query metrics
- [ ] Banking patterns: Saga, Outbox, idempotency keys

---

## Banking Architecture Summary

| Pattern | Benefit | When |
|---------|---------|------|
| **Saga + Outbox** | Multi-service consistency | Distributed transactions |
| **Event Sourcing** | Immutable audit trail | Regulatory compliance |
| **Master-Slave** | 10x read throughput | High-read workloads |
| **Keyset Pagination** | O(1) list performance | Large result sets |
| **Pessimistic Locks** | No race conditions | Financial operations |
