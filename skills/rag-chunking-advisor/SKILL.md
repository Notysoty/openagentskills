---
name: RAG Chunking Strategy Advisor
description: Given a document type and retrieval goal, recommends the optimal chunking strategy for a RAG pipeline to minimize retrieval failures.
category: coding
tags:
  - rag
  - chunking
  - retrieval
  - embeddings
  - vector-search
author: simplyutils
---

# RAG Chunking Strategy Advisor

## What this skill does

This skill analyzes your document types, content structure, and retrieval goals to recommend the right chunking strategy for your RAG pipeline. Poor chunking is the #1 cause of RAG failures — chunks too large lose precision, chunks too small lose context. This skill picks the right strategy and explains exactly how to implement it.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/rag-chunking-advisor/SKILL.md` in your project root.

Then ask:
- *"Use the RAG Chunking Strategy Advisor to help me chunk our legal contract PDFs."*
- *"What chunking strategy should I use for markdown documentation with code blocks?"*

Provide:
- Document type (PDFs, markdown, HTML, code, emails, etc.)
- Typical document length
- What users will search for (questions, keywords, concepts)
- Your embedding model if known

### Cursor / Codex

Paste the instructions below along with your document type and retrieval use case.

## The Prompt / Instructions for the Agent

When asked to advise on RAG chunking, follow these steps:

### Step 1 — Identify document characteristics

Ask or infer:
- **Document type**: structured (tables, headers) vs. unstructured (prose) vs. code
- **Length**: short (< 1 page), medium (1–20 pages), long (20+ pages)
- **Internal structure**: does it have headers, sections, numbered lists, code blocks?
- **Query type**: factual lookups, conceptual questions, code search, or multi-hop reasoning?

### Step 2 — Select the primary chunking strategy

| Document Type | Recommended Strategy | Chunk Size |
|---|---|---|
| Prose (articles, books) | Sentence-window or recursive character | 512–1024 tokens |
| Structured docs (markdown, HTML) | Header-based (split on H2/H3) | Full section |
| PDFs with mixed content | Semantic chunking + page boundary | 512 tokens |
| Source code | Function/class boundary splitting | Full function |
| Tables / spreadsheets | Row-level or table-level | 1 row or full table |
| Emails / short messages | Document-level (no chunking) | Full doc |
| Legal / contracts | Clause-level splitting | 256–512 tokens |

**Strategies explained:**

- **Fixed-size with overlap** — Split every N tokens with a 10–20% overlap. Fast, simple, works for uniform prose. Use `chunk_size=512, overlap=50`.
- **Recursive character splitting** — Split on `\n\n`, then `\n`, then `.`, then ` `. Preserves paragraph structure. Best default for general text.
- **Header-based (Markdown/HTML)** — Split on heading tags (H1/H2/H3). Each section becomes a chunk with its heading prepended. Best for docs sites and wikis.
- **Semantic chunking** — Use an embedding model to detect topic shifts; split when cosine similarity drops. Best quality, highest cost. Use when documents have abrupt topic changes.
- **Sentence-window** — Store sentences as chunks but retrieve surrounding N sentences for context. Good for Q&A over dense technical content.
- **Function-level (code)** — Use AST parsing to split on function/class boundaries. Never split mid-function.

### Step 3 — Configure chunk metadata

Every chunk must carry metadata for filtering and re-ranking:

```python
{
  "chunk_id": "doc_001_chunk_004",
  "source": "contracts/nda-2024.pdf",
  "page": 3,
  "section": "Confidentiality Obligations",
  "doc_type": "legal",
  "created_at": "2024-11-01"
}
```

Always store: `source`, `page_or_line`, `section_heading` (if available), `doc_type`.

### Step 4 — Add a parent-child chunk structure (for complex docs)

For long structured documents, use a two-level hierarchy:
- **Parent chunks** (1024–2048 tokens): stored for context retrieval
- **Child chunks** (128–256 tokens): used for embedding and search

Retrieve by child similarity, return parent for context. This avoids the precision vs. context tradeoff.

```python
# LlamaIndex example
from llama_index.node_parser import HierarchicalNodeParser
parser = HierarchicalNodeParser.from_defaults(chunk_sizes=[2048, 512, 128])
```

### Step 5 — Validate with retrieval testing

Before deploying, run this checklist:
- [ ] Sample 20 real user queries against your chunked index
- [ ] Check if the correct chunk appears in top-3 results
- [ ] Verify chunk boundaries don't cut mid-sentence or mid-table
- [ ] Ensure no chunk is under 50 tokens (too small = noise)
- [ ] Ensure no chunk is over 2048 tokens (too large = diluted embedding)

### Common chunking mistakes to flag

- **Splitting tables row-by-row** when the header row is in a different chunk — always keep headers with data rows
- **Not adding overlap** on fixed-size splits — 10% overlap prevents losing context at boundaries
- **Chunking code by line count** instead of by function — always use AST-aware splitting for code
- **Ignoring document structure** — a 500-token chunk that spans two unrelated sections is worse than two 250-token single-topic chunks

## Example

**Input:**
> "Use the RAG Chunking Advisor. I'm building a support chatbot. Documents are markdown product docs, 5–30 pages each, with H2 and H3 headers. Users ask specific how-to questions."

**Output:**
> **Recommended strategy: Header-based chunking**
>
> Split on H2 headers as primary boundaries, H3 as secondary. Each chunk = one section, with its full heading path prepended (`Product > Installation > macOS Setup`).
>
> Config:
> ```python
> from langchain.text_splitter import MarkdownHeaderTextSplitter
> splitter = MarkdownHeaderTextSplitter(
>     headers_to_split_on=[("##", "section"), ("###", "subsection")]
> )
> ```
>
> Add metadata: `{"source": filename, "section": heading_path, "doc_type": "product_docs"}`
>
> If sections exceed 800 tokens, apply a secondary recursive split with `chunk_size=600, overlap=60`.
>
> Validate: run your top 20 support questions against the index and confirm the relevant section appears in top-3.
