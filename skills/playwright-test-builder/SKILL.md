---
name: Playwright Test Builder
description: Generates robust Playwright end-to-end tests for web pages and user flows.
category: coding
tags:
  - testing
  - playwright
  - e2e
  - automation
author: simplyutils
---

# Playwright Test Builder

## What this skill does

This skill directs the agent to write well-structured Playwright end-to-end tests for a given user flow or page. It produces tests with proper locator strategies (preferring accessible selectors over brittle CSS), meaningful assertions at every step, correct async/await handling, and solid setup/teardown. The output is ready to drop into a `tests/` folder and run immediately.

Use this when you want reliable E2E coverage for critical user journeys — login, checkout, form submission, navigation flows — without writing boilerplate from scratch.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/playwright-test-builder/SKILL.md` in your project root.

Then describe the flow you want tested and ask:
- *"Use the Playwright Test Builder skill to write E2E tests for the login flow."*
- *"Write Playwright tests for the checkout process using the Playwright Test Builder skill."*

Provide the page URL (or a description of the UI), the steps in the flow, and any known selectors or data-testid values if you have them.

### Cursor

Add the "Prompt / Instructions" section below to your `.cursorrules` file. Then describe the flow to test in the chat.

### Codex

Paste the relevant HTML or React component code alongside the flow description and the instructions below. Seeing the actual markup helps Codex pick the most stable locators.

## The Prompt / Instructions for the Agent

When asked to write Playwright tests, follow these steps:

1. **Understand the flow.** Ask for (or infer from context):
   - The URL or page being tested
   - The steps a user takes (click X, fill Y, expect Z)
   - Any test data needed (usernames, passwords, form values)
   - Whether authentication is required before the test

2. **Choose locators in this priority order** (most stable first):
   - `getByRole()` with accessible name — best for buttons, links, inputs, headings
   - `getByLabel()` — for form fields with associated labels
   - `getByText()` — for elements identified by their visible text
   - `getByPlaceholder()` — for inputs with placeholder text
   - `getByTestId()` — when `data-testid` attributes are present
   - CSS selectors — only as a last resort; avoid if any stable alternative exists
   - Never use XPath unless absolutely necessary

3. **Add assertions at every meaningful step.** After each action, assert:
   - A visible UI change (new element appears, text changes, URL changes)
   - Not just "click and hope" — every interaction must have a follow-up assertion
   - Use `expect(locator).toBeVisible()`, `toHaveText()`, `toHaveURL()`, `toBeEnabled()`, etc.

4. **Structure the test file properly:**
   - Use `test.describe` to group related tests
   - Use `test.beforeEach` for shared setup (navigation, login)
   - Use `test.afterEach` or `test.afterAll` for cleanup if needed
   - Give each `test()` a descriptive name starting with a verb: "shows...", "allows...", "prevents..."
   - Keep each test focused on one behavior

5. **Handle async correctly.** Every `page.click`, `page.fill`, `page.goto`, and `expect` must be awaited. Never use `setTimeout` for waiting — use `page.waitForSelector`, `page.waitForURL`, or rely on Playwright's auto-waiting.

6. **Add resilience where appropriate:**
   - For flaky elements (animations, lazy-loaded content), use `expect(locator).toBeVisible({ timeout: 5000 })`
   - For network-dependent tests, consider `page.waitForResponse()` or mock the network with `page.route()`
   - Avoid hard-coded `page.waitForTimeout()` sleeps — use condition-based waits

7. **Include a Page Object Model class** if the flow spans multiple pages or the test is complex. Keep it in a separate `pages/` subfolder.

8. **Output the complete, runnable test file** with all imports. Include a comment block at the top describing what the test suite covers.

## Example

**Input to Agent:**
> "Use the Playwright Test Builder skill to write tests for our sign-up flow. The user goes to `/register`, fills in their name, email, and password, clicks 'Create Account', and should land on `/dashboard` with a welcome message."

**Output from Agent:**
> ```typescript
> import { test, expect } from '@playwright/test';
>
> /**
>  * Tests for the user registration flow.
>  * Covers: form validation, successful account creation, post-signup redirect.
>  */
>
> test.describe('Registration flow', () => {
>   test.beforeEach(async ({ page }) => {
>     await page.goto('/register');
>     await expect(page).toHaveURL('/register');
>   });
>
>   test('shows the registration form', async ({ page }) => {
>     await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
>     await expect(page.getByLabel('Full name')).toBeVisible();
>     await expect(page.getByLabel('Email')).toBeVisible();
>     await expect(page.getByLabel('Password')).toBeVisible();
>     await expect(page.getByRole('button', { name: 'Create Account' })).toBeEnabled();
>   });
>
>   test('allows a new user to register and redirects to dashboard', async ({ page }) => {
>     await page.getByLabel('Full name').fill('Jane Smith');
>     await page.getByLabel('Email').fill('jane@example.com');
>     await page.getByLabel('Password').fill('SecurePass123!');
>
>     await page.getByRole('button', { name: 'Create Account' }).click();
>
>     await expect(page).toHaveURL('/dashboard');
>     await expect(page.getByText('Welcome, Jane')).toBeVisible();
>   });
>
>   test('shows a validation error when email is already taken', async ({ page }) => {
>     await page.getByLabel('Full name').fill('Existing User');
>     await page.getByLabel('Email').fill('existing@example.com');
>     await page.getByLabel('Password').fill('SecurePass123!');
>
>     await page.getByRole('button', { name: 'Create Account' }).click();
>
>     await expect(page.getByRole('alert')).toContainText('already in use');
>     await expect(page).toHaveURL('/register');
>   });
>
>   test('prevents submission when required fields are empty', async ({ page }) => {
>     await page.getByRole('button', { name: 'Create Account' }).click();
>
>     // Form should not navigate away
>     await expect(page).toHaveURL('/register');
>     await expect(page.getByLabel('Email')).toBeFocused();
>   });
> });
> ```
