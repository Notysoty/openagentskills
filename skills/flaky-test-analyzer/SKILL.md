---
name: Flaky Test Analyzer
description: Diagnoses why tests pass inconsistently and suggests fixes for timing, ordering, and state isolation issues.
category: coding
tags:
  - testing
  - flaky-tests
  - ci
  - reliability
author: simplyutils
---

# Flaky Test Analyzer

## What this skill does

This skill directs the agent to diagnose flaky tests — tests that sometimes pass and sometimes fail without any code changes. It examines the test code, the code under test, and the failure patterns to identify the root cause category (timing, shared state, ordering, network, randomness, etc.) and then suggests targeted fixes that make the test deterministic.

Use this when a test is unreliable in CI, when a test passes locally but fails on the CI server, or when a test fails intermittently with no obvious pattern.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/flaky-test-analyzer/SKILL.md` in your project root.

Then ask:
- *"Use the Flaky Test Analyzer skill on `tests/checkout.test.ts` — it fails about 1 in 5 runs in CI."*
- *"This test passes locally but fails in CI. Use the Flaky Test Analyzer skill to diagnose it."*

Provide:
1. The test file (or the specific test that's flaky)
2. The failure message when it does fail
3. How often it fails (every time? 1 in 10? only in CI?)
4. Any observations about when it fails (after a specific other test? at a specific time of day?)

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Provide the test code and failure output.

### Codex

Paste the test file, the failure message, and any relevant context. Ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to diagnose a flaky test, follow this process:

### Step 1 — Gather information

Before analyzing, ensure you have:
- The full test code, including `beforeEach`, `afterEach`, `beforeAll`, and `afterAll` hooks
- The code under test (the function or module being tested)
- The error message when the test fails (not just "test failed")
- The failure frequency pattern (always, sometimes, CI only, etc.)
- The test framework and any relevant configuration (jest.config.js, vitest.config.ts, etc.)

If any of these are missing, ask for them.

### Step 2 — Identify the flakiness category

Check for each of these flakiness patterns in order:

**Timing and async issues**
- `setTimeout` or `setInterval` with hardcoded delays that may not be long enough
- Missing `await` on async operations
- Polling for a condition with a timeout that's too short
- Fake timers (`jest.useFakeTimers`) mixed with real timers
- Tests that depend on the exact time of day or system clock

**Shared state and isolation**
- Global variables modified in one test but not reset before the next
- Database records created in one test that affect another
- File system changes not cleaned up
- In-memory caches not cleared between tests
- Static class properties mutated during tests
- Singleton services not reset

**Test ordering dependencies**
- Test A passes only when test B ran first (shared setup)
- Test A fails when run in isolation but passes in the suite
- Tests that rely on a specific execution order

**External dependencies**
- HTTP calls to real external APIs (network flakiness, rate limits)
- File system reads of files that may not exist in CI
- Environment variables that differ between local and CI
- Random number generation with no seed

**Race conditions in the code under test**
- Concurrent operations with no locking
- Event listeners that fire at unpredictable times
- `Promise.all` with side effects that interfere

**Test framework issues**
- Snapshot files out of date
- Test timeouts set too low for the environment

### Step 3 — Diagnose the specific test

After identifying which category applies, pinpoint the exact line(s) causing the flakiness. Explain:
- What assumption the test is making
- Why that assumption is sometimes wrong
- What condition makes it fail vs pass

### Step 4 — Recommend a fix

Provide a concrete, specific fix. Common fixes include:
- Replace `setTimeout(() => ..., 100)` with `waitFor(() => ...)` or `vi.runAllTimers()`
- Add `afterEach(() => { jest.clearAllMocks(); db.cleanup(); })`
- Mock the external API instead of calling it
- Use `jest.useFakeTimers()` consistently and advance time explicitly
- Use a test database that's wiped between runs
- Set a random seed for deterministic random values
- Add proper `await` to async operations

### Step 5 — Format the output

```markdown
## Flaky Test Diagnosis

### Test
`[test name]` in `[file path]`

### Failure Pattern
[How often it fails, under what conditions]

### Root Cause Category
[Timing / Shared state / Test ordering / External dependency / Race condition / Other]

### Root Cause
[2–3 sentences explaining exactly why the test is flaky — what assumption it makes and why that assumption sometimes fails]

### The Problematic Code
[Quote the specific lines that cause the flakiness]

### Fix
[The specific change(s) to make the test deterministic, with code]

### Why This Fix Works
[1–2 sentences explaining why the fix eliminates the non-determinism]

### Prevention
[1 sentence on how to avoid this class of flakiness in future tests]
```

## Example

**Input to Agent:**
> "Use the Flaky Test Analyzer skill. This test fails about 1 in 4 runs in CI:
>
> ```ts
> it('sends a welcome email after registration', async () => {
>   await registerUser({ email: 'test@example.com', password: 'abc123' });
>   setTimeout(() => {
>     expect(emailService.send).toHaveBeenCalledWith({
>       to: 'test@example.com',
>       subject: 'Welcome!'
>     });
>   }, 200);
> });
> ```"

**Output from Agent:**

> ## Flaky Test Diagnosis
>
> ### Test
> `sends a welcome email after registration` — `user.test.ts`
>
> ### Failure Pattern
> Fails ~25% of runs, more often in CI than locally.
>
> ### Root Cause Category
> Timing / async issue
>
> ### Root Cause
> The `expect` inside `setTimeout` is not awaited, so Jest considers the test done as soon as `registerUser` resolves — the assertion runs 200ms later, after Jest has already moved on. When the event loop is busy (common in CI), the 200ms delay may not be enough, and even when it fires, Jest may no longer be tracking it.
>
> ### The Problematic Code
> ```ts
> setTimeout(() => {
>   expect(emailService.send).toHaveBeenCalledWith(...);
> }, 200);
> ```
>
> ### Fix
> ```ts
> it('sends a welcome email after registration', async () => {
>   await registerUser({ email: 'test@example.com', password: 'abc123' });
>   await waitFor(() => {
>     expect(emailService.send).toHaveBeenCalledWith({
>       to: 'test@example.com',
>       subject: 'Welcome!'
>     });
>   });
> });
> ```
> If `waitFor` isn't available (non-React project), use `jest.runAllTimers()` with `jest.useFakeTimers()` or poll manually with a small helper.
>
> ### Why This Fix Works
> `waitFor` repeatedly retries the assertion until it passes or a timeout is reached, making the test resilient to variable execution timing.
>
> ### Prevention
> Never put `expect()` calls inside a raw `setTimeout` — always await the operation that triggers the side effect, or use `waitFor`.

## Notes

- Always provide the failure message, not just "it fails." The exact error often reveals the category immediately.
- "Passes locally, fails in CI" is usually a timing issue (slower machines) or a missing environment variable.
- "Fails only when run with other tests" is almost always a shared state issue — try running the failing test in isolation first to confirm.
