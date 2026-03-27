---
name: LLM Tracing and Observability Setup
description: Configures end-to-end tracing for an LLM application using OpenTelemetry with LangSmith, Langfuse, or Helicone — span naming, metadata tagging, latency thresholds, and cost tracking.
category: devops
tags:
  - llm-ops
  - observability
  - tracing
  - langsmith
  - langfuse
author: simplyutils
---

# LLM Tracing and Observability Setup

## What this skill does

This skill sets up production-grade observability for LLM applications. Without tracing, debugging a broken LLM pipeline means guessing — you can't see what prompt was sent, what the model returned, which tool call failed, or why latency spiked. This skill configures the right tracing layer for your stack and shows what to instrument.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/llm-tracing-setup/SKILL.md` in your project root.

Then ask:
- *"Use the LLM Tracing Setup skill to add observability to our LangChain app."*
- *"Set up Langfuse tracing for our OpenAI API calls."*

Provide:
- LLM framework in use (LangChain, direct API, LlamaIndex, custom)
- Preferred tracing backend (LangSmith, Langfuse, Helicone, or open to suggestions)
- Language (Python or TypeScript)
- Whether you need cost tracking, latency alerting, or user feedback collection

### Cursor / Codex

Paste your LLM call code alongside these instructions and specify the tracing backend.

## The Prompt / Instructions for the Agent

### Step 1 — Choose a tracing backend

| Backend | Best for | Cost model |
|---|---|---|
| **LangSmith** | LangChain / LangGraph apps | Free tier + usage |
| **Langfuse** | Any LLM stack, self-hostable | Free tier + open source |
| **Helicone** | OpenAI / Anthropic direct API | Per-request fee |
| **OpenTelemetry + Jaeger** | Full control, existing OTel infra | Self-hosted |
| **Braintrust** | Eval-heavy teams, prompt versioning | Per-event |

**Recommendation:** Langfuse for most teams — framework-agnostic, self-hostable, free tier generous, good UI.

### Step 2a — Langfuse setup (any stack)

```python
# pip install langfuse
import os
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

os.environ["LANGFUSE_PUBLIC_KEY"] = "pk-lf-..."
os.environ["LANGFUSE_SECRET_KEY"] = "sk-lf-..."
os.environ["LANGFUSE_HOST"] = "https://cloud.langfuse.com"

langfuse = Langfuse()

# Decorate any function that calls an LLM
@observe()
def generate_response(user_query: str) -> str:
    # Automatically traces: input, output, latency, model
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": user_query}]
    )
    return response.choices[0].message.content

# Add custom metadata
@observe()
def process_document(doc_id: str, query: str) -> str:
    langfuse_context.update_current_observation(
        metadata={"doc_id": doc_id, "pipeline_version": "v2.1"},
        tags=["document-qa", "production"]
    )
    return generate_response(query)
```

**For LangChain integration:**
```python
from langfuse.callback import CallbackHandler

handler = CallbackHandler()

# Pass to any LangChain chain or agent
chain.invoke({"query": user_input}, config={"callbacks": [handler]})
```

### Step 2b — LangSmith setup (LangChain / LangGraph)

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "ls__..."
os.environ["LANGCHAIN_PROJECT"] = "my-project-prod"

# That's it — all LangChain calls are automatically traced
# For LangGraph, same env vars apply
```

Add metadata to traces:
```python
from langchain_core.tracers.context import tracing_v2_enabled

with tracing_v2_enabled(tags=["user_type:premium", "feature:search"]):
    result = chain.invoke(user_input)
```

### Step 2c — Helicone setup (direct OpenAI / Anthropic API)

```python
# No SDK needed — just change the base URL
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["OPENAI_API_KEY"],
    base_url="https://oai.helicone.ai/v1",
    default_headers={
        "Helicone-Auth": f"Bearer {os.environ['HELICONE_API_KEY']}",
        "Helicone-Property-UserId": user_id,       # custom metadata
        "Helicone-Property-Feature": "document-qa"
    }
)
# All calls now traced automatically
```

### Step 3 — What to instrument

**Always trace:**
- Every LLM call: model, prompt, response, latency, token count
- Tool calls: tool name, input, output, duration
- Retrieval steps: query, top-K results, reranking scores

**Add custom spans for:**
```python
# Manual span for non-LLM operations
with langfuse.start_as_current_span("document-retrieval") as span:
    span.update(metadata={"query": query, "index": "prod-v2"})
    results = vector_store.search(query)
    span.update(metadata={"results_count": len(results)})
```

**Tag every trace with:**
- `user_id` or session ID (for debugging user-reported issues)
- `environment`: production / staging
- `pipeline_version`: lets you compare v1 vs v2 side-by-side
- `feature` or `use_case`: document-qa, chatbot, summarization

### Step 4 — Key metrics to monitor

| Metric | Alert threshold | How to track |
|---|---|---|
| p95 LLM latency | > 8 seconds | Langfuse latency histogram |
| Error rate | > 2% | Langfuse error traces |
| Cost per request | > $0.05 | Token count × model price |
| Cache hit rate | < 20% | Custom metadata tag |
| LLM-as-judge score | < 3.5/5 | Langfuse scores API |

### Step 5 — Collecting user feedback

Connect real user feedback to traces to build an eval dataset:

```python
# After the user rates a response
def record_feedback(trace_id: str, score: int, comment: str):
    langfuse.score(
        trace_id=trace_id,
        name="user_rating",
        value=score,          # 1-5
        comment=comment
    )
```

Traces with low scores become your eval regression dataset automatically.

### Step 6 — Production readiness checklist

- [ ] All LLM calls traced with model, latency, and token counts
- [ ] User/session ID attached to every trace
- [ ] Environment tag (prod/staging) on all traces
- [ ] Latency alert set for p95 > 8s
- [ ] Error rate alert set for > 2%
- [ ] Cost dashboard showing daily spend by feature
- [ ] User feedback collection wired to trace IDs
- [ ] Sampling configured for high-volume apps (trace 10% in prod, 100% in staging)
