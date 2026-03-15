---
name: Error Log Summarizer
description: Parses raw error logs and produces a concise, prioritized summary of unique issues with root cause hints.
category: coding
tags:
  - logs
  - debugging
  - monitoring
  - errors
author: simplyutils
---

# Error Log Summarizer

## What this skill does

This skill directs the agent to ingest raw error logs — from a server, application, CI pipeline, or any other source — and produce a structured, de-duplicated summary. It groups repeated errors, counts occurrences, identifies the most frequent and most severe issues, and provides a root cause hint for each unique error type. The output gives you a clear picture of what's actually wrong without needing to scroll through thousands of log lines.

Use this when you have a dump of logs from a production incident, a CI failure, an error monitoring alert, or a server that's behaving oddly.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/error-log-summarizer/SKILL.md` in your project root.

Then ask:
- *"Use the Error Log Summarizer skill on these logs."*
- *"Summarize this error output from our production server using the Error Log Summarizer skill."*

Paste the raw logs directly into the message, or provide a file path if the logs are in the repo.

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane, then paste your raw logs.

### Codex

Paste the logs directly in your message and ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to summarize error logs, follow these steps:

### Step 1 — Parse and classify each log entry

Read through the entire log. For each line or entry, extract:
- **Timestamp** (if present)
- **Severity level**: ERROR, WARN, FATAL, CRITICAL, or inferred from context
- **Error message**: the actual error text, not the full stack trace
- **Source**: the file, service, or module where the error originated
- **Stack trace identifier**: if a stack trace is present, note the top application-code frame (not framework internals)

### Step 2 — De-duplicate and group

Group log entries that represent the same underlying error. Two entries are the same error if:
- The error message is identical or differs only in dynamic values (IDs, timestamps, paths)
- They originate from the same source location

For variable parts of error messages (e.g., user IDs, file names), replace them with a placeholder like `[USER_ID]` or `[FILE_PATH]` to produce a canonical error signature.

Count occurrences of each unique error.

### Step 3 — Prioritize

Rank the unique errors by a combination of:
- **Frequency** — how many times does it appear?
- **Severity** — FATAL/CRITICAL > ERROR > WARN
- **Recency** — errors appearing toward the end of the log window are more likely to be the active issue

### Step 4 — Generate root cause hints

For each unique error, analyze the message, source, and any available stack trace to produce a 1–2 sentence root cause hypothesis. This is a hint to guide investigation, not a definitive diagnosis.

### Step 5 — Format the output

```markdown
## Error Log Summary

**Log window**: [Start timestamp] → [End timestamp] (or "timestamps not present")
**Total log lines analyzed**: N
**Unique error signatures**: N
**Total error occurrences**: N

---

### Top Issues (by priority)

#### 1. [Error signature]
- **Severity**: ERROR / FATAL / WARN
- **Occurrences**: N times
- **First seen**: [timestamp or "unknown"]
- **Last seen**: [timestamp or "unknown"]
- **Source**: `file.ts:line` or service name
- **Sample message**: `[Exact or representative log line]`
- **Root cause hint**: [1–2 sentences on likely cause]
- **Suggested next step**: [Where to look first — a specific file, a query to run, a config to check]

#### 2. ...

---

### Warnings (non-critical but worth noting)

| # | Signature | Occurrences | Source | Note |
|---|-----------|-------------|--------|------|
| 1 | `Deprecated API used: /v1/users` | 43 | `api/userController.ts` | Will break on next major version |

---

### Noise / Expected Errors
[List any errors that appear expected or benign, e.g., health check 404s, with a brief explanation of why they can be ignored]
```

### Step 6 — Call out patterns

After the per-error breakdown, note any cross-cutting patterns:
- Did errors spike at a specific time? (Possible deploy or traffic spike)
- Are all errors coming from a single service or file? (Localized failure)
- Are there cascading errors where one root failure causes secondary errors? (Identify the origin)

## Example

**Input to Agent:**
> "Use the Error Log Summarizer skill on these logs:
> ```
> 2024-01-15 14:02:11 ERROR [OrderService] Cannot read property 'price' of undefined at processOrder (order.service.ts:87)
> 2024-01-15 14:02:12 ERROR [OrderService] Cannot read property 'price' of undefined at processOrder (order.service.ts:87)
> 2024-01-15 14:02:15 WARN  [AuthService] JWT expiry within 5 minutes for user 4821
> 2024-01-15 14:02:18 ERROR [OrderService] Cannot read property 'price' of undefined at processOrder (order.service.ts:87)
> 2024-01-15 14:02:20 ERROR [PaymentService] Stripe API timeout after 30s (requestId: req_abc123)
> 2024-01-15 14:02:21 ERROR [PaymentService] Stripe API timeout after 30s (requestId: req_def456)
> 2024-01-15 14:02:25 FATAL [OrderService] Unhandled promise rejection: Cannot read property 'price' of undefined
> ```"

**Output from Agent:**

> ## Error Log Summary
>
> **Log window**: 2024-01-15 14:02:11 → 14:02:25
> **Total log lines analyzed**: 7
> **Unique error signatures**: 3
> **Total error occurrences**: 6 (+ 1 warning)
>
> ### Top Issues
>
> #### 1. `Cannot read property 'price' of undefined` — OrderService
> - **Severity**: FATAL (escalated from ERROR)
> - **Occurrences**: 4 times
> - **Source**: `order.service.ts:87`
> - **Root cause hint**: A product object is `undefined` at the point where `price` is accessed — likely a missing null-check after a database lookup or an item that was deleted from the catalog while still in an active cart.
> - **Suggested next step**: Inspect `order.service.ts:87` and the function that populates the product before line 87. Add a null guard.
>
> #### 2. `Stripe API timeout after 30s` — PaymentService
> - **Severity**: ERROR
> - **Occurrences**: 2 times
> - **Root cause hint**: Stripe API is not responding within the 30-second timeout — could be a Stripe outage, network issue, or an unusually large payload.
> - **Suggested next step**: Check https://status.stripe.com for incidents. Review the Stripe request payload size and consider reducing the timeout threshold with a retry strategy.

## Notes

- The larger the log file, the more valuable de-duplication is — 1,000 lines of logs often contain only 5–10 unique error types.
- If logs are structured JSON (e.g., from Winston or Pino), mention that when invoking the skill so the agent can parse the `message` and `level` fields correctly.
- This skill summarizes; it does not fix. For root cause diagnosis, use the Bug Root Cause Analyzer skill on the top issue.
