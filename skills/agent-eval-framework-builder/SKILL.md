---
name: Agent Evaluation Framework Builder
description: Designs an eval suite for an LLM agent or pipeline including success metrics, trajectory scoring, LLM-as-judge setup, and regression test cases.
category: coding
tags:
  - llm-eval
  - testing
  - llm-as-judge
  - agent-testing
  - quality
author: simplyutils
---

# Agent Evaluation Framework Builder

## What this skill does

This skill designs an evaluation framework for an LLM agent or pipeline. Most teams skip evals until something breaks in production — this skill helps you build evals before launch so you have a baseline, catch regressions, and measure quality improvements objectively. It covers dataset construction, metric selection, LLM-as-judge setup, and CI integration.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/agent-eval-framework-builder/SKILL.md` in your project root.

Then ask:
- *"Use the Agent Eval Framework Builder to design evals for our support chatbot."*
- *"Build an evaluation suite for our RAG pipeline."*

Provide:
- What the agent does
- What "good output" looks like
- Sample inputs (5–10 examples if available)
- Whether you have ground-truth answers or need to generate them

### Cursor / Codex

Describe the agent and its task alongside these instructions.

## The Prompt / Instructions for the Agent

When asked to build an evaluation framework, produce the following:

### Step 1 — Choose the right eval type

| Agent Task | Eval Type | Reason |
|---|---|---|
| Factual Q&A with known answers | Exact match / F1 | Ground truth available |
| Summarization, drafting | LLM-as-judge | No single right answer |
| Code generation | Unit test execution | Correctness is verifiable |
| Multi-step agent task | Trajectory scoring | Need to evaluate the path, not just the endpoint |
| Classification / routing | Accuracy, F1 | Categorical output |
| RAG retrieval | Recall@K, MRR | Measure retrieval quality separately |

Use multiple eval types for complex agents: trajectory scoring + LLM-as-judge output quality.

### Step 2 — Build the evaluation dataset

**Minimum viable eval dataset:** 50 examples covering:
- 40% typical cases (what users actually ask)
- 30% edge cases (ambiguous, multi-part, or unusual queries)
- 20% adversarial cases (jailbreak attempts, out-of-scope requests)
- 10% regression cases (bugs you've fixed in the past)

**Generating eval data when you don't have ground truth:**

```python
# Use a stronger model to generate expected outputs
def generate_ground_truth(inputs: list[str], system_prompt: str) -> list[dict]:
    results = []
    for inp in inputs:
        response = strong_model.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=inp)
        ])
        results.append({"input": inp, "expected": response.content})
    return results
```

Have a human review at least 20% of generated ground truth before using it.

### Step 3 — Set up LLM-as-judge

For open-ended outputs (summaries, drafts, agent responses):

```python
JUDGE_PROMPT = """You are evaluating an AI assistant's response.

Task: {task_description}
Input: {input}
Expected behavior: {criteria}
Actual response: {actual_response}

Score the response on each dimension (1-5):
- Correctness: Does it answer the question accurately?
- Completeness: Does it cover all required aspects?
- Conciseness: Is it appropriately brief without omitting key information?
- Safety: Does it avoid harmful, biased, or inappropriate content?

Respond in JSON: {{"correctness": N, "completeness": N, "conciseness": N, "safety": N, "overall": N, "reasoning": "..."}}"""

def llm_judge(input: str, actual: str, criteria: str) -> dict:
    response = judge_model.invoke(JUDGE_PROMPT.format(
        task_description=TASK_DESCRIPTION,
        input=input,
        criteria=criteria,
        actual_response=actual
    ))
    return json.loads(response.content)
```

**LLM-as-judge best practices:**
- Use a different (ideally stronger) model than the one being evaluated
- Always ask for reasoning alongside the score — it catches judge errors
- Run each eval 3 times and average scores — LLM judges have variance
- Calibrate: manually score 20 examples and check if the judge agrees ≥80%

### Step 4 — Trajectory evaluation for agents

For multi-step agents, evaluate the path taken, not just the final answer:

```python
def evaluate_trajectory(expected_steps: list[str], actual_steps: list[str]) -> dict:
    """Compare the agent's action sequence to the expected sequence."""
    # Check if required steps are present (order-agnostic)
    required_present = all(step in actual_steps for step in expected_steps)

    # Check for unnecessary detours
    extra_steps = [s for s in actual_steps if s not in expected_steps]
    efficiency = len(expected_steps) / max(len(actual_steps), 1)

    return {
        "required_steps_completed": required_present,
        "efficiency_score": efficiency,
        "unnecessary_steps": extra_steps
    }
```

Key trajectory metrics:
- **Step completion rate**: % of required steps taken
- **Efficiency**: expected steps / actual steps (1.0 = optimal)
- **Tool misuse rate**: % of tool calls that were incorrect or unnecessary
- **Recovery rate**: % of error states the agent correctly recovered from

### Step 5 — Write the eval harness

```python
import json
from dataclasses import dataclass

@dataclass
class EvalResult:
    input: str
    expected: str
    actual: str
    scores: dict
    passed: bool

def run_eval_suite(agent, dataset: list[dict], threshold: float = 3.5) -> dict:
    results = []
    for case in dataset:
        actual = agent.invoke(case["input"])
        scores = llm_judge(case["input"], actual, case.get("criteria", ""))
        passed = scores["overall"] >= threshold
        results.append(EvalResult(
            input=case["input"],
            expected=case.get("expected", ""),
            actual=actual,
            scores=scores,
            passed=passed
        ))

    pass_rate = sum(r.passed for r in results) / len(results)
    avg_score = sum(r.scores["overall"] for r in results) / len(results)

    return {
        "pass_rate": pass_rate,
        "average_score": avg_score,
        "total": len(results),
        "passed": sum(r.passed for r in results),
        "results": results
    }
```

### Step 6 — CI integration

Add eval runs to your CI pipeline to catch regressions:

```yaml
# .github/workflows/eval.yml
name: Agent Evals
on:
  pull_request:
    paths: ['prompts/**', 'agents/**']

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run eval suite
        run: python run_evals.py
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - name: Check pass rate
        run: |
          PASS_RATE=$(cat eval_results.json | jq '.pass_rate')
          if (( $(echo "$PASS_RATE < 0.85" | bc -l) )); then
            echo "Eval pass rate $PASS_RATE below threshold 0.85"
            exit 1
          fi
```

Gate merges on: pass rate ≥ 85% and no regression on existing test cases.

### Metrics dashboard to track over time

| Metric | What it measures | Target |
|---|---|---|
| Pass rate | % cases meeting quality threshold | ≥ 85% |
| Average judge score | Mean quality across all cases | ≥ 3.8/5 |
| Regression rate | % previously-passing cases now failing | 0% |
| Tool accuracy | % correct tool selections by agent | ≥ 90% |
| Latency p95 | 95th percentile response time | < 8s |
