---
name: Your Analysis Skill Name
description: One sentence describing what this skill analyzes and what insights it surfaces.
category: research
difficulty: intermediate
tags:
  - analysis
  - your-tag
author: your-github-username
---

# Your Analysis Skill Name

## What this skill does

This skill directs the agent to analyze [subject — e.g., a codebase, a dataset, a document, an API] and surface [insight type — e.g., bottlenecks, risks, gaps, patterns]. It produces a structured report with findings ranked by [priority metric — e.g., impact, severity, frequency].

Use this when you need to quickly understand [what about the subject] without manually reading every line.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/your-skill-name/SKILL.md` in your project root.

Then ask:
- *"Analyze [subject] using the [Skill Name] skill."*
- *"Run the [Skill Name] skill on [file/folder/input]."*

### Cursor

Add the **The Prompt / Instructions** section to your `.cursorrules`, or paste it into a Cursor chat before making your request.

### Codex

Paste the instructions and the content you want analyzed into the chat.

## The Prompt / Instructions for the Agent

When asked to analyze [subject] using this skill, follow these steps:

1. **Read and understand the input.** [What the agent should read/load — e.g., "Read all files in the specified directory", "Parse the provided JSON", "Scan the git log"].

2. **Collect raw data.** Extract the following for analysis:
   - [Data point 1 — e.g., "All function definitions and their call counts"]
   - [Data point 2 — e.g., "All external dependencies and their versions"]
   - [Data point 3 — e.g., "All error log entries grouped by type"]

3. **Identify patterns and anomalies.** Look for:
   - [Pattern/anomaly 1 — e.g., "Functions called more than 100 times with no caching"]
   - [Pattern/anomaly 2 — e.g., "Dependencies more than 2 major versions behind"]
   - [Pattern/anomaly 3 — e.g., "Error types occurring more than 10 times in the log"]

4. **Score or rank each finding** by [metric — e.g., "estimated performance impact", "security risk level", "fix difficulty"]:
   - High: [definition]
   - Medium: [definition]
   - Low: [definition]

5. **Produce the report** in this format:

```
## [Skill Name] Report

### Summary
[2–3 sentences: what was analyzed, key headline findings]

### Findings

#### [Finding Title] — [Severity: High/Medium/Low]
- **What:** [Description]
- **Where:** [File, line, or location]
- **Why it matters:** [Impact]
- **Recommended action:** [What to do about it]

[Repeat for each finding]

### Overall Assessment
[One paragraph: overall health/quality, top 3 priorities]
```

6. **If nothing concerning is found,** say so explicitly. Don't manufacture findings.

## Example

**Input to Agent:**
> "Analyze `src/` using the [Skill Name] skill."

**Output from Agent:**

```
## [Skill Name] Report

### Summary
Analyzed 12 files in src/. Found 2 high-priority issues and 4 medium-priority items.
Main concerns are [X] and [Y].

### Findings

#### Unindexed foreign key on `orders.user_id` — High
- **What:** The `orders` table has a foreign key to `users.id` with no index.
- **Where:** `db/schema.sql` line 34
- **Why it matters:** Full table scans on every join — will degrade at ~10K rows.
- **Recommended action:** Add `CREATE INDEX idx_orders_user_id ON orders(user_id);`

...

### Overall Assessment
The codebase is in reasonable shape. Prioritize the indexing fix before the next release,
then address the N+1 query in the dashboard loader. The remaining items can be tackled
as part of normal maintenance.
```

## Notes

- This skill works best when [ideal input conditions — e.g., "the codebase has < 50 files", "logs are in JSON format"].
- For very large inputs, run it on a specific subdirectory or file subset.
- This skill is NOT designed for [out-of-scope use case — e.g., "generating fixes, only identifying them"].
