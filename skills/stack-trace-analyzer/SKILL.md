---
name: Stack Trace Analyzer
description: Interprets error stack traces to pinpoint root cause, explain what went wrong, and suggest fixes.
category: coding
tags:
  - debugging
  - errors
  - stack-trace
author: simplyutils
---

# Stack Trace Analyzer

## What this skill does

This skill directs the agent to read a stack trace, identify which frame is the true origin of the bug (not just where the error was thrown), explain what each relevant frame means in plain English, diagnose the root cause, and propose 2–3 concrete fixes ranked by likelihood. It works with JavaScript, TypeScript, Python, Java, Go, Rust, and most other common stack trace formats.

Use this when you have a crash report, a CI failure, or a wall of red text in your terminal and you want to understand it fast.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/stack-trace-analyzer/SKILL.md` in your project root.

Then paste the stack trace and ask:
- *"Analyze this stack trace using the Stack Trace Analyzer skill."*
- *"Use the Stack Trace Analyzer skill — what went wrong and how do I fix it?"*

Include any relevant context: the action that triggered the error, environment details (Node version, browser, OS), and any recent code changes.

### Cursor

Add the "Prompt / Instructions" section below to your `.cursorrules` file. Then paste the stack trace into the chat.

### Codex

Paste the full stack trace and the relevant source files into the chat, then include the instructions below. Codex benefits from seeing the actual source code so it can match line numbers to real code.

## The Prompt / Instructions for the Agent

When given a stack trace, follow these steps:

1. **Identify the language and runtime** from the trace format (Node.js, Python, JVM, Go panic, Rust panic, browser, etc.). Note the runtime version if visible.

2. **Parse the error header.** Extract:
   - Error type (e.g., `TypeError`, `NullPointerException`, `panic`, `KeyError`)
   - Error message (the human-readable description)
   - Any error codes or HTTP status codes present

3. **Walk the stack frames top-to-bottom.** For each frame that belongs to application code (not a framework or standard library):
   - State what the function does in plain English
   - Note the file path and line number
   - Explain why that frame is on the call stack (what called it)

4. **Distinguish surface error from root cause.** The top frame is often just where the error was *detected*, not where it *originated*. Look deeper:
   - Find the first frame in user-owned code that passed invalid data or made a wrong assumption
   - Check for null/undefined propagation — where was the value supposed to be set?
   - Check for async/promise chain breaks
   - Check for type mismatches introduced by parsing or deserialization

5. **State the root cause** in one clear sentence. Then explain the chain of events that led to it (2–4 sentences).

6. **Suggest 2–3 fixes**, ordered from most likely to least likely:
   - Each fix must be concrete: name the file, function, and line number if possible
   - Explain what the fix does and why it solves the root cause
   - Note any trade-offs or edge cases the fix introduces

7. **Flag anything unusual**, such as:
   - Async errors that swallowed earlier exceptions
   - Framework internals that obscure the real caller
   - Minified or transpiled frames where source maps are missing

8. **Output format:**

```
## Error Summary
**Type:** [ErrorType]
**Message:** [Full error message]
**Runtime:** [Language/runtime/version]

## Frame Analysis
1. `[file:line]` — [What this function does and why it's on the stack]
2. `[file:line]` — ...
...

## Root Cause
[One sentence identifying the true origin of the bug.]

[2–4 sentences explaining the chain of events.]

## Suggested Fixes

### Fix 1 (Most Likely) — [Title]
[Concrete description of the change, with file/function/line reference.]

### Fix 2 — [Title]
[...]

### Fix 3 — [Title]
[...]

## Additional Notes
[Any warnings about obscured frames, missing source maps, async issues, etc.]
```

## Example

**Input to Agent:**
> "Use the Stack Trace Analyzer skill on this error:
>
> ```
> TypeError: Cannot read properties of undefined (reading 'email')
>     at formatUserDisplay (src/utils/format.ts:23:18)
>     at UserCard (src/components/UserCard.tsx:41:12)
>     at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:14985:18)
>     at mountIndeterminateComponent (node_modules/react-dom/cjs/react-dom.development.js:17811:13)
>     at beginWork (node_modules/react-dom/cjs/react-dom.development.js:19049:16)
> ```"

**Output from Agent:**
> ## Error Summary
> **Type:** TypeError
> **Message:** Cannot read properties of undefined (reading 'email')
> **Runtime:** Browser / React (react-dom development build)
>
> ## Frame Analysis
> 1. `src/utils/format.ts:23` — `formatUserDisplay` tried to read the `.email` property, but the value passed to it was `undefined`.
> 2. `src/components/UserCard.tsx:41` — `UserCard` called `formatUserDisplay` with a `user` prop that was `undefined` at render time.
> 3. React internals — these frames are React mounting the component; not relevant to the bug.
>
> ## Root Cause
> `UserCard` is being rendered before its `user` prop is populated — likely because data is still loading from an async source when the component first mounts.
>
> The `user` prop arrives as `undefined` on the first render, `formatUserDisplay` does not guard against this, and accessing `.email` on `undefined` throws immediately.
>
> ## Suggested Fixes
>
> ### Fix 1 (Most Likely) — Add a loading guard in UserCard
> In `src/components/UserCard.tsx`, return `null` or a skeleton UI when `user` is falsy: `if (!user) return <Skeleton />`. This prevents the component from trying to render before data is ready.
>
> ### Fix 2 — Add a null guard in formatUserDisplay
> In `src/utils/format.ts:23`, add `if (!user?.email) return ''` before accessing the property. This makes the utility defensive and prevents crashes from any caller.
>
> ### Fix 3 — Ensure the parent always passes a defined user
> Trace where `UserCard` is used and confirm the parent component does not render it until the data fetch is complete. Adding a `user &&` check at the call site prevents the component from mounting with undefined data.
