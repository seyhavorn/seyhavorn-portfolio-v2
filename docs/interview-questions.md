# Senior Backend Developer Interview Questions & Answers

This document provides a comprehensive list of interview questions across essential backend domains, complete with detailed answers and explanations, tailored for a Senior Backend Developer role (Java/Spring Boot stack).

---

## 1. Backend Architecture & System Design

**Question 1:** How would you design a highly available, scalable system that needs to handle millions of requests per day?
**Answer:** I would start with a load balancer (like AWS ALB or Nginx) to distribute incoming traffic horizontally across multiple stateless application instances. The application itself would be composed of independent microservices for different business domains to allow for independent scaling. I'd use an API Gateway for routing and rate-limiting. For the database tier, I would use a primary-replica architecture (read replicas to scale read traffic) and potentially database sharding if the dataset is massive. To reduce database load, I would implement a robust caching layer using Redis or Memcached for frequently accessed data. Finally, I'd decouple heavy or slow processes using message brokers like Kafka or RabbitMQ to ensure the main threads aren't blocked, allowing for asynchronous processing and increased throughput.

**Question 2:** Explain the CAP theorem. How does it influence your choice of data storage in a distributed system?
**Answer:** The CAP theorem states that a distributed data store can only guarantee two out of the three following properties simultaneously in the event of a network partition:
*   **Consistency (C):** Every read receives the most recent write or an error.
*   **Availability (A):** Every request receives a non-error response, without the guarantee that it contains the most recent write.
*   **Partition Tolerance (P):** The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.
Since network partitions (P) are unavoidable in distributed systems, we must choose between C and A. If my system handles financial transactions, I will choose Consistency (CP systems like traditional SQL databases with synchronous replication, or MongoDB). If the system handles social media feeds where eventual consistency is fine, I will choose Availability (AP systems like Cassandra or DynamoDB).

**Question 3:** What are the common patterns to handle distributed transactions across multiple microservices?
**Answer:** Because traditional Two-Phase Commit (2PC) does not scale well over distributed network boundaries, the modern approach is the **Saga Pattern**. A Saga is a sequence of local transactions. Each local transaction updates the database and publishes a message or event to trigger the next local transaction in the saga. There are two ways to implement it:
*   **Choreography:** Each service listens to events and decides what to do. There is no central coordinator.
*   **Orchestration:** A central coordinator service tells the participating services what local transactions to execute.
If a local transaction fails, the saga executes a series of **compensating transactions** to undo the changes made by the preceding local transactions. Additionally, the **Outbox Pattern** is often used alongside Sagas to ensure that the database update and the event publication occur atomically.

---

## 2. Spring Boot & Java Ecosystem

**Question 4:** Explain how Spring Boot auto-configuration works behind the scenes.
**Answer:** Auto-configuration is driven by the `@EnableAutoConfiguration` annotation (which is included in `@SpringBootApplication`). When the application starts, Spring Boot scans the `META-INF/spring.factories` file (or `org.springframework.boot.autoconfigure.AutoConfiguration.imports` in Spring Boot 2.7/3.0+) across all jars on the classpath to find configuration classes. It processes these configuration classes using `@Conditional` annotations. For example, `@ConditionalOnClass(DataSource.class)` will only instantiate a database connection pool if the `DataSource` class is on the classpath. Other common conditionals include `@ConditionalOnMissingBean` (only create this bean if the user hasn't defined their own) and `@ConditionalOnProperty`. This allows Spring Boot to intelligently "guess" and configure beans based on your dependencies.

**Question 5:** How do you handle exceptions globally in a Spring Boot REST API?
**Answer:** I use the `@RestControllerAdvice` annotation on a class to create a global exception handler. Inside this class, I define methods annotated with `@ExceptionHandler(SpecificException.class)`. When that specific exception is thrown anywhere in a controller, Spring routes it to that method. Inside the method, I map the exception to a standard, consistent error response format. In modern Spring Boot (3.x), I would use the RFC 7807 `ProblemDetail` specification to return a standardized JSON object containing a `type`, `title`, `status`, `detail`, and `instance`.

**Question 6:** Describe the difference between `@Transactional` default behavior and `Propagation.REQUIRES_NEW`. When would you use the latter?
**Answer:** By default, `@Transactional` uses `Propagation.REQUIRED`. This means if a transaction already exists, the method joins it; if not, it creates a new one. If an exception occurs within the joined method, the entire outer transaction rolls back.
`Propagation.REQUIRES_NEW`, however, always completely suspends the current transaction (if one exists) and starts a brand new, independent transaction. If the new transaction rolls back, it does *not* affect the outer transaction, and vice versa. I use `REQUIRES_NEW` for operations that must persist regardless of the main business logic's success or failure, such as writing to an audit log table or sending an email notification record.

---

## 3. Database & Persistence (DB)

**Question 7:** A query in PostgreSQL is performing very slowly. Walk me through how you would troubleshoot and optimize it.
**Answer:** 
1.  First, I would prepend the query with `EXPLAIN ANALYZE` to get the actual execution plan. I would look for "Sequential Scans" (Seq Scan) on large tables, which indicates the database is iterating over every row.
2.  I would evaluate the `WHERE`, `JOIN`, and `ORDER BY` clauses to determine if a B-Tree index is missing on those columns.
3.  If it's an API call, I would check the ORM (like Hibernate). Often, slow queries are actually due to the "N+1 query problem," where the ORM executes one query for a parent entity and N individual queries for its children. I would fix this using `JOIN FETCH` or `@EntityGraph`.
4.  I would also check for table bloat caused by PostgreSQL's MVCC and run a `VACUUM ANALYZE` if necessary to update table statistics so the query planner can make better decisions.

**Question 8:** Explain the concept of database indexing. What are the trade-offs of having too many indexes?
**Answer:** A database index is a data structure (typically a B-Tree) that improves the speed of data retrieval operations on a table at the cost of additional writes and storage space. It works much like an index in a book.
The major trade-off of having too many indexes is severely degraded write performance. Every time an `INSERT`, `UPDATE`, or `DELETE` occurs, the database not only updates the table row but must also traverse and update every single index associated with that table. Unnecessary indexes also consume hard drive space and memory space in the buffer cache.

**Question 9:** Compare pessimistic locking and optimistic locking. When do you use which?
**Answer:** 
*   **Pessimistic Locking:** Assumes concurrent conflicts will happen. It locks the row at the database level (e.g., using `SELECT ... FOR UPDATE`). No other transaction can read or update that row until the holding transaction commits. This prevents conflicts entirely but severely limits concurrency and can cause deadlocks.
*   **Optimistic Locking:** Assumes conflicts are rare. It doesn't lock the database row. Instead, it relies on a `@Version` column (either a number or a timestamp). When updating, the system checks if the version in the database matches the version read initially. If someone else updated it in the meantime, the version won't match, and an `OptimisticLockException` is thrown.
I use optimistic locking almost everywhere by default, particularly for high-read web applications. I only use pessimistic locking in situations where conflict is guaranteed and the cost of retrying the transaction is exceptionally high (e.g., deducting funds from a shared bank account balance).

---

## 4. DevOps & Cloud Infrastructure

**Question 10:** Walk me through a CI/CD pipeline you would set up for a Spring Boot microservice.
**Answer:** 
1.  **Continuous Integration:** A developer pushes code to Git. The pipeline triggers. It compiles the code and runs unit tests (`mvn clean test`).
2.  **Code Quality:** The pipeline runs a SonarQube analysis to check for technical debt, test coverage, and security vulnerabilities.
3.  **Integration Testing:** The pipeline runs integration tests using Testcontainers against real, containerized dependencies.
4.  **Containerization:** If tests pass, the pipeline builds a Docker image using the Dockerfile (or Spring Boot Buildpacks) and tags it with the Git commit hash.
5.  **Push:** The image is pushed to a container registry (AWS ECR or DockerHub).
6.  **Continuous Deployment:** The pipeline updates the Helm chart or Kubernetes manifest with the new image tag and deploys it to the Staging environment. After manual or automated QA approval, the same immutable image is promoted and deployed to Production.

**Question 11:** How do you securely manage secrets (passwords, API keys) in a containerized environment?
**Answer:** Secrets should never be hardcoded in the application source code or stored in the `application.yml` file committed to Git. They should also not be baked into the Docker image.
Instead, the Spring Boot application expects these secrets to be provided as Environment Variables at runtime. In a Kubernetes environment, I would store the sensitive values in **Kubernetes Secrets**. For a more robust enterprise setup, I would use a solution like **HashiCorp Vault** or **AWS Secrets Manager**, and have the pod fetch the secrets at startup or use a sidecar container to inject them securely into the pod's environment.

**Question 12:** What is horizontal pod autoscaling (HPA) in Kubernetes, and what metrics can trigger it?
**Answer:** HPA is a Kubernetes controller that automatically scales the number of Pod replicas up or down based on observed metrics. This ensures the application handles traffic spikes without manual intervention and scales down to save costs when traffic is low.
The most common triggers are average CPU utilization (e.g., scale up if average CPU across pods exceeds 80%) or memory usage. However, using custom metrics is often more effective—for example, scaling a worker service based on the number of pending messages in a RabbitMQ or Kafka queue, or scaling a web server based on the incoming HTTP request rate.

---

## 5. Artificial Intelligence (AI) Integration

**Question 13:** How would you integrate an LLM (Large Language Model) API into a Spring Boot application?
**Answer:** I would use a dedicated framework like **Spring AI** or **LangChain4j**, which abstract away the raw HTTP calls and provide a portable interface (meaning I can swap OpenAI out for Anthropic or Llama without changing my core logic). 
Crucial considerations for the integration include:
1.  **Fault Tolerance:** LLM APIs are prone to rate limits (429s) and timeouts. I would use a library like Resilience4j to wrap calls with exponential backoff retries and circuit breakers.
2.  **Streaming:** LLM generation takes seconds. Instead of a synchronous blocking call, I would utilize the streaming API to return a `Flux<String>` and stream the tokens back to the client using Server-Sent Events (SSE) so the user sees typing in real-time.

**Question 14:** Explain the RAG (Retrieval-Augmented Generation) pattern. How does a Vector Database fit into this architecture?
**Answer:** LLMs are prone to hallucinations and are frozen in time (they only know what they were trained on). RAG solves this by providing the LLM with relevant, private, or up-to-date context right before it answers.
A Vector DB is central to this. First, we chunk our private documents, convert them into mathematical vectors (embeddings) using an embedding model, and store them in a Vector DB (like pgvector or Milvus). 
When a user asks a question, we embed their question, perform a "cosine similarity search" in the Vector DB to find the most relevant document chunks, and inject those chunks directly into the prompt sent to the LLM (e.g., "Answer the question using ONLY the following context: [Chunks]").

---

## 6. Unit Testing & Quality Assurance

**Question 15:** Describe your approach to testing a Spring Boot REST controller. What layers do you mock?
**Answer:** I test the REST controller in isolation using `@WebMvcTest`. This annotation only spins up the web layer (Controllers, Filters, ControllerAdvice) without loading the entire Spring application context.
I completely mock the underlying Service layer using `@MockBean`. In my test methods, I use `MockMvc` to perform HTTP GET/POST requests and assert:
1.  The HTTP status code (e.g., 200 OK, 400 Bad Request, 404 Not Found).
2.  That proper JSON structure is returned.
3.  That `@Valid` annotations on the RequestBody are working properly (by sending invalid payloads and expecting 400s).

**Question 16:** What are Testcontainers, and why are they preferable to using an in-memory database like H2 for testing?
**Answer:** Testcontainers is a Java library that allows you to spin up lightweight, throwaway instances of common databases (PostgreSQL, MySQL), message brokers (Kafka), or anything else that runs in a Docker container directly from your JUnit tests.
H2 is great, but it often has subtle behavioral or syntax differences from your actual production database (e.g., JSONB columns, specific window functions, or transaction isolation quirks). Testcontainers ensures that your integration tests are running against the exact same database engine and version used in production, establishing true environment parity and catching bugs before they reach deployment.
