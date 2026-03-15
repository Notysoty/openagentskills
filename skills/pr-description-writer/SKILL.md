---
name: PR Description Writer
description: Writes clear, thorough pull request descriptions from a diff or list of changes.
category: productivity
tags:
  - git
  - pull-request
  - documentation
  - productivity
author: simplyutils
---

# PR Description Writer

## What this skill does

This skill directs the agent to read a diff or a plain summary of changes and produce a complete, well-structured pull request description. It covers what changed, why it changed, how reviewers can test it, and what edge cases or risks to be aware of — so reviewers can do their job without having to chase you for context.

Use this when you're about to open a PR and want a description that will actually get reviewed instead of skipped, or when you need to document a large change for future reference.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/pr-description-writer/SKILL.md` in your project root.

Then ask:
- *"Write a PR description for these changes using the PR Description Writer skill."*
- *"Use the PR Description Writer skill. Here's the diff."*

You can provide:
- A `git diff main...HEAD` or `git diff` output
- A bullet list of what changed (if the diff is too large to paste)
- The GitHub issue number this PR closes (optional)
- Any context about why the change was needed

### Cursor / Codex

Paste the instructions from the section below into your session, then provide your diff or change summary.

## The Prompt / Instructions for the Agent

When asked to write a pull request description, follow these steps:

### 1. Understand the change

Read the diff or change list and identify:
- What files / modules were touched?
- Is this a new feature, a bug fix, a refactor, a performance improvement, or a configuration change?
- What was the motivation? (If not stated, ask — or make a reasonable inference and flag it for the author to verify)
- Are there any breaking changes or behavioral differences a user or caller would notice?

### 2. Write the PR description

Produce a description with these exact sections:

**## Summary**
1-3 bullet points. Each bullet is one complete thought. Focus on the *what* and the *why*, not the implementation details. Example:
- Adds rate limiting to the `/auth/login` endpoint to prevent brute-force attacks
- Limits failed login attempts to 5 per minute per IP, after which requests return 429

**## Changes**
A more detailed breakdown for reviewers. Group related changes together. Use sub-bullets if needed:
- `server/auth.ts` — added `checkRateLimit()` middleware before the password comparison step
- `server/middleware/rateLimiter.ts` — new file: generic rate limiter using an in-memory sliding window
- `tests/auth.test.ts` — added 4 new test cases covering the rate limit behavior

**## Test Plan**
A checklist of how to verify the change works. Written as concrete steps a reviewer can follow:
- [ ] Run `npm test` — all tests should pass
- [ ] `POST /auth/login` with valid credentials returns 200
- [ ] `POST /auth/login` 6 times in 1 minute from the same IP returns 429 on the 6th request
- [ ] After 1 minute, requests succeed again

**## Screenshots or recordings** (optional)
If the change has a UI component, include this section with a note to attach screenshots. Otherwise omit it.

**## Risks and notes**
Any caveats, known limitations, or things the reviewer should pay special attention to:
- The in-memory rate limiter resets on server restart — a Redis-backed implementation is tracked in #234
- This change does not affect the `/auth/refresh` endpoint

**## Related**
- Closes #[issue number] (if applicable)
- Related to #[other PR or issue] (if applicable)

### 3. Tone rules

- Write for the reviewer, not for yourself
- Be specific — "updated the login handler" is useless; "added a 5 req/min rate limit on failed logins" is useful
- Assume the reviewer knows the codebase but has not looked at this change yet
- Flag anything uncertain: "I believe this is backwards-compatible but please check the `formatDate` caller in `ReportPage.tsx`"

### 4. Output format

Produce the PR description in a fenced markdown block so it can be copy-pasted directly into GitHub.

## Example

**Input to Agent:**
> "Use the PR Description Writer skill. Here's a summary of my changes:
> - Added a `CopyableCodeBlock` component that shows a code block with a copy button
> - Used it in the JSON Formatter tool to replace the plain `<pre>` tag
> - Updated the Header component to add a link to the new AI Resources page
> This closes issue #88."

**Output from Agent:**

```markdown
## Summary

- Adds a reusable `CopyableCodeBlock` component with a one-click copy button for code output
- Replaces the plain `<pre>` tag in the JSON Formatter with `CopyableCodeBlock`, improving usability
- Adds an AI Resources link to the site header

## Changes

- `client/src/components/CopyableCodeBlock.tsx` — new component: renders a code block with syntax highlighting and a copy-to-clipboard button using the Clipboard API
- `client/src/tools/JsonFormatter.tsx` — replaced `<pre>` output with `<CopyableCodeBlock>`
- `client/src/components/Header.tsx` — added "AI Resources" nav link pointing to `/ai-resources`

## Test Plan

- [ ] Run `npm test` — all tests pass
- [ ] Open the JSON Formatter tool, format some JSON, and verify the copy button copies the output to clipboard
- [ ] Click the copy button twice — verify it shows a "Copied!" confirmation on the first click and resets after 2 seconds
- [ ] Check the header on desktop and mobile — "AI Resources" link should be visible and route correctly

## Risks and Notes

- `CopyableCodeBlock` uses the async Clipboard API — this requires HTTPS or localhost. It will silently fail on plain HTTP (no existing pages served over plain HTTP, so this is fine).

## Related

- Closes #88
```

## Notes

- The more context you provide, the better the description. A full diff is ideal; a bullet list of changes works too.
- If the PR is very large (100+ files), describe the intent and major areas affected rather than pasting the entire diff.
- The Test Plan section is the most commonly skipped in practice and the most valuable to reviewers — do not omit it.
- This skill writes the description only. It does not open the PR or interact with GitHub directly.
