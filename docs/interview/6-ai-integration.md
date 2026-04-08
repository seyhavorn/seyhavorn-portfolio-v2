# AI Integration — Senior Backend Interview Guide

**Master LLM APIs, RAG systems, and AI-driven features for banking platforms.** Each answer: simple explanation → problem → solution → professional code → interview tip.

---

## Quick Reference — 26 Core Topics

| # | Topic | Key Concept | Level |
|---|-------|-------------|-------|
| 1 | LLM API Integration | Async calls, rate limits, fallback | ⭐⭐⭐ |
| 2 | Prompt Engineering | Instruction clarity, examples | ⭐⭐⭐ |
| 3 | RAG Architecture | Retrieval-augmented generation | ⭐⭐⭐ |
| 4 | Vector Stores | pgvector, Pinecone, Milvus | ⭐⭐⭐ |
| 5 | Embeddings | Text → vector representation | ⭐⭐⭐ |
| 6 | Semantic Search | Vector similarity, cosine distance | ⭐⭐ |
| 7 | Non-Determinism | Temperature, top-k sampling | ⭐⭐⭐ |
| 8 | Hallucination Mitigation | Source grounding, confidence | ⭐⭐⭐ |
| 9 | Context Windows | Token limits, chunking | ⭐⭐ |
| 10 | Streaming Responses | SSE, token-by-token | ⭐⭐⭐ |
| 11 | Cost Optimization | Caching, model tiering | ⭐⭐⭐ |
| 12 | Structured Output | JSON mode, schema validation | ⭐⭐⭐ |
| 13 | Error Handling | Timeouts, retries, fallback | ⭐⭐⭐ |
| 14 | Prompt Caching | Reduce costs, improve speed | ⭐⭐ |
| 15 | Function Calling | LLM-driven tool usage | ⭐⭐⭐ |
| 16 | Fine-tuning | Custom models, domain knowledge | ⭐⭐ |
| 17 | Multi-turn Conversations | Session state, history | ⭐⭐⭐ |
| 18 | Agent Frameworks | ReAct, logic trees | ⭐⭐⭐ |
| 19 | Document Processing | OCR, chunking, ingestion | ⭐⭐⭐ |
| 20 | Fact Checking | Verification, sources | ⭐⭐ |
| 21 | PII Handling | Privacy, data sanitization | ⭐⭐⭐ |
| 22 | Compliance & Audit | Logging, approval workflows | ⭐⭐⭐ |
| 23 | User Feedback Loop | Ratings, retraining | ⭐⭐ |
| 24 | Latency Management | P99 percentiles, SLA | ⭐⭐⭐ |
| 25 | A/B Testing | Prompt variants, model versions | ⭐⭐ |
| 26 | Banking Compliance | Explainability, bias detection | ⭐⭐⭐ |

---

## AI Integration Fundamentals

### Q1: LLM API Integration (Anthropic, OpenAI)

**The simple answer:**
Call LLM APIs asynchronously, handle rate limits, timeouts, and failures gracefully. Never block on AI responses.

**The problem:**
LLM calls are slow (1-30s), non-deterministic, and may fail. Blocking reduces throughput. Cost scales with tokens. Must implement retries, caching, fallbacks.

**Async Integration with Spring Boot WebClient:**

```java
@Service
public class LlmService {
    private final WebClient webClient;
    private final RateLimiter rateLimiter;
    private static final Duration TIMEOUT = Duration.ofSeconds(30);
    
    public LlmService(WebClient.Builder builder) {
        this.webClient = builder
            .baseUrl("https://api.anthropic.com/v1")
            .defaultHeader("anthropic-version", "2023-06-01")
            .build();
        this.rateLimiter = RateLimiter.create(100);  // 100 requests/sec
    }
    
    // ✅ Non-blocking Mono<String>
    public Mono<String> complete(String prompt) {
        rateLimiter.acquire();  // Rate limiting
        
        return webClient.post()
            .uri("/messages")
            .header("x-api-key", System.getenv("ANTHROPIC_API_KEY"))
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of(
                "model", "claude-3-5-sonnet-20241022",
                "max_tokens", 1024,
                "messages", List.of(Map.of(
                    "role", "user",
                    "content", prompt
                ))
            ))
            .retrieve()
            .onStatus(HttpStatusCode::is5xxServerError, response ->
                Mono.error(new LlmServiceUnavailableException()))
            .onStatus(status -> status.value() == 429, response ->
                Mono.error(new RateLimitExceededException()))
            .bodyToMono(LlmResponse.class)
            .map(r -> r.content().get(0).text())
            .timeout(TIMEOUT)
            .onErrorResume(TimeoutException.class, e -> {
                log.error("LLM timeout after {}s", TIMEOUT.getSeconds());
                return Mono.just("[LLM timeout - using fallback response]");
            })
            .onErrorResume(RateLimitExceededException.class, e ->
                Mono.delay(Duration.ofSeconds(1)).flatMap(_ -> complete(prompt))
            )
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(t -> !(t instanceof RateLimitExceededException))
                .doBeforeRetry(s -> log.warn("Retry {} of LLM call", s.totalRetries() + 1))
            );
    }
    
    // ✅ Blocking wrapper for Spring MVC (use sparingly)
    public String completeBlocking(String prompt) {
        return complete(prompt).block();  // Blocks but uses timeout
    }
}

@RestController
@RequestMapping("/api/ai")
public class LlmController {
    @Autowired private LlmService llmService;
    
    @PostMapping("/chat")
    public String chat(@RequestBody ChatRequest req) {
        // ✅ Non-blocking in Spring WebFlux
        return llmService.complete(req.message()).block(Duration.ofSeconds(35));
    }
}

@Data
class LlmResponse {
    private List<ContentBlock> content;
    
    @Data
    class ContentBlock {
        private String type;  // "text"
        private String text;
    }
}
```

**Error Handling & Fallback:**

```java
@Service
public class ResilientLlmService {
    @Autowired private LlmService llmService;
    @Autowired private FallbackResponseService fallbackService;
    @Autowired private LlmCallAuditService auditService;
    
    public Mono<String> completeWithFallback(String prompt, String userId) {
        return llmService.complete(prompt)
            .doOnSuccess(result -> {
                auditService.logCall(userId, prompt, result, "SUCCESS");
            })
            .doOnError(error -> {
                auditService.logCall(userId, prompt, null, "ERROR", error.getMessage());
            })
            .onErrorResume(error -> {
                if (error instanceof LlmServiceUnavailableException) {
                    log.warn("LLM service down, using fallback");
                    return Mono.just(fallbackService.getGenericResponse(prompt));
                }
                return Mono.error(error);
            });
    }
}
```

**Interview tip:**
"LLM calls are I/O, never block. Use Mono/Flux for async composition. Rate limit by request rate and tokens/second. Log all calls for audit/compliance. Always have fallback for failures above SLA."

---

### Q2: RAG (Retrieval-Augmented Generation)

**The simple answer:**
Retrieve relevant context from your documents, inject into LLM prompt. Grounds responses in verified data, reduces hallucinations.

**The problem:**
LLMs have cutoff dates. Even with fine-tuning, they can't access your banking data. RAG lets LLMs answer questions about your documents in real-time.

**Pipeline:**

```
Offline (Ingestion):
  Document Upload → Parse (Tika) → Split into Chunks (300 tokens + overlap)
                 → Embed each chunk (Sentence-BERT, OpenAI embeddings)
                 → Store in vector DB (pgvector, Pinecone)

Online (Query):
  User Question → Embed question (same model!) → Vector similarity search
               → Retrieve top-K similar chunks → Rerank (cross-encoder)
               → Inject context into system prompt → Call LLM → Parse response
```

**Implementation (Spring AI + pgvector):**

```java
@Service
public class RagDocumentService {
    @Autowired private VectorStore vectorStore;
    @Autowired private DocumentRepository documentRepo;
    @Autowired private TextSplitter textSplitter;
    
    // Ingest documents into vector store
    public void ingestDocument(String documentId, String content) {
        // Split into chunks (overlap helps with context boundaries)
        List<Document> chunks = textSplitter.split(content);
        
        // Metadata for filtering
        chunks.forEach(chunk -> {
            chunk.getMetadata().put("document_id", documentId);
            chunk.getMetadata().put("source", "banking_docs");
            chunk.getMetadata().put("timestamp", Instant.now().toString());
        });
        
        // Store vectors
        vectorStore.add(chunks);
        
        // Persist for audit
        documentRepo.save(new DocumentMetadata(documentId, content.length(), Instant.now()));
    }
}

@Service
public class RagQueryService {
    @Autowired private VectorStore vectorStore;
    @Autowired private LlmService llmService;
    @Autowired private CrossEncoderRanker ranker;
    
    public Mono<String> queryWithRag(String question, String userId) {
        // 1. Retrieve similar documents
        List<Document> results = vectorStore.similaritySearch(
            SearchRequest.query(question)
                .withTopK(10)  // Initial retrieval
                .withSimilarityThreshold(0.5)  // Filter low-confidence
        );
        
        if (results.isEmpty()) {
            return Mono.just("No relevant documents found. Please rephrase.");
        }
        
        // 2. Rerank for better precision (removes false positives)
        List<Document> reranked = ranker.rerank(question, results, topK = 3);
        
        // 3. Format context with source attribution
        String context = reranked.stream()
            .map(doc -> {
                String source = doc.getMetadata().getOrDefault("document_id", "unknown");
                return doc.getContent() + "\n[Source: " + source + "]";
            })
            .collect(Collectors.joining("\n\n"));
        
        // 4. Build prompt with context
        String systemPrompt = """
            You are a banking assistant. Answer questions based ONLY on the provided context.
            If the answer is not in the context, say "I don't have information about that."
            Always cite the source document.
            """;
        
        String userPrompt = """
            Context:
            %s
            
            Question: %s
            """.formatted(context, question);
        
        // 5. Call LLM
        return llmService.complete(userPrompt, systemPrompt)
            .doOnSuccess(answer -> {
                auditService.logRagQuery(userId, question, context, answer);
            });
    }
}

@Configuration
public class RagConfiguration {
    
    @Bean
    public TextSplitter textSplitter() {
        return new TokenTextSplitter()
            .withChunkSize(512)  // ~300 tokens
            .withChunkOverlap(50);  // Overlap helps with boundary issues
    }
    
    @Bean
    public CrossEncoderRanker crossEncoderRanker() {
        return new CrossEncoderRanker("cross-encoder/qnli-distilroberta-base");
    }
}
```

**Chunking Strategy (Critical):**

```java
public class ChunkingStrategies {
    
    // ✅ For financial documents: keep sentences together
    public List<String> chunkByParagraph(String text) {
        String[] paragraphs = text.split("\\n\\n+");
        return Arrays.asList(paragraphs);
    }
    
    // ✅ For contracts: respect semantic boundaries
    public List<String> chunkBySection(String text) {
        // Split on headers (Section 1.2, Article III, etc.)
        Pattern sectionPattern = Pattern.compile("^(§|Article|Section)\\s+\\d+", Pattern.MULTILINE);
        // ... smart splitting logic
        return chunks;
    }
    
    // ✅ Avoid: naive token splitting at max-length (orphaned sentences)
    // ✅ Always: overlap 10-20% to preserve context at boundaries
}
```

**Interview tip:**
"RAG grounds LLMs in your data. Proper chunking (<512 tokens, preserve semantic boundaries) matters more than vector model. Always rerank results. Log every query for compliance."

---

### Q3: Handling Non-Determinism & Hallucinations

**The simple answer:**
Set `temperature=0` for deterministic outputs. Use RAG to ground answers. Validate outputs against business rules.

**The problem:**
LLMs are probabilistic. Same prompt may give different answers. They invent facts ("hallucinate"). In banking, this is unacceptable.

**Strategies:**

```java
@Service
public class StructuredOutputService {
    @Autowired private LlmService llmService;
    
    // ✅ Strategy 1: Temperature=0 (deterministic, creative tasks fail slightly)
    public Mono<String> deterministicCompletion(String prompt) {
        Map<String, Object> request = Map.of(
            "model", "claude-3-5-sonnet-20241022",
            "temperature", 0,  // Always same output for same input
            "messages", List.of(...)
        );
        return llmService.complete(request);
    }
    
    // ✅ Strategy 2: Structured JSON output (validate against schema)
    public Mono<TransactionClassification> classifyTransaction(String description) {
        String prompt = """
            Classify the transaction. Respond ONLY with valid JSON:
            {"category": "string", "confidence": number (0-1), "risk_level": "LOW|MEDIUM|HIGH"}
            """;
        
        return llmService.complete(prompt)
            .map(response -> {
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    TransactionClassification result = mapper.readValue(
                        response,
                        TransactionClassification.class
                    );
                    
                    // Validate business rules
                    if (result.confidence() < 0.7) {
                        throw new LowConfidenceException("Confidence too low");
                    }
                    
                    return result;
                } catch (JsonProcessingException e) {
                    throw new LlmOutputParsingException("Invalid JSON from LLM", e);
                }
            });
    }
    
    // ✅ Strategy 3: RAG grounding (only answer from verified documents)
    public Mono<String> ragGroundedAnswer(String question) {
        String systemPrompt = """
            Answer ONLY based on the provided context.
            If the answer is not in the context, respond: "I don't have this information."
            Do NOT make up facts or assumptions.
            """;
        
        return llmService.complete(question, systemPrompt);
    }
    
    // ✅ Strategy 4: Multi-turn verification (LLM validates its own answer)
    public Mono<String> verifiedAnswer(String question) {
        return llmService.complete(question)
            .flatMap(initialAnswer -> {
                String verificationPrompt = """
                    Is this answer factual and supported? Answer YES/NO only:
                    %s
                    """.formatted(initialAnswer);
                
                return llmService.complete(verificationPrompt)
                    .map(verification -> {
                        if ("YES".equalsIgnoreCase(verification.trim())) {
                            return initialAnswer;
                        } else {
                            return "[Unverified answer - requires human review]";
                        }
                    });
            });
    }
}

@Data
class TransactionClassification {
    private String category;
    private float confidence;
    private String riskLevel;
    
    @JsonCreator
    public TransactionClassification(
        @JsonProperty("category") String category,
        @JsonProperty("confidence") float confidence,
        @JsonProperty("risk_level") String riskLevel
    ) {
        this.category = category;
        this.confidence = confidence;
        this.riskLevel = riskLevel;
    }
}
```

**Production Checklist:**

```java
public class LlmOutputValidator {
    
    public void validateBankingResponse(String question, String response) {
        // ✅ Check 1: Response addresses the question
        if (!isRelevant(question, response)) {
            throw new IrrelevantResponseException();
        }
        
        // ✅ Check 2: No PII in response
        if (containsPII(response)) {
            throw new PiiLeakException();
        }
        
        // ✅ Check 3: Financial numbers are reasonable
        BigDecimal[] amounts = extractAmounts(response);
        for (BigDecimal amt : amounts) {
            if (amt.compareTo(BigDecimal.valueOf(1_000_000_000)) > 0) {
                throw new UnreasonableAmountException();
            }
        }
        
        // ✅ Check 4: No promises/commitments without approval
        if (containsCommitmentLanguage(response)) {
            escalateToHumanReview(response);
        }
    }
}
```

**Interview tip:**
"Temperature=0 for deterministic outputs. Always validate against business rules. RAG is best for factuality. Never automate consequential decisions—always human-in-the-loop for banking."

---

## Streaming & Cost Optimization

### Q4: Streaming LLM Responses (SSE)

**The simple answer:**
Stream tokens to user as they arrive instead of waiting for full response. Better UX for long responses.

**The problem:**
LLM takes 5-30s to generate response. User sees blank screen → bad experience. Streaming shows progress immediately.

**Server-Sent Events (SSE) Implementation:**

```java
@RestController
@RequestMapping("/api/ai")
public class StreamingLlmController {
    @Autowired private LlmService llmService;
    
    @GetMapping(value = "/stream", produces = "text/event-stream")
    public Flux<ServerSentEvent<String>> streamCompletion(
        @RequestParam String question,
        @RequestHeader(value = "Authorization") String token
    ) {
        return llmService.completeStream(question)
            .map(token -> ServerSentEvent.<String>builder()
                .data(token)
                .id(UUID.randomUUID().toString())
                .event("token")
                .build())
            .doOnError(error -> {
                // Send error event before completing stream
                log.error("Streaming error", error);
            })
            .timeout(Duration.ofSeconds(35));  // SSE timeout
    }
}

@Service
public class StreamingLlmService {
    @Autowired private WebClient webClient;
    
    // Stream tokens as they arrive
    public Flux<String> completeStream(String prompt) {
        return webClient.post()
            .uri("https://api.anthropic.com/v1/messages")
            .header("x-api-key", System.getenv("ANTHROPIC_API_KEY"))
            .bodyValue(Map.of(
                "model", "claude-3-5-sonnet-20241022",
                "stream", true,
                "messages", List.of(Map.of("role", "user", "content", prompt))
            ))
            .retrieve()
            .bodyToFlux(String.class)
            .map(line -> {
                if (line.startsWith("data: ")) {
                    Map<String, Object> event = parseJsonLine(line.substring(6));
                    String delta = (String) event.get("delta");
                    if (delta != null) {
                        return (String) ((Map) event.get("delta")).get("text");
                    }
                }
                return "";
            })
            .filter(token -> !token.isEmpty());
    }
}
```

**Frontend Consumption (JavaScript):**

```javascript
// ✅ Using EventSource API
const eventSource = new EventSource('/api/ai/stream?question=How do I open an account?');

let fullResponse = "";
eventSource.addEventListener('token', (event) => {
    document.getElementById('response').textContent += event.data;
    fullResponse += event.data;
});

eventSource.addEventListener('error', (error) => {
    console.error('Stream error:', error);
    eventSource.close();
});

// Cleanup
eventSource.addEventListener('end', () => {
    eventSource.close();
    logAnalytics(fullResponse);
});
```

**Interview tip:**
"Streaming improves UX for slow operations. SSE for unidirectional (server→client), WebSockets for bidirectional chat. Buffer tokens server-side if needed, flush every 100ms for smooth experience."

---

### Q5: Cost Optimization

**The simple answer:**
Cache responses, use cheaper models for simple tasks, compress prompts. Cache semantics mattersmore than exact string matching.

**Strategies:**

```java
@Service
public class CostOptimizedLlmService {
    
    // Strategy 1: Semantic caching (cache similar questions)
    public Mono<String> completeWithSemanticCache(String question) {
        float[] questionEmbedding = embeddingService.embed(question);
        
        Optional<CachedResponse> cached = semanticCache.findSimilar(
            questionEmbedding,
            threshold = 0.95  // Very similar
        );
        
        if (cached.isPresent()) {
            return Mono.just(cached.get().response());
            // Saved ~$0.01-0.10 per request
        }
        
        return llmService.complete(question)
            .doOnSuccess(response -> {
                semanticCache.store(questionEmbedding, response);
            });
    }
    
    // Strategy 2: Model tiering (route by complexity)
    public Mono<String> tieredComplete(String prompt) {
        TaskComplexity complexity = analyzeComplexity(prompt);
        
        return switch(complexity) {
            case SIMPLE -> cheapModel.complete(prompt);      // Claude Haiku (~$0.00008/1K tokens)
            case MODERATE -> mediumModel.complete(prompt);    // Claude Sonnet (~$0.003/1K tokens)
            case COMPLEX -> expensiveModel.complete(prompt);  // Using cheap model saves 90% here
        };
    }
    
    // Strategy 3: Prompt compression (remove noise)
    private String compressPrompt(String prompt) {
        // Remove repeated instructions
        // Compress whitespace
        // Summarize context
        // Reduce from 5000 tokens to 2000 = 60% cost reduction
        return compress(prompt);
    }
    
    // Strategy 4: Batch processing (50% discount)
    public List<String> batchProcess(List<String> prompts) {
        return client.createBatchRequest()
            .addRequests(prompts.stream()
                .map(p -> batchItem(p))
                .collect(toList())
            )
            .submitAndWait()  // Wait for async completion
            .getResults();
        // Use for non-real-time: reports, analytics, bulk classification
    }
}

@Configuration
public class LlmCostMonitoring {
    
    @Bean
    public MeterRegistry meterRegistry() {
        MeterRegistry registry = new SimpleMeterRegistry();
        
        Gate.builder("llm.tokens.input")
            .description("Input tokens to LLM")
            .register(registry);
        
        Gauge.builder("llm.costs.daily", () -> costTracker.getDailyCost())
            .description("Daily LLM costs in USD")
            .register(registry);
        
        return registry;
    }
    
    @Bean
    public LlmCostAlert costAlert() {
        return new LlmCostAlert(dailyBudget = 100);  // Alert if daily >$100
    }
}
```

**Interview tip:**
"Semantic cache saves 60-80% vs request caching. Model tiering: 90% simple tasks → Haiku. Monitor token usage & costs daily. Set per-user quotas."

---

## Banking-Specific AI Applications

### Q6: AI-Driven Document Processing (Contracts, Invoices)

**The simple answer:**
Automatically parse, classify, extract, and summarize documents. LLM handles OCR, entities, and summarization in one pipeline.

**Use Cases:**
- Contract risk assessment
- Invoice verification & duplicate detection
- Mortgage application processing
- KYC document validation
- Statement analysis

**Architecture:**

```java
@Service
public class DocumentProcessingPipeline {
    @Autowired private StorageService storageService;
    @Autowired private DocumentClassifier classifier;
    @Autowired private FieldExtractor extractor;
    @Autowired private LlmService llmService;
    @Autowired private AuditService auditService;
    
    // Async, event-driven processing
    @Async
    public void processDocument(String documentId, String filePath, String userId) {
        try {
            // 1. Parse document (text, tables, structured data)
            DocumentContent content = storageService.parseDocument(filePath);
            
            // 2. Classify document type
            DocumentType type = classifier.classify(content);
            
            // 3. Extract structured fields using LLM
            Map<String, Object> extracted = extractFields(content, type);
            
            // 4. Summarize key points
            String summary = llmService.completeBlocking(
                "Summarize this document in 3 sentences: " + content.getText()
            );
            
            // 5. Risk assessment
            DocumentRisk riskAssessment = assessRisk(extracted, content);
            
            // 6. Persist results
            documentRepository.save(new ProcessedDocument(
                documentId: documentId,
                type: type,
                extractedFields: extracted,
                summary: summary,
                riskLevel: riskAssessment.level,
                requiresReview: riskAssessment.requiresHumanReview
            ));
            
            // 7. Notify user
            notificationService.sendDocumentProcessed(userId, documentId, riskAssessment);
            
            // 8. Log for compliance
            auditService.logDocumentProcessing(userId, documentId, extracted);
            
        } catch (Exception e) {
            log.error("Document processing failed: {}", documentId, e);
            escalateToSupport(userId, documentId, e);
        }
    }
    
    private Map<String, Object> extractFields(DocumentContent content, DocumentType type) {
        String extractionPrompt = switch(type) {
            case CONTRACT -> contractExtractionPrompt(content);
            case INVOICE -> invoiceExtractionPrompt(content);
            case KYC_DOCUMENT -> kycExtractionPrompt(content);
            default -> genericExtractionPrompt(content);
        };
        
        String jsonResponse = llmService.completeBlocking(extractionPrompt);
        return parseJson(jsonResponse);
    }
    
    private DocumentRisk assessRisk(Map<String, Object> extracted, DocumentContent content) {
        // Check against known fraud patterns
        if (isLikelyForgery(content)) {
            return new DocumentRisk(HIGH, true);
        }
        
        // Check for missing required fields
        if (isMissingCriticalFields(extracted)) {
            return new DocumentRisk(MEDIUM, true);
        }
        
        // Check for compliance violations
        if (violatesRegulations(extracted)) {
            return new DocumentRisk(HIGH, true);
        }
        
        return new DocumentRisk(LOW, false);
    }
}

@Configuration
public class DocumentProcessingConfig {
    
    @Bean
    public DocumentClassifier documentClassifier(LlmService llmService) {
        return new LlmDocumentClassifier(llmService);
    }
    
    @Bean
    @Scope("prototype")
    public TaskExecutor documentProcessingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);
        executor.setMaxPoolSize(50);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("doc-processing-");
        executor.initialize();
        return executor;
    }
}
```

**Prompt Templates for Banking:**

```java
public class BankingPromptTemplates {
    
    public static String contractRiskAssessment(String contractText) {
        return """
            Analyze this contract for banking risks. Return JSON:
            {
                "parties": ["party1", "party2"],
                "amount": number,
                "terms": "summary",
                "risks": ["risk1", "risk2"],
                "red_flags": ["flag1"],
                "recommendation": "APPROVE|REVIEW|REJECT"
            }
            
            Contract:
            %s
            """.formatted(contractText);
    }
    
    public static String invoiceVerification(String invoiceText) {
        return """
            Verify and extract invoice data. Return JSON:
            {
                "vendor": "name",
                "invoice_number": "string",
                "amount": number,
                "due_date": "YYYY-MM-DD",
                "line_items": [{"description": "string", "amount": number}],
                "anomalies": ["duplicate vendor", "unusual amount"],
                "fraud_score": 0-100
            }
            
            Invoice:
            %s
            """.formatted(invoiceText);
    }
}
```

**Interview tip:**
"Document processing is high-ROI for banking. Combine OCR + LLM for extraction. Always have human review for high-risk items. Log every decision for regulatory compliance."

---

## Summary Interview Checklist

- [ ] **LLM Integration**: Async/reactive, rate limiting, timeout handling, retries
- [ ] **RAG Architecture**: Chunking strategy, vector DB, reranking, metadata filtering
- [ ] **Determinism**: temperature=0, structured output, validation against schemas
- [ ] **Hallucination Mitigation**: RAG grounding, source attribution, human review
- [ ] **Streaming**: SSE for progressive UI, token-by-token delivery
- [ ] **Cost Optimization**: Semantic caching (60-80% savings), model tiering, compression
- [ ] **Structured Output**: JSON mode, schema validation, error handling
- [ ] **Error Handling**: Timeouts, fallbacks, comprehensive logging
- [ ] **PII/Privacy**: Data sanitization, audit logging, consent tracking
- [ ] **Compliance**: All AI decisions logged, explainability required
- [ ] **Performance**: P99 < 30s for real-time, batch processing for non-urgent
- [ ] **Banking Applications**: Contract analysis, fraud detection, document processing, risk assessment

---

## Banking AI Applications

| Application | Pattern | ROI | Complexity |
|-------------|---------|-----|-----------|
| **Fraud Detection** | Classification + thresholds | High (prevents losses) | Medium |
| **Document Processing** | Extraction + validation | High (labor savings) | High |
| **Risk Assessment** | Structured analysis + reasoning | High (regulatory) | Medium |
| **Customer Support** | RAG + multi-turn chat | Medium (efficiency) | Medium |
| **Compliance Checking** | Rule engine + LLM reasoning | High (regulatory) | Medium |
| **Contract Analysis** | RAG + risk extraction | High (time savings) | High |
| **Recommendation Engine** | Embeddings + similarity | Medium (engagement) | Low |
