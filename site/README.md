# Public website foundation

Plain HTML, CSS and JavaScript; no packages, analytics, secrets or build step. The dashboard fetches `../data/status.json`, renders values as text, and displays an explicit error if loading fails. Update the JSON to update phase, contestants and milestones. A missing result is shown as untested, never zero performance.

With Node.js installed, run `node scripts/serve.mjs` from the repository root, then open http://127.0.0.1:8080/site/. Opening `index.html` as a local file is unsupported because browsers restrict fetch. The local preview binds only to loopback and serves an explicit allowlist.

For future static hosting, publish `site/` and `data/status.json` while preserving their relative layout (for example `/site/index.html` and `/data/status.json`). Hosting only `site/` will break the data URL. This commit does not deploy a public website or configure Pages. Public repository availability is distinct from website deployment.
