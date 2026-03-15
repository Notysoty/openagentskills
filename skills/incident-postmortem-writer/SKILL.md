---
name: Incident Postmortem Writer
description: Writes a blameless incident postmortem document from an incident timeline or Slack thread.
category: productivity
tags:
  - incidents
  - postmortem
  - reliability
  - sre
  - documentation
author: simplyutils
---

# Incident Postmortem Writer

## What this skill does

This skill turns a raw incident timeline, Slack thread dump, or bullet-point notes into a polished, blameless postmortem document. It structures the narrative, extracts action items, identifies contributing factors (not culprits), and formats everything into a document that can be shared with the team and used to prevent future recurrences. The output follows SRE best practices for blameless postmortems.

Use this immediately after an incident is resolved, while details are fresh, to produce the postmortem document without spending hours writing it from scratch.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/incident-postmortem-writer/SKILL.md` in your project root.

Then ask:
- *"Use the Incident Postmortem Writer skill. Here's the Slack thread from last night's outage: [paste thread]."*
- *"Write a postmortem for the database incident on March 14 using the Incident Postmortem Writer skill."*

Provide:
- An incident timeline, Slack thread, or bullet-point notes describing what happened
- The approximate start and end time of the incident
- The user impact (how many users affected, what they experienced)
- Any action items already identified

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Paste the incident notes.

### Codex

Paste the incident notes and ask Codex to follow the instructions below to produce the postmortem.

## The Prompt / Instructions for the Agent

When asked to write a postmortem, follow these steps:

### Principles to follow throughout

1. **Blameless** — The postmortem must never assign blame to individuals. Systems and processes fail, not people. Use passive voice or process language: "the alert was not triggered" not "John missed the alert."
2. **Accurate** — Represent the facts as given. Do not speculate beyond what the evidence supports.
3. **Actionable** — Every section should lead toward specific improvements. Vague observations ("we should improve monitoring") must be turned into specific action items.
4. **Complete** — Cover the full timeline from first symptom to full resolution, including any partial mitigations that were tried.

### Step 1 — Parse the input

Extract from the raw notes:
- Incident start time (when did something first go wrong, or when was it first detected?)
- Detection time (when did the team become aware?)
- Response start time (when did someone start actively working on it?)
- Resolution time (when was the system fully restored?)
- Total duration of user impact
- Number of users or systems affected
- What users experienced during the incident
- The root cause (if identified)
- Contributing factors (what made it worse or harder to detect/fix)
- What actions were taken and in what order
- Action items already identified

### Step 2 — Build the timeline

Construct a clean, chronological timeline. Format each entry as:
```
HH:MM UTC — [What happened / what was observed / what action was taken]
```

Don't editorialize in the timeline — just facts. Reserve analysis for the "Root Cause Analysis" section.

### Step 3 — Write the root cause analysis

Identify:
- **Immediate cause**: The proximate technical failure (e.g., "a database index was dropped during a migration")
- **Contributing factors**: Conditions that made the incident worse, harder to detect, or slower to fix (e.g., "alerts had not been updated to cover the new service", "runbook did not include steps for this failure mode")
- **What went well**: Honest acknowledgment of things that helped (fast detection, good team communication, effective rollback)

Use the 5-Why technique to go beyond the surface cause. The immediate cause is rarely the real root cause.

### Step 4 — Identify action items

Action items must be:
- **Specific** — "Add a PagerDuty alert for database connection pool exhaustion" not "improve monitoring"
- **Assigned or assignable** — A team or function should be identified even if a specific person isn't
- **Prioritized** — Mark as P1 (prevent recurrence), P2 (detect faster next time), P3 (respond better)

### Step 5 — Format the postmortem

```markdown
# Incident Postmortem — [Short title]

**Date**: [Date of incident]
**Severity**: [SEV1 / SEV2 / SEV3 or equivalent]
**Duration**: [HH:MM] (from first impact to full resolution)
**Status**: [Draft / Under Review / Final]
**Authors**: [Optional: team name or individuals who wrote the postmortem]

---

## Summary

[2–4 sentences. What happened, who was affected, for how long, and what the root cause was. Should be understandable by someone who wasn't involved.]

## Impact

| Metric | Value |
|--------|-------|
| Duration of impact | [e.g., 47 minutes] |
| Users affected | [e.g., ~12,000 active users, 100% of EU region] |
| Requests failed | [e.g., ~8,400 failed API requests] |
| Revenue impact | [if known] |
| Services affected | [list] |

## Timeline

| Time (UTC) | Event |
|------------|-------|
| HH:MM | [Event] |
| HH:MM | [Event] |
...

## Root Cause Analysis

### Immediate Cause
[What technically failed]

### Contributing Factors
- [Factor 1]
- [Factor 2]

### 5-Why Analysis
- Why did X fail? → [Because Y]
- Why did Y happen? → [Because Z]
...

## What Went Well
- [Thing 1]
- [Thing 2]

## What Went Poorly
- [Thing 1]
- [Thing 2]

## Action Items

| Priority | Action | Owner | Due Date |
|----------|--------|-------|----------|
| P1 | [Specific action to prevent recurrence] | [Team] | [Date] |
| P2 | [Specific action to detect faster] | [Team] | [Date] |
| P3 | [Specific action to respond better] | [Team] | [Date] |

## Lessons Learned
[2–3 sentences on the key takeaways from this incident for the organization]
```

## Example

**Input to Agent:**
> "Use the Incident Postmortem Writer skill.
>
> Incident: March 14 2026. Around 2:30am UTC, users started reporting that they couldn't log in. At 2:47am our on-call got paged (from a user report, not our own monitoring). Turned out a deploy at 2:28am had introduced a bug in the JWT validation middleware that rejected all valid tokens. We rolled back at 3:15am and everything recovered by 3:18am. About 15,000 users were affected. The deploy wasn't tested with real JWTs in staging — staging uses mock auth. Action items we know about: fix staging auth to use real JWTs, add a synthetic login monitor."

**Output from Agent:**

> # Incident Postmortem — Login Outage (JWT Validation Bug)
>
> **Date**: 2026-03-14
> **Severity**: SEV1
> **Duration**: 50 minutes (02:28 UTC → 03:18 UTC)
> **Status**: Draft
>
> ## Summary
> A deployment at 02:28 UTC introduced a regression in the JWT validation middleware that caused all authenticated requests to be rejected. Users were unable to log in for approximately 50 minutes. The issue was detected via a user report (not automated monitoring) and resolved by rolling back the deployment. Approximately 15,000 active users were affected.
>
> ## Impact
>
> | Metric | Value |
> |--------|-------|
> | Duration of impact | 50 minutes |
> | Users affected | ~15,000 active users |
> | Services affected | Authentication service, all authenticated API endpoints |
>
> ## Timeline
>
> | Time (UTC) | Event |
> |------------|-------|
> | 02:28 | Deployment of auth service v2.4.1 completed |
> | 02:28 | JWT validation bug introduced; all authenticated requests begin failing |
> | 02:30 | First user reports of login failure (via support chat) |
> | 02:47 | On-call engineer paged via user escalation |
> | 02:53 | Root cause identified as JWT middleware regression |
> | 03:15 | Rollback to v2.4.0 initiated |
> | 03:18 | Service fully restored |
>
> ## Root Cause Analysis
>
> ### Immediate Cause
> A code change in the JWT validation middleware in v2.4.1 incorrectly invalidated tokens with a valid `iat` (issued-at) claim by comparing it against the wrong reference time.
>
> ### Contributing Factors
> - Staging environment uses mock authentication; real JWT validation was not exercised before deployment
> - No synthetic login monitor existed to detect authentication failures automatically
> - On-call was not alerted until 19 minutes after the incident began, relying on a user report
>
> ## What Went Well
> - Root cause was identified quickly once investigation began (6 minutes)
> - Rollback was clean and full recovery occurred within 3 minutes of rollback
>
> ## Action Items
>
> | Priority | Action | Owner | Due Date |
> |----------|--------|-------|----------|
> | P1 | Update staging environment to use real JWT validation instead of mock auth | Auth team | 2026-03-21 |
> | P2 | Create synthetic login monitor that alerts if authentication fails | Observability team | 2026-03-21 |
> | P3 | Add automated test that validates JWT acceptance/rejection behavior on every deploy | Auth team | 2026-03-28 |

## Notes

- Write the postmortem within 24–48 hours of the incident while details are fresh. The longer you wait, the less accurate the timeline becomes.
- "Blameless" doesn't mean "without accountability." Action items assign ownership to teams. The difference is: we fix systems, not people.
- Share the postmortem with the full team even when the incident seems minor — the learning compounds over time.
