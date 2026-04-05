# Senior Backend Interview — Database & Persistence (Banking/Fintech)

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

---

### Q9. How do you handle geospatial data in PostgreSQL? Explain PostGIS.

**PostGIS** is a PostgreSQL extension that adds support for geographic objects, spatial indexing, and geospatial functions.

**Setting up:**
```sql
CREATE EXTENSION postgis;
```

**Spatial column types:**
```sql
CREATE TABLE weather_stations (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100),
    location    GEOMETRY(Point, 4326),       -- WGS 84 (GPS coordinates)
    coverage    GEOMETRY(Polygon, 4326)       -- Station coverage area
);

-- Insert with latitude/longitude
INSERT INTO weather_stations (name, location)
VALUES ('Phnom Penh', ST_SetSRID(ST_MakePoint(104.9282, 11.5564), 4326));
```

**Common spatial queries:**

```sql
-- Find stations within 50km radius
SELECT name, ST_Distance(
    location::geography,
    ST_SetSRID(ST_MakePoint(104.92, 11.55), 4326)::geography
) AS distance_meters
FROM weather_stations
WHERE ST_DWithin(
    location::geography,
    ST_SetSRID(ST_MakePoint(104.92, 11.55), 4326)::geography,
    50000  -- 50km in meters
)
ORDER BY distance_meters;

-- Find stations within a province boundary (polygon)
SELECT s.name
FROM weather_stations s
JOIN provinces p ON ST_Within(s.location, p.boundary)
WHERE p.name = 'Battambang';

-- Calculate area of a polygon (in square meters)
SELECT name, ST_Area(boundary::geography) AS area_sq_m
FROM provinces;
```

**Spatial indexing (critical for performance):**
```sql
CREATE INDEX idx_station_location ON weather_stations USING GIST (location);
```

**JPA integration with Hibernate Spatial:**
```java
@Entity
public class WeatherStation {
    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location;  // org.locationtech.jts.geom.Point
}

// Repository with native spatial query
@Query(value = "SELECT * FROM weather_stations WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :radius)", nativeQuery = true)
List<WeatherStation> findNearby(@Param("lon") double lon, @Param("lat") double lat, @Param("radius") double radius);
```

**Performance tips:**
- Always use `ST_DWithin` (uses spatial index) instead of `WHERE ST_Distance(...) < N` (full table scan)
- Cast to `::geography` for meter-based distance calculations (vs degree-based `::geometry`)
- Use SRID 4326 (WGS 84) for stored GPS coordinates, transform to projected CRS for area calculations

---

### Q10. How does PostgreSQL table partitioning work? When should you use it?

**Table partitioning** divides a large table into smaller, more manageable pieces called partitions. PostgreSQL supports it natively since version 10.

**Partitioning strategies:**

| Strategy | Partition By | Use Case |
|----------|-------------|----------|
| **Range** | Date ranges, numeric ranges | Time-series data (logs, weather, transactions) |
| **List** | Discrete values | Data by region, category, tenant |
| **Hash** | Hash of column value | Even distribution when no natural range |

**Range partitioning for time-series data:**
```sql
-- Parent table (no data stored here directly)
CREATE TABLE weather_observations (
    id          BIGSERIAL,
    station_id  VARCHAR(20) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    temperature DECIMAL(5,2),
    rainfall    DECIMAL(8,2),
    location    GEOMETRY(Point, 4326),
    PRIMARY KEY (id, observed_at)    -- partition key must be in PK
) PARTITION BY RANGE (observed_at);

-- Monthly partitions
CREATE TABLE weather_obs_2026_01 PARTITION OF weather_observations
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE weather_obs_2026_02 PARTITION OF weather_observations
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- Default partition (catches data that doesn't match any partition)
CREATE TABLE weather_obs_default PARTITION OF weather_observations DEFAULT;
```

**Automated partition management (Spring scheduled task):**
```java
@Scheduled(cron = "0 0 1 1 * *")  // 1st of every month
@SchedulerLock(name = "partitionMaintenance")
public void managePartitions() {
    // Create next month's partition
    LocalDate nextMonth = LocalDate.now().plusMonths(1);
    String partName = "weather_obs_" + nextMonth.format(DateTimeFormatter.ofPattern("yyyy_MM"));
    jdbcTemplate.execute("""
        CREATE TABLE IF NOT EXISTS %s PARTITION OF weather_observations
        FOR VALUES FROM ('%s') TO ('%s')
        """.formatted(partName, nextMonth.withDayOfMonth(1), nextMonth.plusMonths(1).withDayOfMonth(1)));

    // Drop partitions older than 2 years
    LocalDate cutoff = LocalDate.now().minusYears(2);
    String oldPart = "weather_obs_" + cutoff.format(DateTimeFormatter.ofPattern("yyyy_MM"));
    jdbcTemplate.execute("DROP TABLE IF EXISTS " + oldPart);
}
```

**Benefits:**
- **Query performance:** Queries on `observed_at` skip irrelevant partitions (partition pruning)
- **Maintenance:** `VACUUM` and `REINDEX` run per partition, not the whole table
- **Data lifecycle:** Drop old partitions instantly (vs `DELETE` which is slow and bloats WAL)
- **Parallel scans:** PostgreSQL can scan multiple partitions in parallel

**When to partition:**
- Table has 100M+ rows and growing
- Queries almost always filter on the partition key (e.g., date range)
- Old data needs periodic purging (drop partition vs slow DELETE)

**When NOT to partition:**
- Small tables (<10M rows) — overhead isn't worth it
- Queries frequently span all partitions — no benefit from pruning
- No natural partition key in your access patterns

---

### Q11. What is a database deadlock and how do you prevent or handle it?

**Deadlock** occurs when two or more transactions hold locks and each waits for the other to release their lock, creating a cycle of dependencies. Neither transaction can proceed.

**Example Scenario:**
- Transaction 1 locks Row A, needs Row B
- Transaction 2 locks Row B, needs Row A
→ Database detects deadlock and aborts one transaction (victim).

**How to prevent deadlocks:**
1. **Always access resources in the exact same order** across all transactions. If every service locks Order then Payment, they will never deadlock.
2. **Sort items before batch updates.** If updating multiple rows, order them by ID before issuing the UPDATE.
3. **Use smaller transactions.** Keep transactions short and only wrap database operations (do external API calls before starting the transaction).
4. **Use appropriate isolation levels.** Don't use SERIALIZABLE if READ COMMITTED is sufficient.
5. **Use optimistic locking (@Version in JPA)** instead of pessimistic locking when conflicts are rare.

**How to handle deadlocks in Spring:**
If a deadlock occurs, the DB throws an exception (e.g., `DeadlockLoserDataAccessException`). You can implement automatic retries using `@Retryable` (from Spring Retry).
```java
@Retryable(
    value = DeadlockLoserDataAccessException.class, 
    maxAttempts = 3, 
    backoff = @Backoff(delay = 100))
@Transactional
public void processPayment() { ... }
```

---

### Q12. Explain OFFSET/LIMIT vs Keyset Pagination (Cursor Pagination). Why is OFFSET bad for large tables?

**OFFSET/LIMIT Pagination:**
```sql
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 50 OFFSET 100000;
```
**Why it's bad:** To skip 100,000 rows, the database must generate and discard all 100,000 rows before returning the 50 you want. As the OFFSET grows, query time increases linearly (can take seconds or minutes on large tables).

**Keyset Pagination (Cursor Pagination):**
```sql
SELECT * FROM transactions 
WHERE (created_at, id) < ('2023-10-01 12:00:00', 5012)
ORDER BY created_at DESC, id DESC 
LIMIT 50;
```
**Why it's better:** The database uses the index on `(created_at, id)` to instantly jump to the cursor position and read the next 50 rows. Performance remains constant (O(1) index lookup) regardless of how deep you paginate.

**Trade-offs:**
- You cannot jump directly to "Page 500" (no page numbers).
- The cursor column must be strictly unique (usually combination of timestamp + ID).

---

### Q13. What is a Materialized View in PostgreSQL and when should you use it?

A standard `VIEW` executes its underlying query every time it is accessed.
A **Materialized View** executes the query once and saves the result physically on disk. 

**Use Cases:** 
- Aggregating historical data (e.g., Daily Sales Reports dashboard)
- Complex JOINs across many tables that rarely change
- Pre-computing statistics 

**Drawback:** The data becomes stale. It must be manually refreshed.

**Syntax:**
```sql
CREATE MATERIALIZED VIEW daily_sales AS
SELECT date_trunc('day', created_at) AS day, SUM(amount) AS total
FROM orders
GROUP BY 1;
```

**Refreshing:**
```sql
-- Locks the view while refreshing (blocking reads)
REFRESH MATERIALIZED VIEW daily_sales;

-- Requires a UNIQUE index on the view. Refreshes concurrently without blocking reads!
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;
```

---

### Q14. Explain the CAP theorem. How does it apply to databases?

The CAP Theorem states that a distributed data store can only simultaneously provide two out of three guarantees:
- **Consistency (C):** Every read receives the most recent write or an error.
- **Availability (A):** Every request receives a (non-error) response, without guarantee that it contains the most recent write.
- **Partition Tolerance (P):** The system continues to operate despite an arbitrary number of messages being dropped/delayed by the network between nodes.

**Since network partitions (P) are unavoidable in distributed systems, you must choose between C and A:**

- **CP (Consistency over Availability):** 
  - If a node goes down, the system rejects requests to ensure no stale data is read.
  - Examples: MongoDB, HBase, Redis (in Cluster mode depending on config).
  - Use case: Banking balances.

- **AP (Availability over Consistency):**
  - If a node goes down, the system returns the local, potentially stale data (Eventual Consistency).
  - Examples: Cassandra, DynamoDB, CouchDB.
  - Use case: Social media feeds, product reviews.

- **CA Systems (Relational DBs):** 
  - Standard PostgreSQL / MySQL without distributed clustering are CA systems. They do not tolerate network partitions between nodes because they are fundamentally single-node masters.

---

### Q15. How do you implement safely database schema migrations in a CI/CD pipeline?

Instead of running SQL scripts manually, you use version control tools like **Flyway** or **Liquibase**.

**The Process (Flyway):**
1. Store SQL scripts in `src/main/resources/db/migration` (e.g., `V1__init.sql`, `V2__add_users.sql`).
2. On application startup, Flyway checks a `flyway_schema_history` table in the DB.
3. It compares the checksums of existing files against the DB.
4. If a new file is detected, it runs it. If an old file was modified, it throws an error (immutability).

**Best Practices for CI/CD:**
- **Backward Compatibility:** Migrations MUST be backward compatible (Expand-Contract pattern). The old version of the app must run alongside the new version of the app while the DB migrates (Blue-Green Deployment).
- **Never modify existing scripts:** Always create a new script (e.g., `V3__fix_view.sql`).
- **Idempotency:** Write `CREATE TABLE IF NOT EXISTS` or `ADD COLUMN IF NOT EXISTS` if possible.
- **Validate in CI:** Use Testcontainers in your CI pipeline to spin up a fresh PostgreSQL container, run all Flyway migrations from V1 to V_Current, and ensure no syntax errors exist.
