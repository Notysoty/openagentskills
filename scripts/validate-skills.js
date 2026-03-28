#!/usr/bin/env node

/**
 * validate-skills.js
 *
 * Validates every SKILL.md file found under the skills/ directory.
 * Checks frontmatter, content quality, and uniqueness.
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

const MIN_DESCRIPTION_WORDS = 5;
const MIN_TAGS = 2;
const MAX_TAGS = 7;
const MIN_BODY_WORDS = 100;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trim();
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Validate frontmatter fields.
 * Returns { errors, warnings }.
 */
function validateFrontmatter(fm) {
  const errors = [];
  const warnings = [];

  // name
  if (!fm.name || typeof fm.name !== 'string' || fm.name.trim() === '') {
    errors.push('`name` is required and must be a non-empty string');
  }

  // description
  if (!fm.description || typeof fm.description !== 'string' || fm.description.trim() === '') {
    errors.push('`description` is required and must be a non-empty string');
  } else if (wordCount(fm.description) < MIN_DESCRIPTION_WORDS) {
    errors.push(
      `\`description\` must be at least ${MIN_DESCRIPTION_WORDS} words (got ${wordCount(fm.description)})`
    );
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
    if (fm.tags.length < MIN_TAGS) {
      warnings.push(`\`tags\` has ${fm.tags.length} tag(s); recommended minimum is ${MIN_TAGS}`);
    }
    if (fm.tags.length > MAX_TAGS) {
      warnings.push(`\`tags\` has ${fm.tags.length} tags; recommended maximum is ${MAX_TAGS}`);
    }
  }

  // author
  if (!fm.author || typeof fm.author !== 'string' || fm.author.trim() === '') {
    errors.push('`author` is required and must be a non-empty string');
  }

  return { errors, warnings };
}

/**
 * Validate the markdown body (after frontmatter).
 * Returns { errors, warnings }.
 */
function validateBody(body, slug) {
  const errors = [];
  const warnings = [];

  // Minimum body length
  const wc = wordCount(body);
  if (wc < MIN_BODY_WORDS) {
    errors.push(
      `Body is too short: ${wc} words (minimum ${MIN_BODY_WORDS}). Add more instructions or examples.`
    );
  }

  // Should have an Example section (warning — encouraged but not blocking)
  if (!/^##\s+Examples?/im.test(body)) {
    warnings.push('Missing `## Example` section. Consider adding at least one input/output example.');
  }

  // Must have a Prompt/Instructions section
  if (!/^##\s+The Prompt/im.test(body)) {
    errors.push('Missing `## The Prompt` section. Every skill must include step-by-step agent instructions.');
  }

  // Warn if no "How to use" section
  if (!/^##\s+How to use/im.test(body)) {
    warnings.push('Missing `## How to use` section. Consider adding usage instructions for Claude Code, Cursor, and Codex.');
  }

  return { errors, warnings };
}

/**
 * Compute a quality score (0–100) for a skill.
 */
export function computeQualityScore(fm, body) {
  let score = 0;

  // Frontmatter completeness (40 pts)
  if (fm.name && fm.name.trim()) score += 8;
  if (fm.description && wordCount(fm.description) >= MIN_DESCRIPTION_WORDS) score += 8;
  if (fm.category && VALID_CATEGORIES.includes(fm.category)) score += 8;
  if (Array.isArray(fm.tags) && fm.tags.length >= MIN_TAGS && fm.tags.length <= MAX_TAGS) score += 8;
  if (fm.author && fm.author.trim()) score += 8;

  // Content quality (60 pts)
  if (/^##\s+Example/im.test(body)) score += 20;
  if (/^##\s+The Prompt/im.test(body)) score += 20;
  const wc = wordCount(body);
  if (wc >= 300) score += 20;
  else if (wc >= MIN_BODY_WORDS) score += 10;

  return score;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let totalFiles = 0;
let totalErrors = 0;
let totalWarnings = 0;
const seenNames = new Map(); // name -> slug (for duplicate detection)

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

  const body = stripFrontmatter(content);
  const { errors: fmErrors, warnings: fmWarnings } = validateFrontmatter(fm);
  const { errors: bodyErrors, warnings: bodyWarnings } = validateBody(body, skillDir);
  const allErrors = [...fmErrors, ...bodyErrors];
  const allWarnings = [...fmWarnings, ...bodyWarnings];

  // Duplicate name check
  if (fm.name) {
    const nameKey = fm.name.trim().toLowerCase();
    if (seenNames.has(nameKey)) {
      allErrors.push(`Duplicate skill name "${fm.name}" — already used by skills/${seenNames.get(nameKey)}/SKILL.md`);
    } else {
      seenNames.set(nameKey, skillDir);
    }
  }

  const score = computeQualityScore(fm, body);

  if (allErrors.length === 0) {
    const warnStr = allWarnings.length ? ` (${allWarnings.length} warning(s))` : '';
    console.log(`  OK    ${relPath}  [score: ${score}/100]${warnStr}`);
    allWarnings.forEach(w => console.warn(`        WARN  ${w}`));
  } else {
    console.error(`  FAIL  ${relPath}  [score: ${score}/100]`);
    allErrors.forEach(e => console.error(`        ERR   ${e}`));
    allWarnings.forEach(w => console.warn(`        WARN  ${w}`));
    totalErrors += allErrors.length;
  }

  totalWarnings += allWarnings.length;
}

console.log('');
console.log(`Validated ${totalFiles} skill file(s). ${totalErrors} error(s), ${totalWarnings} warning(s).`);

if (totalErrors > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
