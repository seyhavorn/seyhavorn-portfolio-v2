# Senior Backend Interview — AI Integration (Banking/Fintech)

---

### Q1. How would you integrate an LLM API into a backend service? What challenges do you anticipate?

**Integration with Spring Boot (WebClient for non-blocking calls):**
```java
@Service
public class LlmService {
    private final WebClient webClient;

    public Mono<String> complete(String prompt) {
        return webClient.post()
            .uri("https://api.anthropic.com/v1/messages")
            .header("x-api-key", apiKey)
            .bodyValue(Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 1000,
                "messages", List.of(Map.of("role", "user", "content", prompt))
            ))
            .retrieve()
            .bodyToMono(LlmResponse.class)
            .map(r -> r.content().get(0).text())
            .timeout(Duration.ofSeconds(30))
            .onErrorReturn("Service temporarily unavailable");
    }
}
```

**Key challenges and mitigations:**

| Challenge | Mitigation |
|----------|-----------|
| High latency (1–30s) | Async/reactive calls, streaming responses, timeout handling |
| Non-determinism | Structured output prompting, output validation, temperature=0 |
| Cost | Caching, prompt compression, model tiering |
| Prompt injection | Input sanitization, system prompt hardening, output validation |
| Rate limits | Exponential backoff with jitter, request queuing |
| Token limits | Chunking long inputs, summarization pipelines |
| Hallucinations | RAG for factual queries, confidence thresholds, human review |

---

### Q2. Explain RAG (Retrieval-Augmented Generation). How would you implement it in a Java/Spring backend?

**What is RAG?**
RAG grounds LLM responses in your own data by retrieving relevant context at query time and injecting it into the prompt.

**Pipeline:**
```
Document Ingestion:
  Raw Docs → Chunking → Embedding Model → Vector Store

Query Time:
  User Query → Embed Query → Similarity Search → Top-K Chunks
            → Inject into Prompt → LLM → Answer
```

**Implementation with Spring AI + pgvector:**
```java
// 1. Ingest documents
@Service
public class DocumentIngestionService {
    private final VectorStore vectorStore;
    private final TokenTextSplitter splitter;

    public void ingest(Resource document) {
        List<Document> docs = new TikaDocumentReader(document).get();
        List<Document> chunks = splitter.apply(docs);
        vectorStore.add(chunks);
    }
}

// 2. Query with context
public String queryWithRag(String userQuestion) {
    List<Document> context = vectorStore.similaritySearch(
        SearchRequest.query(userQuestion).withTopK(5)
    );
    String contextText = context.stream()
        .map(Document::getContent)
        .collect(Collectors.joining("\n\n"));

    String prompt = """
        Answer based on the following context:
        %s

        Question: %s
        """.formatted(contextText, userQuestion);

    return llmService.complete(prompt);
}
```

**Key design decisions:**
- Chunk size (300–1000 tokens) and overlap (10-20%) affect retrieval quality
- Embedding model must match at query and ingestion time
- Re-ranking (cross-encoder) improves precision after initial retrieval
- Metadata filtering (e.g., by document type, date) narrows the search space

---

### Q3. How do you handle non-determinism and hallucinations from LLMs in a production system?

**Non-determinism strategies:**
- Set `temperature=0` for tasks requiring consistent output
- Use structured output / JSON mode to constrain response format
- Prompt the model to say "I don't know" rather than guess

**Hallucination mitigation:**
- Use RAG to ground responses in verified source documents
- Prompt: "Answer only based on the provided context."
- Validate output against known schemas or business rules
- Use a second LLM call as a verifier/judge

**Structured output:**
```java
String prompt = """
    Respond ONLY with valid JSON matching this schema:
    {"category": string, "confidence": number (0-1), "summary": string}
    """;

ObjectMapper mapper = new ObjectMapper();
MyResponse response = mapper.readValue(llmOutput, MyResponse.class);
if (response.confidence() < 0.7) {
    escalateToHumanReview(response);
}
```

**Human-in-the-loop:** Never automate irreversible actions based solely on LLM output. Log all LLM inputs/outputs for audit.

---

### Q4. What strategies would you use to reduce LLM API costs at scale?

**Strategy 1 — Semantic caching:**
```java
float[] queryEmbedding = embedService.embed(userQuery);
Optional<CachedResponse> cached = semanticCache.findSimilar(queryEmbedding, threshold=0.95);
if (cached.isPresent()) return cached.get().response();
```

**Strategy 2 — Model tiering:**
- Use cheap/fast models for simple tasks (classification, extraction)
- Reserve expensive models for complex reasoning
- Route based on task complexity

**Strategy 3 — Prompt compression:**
- Remove unnecessary whitespace and repeated instructions
- Compress context using summarization before injection

**Strategy 4 — Batching:**
- Batch APIs offer 50% discount for non-real-time jobs
- Useful for bulk document processing, report generation

**Strategy 5 — Output length control:**
- Set `max_tokens` aggressively per task type
- Prompt: "Respond in 2-3 sentences maximum"

**Strategy 6 — Monitor and attribute costs:**
- Track token usage per feature, per user tier, per model
- Set spending alerts and per-user quotas

---

### Q5. How do you implement streaming LLM responses to a frontend using Spring Boot?

**Problem:** LLM responses take 3-30 seconds. Blocking until the full response is ready creates a poor UX.

**Solution — Server-Sent Events (SSE):**

```java
@GetMapping(value = "/api/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamChat(@RequestParam String message) {
    return webClient.post()
        .uri("https://api.anthropic.com/v1/messages")
        .header("x-api-key", apiKey)
        .bodyValue(Map.of(
            "model", "claude-sonnet-4-20250514",
            "stream", true,
            "messages", List.of(Map.of("role", "user", "content", message))
        ))
        .retrieve()
        .bodyToFlux(String.class)   // stream chunks as they arrive
        .map(this::extractTextDelta)
        .filter(Objects::nonNull);
}
```

**Frontend consumption (JavaScript):**
```javascript
const eventSource = new EventSource('/api/chat?message=Hello');
eventSource.onmessage = (event) => {
    document.getElementById('output').textContent += event.data;
};
```

**Why SSE over WebSockets?**
- SSE is simpler — unidirectional (server → client), auto-reconnects, works over HTTP/1.1.
- WebSockets are bidirectional — necessary for chat apps with user typing indicators, but overkill for LLM streaming.

---

### Q6. How would you design an AI-powered document processing pipeline?

**Use case:** Automatically extract, classify, and summarize uploaded documents (contracts, invoices, reports).

**Architecture:**
```
Upload API → Object Storage (S3) → Event (Kafka/SQS)
    → Document Parser (Apache Tika) → Text Chunks
    → LLM Classification (what type of document?)
    → LLM Extraction (extract structured fields)
    → Store Results (PostgreSQL) → Notify User
```

**Design decisions:**

1. **Async processing:** Never process documents synchronously. Upload returns immediately; processing happens in background workers.

2. **Idempotency:** Each document gets a unique processing ID. If the same event is consumed twice, skip re-processing.

3. **Model selection per task:**
   - Classification → small/fast model (Haiku/GPT-4o-mini)
   - Extraction → medium model with structured JSON output
   - Summarization → larger model for quality

4. **Validation layer:** LLM-extracted data is validated against business rules before persisting. Confidence scores determine if human review is needed.

5. **Cost control:** Track tokens per document. Set max document size limits. Use OCR (Tesseract) for scanned PDFs before sending to LLM.
