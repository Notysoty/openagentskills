---
name: Refactor Planner
description: Creates a safe, step-by-step plan to refactor messy code without breaking existing behavior.
category: coding
tags:
  - refactoring
  - code-quality
  - planning
author: simplyutils
---

# Refactor Planner

## What this skill does

This skill directs the agent to analyze a block of code (or an entire module) and produce an ordered, safe refactoring plan. Rather than rewriting everything at once, it breaks the work into small, reversible steps — each one leaving the tests green and the behavior unchanged. It identifies code smells, maps dependencies, flags high-risk areas, and sequences the changes so you can ship incrementally without introducing regressions.

Use this when you have messy, hard-to-understand code that works but needs cleaning up before you can safely add features.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/refactor-planner/SKILL.md` in your project root.

Then ask the agent:
- *"Use the Refactor Planner skill on `src/utils/dataProcessor.ts`."*
- *"Plan a safe refactor of this function using the Refactor Planner skill."*

Paste in the code you want refactored, or point to a file path.

### Cursor

Add the "Prompt / Instructions" section below to your `.cursorrules` file, or paste it directly into the Cursor AI pane before sharing the code you want refactored.

### Codex

Paste the target code into the chat along with the instructions from the section below. For large files, include the full file plus any files that import from it so Codex can map dependencies.

## The Prompt / Instructions for the Agent

When asked to plan a refactor, follow these steps precisely:

1. **Read the code thoroughly.** If a file path is given, read the full file. Also read any files that import from it or that it imports from, so you understand the dependency graph.

2. **Identify code smells.** Look for:
   - Functions longer than 40 lines
   - Deeply nested conditionals (more than 3 levels)
   - Duplicated logic (copy-paste code)
   - Magic numbers and hardcoded strings
   - God objects or functions that do too many things
   - Inconsistent naming conventions
   - Mutable shared state
   - Missing or misleading comments
   - Dead code (unreachable or unused)

3. **Map dependencies.** For each problematic section, note:
   - What calls it (callers)
   - What it calls (callees)
   - What data it reads or mutates
   - Whether it has test coverage

4. **Assess risk for each change.** Label every planned step as:
   - **Low risk** — pure rename, extract with no logic change, add a comment
   - **Medium risk** — restructure logic that has test coverage
   - **High risk** — change with no tests, touches shared state, or modifies a public API

5. **Generate the ordered refactoring plan.** Each step must:
   - Be small enough to do in a single commit
   - Leave the code in a working state after it is applied
   - Be described clearly so a developer can execute it manually
   - Reference the specific function, class, or line range it affects
   - Come with a one-line "how to verify this step didn't break anything"

6. **Format the output as follows:**

```
## Code Smells Found
- [Smell type]: [Description] — [Location]
...

## Dependency Map
- `functionName` is called by: X, Y, Z
- `functionName` depends on: A, B
...

## Refactoring Plan

### Step 1 — [Title] [Risk: Low/Medium/High]
**What:** [What to change]
**Why:** [Which smell this addresses]
**How:** [Concrete action, e.g., "Extract lines 45–67 into a new function called `validateInput`"]
**Verify:** [How to confirm nothing broke, e.g., "Run `npm test` — all existing tests should pass"]

### Step 2 — ...
...

## High-Risk Flags
[List any steps that need special attention, tests to write first, or API surface changes that require coordination]
```

7. **Do not rewrite the code yet.** The output is a plan only. If the user then asks you to execute a specific step, do it one step at a time.

## Example

**Input to Agent:**
> "Use the Refactor Planner skill on this function:
>
> ```ts
> function process(data: any) {
>   let result = [];
>   for (let i = 0; i < data.length; i++) {
>     if (data[i].type === 'A') {
>       if (data[i].value > 100) {
>         if (data[i].active) {
>           result.push({ id: data[i].id, score: data[i].value * 1.5 });
>         }
>       }
>     } else if (data[i].type === 'B') {
>       if (data[i].value > 50) {
>         result.push({ id: data[i].id, score: data[i].value * 1.2 });
>       }
>     }
>   }
>   return result;
> }
> ```"

**Output from Agent:**
> ## Code Smells Found
> - Deep nesting: Triple-nested conditionals make the logic hard to follow — lines 3–13
> - Magic numbers: `100`, `1.5`, `50`, `1.2` have no named meaning — lines 5, 8, 12, 13
> - Loose typing: `data: any` loses all type safety — line 1
>
> ## Refactoring Plan
>
> ### Step 1 — Name the magic numbers [Risk: Low]
> **What:** Extract `100`, `1.5`, `50`, `1.2` into named constants at the top of the file.
> **Why:** Eliminates magic numbers, makes thresholds searchable.
> **How:** Add `const TYPE_A_THRESHOLD = 100`, `const TYPE_A_MULTIPLIER = 1.5`, etc.
> **Verify:** Run existing tests — output should be identical.
>
> ### Step 2 — Add types [Risk: Low]
> **What:** Define an `Item` interface and replace `any`.
> **Why:** Prevents silent bugs from misshapen input.
> **How:** `interface Item { id: string; type: 'A' | 'B'; value: number; active?: boolean }`
> **Verify:** TypeScript should compile with no new errors.
>
> ### Step 3 — Extract per-type handlers [Risk: Medium]
> **What:** Move the type A and type B branches into `processTypeA(item)` and `processTypeB(item)`.
> **Why:** Eliminates deep nesting, makes each branch independently testable.
> **How:** Extract the inner `if` blocks into separate functions that return `{ id, score } | null`.
> **Verify:** Run tests; add a unit test for each new function before extracting.
