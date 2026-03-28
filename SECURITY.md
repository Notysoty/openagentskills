# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.x | ✅ |

## Reporting a Vulnerability

If you discover a security vulnerability in this project (e.g., a skill that could be used to craft a prompt injection attack, a CLI bug that exposes sensitive data, or a dependency issue), please **do not open a public GitHub issue**.

Instead, report it privately:

1. Go to the [Security tab](https://github.com/Notysoty/openagentskills/security) of this repository
2. Click **"Report a vulnerability"**
3. Describe the issue with as much detail as possible

You can expect a response within **72 hours**. We will work with you to understand and resolve the issue before any public disclosure.

## Scope

This policy covers:
- The CLI tool (`bin/cli.js`) and its dependencies
- The skills validation script (`scripts/validate-skills.js`)
- Any SKILL.md content that could enable prompt injection or other LLM-level attacks

## Out of Scope

- Vulnerabilities in the agent environments (Claude Code, Cursor, Codex, etc.) — report those to the respective vendors
- General skill quality issues — open a regular GitHub issue or PR for those
