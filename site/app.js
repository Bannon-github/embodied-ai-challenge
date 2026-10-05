const words = value => String(value).replaceAll('_', ' ');
const put = (id, text) => { document.getElementById(id).textContent = text; };
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
};
const day = iso => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

try {
  const response = await fetch('../data/status.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const status = await response.json();
  if (status.schema_version !== '2.0' || !Array.isArray(status.contestants) || !Array.isArray(status.milestones) || !status.sprint) throw new Error('Unsupported status format');
  const { sprint } = status;
  put('phase', status.phase_label);
  put('budget', `$${sprint.budget_usd}`);
  put('due', day(sprint.entries_due));
  put('demo', day(sprint.demo_day));
  sprint.mission.forEach((step, index) => document.getElementById('mission').append(element('li', `${index + 1}. ${step}`)));
  status.contestants.forEach((contestant, index) => {
    const card = element('article', '', 'card');
    const score = contestant.score === null ? 'Score: not scored' : `Score: ${contestant.score} / 100`;
    card.append(element('span', String(index + 1).padStart(2, '0'), 'number'), element('h3', contestant.name), element('p', `Entry: ${words(contestant.entry_status)}`), element('p', `Gate: ${words(contestant.entry_gate)}`, 'muted'), element('p', score, 'muted'));
    document.getElementById('contestants').append(card);
  });
  status.milestones.forEach(milestone => {
    const item = element('li', '', milestone.status);
    const title = milestone.date ? `${milestone.title} · ${day(milestone.date)}` : milestone.title;
    item.append(element('span', words(milestone.status), 'badge'), element('span', title));
    document.getElementById('milestones').append(item);
  });
  status.deferred_to_body_v2.forEach(item => document.getElementById('deferred').append(element('li', item)));
  status.source_documents.forEach(source => document.getElementById('sources').append(element('li', `${source.title}: ${words(source.local_status)}`)));
  put('results', status.selection === null ? 'No design selected yet. Entries must pass all five entry-gate checks, including every safety rule, before they are scored.' : `Selected design: ${status.selection.summary ?? 'see the repository'}.`);
  put('updated', `Updated ${status.updated_at}`);
  put('load-state', status.entries_open ? `Entries open · due ${day(sprint.entries_due)}` : 'Sprint brief ready · entries not yet open');
  document.getElementById('dashboard').hidden = false;
} catch (error) {
  put('load-state', 'Project status could not be loaded. Serve the repository over HTTP and check data/status.json.');
  console.error('Status load failed:', error);
}
