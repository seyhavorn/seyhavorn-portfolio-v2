## Introduction Version 2: Detailed (2-3 minutes - HR Screening Call)

> "Thank you for the opportunity. Hi, I'm Seyha, a backend software engineer with 4 years of experience specializing in Java 21 and Spring Boot. I recently architected a 12-microservice early-warning platform for the UN FAO, designing everything from the system architecture using Spring Cloud and RabbitMQ to managing the CI/CD and AWS deployments. I've also built enterprise CRMs and high-throughput SMS gateways, focusing heavily on idempotent APIs, event-driven processing, and data consistency. I'm now looking to bring my experience in building highly reliable, distributed systems to the banking industry, where transaction integrity and security are paramount."

### Question to Ask:

1. **What does the team structure look like?** How many backend developers? Is there a dedicated DevOps/SRE team, or do developers handle infrastructure?

2. **What would my first 30/60/90 days look like?** What would you expect me to accomplish in the first 3 months? Is there an onboarding program for new engineers?

3. **What's the biggest technical challenge the team is facing right now?** Are you migrating from a legacy system? Building new digital banking features?

4. **How do you measure developer performance?** Is it based on output, impact, peer reviews, or OKRs?

5. **What does career growth look like here?** Is there a clear path from senior → lead → principal engineer or architect?

6. **What are the next steps in the interview process?** How many more rounds? Timeline?

7. **When can I expect to hear back?** What's the typical time from final interview to offer?


### Q3. What's your greatest strength?

> "My greatest strength is **designing systems that don't fail silently**. For example, when building our event-driven notification system, I didn't just implement the happy path — I added dead letter queues for failed messages, idempotency keys to prevent duplicate processing, and circuit breakers for external service calls. When our SMS provider went down for 2 hours, the system automatically queued all messages and delivered them in order once the service recovered. Zero data loss.
>
> In banking, I think this mindset is essential — you need engineers who think about failure scenarios before they write the first line of code."

*Tip: Pick a strength relevant to banking — reliability, security thinking, attention to detail.*

---

### Q4. What's your greatest weakness?

> "I used to struggle with **delegating tasks** because I wanted to ensure everything was done to a high standard — especially around data consistency and error handling. However, I've learned that trusting my teammates and providing clear guidelines and code review standards leads to better outcomes for everyone. I've been actively working on this by writing comprehensive coding standards, setting up automated quality gates in CI/CD, and focusing on mentoring rather than doing everything myself."

*Tip: Show self-awareness and improvement. In banking, perfectionism around data integrity can be reframed as a strength.*

---