---
name: Responsive Layout Reviewer
description: Reviews HTML/CSS or component code for responsive design issues across mobile, tablet, and desktop breakpoints.
category: coding
tags:
  - responsive
  - css
  - mobile
  - layout
  - frontend
author: simplyutils
---

# Responsive Layout Reviewer

## What this skill does

This skill reviews HTML/CSS, Tailwind, or React component code for responsive design issues. It checks for layout problems at mobile (320–480px), tablet (768–1024px), and desktop (1280px+) breakpoints, identifies common mistakes like fixed widths, missing overflow handling, inaccessible touch targets, and viewport-breaking elements, and produces a specific list of issues with exact fixes for each.

Use this during code review, before shipping a new component or page, or when a layout is broken on certain screen sizes and you need a systematic diagnosis.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/responsive-layout-reviewer/SKILL.md` in your project root.

Then ask:
- *"Use the Responsive Layout Reviewer skill on `src/components/ProductCard.tsx`."*
- *"Review this CSS for responsive issues using the Responsive Layout Reviewer skill."*

Provide the component file or the HTML/CSS to review.

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane before sharing the code to review.

### Codex

Paste the HTML/CSS or component code and ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to review for responsive design issues, check every item in this checklist:

### Breakpoints to evaluate

Unless the project uses a custom breakpoint system, evaluate at:
- **Mobile**: 320px (small phone), 375px (iPhone standard)
- **Mobile landscape**: 667px
- **Tablet**: 768px, 1024px
- **Desktop**: 1280px, 1440px
- **Wide**: 1920px

Note the breakpoint system used by the project (Tailwind defaults, Bootstrap, custom media queries) and use those values.

### Checklist

**Fixed widths**
- Any element with a hardcoded pixel width that could overflow on smaller screens (e.g., `width: 600px` without `max-width: 100%`)
- Flex or grid children with `flex: 0 0 [fixed]` that could overflow
- Tables without `overflow-x: auto` on a wrapper

**Overflow and clipping**
- Long text strings (URLs, email addresses, names) that don't have `overflow-wrap: break-word` or `text-overflow: ellipsis`
- Images without `max-width: 100%` or `width: 100%`
- Horizontal scroll introduced by an element wider than the viewport
- `overflow: hidden` on a parent that clips important content on small screens

**Typography**
- Font sizes below 16px on mobile (causes iOS to auto-zoom on input focus)
- `line-height` too tight for small screens
- Heading sizes that remain large on mobile without downscaling

**Touch targets**
- Clickable elements smaller than 44×44px (Apple HIG) or 48×48dp (Material Design) on mobile
- Links or buttons too close together without sufficient spacing (< 8px gap)
- Hover-only interactions with no touch equivalent

**Navigation**
- Desktop navigation that doesn't adapt (no mobile menu, items overflow, hamburger missing)
- Dropdown menus that don't work on touch devices

**Spacing and padding**
- Elements with no padding on small screens, causing content to touch the screen edge
- Fixed margins that eat into usable space on narrow screens

**Images and media**
- `<img>` without `width` and `height` attributes (causes layout shift)
- Background images without `background-size: cover` or equivalent
- Video embeds with no responsive wrapper (`padding-top: 56.25%; position: relative`)

**Flexbox and grid**
- `flex-wrap: nowrap` on a row that can't fit all items at small sizes
- Grid with fixed column counts that should switch to fewer columns on mobile
- `gap` values that are too large on mobile

**Input fields and forms**
- Inputs without `width: 100%` or equivalent on mobile
- `font-size` below 16px on inputs (triggers iOS zoom)
- Select dropdowns with fixed widths that overflow

### Output format

```markdown
## Responsive Layout Review — [Component/File]

### Critical Issues (will break layout or block usage on mobile)

#### 1. [Issue title]
- **Breakpoint affected**: [e.g., 320px–768px]
- **Location**: [CSS class, line number, or component prop]
- **Problem**: [What breaks and why]
- **Fix**: [Exact CSS/Tailwind/code change]

### High-Priority Issues (visible problems, degrades UX significantly)

[Same format]

### Warnings (minor issues or edge cases)

[Same format]

### What's Working Well
[Brief note on responsive patterns already done correctly]
```

## Example

**Input to Agent:**
> "Use the Responsive Layout Reviewer skill on this component:
>
> ```tsx
> <div style={{ display: 'flex', gap: 24 }}>
>   <img src={product.image} style={{ width: 300, height: 300 }} />
>   <div style={{ width: 400 }}>
>     <h2 style={{ fontSize: 28 }}>{product.name}</h2>
>     <p style={{ fontSize: 14 }}>{product.description}</p>
>     <button style={{ padding: '4px 8px', fontSize: 12 }}>Add to cart</button>
>   </div>
> </div>
> ```"

**Output from Agent:**

> ## Responsive Layout Review — ProductCard
>
> ### Critical Issues
>
> #### 1. Fixed widths cause overflow on mobile
> - **Breakpoint affected**: All screens below 724px (300 + 400 + 24 gap = 724px minimum width)
> - **Location**: `img` width 300px, inner `div` width 400px
> - **Problem**: The total minimum width (724px) exceeds most phone screens, causing horizontal scroll
> - **Fix**: Remove fixed widths; use `flex: 1` on the text div and `flex-shrink: 0` on the image, or switch to a column layout below 640px:
>   ```css
>   @media (max-width: 640px) {
>     .card { flex-direction: column; }
>     .card img { width: 100%; height: auto; }
>   }
>   ```
>
> ### High-Priority Issues
>
> #### 2. Touch target too small
> - **Breakpoint affected**: Mobile
> - **Location**: `button` with `padding: 4px 8px`
> - **Problem**: The button is approximately 30px tall — well below the 44px minimum for comfortable touch interaction
> - **Fix**: `padding: '12px 20px'` — this produces a taller target and also improves visual balance
>
> #### 3. Font size below 16px on mobile
> - **Location**: `<p>` with `fontSize: 14` and `<button>` with `fontSize: 12`
> - **Problem**: On iOS, inputs and interactive elements with `font-size < 16px` trigger page zoom on focus. Also, 12px text is hard to read on small screens.
> - **Fix**: Set body text to minimum 16px; button text to 14–16px

## Notes

- Static code review can catch most structural issues, but testing in actual browser DevTools (or on a real device) is still necessary for confirming scroll and touch behavior.
- Tailwind projects should use the `sm:`, `md:`, `lg:` prefixes consistently — look for Tailwind utilities with no mobile-first base value.
- For complex layouts, suggest testing with Chrome DevTools Device Mode at 375px width as a baseline.
