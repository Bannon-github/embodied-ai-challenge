import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const required = ['README.md', 'COORDINATION.md', 'spec/SOURCE-DOCUMENTS-TODO.md', 'spec/amendment-b-common-simulation-standard.md', 'spec/body-v2/amendment-b-0.1.0-full-simulation-standard.md', 'spec/body-v2/simulation-harness.md', 'spec/body-v2/submission-contract.md', 'simulation/README.md', 'contestants/README.md', 'data/status.json', 'site/index.html', 'site/app.js', 'site/styles.css', 'site/README.md'];
for (const path of required) await access(new URL(path, root));
const status = JSON.parse(await readFile(new URL('data/status.json', root), 'utf8'));
assert.equal(status.schema_version, '2.0');
assert.equal(status.phase, 'design-sprint');
assert.equal(typeof status.entries_open, 'boolean');
assert.equal(status.sprint.budget_usd, 100);
assert.equal(status.sprint.demo_day, '2026-10-19');
assert.ok(!Number.isNaN(Date.parse(status.sprint.entries_due)));
assert.deepEqual(status.sprint.mission, ['Hear', 'Find', 'Grab', 'Return', 'Speak']);
const preOrdered = status.sprint.pre_ordered.reduce((sum, part) => sum + part.price_usd, 0);
assert.equal(Math.round(preOrdered * 100), Math.round(status.sprint.pre_ordered_total_usd * 100));
assert.ok(preOrdered <= status.sprint.budget_usd);
assert.deepEqual(status.contestants.map(c => c.name), ['Gemini', 'Grok', 'ChatGPT', 'Claude', 'Meta AI', 'Microsoft Copilot']);
assert.equal(new Set(status.contestants.map(c => c.id)).size, 6);
for (const c of status.contestants) {
  assert.ok(['not_submitted', 'locked', 'late'].includes(c.entry_status));
  assert.ok(['not_run', 'pass', 'fail'].includes(c.entry_gate));
  assert.ok(c.score === null || (c.entry_gate === 'pass' && c.score >= 0 && c.score <= 100));
  assert.ok(c.entry_status === 'not_submitted' ? c.entry_sha256 === null : /^[0-9a-f]{64}$/i.test(c.entry_sha256));
}
assert.equal(new Set(status.milestones.map(m => m.id)).size, status.milestones.length);
for (const m of status.milestones) assert.ok(['completed', 'pending'].includes(m.status));
assert.ok(Array.isArray(status.deferred_to_body_v2) && status.deferred_to_body_v2.length > 0);
const spec = await readFile(new URL(required[3], root), 'utf8');
assert.deepEqual([...spec.matchAll(/^\| (E\d) \|/gm)].map(m => m[1]), ['E1', 'E2', 'E3', 'E4', 'E5']);
assert.deepEqual([...spec.matchAll(/^\| (D\d) \|/gm)].map(m => m[1]), ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']);
const v2 = await readFile(new URL(required[4], root), 'utf8');
assert.equal([...v2.matchAll(/^\| A\d\d \|/gm)].length, 14);
for (const path of required.filter(p => p.endsWith('.md'))) {
  const text = await readFile(new URL(path, root), 'utf8');
  for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(href)) continue;
    await access(new URL(href.split('#')[0], new URL(path, root)));
  }
}
console.log(`PASS: ${required.length} required files, valid status JSON, six contestants, 5 entry checks, 6 demo checks, 14 deferred gate items and local document links.`);
