#!/usr/bin/env node

/**
 * generate-contributors.js
 *
 * Generates CONTRIBUTORS.md by combining:
 *  - Skill frontmatter `author` fields (who wrote each skill)
 *  - Git log commit authors (who contributed code/fixes)
 *
 * Usage: node scripts/generate-contributors.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result = {};
  let currentKey = null;
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) { currentKey = kv[1]; result[currentKey] = kv[2].trim(); }
  }
  return result;
}

// ---------------------------------------------------------------------------
// 1. Collect skill authors from frontmatter
// ---------------------------------------------------------------------------

const skillsByAuthor = {}; // author -> [{ slug, name }]

for (const entry of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const skillFile = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
  if (!fs.existsSync(skillFile)) continue;

  const fm = parseFrontmatter(fs.readFileSync(skillFile, 'utf8'));
  const author = (fm.author || 'simplyutils').trim();
  const name = (fm.name || entry.name).trim();

  if (!skillsByAuthor[author]) skillsByAuthor[author] = [];
  skillsByAuthor[author].push({ slug: entry.name, name });
}

// ---------------------------------------------------------------------------
// 2. Collect commit authors from git log
// ---------------------------------------------------------------------------

const commitsByAuthor = {}; // name -> count

try {
  const log = execSync('git log --format="%aN" --', { cwd: ROOT, encoding: 'utf8' });
  for (const name of log.split('\n').map(n => n.trim()).filter(Boolean)) {
    commitsByAuthor[name] = (commitsByAuthor[name] || 0) + 1;
  }
} catch {
  // Not a git repo or git unavailable — skip
}

// ---------------------------------------------------------------------------
// 3. Build contributors list
// ---------------------------------------------------------------------------

// Merge: every author who appears in skills or commits
const allAuthors = new Set([
  ...Object.keys(skillsByAuthor),
  ...Object.keys(commitsByAuthor),
]);

// Sort by skill count desc, then name
const sorted = [...allAuthors].sort((a, b) => {
  const sa = (skillsByAuthor[a] || []).length;
  const sb = (skillsByAuthor[b] || []).length;
  if (sb !== sa) return sb - sa;
  return a.localeCompare(b);
});

// ---------------------------------------------------------------------------
// 4. Write CONTRIBUTORS.md
// ---------------------------------------------------------------------------

const totalSkills = Object.values(skillsByAuthor).reduce((s, arr) => s + arr.length, 0);
const now = new Date().toISOString().split('T')[0];

const lines = [
  '# Contributors',
  '',
  `> Auto-generated on ${now}. ${sorted.length} contributor(s), ${totalSkills} skills total.`,
  '',
  '---',
  '',
];

for (const author of sorted) {
  const skills = skillsByAuthor[author] || [];
  const commits = commitsByAuthor[author] || 0;

  const badge = skills.length >= 10 ? '🥇' : skills.length >= 5 ? '🥈' : skills.length >= 1 ? '🥉' : '🔧';
  const skillCount = skills.length ? `${skills.length} skill${skills.length > 1 ? 's' : ''}` : '';
  const commitCount = commits ? `${commits} commit${commits > 1 ? 's' : ''}` : '';
  const stats = [skillCount, commitCount].filter(Boolean).join(', ');

  lines.push(`## ${badge} ${author}`);
  if (stats) lines.push(`*${stats}*`);
  lines.push('');

  if (skills.length > 0) {
    for (const s of skills.sort((a, b) => a.slug.localeCompare(b.slug))) {
      lines.push(`- [${s.name}](skills/${s.slug}/SKILL.md)`);
    }
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push('Want to see your name here? [Contribute a skill](CONTRIBUTING.md) and open a PR.');
lines.push('');

fs.writeFileSync(path.join(ROOT, 'CONTRIBUTORS.md'), lines.join('\n'));
console.log(`CONTRIBUTORS.md written — ${sorted.length} contributor(s).`);
