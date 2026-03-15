---
name: Accessibility Audit Helper
description: Reviews UI code and components for WCAG 2.1 accessibility violations and provides specific fixes.
category: coding
tags:
  - accessibility
  - wcag
  - a11y
  - html
  - react
author: simplyutils
---

# Accessibility Audit Helper

## What this skill does

This skill directs the agent to review HTML, JSX, or React component code for WCAG 2.1 accessibility violations. It checks for missing alt text, improper heading hierarchy, ARIA misuse, keyboard trap risks, color contrast hints, missing focus indicators, and more. Every finding is categorized by severity with a concrete before/after code fix included.

Use this before shipping any UI feature, during code review, or as a regular accessibility sweep of your component library.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/accessibility-audit-helper/SKILL.md` in your project root.

Then share the component or page code and ask:
- *"Run an accessibility audit on `src/components/Modal.tsx` using the Accessibility Audit Helper skill."*
- *"Use the Accessibility Audit Helper skill to check this form for a11y issues."*

Paste the component code directly or provide a file path for the agent to read.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Open the component you want audited and ask Cursor to run an accessibility audit.

### Codex

Paste the component or page HTML/JSX into the chat along with the instructions below.

## The Prompt / Instructions for the Agent

When asked to audit UI code for accessibility, follow these steps:

1. **Read the full component or file.** If it references child components or imports, note them but focus the audit on the provided code.

2. **Check each of these categories systematically:**

   **Images and Media**
   - All `<img>` elements must have an `alt` attribute; decorative images use `alt=""`
   - Icons used as buttons or links must have an `aria-label` or `aria-labelledby`
   - SVGs used for meaning must have a `<title>` or `aria-label`; decorative SVGs need `aria-hidden="true"`

   **Heading Hierarchy**
   - Headings must not skip levels (e.g., H1 → H3 with no H2)
   - Each page should have exactly one `<h1>`
   - Headings must describe the section content, not just style large text

   **Interactive Elements**
   - All buttons must have visible, descriptive text or an `aria-label`
   - Links must have descriptive text — "Click here" or "Read more" alone are violations
   - Custom interactive elements (divs/spans with click handlers) must have `role`, `tabIndex={0}`, and keyboard event handlers (`onKeyDown` for Enter/Space)
   - `<button>` elements must not be nested inside `<a>` tags, and vice versa

   **Forms**
   - Every form input must have an associated `<label>` (via `htmlFor`/`id`, `aria-label`, or `aria-labelledby`)
   - Required fields must be indicated (not just by color) — use `aria-required="true"` or `required`
   - Error messages must be programmatically associated with the field using `aria-describedby`
   - Form groups (e.g., radio buttons) should use `<fieldset>` and `<legend>`

   **Keyboard and Focus**
   - Interactive elements must be reachable via keyboard (Tab key)
   - No positive `tabIndex` values (1, 2, 3...) — these break natural tab order
   - Modal dialogs must trap focus within them when open and return focus when closed
   - Menus and dropdowns must be navigable with arrow keys and closable with Escape
   - Focus must never disappear (no `outline: none` without a replacement focus style)

   **ARIA**
   - ARIA roles must be used correctly — do not add `role="button"` to an already-interactive `<button>`
   - `aria-hidden="true"` must not be applied to elements that contain focusable children
   - Live regions (`aria-live`) should be used for dynamically updated content (status messages, alerts)
   - Do not use `aria-label` on non-interactive elements unless there's a semantic reason

   **Color and Contrast (static analysis)**
   - Flag any inline color styles or Tailwind text/background combinations that are likely to fail WCAG AA contrast (4.5:1 for normal text, 3:1 for large text)
   - Flag information conveyed by color alone (red = error) without a non-color indicator

   **Document Structure**
   - Pages should have a `<main>` landmark, a `<header>`, and a `<nav>` (when applicable)
   - Navigation landmarks should have `aria-label` when multiple `<nav>` elements exist on a page

3. **Categorize every finding by WCAG severity:**
   - **Critical** (WCAG Level A) — completely blocks access for assistive technology users; must fix before shipping
   - **Serious** (WCAG Level AA) — significantly degrades the experience; should fix before shipping
   - **Moderate** (best practice / Level AAA) — improves experience; fix when possible

4. **For every finding, provide:**
   - The WCAG criterion violated (e.g., WCAG 2.1 SC 1.1.1)
   - A plain-English explanation of the problem
   - The specific line or element with the violation
   - A concrete code fix (before/after)

5. **Output format:**

```
## Accessibility Audit Results

### Summary
[X] Critical violations · [Y] Serious violations · [Z] Moderate violations

---

### Critical Violations

#### 1. [Violation title] — WCAG 2.1 SC [X.X.X]
**Problem:** [Plain English explanation]
**Location:** [Element / line description]

**Before:**
```[lang]
[problematic code]
```

**Fix:**
```[lang]
[corrected code]
```

---
[repeat for each finding, grouped by severity]

### Passed Checks
- [List checks that passed cleanly]
```

## Example

**Input to Agent:**
> "Use the Accessibility Audit Helper skill on this component:
>
> ```tsx
> export function SearchBar({ onSearch }) {
>   return (
>     <div>
>       <input type="text" placeholder="Search..." onChange={e => onSearch(e.target.value)} />
>       <div onClick={onSearch} style={{ cursor: 'pointer' }}>
>         <svg width="16" height="16"><path d="M..."/></svg>
>       </div>
>     </div>
>   );
> }
> ```"

**Output from Agent:**
> ## Accessibility Audit Results
>
> ### Summary
> 2 Critical violations · 1 Serious violation · 0 Moderate violations
>
> ---
>
> ### Critical Violations
>
> #### 1. Input has no label — WCAG 2.1 SC 1.3.1
> **Problem:** The text input has no associated label. Screen readers will only announce "edit text" with no context about its purpose.
> **Location:** `<input type="text" placeholder="Search...">`
>
> **Before:**
> ```tsx
> <input type="text" placeholder="Search..." onChange={...} />
> ```
>
> **Fix:**
> ```tsx
> <label htmlFor="search-input" className="sr-only">Search</label>
> <input id="search-input" type="text" placeholder="Search..." onChange={...} />
> ```
>
> #### 2. SVG icon has no accessible name — WCAG 2.1 SC 1.1.1
> **Problem:** The SVG is inside a clickable element but has no title or aria-label. Screen readers cannot determine its purpose.
>
> **Before:**
> ```tsx
> <svg width="16" height="16"><path d="M..."/></svg>
> ```
>
> **Fix:**
> ```tsx
> <svg width="16" height="16" aria-hidden="true" focusable="false"><path d="M..."/></svg>
> ```
> (The parent button carries the accessible name; hide the SVG from the a11y tree.)
>
> ---
>
> ### Serious Violations
>
> #### 3. Clickable div is not keyboard accessible — WCAG 2.1 SC 2.1.1
> **Problem:** A `<div>` with an `onClick` handler is not reachable or activatable via keyboard.
>
> **Before:**
> ```tsx
> <div onClick={onSearch} style={{ cursor: 'pointer' }}>...</div>
> ```
>
> **Fix:**
> ```tsx
> <button type="button" onClick={onSearch} aria-label="Search">...</button>
> ```
>
> ---
>
> ### Passed Checks
> - No positive tabIndex values
> - No aria-hidden on focusable children
> - No heading hierarchy issues
