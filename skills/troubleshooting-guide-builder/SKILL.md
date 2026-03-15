---
name: Troubleshooting Guide Builder
description: Builds a structured troubleshooting guide with symptom → cause → fix format for any tool or system.
category: writing
tags:
  - troubleshooting
  - documentation
  - support
  - dx
author: simplyutils
---

# Troubleshooting Guide Builder

## What this skill does

This skill builds a structured troubleshooting guide that maps symptoms to causes to fixes for any software tool, API, or system. Each entry follows a consistent format: what the user experiences, why it happens, and exactly how to fix it — including specific commands, configuration changes, or code snippets. The result is a guide that developers or support staff can scan quickly to resolve issues without digging through source code or guessing.

Use this when writing documentation for a new tool, after an incident reveals a common failure mode, when your support team keeps answering the same questions, or when preparing runbooks for operational issues.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/troubleshooting-guide-builder/SKILL.md` in your project root.

Then ask:
- *"Use the Troubleshooting Guide Builder skill to write a troubleshooting guide for our CLI tool."*
- *"Build a troubleshooting guide for the most common deployment errors using the Troubleshooting Guide Builder skill."*

Provide:
- A description of the tool, API, or system
- A list of known issues, error messages, or symptoms (ideally from real support cases)
- Any relevant error codes, configuration options, or environment details

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Provide the tool description and known issues.

### Codex

Paste the tool description, error messages, and any existing support notes. Ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to build a troubleshooting guide, follow these steps:

### Step 1 — Gather known issues

If given a list of symptoms or errors, use them as the basis. If not, generate a comprehensive list of likely issues by thinking through:
- Installation and setup failures
- Authentication and permissions errors
- Configuration mistakes
- Rate limits and quota errors
- Network and connectivity issues
- Common misunderstandings about how the tool works
- Environment-specific issues (OS, version, dependencies)
- Data format or validation errors

### Step 2 — For each issue, define the three parts

Every troubleshooting entry must have:

1. **Symptom** — What does the user actually see? Use the exact error message if possible. Be specific: "The command exits with code 1 and prints `Error: ECONNREFUSED`" is better than "it doesn't work."

2. **Cause** — Why does this happen? This is the technical explanation. Keep it brief (1–3 sentences) but accurate enough that an informed reader understands the underlying mechanism.

3. **Fix** — The exact steps to resolve it. Use numbered steps for multi-step fixes. Include specific commands, file paths, config values, or code snippets. The fix must be actionable — not "check your configuration" but "open `~/.config/tool.json` and ensure `timeout` is set to a value greater than 0."

### Step 3 — Add diagnostic steps where needed

For issues where the fix isn't the same for everyone, add a diagnostic section before the fix:

```
**How to diagnose**: Run `tool --verbose` and look for the line starting with "Connection". If it shows "refused", the server is not running. If it shows "timeout", the server is running but unreachable.
```

### Step 4 — Organize by category

Group issues into logical categories. Common categories:
- Installation & Setup
- Authentication & Permissions
- Configuration
- Network & Connectivity
- Rate Limits & Quotas
- Data & Input Errors
- Performance
- Common Misunderstandings

### Step 5 — Format the guide

```markdown
# Troubleshooting Guide — [Tool/System Name]

## Quick Reference

| Symptom | Section |
|---------|---------|
| [Short symptom description] | [Category] |
| ... | ... |

---

## [Category Name]

### [Short symptom title]

**Symptom**
[Exact error message or description of what the user sees]

**Cause**
[Brief technical explanation of why this happens]

**Fix**
1. [Step 1]
2. [Step 2]

[or for single-step: just the fix as a paragraph or code block]

**Still not working?**
[Optional: what to check next or where to get help]

---

[Repeat for each issue]
```

### Step 6 — Include a "Before You Start" section

At the top, add a short section with universal first steps that resolve many issues:
- Check the current version: `tool --version`
- Check the logs: where are they?
- Enable verbose mode: how?
- Verify the environment: key environment variables to check

## Example

**Input to Agent:**
> "Use the Troubleshooting Guide Builder skill for our CLI deployment tool called `deploytool`. Known issues from support:
> 1. Deploy hangs forever
> 2. 'Invalid credentials' error even with correct API key
> 3. 'Region not found' error
> 4. Deployed version doesn't match local version"

**Output from Agent:**

> # Troubleshooting Guide — deploytool
>
> ## Before You Start
>
> Run these commands before diving into specific issues:
> ```bash
> deploytool --version          # Check you're on the latest version
> deploytool config show        # Review current configuration
> deploytool deploy --verbose   # Enable verbose logs for your next deploy
> ```
>
> ---
>
> ## Authentication
>
> ### "Invalid credentials" error even with the correct API key
>
> **Symptom**
> ```
> Error: Invalid credentials. Check your DEPLOYTOOL_API_KEY.
> ```
>
> **Cause**
> The API key is read from the `DEPLOYTOOL_API_KEY` environment variable. If the variable is set in a `.env` file but the file isn't loaded, or if the variable name has a typo, the tool falls back to an empty string and authentication fails.
>
> **Fix**
> 1. Confirm the variable is set: `echo $DEPLOYTOOL_API_KEY`
> 2. If empty, export it: `export DEPLOYTOOL_API_KEY=your_key_here`
> 3. Verify it's the correct key in your [dashboard](https://example.com/dashboard)
> 4. If using a `.env` file, ensure your shell loads it: `source .env`
>
> ---
>
> ## Deployment Issues
>
> ### Deploy hangs and never completes
>
> **Symptom**
> The `deploytool deploy` command starts but never finishes, even after several minutes.
>
> **Cause**
> The tool waits for a health check response from the deployed service. If the service fails to start or the health check endpoint isn't reachable, the deploy hangs until a 10-minute timeout.
>
> **How to diagnose**
> Run with `--verbose` and look for "Waiting for health check at...". Navigate to that URL in a browser — if it returns an error, your application failed to start.
>
> **Fix**
> 1. Check your application logs: `deploytool logs --tail 50`
> 2. Fix the application error causing startup failure
> 3. Re-deploy: `deploytool deploy`
>
> If your service intentionally has no health check: `deploytool deploy --no-health-check`

## Notes

- Use exact error messages in the Symptom section — users search for the literal error text they see.
- The Fix section should be written so a tired developer can follow it at 2am without thinking. Be explicit.
- Update this guide after every incident where an issue wasn't already covered.
