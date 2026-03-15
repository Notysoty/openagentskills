---
name: AI Feature Spec Writer
description: Writes a complete product spec for an AI-powered feature including user stories, model requirements, fallback behavior, and evaluation criteria.
category: research
tags:
  - ai
  - product-spec
  - llm
  - feature-planning
author: simplyutils
---

# AI Feature Spec Writer

## What this skill does

This skill writes a complete product and engineering spec for an AI-powered feature. Unlike a standard feature spec, AI features require additional sections: model selection rationale, prompt strategy, fallback behavior when the model produces bad output, latency and cost budgets, evaluation criteria, and a plan for handling model updates. The output is a spec detailed enough to guide implementation and evaluation without requiring additional design sessions.

Use this before building any feature that incorporates an LLM, image model, or other AI component — especially when the feature will be customer-facing or when the output quality directly affects the user experience.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/ai-feature-spec-writer/SKILL.md` in your project root.

Then ask:
- *"Use the AI Feature Spec Writer skill to write a spec for our AI-powered email drafting feature."*
- *"Write a product spec for adding AI summarization to our dashboard using the AI Feature Spec Writer skill."*

Provide:
- A description of the feature you want to build
- The target user and their goal
- The AI capability you plan to use (text generation, classification, summarization, etc.)
- Your tech stack and any existing AI integrations
- Any constraints (latency requirements, cost budget, compliance needs)

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane with the feature description.

### Codex

Provide the feature description and context. Ask Codex to follow the instructions below to produce the spec.

## The Prompt / Instructions for the Agent

When asked to write an AI feature spec, produce a document covering all of the following sections:

### Section 1 — Feature Overview

- **Feature name and one-line description**
- **Problem being solved**: What user pain does this address? What is the current workaround?
- **Target user**: Who will use this feature?
- **Success metrics**: How will we know if this feature is successful? (Quantitative: "X% of users engage with AI suggestions"; Qualitative: "users rate suggestions as helpful")

### Section 2 — User Stories

Write 3–5 user stories in the format: "As a [user type], I want to [action], so that [outcome]."

Include at least one story for the happy path, one for the failure/fallback case (what happens when AI can't produce a good answer), and one for the user who wants to ignore or override the AI.

### Section 3 — Input and Output Contract

Define exactly:
- **Input**: What data will be sent to the model? (User-provided text, document content, structured data, conversation history)
- **Input constraints**: Min/max length, required fields, data types
- **Expected output**: What should the model return? (A paragraph? A JSON object? A list? A classification label?)
- **Output format**: If structured output is needed, define the schema
- **Output constraints**: Max length, required fields, forbidden content

### Section 4 — Model and Prompt Strategy

- **Recommended model**: Which LLM or AI model to use and why (capability, cost, latency, context window)
- **Prompt architecture**: System prompt role, user prompt structure, few-shot examples (if needed)
- **Context management**: How will you handle context length limits? What gets truncated if the input is too long?
- **Temperature / parameters**: What temperature and other parameters are appropriate for this task?

### Section 5 — Fallback and Error Handling

This section is mandatory for AI features. Define behavior for each failure scenario:

- **Model returns low-quality output**: How does the system detect this? What does the user see?
- **Model returns harmful/inappropriate content**: Content filtering strategy
- **Model API is unavailable**: Is there a degraded mode? Does the feature hide or show an error?
- **Latency exceeds threshold**: What timeout is acceptable? What happens on timeout?
- **Input is invalid or too long**: How is this handled before sending to the model?

### Section 6 — Latency and Cost Budget

- **Target latency**: What response time is acceptable for the user experience? (p50, p99 targets)
- **Cost per call**: Estimated token count × model cost per token
- **Cost per user per month**: Estimated usage × cost per call
- **Cost controls**: Rate limiting, caching of identical prompts, batching strategy

### Section 7 — Evaluation Criteria

Define how you will evaluate quality before and after launch:

- **Evaluation dataset**: How will you create a set of test cases with known-good outputs?
- **Quality metrics**: How will you measure quality? (Human preference rating, accuracy against ground truth, task success rate)
- **Regression testing**: How will you detect if a model update degrades quality?
- **A/B testing plan**: Will you compare the AI feature to a non-AI baseline?

### Section 8 — Privacy and Compliance

- **Data sent to the model**: Will any PII, sensitive data, or confidential content be included in prompts?
- **Data retention by the model provider**: What are the model provider's data retention policies?
- **User disclosure**: Does the user know they're interacting with AI?
- **Compliance requirements**: Any GDPR, HIPAA, or other regulatory requirements?

### Section 9 — Rollout Plan

- **Launch strategy**: Full launch, feature flag, gradual rollout, beta users?
- **Monitoring plan**: What will you watch in the first 48 hours after launch?
- **Rollback trigger**: What would cause you to roll back the feature?

## Example

**Input to Agent:**
> "Use the AI Feature Spec Writer skill. Feature: Add an AI 'summarize this document' button to our document management SaaS. Users upload long PDFs, and reading them is time-consuming. We want to show a 2–3 paragraph summary when they click a button. We use OpenAI. Users are enterprise knowledge workers. Documents can be up to 50 pages."

**Output from Agent:**

> # AI Feature Spec — Document Summary
>
> ## Feature Overview
> - **Name**: One-click Document Summary
> - **Description**: Generates a 2–3 paragraph plain-English summary of any uploaded document
> - **Problem**: Users spend 10–15 minutes skimming long documents to decide if they're relevant. 62% of uploaded documents are never read in full (per internal analytics).
> - **Target user**: Enterprise knowledge workers managing large document libraries
> - **Success metrics**: Summary shown-to-read rate > 70%; user satisfaction rating ≥ 4/5; time-to-first-useful-action reduced by 30%
>
> ## User Stories
>
> 1. As a knowledge worker, I want to click "Summarize" on any document and see a plain-English summary in under 10 seconds, so that I can quickly decide if the document is worth reading in full.
> 2. As a user, when the AI summary is poor or wrong, I want to clearly see that it's AI-generated and be able to dismiss it and read the original, so I don't make decisions based on bad information.
> 3. As a user viewing a 100-page document, I want to know that the summary is based on the full document (or explicitly told which portion was used), so I can trust its completeness.
>
> ## Input and Output Contract
>
> - **Input**: Extracted text from the uploaded PDF (via existing pdf-parse integration)
> - **Input constraints**: Up to 50,000 tokens (approx. 35,000 words / ~100 pages); truncated at 50 pages if longer, with a note to the user
> - **Expected output**: 2–3 paragraphs of plain English; 150–300 words total
> - **Output format**: Plain text (rendered as markdown in the UI)
>
> ## Model and Prompt Strategy
>
> - **Model**: GPT-4o-mini — adequate quality for summarization at ~10x lower cost than GPT-4o; 128K context window handles the document length
> - **System prompt**: "You are a professional document analyst. Summarize the provided document in 2–3 paragraphs. Be accurate and neutral. Do not add information not present in the document. Identify the document type (report, contract, research, etc.) in the first sentence."
> - **Temperature**: 0.3 — lower temperature for factual summarization, reduces hallucination risk
> - **Context management**: If document exceeds 50,000 tokens, summarize the first and last 25% plus any section clearly labeled "executive summary" or "conclusion"
>
> ## Fallback and Error Handling
>
> - **Low-quality output**: Show the summary with a "This summary was AI-generated. Accuracy is not guaranteed." disclaimer. Provide a "Was this helpful? 👍 👎" feedback widget.
> - **OpenAI API unavailable**: Hide the Summarize button with a tooltip: "AI summarization is temporarily unavailable." Do not surface an error page.
> - **Latency > 15 seconds**: Show a spinner with "Summarizing..." for up to 15s; if exceeded, display "Summary timed out — please try again."
> - **Document too long**: Show partial summary with: "This summary covers the first 50 pages. The document has [N] total pages."
>
> ## Cost Budget
>
> - **Estimated tokens per summary**: ~30,000 input + 300 output ≈ 30,300 tokens
> - **Cost per summary (GPT-4o-mini)**: ~$0.005
> - **Estimated usage**: 10 summaries/user/month → $0.05/user/month
> - **Cost control**: Cache summaries by document hash for 30 days; re-generate only when document is updated

## Notes

- AI feature specs are living documents. Revisit the evaluation criteria section after the first 30 days of data from real users.
- The fallback section is the most commonly skipped section in AI feature specs — and the most important. AI features that degrade gracefully build trust; ones that break visibly destroy it.
- Always disclose AI-generated content to users, even briefly. This is both an ethical requirement and increasingly a legal one.
