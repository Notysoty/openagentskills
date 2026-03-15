---
name: React Component Reviewer
description: Analyzes React components for performance, accessibility, and modern hook usage.
category: coding
tags:
  - react
  - code-review
  - performance
author: simplyutils
---

# React Component Reviewer

## What this skill does

This skill directs the agent to review a specific React component or file against modern React best practices. It specifically checks for:
- Unnecessary re-renders (missing `useMemo`/`useCallback`)
- Accessibility violations (missing ARIA attributes, improper semantics)
- Stale closures in `useEffect` or event handlers
- Prop drilling that could be solved with Context or component composition
- Proper TypeScript typing

## How to use

### Claude Code / Antigravity

Copy this file to `.agents/skills/react-code-reviewer/SKILL.md` in your project.
Then ask the agent: *"Review `components/MyComponent.tsx` using the React Component Reviewer skill."*

### Cursor

Add this prompt to your `.cursorrules` file or save it as a custom prompt in the Cursor AI pane.

## The Prompt / Instructions for the Agent

When asked to review a React component, follow these exact steps:

1. **Analyze State & Renders:** Look for state that could be derived. Identify any expensive calculations not wrapped in `useMemo`. Look for object/function definitions inside the render body that are passed as props to memoized children.
2. **Analyze Hooks:** Ensure `useEffect` dependencies are complete and correct. Check for race conditions in asynchronous effects. 
3. **Analyze Accessibility:** Verify that interactive elements use `<button>` or `<a>` with proper `href`. Ensure images have `alt` text. Check for keyboard navigability.
4. **Format Output:** Present your review in the following markdown format:

```markdown
### 🚀 Performance
- [List findings here]

### ♿ Accessibility
- [List findings here]

### 🏗️ Architecture & Best Practices 
- [List findings here]

### 💡 Suggested Refactor
Provide the refactored code block here.
```

## Example

**Input to Agent:**
> "Please review the UserProfile.tsx component."

**Output from Agent:**
> ### 🚀 Performance
> - The `formatDate` function is defined inside the component and passed to a child, causing unnecessary re-renders. It should be moved outside the component or wrapped in `useCallback`.
> 
> ### ♿ Accessibility
> - The "Save" div acts as a button but lacks `role="button"` and `tabIndex={0}`. It should be a `<button>` element.
> 
> *(...continues with suggested refactor)*
