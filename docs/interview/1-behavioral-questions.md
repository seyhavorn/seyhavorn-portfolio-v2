# Behavioral Interview Guide — Banking/Fintech

**Quick prep for HR and behavioral interviews**. Focus on authenticity, data integrity mindset, and banking-aligned values.

---

## 🇰🇭 What Makes Banking Interviews Different

Banking interviews prioritize **trust, reliability, and risk awareness** — different from startups.

**Key patterns to expect:**
- **STAR method** (Situation, Task, Action, Result) for all behavioral stories
- **English proficiency** checks — direct communication matters
- **Regulatory awareness** — they assess HBO understanding (NBC rules, PCI DSS, KHQR)
- **Risk mindset** — show you think about what *could* go wrong before it happens
- **Loyalty signals** — banks invest in people; they want long-term stability
- **Background checks** — be transparent; banks run thorough vetting
- **Data sensitivity** — expect questions about confidentiality and audit awareness

**Tip:** Banks are more formal and process-driven than startups. Adjust tone accordingly.

---

## 📋 Quick Question Checklist

| Q | Topic | Prep Tip |
|---|-------|----------|
| 1 | Tell me about yourself | **Have 2 versions:** 1-min (quick) and 2-min (full) |
| 2 | Why should we hire you? | **3 claims with proof:** Data integrity + Full ownership + Banking mindset |
| 3-4 | Strengths & Weaknesses | **Strengths=** Reliability. **Weakness=** Show growth story |
| 5 | Challenging project | **Use banking terms:** Data consistency, audit trail, distributed locking |
| 6 | Time you failed | **Lesson learned:** Show what you changed going forward |
| 7 | Team conflict | **Focus on solution:** Logic over ego |
| 8 | Tight deadline | **Show trade-offs:** Communicate, prioritize, deliver |
| 9 | Why banks | **Research their products:** KHQR, mobile app, payment systems |
| 10 | Why leaving | **Frame as growth:** Moving toward rigor, not away from problems |
| 11 | 5-year vision | **Signal stability:** Lead engineer → mentoring path |
| 12 | What motivates | **Connect to mission:** Building systems people trust |
| 13 | Prioritization | **Show discipline:** Impact × Risk framework |
| 14 | Salary | **Give a range:** Don't anchor too low |
| 15 | Questions for us | **Show thoughtfulness:** Team, tech, compliance, growth |

---

## 📚 1-Minute & 2-Minute Versions

**Learn both.** Interviewers often interrupt; the 1-minute version is safer.

### Tell Me About Yourself (1 min)

> Hi, I'm Seyha, a backend engineer with 4 years of Java/Spring Boot experience. I recently architected a 12-microservice platform for the UN FAO, handling distributed transactions, event-driven processing, and zero-downtime deployments. I've also built enterprise CRMs, SMS gateways, and payment systems — always with a focus on data consistency and idempotent APIs. I'm now excited to bring that reliability mindset to banking, where data integrity isn't optional.

**What to emphasize in 60 seconds:**
- ✅ Years + core tech (Java, Spring Boot)
- ✅ Major achievement (microservices, complexity shown)
- ✅ Banking-relevant terms (data consistency, idempotent APIs)
- ✅ Why banking (integrity, reliability, not just money)

### Tell Me About Yourself (2 min)

> Hi, I'm Seyha. I'm a backend-focused engineer with 4 years building resilient, high-throughput systems. 
>
> **My biggest achievement:** Architected a 12-microservice platform for the UN FAO (ADS-CAS). The system ingests climate data from NOAA and local sources, processes it through risk engines, and delivers early-warning alerts to farmers. The challenge was handling **unreliable external sources, ensuring exactly-once semantics, and maintaining full audit trails** — exactly like banking systems. I used Spring Cloud, RabbitMQ, distributed locking with Redis, and PostGIS for geospatial processing. The platform now processes thousands of data points every 2 hours with **zero duplicates and 100% audit integrity**.
>
> **Beyond the code:** I own the full deployment lifecycle — Docker containerization, CI/CD pipelines, Ubuntu/AWS infrastructure, and production monitoring. 
>
> **Other projects:** Enterprise CRM, high-throughput SMS gateway, multi-tenant CMS. All prioritized data consistency and idempotent APIs.
>
> **Why banking:** I want to work where engineering rigor is non-negotiable. Where a bug doesn't crash a feed — it could erase someone's savings. That level of responsibility excites me.

**What makes this strong:**
- ✅ Specific project with banking language (audit trail, distributed transactions)
- ✅ Technical depth + business impact
- ✅ Full-stack ownership (code + DevOps)
- ✅ Connection to banking mission (not just "higher salary")

**Interview tip:** Practice both versions twice. The 2-minute version is your "full story"; the 1-minute version is your safety net if interrupted.

---

## Q&A — Core Answers

### Q1. Why Should We Hire You?

**The simple answer:**
You should hire me because I build systems where data integrity is non-negotiable, I own the full deployment lifecycle, and I understand that banking code has real consequences.

**The structured answer (3-point framework):**

**Point 1: I prioritize data integrity**
- Built 12-microservice platform with distributed transactions, idempotent APIs, and saga patterns
- Implemented distributed locking and event sourcing for full audit trails
- Zero duplicate processing — production experience, not textbook knowledge

**Point 2: Full-stack ownership**
- Not just code: Docker, CI/CD pipelines, AWS, production monitoring
- Can debug from application layer to infrastructure (2 AM production issues)
- In banking, that means you're not waiting for DevOps; you own the reliability

**Point 3: Banking mindset**
- Understand risk: What *fails* matters more than what works
- Think in audit trails, compliance, regulatory impact
- Engineering rigor directly impacts people's financial lives

**Full answer (2-3 min):**

> I can contribute immediately in three ways:
>
> **First, data integrity.** I've architected systems with zero tolerance for data loss. My microservices platform uses distributed transactions, idempotent APIs, and saga patterns — the same patterns core banking systems use. When our external SMS provider went down for 2 hours, the system automatically queued messages and delivered them in order once it recovered. That's the reliability banking needs.
>
> **Second, full-stack ownership.** Most backend developers hand off deployment to DevOps. I don't. I containerize with Docker, configure CI/CD, manage infrastructure, monitor production. When something breaks, I can debug from the application layer all the way to AWS. In banking, where uptime is everything, that ownership is critical.
>
> **Third, I understand what banking code means.** A bug in social media breaks a feed. A bug in banking erases someone's savings. I've built systems where every transaction is auditable, every state change is recorded, and every failure has a recovery path. That discipline isn't overhead — it's the foundation.

**What NOT to say:**
- ❌ "I'm a quick learner" (means you don't know it yet)
- ❌ "I'm really passionate" (vague and overused)
- ❌ "I'll work hard" (everyone claims this)
- ❌ Lead with salary expectations

**Interview tip:** Use 1-2 specific examples. Data integrity + full ownership + banking mindset covers the key motivations.

---

### Q2. What's Your Greatest Strength?

**The simple answer:**
I design systems that don't fail silently. I think deeply about failure scenarios before writing code.

**Why this matters in banking:**
Silent failures in banking mean accounts go missing, transfers disappear, balances become incorrect. You need engineers who prevent that.

**Full answer:**

> My greatest strength is **designing systems that catch and handle failures explicitly**. I don't just build the happy path — I obsess over edge cases, race conditions, and what happens when things break.
>
> For example, in my notification system, I didn't just send messages asynchronously. I added:
> - **Dead Letter Queues** for failed messages (with alerting)
> - **Idempotency keys** to prevent duplicate sends if the consumer retries
> - **Circuit breakers** for external APIs — when Twilio goes down, messages queue instead of drop
> - **Retry with exponential backoff** — smart retry logic, not dumb looping
>
> When our SMS provider had a 2-hour outage, the system queued 50,000 messages and delivered them in order once service recovered. Zero message loss. That's the engineering rigor banking needs.

**Banking-aligned strengths to choose from:**
- Reliability thinking (what fails, recovery paths)
- Security mindset (OAuth2, encryption, audit trails)
- Attention to detail (data consistency, trace every transaction)
- Calm under pressure (production incident handling)

**Interview tip:** Always back your strength with a specific story, especially for banking roles.

---

### Q3. What's Your Greatest Weakness?

**The formula:** (Past weakness) → (Why it mattered) → (How you grew) → (Evidence of change)

**Good weakness example:**

> I used to struggle with **delegating tasks** because I wanted to ensure everything met my standards — especially around data consistency and error handling. I'd spend hours perfecting error messages or auditing code because I knew how important that is.
>
> But I realized that's not scalable. The best systems aren't built by one engineer obsessing; they're built by teams with clear standards and good code review.
>
> So I shifted my approach: Instead of doing everything myself, I now write comprehensive coding standards and set up automated quality gates in CI/CD. I focus on mentoring. The result: better code, faster delivery, and happier team members who feel trusted.
>
> Looking at your open position, I think this is actually a strength for banking. You want engineers concerned with quality and data integrity — not people who cut corners for speed.

**What NOT to say:**
- ❌ "I work too hard / care too much" (doesn't sound real)
- ❌ "I'm a perfectionist" (vague; every engineer says this)
- ❌ "I don't really have weaknesses" (arrogant)
- ❌ Pick a core skill weakness (if they ask for a dev, don't say "I'm weak at coding")

**Formula for banking:**
- **Weak communication** → Learned to document decisions → Now write good RFCs
- **Struggled with delegation** → Realized teams > individuals → Now mentor and code review
- **Ignored DevOps early** → Saw production on-call pain → Learned full-stack ownership
- **Didn't think about compliance** → Saw data breach => Learned regulatory mindset

**Interview tip:** Banking loves humility + growth. Show you learned.

---

### Q4. Describe a Challenging Project You Worked On

**Structure: Setup → Challenge → Solution → Result**

> **Setup:** I built a 12-microservice platform (ADS-CAS) that provides early-warning alerts for flooding and drought to Cambodian farmers.
>
> **The challenge:** The system had to ingest climate data from multiple sources — NOAA, ECMWF, local weather stations — in different formats (NetCDF, XML, CSV). Then process that data through scientific risk models (using PostGIS) and deliver actionable alerts in real-time. But here's the banking parallel: we had to handle **unreliable external sources, ensure processing exactly-once (no duplicates), and maintain full audit trails** for regulatory reporting.
>
> **The solution:** I broke it down:
> - **Microservice boundaries** using domain-driven design (Data Ingestion, Risk Processing, Notification)
> - **Spring Batch** for ETL with ShedLock (only one instance processes each batch)
> - **RabbitMQ** for async delivery with idempotent consumers (deduplication via event IDs)
> - **Circuit breakers** for external API calls — graceful degradation when sources fail
> - **Table partitioning** on PostgreSQL for time-series data (performance)
> - **Full audit logging** — every data point, every transformation, every decision
>
> **The result:** The platform now processes thousands of data points every 2 hours with zero duplicate records, 100% data integrity, and full audit trail. Thousands of farmers get accurate warnings. System has 99.5% uptime.

**Key banking terms to weave in:**
- "Exactly-once processing" (no duplicates)
- "Audit trails" (compliance + debugging)
- "Distributed transactions" (consistency across services)
- "Idempotent" (safe retries)
- "Graceful degradation" (survives failures)
- "Data consistency" (correctness over speed)

**Interview tip:** Banking engineers ask "What if data was corrupted?" Always address the failure scenario.

---

### Q5. Tell Me About a Time You Failed — And What You Learned

**Structure: Failure → Impact → Root cause → What changed**

> **The failure:** Early in my career, I deployed a database migration to production without testing against a full dataset. The migration worked fine on dev with 100 rows, but on production with 2 million rows, it timed out and locked the entire accounts table for 45 minutes.
>
> **The impact:** Complete downtime. Customers couldn't check balances or transfer money. In a real bank, this would've been a regulatory incident.
>
> **Root cause:** I didn't test migrations properly. I didn't understand that a MySQL `ALTER TABLE` with a default value locks the table during the migration.
>
> **What I changed:** Now I follow the **Expand-Contract pattern** (add column → migrate data → remove old column — never in the same release). I test migrations against production-sized data. I never deploy schema changes during business hours. I set up a staging environment with production data snapshots specifically for migration testing.
>
> **Why it matters now:** In banking, a database migration mistake doesn't just cause downtime — it can corrupt financial data. That failure taught me that **every database change must be reversible and testable at scale**. I've followed that principle religiously since.

**What makes this answer strong:**
- ✅ Real failure (not made-up)
- ✅ Shows impact you understood (not defensive)
- ✅ Shows specific changes (not vague "I learned to be more careful")
- ✅ Connects to banking (stakes are high)

**Interview tip:** Banks respect honesty about failures. They don't respect people who claim perfection.

---

### Q6. How Do You Handle Conflict Within a Team?

**Simple answer:**
Focus on the problem, not the person. Separate the person from the idea.

**Full answer:**

> I focus on **logic over ego**. Here's a real example:
>
> In one project, I recommended we use gRPC for inter-service communication. A teammate argued for REST. Instead of debating, I suggested we both write a quick comparison — REST vs gRPC, pros/cons for our use case.
>
> After comparing, we agreed REST was better because we needed browser compatibility and easier debugging across teams. **The key:** We based the decision on data, not arguments.
>
> If we'd stuck with my recommendation just because I suggested it first, we would've gotten the architecture wrong. I'd rather be overruled by good logic than right by ego.
>
> In banking, I think this is especially important. Architectural decisions have long-term financial implications. You want decisions based on technical trade-offs, not personalities.

**Framework for handling conflict:**
1. **Listen first** — Try to understand the other person's constraint
2. **Separate idea from person** — "I disagree with that approach" not "That's a bad idea"
3. **Use data** — Benchmarks, examples, historical decisions
4. **Find common ground** — "We both want reliability; which option is more reliable?"
5. **Escalate gracefully** — If stuck, involve a tech lead

**Interview tip:** Banks value measured engineers who are collaborative, not ego-driven architects.

---

### Q7. Describe a Time You Met a Tight Deadline

> Our SMS gateway had a 48-hour deadline to deploy for a client. The challenge: the project wasn't 50% done.
>
> Instead of panicking, I:
> 1. **Prioritized ruthlessly** — Core features only (send SMS, track delivery, basic reporting). Cut nice-to-haves (templates, advanced analytics).
> 2. **Communicated trade-offs early** — Told the client "We can hit your deadline. Here's what's in scope, here's what we defer."
> 3. **Focused on production-ready** — Didn't skip testing or DevOps setup. Released something reliable, not a ticking time bomb.
> 4. **Set expectations** — "Day 1: core send + delivery. Day 2: monitoring + documentation. Month 2: advanced features."
>
> We shipped on time. It wasn't feature-complete, but it was reliable and met their immediate needs. We added features over the next month.
>
> **Banking perspective:** Speed matters, but reliability matters more. A fast deploy of broken code is worse than a delayed deploy of correct code.

---

### Q8. Why Do You Want to Work at a Bank/in Fintech?

**Don't answer:** "Better salary" or "Stable company"  
**Do answer:** Connect to their specific mission or products.

> Three reasons:
>
> **First, I want to tackle serious technical challenges.** Banking systems handle real money. There's zero tolerance for bugs that cause incorrect balances, duplicate transfers, or security breaches. That level of engineering rigor excites me. It's not abstract — mistakes have real consequences.
>
> **Second, I've already built systems with banking-grade requirements.** My microservices platform handles distributed transactions, idempotent APIs, and full audit trails. I've solved problems that banks solve daily. I want to apply those skills in the domain where they matter most.
>
> **Third, banking in Cambodia is changing rapidly.** KHQR, mobile banking, NBC's digital transformation — there's real opportunity to build systems that serve millions of Cambodians. I want to be part of that.
>
> \[*For specific bank*\]: I'm particularly interested in [*bank*] because of [*their mobile app, KHQR adoption, digital payment initiative, etc.*]

**Interview tip:** ALWAYS research the bank before the interview. Mention their specific products or recent announcements.

---

### Q9. Why Are You Leaving Your Current Job?

**Frame it as:** Growth toward banking's higher standards, not **running away** from problems.

> I've learned a lot in my current role — I've grown from building simple APIs to architecting entire microservice platforms. But I've reached a point where I want larger-scale challenges in a domain where reliability is critical. Banking is exactly that.
>
> I'm also attracted to the more structured engineering environment banks have. Stronger code review processes, compliance requirements, change management practices. I want to deepen my expertise in that kind of disciplined culture.

**Answers to AVOID:**
- ❌ "My manager is terrible" → Shows you might badmouth them later
- ❌ "The salary is too low" → Makes you seem money-only focused
- ❌ "Too much work/stress" → Raises concerns about work ethic
- ❌ "Bored" → Shows low initiative
- ❌ Anything that sounds like you're *running away*

**Better frame:**
- ✅ "Ready for new challenges"
- ✅ "Want to deepen expertise in domain X"
- ✅ "Excited by your products/tech stack"
- ✅ "Next career step"

**Interview tip:** Positive momentum is better than negative momentum. Show you're moving *toward* something, not *away from*.

---

### Q10. Where Do You See Yourself in 5 Years?

**Why they ask:** Banks invest heavily in training. They want people who'll stay, not people job-hopping.

> In 5 years, I want to be a **senior or lead engineer** in banking — someone who:
> - Writes excellent code AND sets architectural standards for transaction systems
> - Mentors junior developers on building secure, reliable services
> - Contributes to the bank's technology strategy
>
> I want to deepen expertise in distributed systems, payment processing, and security. Maybe explore platform engineering and compliance automation. Banking is a domain where deep expertise compounds over time, and I want to build that here long-term.

**Why this answer works:**
- ✅ Shows you see yourself **staying** (banks love stability)
- ✅ Growth path is clear (senior → lead)
- ✅ Technical depth + mentoring (not just chasing titles)
- ✅ Connected to banking domain (not trying to jump to startup in 2 years)

**Banking-specific signals:**
- "Lead engineer" (not jumping to startup founding)
- "Mentoring" (not hoarding knowledge)
- "Long-term expertise" (not quick exit)
- "Compliance automation" (shows you care about regulatory concerns)

---

### Q11. What Motivates You?

**Banking-aligned answer:**

> I'm motivated by **building systems that people trust with their money**.
>
> The best feeling is when a system I designed handles production traffic smoothly — knowing that every transfer, every payment, every balance check is processed correctly because **I got the architecture right**. That feeling is addictive.
>
> I'm also motivated by **preventing things from going wrong**. In banking, you don't just build features — you think about race conditions, data corruption, security threats. That kind of adversarial thinking is intellectually stimulating. And when you get it right, it matters.

**Don't say:**
- ❌ "Money" (sounds greedy)
- ❌ "Titles" (sounds insecure)
- ❌ "Work-life balance" (signals you don't care about the job)
- ❌ "Learning new tech for its own sake" (startups say this, not banks)

**Better motivations for banking:**
- ✅ Reliability, data integrity
- ✅ Trust, security
- ✅ Solving hard problems
- ✅ Mentoring, impact

---

### Q12. How Do You Prioritize When Everything Is Urgent?

**Framework (Impact × Risk):**

In banking, I always ask: **What's the financial impact if we don't fix this now?**

> I use a simple framework:
>
> | Priority | Example | Timeline |
> |----------|---------|----------|
> | **P0 (Fix now)** | Account balance is wrong / Transfer failed | Hours |
> | **P1 (Fix today)** | Payment method not saved / Login is slow | 1 day |
> | **P2 (Fix this week)** | UI alignment bug / Report generation slow | Week |
> | **P3 (Schedule)** | Nice-to-have feature / Code cleanup | Month |
>
> P0 examples in banking: Incorrect balances, security breaches, regulatory violations, failed critical transfers.
>
> Then I **communicate clearly with stakeholders**: "I can fix the payment issue today. The reporting optimization will be ready Wednesday. Here's the priority reasoning." Clarity beats magical speed.

**Key principle:** "In banking, it's better to under-promise and over-deliver — especially when people's money is involved. I'd rather say 'I'll need 2 days' and finish in 1, than promise today and deliver late."

---

### Q13. What's Your Expected Salary?

**Framework:**
1. **Research market rate** — Banking salaries are 15-30% higher than startups for senior roles in Cambodia
2. **Give a range** — Shows you're flexible while setting a floor
3. **Never anchor low** — If you say $X, they anchor to $X

> Based on 4 years of experience, the scope of systems I've architected, and senior backend engineer rates in Cambodia's banking sector, I'm exploring roles in the range of **$[X] – $[Y] monthly** or equivalent annual package.
>
> That said, I value the stability and benefits banking offers — structured growth, annual bonuses, health insurance — and I'm flexible on the total compensation package that works for both sides.

**Tips for banking salary negotiation:**
- Banks expect negotiation — first offer is rarely final
- **Factor in benefits:** Insurance, bonuses, leave, NSSF, loan discounts
- **Pay transparency is improving but not standard** — try "What's your budgeted range?" before giving yours
- **In Cambodia:** Salary + annual bonus is typical. Understand both.
- **Red flags:** If they won't discuss salary range, walk

**Never say:**
- ❌ Your current/previous salary
- ❌ "Whatever you think is fair"
- ❌ A single number (always range)

---

## � Interview Preparation Checklist

> "The most challenging project was the **ADS-CAS agrometeorological platform**. The challenge was building a system that ingests data from multiple external sources — NOAA, ECMWF, local weather stations — in different formats (NetCDF, XML, CSV), processes it through scientific risk models, and delivers actionable alerts in near real-time. The parallels to banking are strong — we had to handle **unreliable external data sources, ensure processing exactly-once semantics, and maintain audit trails** for every data transformation.
>
> I broke it down: first, I designed the microservice boundaries using domain-driven design. Then I implemented Spring Batch ETL pipelines for data ingestion, PostGIS for geospatial processing, and RabbitMQ for async notification delivery. The hardest part was making the system reliable — I added **ShedLock for distributed scheduling** (so only one instance processes each batch), **circuit breakers for external API calls**, **idempotent consumers** (deduplication via event IDs), and **table partitioning** for time-series data.
>
> The result: the platform now processes thousands of data points every 2 hours with **zero duplicate records and full auditability** — the same guarantees a banking transaction system needs."

*Tip: Frame your experience in banking terms — data integrity, exactly-once processing, audit trails.*

---

### Q6. Tell me about a time you failed. What did you learn?

> "Early in my career, I deployed a database migration to production without testing it against a full dataset. The migration worked on dev with 100 rows but timed out on production with 2 million rows — causing 45 minutes of downtime.
>
> What I learned: I now always test migrations against production-sized data, use **expand-contract migration patterns** (add column first, migrate data, then drop old column — never in the same release), and never deploy schema changes during peak hours. I also set up a staging environment with production data snapshots specifically for migration testing.
>
> In banking, this kind of mistake could mean account data becomes inaccessible during business hours. That failure taught me that **every database change in production must be reversible**, and I've followed that principle religiously ever since."

*Tip: Pick a real failure, show the lesson, and connect to why it matters in banking.*

---

### Q7. How do you handle conflict within a team?

> "I focus on the **problem, not the person**. In a recent project, a colleague and I disagreed on whether to use REST or gRPC for inter-service communication. Instead of arguing, I suggested we both write a short pros/cons document and discuss with the team.
>
> After comparing, we agreed that REST was better for our use case because we needed browser compatibility and easier debugging. The key was making it a technical discussion backed by evidence, not a personal debate.
>
> In banking, I think this approach is especially important because **architectural decisions have long-term financial implications**. You want decisions based on data, not ego. I've found that most conflicts come from miscommunication, so I always try to understand the other person's perspective first."

*Tip: Show maturity and data-driven decision-making — banks value measured, thoughtful engineers.*

---

### Q8. Why do you want to work at a bank / in fintech?

> "Three reasons:
>
> **First, the technical challenges are real and consequential.** Banking systems handle people's money — there's zero tolerance for bugs that cause incorrect balances, duplicate transfers, or security breaches. That level of engineering rigor excites me.
>
> **Second, I've already built systems with banking-grade requirements.** My microservices platform processes real-time data with distributed transactions, idempotent APIs, and full audit trails. I want to apply those skills in a domain where they matter most.
>
> **Third, banking technology in Cambodia is evolving rapidly.** With KHQR, mobile banking, and NBC's digital transformation initiatives, there's an opportunity to build systems that serve millions of people. I want to be part of that — building infrastructure that Cambodians trust with their financial lives.
>
> \[*For specific bank*\]: I'm particularly interested in [*bank name*] because [*mention their specific tech initiative, mobile app, or digital banking platform*]."

*Tip: ALWAYS research the bank before the interview. Mention their specific products (mobile banking app, digital payments platform, KHQR adoption).*

---

### Q9. Why are you leaving your current job?

> "I've learned a lot in my current role — I've grown from building simple APIs to architecting entire microservice platforms. But I've reached a point where I want to tackle **larger-scale challenges in a domain where reliability is critical**. Banking offers exactly that — systems where data consistency, security, and uptime are non-negotiable.
>
> I'm also excited about working with a more experienced team in a structured engineering environment. Banks typically have stronger code review processes, compliance requirements, and change management practices — and I want to grow in that kind of disciplined culture."

**Answers to AVOID:**
- ❌ "My boss is terrible" → Shows you might badmouth them too
- ❌ "The salary is too low" → Makes you seem money-driven only
- ❌ "I'm bored" → Shows low initiative
- ❌ "There's too much work" → Raises red flags about work ethic

*Tip: Frame it as growth toward banking's higher standards, not running away from something.*

---

### Q10. Where do you see yourself in 5 years?

> "In 5 years, I want to be a **senior or lead engineer** in the banking/fintech space — someone who not only writes excellent code but also **sets architectural standards for transaction processing systems, mentors junior developers on building secure and reliable services**, and contributes to the bank's technology strategy.
>
> I want to deepen my expertise in distributed systems, payment processing, and security while expanding into areas like **platform engineering and compliance automation**. Banking is a domain where deep expertise compounds over time, and I want to build that long-term expertise here."

*Tip: Banks value loyalty — show you're in it for the long haul, not jumping ship in 2 years.*

---

### Q11. What motivates you?

> "I'm motivated by **building systems that people trust with their money**. The best feeling is when a system I designed handles real production traffic smoothly — knowing that every transfer, every payment, every balance check is processed correctly because the backend I built is reliable.
>
> I'm also motivated by the challenge of **preventing things from going wrong**. In banking, you don't just build features — you think about edge cases, race conditions, and security threats. That kind of adversarial thinking is intellectually stimulating and deeply satisfying when you get it right."

*Tip: Connect your motivation to the banking mission — trust, reliability, and protecting people's money.*

---

### Q12. How do you prioritize when everything is urgent?

> "First, I **assess impact and risk**. In banking, I always ask: *'What's the financial impact if we don't fix this now?'* A bug that causes incorrect account balances gets fixed before a UI alignment issue — regardless of who's requesting it.
>
> Then I use a simple framework: **severity × blast radius**. A production payment failure affecting all users is P0. A reporting query that's slow but correct is P2. For everything in between, I communicate with stakeholders to set expectations — 'I can fix the payment issue today and address the report optimization by Wednesday. Does that work?'
>
> The worst thing in banking is to say yes to everything and deliver nothing. It's better to under-promise and over-deliver — especially when people's money is involved."

---

### Q13. What is your expected salary?

> "Based on my 4 years of experience, the scope of systems I've built, and the market rate for senior Spring Boot engineers in Cambodia's banking sector, I'm looking for a range of [*$X – $Y*].
>
> That said, I value the stability and benefits that banking offers — health insurance, annual bonuses, structured career growth — and I'm open to discussing a total compensation package that works for both sides."

**Tips for banking salary negotiation:**
- **Research the market** — banking typically pays 15-30% above startups in Cambodia for equivalent roles
- **Give a range**, not a single number — it shows flexibility while setting a floor
- **Factor in benefits** — banks often offer better benefits packages (insurance, bonuses, leave)
- **Never give your number first** if you can avoid it — ask "What's the budgeted range for this role?"
- **In Cambodia**: salary negotiation is expected. Your first offer is usually not the final offer.
- **Banking-specific perks to ask about**: loan interest discounts, NSSF, health/life insurance coverage

---

## 📝 Preparation Checklist — Banking Interview

- [ ] Research the bank's products (mobile app, KHQR adoption, digital banking services)
- [ ] Review the job description thoroughly — note any banking-specific requirements
- [ ] Prepare 2-3 stories using STAR method (include data integrity, reliability themes)
- [ ] Understand basic banking concepts: core banking, T24/Temenos, ISO 8583, SWIFT
- [ ] Know NBC (National Bank of Cambodia) basics — digital payment regulations, KHQR
- [ ] Prepare questions to ask the interviewer (see [9-questions-to-ask.md](./9-questions-to-ask.md))
- [ ] Test your tech setup (for remote interviews) — internet, camera, mic
- [ ] Have your resume, portfolio, and GitHub ready
- [ ] Plan your route and timing (Phnom Penh traffic can be unpredictable!)
- [ ] Prepare for English language assessment (common in banking interviews)
- [ ] Know your salary range before walking in (research banking engineer salaries)
- [ ] Prepare a 1-minute and 2-minute version of "Tell me about yourself"
- [ ] Review security fundamentals — OAuth2 flows, JWT, encryption basics

---

## 💡 Tips for Banking Interviews in Cambodia

- **Be honest** — It's okay to say "I don't know, but I'd love to learn." Banks value integrity.
- **Think about failure scenarios** — Interviewers want to see that you consider what could go wrong.
- **Mention data integrity** — Use phrases like "audit trail", "data consistency", "transaction safety".
- **Show security awareness** — Even basic understanding of encryption, OAuth2, and PCI DSS helps.
- **Stay calm** — Take a breath before answering tough questions.
- **Show long-term commitment** — Banks invest in training; they want people who will stay.
- **Highlight team experience** — Banking projects are team efforts, not solo heroics.
- **Prepare for English tests** — Banks assess technical English skills, especially international banks.
- **Understand compliance** — Know that banking code changes require review, testing, and approval processes.
- **Follow up** — Send a thank-you message within 24 hours (email, not Telegram — banks are more formal).
- **Dress professionally** — Business formal or business casual. Banks are more conservative than tech startups.
- **Arrive early** — Traffic in Phnom Penh can be unpredictable!
- **Negotiate salary** — It's expected. Don't accept the first offer without discussion.
- **Bring copies of your resume** — Some interviewers won't have it printed.