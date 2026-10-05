import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const required = ['README.md', 'spec/SOURCE-DOCUMENTS-TODO.md', 'spec/amendment-b-common-simulation-standard.md', 'simulation/README.md', 'contestants/README.md', 'data/status.json', 'site/index.html', 'site/app.js', 'site/styles.css', 'site/README.md'];
for (const path of required) await access(new URL(path, root));
const status = JSON.parse(await readFile(new URL('data/status.json', root), 'utf8'));
assert.equal(status.schema_version, '1.0');
assert.equal(status.phase, 'pre-Round-1');
assert.equal(status.round_1_open, false);
assert.equal(status.reference_simulator, 'Webots');
assert.equal(status.results, null);
assert.deepEqual(status.contestants.map(c => c.name), ['Gemini', 'Grok', 'ChatGPT', 'Claude', 'Meta AI', 'Microsoft Copilot']);
assert.equal(new Set(status.contestants.map(c => c.id)).size, 6);
for (const c of status.contestants) { assert.equal(c.submission_status, 'not_open'); assert.equal(c.feasibility_status, 'not_run'); }
assert.equal(status.source_documents.length, 2);
for (const source of status.source_documents) assert.equal(source.local_status, 'canonical_source_missing');
assert.equal(new Set(status.milestones.map(m => m.id)).size, status.milestones.length);
for (const milestone of status.milestones) assert.ok(['completed', 'pending'].includes(milestone.status));
assert.ok(status.milestones.some(m => m.status === 'completed'));
assert.ok(status.milestones.some(m => m.status === 'pending'));
const amendment = await readFile(new URL(required[2], root), 'utf8');
assert.deepEqual([...amendment.matchAll(/^\| (A\d\d) \|/gm)].map(m => m[1]), Array.from({ length: 14 }, (_, i) => `A${String(i + 1).padStart(2, '0')}`));
for (const path of required.filter(p => p.endsWith('.md'))) {
  const text = await readFile(new URL(path, root), 'utf8');
  for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|#)/.test(href)) continue;
    await access(new URL(href.split('#')[0], new URL(path, root)));
  }
}
console.log(`PASS: ${required.length} required files, valid status JSON, six contestants, fourteen gate items and local document links. Simulation execution is not tested.`);
