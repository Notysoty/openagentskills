---
name: RAG Workflow Planner
description: Designs a complete Retrieval-Augmented Generation (RAG) pipeline for a given use case, including chunking strategy, embedding model selection, and retrieval approach.
category: research
tags:
  - rag
  - llm
  - ai
  - embeddings
  - vector-database
author: simplyutils
---

# RAG Workflow Planner

## What this skill does

This skill walks through your RAG use case requirements and designs a complete, production-ready Retrieval-Augmented Generation pipeline. It recommends a chunking strategy, embedding model, vector store, retrieval approach, and reranking strategy — each choice justified against your specific requirements. The output includes an ASCII architecture diagram, a component-by-component breakdown, and a starter code outline.

Use this when you're starting a new RAG project or when an existing RAG pipeline is producing poor retrieval quality and you want a systematic redesign.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/rag-workflow-planner/SKILL.md` in your project root.

Then describe your use case and ask:
- *"Use the RAG Workflow Planner skill to design a pipeline for our customer support chatbot."*
- *"Plan a RAG architecture for our internal knowledge base search using the RAG Workflow Planner skill."*

The more detail you provide about document types, query patterns, and latency requirements, the more precise the output.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Describe your RAG use case in the chat.

### Codex

Describe your use case and answer the requirements questions in the instructions below, then include the full instructions. Codex will produce the architecture design.

## The Prompt / Instructions for the Agent

When asked to design a RAG pipeline, follow these steps:

1. **Gather requirements.** If not provided, ask for:
   - **Document types:** PDFs, HTML pages, markdown files, database records, code files, emails, etc.
   - **Corpus size:** A few dozen documents, thousands, millions?
   - **Query types:** Short factual questions? Multi-step reasoning queries? Semantic search? Code search?
   - **Latency requirements:** Real-time chat (< 2 seconds) or batch/async?
   - **Freshness requirements:** Static documents, or does the corpus update frequently?
   - **Language:** English only, or multilingual?
   - **Budget constraints:** Self-hosted vs. managed APIs?
   - **Existing tech stack:** Are there database or cloud provider preferences?

2. **Recommend a chunking strategy** and justify it:

   - **Fixed-size chunking** (e.g., 512 tokens with 10% overlap): Simple, works well for uniform documents. Use when documents are homogeneous and queries are short.
   - **Semantic chunking** (split on paragraph/section boundaries): Better for mixed-length documents. Use when document structure is meaningful (articles, reports).
   - **Hierarchical chunking** (parent document + child chunks): Best for long documents where you need both precise retrieval and wide context. Retrieve small chunks, send parent to LLM.
   - **Sentence-window chunking**: Embed individual sentences, retrieve with surrounding context window. Best for dense technical content.
   - **Document-level chunking** (no splitting): Only for very short documents (emails, product descriptions < 500 tokens).

   Specify: chunk size (tokens), overlap, splitting boundaries, and any pre-processing needed (strip headers/footers, extract tables separately).

3. **Recommend an embedding model** and justify it:

   - **OpenAI text-embedding-3-small**: Best cost/performance for English, managed API, 1536 dims
   - **OpenAI text-embedding-3-large**: Higher accuracy for complex semantic tasks, 3072 dims
   - **Cohere embed-v3**: Strong multilingual support, late interaction model
   - **sentence-transformers/all-MiniLM-L6-v2**: Fast, free, self-hosted, good for English at small scale
   - **BAAI/bge-m3**: Best self-hosted option, multilingual, hybrid dense/sparse
   - **Voyage AI**: Strong for code retrieval and long-context documents
   - For code: use a code-specific model (Voyage Code 2, CodeBERT)

4. **Recommend a vector store** and justify it:

   - **Pinecone**: Managed, easy setup, good for production at scale
   - **Weaviate**: Managed or self-hosted, supports hybrid search natively
   - **Qdrant**: Self-hosted, fast, excellent filtering, Rust-based
   - **pgvector**: Use when already on PostgreSQL, avoids new infrastructure
   - **Chroma**: Great for prototyping and small-scale local use
   - **Milvus**: Enterprise-scale self-hosted option

5. **Design the retrieval strategy:**

   - **Dense retrieval only**: Cosine/dot-product similarity on embeddings. Simple, works for semantic queries.
   - **Sparse retrieval only (BM25/TF-IDF)**: Better for exact keyword matching. Use for code search or domain-specific jargon.
   - **Hybrid retrieval**: Combine dense + sparse scores (Reciprocal Rank Fusion or linear combination). Best for most production use cases.
   - **Reranking**: Add a cross-encoder reranker (Cohere Rerank, BGE Reranker) after initial retrieval for better precision. Add when top-k retrieval quality is insufficient.
   - **Contextual compression**: Pass retrieved chunks through an LLM to extract only the relevant sentence before sending to final LLM. Reduces noise in context.
   - Specify: `top_k` for initial retrieval, `top_n` after reranking.

6. **Design the generation step:**
   - System prompt structure for grounded answers
   - How to handle "no relevant documents found"
   - Whether to include source citations in the output
   - Context window budget (how many chunks fit in the LLM context)

7. **Identify risks and mitigations:**
   - Stale data: embedding refresh strategy
   - Hallucination: grounding instructions + citation requirements
   - Retrieval misses: query expansion or HyDE (Hypothetical Document Embeddings)

8. **Output the architecture design** in this format:

```
## RAG Architecture for [Use Case]

### Requirements Summary
[Brief recap of gathered requirements]

### Architecture Diagram

[ASCII diagram showing: Documents → Ingestion Pipeline → Vector Store ← Query → Retrieval → Reranker → LLM → Response]

### Component Breakdown

| Component | Recommendation | Justification |
|-----------|---------------|---------------|
| Chunking | ... | ... |
| Embedding Model | ... | ... |
| Vector Store | ... | ... |
| Retrieval Strategy | ... | ... |
| Reranker | ... | ... |
| LLM | ... | ... |

### Ingestion Pipeline
[Step-by-step: load → clean → chunk → embed → store]

### Query Pipeline
[Step-by-step: receive query → embed → retrieve → rerank → prompt → generate → return]

### Starter Code Outline
[Pseudocode or skeleton showing the main pipeline in Python or TypeScript]

### Risks and Mitigations
[Key risks with mitigation strategies]
```

## Example

**Input to Agent:**
> "Use the RAG Workflow Planner skill. I'm building a chatbot that answers questions about our company's internal policy documents. We have about 200 PDFs, mostly 5–20 pages each. Queries will be short questions like 'What is the vacation policy?' or 'How do I expense international travel?' Response time under 3 seconds. We're on AWS, prefer managed services where possible."

**Output from Agent:**
> ## RAG Architecture for Internal Policy Q&A Chatbot
>
> ### Requirements Summary
> - 200 PDFs, 5–20 pages each (~500 total pages)
> - Short factual English queries
> - < 3 second latency
> - AWS, prefer managed services
> - Static corpus with occasional updates
>
> ### Architecture Diagram
>
> ```
> [PDF Files]
>      │
>      ▼
> [PDF Parser + Text Cleaner]
>      │
>      ▼
> [Semantic Chunker] ──── ~500 token chunks, paragraph boundaries
>      │
>      ▼
> [OpenAI text-embedding-3-small]
>      │
>      ▼
> [Pinecone Index] ◄──────────────────────────────────┐
>                                                      │
> [User Query] ──► [Embed Query] ──► [Top-20 Retrieve] ──► [Cohere Rerank top-5] ──► [GPT-4o] ──► [Answer + Sources]
> ```
>
> ### Component Breakdown
>
> | Component | Recommendation | Justification |
> |-----------|---------------|---------------|
> | Chunking | Semantic (paragraph boundaries, ~500 tokens, 50 token overlap) | Policy docs have clear paragraph structure; semantic chunks preserve policy context |
> | Embedding | OpenAI text-embedding-3-small | Best accuracy/cost for English, managed, no infra |
> | Vector Store | Pinecone Serverless | AWS-native, managed, scales to this corpus size cheaply |
> | Retrieval | Dense (cosine similarity), top-20 | Semantic queries match well; 200 docs don't need hybrid |
> | Reranker | Cohere Rerank v3, top-5 | Improves precision significantly for policy Q&A; < 300ms added latency |
> | LLM | GPT-4o or Claude 3 Haiku | Haiku for speed, GPT-4o for complex multi-policy questions |
>
> ### Ingestion Pipeline
> 1. Load PDF → extract text with `pdfplumber` or AWS Textract (for scanned PDFs)
> 2. Clean: strip page numbers, headers, footers
> 3. Split on paragraph boundaries; merge short paragraphs until ~500 tokens
> 4. Embed each chunk with `text-embedding-3-small`
> 5. Store in Pinecone with metadata: `{ doc_name, page_range, last_updated }`
>
> ### Query Pipeline
> 1. Receive user query
> 2. Embed with `text-embedding-3-small`
> 3. Retrieve top-20 chunks from Pinecone
> 4. Rerank with Cohere Rerank → keep top-5
> 5. Build prompt: system instructions + top-5 chunks as context + user question
> 6. Call LLM; instruct it to cite the source document name
> 7. Return answer + source list
>
> ### Risks and Mitigations
> - **Stale documents:** Re-embed changed PDFs on upload; store `last_updated` in metadata and filter stale chunks if needed
> - **Hallucination:** System prompt: "Answer only from the provided context. If the answer is not in the documents, say so."
> - **Low retrieval recall:** If reranker still misses answers, add query expansion: generate 3 query variants with the LLM before retrieval
