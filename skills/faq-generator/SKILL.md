---
name: FAQ Generator
description: Generates a comprehensive FAQ section for any product, API, or documentation page.
category: writing
tags:
  - faq
  - documentation
  - content
  - ux
author: simplyutils
---

# FAQ Generator

## What this skill does

This skill generates a comprehensive, well-structured FAQ section for any product, API, feature, or documentation page. It anticipates the questions real users ask (not the questions you wish they'd ask), groups them logically, and writes clear, direct answers that actually resolve the doubt rather than redirecting to other pages. The output is ready to paste into documentation, a help center, or a landing page.

Use this when launching a new product or feature, when your support team keeps answering the same questions, when you want to reduce friction for new users, or when you're writing documentation and want to anticipate objections.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/faq-generator/SKILL.md` in your project root.

Then ask:
- *"Use the FAQ Generator skill to write FAQs for our authentication API."*
- *"Generate an FAQ for the pricing page using the FAQ Generator skill."*

Provide:
- A description of the product, API, or feature
- Any existing documentation, landing page copy, or support tickets (these reveal real questions)
- The target audience (developers, end users, business buyers, etc.)
- Any specific questions you know are common

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Provide the product description and any source material.

### Codex

Paste the product description or documentation and ask Codex to follow the instructions below to generate the FAQ.

## The Prompt / Instructions for the Agent

When asked to generate FAQs, follow these steps:

### Step 1 — Understand the subject

Before writing, identify:
- What is this product/API/feature and what does it do?
- Who is the target audience?
- What is the key value proposition?
- What are the most common points of confusion or hesitation for this type of product?
- Are there any support tickets, reviews, or forum posts that reveal real user questions?

### Step 2 — Generate questions from multiple angles

Produce questions from these perspectives:

**Getting started**
- What is this and what does it do?
- How do I sign up / get access?
- What do I need before I can use it?
- Is there a free plan / trial?

**How it works**
- How does [core feature] work?
- What happens when [common scenario]?
- What's the difference between [option A] and [option B]?

**Limitations and edge cases**
- What are the limits / quotas / rate limits?
- Does it work with [popular tool or platform]?
- What happens if [failure scenario]?

**Pricing and billing**
- How does pricing work?
- Can I cancel anytime?
- Will I be charged if [edge case]?

**Security and privacy**
- Where is my data stored?
- Is my data used to train AI / shared with third parties?
- How do I delete my account and data?

**Troubleshooting**
- Why isn't [common feature] working?
- I'm getting [common error] — what do I do?

### Step 3 — Write each answer

Rules for writing FAQ answers:
- **Start with the direct answer** — the first sentence should resolve the question. No preamble.
- **Keep answers short** — 2–4 sentences for simple answers, short paragraphs for complex ones
- **Use concrete specifics** — "up to 1,000 requests per minute" not "high rate limits"
- **Link to deeper resources** when appropriate, but the answer itself should be complete enough to stand alone
- **Match the audience's language** — developers want technical precision; end users want plain English
- **Avoid marketing fluff** — FAQs are for information, not selling

### Step 4 — Organize and format

Group questions under logical headings. Common groupings:
- General / Overview
- Getting Started
- Features & How It Works
- Pricing & Plans
- Security & Privacy
- Troubleshooting

Keep each section to 3–6 questions. If you have more, split into sub-sections.

Format each FAQ entry as:

```markdown
### [Question?]
[Direct answer. Followed by any necessary detail.]
[Optional: link to more information]
```

## Example

**Input to Agent:**
> "Use the FAQ Generator skill. Product: a file conversion API that converts PDFs to Word documents and vice versa. Target audience: developers. Free plan: 50 conversions/month, paid plan: $29/month for 5,000 conversions. Files are processed server-side and deleted after 1 hour."

**Output from Agent:**

> ## Frequently Asked Questions
>
> ### General
>
> #### What does the ConvertAPI do?
> ConvertAPI converts files between PDF and Word (DOCX) format via a simple REST API. You upload a file, specify the output format, and receive a download URL for the converted file.
>
> #### What file formats are supported?
> Currently PDF → DOCX and DOCX → PDF. Support for additional formats (XLSX, PPTX, HTML) is on the roadmap.
>
> ### Getting Started
>
> #### How do I get an API key?
> Sign up at [dashboard link]. Your API key is available immediately on the dashboard — no approval needed.
>
> #### Is there a free plan?
> Yes. The free plan includes 50 conversions per month with no credit card required. Free plan conversions are rate-limited to 5 concurrent requests.
>
> ### How It Works
>
> #### How long does a conversion take?
> Most conversions complete in 2–5 seconds. Complex documents with many images or embedded fonts may take up to 30 seconds.
>
> #### How long is my file stored?
> Uploaded files and converted outputs are automatically deleted from our servers after 1 hour. We do not retain any copies after deletion.
>
> ### Pricing
>
> #### What does the paid plan cost?
> The paid plan is $29/month and includes 5,000 conversions. Additional conversions beyond 5,000 are billed at $0.006 each.
>
> #### What happens if I exceed my monthly limit?
> On the free plan, requests beyond 50 will return a 429 error until the next billing cycle. On the paid plan, you are automatically billed for overages at $0.006 per conversion.
>
> ### Security & Privacy
>
> #### Are my files secure?
> Files are transferred over HTTPS, stored encrypted at rest, and automatically deleted after 1 hour. We do not share your files with any third party.
>
> #### Is my data used to train AI models?
> No. Your files are never used for training or any purpose other than performing the conversion you requested.
>
> ### Troubleshooting
>
> #### I'm getting a 413 error — what does it mean?
> Your file exceeds the maximum allowed size of 50 MB. Split large documents or compress images before uploading.
>
> #### My converted Word document has formatting issues — what can I do?
> Complex PDF layouts (multi-column, embedded tables) may not convert perfectly. Try enabling the `preserveLayout: true` option in your request, which uses a slower but more accurate conversion engine.

## Notes

- Real FAQs come from real questions — if you have support tickets or forum posts, use them as input. They're more valuable than guessing.
- Don't write FAQs that nobody actually asks. "What is a PDF?" is not a real FAQ for a developer API.
- Review FAQs periodically — they become outdated as the product changes.
