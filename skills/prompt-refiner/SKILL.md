---
name: Prompt Refiner
description: Improves AI prompts to be clearer, more specific, and produce more consistent outputs.
category: research
tags:
  - prompting
  - llm
  - ai
  - prompt-engineering
author: simplyutils
---

# Prompt Refiner

## What this skill does

This skill takes a rough or underperforming AI prompt and rewrites it to be clearer, more specific, and more likely to produce consistent, high-quality output from a language model. It identifies the root causes of vague or ineffective prompts — missing context, absent output format specs, ambiguous instructions — and systematically addresses each one. It also explains every change so you can learn the principles, not just get a one-time fix.

Use this when your prompts produce inconsistent results, when the model frequently misunderstands what you want, or when you're building a prompt that will run in production.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/prompt-refiner/SKILL.md` in your project root.

Then paste your prompt and ask:
- *"Use the Prompt Refiner skill to improve this prompt."*
- *"Refine this system prompt using the Prompt Refiner skill — it's producing inconsistent outputs."*

Include what the prompt is for (the model it targets, the task, what's going wrong with current outputs) to get more targeted improvements.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Paste your prompt into the chat and ask for a refinement.

### Codex

Paste your original prompt and a description of what output you're trying to achieve, then include the instructions below.

## The Prompt / Instructions for the Agent

When asked to refine a prompt, follow these steps:

1. **Analyze the original prompt for these weaknesses:**

   - **Vague task definition** — the model has to guess what "good" looks like
   - **No role assignment** — not telling the model what persona or expertise to adopt
   - **Missing output format** — no specification of length, structure, format (JSON, markdown, bullet list, etc.)
   - **Missing context** — no background about the user, use case, or constraints
   - **Ambiguous pronouns or references** — "it", "this", "the thing" without clear antecedents
   - **Conflicting instructions** — asking for brevity and comprehensiveness in the same breath
   - **No examples** — complex tasks benefit from at least one example of desired input/output
   - **No constraints** — no guidance on what to avoid or exclude
   - **Negative-only instructions** — "don't use jargon" without specifying the preferred alternative

2. **Identify which weaknesses are present** in the original prompt. Note each one specifically.

3. **Rewrite the prompt** applying these prompt engineering best practices:

   - **Assign a clear role:** Start with "You are a [specific expert/persona]..." when helpful
   - **Define the task precisely:** Use action verbs and be specific about the deliverable
   - **Specify the output format:** Length, structure, tone, and file format if relevant
   - **Provide relevant context:** Who is asking, what platform will this run on, what the output will be used for
   - **Add constraints:** What to avoid, what assumptions to make, what topics are out of scope
   - **Include an example** (few-shot) if the task is complex or the output format is unusual
   - **Use numbered steps** for multi-part tasks rather than a wall of instructions
   - **Separate system instructions from user content** using clear delimiters when relevant

4. **Explain every change** in a "Changes Made" section. For each change:
   - Name the principle applied
   - Explain what was missing in the original
   - Explain how the change addresses it

5. **Optionally provide variations** if different use cases call for different versions (e.g., a terse version vs. a detailed version, or a version for GPT-4o vs. Claude 3).

6. **Output format:**

```
## Original Prompt Analysis
**Weaknesses identified:**
- [Weakness 1]: [Explanation]
- [Weakness 2]: [Explanation]
...

---

## Refined Prompt

```
[The full rewritten prompt]
```

---

## Changes Made

### 1. [Change title]
**Principle:** [Prompt engineering principle applied]
**Before:** "[relevant original text or "(missing)"]"
**After:** "[relevant new text]"
**Why:** [Explanation]

### 2. ...

---

## Optional Variations
[If applicable, a shorter version or model-specific variant]
```

## Example

**Input to Agent:**
> "Use the Prompt Refiner skill on this prompt:
> 'Summarize this article. Make it good and clear. Don't be too long.'"

**Output from Agent:**
> ## Original Prompt Analysis
> **Weaknesses identified:**
> - **No role assignment:** The model has no persona to adopt, so it defaults to a generic voice.
> - **Vague quality standard:** "Make it good and clear" gives the model nothing concrete to optimize for.
> - **Ambiguous length constraint:** "Don't be too long" is subjective — 3 sentences? 3 paragraphs?
> - **Missing output format:** No specification of structure (paragraph, bullet points, TL;DR format, etc.).
> - **Missing audience context:** Who will read this summary? A technical reader? A general audience?
> - **No constraints on what to include:** Should the summary include the author's conclusion? Statistics? Quotes?
>
> ---
>
> ## Refined Prompt
>
> ```
> You are a professional editor writing for a general audience with no prior knowledge of the topic.
>
> Summarize the article below in exactly 3–5 sentences. Your summary must:
> - Cover the main argument or finding
> - Include the single most important supporting fact or statistic
> - End with the article's conclusion or key takeaway
> - Use plain language — avoid jargon and technical terms
> - Not exceed 100 words
>
> Article:
> """
> [INSERT ARTICLE TEXT HERE]
> """
> ```
>
> ---
>
> ## Changes Made
>
> ### 1. Added role assignment
> **Principle:** Role prompting anchors tone, vocabulary, and expertise level.
> **Before:** (missing)
> **After:** "You are a professional editor writing for a general audience..."
> **Why:** The model now has a consistent voice and knows the target reader, which shapes word choice and complexity.
>
> ### 2. Specified exact length
> **Principle:** Concrete constraints produce consistent outputs.
> **Before:** "Don't be too long"
> **After:** "exactly 3–5 sentences" and "Not exceed 100 words"
> **Why:** Two complementary length caps prevent both a single bloated sentence and five dense run-ons.
>
> ### 3. Defined required content
> **Principle:** Explicit content requirements reduce model guessing.
> **Before:** "Make it good and clear"
> **After:** Numbered list of what must appear in the summary
> **Why:** The model no longer decides what "good" means — the criteria are explicit.
>
> ### 4. Added a text delimiter
> **Principle:** Delimiters prevent prompt injection and clarify input boundaries.
> **Before:** (implied the article follows)
> **After:** `""" [INSERT ARTICLE TEXT HERE] """`
> **Why:** The triple-quote delimiter makes it unambiguous where the instructions end and the article begins.
