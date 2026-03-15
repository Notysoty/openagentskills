---
name: Hallucination Risk Reviewer
description: Reviews an AI-generated response or LLM application output for factual risks, hallucination patterns, and confidence calibration issues.
category: research
tags:
  - llm
  - ai
  - hallucination
  - evaluation
  - reliability
author: simplyutils
---

# Hallucination Risk Reviewer

## What this skill does

This skill reviews an LLM-generated response or the output of an AI-powered application feature to assess its hallucination risk. It identifies the specific types of claims that are most likely to be fabricated, flags confidence calibration issues (the model sounds certain about things it may not know), and recommends mitigations. The output is a structured risk assessment that helps you decide whether to use the output as-is, verify specific claims, or redesign the prompt/system.

Use this when building AI-powered features where factual accuracy matters, when reviewing generated content before publishing, or when evaluating whether an LLM is suitable for a high-stakes use case.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/hallucination-risk-reviewer/SKILL.md` in your project root.

Then ask:
- *"Use the Hallucination Risk Reviewer skill on this AI-generated response: [paste response]."*
- *"Review the outputs of our AI support bot for hallucination risk using the Hallucination Risk Reviewer skill."*

Provide:
- The AI-generated text or a sample of outputs
- The original prompt or context given to the model (if known)
- The use case (what decision or action will this output inform?)
- The model or system used (if known)

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Provide the output to review.

### Codex

Paste the AI output and context. Ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to review for hallucination risk, follow this framework:

### Step 1 — Identify the claim types

Read the output and categorize every substantive claim into one of these types:

**Factual claims about the world**
- Named events, dates, statistics, scientific findings
- Quotes attributed to real people
- Historical facts
- Product features, pricing, availability
- Legal or regulatory information

**Citations and references**
- Named sources, papers, URLs, book titles
- Specific page numbers, section numbers
- Author names and affiliations

**Procedural / instructional claims**
- Step-by-step instructions (especially for code, medical, legal, financial topics)
- Configuration values, command flags, API parameter names

**Numerical claims**
- Specific numbers, percentages, measurements
- Rankings, comparisons ("X is 50% faster than Y")

**Expertise-domain claims**
- Medical diagnoses or treatment recommendations
- Legal interpretations or advice
- Financial projections or recommendations
- Security vulnerability details

### Step 2 — Assess risk by claim type

Apply these risk factors:

**High hallucination risk**
- Specific citations (paper titles, URLs, DOIs) — LLMs frequently fabricate plausible-sounding citations
- Obscure or highly specific facts (niche statistics, minor historical events, specific version numbers)
- Recent events (after the model's training cutoff)
- Quotes attributed to real people
- Exact code that has been deprecated or changed since training
- Specific legal or medical guidance

**Medium hallucination risk**
- Well-known historical facts — usually correct but can be wrong on specific dates or details
- Procedural steps for common tasks — mostly correct but may have subtle errors
- Product comparisons — facts can be outdated

**Low hallucination risk**
- General conceptual explanations (how does X work in principle?)
- Mathematical reasoning and calculations (verify independently)
- Logical inferences from provided context
- Summarization of content the model was explicitly given

### Step 3 — Check for confidence calibration issues

Hallucination risk increases when the model presents uncertain or fabricated information with high confidence. Flag:
- Statements of certainty without qualifications where uncertainty is appropriate ("The regulation requires X" vs. "Based on my training data, the regulation typically requires X — verify with current sources")
- Missing hedges like "as of my training data," "approximately," "typically," "you should verify"
- Presenting a single answer to a question that legitimately has multiple correct answers depending on context

### Step 4 — Check for propagation risk

How dangerous is this hallucination if wrong?
- **High propagation risk**: Output will be published, acted on without review, or fed to another system
- **Medium propagation risk**: A human will review it before acting on it
- **Low propagation risk**: Used as a rough draft that will be heavily edited

### Step 5 — Format the risk assessment

```markdown
## Hallucination Risk Assessment

### Overall Risk Level: [Low / Medium / High / Critical]

**Use case**: [What this output will be used for]
**Propagation risk**: [How directly will this be acted upon?]

---

### High-Risk Claims (verify before using)

| # | Claim | Type | Risk Reason | Recommended Action |
|---|-------|------|-------------|-------------------|
| 1 | [Exact quote from the output] | [Citation / Specific fact / etc.] | [Why it's risky] | [Verify with X / Remove / Add hedge] |

### Medium-Risk Claims (verify if stakes are high)

[Same table format]

### Confidence Calibration Issues

| # | Statement | Issue | Suggested Rewrite |
|---|-----------|-------|-------------------|
| 1 | [Overconfident statement] | [Presents X as certain when it may be uncertain] | [Hedged version] |

### Low-Risk Content
[Summary of what can be trusted without verification]

---

### Overall Recommendation
[One of: Use as-is / Use with noted caveats / Verify flagged claims before use / Do not use without human expert review / Redesign the prompt/system]

### Systemic Mitigations
[If this is an AI application, not a one-off output: suggestions for reducing hallucination risk at the system level — RAG, grounding, output format constraints, etc.]
```

## Example

**Input to Agent:**
> "Use the Hallucination Risk Reviewer skill. Use case: AI support bot answer that will be shown directly to users.
>
> Response from the AI:
> 'According to the FDA's 2023 guidance document (FDA-2023-D-0456), medical devices with AI components must undergo a predefined change control plan (PCCP) review before deployment updates. This requirement was established following the landmark case *MedTech Corp v. FDA* (2019), and our platform is fully compliant. The PCCP must be submitted at least 90 days before any algorithm update.'"

**Output from Agent:**

> ## Hallucination Risk Assessment
>
> ### Overall Risk Level: High
>
> **Use case**: Shown directly to users without human review
> **Propagation risk**: High — users may rely on this for regulatory compliance decisions
>
> ### High-Risk Claims
>
> | # | Claim | Type | Risk Reason | Recommended Action |
> |---|-------|------|-------------|-------------------|
> | 1 | "FDA-2023-D-0456" | Specific citation | LLMs routinely fabricate plausible-sounding FDA docket numbers; this cannot be trusted without verification | Verify on FDA.gov; remove if not verifiable |
> | 2 | "*MedTech Corp v. FDA* (2019)" | Legal citation | This case name and year appear fabricated — LLMs frequently invent case names | Remove entirely; no legal citations without verified source |
> | 3 | "90 days before any algorithm update" | Specific regulatory requirement | Specific timeframes in regulatory guidance are frequently wrong in LLM outputs | Verify against the actual PCCP guidance document |
>
> ### Confidence Calibration Issues
>
> | # | Statement | Issue | Suggested Rewrite |
> |---|-----------|-------|-------------------|
> | 1 | "our platform is fully compliant" | Claims specific compliance status as fact | Remove or change to "our platform is designed to support PCCP requirements — consult our compliance documentation for details" |
>
> ### Overall Recommendation
> **Do not use without human expert review.** This response contains fabricated legal citations and potentially incorrect regulatory specifics on a high-stakes compliance topic. A regulatory/legal expert must verify every claim before this response is shown to users.
>
> ### Systemic Mitigations
> - Use RAG to ground answers in your actual verified compliance documentation — don't let the model reason from training data on regulatory topics
> - Add a system prompt constraint: "Never state specific regulation codes, docket numbers, or legal case citations unless they are explicitly provided in the context"
> - Add a human review step for responses that mention regulatory compliance

## Notes

- The risk level depends heavily on the use case. A hallucinated fact in a brainstorming session is low risk; the same hallucination in a medical or legal answer shown to users is high risk.
- Even low-risk outputs should have appropriate hedging language in high-stakes domains.
- This skill reviews one output at a time. For ongoing LLM application quality, set up an automated evaluation pipeline with a test suite of known-answer prompts.
