---
name: Form UX Optimizer
description: Reviews web forms for usability issues — field ordering, validation messages, error states, and accessibility.
category: coding
tags:
  - forms
  - ux
  - accessibility
  - frontend
author: simplyutils
---

# Form UX Optimizer

## What this skill does

This skill reviews the code and design of web forms to identify usability and accessibility issues. It checks for poor field ordering, confusing labels, missing or unhelpful error messages, incorrect input types, broken keyboard navigation, and accessibility violations. The output is a prioritized list of specific improvements with code examples for each fix.

Use this before shipping a registration, checkout, contact, or any data-entry form — especially when your form has a high abandonment rate or you're getting support requests about users not knowing what to enter.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/form-ux-optimizer/SKILL.md` in your project root.

Then ask:
- *"Use the Form UX Optimizer skill to review our checkout form in `CheckoutForm.tsx`."*
- *"Review this registration form for UX and accessibility issues using the Form UX Optimizer skill."*

Provide the form component code and, if available, any validation logic.

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Provide the form code to review.

### Codex

Paste the form HTML/JSX and validation code. Ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to review a form for UX, follow this checklist systematically:

### Category 1 — Field design and labeling

**Labels**
- Every input must have a visible `<label>` element (not just placeholder text)
- Labels must be associated with inputs via `for`/`htmlFor` or wrapping
- Placeholder text must not be used as a substitute for labels — it disappears on input and has poor contrast
- Required fields must be clearly marked (e.g., asterisk with a legend explaining it means required)

**Field order**
- Fields should follow a logical, natural sequence (name before email, shipping before billing)
- Related fields should be grouped visually and in DOM order
- The most important or most-filled field should come first, not last

**Input types**
- Phone number fields must use `type="tel"` (shows numeric keyboard on mobile)
- Email fields must use `type="email"` (enables autocomplete and basic validation)
- Number inputs must use `type="number"` where appropriate
- Date inputs must use `type="date"` or a proper date picker, not three separate text inputs
- Password fields must use `type="password"`
- Search fields must use `type="search"`

**Autocomplete**
- Common fields should have `autocomplete` attributes set: `autocomplete="email"`, `autocomplete="given-name"`, `autocomplete="tel"`, `autocomplete="current-password"`, `autocomplete="new-password"`, etc.
- This enables browser autofill and password manager integration

### Category 2 — Validation and errors

**Error messages**
- Error messages must be specific: "Email is required" is better than "Invalid input"; "Password must be at least 8 characters" is better than "Invalid password"
- Errors should tell the user what to do, not just what went wrong: "Enter a valid email address" not "Email invalid"
- Errors must appear near the field they relate to, not only at the top of the form
- Error messages must be associated with their input via `aria-describedby` or `aria-errormessage`

**Validation timing**
- Don't validate on every keystroke — it's annoying while the user is still typing
- Validate on `blur` (when the user leaves a field) for format errors
- Validate on submit for completeness

**Inline validation**
- Show a success indicator when a field is correctly filled (a checkmark) — reduces anxiety, especially for passwords and usernames
- For password strength, use a visual strength meter, not just a minimum length error

**Error state styling**
- Error states must not rely on color alone (red border alone fails WCAG for color-blind users — add an icon or text)
- Error state must be clearly visually distinct from the default state

### Category 3 — Accessibility

- Every form must have a `<form>` element (not just `<div>`)
- Submit button must be a `<button type="submit">` or `<input type="submit">` — not a `<div>` with an `onClick`
- The form must be fully operable with a keyboard alone (Tab to advance, Shift+Tab to go back, Enter to submit)
- Focus indicators must be visible — never `outline: none` without a replacement
- `aria-required="true"` should be present on required fields in addition to HTML `required`
- `aria-invalid="true"` should be set on fields with validation errors
- `aria-live="polite"` region should announce error messages to screen readers when they appear

### Category 4 — Form-level UX

- The submit button label should describe the action: "Create Account", "Place Order", "Send Message" — not just "Submit"
- Show a loading state on the submit button while the form is being processed
- After a successful submission, give clear feedback — don't just clear the form silently
- For multi-step forms, show a progress indicator
- For long forms, consider grouping with `<fieldset>` and `<legend>`

### Output format

```markdown
## Form UX Review — [Form Name]

### Critical Issues (accessibility violations or blocking UX problems)

#### 1. [Issue title]
- **Field / Location**: [Field name or line number]
- **Problem**: [What's wrong and why it matters]
- **Fix**: [Specific code change with example]

### High-Priority Issues (significant UX degradation)

[Same format]

### Warnings (minor issues or best practice gaps)

[Same format]

### What's Already Good
[Brief acknowledgment of things done well]
```

## Example

**Input to Agent:**
> "Use the Form UX Optimizer skill on this form:
> ```jsx
> <div>
>   <input placeholder="Email" onChange={...} />
>   <input placeholder="Password" type="password" onChange={...} />
>   <div onClick={handleSubmit} className="btn">Go</div>
> </div>
> ```"

**Output from Agent:**

> ## Form UX Review — Login Form
>
> ### Critical Issues
>
> #### 1. No `<label>` elements — placeholders used as labels
> - **Problem**: When the user starts typing, the placeholder disappears and they lose the field context. Screen readers also cannot reliably read placeholders as labels.
> - **Fix**:
>   ```jsx
>   <label htmlFor="email">Email</label>
>   <input id="email" type="email" placeholder="you@example.com" autocomplete="email" />
>   ```
>
> #### 2. Submit is a `<div>`, not a `<button>`
> - **Problem**: A `<div>` is not keyboard-accessible by default, is not announced as a button by screen readers, and doesn't submit the form on Enter.
> - **Fix**: `<button type="submit">Sign in</button>` — rename "Go" to something descriptive.
>
> #### 3. No `<form>` wrapper
> - **Problem**: Without a `<form>` element, the browser's built-in form submission, validation, and Enter-to-submit behavior is lost.
> - **Fix**: Wrap in `<form onSubmit={handleSubmit}>` and remove the `onClick` from the button.
>
> ### High-Priority Issues
>
> #### 4. Email input missing `type="email"`
> - **Problem**: Without `type="email"`, mobile devices show a standard keyboard instead of the optimized email keyboard. Browser-level email validation is also disabled.
> - **Fix**: `<input type="email" ... />`

## Notes

- This skill reviews code; it doesn't test the form in a browser. Some issues (focus order, screen reader behavior) require manual testing or automated tools like axe-core.
- For checkout forms, the two highest-impact fixes are usually: (1) adding autocomplete attributes and (2) improving error messages. These alone can noticeably improve completion rates.
- Run the axe browser extension on your form after implementing fixes to catch any remaining accessibility issues.
