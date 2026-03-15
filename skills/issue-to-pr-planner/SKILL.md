---
name: Issue to PR Planner
description: Takes a GitHub issue and produces a step-by-step implementation plan with file locations and code changes needed.
category: productivity
tags:
  - github
  - planning
  - issues
  - pull-request
author: simplyutils
---

# Issue to PR Planner

## What this skill does

This skill takes a GitHub issue (or any feature request / bug report) and turns it into a concrete, step-by-step implementation plan. It reads the codebase to identify the relevant files, understands the existing patterns, and produces an ordered list of changes with enough detail that a developer — or an agent executing the plan — can work through it without ambiguity.

Use this at the start of a feature or bug fix to align on exactly what needs to change before writing code, or to hand off implementation work to another developer or AI agent.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/issue-to-pr-planner/SKILL.md` in your project root.

Then ask:
- *"Use the Issue to PR Planner skill on this issue: [paste issue text]."*
- *"Plan the implementation for GitHub issue #142 using the Issue to PR Planner skill."*

Provide the full issue text including the title, description, and any acceptance criteria or comments.

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Paste the issue text before asking for the plan.

### Codex

Paste the issue text and provide the directory structure or key file list. Ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to plan an implementation from an issue, follow these steps:

### Step 1 — Understand the issue

Read the issue thoroughly. Identify:
- **Type**: Bug fix, new feature, enhancement, refactoring, documentation
- **Goal**: What should be true after this is done?
- **Acceptance criteria**: Are there explicit criteria? If not, infer them from the description.
- **Out of scope**: What is the issue explicitly NOT asking for?

If the issue is ambiguous, note the ambiguity and state the assumption you're making to proceed.

### Step 2 — Explore the codebase

Read the relevant parts of the codebase:
1. Use the directory structure to find files related to the feature area
2. Read the most relevant source files — entry points, the component or service mentioned in the issue, related tests
3. Identify the existing patterns (naming conventions, how similar features are implemented, how tests are structured)

Note: for large codebases, focus on the most relevant 3–5 files. Don't read everything.

### Step 3 — Identify all required changes

List every change needed:
- Files to create (new components, routes, tests, migrations)
- Files to modify (existing logic, exports, route registrations, type definitions)
- Files to delete (if the issue involves removal)
- Configuration or environment changes (new env vars, updated config)

For each change, note the specific function, class, or section that needs to change — not just the file.

### Step 4 — Produce the implementation plan

Order the changes from first to last. The order should follow a natural dependency graph — create types before using them, create database migrations before writing queries, write tests before or alongside implementation.

Format each step as:

```
### Step N — [Action verb] [what]
**File**: `path/to/file.ts`
**Change**: [Specific description of what to add, modify, or remove]
**Why**: [Why this step is needed]
**Notes**: [Any gotchas, patterns to follow, or decisions the implementer needs to make]
```

### Step 5 — List open questions

If there are design decisions the issue doesn't answer, list them. Don't block the plan — make a recommendation and flag that it was a judgment call.

### Format the full output

```markdown
## Implementation Plan for: [Issue Title]

### Issue Type
[Bug / Feature / Enhancement / Refactor]

### Goal
[One sentence]

### Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
...

### Files to change
- `path/to/file.ts` — [reason]
- `path/to/new-file.ts` — [create new]

---

### Implementation Steps

[Steps as described above]

---

### Open Questions / Decisions
1. [Question] — **Recommendation**: [your recommendation]

### Estimated Complexity
[Small (< 2hrs) / Medium (half day) / Large (1–2 days) / XL (needs to be broken into sub-issues)]
```

## Example

**Input to Agent:**
> "Use the Issue to PR Planner skill.
>
> **Issue #88: Add rate limiting to the login endpoint**
>
> Currently the `POST /api/auth/login` endpoint has no rate limiting. Attackers can brute-force passwords. We should limit login attempts to 5 per IP per 15 minutes. After 5 failed attempts, return a 429 with a message telling the user when they can retry."

**Output from Agent:**

> ## Implementation Plan for: Add rate limiting to the login endpoint
>
> ### Issue Type
> Security enhancement
>
> ### Goal
> Prevent brute-force attacks on the login endpoint by limiting failed attempts per IP.
>
> ### Acceptance Criteria
> - [ ] After 5 failed login attempts from the same IP within 15 minutes, the endpoint returns 429
> - [ ] The 429 response body includes a `retryAfter` field with seconds until the window resets
> - [ ] Successful logins do not count against the limit
> - [ ] Rate limit state resets after the 15-minute window
>
> ### Files to change
> - `server/middleware/rateLimit.ts` — create new rate limiting middleware
> - `server/routes/auth.ts` — apply middleware to login route
> - `server/routes/auth.test.ts` — add tests for rate limiting behavior
>
> ---
>
> ### Implementation Steps
>
> #### Step 1 — Install and configure a rate limiter
> **File**: `package.json`
> **Change**: Add `express-rate-limit` as a dependency (`npm install express-rate-limit`)
> **Why**: Provides a battle-tested sliding window implementation so we don't build this from scratch
>
> #### Step 2 — Create the login rate limit middleware
> **File**: `server/middleware/rateLimit.ts`
> **Change**: Create a `loginRateLimit` middleware using `express-rate-limit` configured for 5 attempts per 15 minutes, keyed by IP. Return a 429 with `{ error: 'Too many attempts', retryAfter: N }` on limit exceeded.
> **Why**: Separating the middleware into its own file keeps the route file clean and makes the limiter independently testable
> **Notes**: Use `skipSuccessfulRequests: true` so only failed logins count. Check if a Redis store is needed for multi-instance deployments.
>
> #### Step 3 — Apply middleware to the login route
> **File**: `server/routes/auth.ts`
> **Change**: Import `loginRateLimit` and add it as a middleware before the login handler: `router.post('/login', loginRateLimit, loginHandler)`
> **Why**: Applies the limit only to login, not all auth routes
>
> #### Step 4 — Write tests
> **File**: `server/routes/auth.test.ts`
> **Change**: Add tests: (a) 5 failed attempts → 6th returns 429 with retryAfter, (b) successful login does not increment counter, (c) counter resets after window
> **Notes**: Use `jest.useFakeTimers()` to simulate window expiry without waiting 15 real minutes
>
> ### Open Questions
> 1. **Single-server vs. multi-instance** — In-memory rate limiting won't work correctly if there are multiple server instances. **Recommendation**: Use in-memory for now (single EC2), but note that a Redis store will be needed before horizontal scaling.
>
> ### Estimated Complexity
> Small (< 2 hours)

## Notes

- A good plan is specific enough that another developer can execute it without asking questions. If you find yourself writing "update the function," ask yourself which function and what exactly to change.
- For large issues, recommend breaking them into sub-issues rather than producing a single 20-step plan.
- This skill produces a plan, not the code. To execute the plan, work through the steps one at a time.
