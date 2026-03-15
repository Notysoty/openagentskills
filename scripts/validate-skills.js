#!/usr/bin/env node

/**
 * validate-skills.js
 *
 * Validates every SKILL.md file found under the skills/ directory.
 * Checks that YAML frontmatter is present and contains all required fields
 * with the correct types and allowed values.
 *
 * Usage: node scripts/validate-skills.js
 * Exit code 0 = all valid, 1 = one or more errors found.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SKILLS_DIR = path.join(__dirname, '..', 'skills');

const VALID_CATEGORIES = ['coding', 'writing', 'data', 'devops', 'research', 'productivity'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse YAML frontmatter from a markdown string.
 * Returns the parsed object, or throws if frontmatter is missing/invalid.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error('No YAML frontmatter found. File must start with --- ... ---');
  }
  try {
    return yaml.load(match[1]);
  } catch (err) {
    throw new Error(`Invalid YAML in frontmatter: ${err.message}`);
  }
}

/**
 * Validate a parsed frontmatter object.
 * Returns an array of error strings (empty = valid).
 */
function validateFrontmatter(fm) {
  const errors = [];

  // name
  if (!fm.name || typeof fm.name !== 'string' || fm.name.trim() === '') {
    errors.push('`name` is required and must be a non-empty string');
  }

  // description
  if (!fm.description || typeof fm.description !== 'string' || fm.description.trim() === '') {
    errors.push('`description` is required and must be a non-empty string');
  }

  // category
  if (!fm.category) {
    errors.push('`category` is required');
  } else if (!VALID_CATEGORIES.includes(fm.category)) {
    errors.push(
      `\`category\` must be one of: ${VALID_CATEGORIES.join(', ')} (got "${fm.category}")`
    );
  }

  // tags
  if (!fm.tags) {
    errors.push('`tags` is required');
  } else if (!Array.isArray(fm.tags)) {
    errors.push('`tags` must be an array');
  } else if (fm.tags.length === 0) {
    errors.push('`tags` must contain at least one entry');
  } else {
    fm.tags.forEach((tag, i) => {
      if (typeof tag !== 'string' || tag.trim() === '') {
        errors.push(`\`tags[${i}]\` must be a non-empty string`);
      }
    });
  }

  // author
  if (!fm.author || typeof fm.author !== 'string' || fm.author.trim() === '') {
    errors.push('`author` is required and must be a non-empty string');
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let totalFiles = 0;
let totalErrors = 0;

// Find all skills/*/SKILL.md files
let skillDirs;
try {
  skillDirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
} catch (err) {
  console.error(`Could not read skills directory at ${SKILLS_DIR}: ${err.message}`);
  process.exit(1);
}

if (skillDirs.length === 0) {
  console.log('No skill folders found — nothing to validate.');
  process.exit(0);
}

for (const skillDir of skillDirs) {
  const skillFile = path.join(SKILLS_DIR, skillDir, 'SKILL.md');

  if (!fs.existsSync(skillFile)) {
    console.warn(`  WARN  ${skillDir}/SKILL.md — file not found, skipping`);
    continue;
  }

  totalFiles++;
  const content = fs.readFileSync(skillFile, 'utf8');
  const relPath = `skills/${skillDir}/SKILL.md`;

  let fm;
  try {
    fm = parseFrontmatter(content);
  } catch (err) {
    console.error(`  FAIL  ${relPath}`);
    console.error(`        ${err.message}`);
    totalErrors++;
    continue;
  }

  const errors = validateFrontmatter(fm);

  if (errors.length === 0) {
    console.log(`  OK    ${relPath}  (${fm.name})`);
  } else {
    console.error(`  FAIL  ${relPath}  (${fm.name || 'unnamed'})`);
    errors.forEach(e => console.error(`        - ${e}`));
    totalErrors += errors.length;
  }
}

console.log('');
console.log(`Validated ${totalFiles} skill file(s). ${totalErrors} error(s) found.`);

if (totalErrors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
