---
name: Hybrid Search Architect
description: Designs a hybrid retrieval pipeline combining dense vector search and BM25 sparse search with reciprocal rank fusion, and explains when to use each configuration.
category: coding
tags:
  - rag
  - hybrid-search
  - bm25
  - vector-search
  - retrieval
author: simplyutils
---

# Hybrid Search Architect

## What this skill does

This skill designs a hybrid search pipeline that combines dense vector search (semantic similarity) with BM25 sparse search (keyword matching). Hybrid search outperforms either method alone on most retrieval benchmarks because vector search handles semantic meaning while BM25 handles exact keyword matches, product names, codes, and rare terms. This skill picks the right combination and fusion strategy for your use case.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/hybrid-search-architect/SKILL.md` in your project root.

Then ask:
- *"Use the Hybrid Search Architect to improve our RAG pipeline's retrieval."*
- *"Design a hybrid search system for our product documentation."*

Provide:
- What you're searching (type of documents)
- What queries look like (keywords, natural language, codes/IDs)
- Your current search stack (Pinecone, Weaviate, Elasticsearch, pgvector, etc.)
- Latency requirements

### Cursor / Codex

Describe your current retrieval setup and query patterns alongside these instructions.

## The Prompt / Instructions for the Agent

### Step 1 — Determine if hybrid search is needed

| Query pattern | Pure vector | Pure BM25 | Hybrid |
|---|---|---|---|
| Natural language questions | ✓ | — | ✓ |
| Exact product names / SKUs | — | ✓ | ✓ |
| Technical codes / IDs | — | ✓ | ✓ |
| Conceptual / semantic | ✓ | — | ✓ |
| Mixed (most real-world) | — | — | ✓ |

**Use hybrid search when:** queries are mixed (some keyword, some semantic), documents contain both prose and structured data, or pure vector search misses obvious keyword matches.

### Step 2 — Choose a stack

**Option A: Weaviate (easiest hybrid, built-in)**
```python
# pip install weaviate-client
import weaviate
from weaviate.classes.query import HybridFusion

client = weaviate.connect_to_local()
collection = client.collections.get("Documents")

results = collection.query.hybrid(
    query="payment processing error",
    fusion_type=HybridFusion.RELATIVE_SCORE,  # or RANKED
    alpha=0.5,   # 0 = pure BM25, 1 = pure vector, 0.5 = balanced
    limit=10,
    return_metadata=["score", "explain_score"]
)
```

**Option B: Elasticsearch / OpenSearch (production-grade)**
```python
from elasticsearch import Elasticsearch

es = Elasticsearch("http://localhost:9200")

query = {
    "query": {
        "bool": {
            "should": [
                # BM25 component
                {"match": {"content": {"query": user_query, "boost": 1.0}}},
                # Dense vector component (kNN)
                {"knn": {
                    "field": "embedding",
                    "query_vector": get_embedding(user_query),
                    "num_candidates": 100,
                    "boost": 1.0
                }}
            ]
        }
    },
    "size": 10
}
results = es.search(index="documents", body=query)
```

**Option C: pgvector + custom BM25 (for PostgreSQL users)**
```python
# pip install pgvector psycopg2
# Run both queries, then fuse results

async def hybrid_search(query: str, k: int = 10) -> list[dict]:
    embedding = await get_embedding(query)

    # Dense search
    vector_results = await db.fetch("""
        SELECT id, content, 1 - (embedding <=> $1::vector) as score
        FROM documents
        ORDER BY embedding <=> $1::vector
        LIMIT $2
    """, embedding, k * 2)

    # Sparse search (tsvector full-text search)
    bm25_results = await db.fetch("""
        SELECT id, content, ts_rank(to_tsvector('english', content), plainto_tsquery($1)) as score
        FROM documents
        WHERE to_tsvector('english', content) @@ plainto_tsquery($1)
        ORDER BY score DESC
        LIMIT $2
    """, query, k * 2)

    return reciprocal_rank_fusion(vector_results, bm25_results, k=k)
```

### Step 3 — Implement Reciprocal Rank Fusion (RRF)

RRF is the standard way to combine results from multiple ranked lists. It's simple, effective, and doesn't require tuning score scales:

```python
def reciprocal_rank_fusion(
    *ranked_lists: list[dict],
    k: int = 60,
    top_n: int = 10
) -> list[dict]:
    """
    Combine multiple ranked result lists using Reciprocal Rank Fusion.
    k=60 is the standard constant (from the original RRF paper).
    """
    scores: dict[str, float] = {}
    docs: dict[str, dict] = {}

    for ranked_list in ranked_lists:
        for rank, doc in enumerate(ranked_list, start=1):
            doc_id = doc["id"]
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
            docs[doc_id] = doc

    sorted_ids = sorted(scores, key=lambda x: scores[x], reverse=True)
    return [docs[doc_id] for doc_id in sorted_ids[:top_n]]
```

### Step 4 — Tune the alpha parameter

If your backend supports an alpha/weight parameter:

| Use case | Alpha (vector weight) |
|---|---|
| Technical docs with many exact terms | 0.3 |
| General knowledge / FAQ | 0.5 |
| Semantic / conceptual search | 0.7 |
| Code search | 0.4 |
| Mixed content (default) | 0.5 |

Test with your actual query distribution — sample 50 real queries and compare precision at k=5 across alpha values.

### Step 5 — Add a reranker (optional but high-impact)

After hybrid retrieval, a cross-encoder reranker re-scores the top results with full query-document attention. This is the single highest-impact quality improvement after hybrid search:

```python
# pip install sentence-transformers
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(query: str, results: list[dict], top_n: int = 5) -> list[dict]:
    """Re-rank results using a cross-encoder. Retrieve wide, rerank narrow."""
    pairs = [(query, r["content"]) for r in results]
    scores = reranker.predict(pairs)

    ranked = sorted(zip(results, scores), key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in ranked[:top_n]]

# Usage: retrieve top 20 via hybrid, rerank to top 5
candidates = hybrid_search(query, k=20)
final_results = rerank(query, candidates, top_n=5)
```

### Step 6 — Evaluation

Measure retrieval quality with Recall@K and Mean Reciprocal Rank:

```python
def recall_at_k(relevant_ids: set, retrieved_ids: list[str], k: int) -> float:
    return len(relevant_ids & set(retrieved_ids[:k])) / len(relevant_ids)

def mrr(relevant_ids: set, retrieved_ids: list[str]) -> float:
    for rank, doc_id in enumerate(retrieved_ids, 1):
        if doc_id in relevant_ids:
            return 1 / rank
    return 0.0
```

Benchmark: run 50 labeled queries, compare Recall@5 for pure vector vs. pure BM25 vs. hybrid. Hybrid should outperform both by 10–25% on mixed query sets.
