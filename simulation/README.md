# Common simulation starter harness

Status: architecture and required interfaces specified; **Webots worlds, controllers and execution runner are pending implementation**. There are no simulation results yet. [Amendment B](../spec/amendment-b-common-simulation-standard.md) controls this contract.

## Required release layout

```text
simulation/
  release.json                 # pinned versions, assets, hashes and PC profile
  worlds/indoor-v1.wbt
  worlds/urban-v1.wbt
  protos/                      # organizer fixtures and neutral reference robot
  controllers/evaluator/       # privileged Supervisor; ground truth and scoring
  controllers/robot_adapter/   # unprivileged HAL to simulated devices
  pc/                          # microphone, ASR, agent bridge and console
  scenarios/                   # seeds, mission stages and failure schedules
  schemas/                     # submission, protocol, events, results
  tests/                       # import, safety, protocol and parity tests
```

These paths describe the next executable release; they are not claimed to exist now. Repository checks run today with `node scripts/validate.mjs` from the repository root. They do not launch Webots or award feasibility passes.

## Interfaces to implement

| Component | Input | Output / obligation |
| --- | --- | --- |
| Package preflight | Submission manifest and package root | Resolve confined relative paths, verify hashes/versions, report all missing artifacts before code execution |
| World loader | World ID, seed, robot PROTO | Import at organizer spawn, reload between trials, deny robot Supervisor access |
| HAL adapter | Bounded action requests | Sensor observations, health and correlated command lifecycle; identical logical interface for physical adapter |
| PC bridge | Selected microphone and authenticated connection | ASR → intent → agent → safety → robot; visible capture state and audible/display response |
| Safety controller | Local sensor validity, leases, limits, e-stop | Deterministic state transitions independent of agent/network; measured braking |
| Failure injector | Seeded stage/tick schedule | Injection events, duration and restoration record |
| Recorder | Timestamped subsystem events | Append-only JSONL; redaction and explicit dropped-record count |
| Evaluator | Ground truth plus recorded events | Stage outcomes, all 14 gate records, metrics and failed/not-run reasons |

The future runner must accept contestant package, world, seed, repeat count, failure profile and output directory explicitly. Nonzero exits distinguish invalid package, launch failure, protocol failure and incomplete run. Gate failure is also represented in the result, never hidden by a successful process exit. Never execute contestant installers during mere manifest validation.

## Run bundle

Each run produces `manifest.json` (commit, versions, configuration, seed, machine, hashes), `events.jsonl`, `gate.json` (A01–A14), `metrics.json` (values, units, evidence category), `stage-results.json`, and optional consented media. Record start/end, elapsed simulated and wall time, all interventions, failures and missing observations. Results are initially private; publish redacted bundles only after Round-1 lock. Run bundles and keys do not belong in Git by default.

## Acceptance sequence

1. Pin a Webots version after installation and smoke testing on the HP OMEN; document exact setup and dependency locks.
2. Build dimensioned indoor/urban worlds and verify traversability across published seeds.
3. Implement a neutral reference robot and all adapters without giving any contestant privileged access.
4. Exercise clean import, authenticated PC connection, live microphone action and event recording.
5. Test startup disarmed, leases, watchdog, stale sensors, network loss, duplicate commands, e-stop and explicit re-arm through observed actuator behavior.
6. Execute the twelve-stage mission and failure matrix, validate result files, then perform independent clean-install reproduction.
7. Freeze and checksum the starter release and make the same package available to all six contestants.

TODO: implement all executable components above. No simulator installation, robot test or physical feasibility is asserted by this infrastructure commit.
