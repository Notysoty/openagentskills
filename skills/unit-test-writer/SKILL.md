---
name: Unit Test Writer
description: Generates comprehensive unit tests for any function or module with edge cases.
category: coding
tags:
  - testing
  - unit-tests
  - jest
  - vitest
author: simplyutils
---

# Unit Test Writer

## What this skill does

This skill directs the agent to write a thorough unit test suite for a given function, class, or module. It systematically identifies happy paths, edge cases, error paths, and boundary conditions — then writes tests in your chosen framework (Jest, Vitest, Mocha, etc.) with proper mocking where needed.

Use this when you have a function that needs test coverage or when you want to verify your implementation handles edge cases you might not have thought of.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/unit-test-writer/SKILL.md` in your project root.

Then ask the agent:
- *"Write unit tests for `src/utils/formatCurrency.ts` using the Unit Test Writer skill."*
- *"Use the Unit Test Writer skill to generate Vitest tests for this function."*

Paste the function code into the chat, or reference the file path.

### Cursor

Add the instructions from the "Prompt / Instructions" section below to your `.cursorrules`, or paste them into the Cursor AI pane before asking for tests.

### Codex

Paste your function and the instructions below into the Codex chat. Specify your test framework explicitly (Jest, Vitest, etc.) since Codex does not infer it from the project.

## The Prompt / Instructions for the Agent

When asked to write unit tests, follow these steps:

1. **Read the code.** Understand the function's:
   - Inputs (types, shapes, constraints)
   - Outputs (return type, side effects)
   - Dependencies (external calls, imports that may need mocking)
   - Error conditions (what throws, what returns null/undefined)

2. **Identify test cases in this order:**
   - **Happy path** — typical valid inputs that produce the expected output
   - **Boundary values** — min/max numbers, empty strings, empty arrays, zero
   - **Type coercions** — what happens with `null`, `undefined`, `0`, `""`, `false`
   - **Error paths** — inputs that should throw or return an error state
   - **Async edge cases** (if async) — resolved values, rejected promises, race conditions
   - **Mocked dependencies** — external calls (API, DB, filesystem) must be mocked; never make real calls in unit tests

3. **Structure the test file:**
   - One `describe` block per function or class
   - Nested `describe` blocks for logical groups (e.g., `describe('when user is not logged in', ...)`)
   - Test names must read as complete sentences: `it('returns null when input is an empty array')`
   - Keep each test focused — one assertion per test when possible, or one concept per test

4. **Mocking rules:**
   - Use `jest.mock()` / `vi.mock()` for module-level mocks
   - Use `jest.spyOn()` / `vi.spyOn()` for spying on methods without replacing the module
   - Always restore mocks in `afterEach` or use `clearMocks: true` in config
   - Mock at the boundary — mock the imported module, not internal implementation details

5. **Output format:**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'; // or jest equivalents
import { functionUnderTest } from '../path/to/module';

// Mock external dependencies
vi.mock('../path/to/dependency', () => ({
  someFunction: vi.fn(),
}));

describe('functionUnderTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('happy path', () => {
    it('returns the expected result for valid input', () => {
      // arrange
      // act
      // assert
    });
  });

  describe('edge cases', () => {
    it('returns null when input is an empty array', () => { ... });
    it('handles zero correctly', () => { ... });
  });

  describe('error handling', () => {
    it('throws TypeError when input is not a string', () => { ... });
  });
});
```

6. **After writing the tests**, list any cases you could not cover and why (e.g., untestable private methods, missing type information).

## Example

**Input to Agent:**
> "Use the Unit Test Writer skill to write Vitest tests for this function:
>
> ```typescript
> export function parsePriceString(price: string): number {
>   if (!price || typeof price !== 'string') throw new TypeError('price must be a string');
>   const cleaned = price.replace(/[$,\s]/g, '');
>   const num = parseFloat(cleaned);
>   if (isNaN(num)) throw new RangeError(`Cannot parse price from "${price}"`);
>   return num;
> }
> ```"

**Output from Agent:**
```typescript
import { describe, it, expect } from 'vitest';
import { parsePriceString } from '../utils/parsePriceString';

describe('parsePriceString', () => {
  describe('happy path', () => {
    it('parses a plain number string', () => {
      expect(parsePriceString('9.99')).toBe(9.99);
    });

    it('strips dollar signs', () => {
      expect(parsePriceString('$19.99')).toBe(19.99);
    });

    it('strips commas from large numbers', () => {
      expect(parsePriceString('$1,299.00')).toBe(1299);
    });

    it('strips leading and trailing whitespace', () => {
      expect(parsePriceString('  $5.00  ')).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('handles zero', () => {
      expect(parsePriceString('$0.00')).toBe(0);
    });

    it('handles a string with only a dollar sign as invalid', () => {
      expect(() => parsePriceString('$')).toThrow(RangeError);
    });
  });

  describe('error handling', () => {
    it('throws TypeError when price is not a string', () => {
      expect(() => parsePriceString(null as any)).toThrow(TypeError);
    });

    it('throws TypeError when price is undefined', () => {
      expect(() => parsePriceString(undefined as any)).toThrow(TypeError);
    });

    it('throws TypeError when price is an empty string', () => {
      expect(() => parsePriceString('')).toThrow(TypeError);
    });

    it('throws RangeError when string contains no numeric characters', () => {
      expect(() => parsePriceString('abc')).toThrow(RangeError);
    });
  });
});
```

## Notes

- Always specify your test framework. The skill defaults to Vitest syntax, but will adapt to Jest, Mocha, or others on request.
- If the function has many external dependencies, ask the agent to list the mocks it would need before writing the full suite.
- This skill writes the test file only — it does not modify the source file.
- For very large modules, ask for tests one exported function at a time.
