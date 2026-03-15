---
name: SQL Query Optimizer
description: Reviews SQL queries for performance issues and rewrites them with optimized execution plans.
category: data
tags:
  - sql
  - database
  - performance
  - optimization
author: simplyutils
---

# SQL Query Optimizer

## What this skill does

This skill directs the agent to analyze a SQL query for common performance anti-patterns and rewrite it to execute more efficiently. It checks indexes, join strategies, subquery usage, N+1 patterns, unnecessary full table scans, and more — then provides a side-by-side comparison of the original and optimized query with a plain-English explanation of each change.

Use this when a query is running slowly in production, when you're writing a complex query for the first time and want a second opinion, or when you're reviewing a pull request that touches database queries.

## How to use

### Claude Code / Cursor / Codex

Copy this file to `.agents/skills/sql-query-optimizer/SKILL.md` in your project root (for Claude Code), or add the instructions below to your `.cursorrules` (for Cursor).

Then ask:
- *"Optimize this query using the SQL Query Optimizer skill."*
- *"This query takes 3 seconds on 500k rows. Use the SQL Query Optimizer skill to improve it."*

Provide the query, and optionally:
- The database system (PostgreSQL, MySQL, SQLite, etc.)
- Relevant table schemas and row counts
- Any existing index definitions
- The `EXPLAIN` or `EXPLAIN ANALYZE` output if available

## The Prompt / Instructions for the Agent

When asked to optimize a SQL query, follow these steps:

1. **Identify the database system** (PostgreSQL, MySQL, SQLite, MSSQL). Syntax and optimizer behavior differ. If not specified, ask.

2. **Analyze for these anti-patterns in order:**

   - **Missing indexes:** Are columns in `WHERE`, `JOIN ON`, `ORDER BY`, or `GROUP BY` clauses indexed? Flag unindexed columns on large tables.
   - **SELECT *:** Does the query select all columns when only a few are needed? Unnecessary columns increase I/O and memory.
   - **N+1 queries:** Is this query run inside a loop in application code (indicated by a comment or context)? Suggest a single JOIN or subquery instead.
   - **Correlated subqueries:** Does the `WHERE` clause contain a subquery that references the outer query? These execute once per row. Rewrite as a JOIN or CTE.
   - **Non-sargable predicates:** Are functions applied to indexed columns in `WHERE` (e.g., `WHERE YEAR(created_at) = 2024`)? This prevents index use.
   - **Implicit type coercions:** Do joins compare columns of different types (e.g., `INT` vs `VARCHAR`)? This forces a full scan.
   - **Unnecessary DISTINCT or ORDER BY:** Is `DISTINCT` used where it's not needed? Is `ORDER BY` applied to a subquery that is later filtered?
   - **Large offset pagination:** Does the query use `LIMIT x OFFSET y` with a large offset? Suggest keyset pagination instead.

3. **Write the optimized query.** Use CTEs (`WITH` clauses) to improve readability when the logic is complex.

4. **List index recommendations** separately. Format as `CREATE INDEX` statements that can be run directly.

5. **Output format:**

```sql
-- ORIGINAL QUERY
[paste original here]

-- OPTIMIZED QUERY
[rewritten query here]
```

```markdown
### What changed and why

- **Change 1:** [Explanation]
- **Change 2:** [Explanation]

### Recommended indexes

\```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
\```

### Estimated impact

[Brief note on expected improvement — e.g., "This should reduce the query from a full table scan to an index seek, likely cutting execution time by 80-95% on large tables."]
```

6. If the query cannot be improved, say so explicitly and explain why.

## Example

**Input to Agent:**
> "Optimize this PostgreSQL query. The `orders` table has 2M rows. `user_id` is not indexed.
>
> ```sql
> SELECT *
> FROM orders
> WHERE user_id = 42
>   AND status = 'pending'
>   AND EXTRACT(YEAR FROM created_at) = 2025
> ORDER BY created_at DESC;
> ```"

**Output from Agent:**

```sql
-- ORIGINAL QUERY
SELECT *
FROM orders
WHERE user_id = 42
  AND status = 'pending'
  AND EXTRACT(YEAR FROM created_at) = 2025
ORDER BY created_at DESC;

-- OPTIMIZED QUERY
SELECT id, user_id, status, amount, created_at
FROM orders
WHERE user_id = 42
  AND status = 'pending'
  AND created_at >= '2025-01-01'
  AND created_at < '2026-01-01'
ORDER BY created_at DESC;
```

**What changed and why**

- **Removed SELECT *:** Selected only the columns likely needed. Reduces I/O and memory overhead.
- **Replaced EXTRACT(YEAR FROM created_at):** The function call made the query non-sargable (the index on `created_at` could not be used). Replacing it with a range predicate allows an index seek.
- **user_id filter first:** With the index below, PostgreSQL will use `user_id` to narrow rows before applying the date range filter.

**Recommended indexes**
```sql
CREATE INDEX idx_orders_user_id_status_created ON orders(user_id, status, created_at DESC);
```

**Estimated impact**

This changes a full sequential scan of 2M rows to an index scan targeting only rows for `user_id = 42`. On typical data distributions, this should reduce query time from seconds to milliseconds.

## Notes

- Always provide the database system. PostgreSQL's planner differs significantly from MySQL's.
- If you have the output of `EXPLAIN ANALYZE`, paste it — it gives the agent exact scan types and row estimates to work with.
- The skill focuses on read query optimization. For write-heavy tables, index recommendations should be weighed against insert/update overhead.
- The skill does not run queries or access your database — all analysis is based on the query text and schema information you provide.
