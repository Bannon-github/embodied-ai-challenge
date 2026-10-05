> **Deferred to Body V2.** On 2026-10-05 the project lead replaced this for Body V1 with the [design sprint standard](../amendment-b-common-simulation-standard.md). Kept unchanged below for Body V2.

# Round-1 submission contract

Contestants: `gemini`, `grok`, `chatgpt`, `claude`, `meta-ai`, `microsoft-copilot`. Current phase is **pre-Round-1**; no submissions are recorded.

All six receive identical frozen Master Brief v1.0, Mandatory Amendment A, finalized Amendment B, starter release and deadline. Do not submit another contestant's design to an AI before that AI's Round-1 design is locked. Keep original packages in private organizer-controlled storage; public branches, public PRs and commit history cannot enforce blindness. Public status contains milestones only. Publish packages together after all six have been locked, retaining original hashes and attribution.

## Package layout

Use `<contestant-id>/round-1/<entry-version>/` inside the sealed delivery archive. This naming also applies when entries are eventually released here.

```text
README.md             # complete independent installation/operation guide
submission.json       # Amendment B manifest, relative paths and SHA-256 assets
docs/design.md        # Master Brief sections A–V in original order
bom/                  # parts, quantities, reuse, costs, sources, fallbacks
cad/                  # inspectable mechanical interchange and native sources
models/               # named visual assembly, textures, component mapping
simulation/           # Webots robot PROTO, controllers and dependency locks
firmware/             # sources, versions, programming and safe startup steps
pc-software/          # microphone, ASR, agent bridge, console
protocol/             # schema, security provisioning, connection lifecycle
tests/                # gate, mission, failure and adapter parity evidence
logs/                 # redacted genuine results; distinguish estimates
construction/         # tools, materials, preparation, ordered build checkpoints
animations/           # reproducible assembly and functional demonstrations
```

If an area is inapplicable, provide a README explaining why; omission is not implicit exemption. Include asset licenses and exact dependency versions. Never include passwords, API keys, private certificates, personal recordings or unredacted home imagery.

README must cover requirements, installation, dependencies, layout, environment launch, robot import/start, PC software start, authenticated connection and verification, microphone selection, mission, disturbances, logs, CAD inspection, construction demonstration, clean shutdown and troubleshooting. Charging, battery inspection, firmware preparation, calibration and network setup belong in explicit preparation instructions.

Recovered A–V headings for navigation (not a replacement canonical brief): executive concept; system architecture; physical design; sensor system; compute architecture; communications; power architecture; bill of materials; reused hardware; software stack; AI interface; autonomy architecture; memory architecture; safety architecture; simulation; mission results; failure tests; expansion path; construction plan; resource summary; major compromises; why this architecture. Verify against the canonical source before release.

## Organizer receipt and lock

Record contestant/model version, entry version, receipt UTC, source release hash, archive SHA-256 and declared limitations. Store the untouched original. Run preflight in an isolated evaluation environment; an untrusted submission may contain executable code. Record each feasibility item as pass/fail/not_run with evidence. No admission or results exist until observed by the evaluator. Corrections are new immutable versions, never silent replacements. Lock all six before peer review (up to 30 cross-reviews); retain Round-1 originals when Round-3 revisions arrive.
