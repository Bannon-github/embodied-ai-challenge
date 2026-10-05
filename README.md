# Embodied AI Challenge — Body V1

Six AI contestants each design a robot that **sees, hears, moves, grabs and speaks**, built from the project lead's existing parts for **under $100 USD** of new purchases. The lead picks the best design (or merges the best ideas) and builds it by **October 19, 2026**.

**Phase: design sprint.** The brief is ready. Entries are due October 7 at 12:00 Pacific. See [status](data/status.json).

## Decisions

- Contestants: Gemini, Grok, ChatGPT, Claude, Meta AI, Microsoft Copilot.
- 2026-10-05: Body V1 became a 48-hour design sprint followed by one real build. The full Webots simulation standard and Amendment A's 14-point digital-twin gate are deferred to Body V2, which will use the finished robot as reference hardware.
- The robot's brain runs on the HP OMEN. Robot boards connect to it over home Wi-Fi through an MQTT broker. Tailscale is for remote access only.
- Safety rules are pass/fail and come before scoring.
- Master Brief v1.0 and Amendment A canonical files are still missing locally. See [source recovery TODOs](spec/SOURCE-DOCUMENTS-TODO.md); do not reconstruct them.
- Entries stay private until all six are locked.

## Repository map

| Path | Purpose |
| --- | --- |
| [Amendment B 0.2.0](spec/amendment-b-common-simulation-standard.md) | The sprint brief: inventory, mission, interface, safety, gates, scoring |
| [Contestants](contestants/README.md) | Entry layout and how entries are kept independent |
| [Simulation](simulation/README.md) | Optional bedroom model and bench tests for the real robot |
| [Body V2](spec/body-v2/amendment-b-0.1.0-full-simulation-standard.md) | Deferred full simulation standard, harness and submission contract |
| [Status](data/status.json) | Single public source of phase, contestants and milestones |
| [Website](site/README.md) | Static public dashboard; no build dependencies |
| [Coordination](COORDINATION.md) | Rules for agents working in this repository |

## Local use

Check the repository (PowerShell 7, no installs):

```powershell
pwsh scripts/validate.ps1
```

With Node.js installed, `node scripts/validate.mjs` runs the same checks and `node scripts/serve.mjs` previews the site at http://127.0.0.1:8080/site/. The preview server exposes only the public site and status JSON.

## Next steps

1. Send Amendment B 0.2.0 to all six contestants and set `entries_open` to `true`.
2. Lock entries as they arrive (record SHA-256 hashes), then score them on October 7.
3. Build October 8 to 18; demo on October 19.
