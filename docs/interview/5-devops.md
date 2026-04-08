# DevOps & Cloud Infrastructure — Senior Backend Interview Guide

**Master CI/CD, containerization, orchestration, and infrastructure automation for banking systems.** Each answer: simple explanation → problem → solution → professional code → interview tip.

---

## Quick Reference — 38 Core Topics

| # | Topic | Key Concept | Level |
|---|-------|-------------|-------|
| 1 | CI/CD Pipeline Architecture | Stages: code → build → test → deploy → verify | ⭐⭐⭐ |
| 2 | Containerization | Docker multi-stage builds, image optimization | ⭐⭐⭐ |
| 3 | Container Registries | ECR (AWS), DockerHub, private registries | ⭐⭐ |
| 4 | Kubernetes Fundamentals | Pods, Deployments, Services, ConfigMaps | ⭐⭐⭐ |
| 5 | Kubernetes Networking | Service discovery, Ingress, network policies | ⭐⭐⭐ |
| 6 | StatefulSets & DaemonSets | Ordered identities, node-level services | ⭐⭐⭐ |
| 7 | Kubernetes Volumes | Persistent storage, storage classes | ⭐⭐ |
| 8 | Health Checks | Liveness, readiness, startup probes | ⭐⭐⭐ |
| 9 | ConfigMaps & Secrets | Non-sensitive and sensitive config management | ⭐⭐⭐ |
| 10 | RBAC & Security Policies | Service accounts, roles, pod security standards | ⭐⭐⭐ |
| 11 | Secrets Management Tools | Vault, AWS Secrets Manager, sealed-secrets | ⭐⭐⭐ |
| 12 | Distributed Tracing | OpenTelemetry, Jaeger, trace propagation | ⭐⭐⭐ |
| 13 | Centralized Logging | ELK Stack, Grafana Loki, structured logging | ⭐⭐⭐ |
| 14 | Metrics & Monitoring | Prometheus, Grafana, alerting rules | ⭐⭐⭐ |
| 15 | Application Observability | MDC, correlation IDs, span context | ⭐⭐⭐ |
| 16 | Blue-Green Deployment | Zero-downtime releases with instant rollback | ⭐⭐⭐ |
| 17 | Canary Deployment | Progressive rollout with traffic splitting | ⭐⭐⭐ |
| 18 | Rolling Deployment | Gradual pod replacement, maxSurge/maxUnavailable | ⭐⭐ |
| 19 | Rollback Strategies | Container tags, image registries, version control | ⭐⭐ |
| 20 | Auto-Scaling | HPA (CPU/custom metrics), VPA, node scaling | ⭐⭐⭐ |
| 21 | Resource Limits & Requests | CPU/memory quotas, node capacity planning | ⭐⭐⭐ |
| 22 | Infrastructure as Code | Terraform, CloudFormation, state management | ⭐⭐⭐ |
| 23 | GitOps & ArgoCD | Declarative infrastructure, automated sync | ⭐⭐⭐ |
| 24 | Docker Compose Orchestration | Multi-service dev environments, tiered architecture | ⭐⭐ |
| 25 | Docker Swarm | Native Docker clustering, Compose-based deployments | ⭐⭐ |
| 26 | Container Runtime Security | Image scanning, runtime policies, compliance | ⭐⭐⭐ |
| 27 | Network Policies | Ingress/egress filtering, microsegmentation | ⭐⭐⭐ |
| 28 | Service Mesh | Istio, Linkerd, mTLS, traffic management | ⭐⭐⭐ |
| 29 | Log Aggregation | Correlation IDs, distributed traces, ELK setup | ⭐⭐⭐ |
| 30 | Disaster Recovery | Backup strategies, recovery time objectives (RTO) | ⭐⭐⭐ |
| 31 | Multi-Region Deployment | Active-active, failover, data consistency | ⭐⭐⭐ |
| 32 | Cost Optimization | Right-sizing, spot instances, Reserved Instances | ⭐⭐ |
| 33 | Load Balancing | L7 routing, sticky sessions, health checks | ⭐⭐ |
| 34 | API Gateway | Authentication, rate limiting, request/response transformation | ⭐⭐⭐ |
| 35 | Database Backup & Recovery | Point-in-time restore, replication, sharding awareness | ⭐⭐⭐ |
| 36 | Secrets Rotation | Dynamic credentials, lease invalidation | ⭐⭐⭐ |
| 37 | Compliance & Auditing | Logs retention, policy enforcement, compliance scanning | ⭐⭐⭐ |
| 38 | Incident Response | On-call rotations, runbooks, post-mortems | ⭐⭐ |

---

## Q1: Walk me through your CI/CD pipeline setup for a Spring Boot microservice.

**The simple answer:**
A CI/CD pipeline automates the journey from code commit to production deployment: code push triggers automated tests, builds a Docker image, runs security scans, deploys to staging, then to production with automatic rollback on failures.

**The problem:**
Manual deployments are error-prone, slow, and create inconsistency between environments. Without CI/CD, a production issue might take hours to fix. Banking systems demand rapid, reliable, **auditable** deployments with zero tolerance for human error.

**The solution:**

Pipeline stages (GitHub Actions example for banking microservice):

```yaml
name: Deploy Weather Service to Production

on:
  push:
    branches: [main]
    paths: ['weather/**']
  pull_request:
    branches: [main]

env:
  REGISTRY: 123456789.dkr.ecr.us-east-1.amazonaws.com
  IMAGE_NAME: cas/weather-service

jobs:
  # Stage 1: Code Quality
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: SonarQube Quality Gate
        run: |
          cd weather
          mvn clean verify sonar:sonar \
            -Dsonar.projectKey=weather-service \
            -Dsonar.host.url=${{ secrets.SONAR_HOST_URL }} \
            -Dsonar.login=${{ secrets.SONAR_TOKEN }}

  # Stage 2: Build & Security Scan
  build-and-scan:
    needs: code-quality
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          runtime-to-role-arn: ${{ secrets.AWS_ASSUME_ROLE_ARN }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build Docker image using Jib
        run: |
          cd weather
          mvn compile jib:build \
            -Dimage=${{ steps.login-ecr.outputs.registry }}/$IMAGE_NAME:${{ github.sha }}

      - name: Scan image for vulnerabilities (Trivy)
        run: |
          docker run --rm aquasec/trivy image \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            ${{ steps.login-ecr.outputs.registry }}/$IMAGE_NAME:${{ github.sha }}

  # Stage 3: Integration Tests in Staging
  integration-tests:
    needs: build-and-scan
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_DB: cas_test
          POSTGRES_USER: cas
          POSTGRES_PASSWORD: testpass
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Run integration tests
        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cas_test
          SPRING_DATASOURCE_USERNAME: cas
          SPRING_DATASOURCE_PASSWORD: testpass
        run: |
          cd weather
          mvn verify -P integration-tests

  # Stage 4: Deploy to Production (manual approval)
  deploy-production:
    needs: [build-and-scan, integration-tests]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment:
      name: production
    steps:
      - name: Deploy via blue-green
        run: |
          aws ecs update-service \
            --cluster cas-production \
            --service weather-service \
            --force-new-deployment
```

**Key pipeline components:**
1. **Code Quality (SonarQube)**: Static analysis before builds
2. **Build (Jib)**: Multi-stage Docker image creation
3. **Security Scan (Trivy)**: Fail on vulnerabilities
4. **Integration Tests**: Real databases, verify migrations
5. **Blue-Green Deploy**: Zero-downtime production updates
6. **Smoke Tests**: Health checks before releasing traffic

**Interview tip:**
"I design pipelines that fail fast: code quality issues block builds, security issues block deployment, test failures trigger rollback. For banking, I enforce manual approval before production deployments and monitor error rates post-deploy with automatic rollback if metrics deteriorate."

---

## Q2: Explain multi-stage Docker builds and best practices for containerizing Spring Boot applications.

**The simple answer:**
A multi-stage build compiles your application in one container (with Maven, JDK) then copies only the runnable JAR into a minimal runtime image—reducing final image size from 800MB+ to 150MB while removing build dependencies.

**The problem:**
A naive Dockerfile including JDK and Maven in the final image wastes storage, increases pull time, and expands the attack surface. For a banking system deploying across 100 nodes, this bloated image means slower deployments, higher storage costs, and unnecessary vulnerabilities.

**The solution:**

```dockerfile
# Stage 1: Build (compile with Maven + JDK)
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q && \
    java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted

# Stage 2: Runtime (minimal image with JRE only)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Copy layers in order for optimal caching
COPY --from=builder --chown=appuser:appgroup /app/target/extracted/dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /app/target/extracted/spring-boot-loader/ ./
COPY --from=builder --chown=appuser:appgroup /app/target/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /app/target/extracted/application/ ./

ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health/liveness || exit 1

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

**.dockerignore** (exclude unnecessary files):
```
.git
.github
.gitignore
target/
.idea/
*.iml
.DS_Store
docs/
```

**Final image comparison:**
- Naive single-stage: 850MB (includes JDK, Maven)
- Optimized multi-stage: 180MB (JRE only, minimal OS)
- **Result: 42x smaller** → faster pulls, less storage, fewer vulnerabilities

**Interview tip:**
"I use multi-stage builds with layer optimization: base image caching, dependencies downloaded independently, source code copied separately. This ensures code changes only invalidate the final layer, not entire build. For banking, I verify final images are <200MB and scanned for vulnerabilities before deployment."

---

## Q3: Explain Kubernetes fundamentals: Pod, Deployment, Service, Ingress, ConfigMap, Secret.

**The simple answer:**
Kubernetes organizes containers into Pods (smallest unit), manages replication via Deployments, exposes them via Services (DNS), routes external traffic via Ingress, and stores config/secrets separately from code.

**The problem:**
Manual container orchestration across a fleet of servers is impossible for banking systems. Kubernetes automates replication, failover, rolling updates, and health management—but requires understanding its core abstractions.

**The solution:**

**Pod** (smallest deployable unit):
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: weather-service
spec:
  containers:
  - name: weather
    image: cas/weather-service:1.2.0
    ports:
    - containerPort: 8080
    resources:
      requests:
        cpu: 500m
        memory: 512Mi
      limits:
        cpu: 1000m
        memory: 1Gi
    livenessProbe:
      httpGet:
        path: /actuator/health/liveness
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /actuator/health/readiness
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 5
```

**Deployment** (manages Pod replicas with rolling updates):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: weather-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: weather-service
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: weather-service
    spec:
      containers:
      - name: weather
        image: cas/weather-service:1.2.0
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          failureThreshold: 3
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          failureThreshold: 2
          periodSeconds: 5
```

**Service** (stable DNS for accessing Pods):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: weather-service
spec:
  type: LoadBalancer
  selector:
    app: weather-service
  ports:
  - name: http
    port: 80
    targetPort: 8080
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
```

**Ingress** (HTTP routing rules):
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: weather-api-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/limit-rps: "1000"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - weather-api.cas.com
    secretName: weather-api-tls
  rules:
  - host: weather-api.cas.com
    http:
      paths:
      - path: /api/v1/weather
        pathType: Prefix
        backend:
          service:
            name: weather-service
            port:
              number: 80
```

**ConfigMap** (non-sensitive config):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: weather-service-config
data:
  application.yml: |
    spring:
      jpa:
        hibernate:
          ddl-auto: validate
      kafka:
        bootstrap-servers: kafka-0.kafka-headless:9092
```

**Secret** (sensitive config):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: weather-service-secrets
type: Opaque
stringData:
  DB_PASSWORD: "super-secret-password"
  API_KEY: "sk-1234567890abcdef"
```

**Interview tip:**
"I design Deployments with `maxUnavailable: 0` to guarantee zero-downtime deploys. Readiness probes check database connectivity and external service dependencies—unhealthy pods are immediately removed from traffic. For banking, health probes are non-negotiable for production reliability."

---

## Q4: How do you manage secrets and credentials across environments?

**The simple answer:**
Never store secrets in version control. Use external secret management (Vault, AWS Secrets Manager) where secrets are centrally managed, rotated automatically, and injected into applications at runtime.

**The problem:**
Hardcoding passwords or API keys in code violates compliance. A compromised developer account leaks credentials affecting all environments. Banking regulations require audit trails for every secret access and rotation policies.

**The solution:**

**AWS Secrets Manager with Kubernetes External Secrets Operator:**

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: awssm-secret-store
  namespace: production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: weather-secrets
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: SecretStore
    name: awssm-secret-store
  target:
    name: weather-k8s-secret
    creationPolicy: Owner
  data:
  - secretKey: DB_PASSWORD
    remoteRef:
      key: prod/weather/db_password
```

**Secret rotation (30-day cycle):**

```bash
#!/bin/bash
# rotate-secrets.sh

NEW_PASSWORD=$(openssl rand -base64 24)

# Update Secrets Manager
aws secretsmanager update-secret \
  --secret-id prod/weather/db_password \
  --secret-string "$NEW_PASSWORD"

# Update database
psql -U postgres -d cas_db -c "ALTER USER weather_app WITH PASSWORD '$NEW_PASSWORD';"

# Wait for ExternalSecrets to sync
sleep 30

# Rolling restart of pods (they auto-reload from new secret)
kubectl rollout restart deployment/weather-service -n production
```

**Interview tip:**
"I rotate secrets monthly automatically via AWS Secrets Manager with CloudTrail audit logs. External Secrets Operator syncs secrets to Kubernetes without ever storing plain text in etcd. For critical banking services, I implement health checks that verify apps can retrieve secrets—if retrieval fails, the pod is removed from traffic."

---

## Q5: Describe your observability strategy: logging, metrics, and tracing.

**The simple answer:**
The three pillars of observability are: **Logs** (what happened), **Metrics** (how often, how fast), **Traces** (end-to-end request flow). Together, they enable root cause analysis of production incidents in real-time.

**The problem:**
When a transaction request touches 10+ microservices across 50 pods, finding the failure point is impossible without correlation IDs. Logs without metrics can't explain why error rates spiked. Metrics without traces can't pinpoint which service caused latency.

**The solution:**

**1. Structured Logging with Correlation IDs:**

```java
@Component
@Order(1)
public class CorrelationIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        String correlationId = request.getHeader("X-Correlation-Id");
        if (correlationId == null) {
            correlationId = UUID.randomUUID().toString();
        }
        
        MDC.put("correlationId", correlationId);
        MDC.put("userId", request.getHeader("X-User-Id"));
        MDC.put("sourceService", request.getHeader("X-Source-Service"));
        
        response.setHeader("X-Correlation-Id", correlationId);
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}

@Service
public class WeatherService {
    private static final Logger log = LoggerFactory.getLogger(WeatherService.class);
    
    public WeatherResponse getWeather(String location) {
        long start = System.currentTimeMillis();
        log.info("Fetching weather", kv("location", location));
        // correlationId automatically included via MDC!
        
        return new WeatherResponse(location, fetchTemperature());
    }
}
```

**Logback configuration (JSON output for ELK):**

```xml
<configuration>
  <appender name="CONSOLE_JSON" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <customFields>{"service":"weather-service"}</customFields>
      <includeMdc>true</includeMdc>
    </encoder>
  </appender>
  
  <root level="INFO">
    <appender-ref ref="CONSOLE_JSON"/>
  </root>
</configuration>
```

**2. Metrics — Prometheus + Grafana:**

```java
@RestController
public class WeatherController {
    private final MeterRegistry meterRegistry;
    
    @GetMapping("/weather/{location}")
    public WeatherResponse getWeather(@PathVariable String location) {
        Counter.builder("weather.requests")
            .tag("location", location)
            .register(meterRegistry)
            .increment();
        
        return Timer.builder("weather.latency")
            .publishPercentiles(0.5, 0.95, 0.99)
            .register(meterRegistry)
            .record(() -> weatherService.getWeather(location));
    }
}
```

**Prometheus scrape config:**

```yaml
scrape_configs:
- job_name: 'kubernetes-pods'
  kubernetes_sd_configs:
  - role: pod
  relabel_configs:
  - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
    action: keep
    regex: true
```

**3. Distributed Tracing — OpenTelemetry + Jaeger:**

```java
@Configuration
@EnableAutoConfiguration
public class OpenTelemetryConfig {
    @Bean
    public SdkTracerProvider tracer() {
        return SdkTracerProvider.builder()
            .addSpanProcessor(BatchSpanProcessor.builder(
                JaegerGrpcSpanExporter.builder()
                    .setEndpoint("http://jaeger-collector:14250")
                    .build()
            ).build())
            .build();
    }
}
```

When tracing a transaction request, Jaeger displays the flow across all services:
```
Gateway → Order Service (52ms)
  ├─ Database Query (40ms)
  ├─ Cache Check (3ms)
Payment Service (145ms)
  └─ External Bank API (120ms)
```

**Interview tip:**
"I use MDC with correlation IDs to tie together all logs for a single user transaction. I expose business KPIs as metrics (transaction success rate, fraud detection accuracy). For banking, I alert on error rate > 1% for 5 minutes and depend on tracing to pinpoint root cause within seconds."

---

## Q6: Compare blue-green and canary deployment strategies.

**The simple answer:**
Blue-green keeps two identical production environments and switches completely; canary routes 5-10% of traffic to a new version and gradually increases if metrics are healthy.

**The problem:**
A production incident during deployment locks out banking customers. Big-bang deployments are obvious high-risk. We need strategies for zero-downtime releases with rapid rollback capability.

**The solution:**

**Blue-Green Deployment (Instant Switch, Easy Rollback):**

```
Load Balancer
  ├─ BLUE v1.0.0 (PROD, current traffic)
  └─ GREEN v1.1.0 (STAGING, being tested)

After switch:
Load Balancer
  ├─ GREEN v1.1.0 (PROD, now serving traffic)
  └─ BLUE v1.0.0 (idle, ready for rollback)
```

**Kubernetes implementation:**

```bash
# Step 1: Deploy GREEN (v1.1.0)
kubectl apply -f weather-service-green-deployment.yaml

# Step 2: Smoke test GREEN
curl http://weather-service-green:8080/actuator/health

# Step 3: Switch traffic (update Service selector)
kubectl patch service weather-service -p \
  '{"spec":{"selector":{"deployment":"weather-service-green"}}}'

# Step 4: If error, instant rollback
kubectl patch service weather-service -p \
  '{"spec":{"selector":{"deployment":"weather-service-blue"}}}'
```

**Advantages:** ✅ Zero downtime, ✅ Instant rollback, ✅ Full environment testing
**Disadvantage:** ❌ Requires 2x infrastructure (double cost during deployment)

**Canary Deployment (Progressive, Low Risk):**

```
5% traffic → v1.1.0 (monitor error rates)
  ↓
If healthy, increase to 25% → 50% → 100%
If error rate > 1%, rollback to v1.0.0
```

**Kubernetes implementation (with Istio):**

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: weather-service
spec:
  hosts:
  - weather-service
  http:
  - route:
    - destination:
        host: weather-service
        subset: v1-0-0
      weight: 95
    - destination:
        host: weather-service
        subset: v1-1-0
      weight: 5  # 5% of traffic
```

**Advantages:** ✅ Gradual rollout, ✅ Minimal blast radius, ✅ Single infrastructure
**Disadvantage:** ❌ More complex, ❌ Slower (30-60 minutes)

**Comparison:**

| Aspect | Blue-Green | Canary |
|--------|-----------|--------|
| Deployment Speed | Instant | Gradual (30-60 min) |
| Risk | High (big-bang) | Low (5-10%) |
| Infrastructure Cost | Higher (2x) | Lower (1x) |
| Rollback Speed | Instant | Delete canary |

**Interview tip:**
"For critical banking services, I use canary deployments with automated error rate checks. I route internal users to the canary initially. For non-critical services, blue-green is simpler. Both strategies ensure zero-downtime deployments and rapid rollback."

---

## Q7: How do you aggregate logs across microservices?

**The simple answer:**
Structured JSON logging with correlation IDs flowing through all services, shipped to centralized storage (Elasticsearch, Grafana Loki), then searched and analyzed from a unified dashboard.

**The problem:**
In a request spanning 10 services across 50 pods, finding relevant logs is impossible without correlation IDs. "My transfer failed"—which service? Which logs?

**The solution:**

**Architecture:**

```
API Gateway (generates correlationId)
  ├─ Order Service (logs with correlationId: abc123)
  ├─ Payment Service (logs with correlationId: abc123)
  └─ Notification Service (logs with correlationId: abc123)

All services → Filebeat → Elasticsearch → Kibana
```

**Spring Boot filter (inject correlationId):**

```java
@Component
@Order(1)
public class CorrelationIdFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        String correlationId = request.getHeader("X-Correlation-Id");
        if (correlationId == null) {
            correlationId = UUID.randomUUID().toString();
        }
        
        MDC.put("correlationId", correlationId);
        MDC.put("userId", request.getHeader("X-User-Id"));
        MDC.put("sourceService", request.getHeader("X-Source-Service"));
        
        response.setHeader("X-Correlation-Id", correlationId);
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

**RestTemplate interceptor (propagate correlationId):**

```java
@Configuration
public class RestClientConfig {
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate template = new RestTemplate();
        template.setInterceptors(Collections.singletonList((request, body, execution) -> {
            String correlationId = MDC.get("correlationId");
            if (correlationId != null) {
                request.getHeaders().set("X-Correlation-Id", correlationId);
            }
            return execution.execute(request, body);
        }));
        return template;
    }
}
```

**Log output (JSON with MDC):**

```json
{
  "@timestamp": "2026-04-01T10:00:00.123Z",
  "level": "INFO",
  "message": "Order processed",
  "correlationId": "abc123",
  "userId": "user456",
  "service": "order-service",
  "duration_ms": 145
}
```

**Kibana search:**

Query all logs for a single transaction:
```
correlationId: "abc123"
```

Results show all services in chronological order:
```
10:00:00 Gateway → generates abc123
10:00:01 Order Service → processes order
10:00:02 Payment Service → ERROR: Insufficient funds
10:00:02 Notification Service → sends failure email
```

**Interview tip:**
"I ensure every log includes a correlation ID via MDC. For banking, I alert on specific error patterns (payment timeouts > 500ms, transaction failures). I use Kibana to trace single transactions across 10+ services."

---

## Q8: Compare Infrastructure as Code tools: Terraform vs CloudFormation.

**The simple answer:**
Terraform is cloud-agnostic with simpler HCL syntax; CloudFormation is AWS-only with JSON/YAML but tighter AWS integration.

**The problem:**
Managing infrastructure manually doesn't scale. Banking systems demand identical infrastructure across dev, staging, production. IaC treats infrastructure as code: version-controlled, reviewable, repeatable.

**The solution:**

**Terraform (Multi-cloud, recommended):**

```hcl
# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "cas-production"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier            = "cas-postgres"
  allocated_storage     = 100
  storage_type          = "gp3"
  engine                = "postgres"
  engine_version        = "15.3"
  instance_class        = "db.t3.large"
  username              = "admin"
  password              = random_password.db_password.result
  
  multi_az              = true
  storage_encrypted     = true
  backup_retention_days = 30
}

# ECS Task Definition
resource "aws_ecs_task_definition" "weather" {
  family                   = "weather-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  
  container_definitions = jsonencode([
    {
      name  = "weather"
      image = "123456789.dkr.ecr.us-east-1.amazonaws.com/cas/weather:1.2.0"
      ports = [{ containerPort = 8080 }]
    }
  ])
}

# Auto-Scaling
resource "aws_autoscaling_policy" "weather" {
  policy_type            = "TargetTrackingScaling"
  resource_id            = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.weather.name}"
  scalable_dimension     = "ecs:service:DesiredCount"
  service_namespace      = "ecs"
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

**Deploy Terraform:**

```bash
terraform init                              # Download providers
terraform plan -out=tfplan                  # Preview changes
terraform apply tfplan                      # Apply changes
terraform state list                        # View resources
```

**CloudFormation (AWS-only, AWS-native integration):**

```yaml
Resources:
  RDSDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: cas-postgres
      DBInstanceClass: db.t3.large
      Engine: postgres
      EngineVersion: 15.3
      MasterUsername: admin
      MasterUserPassword: !Sub '{{resolve:secretsmanager:${DBPasswordSecret}:SecretString:password}}'
      AllocatedStorage: 100
      MultiAZ: true
      StorageEncrypted: true
      BackupRetentionPeriod: 30
```

**Comparison:**

| Aspect | Terraform | CloudFormation |
|--------|-----------|----------------|
| Language | HCL (simpler) | JSON/YAML (verbose) |
| Multi-cloud | ✅ AWS, GCP, Azure | ❌ AWS only |
| Community | ✅ Huge registry | ❌ AWS docs only |
| Learning Curve | ✅ Gentle | ❌ Steep |

**Interview tip:**
"For multi-cloud infrastructure, I use Terraform with S3 backend and DynamoDB locking. I store state in version control, peer-review infrastructure changes via `terraform plan`, and use workspaces to separate environments."

---

## Q9: How do you orchestrate multi-service applications with Docker Compose?

**The simple answer:**
Docker Compose runs multi-service applications (app + database + cache + message queue) from a single YAML file, perfect for development, testing, and small production deployments.

**The problem:**
Running services manually (`docker run postgres`, `docker run redis`, `docker run myapp`) doesn't scale. Development environment setup is fragile and non-reproducible.

**The solution:**

**Tiered Compose architecture:**

```
docker-compose/
├── docker-compose.infrastructure.yml   # PostgreSQL, Redis, Kafka, Keycloak
├── docker-compose.logging.yml          # Prometheus, Grafana, Loki, Jaeger
├── docker-compose.yml                  # All microservices
```

**Infrastructure layer (docker-compose.infrastructure.yml):**

```yaml
version: "3.8"

services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: cas_db
      POSTGRES_USER: cas_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cas_user"]
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
    ports:
      - "29092:29092"
    depends_on:
      - zookeeper

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

volumes:
  postgres_data:
```

**Application services (docker-compose.yml):**

```yaml
version: "3.8"

services:
  weather-service:
    build:
      context: ./weather-service
      dockerfile: Dockerfile
    image: cas/weather:${IMAGE_TAG:-latest}
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cas_db
      SPRING_DATASOURCE_USERNAME: cas_user
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      KAFKA_BOOTSTRAP_SERVERS: kafka:9092
    depends_on:
      postgres:
        condition: service_healthy
      kafka:
        condition: service_healthy
    networks:
      - cas_network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G

  payment-service:
    build:
      context: ./payment-service
      dockerfile: Dockerfile
    image: cas/payment:${IMAGE_TAG:-latest}
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/cas_db
      KAFKA_BOOTSTRAP_SERVERS: kafka:9092
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - cas_network

networks:
  cas_network:
    driver: bridge
```

**.env file:**

```bash
DB_PASSWORD=super-secure-password-123
IMAGE_TAG=1.2.0
```

**Usage:**

```bash
# Start infrastructure
docker-compose -f docker-compose.infrastructure.yml up -d

# Start applications
docker-compose up -d

# View logs
docker-compose logs -f --tail=100

# Update single service
IMAGE_TAG=1.2.1 docker-compose up -d --no-deps weather-service

# Bring down
docker-compose down --volumes
```

**Interview tip:**
"I separate infrastructure from applications for stable development environments. Health checks ensure services start in correct order. Docker Compose is perfect for dev/testing; production uses Kubernetes."

---

## Q10: Explain Docker Swarm and compare it to Kubernetes.

**The simple answer:**
Docker Swarm is Docker's native clustering tool (simpler); Kubernetes is industry-standard orchestration (more powerful).

**The problem:**
For small-to-medium deployments (5-10 services), Kubernetes overhead is overkill. For large-scale systems (100+ services), Kubernetes becomes essential.

**The solution:**

**Docker Swarm (simpler, built-in):**

```bash
# Initialize cluster
docker swarm init --advertise-addr 192.168.1.100

# Deploy stack (uses docker-compose.yml with deploy section)
docker stack deploy -c docker-compose.yml banking_app

# Scale service
docker service scale banking_app_weather=5

# View logs
docker service logs -f banking_app_weather

# Update service
docker service update --image cas/weather:1.2.1 banking_app_weather
```

**Kubernetes (complex, powerful):**

```bash
# Deploy application
kubectl apply -f deployment.yaml

# Scale deployment
kubectl scale deployment weather-service --replicas=5

# View logs
kubectl logs -f deployment/weather-service

# Update deployment
kubectl set image deployment/weather-service weather=cas/weather:1.2.1
```

**Comparison:**

| Aspect | Swarm | Kubernetes |
|--------|-------|-----------|
| Setup | `docker swarm init` | kubeadm, k3s, managed services |
| Learning Curve | Gentle | Steep |
| Scalability | ~1,000 nodes | 5,000+ nodes |
| Auto-Scaling | Manual | Automatic (HPA) |
| Status | Stable | Industry standard |

**Interview tip:**
"For 5-10 services on a few VMs, Docker Swarm provides simplicity. As we scale to 50+ services, I migrate to Kubernetes for superior observability and auto-scaling."

---

## Q11: How do you deploy a Spring Boot multi-service stack using Docker Swarm?

**The simple answer:**
Swarm uses `docker-compose.yml` with `deploy` sections to define replicas and update strategies, then deploy with `docker stack deploy`.

**The problem:**
Managing multiple microservices with individual commands is error-prone. Swarm provides declarative orchestration using familiar Compose format.

**The solution:**

```bash
# Initialize Swarm cluster
docker swarm init --advertise-addr 192.168.1.100

# Deploy infrastructure
docker stack deploy -c docker-compose.infrastructure.yml cas_infra

# Deploy applications
docker stack deploy -c docker-compose.yml cas_app

# Monitor deployment
docker stack ps cas_app

# Scale service
docker service scale cas_app_weather=5

# View logs across all replicas
docker service logs -f cas_app_weather

# Rolling update to new version
docker service update --image cas/weather:1.2.1 cas_app_weather
```

**Interview tip:**
"Swarm deployment is straightforward: same Compose file, auto replication, rolling updates. For banking systems with predictable growth, it's cost-effective. As complexity grows, migration to Kubernetes is feasible."

---

## Q12: How do you build resilient, observable, production-grade deployments for banking?

**The simple answer:**
Combine health checks, circuit breakers, canary deployments, centralized observability, auto-scaling, and incident response processes.

**The problem:**
Banking systems have near-zero tolerance for downtime. A single deployment incident impacts millions of customers and violates compliance regulations.

**The solution:**

**End-to-end resilience:**

1. **Health Probes** (Kubernetes):
```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  failureThreshold: 3
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  failureThreshold: 2
  periodSeconds: 5
```

2. **Circuit Breaker** (external service resilience):
```java
@CircuitBreaker(name = "payment-api", fallbackMethod = "paymentFallback")
public PaymentResponse processPayment(PaymentRequest request) {
    return restTemplate.postForObject("https://payment-gateway/pay", request, PaymentResponse.class);
}

public PaymentResponse paymentFallback(PaymentRequest request, Exception ex) {
    kafkaTemplate.send("payment-retry", request);
    return new PaymentResponse(Status.PENDING_RETRY);
}
```

3. **Observability** (MDC + Metrics + Traces):
Every log includes correlationId, metrics track error rates, traces show request flow across services.

4. **Deployment** (Blue-green with monitoring):
Deploy to inactive environment, run tests, switch traffic, monitor error rates for 60 seconds.

5. **Incident Response** (Runbooks, on-call):
Automated alerts, rapid triage, pre-written rollback procedures, post-mortems.

**Interview tip:**
"I implement defense-in-depth: health checks detect unhealthy pods immediately, circuit breakers prevent cascade failures, canary deployments limit blast radius, observability pinpoints root cause in seconds, runbooks enable rapid recovery."

---

## Summary Interview Checklist

- [ ] CI/CD pipeline stages: code quality → build → test → deploy → verify
- [ ] Multi-stage Docker builds reduce image size 42x (800MB → 180MB)
- [ ] Kubernetes: Pods, Deployments, Services, Ingress, ConfigMaps, Secrets
- [ ] Secrets rotation: 30-day cycles via Secrets Manager
- [ ] Observability: Logs with correlation IDs + Metrics + Traces
- [ ] Blue-green (instant, expensive) vs Canary (gradual, cheap)
- [ ] Log aggregation: Structured JSON, centralized ELK/Loki
- [ ] Infrastructure as Code: Terraform (multi-cloud) vs CloudFormation (AWS-only)
- [ ] Docker Compose: Development/testing orchestration with tiered architecture
- [ ] Docker Swarm: Simpler than Kubernetes, suitable for 5-50 services
- [ ] Kubernetes auto-scaling: HPA (CPU), VPA (performance)
- [ ] Deployment safety: Health checks, circuit breakers, canary monitoring, rollback
- [ ] Banking compliance: Audit trails, encryption, backup/recovery

---

## DevOps Bank-Specific Summary

| Pattern | Benefit |
|---------|---------|
| **Multi-AZ RDS** | High availability, automatic failover |
| **Circuit Breakers** | Prevent cascade failures |
| **Health Probes** | Remove unhealthy pods immediately |
| **Canary Deployments** | Limit transaction impact during rollouts |
| **Audit Logs** | Compliance: every access logged |
| **Encryption at Rest** | Regulatory requirement |
| **Backup & Recovery** | RTO < 1hr, RPO < 5 min |
