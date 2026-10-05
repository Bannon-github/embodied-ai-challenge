const words = value => value.replaceAll('_', ' ');
const put = (id, text) => { document.getElementById(id).textContent = text; };
const element = (tag, text, className) => {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
};

try {
  const response = await fetch('../data/status.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const status = await response.json();
  if (status.schema_version !== '1.0' || !Array.isArray(status.contestants) || !Array.isArray(status.milestones)) throw new Error('Unsupported status format');
  put('phase', status.phase);
  put('simulator', status.reference_simulator);
  put('count', String(status.contestants.length).padStart(2, '0'));
  status.contestants.forEach((contestant, index) => {
    const card = element('article', '', 'card');
    card.append(element('span', String(index + 1).padStart(2, '0'), 'number'), element('h3', contestant.name), element('p', `Submission: ${words(contestant.submission_status)}`), element('p', `Feasibility: ${words(contestant.feasibility_status)}`, 'muted'));
    document.getElementById('contestants').append(card);
  });
  status.milestones.forEach(milestone => {
    const item = element('li', '', milestone.status);
    item.append(element('span', words(milestone.status), 'badge'), element('span', milestone.title));
    document.getElementById('milestones').append(item);
  });
  status.source_documents.forEach(source => document.getElementById('sources').append(element('li', `${source.title}: ${words(source.local_status)}`)));
  put('results', status.results === null ? 'No scored results yet. Every entry must pass the inherited 14-point feasibility gate before comparative judging.' : 'Evaluation data is available in the public status file; consult the repository for evidence.');
  put('simulation-state', `Simulation: ${words(status.simulation_status)}. Amendment B: ${status.amendment_b_status}.`);
  put('updated', `Updated ${status.updated_at}`);
  put('load-state', status.round_1_open ? 'Round 1 is open.' : 'Pre-Round-1 · Submissions are not open.');
  document.getElementById('dashboard').hidden = false;
} catch (error) {
  put('load-state', 'Project status could not be loaded. Serve the repository over HTTP and check data/status.json.');
  console.error('Status load failed:', error);
}
