---
name: Unit Test Improver
description: Reviews existing unit tests for gaps, weak assertions, and missing edge cases, then rewrites them to be more robust.
category: coding
tags:
  - testing
  - unit-tests
  - code-quality
  - jest
author: simplyutils
---

# Unit Test Improver

## What this skill does

This skill directs the agent to review an existing set of unit tests and improve them. It looks for weak or incomplete tests — tests that pass even when the code is broken, tests that don't assert the right things, tests that are missing critical edge cases, and tests that test implementation details instead of behavior. The output is an improved, rewritten test suite that is harder to fool and more useful as a safety net.

Use this before a major refactor (so you can trust the tests will catch regressions), during a code review, or when a bug slips past your existing tests.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/unit-test-improver/SKILL.md` in your project root.

Then ask:
- *"Use the Unit Test Improver skill on `tests/cart.test.ts`."*
- *"Review and improve the unit tests for `calculateDiscount` using the Unit Test Improver skill."*

Provide both the test file and the code being tested.

### Cursor

Add the instructions below to your `.cursorrules` or paste them into the Cursor AI pane. Then share the test file and the source file side by side.

### Codex

Paste both the test file (labeled "TESTS") and the source file (labeled "SOURCE") and ask Codex to follow the instructions below.

## The Prompt / Instructions for the Agent

When asked to improve unit tests, follow these steps:

### Step 1 — Read both the tests and the source

Read the full test file. Then read the source code being tested. Understand what the function is supposed to do before evaluating whether the tests cover it.

### Step 2 — Identify test quality issues

Check every test for these problems:

**Weak assertions**
- `expect(result).toBeTruthy()` instead of `expect(result).toBe(true)` — passes for any truthy value
- `expect(result).toBeDefined()` when the actual value should be checked
- `expect(fn).not.toThrow()` without checking the return value
- Asserting on the wrong field (e.g., checking `result.id` but not `result.value`)

**Missing coverage**
- The happy path is tested but no error paths
- No tests for null/undefined inputs
- No tests for boundary values (empty array, zero, max value)
- No tests for the cases identified in the source code's conditional branches

**Tests that test implementation, not behavior**
- Asserting that a specific internal function was called, when what matters is the output
- Asserting on exact internal state that's an implementation detail
- Tests that will break if you rename a private variable

**Poor test structure**
- Tests with no clear Arrange/Act/Assert structure
- Multiple unrelated assertions in a single test (makes failures hard to diagnose)
- Test names that don't describe the expected behavior (e.g., `it('works')`)
- Setup code duplicated across many tests instead of using `beforeEach`

**Over-mocking**
- Mocking the thing being tested, not just its dependencies
- Mocking a dependency and then asserting on the mock instead of the real output
- Tests that pass even if you delete the source code (because everything is mocked)

### Step 3 — Identify missing test cases

Using the source code, enumerate every branch, condition, and edge case that should be tested. Cross-reference with the existing tests and list what's missing.

### Step 4 — Rewrite the tests

Rewrite the full test file applying these principles:

1. **Test names should be sentences**: `it('returns 0 when the cart is empty')` not `it('cart test')`
2. **One assertion per concept** — multiple `.toBe()` calls are fine if they're testing the same return value; a single test should not mix unrelated concerns
3. **Use `describe` blocks** to group tests by function or scenario
4. **Assert on the output, not the internals** — if the code produces the right result, the implementation is correct
5. **Test all branches** — every `if`, `else`, `catch`, and `switch` case should have a test
6. **Use concrete expected values** — `expect(total).toBe(29.99)` not `expect(total).toBeGreaterThan(0)`
7. **Arrange/Act/Assert** structure in every test:
   ```ts
   // Arrange
   const cart = [{ price: 10, qty: 3 }];
   // Act
   const total = calculateTotal(cart);
   // Assert
   expect(total).toBe(30);
   ```

### Step 5 — Format the output

First, provide a review summary:

```markdown
## Test Review Summary

### Issues found
- [List each issue with the test name or line number]

### Missing coverage
- [List each missing case]
```

Then provide the complete rewritten test file.

## Example

**Input to Agent:**
> "Use the Unit Test Improver skill.
>
> SOURCE (`discount.ts`):
> ```ts
> export function calculateDiscount(price: number, code: string): number {
>   if (code === 'SAVE10') return price * 0.9;
>   if (code === 'SAVE25') return price * 0.75;
>   if (price > 100) return price * 0.95;
>   return price;
> }
> ```
>
> TESTS (`discount.test.ts`):
> ```ts
> it('applies discount', () => {
>   expect(calculateDiscount(50, 'SAVE10')).toBeTruthy();
> });
> it('works', () => {
>   const result = calculateDiscount(200, '');
>   expect(result).toBeDefined();
> });
> ```"

**Output from Agent:**

> ## Test Review Summary
>
> ### Issues found
> - `'applies discount'`: Uses `toBeTruthy()` — passes for any non-zero number, wouldn't catch a bug returning the wrong discount amount
> - `'works'`: Uses `toBeDefined()` — passes as long as the function doesn't throw; doesn't verify the correct value
> - Both test names are vague and don't describe expected behavior
>
> ### Missing coverage
> - `SAVE25` code not tested
> - Price > 100 with no code not tested
> - Invalid/unknown coupon code with price ≤ 100 not tested
> - Zero price not tested
> - Negative price not tested
>
> ---
>
> ```ts
> import { calculateDiscount } from './discount';
>
> describe('calculateDiscount', () => {
>   describe('with coupon codes', () => {
>     it('applies 10% discount for SAVE10 code', () => {
>       expect(calculateDiscount(100, 'SAVE10')).toBe(90);
>     });
>
>     it('applies 25% discount for SAVE25 code', () => {
>       expect(calculateDiscount(100, 'SAVE25')).toBe(75);
>     });
>
>     it('coupon codes take priority over price-based discount', () => {
>       expect(calculateDiscount(200, 'SAVE10')).toBe(180);
>     });
>   });
>
>   describe('without coupon codes', () => {
>     it('applies 5% discount when price is above 100', () => {
>       expect(calculateDiscount(200, '')).toBe(190);
>     });
>
>     it('applies no discount when price is exactly 100', () => {
>       expect(calculateDiscount(100, '')).toBe(100);
>     });
>
>     it('applies no discount when price is below 100', () => {
>       expect(calculateDiscount(50, '')).toBe(50);
>     });
>   });
>
>   describe('edge cases', () => {
>     it('returns 0 for a zero price', () => {
>       expect(calculateDiscount(0, '')).toBe(0);
>     });
>
>     it('unknown coupon code falls through to price-based logic', () => {
>       expect(calculateDiscount(200, 'INVALID')).toBe(190);
>     });
>   });
> });
> ```

## Notes

- Always read the source code — tests cannot be properly evaluated without understanding what the code is supposed to do.
- If the source code itself has bugs, note them separately. Don't write tests that encode the buggy behavior.
- This skill rewrites tests, not source code. If improving the tests reveals a bug, flag it but don't fix it automatically.
