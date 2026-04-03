# Behavioral Interview Questions & HR Preparation

A curated list of behavioral and HR interview questions with personalized answer scripts for Cambodian engineering interviews.

---

## 🇰🇭 Cambodia-Specific Context

**Common in Cambodian Tech Interviews:**
- **English proficiency** checks (technical communication)
- Questions about **working in teams** and adapting to fast-paced startups
- HR focuses on **cultural fit**, **salary expectations**, and **commitment**
- Behavioral questions often follow the **STAR method** (Situation, Task, Action, Result)
- Companies value **loyalty** and **willingness to learn** highly

---

## 🧠 Behavioral Questions (HR Will Ask These)

1. **Tell me about yourself.**
2. **Why should we hire you?**
3. **What's your greatest strength? Greatest weakness?**
4. **Describe a challenging project you worked on. How did you handle it?**
5. **Tell me about a time you failed. What did you learn?**
6. **How do you handle conflict within a team?**
7. **Describe a time you had to meet a tight deadline.**
8. **Why do you want to work here?**
9. **Why are you leaving your current job?**
10. **Where do you see yourself in 5 years?**
11. **What motivates you?**
12. **How do you prioritize when everything is urgent?**
13. **What is your expected salary?**
14. **Do you have any questions for us?**

---

## 📚 Q&A — Sample Answer Scripts

### Q1. Tell me about yourself.

**A (Full Script — 2 minutes):**

> "Hi, I'm Seyha — a backend-focused software engineer with 4 years of experience specializing in **Java 21, Spring Boot,** and **microservices architecture**.
>
> My most significant project was architecting a **12-service microservices platform** for Cambodia's Ministry of Agriculture, under the **FAO PEARL Project**. It's an agrometeorological early-warning system that processes real-time climate data from NOAA and ECMWF, runs it through domain-specific risk engines — flood, drought, cyclone, pest & disease — and delivers advisory bulletins and push notifications to farming communities across Cambodia. I designed the full architecture using **Spring Cloud** — Eureka for service discovery, Spring Cloud Gateway, Resilience4j for circuit breaking, RabbitMQ for event-driven notifications, and **PostGIS** for geospatial processing.
>
> Beyond that, I've built enterprise-grade systems including a **CRM platform**, **multi-tenant CMS**, and an **SMS gateway service** — all using Java 21 and Spring Boot with PostgreSQL, Redis, and Liquibase for database migrations.
>
> What sets me apart is that I own the **full deployment lifecycle** — not just writing code. I containerize applications with **Docker and Jib**, orchestrate with **Docker Compose**, manage **CI/CD pipelines**, and administer **Ubuntu production servers** and **AWS infrastructure**. I've also integrated **AI/LLM capabilities** using Spring AI and RAG pipelines.
>
> I'm now looking to bring this experience to a team where I can tackle more complex distributed systems challenges and continue growing as an engineer. That's what excited me about this opportunity — [*tailor to the company*]."

**A (Short Version — 1 minute):**

> "I'm Seyha, a backend engineer with 4 years of experience in Java and Spring Boot. I've architected a 12-microservice platform for Cambodia's Ministry of Agriculture that processes real-time climate data and delivers early-warning alerts to farming communities. I've also built enterprise CRM and multi-tenant CMS platforms. I handle the full stack from code to deployment — Docker, CI/CD, and server administration. I'm looking for a role where I can tackle larger-scale distributed systems challenges."

**Tips for customizing:**
- **Swap the last sentence** to mention something specific about the company you're interviewing with
- **Adjust emphasis** based on the job description — if they want DevOps skills, expand on Docker/K8s; if they want architecture, expand on the 12-service design
- **Practice out loud** — aim for natural delivery, not memorized recitation
- **Don't rush** — pausing between key points makes you sound confident

---

### Q2. Why should we hire you?

> "Three reasons:
>
> **First, I deliver production-ready systems, not just code.** I've architected and shipped a 12-microservice platform that's actively used by Cambodia's Ministry of Agriculture — processing real-time climate data, running risk engines, and sending alerts to thousands of users. That's not a side project — it's a live, mission-critical system I built end-to-end.
>
> **Second, I own the full lifecycle.** Most backend developers hand off deployment to someone else. I containerize with Docker, set up CI/CD pipelines, manage production servers, and monitor with Prometheus and Grafana. When something breaks at 2 AM, I can debug from the application layer all the way down to the infrastructure.
>
> **Third, I bring breadth across domains.** I've built a CRM, a multi-tenant CMS, an SMS gateway, and an AI-powered RAG pipeline — each with different architectural challenges. That means I can ramp up fast on whatever your team is building, because I've likely solved a similar problem before.
>
> I'm not just looking for a job — I'm looking for a team where I can make a real engineering impact. And from what I've seen, [*company name*] is exactly that kind of place."

*Tip: Structure as 3 clear points. Each point = claim + proof. End by connecting to the company.*

---

### Q3. What's your greatest strength?

> "My greatest strength is **problem-solving under pressure**. For example, when our production database went down during a peak hour, I calmly identified the bottleneck, implemented a temporary fix within 30 minutes, and then worked with the team on a permanent solution. We reduced downtime by 70% compared to previous incidents."

*Tip: Pick a strength relevant to the job. Back it with a specific example.*

---

### Q4. What's your greatest weakness?

> "I used to struggle with **delegating tasks** because I wanted to ensure everything was perfect. However, I've learned that trusting my teammates and providing clear guidance leads to better outcomes for everyone. I've been actively working on this by taking on more collaborative projects and focusing on code reviews instead of doing everything myself."

*Tip: Show self-awareness and improvement. Never say "I work too hard" or "I'm a perfectionist" — those sound rehearsed.*

---

### Q5. Describe a challenging project you worked on.

> "The most challenging project was the **ADS-CAS agrometeorological platform**. The challenge was building a system that ingests climate data from multiple external sources — NOAA, ECMWF, local weather stations — in different formats (NetCDF, XML, CSV), processes it through scientific risk models, and delivers actionable alerts to farmers in near real-time.
>
> I broke it down: first, I designed the microservice boundaries using domain-driven design. Then I implemented Spring Batch ETL pipelines for data ingestion, PostGIS for geospatial processing, and RabbitMQ for async notification delivery. The hardest part was making the system reliable — I added ShedLock for distributed scheduling, circuit breakers for external API calls, and table partitioning for time-series data.
>
> The result: the platform now processes thousands of data points every 2 hours and sends automated alerts to agricultural communities across Cambodia."

*Tip: Use STAR method — Situation, Task, Action, Result. Be specific about what YOU did.*

---

### Q6. Tell me about a time you failed. What did you learn?

> "Early in my career, I deployed a database migration to production without testing it against a full dataset. The migration worked on dev with 100 rows but timed out on production with 2 million rows — causing 45 minutes of downtime.
>
> What I learned: I now always test migrations against production-sized data, use expand-contract migration patterns, and never deploy schema changes during peak hours. I also set up a staging environment with production data snapshots specifically for migration testing.
>
> That failure made me much more disciplined about deployment practices."

*Tip: Pick a real failure, not a humble-brag. Show the lesson and how you changed.*

---

### Q7. How do you handle conflict within a team?

> "I focus on the **problem, not the person**. In a recent project, a colleague and I disagreed on whether to use REST or gRPC for inter-service communication. Instead of arguing, I suggested we both write a short pros/cons document and discuss with the team.
>
> After comparing, we agreed that REST was better for our use case because we needed browser compatibility. The key was making it a technical discussion backed by evidence, not a personal debate.
>
> I've found that most conflicts come from miscommunication. So I always try to understand the other person's perspective first before pushing my own."

*Tip: Show maturity. Never badmouth former colleagues or managers.*

---

### Q8. Describe a time you had to meet a tight deadline.

> "We had 3 weeks to deliver an SMS gateway service for a client launch. I broke the work into daily milestones, prioritized the critical path — API endpoint, message queue integration, delivery status tracking — and deferred nice-to-haves like the admin dashboard.
>
> I communicated daily progress to stakeholders so there were no surprises. When I hit a blocking issue with the telco API, I escalated immediately and we found a workaround within a day.
>
> We delivered on time. The dashboard followed one week later. The client was happy because the core functionality worked perfectly from day one."

*Tip: Show planning, prioritization, and communication — not just heroic overtime.*

---

### Q9. Why do you want to work here?

> "I've researched [Company] and I'm impressed by [*specific product, project, or value*]. My experience building distributed systems with Spring Boot and managing full deployment pipelines aligns well with what your team is doing.
>
> I'm especially excited about [*specific technical challenge or growth opportunity at the company*]. I want to work somewhere where engineering quality matters, and from what I've seen — the way you [*specific observation*] — this is that kind of place."

*Tip: ALWAYS research the company before the interview. Mention specific products, values, or recent news. Generic answers like "I want to grow" sound lazy.*

---

### Q10. Why are you leaving your current job?

> "I've learned a lot in my current role — I've grown from building simple APIs to architecting entire microservice platforms. But I've reached a point where I want to tackle larger-scale challenges and work with a more experienced team where I can learn from senior engineers.
>
> I'm not running away from anything — I'm running toward a bigger opportunity."

**Answers to AVOID:**
- ❌ "My boss is terrible" → Shows you might badmouth them too
- ❌ "The salary is too low" → Makes you seem money-driven only
- ❌ "I'm bored" → Shows low initiative
- ❌ "There's too much work" → Raises red flags about work ethic

*Tip: Keep it positive. Focus on what you're moving TOWARD, not what you're leaving.*

---

### Q11. Where do you see yourself in 5 years?

> "In 5 years, I want to be a **senior or lead engineer** — someone who not only writes excellent code but also mentors junior developers, makes architectural decisions, and contributes to the engineering culture. I want to deepen my expertise in distributed systems while expanding into areas like platform engineering.
>
> I'm looking for a company where that kind of growth is supported, and where I can make increasingly larger contributions over time."

*Tip: Show ambition but stay realistic. Align with the company's growth path. Don't say "I want your job" or "I want to start my own company."*

---

### Q12. What motivates you?

> "I'm motivated by **building things that people actually use**. The best feeling is when a system I designed handles real production traffic smoothly — like when the weather alert system I built sent its first automated flood warning to farmers. That's real impact.
>
> I'm also motivated by learning. This industry changes fast, and I genuinely enjoy staying current — whether that's picking up a new framework, understanding a new architectural pattern, or experimenting with AI integration."

*Tip: Be genuine. Connect it to real examples from your work.*

---

### Q13. How do you prioritize when everything is urgent?

> "First, I **clarify what's actually urgent vs what feels urgent**. I ask: what breaks if we don't do this today? That usually narrows the list.
>
> Then I use a simple framework: **impact × effort**. High-impact, low-effort items go first. For the rest, I communicate with stakeholders to set expectations — 'I can do A today and B by Wednesday. Does that work?'
>
> The worst thing is to say yes to everything and deliver nothing. It's better to under-promise and over-deliver."

---

### Q14. What is your expected salary?

> "Based on my 4 years of experience, the scope of systems I've built, and the market rate for senior Spring Boot engineers in [*location/market*], I'm looking for a range of [*$X – $Y*].
>
> That said, compensation isn't just about base salary for me — I also value benefits like health insurance, learning opportunities, and flexible working arrangements. I'm open to discussing a package that works for both sides."

**Tips:**
- **Research the market** before the interview — check Glassdoor, LinkedIn, or ask in Cambodian developer communities
- **Give a range**, not a single number — it shows flexibility while setting a floor
- **Never give your number first** if you can avoid it — ask "What's the budgeted range for this role?"
- **In Cambodia**: Be aware that salary negotiation is expected. Your first offer is usually not the final offer.

---

## 📝 Preparation Checklist

- [ ] Research the company and its products (check their website, Facebook page)
- [ ] Review the job description thoroughly
- [ ] Prepare 2-3 stories using STAR method (Situation, Task, Action, Result)
- [ ] Prepare questions to ask the interviewer (see [9-questions-to-ask.md](./9-questions-to-ask.md))
- [ ] Test your tech setup (for remote interviews) — internet, camera, mic
- [ ] Have your resume, portfolio, and GitHub ready
- [ ] Plan your route and timing (Phnom Penh traffic can be unpredictable!)
- [ ] Prepare for English language assessment (common in Cambodian interviews)
- [ ] Know your salary range before walking in
- [ ] Prepare a 1-minute and 2-minute version of "Tell me about yourself"

---

## 💡 Tips for Cambodian Engineers

- **Be honest** — It's okay to say "I don't know, but I'd love to learn."
- **Think out loud** — Interviewers want to see your thought process.
- **Ask clarifying questions** — Don't assume; confirm requirements.
- **Stay calm** — Take a breath before answering tough questions.
- **Show willingness to learn** — Cambodian tech scene values growth mindset.
- **Highlight team experience** — Many companies value collaboration over solo work.
- **Prepare for English tests** — Some companies assess technical English skills.
- **Follow up** — Send a thank-you message within 24 hours (Telegram or email).
- **Dress appropriately** — Business casual is usually safe in Phnom Penh offices.
- **Arrive early** — Traffic in Phnom Penh can be unpredictable!
- **Negotiate salary** — It's expected. Don't accept the first offer without discussion.
- **Bring copies of your resume** — Some interviewers won't have it printed.