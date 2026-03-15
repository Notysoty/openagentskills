---
name: Database Schema Reviewer
description: Reviews database schemas for normalization issues, missing indexes, naming inconsistencies, and scalability risks.
category: data
tags:
  - database
  - sql
  - schema
  - postgresql
  - mysql
author: simplyutils
---

# Database Schema Reviewer

## What this skill does

This skill directs the agent to review a database schema — provided as SQL DDL, an ORM model file (Drizzle, Prisma, SQLAlchemy, ActiveRecord, etc.), or a plain description — and produce a prioritized list of issues. It checks normalization, indexes, constraints, naming conventions, nullable columns, and overall scalability. Every issue includes a concrete SQL or ORM fix.

Use this before deploying a new schema to production, during code review of a migration file, or when a database is growing and you're starting to feel query pain.

## How to use

### Claude Code / Cline

Copy this file to `.agents/skills/database-schema-reviewer/SKILL.md` in your project root.

Then share your schema and ask:
- *"Use the Database Schema Reviewer skill on `shared/schema.ts`."*
- *"Review this SQL migration file for schema issues using the Database Schema Reviewer skill."*

Provide the full schema file, a SQL DDL dump, or paste the relevant CREATE TABLE statements.

### Cursor

Add the "Prompt / Instructions" section to your `.cursorrules` file. Open your schema or migration file and ask Cursor to review it.

### Codex

Paste the schema DDL or ORM model definitions into the chat along with the instructions below. Include any known query patterns if you want index recommendations tailored to your workload.

## The Prompt / Instructions for the Agent

When asked to review a database schema, follow these steps:

1. **Parse the schema.** Accept any format:
   - SQL DDL (`CREATE TABLE` statements)
   - Prisma schema (`model` blocks)
   - Drizzle ORM table definitions
   - SQLAlchemy/Django/ActiveRecord model classes
   - A plain-text description of tables and columns

2. **Check normalization:**
   - **1NF:** Flag any column that stores multiple values (comma-separated lists, JSON arrays used as a substitute for a proper relation)
   - **2NF:** In tables with composite primary keys, flag non-key columns that depend on only part of the key
   - **3NF:** Flag transitive dependencies — non-key columns that describe another non-key column rather than the primary key (e.g., `zip_code` and `city` in the same table as `user_id`)

3. **Check indexes:**
   - Foreign key columns almost always need an index — flag any FK column without one
   - Columns frequently used in `WHERE`, `ORDER BY`, or `JOIN` conditions should be indexed — infer from column names (e.g., `email`, `status`, `created_at`, `user_id`)
   - Unique constraints are implicit indexes, but flag columns that should be unique but aren't (e.g., `email` in a users table)
   - Flag any table with no index beyond its primary key if it's likely to be queried by non-PK columns

4. **Check constraints:**
   - Flag foreign key relationships that exist logically but have no `REFERENCES` constraint
   - Flag columns that should have `NOT NULL` but are nullable: primary-purpose columns like `email`, `name`, `created_at`
   - Flag columns that should have a `DEFAULT` value but don't (e.g., `created_at`, boolean flags)
   - Flag missing `ON DELETE` / `ON UPDATE` behavior on foreign keys

5. **Check naming conventions:**
   - Table names should be consistent: all lowercase_snake_case plural, or all PascalCase — flag inconsistencies
   - Column names should be consistent: all lowercase_snake_case — flag camelCase or mixed styles
   - Primary keys should consistently be named `id` (or `table_id`) — flag non-standard PK names
   - Foreign keys should be named `referenced_table_id` — flag deviations
   - Boolean columns should be named with `is_`, `has_`, or `can_` prefix — flag ambiguous names like `active` or `enabled`

6. **Flag scalability risks:**
   - Using `TEXT` or `VARCHAR(MAX)` for columns that are used in `WHERE` clauses or indexes
   - Storing large blobs (images, documents) in the database instead of referencing an object store
   - Tables that are likely to grow very large with no partitioning strategy mentioned
   - Using `ENUM` types in PostgreSQL/MySQL where the values change frequently (painful to alter)
   - `SELECT *` traps: wide tables with many columns that are rarely all needed together (suggest splitting)

7. **Suggest missing tables or relationships** if the schema implies data that has no home (e.g., a `role` column on users with no `roles` table, suggesting future extensibility issues).

8. **Prioritize findings:**
   - **High** — data integrity risk or will cause query failures at scale
   - **Medium** — performance risk or maintainability issue
   - **Low** — style/convention issue

9. **Output format:**

```
## Schema Review Results

### Summary
[X] High · [Y] Medium · [Z] Low findings across [N] tables

---

### High Priority

#### [Issue title] — [Table.column]
**Problem:** [Plain English explanation]
**Risk:** [What goes wrong if this isn't fixed]
**Fix:**
```sql
[concrete SQL or ORM fix]
```

---
[repeat by priority level]

### Passed Checks
- [List areas that look good]
```

## Example

**Input to Agent:**
> "Use the Database Schema Reviewer skill on this schema:
>
> ```sql
> CREATE TABLE users (
>   id SERIAL PRIMARY KEY,
>   name VARCHAR(255),
>   email VARCHAR(255),
>   role VARCHAR(50),
>   address TEXT,
>   city VARCHAR(100),
>   zip VARCHAR(20),
>   created TIMESTAMP
> );
>
> CREATE TABLE orders (
>   order_id SERIAL PRIMARY KEY,
>   userId INTEGER,
>   items TEXT,
>   status VARCHAR(50),
>   total DECIMAL(10,2)
> );
> ```"

**Output from Agent:**
> ## Schema Review Results
>
> ### Summary
> 4 High · 3 Medium · 2 Low findings across 2 tables
>
> ---
>
> ### High Priority
>
> #### Missing UNIQUE constraint on users.email
> **Problem:** Email is the primary identifier for login but has no unique constraint. Duplicate accounts can be created.
> **Risk:** Authentication bugs, data corruption, duplicate account merging nightmare.
> **Fix:**
> ```sql
> ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
> CREATE INDEX idx_users_email ON users (email);
> ```
>
> #### orders.userId has no foreign key constraint
> **Problem:** `userId` references the `users` table logically but has no `REFERENCES` constraint. Orphaned orders with deleted users will exist silently.
> **Risk:** Referential integrity violations, broken order history views.
> **Fix:**
> ```sql
> ALTER TABLE orders ADD CONSTRAINT fk_orders_user
>   FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT;
> CREATE INDEX idx_orders_user_id ON orders (userId);
> ```
>
> #### orders.items stores multiple values in a TEXT column (1NF violation)
> **Problem:** Storing order items as a text blob violates first normal form and makes querying individual items impossible without string parsing.
> **Risk:** Impossible to query "which orders contain product X", no referential integrity on items.
> **Fix:** Create an `order_items` table:
> ```sql
> CREATE TABLE order_items (
>   id SERIAL PRIMARY KEY,
>   order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
>   product_id INTEGER NOT NULL,
>   quantity INTEGER NOT NULL DEFAULT 1,
>   unit_price DECIMAL(10,2) NOT NULL
> );
> ```
>
> ---
>
> ### Medium Priority
>
> #### users.city and users.zip are a transitive dependency (3NF violation)
> **Problem:** City and zip code describe each other, not the user. Moving address data to an `addresses` table is cleaner for reuse and consistency.
>
> #### users.created should be NOT NULL with a DEFAULT
> **Fix:** `created TIMESTAMP NOT NULL DEFAULT NOW()`
>
> #### Naming inconsistency: orders uses order_id and userId (mixed conventions)
> **Fix:** Rename to `id` and `user_id` to match PostgreSQL snake_case convention.
>
> ---
>
> ### Passed Checks
> - Primary keys are present on both tables
> - DECIMAL used correctly for monetary values (not FLOAT)
