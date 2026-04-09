# Interview Prep — Director of Digital Innovation & Business (Part 2)

> **Additional questions** not covered in Part 1. Same audience: non-technical to technical executives. Focus on leadership, system design, team dynamics, and CMB-specific scenarios.

---

## Questions at a Glance

| # | Priority | Topic | Key Point |
|---|----------|-------|-----------|
| 1 | Critical | System Design (Live) | Think out loud, ask constraints first |
| 2 | Critical | Scalability Under Load | Design for 10x, not today's traffic |
| 3 | Critical | Team Leadership & Mentoring | Grow the team, don't just solve the problem |
| 4 | Critical | Delivering Under Tight Deadlines | Scope → cut ruthlessly → ship the core |
| 5 | High | Observability & Monitoring | Logs, metrics, traces — the three pillars |
| 6 | High | API Design Principles | Versioning, contracts, and backward compatibility |
| 7 | High | DevOps & CI/CD Pipeline | Ship small, ship often, rollback fast |
| 8 | High | Stakeholder Management | Manage expectations, not just engineers |
| 9 | High | Build vs. Buy Decisions | Total cost of ownership, not just license cost |
| 10 | High | Payment Reconciliation | The silent killer of trust in banking |
| 11 | Medium | Fraud Detection Systems | Rules engine + ML layer + human review |
| 12 | Medium | Multi-Tenancy & Data Isolation | One platform, many customers — safely |
| 13 | Medium | Prioritization & Competing Demands | Say no with data, not opinion |
| 14 | Medium | Cross-Team Collaboration | Influence without authority |
| 15 | Medium | Testing Strategy | Test pyramid — unit, integration, contract, e2e |
| 16 | Medium | Disaster Recovery & BCP | RTO, RPO — know the numbers |
| 17 | Lower | Handling a Difficult Team Member | Coach first, escalate last |
| 18 | Lower | Career Trajectory & Ambitions | Show growth, show direction |
| 19 | Lower | Salary & Compensation | Know your number, know your walk-away |
| 20 | Scenario | CMB-Specific Scenarios | Real situations you may face at CMB |

---

## Critical — Almost Guaranteed

---

### Q1. System Design (Live Whiteboard)

**What to expect:** The Director or a technical panel may ask you to design a system on the spot. Common prompts:
- "Design the payment API for our KHQR integration."
- "Design a notification system for transaction alerts."
- "How would you design the idempotency layer for our transfer endpoints?"

**Framework — always follow this order:**

**Step 1 — Clarify requirements (2 minutes)**
> "Before I design anything, I need to understand the constraints. What's the expected transaction volume — requests per second at peak? What's the SLA for response time? Do we need to support both KHR and USD? Is this internal-only or also third-party merchants?"

Never start drawing boxes before asking constraints. This alone separates senior from mid-level.

**Step 2 — Define the data model**
> "Let me start with the data model. For a payment API, the core entity is a Payment record: PaymentID (UUID), SenderAccountID, ReceiverAccountID, Amount, Currency, Status (PENDING / PROCESSING / COMPLETED / FAILED), IdempotencyKey, CreatedAt, UpdatedAt."

**Step 3 — Design the API contract**
```
POST /v1/payments
Headers: Idempotency-Key: <uuid>
Body: { sender_account: "...", receiver_account: "...", amount: 100.00, currency: "USD" }

Response 201: { payment_id: "...", status: "PENDING" }
Response 409: { error: "duplicate_request", payment_id: "..." }  ← idempotent response
```

**Step 4 — Walk through the happy path and failure cases**
- Happy path: validate → debit sender → credit receiver → notify → return COMPLETED
- Timeout: return PENDING, let client poll `/v1/payments/{id}`
- Flexcube error: return FAILED with a meaningful error code, not "Something went wrong"

**Step 5 — Address non-functional requirements**
- Idempotency: store IdempotencyKey in Redis with 24h TTL; duplicate requests return the same response
- Consistency: use saga pattern or two-phase commit for distributed transactions
- Performance: async processing via queue (Kafka/RabbitMQ) for non-critical steps (notifications, ledger updates)
- Observability: trace every payment with a correlation ID through every service

**Remember:** Think out loud. The interviewer wants to see how you reason, not just your final answer.

---

### Q2. How do you design a system to handle 10x your current traffic?

> "I design systems to be horizontally scalable from day one — so scaling is an operational decision, not a re-architecture effort.
>
> For a 10x traffic spike — like payday or a promotional campaign — my approach:
>
> **First, identify the bottleneck.** Is it the API layer, the database, or a downstream service like Flexcube? You can't optimize what you haven't measured.
>
> **At the API layer:** stateless services scale horizontally behind a load balancer. Spin up more instances. This should be automatic with auto-scaling policies.
>
> **At the database layer:** read replicas handle read-heavy workloads. For balance checks, serve from cache (Redis) with a 30-second TTL — most customers don't need real-time balance for a page load.
>
> **At the bottleneck layer:** if Flexcube can't handle 10x calls, we add a queue in front of it. The mobile app gets an immediate PENDING response, Flexcube processes at its own rate, and we push the result back to the customer via push notification.
>
> The principle: **decouple the customer-facing response from the backend processing.** The app feels fast even when the backend is under load."

| Layer | Scaling Strategy |
|---|---|
| API servers | Horizontal scaling, auto-scaling groups |
| Database reads | Read replicas, Redis cache (30–60s TTL for balances) |
| Database writes | Connection pooling, write-ahead log, batch inserts |
| Downstream services | Async queue (Kafka/RabbitMQ), circuit breakers |
| Static assets | CDN |

---

### Q3. How do you lead and mentor junior developers?

> "My goal as a senior engineer is to make myself less necessary over time — not more.
>
> In practice, that means three things:
>
> **Code reviews as teaching moments.** I don't just approve or reject PRs. I explain *why* a pattern is risky — 'This endpoint doesn't handle the case where Flexcube times out. Here's how I'd add a circuit breaker.' That one comment teaches more than a lecture.
>
> **Pairing on hard problems.** When a junior is stuck, I sit with them. I don't take over the keyboard. I ask questions: 'What have you tried? What does the error log tell you?' I guide them to the answer.
>
> **Delegation with safety nets.** I give juniors ownership of real features, not just bug fixes. But I define clear acceptance criteria upfront and review architecture before they write a line of code — so we catch design problems early, not at demo time."

**Remember:** Directors want senior engineers who multiply the team's output, not just their own.

---

### Q4. Tell me about a time you had to deliver under an extremely tight deadline

> "We had a regulatory deadline — the NBC required us to implement a new transaction reporting format within 6 weeks. The spec was delivered at week 0.
>
> I immediately ran a scope triage: what's mandatory for compliance vs. what's nice-to-have? The mandatory piece was the reporting API and automated file submission. The internal dashboard was deferred.
>
> I split the work into two parallel tracks — one engineer on the data pipeline, me on the API and submission layer. I set daily check-ins to catch blockers within 24 hours, not at the end of the sprint.
>
> We shipped the compliant system in 5 weeks. The dashboard came in sprint 2 with no pressure.
>
> The lesson: **deadlines compress scope, not quality on the critical path.** Negotiate what ships, never negotiate correctness."

**Remember:** Show you cut scope deliberately, not quality. Regulatory deadlines are especially relatable in banking.

---

## High — Very Likely

---

### Q5. How do you ensure your systems are observable?

> "If you can't see what your system is doing, you can't fix it when it breaks — and in banking, 'I can't see it' is not an acceptable answer.
>
> I implement the three pillars of observability:"

| Pillar | What I Implement |
|---|---|
| **Logs** | Structured JSON logs with correlation IDs — every request traceable end-to-end |
| **Metrics** | Business metrics (transactions per second, failure rate, latency P99) — not just CPU |
| **Traces** | Distributed tracing (OpenTelemetry) — see exactly where a request spent its 2 seconds |

> "Beyond the three pillars, I define **SLIs and SLOs** with the business upfront:
> - SLI: 'Payment API P99 latency' — this is what we measure
> - SLO: 'P99 < 500ms, 99.9% of the time' — this is the target
> - Alert: fires when we're burning the error budget too fast
>
> The key metric I track beyond technical health: **business-level indicators** — failed payment rate, duplicate transaction count, KYC drop-off rate. Those are the numbers that matter to a Director."

---

### Q6. What are your API design principles?

> "I design APIs like public contracts — once a client depends on them, breaking changes cost everyone."

| Principle | How I Apply It |
|---|---|
| **Versioning** | `/v1/payments` — never change the contract, add a new version |
| **Idempotency** | Every write operation accepts an `Idempotency-Key` header |
| **Meaningful errors** | `{ "error": "insufficient_funds", "message": "Account balance too low" }` — never `500 Internal Error` |
| **Pagination** | Cursor-based for large lists, never offset (breaks under concurrent writes) |
| **Backward compatibility** | Add fields, never remove. Old clients continue to work. |
| **Rate limiting** | Per-user, per-endpoint. Return `429` with `Retry-After` header, not a silent failure |

> "One thing I'm strict about: **error codes are a product decision**, not a backend detail. When a payment fails, the error code determines whether the customer retries, contacts support, or closes their account. I work with product to define the full error taxonomy before writing a line of code."

---

### Q7. Walk me through your CI/CD pipeline

> "My philosophy: the pipeline is a quality gate, not a bureaucratic process. Every stage should either catch a real bug or it shouldn't exist."

```
Developer pushes code
         ↓
Unit tests (< 2 minutes — fast feedback)
         ↓
Static analysis + security scan (OWASP dependency check, SonarQube)
         ↓
Integration tests (against real DB, not mocks)
         ↓
Build Docker image → push to registry
         ↓
Deploy to Staging → smoke tests
         ↓
Migration validation (run migration against production-size data copy)
         ↓
Manual approval gate (for production)
         ↓
Blue-green deploy to Production
         ↓
Automated rollback if error rate spikes within 10 minutes
```

> "The most important stage most teams skip: **migration validation against production-size data.** A migration that runs in 2 seconds on a 1,000-row staging DB can lock a 10-million-row production table for 45 minutes. I learned that lesson the hard way early in my career."

---

### Q8. How do you manage stakeholder expectations when timelines slip?

> "The worst thing you can do is stay silent. The second worst is giving an optimistic estimate you can't defend.
>
> My approach:
>
> **Communicate early.** The moment I know a timeline is at risk — not when it's confirmed — I notify the stakeholder. 'We discovered a dependency on Flexcube's SOAP API that we didn't account for. This adds 5 days. Here are three options.'
>
> **Come with options, not just problems.** Option A: ship on time with reduced scope. Option B: ship full scope 5 days late. Option C: ship a manual workaround on time, automate it next sprint.
>
> **Document the decision.** When a stakeholder chooses an option, I confirm it in writing — email or ticket. This protects both parties and sets clear expectations for what's in scope."

**Remember:** Directors promote people who give them options, not engineers who drop problems on their desk.

---

### Q9. How do you approach a build vs. buy decision?

> "I never evaluate build vs. buy on license cost alone. Total cost of ownership includes integration time, ongoing maintenance, vendor lock-in, and the opportunity cost of not shipping other features.
>
> My framework:
>
> **Buy if:** the problem is solved well, integration is straightforward, and it's not a core competency. Notification delivery, PDF generation, OCR for KYC — buy these.
>
> **Build if:** the problem is core to your competitive advantage, the vendor's data model doesn't fit your domain, or vendor lock-in creates existential risk. The payment routing logic that differentiates CMB's KHQR experience — build that.
>
> **The trap:** buying a product that requires so much customization it becomes a build anyway, but with the vendor's constraints. I always ask: 'Can we use this out of the box for 80% of our needs, or will we spend 6 months customizing it?'"

---

### Q10. How do you handle payment reconciliation?

> "Reconciliation is one of the most underestimated backend challenges in banking. It's invisible when it works and catastrophic when it doesn't.
>
> My approach has three layers:
>
> **Real-time reconciliation:** every transaction that hits my middleware is written to a reconciliation log with its status. If a transaction is PROCESSING for more than 60 seconds, an alert fires.
>
> **End-of-day batch reconciliation:** we compare our internal ledger against the Flexcube ledger and the interbank settlement report (for KHQR/Bakong). Any discrepancy triggers an alert, not a silent correction.
>
> **Immutable audit trail:** every reconciliation run is stored. If a regulator asks 'why was this $5,000 discrepancy corrected on Tuesday?', I can show the full chain of events.
>
> The principle: **never silently correct a discrepancy.** Every adjustment must be explainable, logged, and authorized."

---

## Medium — Likely If Interview Runs Long

---

### Q11. How would you design a fraud detection system?

> "Fraud detection is a layered problem — no single mechanism catches everything.
>
> **Layer 1 — Rules engine (real-time, < 50ms):** hard rules that trip immediately. 'Transaction over $10,000 requires secondary verification.' 'Three failed PINs in 60 seconds — lock the card.' These are deterministic and auditable — important for compliance.
>
> **Layer 2 — ML scoring (near real-time, < 200ms):** a model trained on historical fraud patterns scores every transaction. A score above threshold triggers step-up authentication (OTP), not a hard block. You don't want to block a legitimate high-value payment.
>
> **Layer 3 — Human review (async):** high-risk accounts or unusual patterns flagged for the fraud team to review within 24 hours. Not every decision needs to be automated.
>
> **The key design principle:** separate the detection from the action. The detection engine outputs a risk score. A separate policy engine decides what action to take — block, challenge, or allow. This lets compliance update policies without touching the ML model."

---

### Q12. How do you ensure data isolation in a multi-tenant system?

> "In a banking context, multi-tenancy usually means serving multiple corporate clients from one platform — like agent banking partners or business banking customers.
>
> My approach depends on the isolation requirement:
>
> **Shared database, separate schema:** each tenant has their own schema. Cheaper to operate, but a bug can accidentally query the wrong schema. Acceptable for low-risk data.
>
> **Separate databases per tenant:** highest isolation — a bug in Tenant A's queries literally cannot touch Tenant B's data. Required for banking-grade isolation.
>
> **Row-level security (RLS):** every query automatically appended with `WHERE tenant_id = ?`. Simple, but requires disciplined enforcement — every ORM query, every raw SQL statement must go through the RLS layer.
>
> In banking I default to database-per-tenant for corporate clients and enforce this at the connection pool level — each tenant's service worker connects to its own database with its own credentials."

---

### Q13. How do you prioritize when everything is marked urgent?

> "When everything is urgent, nothing is. My job is to create a real priority order — not validate everyone's sense of urgency.
>
> I use a simple two-axis model: **Impact vs. Effort.** High impact, low effort ships first. Low impact, high effort goes to the backlog.
>
> But in banking, there's a mandatory third axis: **regulatory risk.** A compliance deadline always beats a feature request, regardless of business pressure.
>
> In practice: I maintain a public priority stack visible to all stakeholders. If a new urgent request comes in, I ask: 'Which item on this list do you want me to push down to make room for this?' That question usually clarifies actual priority immediately."

---

### Q14. How do you influence decisions when you don't have authority?

> "In every organization, the best technical decisions don't always come from the person with the highest title. My approach to influence:
>
> **Lead with data, not opinion.** 'I think we should use Kafka' loses to 'I ran a load test — RabbitMQ saturates at 5,000 msgs/sec and we need 20,000. Here's the benchmark.'
>
> **Make the risk visible.** Stakeholders don't always see technical risk. I translate it: 'If we skip this caching layer, on payday our balance API will receive 50,000 requests in 10 minutes and our database will go down. That's a customer support crisis and a regulatory event.'
>
> **Find allies.** If I need organizational support, I brief one key stakeholder privately before the formal meeting. An idea with one supporter lands differently than an idea launched cold."

---

### Q15. Describe your testing strategy

> "I follow the test pyramid — lots of fast unit tests at the base, fewer slow integration tests in the middle, minimal end-to-end tests at the top."

| Level | What I Test | Speed | Quantity |
|---|---|---|---|
| Unit tests | Business logic, domain rules, edge cases | < 1s | Many |
| Integration tests | DB queries, API contracts, message queue behavior | 5–30s | Medium |
| Contract tests (Pact) | API consumer-provider compatibility | 10s | Key APIs |
| End-to-end tests | Critical user journeys (transfer, login, KHQR payment) | Minutes | Few |

> "For banking specifically, I add one more layer: **mutation testing**. It verifies that my tests actually catch bugs — not just achieve coverage. A test that passes with broken code is worse than no test."

**The rule I enforce:** if a production bug occurs and there was no test for it, adding that test is part of the fix. Not optional.

---

### Q16. How do you approach disaster recovery and business continuity?

> "In banking, 'the system went down and we lost 2 hours of transactions' is not a technology problem — it's a legal and reputational problem.
>
> I design around two numbers the business must define:
>
> - **RTO (Recovery Time Objective):** how long can we be down? For payment APIs, this is typically < 15 minutes.
> - **RPO (Recovery Point Objective):** how much data can we afford to lose? For financial transactions, this is zero — we cannot lose a single committed transaction.
>
> My implementation:
>
> **RPO = 0:** synchronous replication to a standby database. Every transaction is committed to both primary and replica before the API returns a success response.
>
> **RTO < 15 min:** automated failover. If the primary database fails, the load balancer redirects to the replica within 60 seconds. The remaining 14 minutes are for application-layer health checks and stakeholder notification.
>
> **Regular DR drills:** we test failover quarterly. A DR plan nobody has tested is not a plan — it's a wish."

---

## Lower Priority

---

### Q17. How do you handle a difficult team member?

> "My first assumption is always that there's a reason for the behavior — unclear expectations, a personal situation, or a skill gap — not malice.
>
> Step 1: a direct, private conversation. 'I've noticed your PRs are frequently missing test coverage. Is there something blocking you, or is there a different perspective on testing I'm missing?' This opens dialogue without accusation.
>
> Step 2: if the conversation reveals a skill gap, I pair, coach, and set a clear improvement target with a timeline.
>
> Step 3: if the behavior continues and affects the team, I escalate to the engineering manager with documented examples. I'm direct about the impact: 'This is slowing code review for everyone and creating production risk.'
>
> I don't let it fester. A team that tolerates low standards pulls everyone down."

---

### Q18. Where do you see your career in 3–5 years?

> "I want to grow into an engineering leadership role — a Head of Engineering or Engineering Manager — while staying close enough to the architecture that I can still make sound technical decisions.
>
> Right now, I'm at a point where I can lead complex technical initiatives and mentor engineers. What I want to develop is the organizational side — building teams, owning technical roadmaps, and influencing product strategy.
>
> A role like this, where I'm working on digital banking infrastructure at scale, is exactly the environment where that transition makes sense."

**Remember:** Be honest and specific. Vague ambition sounds unconvincing. Show you've thought about it.

---

### Q19. What are your salary expectations?

> "Based on my research into market rates for senior backend engineers in Cambodia's banking and fintech sector, and considering the scope of this role, I'm targeting [your number] monthly.
>
> That said, total compensation matters to me — I'm also interested in understanding the benefits structure, performance review cycle, and any technical training or conference budget."

**How to prepare:**
- Research: ABA, ACLEDA, Wing Bank, and tech companies in Phnom Penh for comparable senior engineer salaries
- Know your current salary and your walk-away number
- Never be the first to name a number if you can avoid it — ask about their budget range first

---

## CMB-Specific Scenarios

---

### Q20. Scenarios You May Face at Chip Mong Bank

These are realistic situations the Director may present as case questions or discussion prompts.

---

**Scenario A: The Flexcube Timeout**

> "Our mobile app makes a balance transfer call to Flexcube. Flexcube takes 8 seconds to respond — sometimes it succeeds, sometimes it times out. Users are hitting 'Back' and retrying. We're seeing duplicate transactions."

**Your answer:**
> "This is a classic distributed systems problem. The fix has two parts.
>
> Short-term: add an idempotency key to every transfer request. If the user retries, the second call returns the result of the first — no duplicate is sent to Flexcube.
>
> Medium-term: decouple the user experience from the Flexcube response. The app shows 'Transfer submitted — processing' immediately. We process the Flexcube call asynchronously and push the result via push notification. The user doesn't wait 8 seconds staring at a spinner.
>
> Long-term: work with the Flexcube team to understand why the P99 latency is 8 seconds. That's a core banking performance problem that will affect every digital channel."

---

**Scenario B: KHQR Duplicate Payment**

> "A customer scanned a QR code and tapped 'Pay'. The network was slow. The app sent the payment twice. The customer was charged twice. Angry customer, compliance team flagging it."

**Your answer:**
> "Immediate response: reverse the duplicate transaction, notify the customer, and file an incident report with the compliance team.
>
> Root cause: the KHQR payment endpoint lacked idempotency control.
>
> Fix: every KHQR payment request must carry a unique PaymentRequestID embedded in the QR code. On first receipt, store the PaymentRequestID and status in Redis. On any retry within 24 hours, return the original response without re-processing.
>
> Prevention: write a regression test for this exact scenario — mobile app sends the same QR payment twice, assert that only one transaction appears in the ledger."

---

**Scenario C: Salary Day Outage**

> "It's the 25th of the month. Every corporate client is disbursing payroll through our bulk payment API. The API is returning 503s. 10,000 employees are not getting paid."

**Your answer:**
> "Step 1 — communicate. Notify the executive team, compliance, and corporate banking relationship managers immediately. 'We have a service disruption affecting bulk payroll. We are actively investigating. Next update in 15 minutes.'
>
> Step 2 — triage. Check the bulk payment API error logs. Is this a database connection pool exhaustion? A downstream queue saturation? A memory issue from processing very large payroll files concurrently?
>
> Step 3 — mitigate. If it's resource exhaustion, apply rate limiting on bulk submissions and queue the rest. If it's a bug, roll back to the previous version.
>
> Step 4 — communicate again. 'Service restored. Queued payroll will process by [specific time].' Corporate clients need a concrete commitment.
>
> Post-mortem: salary day is predictable. We should run a load test against 3x normal volume every month before the 25th. This outage should never happen twice."

---

**Scenario D: NBC Audit**

> "The National Bank of Cambodia is conducting a digital banking audit next month. They want to see transaction logs for all KHQR payments in the last 6 months, including any failed or reversed transactions."

**Your answer:**
> "If I've built the system correctly, this request takes hours — not weeks.
>
> I maintain an immutable transaction audit log in a separate append-only data store. Every KHQR payment — submitted, processed, failed, reversed — writes a record with: PaymentID, timestamp, sender, receiver, amount, currency, status, failure reason, and the user/system that triggered each state change.
>
> I'd generate the report as a structured CSV or the format NBC specifies, signed with a checksum so they can verify the data hasn't been altered.
>
> The real conversation here is: if a team can't respond to a regulator's data request within 48 hours, they don't have proper audit infrastructure. That's not a reporting problem — it's a compliance architecture problem. I build to answer that question before it's asked."

---

## Day-of Quick Reference (Part 2)

### Critical additions
- **System design:** ask constraints first, then data model → API → happy path → failure cases
- **Scalability:** decouple customer response from backend processing; queue in front of Flexcube
- **Leadership:** grow the team, don't just solve the problem yourself
- **Deadlines:** cut scope, never cut correctness on the critical path

### High additions
- **Observability:** logs + metrics + traces. Track business metrics, not just CPU.
- **API design:** versioning, idempotency, meaningful errors, backward compatibility
- **CI/CD:** test migrations against production-size data — non-negotiable
- **Stakeholder management:** communicate early, come with options, document decisions

### CMB scenarios to internalize
- **Flexcube timeout:** idempotency key + async processing
- **KHQR duplicate:** QR-embedded PaymentRequestID + Redis deduplication
- **Salary day outage:** predictable load → mandatory pre-event load testing
- **NBC audit:** immutable append-only audit log, answerable in < 48 hours
