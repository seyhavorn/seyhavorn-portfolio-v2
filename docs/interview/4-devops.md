# Senior Backend Interview — DevOps & Cloud Infrastructure

---

### Q1. Walk me through your CI/CD pipeline setup for a Spring Boot application.

**Typical pipeline stages:**

```
Code Push → CI Build → Unit Tests → Integration Tests
→ Docker Build → Push to Registry → Deploy to Staging
→ Smoke Tests → Deploy to Production → Health Check
```

**Tool stack example (GitHub Actions + AWS ECS):**

```yaml
jobs:
  build:
    steps:
      - uses: actions/checkout@v3
      - name: Build & Test
        run: ./mvnw clean verify
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Push to ECR
        run: docker push $ECR_REGISTRY/myapp:${{ github.sha }}
      - name: Deploy to ECS
        run: aws ecs update-service --force-new-deployment
```

**Environment promotion:**
- `main` branch → deploy to staging automatically
- Production deploy requires manual approval or tagged release

**Rollback strategy:**
- Keep previous Docker image tag in registry
- ECS/Kubernetes: roll back to previous task definition/deployment
- Feature flags to disable new code without redeployment

---

### Q2. How do you containerize a Spring Boot application? Best practices for the Dockerfile?

**Multi-stage Dockerfile (best practice):**

```dockerfile
# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Run (minimal image)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/*.jar app.jar

ENTRYPOINT ["java",
  "-XX:+UseContainerSupport",
  "-XX:MaxRAMPercentage=75.0",
  "-jar", "app.jar"]
```

**Best practices:**
- Multi-stage build — don't ship the JDK or Maven in the final image
- Use JRE not JDK in runtime image
- Non-root user — reduces attack surface
- `.dockerignore` — exclude target/, .git, IDE files
- `-XX:+UseContainerSupport` — JVM respects container memory limits
- Pin base image version for reproducibility

---

### Q3. Explain Kubernetes key concepts: Pod, Deployment, Service, Ingress, ConfigMap, Secret.

| Resource | Purpose |
|---------|---------|
| **Pod** | Smallest deployable unit — one or more containers sharing network and storage |
| **Deployment** | Manages desired state of Pods; handles rolling updates and rollbacks |
| **Service** | Stable network endpoint for a set of Pods (ClusterIP / NodePort / LoadBalancer) |
| **Ingress** | HTTP routing rules — maps hostnames/paths to Services; TLS termination |
| **ConfigMap** | Non-sensitive configuration (env vars, config files) injected into Pods |
| **Secret** | Sensitive config (passwords, tokens) — base64 encoded, optionally encrypted at rest |

**Liveness vs Readiness probes:**
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 15
```

- Liveness: "Is the app alive?" — failure triggers restart
- Readiness: "Is the app ready for traffic?" — failure removes from load balancer

---

### Q4. How do you manage application secrets and configurations across environments?

**Rule #1: Never commit secrets to version control.**

**Secrets management options:**

| Tool | When to use |
|------|------------|
| **HashiCorp Vault** | Multi-cloud, dynamic secrets, lease-based rotation |
| **AWS Secrets Manager** | AWS-native, auto-rotation, IAM integration |
| **Kubernetes Secrets** | Simple setups; use with Sealed Secrets or External Secrets Operator |

**Kubernetes External Secrets Operator pattern:**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
spec:
  secretStoreRef:
    name: aws-secrets-manager
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: prod/myapp/db
        property: password
```

**Secret rotation:** Secrets should have TTLs and be rotated automatically. Apps should handle credential refresh without restart.

---

### Q5. What is your observability strategy? How do you implement logging, metrics, and tracing?

**The Three Pillars of Observability:**

**1. Logs — Structured JSON logging:**
```java
log.info("Order processed", kv("orderId", id), kv("userId", userId), kv("duration_ms", elapsed));
```
- Ship to ELK Stack or Grafana Loki
- Always include correlation/trace ID in every log line

**2. Metrics — Micrometer + Prometheus + Grafana:**
```java
Counter.builder("orders.processed")
    .tag("status", "success")
    .register(meterRegistry)
    .increment();
```
Key metrics: HTTP latency (p50, p95, p99), error rates, JVM memory/GC, DB pool saturation.

**3. Distributed Tracing — OpenTelemetry + Jaeger/Zipkin:**
- Trace ID propagated automatically across HTTP and Kafka
- Visualize end-to-end request flows in Jaeger UI
- Sample 100% in dev, 1-5% in production

---

### Q6. Explain blue-green and canary deployment strategies.

**Blue-Green Deployment:**
- Maintain two identical environments: Blue (current production) and Green (new version).
- Deploy new version to Green. Run smoke tests. If all pass, switch the load balancer from Blue to Green.
- Instant rollback — switch back to Blue if issues arise.
- **Trade-off:** Requires double the infrastructure during deployment.

```
Load Balancer ──→ [Blue v1.0] (current prod)
                  [Green v1.1] (staging, not receiving traffic)

After switch:
Load Balancer ──→ [Green v1.1] (new prod)
                  [Blue v1.0] (idle, ready for rollback)
```

**Canary Deployment:**
- Gradually route a small percentage of traffic (e.g., 5%) to the new version. Monitor error rates, latency.
- If metrics are healthy, increase to 25%, 50%, 100%.
- If issues are detected, route 100% back to the old version.
- **Trade-off:** More complex routing but lower risk than big-bang switch.

**Rolling Deployment (Kubernetes default):**
- Gradually replace old pods with new pods one at a time.
- Configured via `maxSurge` and `maxUnavailable` in the Deployment spec.
- No extra infrastructure needed, but rollback is slower.

---

### Q7. How do you handle log aggregation and debugging in a microservices environment?

**Challenge:** A single user request may span 10+ services. Logs are scattered across dozens of containers.

**Solution — Centralized Log Aggregation:**

```
Microservice A → Fluentd/Logstash → Elasticsearch → Kibana
Microservice B → Fluentd/Logstash ↗
Microservice C → Fluentd/Logstash ↗
```

**Key practices:**

1. **Structured logging (JSON):** Every log entry is machine-parseable with consistent fields.
```json
{"timestamp":"2026-04-01T10:00:00Z","level":"INFO","service":"order-service","traceId":"abc123","message":"Order placed","orderId":"456"}
```

2. **Correlation ID / Trace ID:** A unique ID generated at the API Gateway is passed through every service via HTTP headers (`X-Trace-Id`). Every log line includes it.

3. **MDC (Mapped Diagnostic Context):** In Spring, use `MDC.put("traceId", traceId)` in a filter. Logback automatically includes it in every log line.

4. **Log levels per service:** Use Spring Boot Actuator's `/actuator/loggers` endpoint to change log levels at runtime without redeploying.

5. **Alerts:** Set up Grafana alerts on log patterns (e.g., 5xx error rate > 1% for 5 minutes).

---

### Q8. What is Infrastructure as Code (IaC)? Compare Terraform vs CloudFormation.

**Infrastructure as Code** treats infrastructure provisioning (servers, networks, databases) as code that is version-controlled, reviewed, and automated.

| Aspect | Terraform | CloudFormation |
|---|---|---|
| **Provider** | Multi-cloud (AWS, GCP, Azure, etc.) | AWS only |
| **Language** | HCL (HashiCorp Configuration Language) | JSON/YAML |
| **State** | Remote state file (S3 + DynamoDB for locking) | Managed by AWS |
| **Drift Detection** | `terraform plan` shows differences | Stack drift detection |
| **Modularity** | Modules (reusable components) | Nested stacks |
| **Community** | Huge + Terraform Registry | AWS-specific modules |

**Terraform example:**
```hcl
resource "aws_ecs_service" "app" {
  name            = "my-spring-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 3

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 8080
  }
}
```

**When to use Terraform:** Multi-cloud, team not exclusively on AWS, want to avoid vendor lock-in.
**When to use CloudFormation:** All-in on AWS, want tighter AWS-native integration.
