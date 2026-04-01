# Senior Backend Interview — Database & Persistence

---

### Q1. Explain the difference between clustered and non-clustered indexes. How do you decide what to index?

**Clustered Index:**
- Defines the physical order of rows on disk
- Only one per table (in most databases)
- In PostgreSQL, use `CLUSTER` command; in MySQL/InnoDB, the primary key is always the clustered index
- Range queries on the clustered key are fast (rows are physically adjacent)

**Non-Clustered Index:**
- A separate B-tree structure storing index key + pointer (row ID) to the actual row
- Multiple allowed per table
- Requires an extra lookup to fetch the full row (unless it's a covering index)

**Covering Index:** Includes all columns needed by a query, eliminating the row lookup:
```sql
CREATE INDEX idx_orders_user_status ON orders(user_id, status, created_at);
-- Covers: SELECT status, created_at FROM orders WHERE user_id = ?
```

**Composite Index Column Order:**
- Put equality conditions first, range conditions last
- `WHERE user_id = ? AND created_at > ?` → index on `(user_id, created_at)`

**When to index:**
- Columns frequently used in WHERE, JOIN ON, ORDER BY
- High cardinality columns (many distinct values)
- Foreign keys (often missed — causes slow joins)

**When NOT to index:**
- Low cardinality columns (boolean, status with 2-3 values)
- Tables with heavy write load (indexes slow down INSERT/UPDATE/DELETE)
- Small tables (full scan is faster)

---

### Q2. How do you approach query optimization when a query is slow?

**Step-by-step process:**

1. **Identify the slow query** — pg_stat_statements (PostgreSQL), slow query log (MySQL)

2. **Run EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 AND status = 'PENDING';
```
Look for: Sequential Scans on large tables, high row estimates vs actuals, nested loop vs hash join.

3. **Check for missing indexes** — seq scan on a large table is usually the culprit

4. **Fix N+1 queries** — use JOIN FETCH or batch loading instead of per-entity queries

5. **Avoid SELECT *** — fetch only needed columns; reduces I/O and prevents over-fetching

6. **Optimize JOINs** — ensure JOIN columns are indexed, avoid joining on unindexed expressions

7. **Use query result caching** — Spring Cache (`@Cacheable`) with Redis for expensive, infrequently-changing queries

8. **Connection pool tuning** — ensure HikariCP pool size matches DB capacity; too small causes queue, too large causes DB contention

9. **Pagination** — never load unbounded result sets; use keyset pagination for large datasets instead of OFFSET

---

### Q3. When would you use SQL vs NoSQL? Describe a scenario where you switched and why.

**Use SQL (Relational) when:**
- Data has well-defined relationships and schema
- ACID transactions are required (financial, inventory)
- Complex queries with multiple JOINs
- Data integrity and referential constraints matter

**Use NoSQL when:**
- Schema is flexible or evolving rapidly
- Horizontal scaling is needed (sharding)
- Access pattern is known and simple (key-value lookups)
- High write throughput or time-series data

**NoSQL types and use cases:**

| Type | Example | Use Case |
|------|---------|----------|
| Document | MongoDB, Couchbase | User profiles, product catalogs |
| Key-Value | Redis, DynamoDB | Sessions, caches, leaderboards |
| Column-family | Cassandra | Time-series, IoT data |
| Graph | Neo4j | Social networks, recommendations |

**Example scenario:**
> "We started with PostgreSQL for a user activity feed. As the user base grew to millions, the `activity` table had billions of rows. Queries slowed despite indexing. We migrated the feed to Cassandra, partitioning by `user_id` and clustering by `timestamp DESC`. Read latency dropped from 800ms to 12ms. Relational data (users, accounts) stayed in PostgreSQL."

---

### Q4. Explain database connection pooling and how to tune it for high-traffic applications.

**Why pooling?** Opening a new DB connection is expensive (TCP handshake, authentication, memory allocation). A connection pool maintains a set of pre-opened connections and reuses them.

**HikariCP** (Spring Boot default):
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000   # 30s max wait for a connection
      idle-timeout: 600000        # 10min idle connection lifetime
      max-lifetime: 1800000       # 30min max connection lifetime
```

**Pool size formula (from HikariCP docs):**
```
pool_size = (core_count * 2) + effective_spindle_count
```
For a 4-core server with SSD: `(4 * 2) + 1 = 9`.

**Common mistakes:**
- Pool too large → DB runs out of connections, context switching overhead
- Pool too small → threads queue waiting for connections
- Not monitoring pool metrics → silent starvation

**Monitoring:**
- Actuator exposes HikariCP metrics: `hikaricp.connections.active`, `hikaricp.connections.pending`
- Alert on `pending > 0` for sustained periods

---

### Q5. What is the N+1 problem and how do you detect and fix it in JPA/Hibernate?

**The Problem:**
When fetching a list of N entities, JPA lazily loads each relationship with a separate query — resulting in 1 + N queries.

```java
List<Order> orders = orderRepo.findAll(); // 1 query
for (Order o : orders) {
    o.getItems().size(); // N queries (lazy load)
}
```

**Detection:**
```yaml
spring:
  jpa:
    properties:
      hibernate:
        generate_statistics: true
```
Or use p6spy / datasource-proxy to log and count all SQL statements in tests.

**Fix 1 — JOIN FETCH in JPQL:**
```java
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.userId = :userId")
List<Order> findWithItems(@Param("userId") Long userId);
```

**Fix 2 — @EntityGraph:**
```java
@EntityGraph(attributePaths = {"items", "customer"})
List<Order> findByStatus(String status);
```

**Fix 3 — Batch fetching:**
```java
@OneToMany
@BatchSize(size = 50)
private List<Item> items;
```

**Fix 4 — DTO projections (most efficient):**
```java
@Query("SELECT new com.example.OrderDTO(o.id, o.status, i.name) FROM Order o JOIN o.items i")
List<OrderDTO> findOrderSummaries();
```

---

### Q6. Explain database transaction isolation levels. When would you use each?

**Transaction Isolation Levels (from least to most strict):**

| Level | Dirty Read | Non-Repeatable Read | Phantom Read | Performance |
|---|---|---|---|---|
| **READ UNCOMMITTED** | Yes | Yes | Yes | Fastest |
| **READ COMMITTED** (PostgreSQL default) | No | Yes | Yes | Good |
| **REPEATABLE READ** (MySQL default) | No | No | Yes | Moderate |
| **SERIALIZABLE** | No | No | No | Slowest |

**Key terms:**
- **Dirty Read:** Reading uncommitted data from another transaction.
- **Non-Repeatable Read:** A row you read earlier has been updated by another committed transaction when you read it again.
- **Phantom Read:** New rows appear in a range query because another transaction inserted them.

**When to use which:**
- **READ COMMITTED:** Most web applications. Good balance of consistency and performance. Each query sees only committed data.
- **REPEATABLE READ:** Financial reports where consistent reads within a transaction are critical. The same SELECT returns the same data throughout the transaction.
- **SERIALIZABLE:** Critical financial operations (transfers, inventory). Guarantees transactions execute as if they ran one at a time. Use sparingly — causes contention.

```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void transferFunds(Long fromId, Long toId, BigDecimal amount) { ... }
```

---

### Q7. How do you implement database sharding? What are the trade-offs?

**Sharding** splits a single large database into multiple smaller databases (shards), each holding a subset of the data.

**Sharding strategies:**

1. **Range-based:** Shard by ID ranges (1-1M → Shard A, 1M-2M → Shard B). Risk of hotspots if recent IDs are accessed more.

2. **Hash-based:** `shard = hash(userId) % num_shards`. Even distribution, but hard to add/remove shards (requires resharding).

3. **Geography-based:** Shard by region (Asia → Shard A, EU → Shard B). Low latency for regional users.

**Trade-offs:**

| Benefit | Challenge |
|---|---|
| Horizontal scalability | Cross-shard queries are expensive |
| Better write throughput | Joins across shards are essentially impossible |
| Fault isolation | Distributed transactions become complex |
| Data locality | Adding shards requires data migration |

**Best practices:**
- Choose a shard key that distributes data evenly and aligns with query patterns
- Avoid cross-shard queries — design for single-shard lookups
- Consider using a routing layer or proxy (like Vitess for MySQL, Citus for PostgreSQL)
- Exhaust vertical scaling and read replicas before sharding — it adds immense complexity

---

### Q8. What is database replication? Compare master-slave vs multi-master.

**Master-Slave (Primary-Replica):**
- One master handles all writes. Changes are replicated to one or more read replicas.
- Read replicas handle read queries, scaling read throughput.
- Replication can be synchronous (strong consistency, higher latency) or asynchronous (eventual consistency, lower latency).

```
                  Writes
Client ─────────→ [Master]
                      │ replication
                      ├──→ [Replica 1] ←── Reads
                      └──→ [Replica 2] ←── Reads
```

**Spring Boot configuration:**
```java
// Route read queries to replica, writes to master
@Transactional(readOnly = true)  // → routes to replica DataSource
public List<User> findAll() { ... }

@Transactional  // → routes to master DataSource
public User save(User user) { ... }
```

**Multi-Master:**
- Multiple nodes accept writes. Each node replicates to the others.
- Higher write availability but introduces conflict resolution complexity.
- Used in geo-distributed systems where each region needs local write capability.

**When to use which:**
- **Master-Slave:** Most applications. Simple, well-understood. Scale reads easily.
- **Multi-Master:** Geo-distributed apps requiring low-latency writes in multiple regions. Accept the complexity of conflict resolution.
