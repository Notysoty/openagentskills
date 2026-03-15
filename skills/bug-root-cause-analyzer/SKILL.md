---
name: Bug Root Cause Analyzer
description: Systematically diagnoses bugs by tracing execution flow and identifying root causes vs symptoms.
category: coding
tags:
  - debugging
  - root-cause
  - analysis
author: simplyutils
---

# Bug Root Cause Analyzer

## What this skill does

This skill directs the agent to work through a bug methodically — distinguishing the root cause from the symptoms, tracing the execution path that led to the failure, and producing a clear diagnosis before suggesting a fix. It applies the 5-Why technique, reads stack traces carefully, and avoids the trap of patching the symptom without understanding the cause.

Use this when you have a bug that isn't immediately obvious, when a quick fix didn't hold, or when you want to understand *why* something broke before deciding how to fix it.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/bug-root-cause-analyzer/SKILL.md` in your project root.

Then ask:
- *"I'm getting a TypeError in checkout. Use the Bug Root Cause Analyzer skill to diagnose it."*
- *"This test is flaky and I don't know why. Use the Bug Root Cause Analyzer skill."*

Provide as much context as you can: the error message, the stack trace, the relevant code, and what you expected to happen.

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane before describing the bug.

## The Prompt / Instructions for the Agent

When asked to diagnose a bug, follow this process:

### Phase 1 — Gather information

Before analyzing, make sure you have:
- The exact error message (not paraphrased)
- The full stack trace if available
- The code where the error originates
- What the user expected to happen vs what actually happened
- When the bug started (after a deploy? a specific change?)

If any of these are missing, ask for them before proceeding.

### Phase 2 — Read the stack trace

1. Start at the **top of the stack trace** — this is where the error was thrown, not necessarily where the bug lives.
2. Work **downward** through the frames until you reach application code (skip framework internals unless you have good reason to look there).
3. Identify the **last application-code frame** before the error — this is usually where the bug lives.
4. Note the **call chain** from entry point to failure point.

### Phase 3 — Apply 5-Why analysis

For each "why", look for evidence in the code rather than guessing:

1. **Why did the error occur?** (What specific condition triggered it?)
2. **Why was that condition true?** (What state led to it?)
3. **Why was the program in that state?** (What upstream code set that state?)
4. **Why did upstream code behave that way?** (Is this a logic error, a data issue, a race condition?)
5. **Why does that root condition exist?** (Is this a design flaw, a missing validation, an incorrect assumption?)

Stop when you reach a level where a code change would prevent the bug from occurring in the first place.

### Phase 4 — Classify the bug

Assign one of these root cause categories:
- **Logic error** — incorrect conditional, wrong operator, off-by-one
- **Null/undefined dereference** — missing null check, optional chaining needed
- **Type mismatch** — wrong type assumption, implicit coercion
- **Race condition** — async operations in wrong order, missing await, shared state mutation
- **Missing validation** — user input or API response not validated before use
- **Stale data / cache** — reading data that has changed or expired
- **Dependency bug** — the bug is in a library, not your code
- **Environment difference** — works locally, fails in production due to config or OS difference

### Phase 5 — Output your diagnosis

```markdown
## Bug Diagnosis

### Symptom
[What the user observed — the error message and where it appeared]

### Root Cause
[One or two sentences describing the actual cause, not the symptom]

### Root Cause Category
[One of the categories from Phase 4]

### Execution Path
1. [Entry point]
2. [Next call in the chain]
3. → [Where the failure condition was set]
4. → [Where the error was thrown]

### 5-Why Chain
- Why did X fail? → Because Y was null
- Why was Y null? → Because Z function returned early without populating it
- Why did Z return early? → Because the input failed a guard clause
- Why did the input fail? → Because the API response schema changed and field `foo` is now nested differently

### Recommended Fix
[A specific, targeted fix that addresses the root cause, not the symptom]

### What NOT to do
[If there's an obvious but wrong fix that patches the symptom, call it out]
```

## Example

**Input to Agent:**
> "Getting this error in production. Use the Bug Root Cause Analyzer skill.
>
> ```
> TypeError: Cannot read properties of undefined (reading 'price')
>     at calculateTotal (checkout.ts:47)
>     at handleSubmit (CheckoutPage.tsx:112)
>     at HTMLButtonElement.onClick
> ```
>
> `checkout.ts:47` is: `const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);`"

**Output from Agent:**

**Bug Diagnosis**

**Symptom**
`TypeError: Cannot read properties of undefined (reading 'price')` thrown at `checkout.ts:47` when `handleSubmit` is called.

**Root Cause**
At least one item in the `items` array has an undefined `product` field. The reduce assumes every item has a populated `product` object, but this assumption is violated when an item is in the cart but its product has been deleted or failed to load.

**Root Cause Category**
Missing validation / null dereference

**Execution Path**
1. User clicks Submit → `CheckoutPage.tsx:112` → `handleSubmit`
2. `handleSubmit` calls `calculateTotal(items)`
3. `checkout.ts:47` iterates `items` — one item has `product: undefined`
4. Accessing `.price` on `undefined` throws TypeError

**5-Why Chain**
- Why did `.price` throw? → `item.product` is `undefined`
- Why is `product` undefined? → The product was deleted from the DB after being added to the cart
- Why is there no guard? → `calculateTotal` assumed the cart was always valid when called
- Why was this assumption wrong? → Cart items are stored by product ID but products can be deleted independently

**Recommended Fix**
Filter out orphaned cart items before calling `calculateTotal`, and display a warning to the user that an item was removed:
```typescript
const validItems = items.filter(item => item.product != null);
const total = calculateTotal(validItems);
```
Also add a guard in `calculateTotal` itself as a defensive measure.

**What NOT to do**
Do not just add `item.product?.price ?? 0` in the reduce. That silently includes a $0 item in the total, which is confusing and could result in incorrect orders.

## Notes

- The more context you provide (full stack trace, surrounding code, recent changes), the more accurate the diagnosis will be.
- For flaky tests, describe the failure pattern (always fails, fails 1 in 10 runs, fails only in CI) — this is a key clue for diagnosing race conditions.
- This skill produces a diagnosis and a recommendation. It does not apply the fix automatically — review the recommendation before implementing it.
