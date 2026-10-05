# Contestants: Body V1 sprint entries

Contestants: `gemini`, `grok`, `chatgpt`, `claude`, `meta-ai`, `microsoft-copilot`. Rules: [Amendment B 0.2.0](../spec/amendment-b-common-simulation-standard.md). Entries are due **October 7, 2026, 12:00 Pacific**.

## What each contestant receives

The same message to all six: the full text of Amendment B 0.2.0 (it contains the inventory, mission, interface, safety rules, gates and scoring) and the request to return an entry in the layout below. Nothing else, and in particular no other contestant's design or the project's existing build plan, which is itself a candidate design.

## Entry layout

```text
contestants/<contestant-id>/sprint/
├── plan.md        The design, with the sections below
├── bom.csv        item, qty, source, url, price_usd, price_date, in_inventory (yes/no)
└── extras/        Optional: CAD, sketches, simulation, code
```

`plan.md` sections, in this order:

1. Summary (one paragraph)
2. Board roles and how they connect to the PC (map to the Amendment B §6 topics)
3. Drive: chassis, motors, motor driver
4. Gripper: design, parts, how a successful grab is detected
5. Power and battery safety
6. Seeing, hearing and speaking
7. Awareness agent and memory on the PC
8. Safety: how each Amendment B §7 item is met
9. Day-by-day schedule, Oct 8 to Oct 19
10. Risks, fallbacks, and what to cut first if behind
11. How each demo check D1 to D6 will be tested

Keep `plan.md` under about 4,000 words. Unknowns are written as unknowns, never guessed as facts.

## Keeping entries independent

1. The lead pastes each AI's reply into `private-submissions/<contestant-id>/` (ignored by Git) and does not show it to any other contestant.
2. When an entry arrives, the lead records its SHA-256 in `data/status.json` (`entry_sha256`) and sets `entry_status` to `locked`. In PowerShell: `Get-FileHash private-submissions\<id>\plan.md`.
3. After all six are locked or the deadline passes, entries are copied into `contestants/<id>/sprint/` together, and must match their recorded hashes.

A changed entry after locking is a new version and is marked as such.

## Recording results

For each entry, record gate checks E1 to E5 as `pass`, `fail` or `not_run` with a one-line reason in `contestants/<id>/sprint/gate.json`, then its score out of 100. Update `entry_gate` and `score` in `data/status.json`, and when the lead decides, fill in `selection` with the chosen entry (or the merged parts and who each came from).
