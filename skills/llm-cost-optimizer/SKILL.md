---
name: LLM Cost Optimizer
description: Audits an AI application for unnecessary token spend and recommends prompt caching, model routing, and token reduction techniques to cut costs.
category: devops
tags:
  - llm-ops
  - cost-optimization
  - prompt-caching
  - model-routing
  - tokens
author: simplyutils
---

# LLM Cost Optimizer

## What this skill does

This skill audits an LLM application's prompts, call patterns, and model selection to identify cost reduction opportunities. It covers prompt caching, model routing (right-sizing), token reduction, batching, and output length control — the techniques that typically cut LLM costs by 40–80% without sacrificing quality.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/llm-cost-optimizer/SKILL.md` in your project root.

Then ask:
- *"Use the LLM Cost Optimizer to audit our AI application."*
- *"How can I reduce our OpenAI API costs? Here are our prompts..."*

Provide:
- Your system prompt(s)
- Approximate daily call volume
- Which model(s) you're using
- Typical input/output token counts if known
- Whether calls are real-time (low latency required) or batch (latency tolerant)

### Cursor / Codex

Paste your prompts, call patterns, and current monthly spend alongside these instructions.

## The Prompt / Instructions for the Agent

When asked to optimize LLM costs, audit the following areas in order of typical savings impact:

### Audit 1 — Prompt Caching (savings: 50–90% on repeated prefixes)

**Check:** Does the system prompt stay the same across calls?

If yes, enable prompt caching. The system prompt is sent once and cached — subsequent calls only pay for the new user tokens.

```python
# Anthropic Claude — cache_control on system prompt
response = client.messages.create(
    model="claude-opus-4-6",
    system=[{
        "type": "text",
        "text": your_system_prompt,
        "cache_control": {"type": "ephemeral"}  # cached for 5 minutes
    }],
    messages=[{"role": "user", "content": user_message}]
)

# OpenAI — automatic prompt caching for prompts > 1024 tokens
# No code change needed — cached automatically, check usage.prompt_tokens_details.cached_tokens
```

**When it applies:** Any app where the system prompt is > 1024 tokens and reused across calls. Support bots, coding assistants, document analyzers.

**Savings estimate:** If system prompt = 2000 tokens, 10,000 calls/day → saves ~20M tokens/day in input costs.

### Audit 2 — Model Right-Sizing (savings: 60–90% on over-specified models)

**Check:** Are you using a frontier model (GPT-4o, Claude Opus) for tasks that a smaller model handles just as well?

| Task | Recommended Model |
|---|---|
| Classification, routing, yes/no decisions | GPT-4o-mini, Claude Haiku |
| Summarization, extraction, translation | GPT-4o-mini, Claude Sonnet |
| Complex reasoning, code generation | GPT-4o, Claude Sonnet |
| Novel research, multi-step agent planning | Claude Opus, o1 |

**Implement a model router:**
```python
def route_model(task_type: str, complexity: str) -> str:
    if task_type in ("classify", "extract", "translate"):
        return "claude-haiku-4-5-20251001"
    if complexity == "high" or task_type == "code_generation":
        return "claude-sonnet-4-6"
    return "claude-haiku-4-5-20251001"  # default to cheap
```

### Audit 3 — Token Reduction (savings: 20–40% on bloated prompts)

**Check:** Is the system prompt longer than it needs to be?

Common bloat patterns:
- Repeating the same instruction multiple ways ("Be concise. Keep answers short. Don't ramble.")
- Long examples when one would do
- Full document context when only a section is needed
- Verbose role descriptions

**Token reduction techniques:**

1. **Compress examples** — use 1 example instead of 3 if the task is clear
2. **Use structured format** — bullet points use fewer tokens than prose instructions
3. **Trim RAG context** — retrieve top-3 chunks, not top-10; rerank before sending
4. **Limit output length** — set `max_tokens` to the minimum needed:
```python
# If you only need a one-sentence answer, cap it
response = client.messages.create(max_tokens=100, ...)
```

### Audit 4 — Response Caching (savings: 30–70% for repetitive queries)

**Check:** Do users ask similar questions repeatedly?

Cache model responses by a hash of the (system_prompt + user_input) pair:

```python
import hashlib, json

def get_cached_or_call(system: str, user: str) -> str:
    key = hashlib.sha256(f"{system}:{user}".encode()).hexdigest()
    cached = redis_client.get(key)
    if cached:
        return json.loads(cached)

    response = call_llm(system, user)
    redis_client.setex(key, 3600, json.dumps(response))  # cache 1hr
    return response
```

Use semantic similarity for fuzzy cache hits if exact-match cache rate is low.

### Audit 5 — Batching (savings: 50% cost + latency for async workloads)

**Check:** Are you running background jobs (document processing, bulk analysis) one-at-a-time?

Both OpenAI and Anthropic offer Batch APIs at 50% discount for async workloads:

```python
# Anthropic Batch API
batch = client.messages.batches.create(
    requests=[
        {"custom_id": f"doc_{i}", "params": {"model": "...", "messages": [...]}}
        for i, doc in enumerate(documents)
    ]
)
# Results available within 24hrs at 50% of standard price
```

Use when: processing 100+ documents, nightly summarization jobs, bulk classification.

### Audit 6 — Streaming Efficiency

**Check:** Are you streaming responses but storing the full output anyway?

If you don't need to stream to the user, disable streaming — it has slightly higher overhead for short responses. Only stream when showing real-time output to users.

### Cost Estimate Template

After auditing, produce a cost breakdown:

| Optimization | Monthly Savings Estimate | Effort |
|---|---|---|
| Prompt caching | $X | Low |
| Switch summarization to Haiku | $X | Low |
| Cap max_tokens on short-answer routes | $X | Low |
| Response caching (top 20% queries) | $X | Medium |
| Batch API for nightly jobs | $X | Medium |
| **Total** | **$X** | |

## Example

**Input:**
> "We use Claude Opus for everything. System prompt is 3000 tokens. We do 5000 calls/day for customer support — mostly classifying intent and drafting short replies."

**Output:**
> **Critical finding: Wrong model for workload.**
> Intent classification and short reply drafting = Haiku-level tasks. Switching to claude-haiku-4-5-20251001 saves ~85% per token.
>
> **Prompt caching:** 3000-token system prompt × 5000 calls = 15M cached tokens/day. Enable `cache_control` on your system prompt.
>
> **Combined monthly savings estimate: ~$2,800/month** based on Anthropic pricing, down from ~$3,400 to ~$600.
