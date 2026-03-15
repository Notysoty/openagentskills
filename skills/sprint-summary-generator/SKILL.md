---
name: Sprint Summary Generator
description: Converts a list of completed tickets or commits into a clear sprint summary for stakeholders.
category: productivity
tags:
  - agile
  - sprint
  - reporting
  - productivity
author: simplyutils
---

# Sprint Summary Generator

## What this skill does

This skill takes a raw list of completed tickets, commit messages, or PR titles from a sprint and produces a polished sprint summary document suitable for stakeholders, leadership, or the whole team. It groups work into meaningful themes, translates technical changes into business language, flags blockers and carryover items, and formats everything for a Slack post, email, or wiki page.

Use this at the end of every sprint to save time writing the sprint review, or to quickly communicate what shipped to non-technical stakeholders.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/sprint-summary-generator/SKILL.md` in your project root.

Then ask:
- *"Use the Sprint Summary Generator skill. Here are our completed tickets: [paste list]."*
- *"Generate a sprint summary from this git log using the Sprint Summary Generator skill."*

Provide:
- Sprint number or name
- Sprint dates (or just the duration, e.g., "2-week sprint ending 2026-03-15")
- List of completed tickets, PRs, or commits
- Any blockers or incomplete items
- Anything notable (incidents, team changes, major decisions)

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Paste the ticket list and any context before asking for the summary.

### Codex

Paste all available information (ticket list, sprint dates, blockers) and ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to generate a sprint summary, follow these steps:

### Step 1 — Parse and understand the work

For each completed item:
- Identify the user-facing or business impact (what changed for a user or the business?)
- Identify the theme or area (user-facing product, internal tooling, infrastructure, bug fixes, technical debt, etc.)
- Filter out noise (dependency bumps, formatting fixes, CI tweaks) — mention them briefly but don't feature them
- Note any items that were started but not completed (carryover)

### Step 2 — Group into themes

Group the completed items into 2–5 themes based on similarity. Good theme names are:
- Feature areas ("Checkout improvements", "Dashboard")
- Work types ("Bug fixes", "Performance", "Infrastructure")
- Team goals ("Sprint goal: faster onboarding")

Don't create more themes than there are meaningful groups — it's fine to have just two.

### Step 3 — Write the summary

Follow these writing principles:
- **Audience is non-technical** — translate "fixed N+1 query on the orders endpoint" to "improved orders page load time by 60%"
- **Lead with outcomes** — what improved, what users can now do, what risk was eliminated
- **Be specific but brief** — include the key detail (the metric, the feature name) but don't over-explain
- **Avoid jargon** — no "refactored", "migrated", or "deprecated" without explaining the impact

### Step 4 — Format the output

Produce two versions: a short Slack/chat version and a full written version.

**Slack version (short)**:
```
*Sprint [N] — [Date Range]* ✓ Shipped

*[Theme 1]*
• [Item 1 — one sentence, outcome-focused]
• [Item 2]

*[Theme 2]*
• [Item 1]

*Carried over*: [Item or "Nothing — clean sprint!"]

*Next sprint focus*: [1 sentence on what's coming]
```

**Full written version**:
```markdown
# Sprint [N] Summary — [Date Range]

## Highlights
[2–3 sentence paragraph describing the most important things that shipped this sprint and why they matter]

## What We Shipped

### [Theme 1]
- **[Feature/fix name]**: [1–2 sentences describing the change and its impact]
- ...

### [Theme 2]
- ...

## Bug Fixes & Reliability
[List significant bug fixes with a brief note on impact]

## Infrastructure & Technical Work
[List infra/tech debt items briefly — these are real but less exciting to stakeholders]

## Metrics
| Metric | Sprint start | Sprint end |
|--------|-------------|------------|
| [e.g., Page load time] | [value] | [value] |
[Only include if metrics were provided]

## Carryover
- [Item 1] — [brief reason it didn't make it]
- [or "None — clean sprint"]

## Blockers & Risks
[Any blockers encountered and how they were resolved, or ongoing risks]

## Next Sprint Preview
[1–3 bullet points on planned priorities]
```

## Example

**Input to Agent:**
> "Use the Sprint Summary Generator skill. Sprint 14, March 3–14 2026.
>
> Completed:
> - Add email notifications for order status changes
> - Fix broken pagination on /admin/users
> - Upgrade Next.js from 13 to 14
> - Add skeleton loading states to dashboard
> - Fix memory leak in the WebSocket handler
> - Improve DB query on reports page (was timing out for large accounts)
> - Add CSV download to reports page
> - Fix typo in welcome email subject line
>
> Carried over: Stripe billing portal integration (blocked on Stripe API access)
> Notable: memory leak fix resolved the nightly crash that had been affecting ~5% of users"

**Output from Agent:**

> **Sprint 14 — March 3–14, 2026** ✓ Shipped
>
> **Reports & Dashboard**
> • Added CSV download to the reports page
> • Reports page now loads correctly for large accounts (was timing out before)
> • Added loading skeletons to the dashboard for a smoother experience
>
> **Notifications & Emails**
> • Users now receive email notifications when their order status changes
> • Fixed a typo in the welcome email subject line
>
> **Reliability**
> • Fixed a memory leak that was causing ~5% of users to experience nightly service disruptions
> • Fixed broken pagination in the admin user list
>
> **Carried over**: Stripe billing portal integration — blocked on Stripe API access approval
>
> ---
>
> **Full Summary:**
>
> # Sprint 14 Summary — March 3–14, 2026
>
> ## Highlights
> Sprint 14 delivered meaningful improvements to the reports experience and fixed a longstanding reliability issue. The memory leak fix in our WebSocket handler eliminates the nightly crash that was affecting roughly 5% of active users. We also shipped two highly-requested reports features: CSV export and a fix for timeouts on large accounts.
>
> ## What We Shipped
>
> ### Reports & Dashboard
> - **CSV Export for Reports**: Users can now download any report as a CSV file directly from the reports page
> - **Reports timeout fix**: Optimized the database query behind the reports page — large accounts that were previously seeing timeouts now load in under 2 seconds
> - **Dashboard loading skeletons**: Added skeleton loading states so the dashboard feels snappy while data loads
>
> ### Notifications
> - **Order status email notifications**: Users now automatically receive an email when their order status changes to processing, shipped, or delivered
>
> ## Bug Fixes & Reliability
> - Fixed a memory leak in the WebSocket handler that was causing nightly service disruptions for ~5% of users
> - Fixed broken pagination in the admin user management page
> - Fixed a typo in the welcome email subject line
>
> ## Infrastructure & Technical Work
> - Upgraded Next.js from v13 to v14 — improves build times and enables future performance features
>
> ## Carryover
> - **Stripe billing portal integration** — blocked on Stripe API access approval; expected next sprint
>
> ## Next Sprint Preview
> - Complete Stripe billing portal integration
> - Begin work on mobile app notifications

## Notes

- If you don't have metrics, omit the metrics table — don't pad it with guesses.
- Non-technical stakeholders care about "users can now..." and "we fixed the thing that was causing..." — lead with that language.
- Internal tooling and refactoring work is real and worth mentioning briefly, but shouldn't dominate a stakeholder summary.
