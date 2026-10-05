# Embodied AI Challenge — Body V1

Six AI contestants design an independently runnable digital twin and a practical robot build package. The human project lead selects the architecture using reproducible evidence, resource costs, and feasibility.

**Phase: pre-Round-1. Entries are not open.** This repository now contains the common technical specification and public dashboard foundation. It does not yet contain executable Webots worlds, a robot controller, or a completed evaluation harness.

## Established decisions

- Contestants: Gemini, Grok, ChatGPT, Claude, Meta AI, Microsoft Copilot.
- Master Brief v1.0 remains frozen; Mandatory Digital Twin Amendment A remains mandatory. Their canonical source files are absent locally. See [source recovery TODOs](spec/SOURCE-DOCUMENTS-TODO.md); do not reconstruct or silently replace them.
- Webots is the reference simulator. All contestants receive identical worlds, interfaces, and evaluation conditions.
- Hardware budget has no fixed ceiling; build and twelve-month operating costs are penalized in comparison.
- Round 1 is independent. Keep submissions private until all six are locked; a public branch or pull request is not sealed storage.

## Repository map

| Path | Purpose |
| --- | --- |
| [Amendment B](spec/amendment-b-common-simulation-standard.md) | Common simulator, interfaces, safety, tests, and feasibility contract |
| [Simulation](simulation/README.md) | Starter harness architecture and implementation acceptance criteria |
| [Contestants](contestants/README.md) | Round-1 package layout and independent submission process |
| [Status](data/status.json) | Single public source of phase, contestants, and milestones |
| [Website](site/README.md) | Static public dashboard; no build dependencies |

## Local use

Requires Node.js (tested with the locally installed version; no npm packages).

```powershell
node scripts/validate.mjs
node scripts/serve.mjs
```

Open http://127.0.0.1:8080/site/. The server exposes only the public site and status JSON. It does not expose submissions, Git metadata, or credentials. Stop with Ctrl+C.

## Next release gate

Recover and verify the two canonical source documents without altering their wording; implement and test the Webots worlds and harness on the HP OMEN; pin simulator/dependencies/world checksums; calibrate and freeze test parameters; then issue the same versioned Round-1 package to all six contestants. This commit establishes infrastructure, not a declaration that the simulator or physical robot has passed testing.
