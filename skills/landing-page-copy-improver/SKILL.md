---
name: Landing Page Copy Improver
description: Rewrites landing page copy to be more compelling, benefit-focused, and conversion-optimized.
category: writing
tags:
  - copywriting
  - marketing
  - landing-page
  - conversion
author: simplyutils
---

# Landing Page Copy Improver

## What this skill does

This skill reviews and rewrites landing page copy to make it more compelling, clear, and conversion-focused. It identifies common copy problems — vague headlines, feature-focused (instead of benefit-focused) language, weak CTAs, missing social proof hooks, and buried value propositions — then rewrites each section following proven copywriting principles. The output is improved copy ready to test.

Use this when you're launching a new product, when your landing page isn't converting, when you're getting feedback that your copy is "boring" or "unclear," or when you want a second opinion on messaging before running paid ads.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/landing-page-copy-improver/SKILL.md` in your project root.

Then ask:
- *"Use the Landing Page Copy Improver skill to review and rewrite this landing page copy: [paste copy]."*
- *"Improve the hero section of our landing page using the Landing Page Copy Improver skill."*

Provide the existing copy — hero headline and subheadline at minimum, the full page if possible. Also share:
- Target audience
- The main benefit or value proposition
- Any copy you feel is working and don't want changed

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Then paste the copy you want improved.

### Codex

Paste the existing copy and audience context. Ask Codex to follow the instructions below to produce the rewrite.

## The Prompt / Instructions for the Agent

When asked to improve landing page copy, follow these steps:

### Step 1 — Audit the existing copy

Identify every instance of these common copy problems:

**Weak headline**
- Features instead of benefits ("We offer 256-bit encryption" vs "Your data stays private, always")
- Company-centric language ("We built a platform for..." instead of "You can now...")
- Vague value claims ("The best solution for your business")
- Missing the audience ("A tool for teams" — which teams? doing what?)

**Buried value proposition**
- The key benefit appears in paragraph 3 instead of the headline
- The visitor has to read 200 words before understanding what the product does

**Feature lists without benefit translation**
- "99.9% uptime SLA" — so what? → "Your site stays up even during traffic spikes"
- "Multi-region deployment" — so what? → "Fast load times for users anywhere in the world"

**Weak calls to action**
- Generic CTAs: "Submit", "Click here", "Learn more"
- No urgency or specificity
- No clarity about what happens after clicking

**Missing specificity**
- Vague claims: "saves you time", "improves productivity", "easy to use"
- No numbers, no concrete outcomes, no named results

**Passive or complex language**
- Long sentences with multiple clauses
- Jargon the audience doesn't use
- Passive voice: "files are processed by our system" → "we process your files"

### Step 2 — Identify the core message

Before rewriting, distill:
- **Who is this for?** (Be specific: "solo developers who hate writing Terraform by hand")
- **What does it do?** (One sentence, concrete action)
- **What is the #1 benefit?** (The single most compelling reason to use it)
- **What is the evidence / proof?** (Numbers, customer names, results)

### Step 3 — Rewrite each section

Apply these rules to every section:

**Headlines**: Lead with the outcome or transformation. Structure: [Audience] + [Achieves / Gets / No longer has to deal with] + [Specific outcome]. E.g.: "Ship production-ready APIs in half the time."

**Subheadlines**: Support the headline with one more specific detail or proof point. No jargon.

**Feature → Benefit translations**: For every feature, ask "so what does that mean for the user?" Write the answer, not the feature.

**CTAs**: Make them action + outcome specific. "Start free trial" > "Get started". "See how it works" > "Watch demo". "Get your free audit" > "Learn more".

**Body copy**: Short sentences. Max 20 words per sentence as a target. One idea per paragraph.

### Step 4 — Format the output

Provide:

1. **Critique** — A bullet-point list of the main issues found in the original copy

2. **Rewritten copy** — The full improved copy, clearly sectioned

3. **Key changes explained** — A short note on the most important changes and why they should improve performance

## Example

**Input to Agent:**
> "Use the Landing Page Copy Improver skill.
>
> Audience: small business owners
>
> Original copy:
> **Headline**: Enterprise-grade accounting software for the modern business
> **Subheadline**: Our platform provides a comprehensive suite of tools for financial management and reporting.
> **Features section**: Automated reconciliation | Multi-currency support | Role-based access control | API integrations
> **CTA**: Get Started"

**Output from Agent:**

> ## Critique
>
> - **Headline** is company/feature-focused ("enterprise-grade", "modern business") — tells small business owners nothing about their life after using this product
> - **Subheadline** is a generic filler sentence — "comprehensive suite" and "financial management" could describe any accounting tool
> - **Features list** is raw features with no benefit translation — "automated reconciliation" means nothing to a small business owner who just wants to stop spending Sundays on bookkeeping
> - **CTA** "Get Started" is generic — no specificity about what happens next or what the visitor gets
>
> ---
>
> ## Rewritten Copy
>
> **Headline**: Stop doing your books by hand. Get back to running your business.
>
> **Subheadline**: [Product name] automatically handles reconciliation, invoices, and tax prep — so you can close your books in minutes, not hours.
>
> **Features → Benefits**
> - Your transactions match themselves — no more manual reconciliation at month end
> - Invoice and get paid in any currency — no extra setup, no conversion headaches
> - Share access with your accountant without handing over your login
> - Connects to the tools you already use: Stripe, Shopify, PayPal, and more
>
> **CTA**: Try it free for 14 days — no credit card needed
>
> ---
>
> ## Key Changes
>
> - Headline now speaks directly to the pain (manual bookkeeping) and the outcome (time back)
> - Each feature is rewritten as a concrete user benefit in plain language
> - CTA now specifies what the user gets (14-day free trial) and removes the biggest friction point (credit card)

## Notes

- Always get clarity on the target audience before rewriting — "small business owners" and "enterprise CFOs" need completely different copy for the same product.
- Don't change copy the user explicitly marks as working or non-negotiable.
- Provide at least 2–3 headline options when rewriting the hero — headlines benefit most from A/B testing.
