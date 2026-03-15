---
name: Observability Checklist
description: Reviews a service or codebase against a full observability checklist — logs, metrics, traces, and alerting gaps.
category: devops
tags:
  - observability
  - monitoring
  - logging
  - tracing
  - sre
author: simplyutils
---

# Observability Checklist

## What this skill does

This skill reviews a service or codebase against a comprehensive observability checklist covering structured logging, metrics instrumentation, distributed tracing, alerting, dashboards, and runbooks. It identifies gaps that would make it hard to diagnose incidents, detect regressions, or understand the system's health. The output is a prioritized list of missing observability with recommendations for each gap.

Use this when building a new service, when preparing for an on-call rotation, after an incident where you couldn't figure out what happened, or as part of a production readiness review.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/observability-checklist/SKILL.md` in your project root.

Then ask:
- *"Use the Observability Checklist skill to review our payments service."*
- *"Run an observability review on `server/routes/orders.ts` using the Observability Checklist skill."*

Provide the service description, relevant code files, and information about what observability tooling is already in place (e.g., "we use Datadog, we have some logging but no tracing").

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane with the service description and code.

### Codex

Provide the service overview and code. Ask Codex to follow the instructions below to produce the observability gap report.

## The Prompt / Instructions for the Agent

When asked to review observability, evaluate the service against every item in this checklist:

### Pillar 1 — Structured Logging

**Must have**
- [ ] All logs are structured (JSON or key-value format), not plain string concatenation
- [ ] Every log entry includes: timestamp, severity level, service name, and a message
- [ ] Errors are logged at ERROR level with the full stack trace
- [ ] Warnings are logged at WARN for recoverable issues
- [ ] No sensitive data in logs (passwords, tokens, PII, credit card numbers)

**Should have**
- [ ] A correlation/trace ID is included in every log entry so all logs for one request can be found
- [ ] User ID or session ID included where relevant (but not PII that's not already stripped)
- [ ] Log levels can be changed without redeploying (via config or environment variable)
- [ ] Slow operations are logged with duration
- [ ] External API calls log the endpoint, duration, and response code

**Log coverage gaps to check**
- All HTTP request/response cycles should be logged at INFO
- Database query errors should be logged at ERROR
- Background jobs should log start, end, and error
- Auth failures should be logged (for security audit)

### Pillar 2 — Metrics

**Must have**
- [ ] Error rate is tracked (errors per minute or errors as % of total requests)
- [ ] Request latency is tracked (p50, p95, p99)
- [ ] Request throughput is tracked (requests per second/minute)
- [ ] Health check endpoint exists (`/health` or `/ping`) returning 200 when healthy

**Should have**
- [ ] Business metrics tracked (e.g., orders created/minute, sign-ups/day)
- [ ] Database connection pool metrics (used, available, waiting)
- [ ] Queue depth tracked for any async job queues
- [ ] External API call success/failure rates tracked
- [ ] Cache hit/miss ratios tracked if caching is used
- [ ] Resource metrics: CPU, memory, disk I/O

**Common gaps**
- HTTP 4xx and 5xx rates tracked separately
- Endpoint-level latency (not just aggregate)
- DB query duration tracked

### Pillar 3 — Distributed Tracing

**Should have if the service has multiple components**
- [ ] Trace context propagated from incoming HTTP requests to outgoing calls
- [ ] Database calls included in traces
- [ ] External API calls included in traces
- [ ] Background jobs generate their own trace spans
- [ ] Trace IDs correlate to log entries (same trace ID in logs and traces)

**Common gaps**
- Async callbacks break trace context — it needs to be manually propagated
- Missing spans on queued job processing

### Pillar 4 — Alerting

**Must have**
- [ ] Alert fires when error rate exceeds a threshold (e.g., > 1% of requests failing)
- [ ] Alert fires when the service is down / health check fails
- [ ] Alert fires when latency exceeds an SLO threshold
- [ ] Someone is on call and the alert reaches them (PagerDuty, Opsgenie, etc.)

**Should have**
- [ ] Alerts are reviewed for signal vs. noise — no alert fires more than once per week under normal conditions
- [ ] Alert runbook exists: what to do when this alert fires
- [ ] Alert severity levels (P1 for wake-up-at-night, P2 for next-business-day)
- [ ] Business metric anomaly detection (sudden drop in orders, sign-ups, etc.)

**Common gaps**
- Alerts that fire but no one knows what to do (missing runbook)
- Alerts that are always firing and get ignored (alert fatigue)
- No alerting on downstream dependency failures

### Pillar 5 — Dashboards

**Should have**
- [ ] A service dashboard showing the four golden signals: latency, traffic, error rate, saturation
- [ ] Deployment markers on graphs (so you can see if a deploy caused a spike)
- [ ] Comparison with the same period last week (to distinguish trend from incident)

### Output format

```markdown
## Observability Review — [Service Name]

### Score
- Logging: N/10
- Metrics: N/10
- Tracing: N/10
- Alerting: N/10
- Overall readiness: [Not ready / Needs work / Good / Excellent]

---

### Critical Gaps (would make incident diagnosis impossible)

#### 1. [Gap title]
- **Pillar**: [Logging / Metrics / Tracing / Alerting]
- **Problem**: [What's missing and why it matters]
- **Recommendation**: [Specific change to make]
- **Effort**: [Small / Medium / Large]

### High-Priority Gaps

[Same format]

### Low-Priority / Nice-to-Have

[Same format]

### What's Already Good
[Brief acknowledgment of observability that's already in place]
```

## Example

**Input to Agent:**
> "Use the Observability Checklist skill on our Node.js orders service. We use console.log for logging, we have a /health endpoint, we track errors in Sentry, but we don't have any metrics or tracing set up. We do have Datadog available."

**Output from Agent:**

> ## Observability Review — Orders Service
>
> ### Score
> - Logging: 3/10 (unstructured, no correlation IDs)
> - Metrics: 2/10 (only crash errors via Sentry, no latency/throughput)
> - Tracing: 0/10 (not configured)
> - Alerting: 2/10 (Sentry sends emails, no PagerDuty, no latency alerts)
> - Overall readiness: Needs work
>
> ### Critical Gaps
>
> #### 1. Unstructured logging (console.log)
> - **Pillar**: Logging
> - **Problem**: `console.log` output cannot be queried, filtered, or correlated. During an incident, you can't find all logs for a specific request or user.
> - **Recommendation**: Replace `console.log` with a structured logger like `pino` or `winston`. Output JSON with `level`, `timestamp`, `message`, and a `requestId` field.
> - **Effort**: Medium (2–4 hours for initial setup + incrementally replacing log calls)
>
> #### 2. No latency or throughput metrics
> - **Pillar**: Metrics
> - **Problem**: You have no way to know if order creation is getting slower. A 10x latency increase would go undetected until users complain.
> - **Recommendation**: Instrument with `dd-trace` (Datadog APM) to auto-capture HTTP request latency, throughput, and error rates. Takes under 1 hour to set up.
> - **Effort**: Small
>
> #### 3. No on-call alerting
> - **Pillar**: Alerting
> - **Problem**: Sentry sends emails, but emails don't wake anyone up at night. A critical orders outage could go undetected for hours.
> - **Recommendation**: Create a Datadog monitor for `error_rate > 5%` and `p99_latency > 2000ms`, routed to PagerDuty.
> - **Effort**: Small

## Notes

- Observability is a spectrum — some coverage is better than none. Start with the critical gaps and add coverage incrementally.
- The most valuable first investment for most services: structured logging + error rate alert + latency alert. Everything else follows.
- Metrics and logs without runbooks are less useful than they could be. Every alert should have a runbook explaining what to check first.
