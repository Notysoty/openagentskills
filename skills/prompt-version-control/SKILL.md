---
name: Prompt Version Control Workflow
description: Sets up a prompt versioning system with naming conventions, diff tracking, A/B evaluation gates before promotion, and rollback triggers.
category: devops
tags:
  - llm-ops
  - prompt-engineering
  - versioning
  - ci-cd
  - evaluation
author: simplyutils
---

# Prompt Version Control Workflow

## What this skill does

This skill designs a prompt versioning workflow so you can track changes, test before promoting, and roll back safely. Most teams store prompts as hardcoded strings inside application code — this means prompt changes go unreviewed, regressions are invisible, and rollbacks require a full code deploy. This skill fixes that.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/prompt-version-control/SKILL.md` in your project root.

Then ask:
- *"Use the Prompt Version Control skill to set up versioning for our prompts."*
- *"How should we manage prompt versions across staging and production?"*

Provide:
- Number of prompts in your system
- Current storage method (hardcoded, env vars, database, files)
- Whether you need A/B testing or just safe deploys
- Tech stack

### Cursor / Codex

Describe your current prompt management alongside these instructions.

## The Prompt / Instructions for the Agent

### Step 1 — Choose a storage approach

| Approach | Best for | Tradeoffs |
|---|---|---|
| **Git files** (prompts/*.md) | Small teams, prompts change rarely | Simple, diffable, but requires deploy to change |
| **Database table** | Prompts change frequently, need hot-swap | Live updates, but needs admin UI |
| **Dedicated tools** (Braintrust, LangSmith, Langfuse) | Eval-heavy teams | Best tooling, external dependency |
| **Environment variables** | Single prompt, simple apps | Easy but no history, no diffs |

**Recommended default: Git files** — prompts are code, they should be reviewed like code.

### Step 2 — File-based prompt versioning

```
prompts/
  support-bot/
    v1.md          ← old version (keep for rollback reference)
    v2.md          ← current production version
    v3.md          ← candidate being tested
    current.txt    ← contains "v2" — points to active version
  document-summarizer/
    v1.md
    current.txt
```

Each prompt file has a frontmatter header:
```markdown
---
version: 2
created: 2026-01-15
author: tates
description: Improved tone, added JSON output format
changes_from_previous:
  - Added JSON output requirement
  - Shortened system role description
  - Added explicit refusal instructions
---

You are a customer support agent for Acme Corp...
```

Load the active prompt at runtime:
```python
import os, pathlib

def load_prompt(name: str) -> str:
    prompts_dir = pathlib.Path("prompts") / name
    current = (prompts_dir / "current.txt").read_text().strip()
    return (prompts_dir / f"{current}.md").read_text().split("---\n", 2)[-1].strip()
```

### Step 3 — Evaluation gate before promotion

Never promote a new prompt version without running evals first. Add this as a CI check:

```python
# scripts/eval-prompt-candidate.py
import sys
from eval_harness import run_eval_suite, load_dataset
from prompt_loader import load_prompt_version

PASS_THRESHOLD = 0.85  # 85% pass rate required

def main(prompt_name: str, candidate_version: str):
    dataset = load_dataset(f"evals/{prompt_name}/test_cases.json")

    current = load_prompt_version(prompt_name, "current")
    candidate = load_prompt_version(prompt_name, candidate_version)

    current_results = run_eval_suite(current, dataset)
    candidate_results = run_eval_suite(candidate, dataset)

    print(f"Current version pass rate:   {current_results['pass_rate']:.1%}")
    print(f"Candidate version pass rate: {candidate_results['pass_rate']:.1%}")

    # Block promotion if candidate is worse
    if candidate_results["pass_rate"] < PASS_THRESHOLD:
        print(f"FAIL: Candidate below {PASS_THRESHOLD:.0%} threshold")
        sys.exit(1)

    if candidate_results["pass_rate"] < current_results["pass_rate"] - 0.05:
        print("FAIL: Candidate is more than 5% worse than current")
        sys.exit(1)

    print("PASS: Candidate meets quality threshold")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
```

### Step 4 — GitHub Actions workflow

```yaml
# .github/workflows/prompt-eval.yml
name: Prompt Evaluation

on:
  pull_request:
    paths:
      - 'prompts/**'

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Detect changed prompts
        id: changes
        run: |
          git diff --name-only origin/main HEAD -- prompts/ | \
          grep -oP 'prompts/\K[^/]+' | sort -u > changed_prompts.txt
          cat changed_prompts.txt

      - name: Run evals for changed prompts
        run: |
          while read prompt_name; do
            echo "Evaluating: $prompt_name"
            # Find the candidate version (newest non-current .md)
            CANDIDATE=$(ls prompts/$prompt_name/*.md | sort -V | tail -1 | xargs basename .md)
            python scripts/eval-prompt-candidate.py "$prompt_name" "$CANDIDATE"
          done < changed_prompts.txt
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Step 5 — Promotion and rollback

**Promote a candidate to production:**
```bash
# scripts/promote-prompt.sh
PROMPT_NAME=$1
NEW_VERSION=$2

echo "$NEW_VERSION" > prompts/$PROMPT_NAME/current.txt
git add prompts/$PROMPT_NAME/current.txt
git commit -m "chore: promote $PROMPT_NAME to $NEW_VERSION"
git push
```

**Rollback (instant, no code deploy needed):**
```bash
# Roll back to previous version
echo "v1" > prompts/support-bot/current.txt
git commit -am "revert: roll back support-bot to v1 — tone regression"
git push
```

If prompts are loaded dynamically from the filesystem (not baked into a build), a rollback takes effect on the next request — no redeploy needed.

### Step 6 — Database-backed hot-swap (advanced)

For teams that need to change prompts without any deploy:

```sql
CREATE TABLE prompt_versions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  eval_pass_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  promoted_by TEXT,
  UNIQUE(name, version)
);

-- Get active prompt
SELECT content FROM prompt_versions
WHERE name = 'support-bot' AND is_active = true;

-- Promote new version (atomic swap)
BEGIN;
UPDATE prompt_versions SET is_active = false WHERE name = 'support-bot';
UPDATE prompt_versions SET is_active = true WHERE name = 'support-bot' AND version = 3;
COMMIT;
```

Cache active prompts in memory with a 5-minute TTL — re-fetch on cache miss. This gives you live prompt updates with one database query overhead.

### Naming conventions

| Convention | Example |
|---|---|
| Semantic versioning for major changes | `v1`, `v2`, `v3` |
| Date-based for frequent iteration | `2026-01-15`, `2026-02-03` |
| Feature-branch style | `v2-json-output`, `v3-shorter-tone` |

Always include in commit messages: what changed, why it changed, and eval result. Example:
```
chore: promote support-bot to v3

Changes: added JSON output format, removed verbose greeting
Reason: downstream parser requires structured output
Eval: 91% pass rate (up from 87% on v2)
```
