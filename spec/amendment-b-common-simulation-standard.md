# Amendment B — Common Simulation & Submission Standard

Version: **0.1.0 infrastructure draft**, 2026-10-05. Applies equally to all six Body V1 contestants. Reference simulator decision: **Webots**. Phase: **pre-Round-1**.

This defines the implementation contract extending the frozen Master Brief v1.0 and Mandatory Amendment A. It does not replace either document, reopen their design decisions, or claim the starter simulator is already implemented. Canonical-source recovery is tracked in [SOURCE-DOCUMENTS-TODO.md](SOURCE-DOCUMENTS-TODO.md). All numeric test defaults below are proposed common baseline parameters to validate on the HP OMEN and freeze before Round 1; no contestant-specific relaxation is permitted.

## 1. Release and reproducibility

The organizer shall distribute a versioned release containing the exact Webots version and installer checksum, supported Windows version, controller runtime and dependency lockfiles, reference PC/GPU/driver description, world and asset hashes, interface version, scoring configuration, calibration evidence, and run instructions. An unpinned dependency or missing world blocks the release.

Use a fixed 32 ms physics step, synchronized controllers, explicit nonnegative world seeds, and a fresh world reload for each trial. Record simulator seed separately from agent, sensor-noise, and failure-schedule seeds. Baseline development seeds: 101, 202, 303; held-out evaluation seeds use the same declared distributions and are released with results. Record platform drift; seeded physics is not a promise of identical outputs across platforms or nondeterministic cloud models.

Run each baseline world/seed three times. Preserve all trials, including failures; do not select only the best run. Live microphone and cloud-agent sessions record timing and model/service versions. Audio replay may support repeatability but cannot replace the live microphone gate.

Webots API references: [WorldInfo](https://cyberbotics.com/doc/reference/worldinfo), [controller stepping](https://github.com/cyberbotics/webots/blob/master/docs/guide/controller-programming.md), [Supervisor](https://github.com/cyberbotics/webots/blob/master/docs/reference/supervisor.md). The organizer's Supervisor owns evaluation ground truth; contestant controllers must not obtain privileged world state or mutate the world.

## 2. Standard test worlds

World files and fixture assets are organizer-owned. These are construction specifications, not existing `.wbt` assets. Use metres, kilograms, seconds, radians, and an explicitly ENU world frame (X east, Y north, Z up). Supply a dimensioned plan, collision geometry, surface coefficients, lighting configuration, spawn zones, and asset licenses with each world.

| World | Required fixtures and proposed baseline geometry |
| --- | --- |
| `indoor-v1` | 12 m × 10 m enclosed layout: bedroom, living room, kitchen, hallway; 0.90 m clear doorways and 1.20 m hallway; tables, chairs, movable clutter, walls; hard floor/carpet transition and 0.015 m threshold; dock, designated human and inspection object |
| `urban-v1` | 20 m × 20 m bounded pedestrian area: 1.50 m sidewalk, 0.15 m curb, 1.20 m wide accessible ramp at 1:12 slope, building entrance, paved plaza, street furniture, uneven paving up to 0.02 m, stationary and moving obstacles |

Curbs are obstacles, not mandatory climbing challenges; an accessible alternative route must exist. No traffic-lane traversal is required. Pedestrians are simulated fixtures; no physical human test is implied. Seeded placement varies human/object/clutter locations within valid zones while preserving traversable routes. Publish placement distributions, route-clearance checks, pedestrian trajectories and friction values at freeze. Unknown properties remain TODO rather than silently assumed.

Each world supports the twelve-stage mission: wake from dock → locate human → approach → orient → interact → choose permitted task → navigate → inspect → remember → return → report → dock. Fixtures identify the designated person and task through perceivable cues, not coordinates supplied to the agent. Initial acceptance defaults: stop 0.8–1.5 m from the person, orient within 20 degrees, save a retrievable observation event, report its content, and finish within 600 simulated seconds. Dock success requires stable pose within 0.10 m and 10 degrees for 2 seconds plus modeled charging state. Supervisor verifies stages from observations and ground truth; claimed completion messages alone are insufficient.

## 3. Robot and digital-twin import contract

Each package includes `submission.json` with `schema_version`, `contestant_id`, `entry_version`, `contract_version`, exact `webots_version`, relative `robot_proto`, `controller`, `assets`, `dependencies`, `hal_version`, `capabilities`, `physical_parameters`, and `limitations`. Asset entries include relative path, SHA-256, license, and purpose. Reject absolute paths, parent traversal, missing files, external unpinned assets, and incompatible versions before executing code.

Provide a self-contained Webots PROTO with translation, rotation, name, and controller fields, physical collision bodies and devices. Controller runs without Supervisor privileges. Organizer imports it at a world-defined spawn pose; contestants cannot replace the test world. Include required mesh/texture assets and an exact device-name-to-HAL mapping. A clean install must work without manual path repairs.

Include an independently inspectable complete assembly (STEP for mechanical geometry where applicable, GLB/glTF for visual assembly; STL/3MF for fabricated parts), with named major components and units. Every major component maps to a BOM ID, dimensions, mass estimate, evidence source, tolerances, and measured/manufacturer/assumed status. Unknown salvaged-part dimensions must remain explicitly unverified. Provide exploded/assembly views, ordered construction demonstration and functional animation matching the submitted revision. Animations do not count as physics evidence.

## 4. Hardware abstraction layer (HAL)

The high-level agent uses the same application interface for simulated and future physical hardware. Implement `connect`, `describe_capabilities`, `read_observation`, `request_action`, `cancel_action`, `stop`, and `read_health`. Requests are asynchronous with a command ID and accepted/rejected/completed/failed/cancelled lifecycle. Navigation, approach, observe, speak, display, remember and dock are bounded high-level actions; adapters translate them to device-specific control.

Observations carry sensor ID, timestamp, units, coordinate frame, validity, age and uncertainty. Invalid/stale sensors are never silently represented as valid zeros. Sensor capabilities match proposed physical hardware: camera, audio, encoders, IMU, range, bumper/cliff, battery and docking as applicable. Document rates, calibration, noise, delays and unsupported capabilities. Never expose Supervisor ground truth as a simulated physical sensor. Simulated and real adapters share contract tests; an unsupported action returns `UNSUPPORTED_CAPABILITY`.

## 5. PC microphone → speech → agent → robot

The evaluator selects a PC input device, sees capture state, and speaks live. Pipeline: microphone capture → timestamped audio chunk → speech recognition → transcript/confidence → intent interpretation → agent action request → deterministic safety check → robot adapter → acknowledgement/result → PC speech/display response. Every boundary emits correlated events. The microphone test must produce an appropriate observable action, not just a transcript.

Document local/cloud ASR dependencies, language, device selection, permissions, model version, latency and cost. Ambiguous speech requires clarification without movement. ASR/API timeout causes no newly inferred motion; existing motion remains bounded by its local deadline. A keyboard emergency-stop control is independent of ASR and agent availability. Raw audio is ephemeral by default; any retained test recording requires evaluator consent and a documented retention/deletion policy. Publish redacted event traces, not private speech or private chain-of-thought.

## 6. Secure PC ↔ robot protocol

Reference network profile: versioned JSON over WebSocket over TLS, with mutual certificate authentication and explicit device enrollment. Pin trusted device identities, validate server identity, generate per-install credentials, and keep private keys outside the repository. No anonymous fallback or certificate-validation bypass. A non-network simulator adapter may be used for unit tests, but does not satisfy the authenticated connection gate.

Negotiate protocol major version and capabilities before arming. Envelopes include version, session ID, unique message/command ID, sender/recipient, strictly increasing sequence, type, payload and bounded validity duration. Authenticate before processing, enforce payload/schema/size limits, reject replay/out-of-order/stale commands, and acknowledge acceptance separately from completion. An acknowledgement lost in transit must not cause duplicate physical action: retries with the same ID return the recorded result within a bounded session cache; a new session never replays prior motion.

Proposed profile: heartbeat every 100 ms; loss after 500 ms; motion command lifetime at most 250 ms; maximum JSON envelope 64 KiB (media uses bounded separate transfer). Receiver measures leases with its own monotonic clock. Reconnect uses capped exponential backoff and establishes a fresh authenticated session while disarmed. Reconnection never resumes movement automatically. Report authentication, timeout, disconnect and recovery reason codes without secrets. Test malformed frames, unknown identity, expired certificate, version mismatch, replay and packet loss. Document provisioning, credential rotation/revocation and physical transport alternatives; an alternative must preserve these guarantees and pass the common suite before acceptance.

## 7. Telemetry and event schema

Append one UTF-8 JSON object per line to `events.jsonl`. Required envelope:

```json
{"schema_version":"1.0","run_id":"example-only","event_id":"evt-000001","seq":1,"sim_time_ms":32,"monotonic_ms":1200,"wall_time_utc":"2026-10-05T08:00:00Z","source":"safety","target":"robot","kind":"safety","correlation_id":"cmd-000001","severity":"info","payload":{"state":"DISARMED","reason_code":"STARTUP"}}
```

`seq` is strictly increasing per source per run; IDs are unique within the run. `sim_time_ms` is simulation time; `monotonic_ms` is elapsed recorder time, not comparable across PCs; UTC is for human audit. `kind` is observation, state, command, acknowledgement, error, safety, memory, connection, decision, or metric. Severity is debug/info/warning/error. Correlation ID links speech, command and result; use null for unrelated events. Numeric values must be finite; all measurements declare units and frames in their payload. Keep protocol and telemetry versions independent.

Command payloads include action, parameters and deadline; acknowledgements include status and reason code; sensor payloads include sensor ID, validity and sample time; safety payloads include old/new state, trigger and actuator disposition; memory events include record ID and retention class. Store large assets separately with relative path and checksum. Redact credentials, personal audio and identifying observations before public export. Console renders these structured operational traces; it never requires hidden reasoning tokens. Missing/dropped log records are explicit evidence gaps, never silently treated as successful runs.

## 8. Deterministic safety interface

States: `DISARMED`, `ARMED`, `STOPPED`, `FAULT`, `ESTOP`. Start DISARMED with actuators disabled. Only an authenticated evaluator arm request plus passing health checks permits ARMED. E-stop, critical sensor invalidity, watchdog loss, expired motion lease, out-of-bounds command or unsafe obstacle distance overrides all agent requests locally. E-stop enters latched ESTOP; critical hardware faults enter FAULT; recoverable timeout enters STOPPED. All inhibit new motion and request a controlled stop, with actuator disable where appropriate to the physical design.

No network/model response is required to stop. Poll safety every control tick; latch a stop request within one 32 ms tick in simulation. Actual braking time/distance must be measured separately, not inferred from a stop acknowledgement. Default speed cap is 0.30 m/s with lower approach speed; contestant declares stricter limits if needed. Validate braking envelope against obstacle clearance, payload and friction. Apply acceleration, joint, current and battery limits in the deterministic controller.

Reset is an explicit evaluator operation after the cause clears; it returns to DISARMED, never directly to motion. Re-arm and a fresh command are required. Record trigger, decision time, stop onset, final rest and maximum stopping distance. Tests must kill the PC/agent and still demonstrate local safety. Physical realization additionally needs an independent physical emergency disable and validated electrical/battery protections; simulation is not certification of physical safety.

## 9. Physics and parity requirements

Model mass, center of mass, inertia, wheel radius/wheelbase, collision geometry, contact friction, motor torque/speed limits, acceleration, braking, turning, payload distribution, and sensor pose/FOV/range. Declare approximations and source evidence per parameter. No teleporting, animation-driven locomotion, unlimited motors or collision-free bodies in scored runs. Document tolerances and run sensitivity checks for uncertain mass/friction/traction. Energy integrates declared electrical power over simulated time and separates idle, traction, compute and payload loads; simulated estimates are labeled separately from physical measurements.

Account for battery capacity, usable energy, low-voltage threshold and charging state. Document sensor noise/dropout and actuator saturation. If thermal, battery aging, radio propagation or a sensor effect is not modeled, state the limitation. Hardware adapter replacement must not require rewriting the high-level agent, but physical commissioning and calibration remain mandatory future work.

## 10. Failure injection

Organizer schedules injections by mission stage and simulation tick, with recorded seed, duration, magnitude, expected response and observed recovery. Reset the world between scenarios. Run each case in both worlds where applicable and log exceptions explicitly.

| Case | Injection | Expected evidence |
| --- | --- | --- |
| Unexpected obstacle / human crossing | Place or move fixture into route during navigation | Local braking, no contact, safe replanning |
| Blocked route | Block route for 10 simulated seconds, then clear | Wait or alternate path; no privileged coordinates |
| Wi-Fi loss | Drop traffic for 2 seconds | Watchdog stop; authenticated reconnect; explicit re-arm |
| Delayed AI / PC loss | Hold agent response for 5 seconds; separate PC process termination | Motion lease expires; independent stop |
| Sensor fault | Stale critical range for 1 second; separate bounded bias trial | Invalidity detected or residual risk documented; safe fallback |
| Low battery | Cross declared low-energy threshold mid-task | Safe abort/dock if feasible, otherwise stop |
| Motor fault | One drive stalls during movement | Fault detection, bounded outputs, safe stop |
| Protocol faults | Replay, malformed request, untrusted identity | Rejection without movement; redacted reason code |
| Emergency stop | Trigger while moving and while disconnected | Latched stop; reset alone cannot resume motion |

Do not combine faults until isolated scenarios pass. Report detection and stop latency, contact count, minimum clearance, lost stages, recovery time and operator interventions. Missing execution evidence is `not_run`, never pass.

## 11. Scoring and resource comparison

Feasibility is a prerequisite, not a points bonus. Gate result is pass only when all fourteen items pass with evidence; fail or not_run prevents comparative ranking. A safety violation makes that run ineligible for an aggregate score and remains visible.

For eligible baseline runs, record each mission stage as 0/1 with its evidence. Mission completion percentage = 100 × completed stages / 12. Report full-mission success rate, median/range completion time, collisions, minimum clearance, energy Wh, estimated runtime, CPU/GPU/RAM use, network bytes, API calls/cost, and recovery success count over attempted failure cases. Preserve denominators and failures. Do not average only successful trials.

Publish a comparison table, not an invented overall winner score: additional hardware cost and twelve-month operating cost (CAD, dated estimates and assumptions), reused parts and replacement value, assembly hours, tools/fabrication, maintainability, repairability, autonomy, sensory/interaction capability, memory behavior, network dependence and expansion path. Lower costs are favored for comparable demonstrated capability. No fixed budget ceiling. Missing cost/measurement is unknown, never zero. Any later scalar weights/normalization must be frozen identically before Round 1 and reconciled with the Master Brief. Human project lead makes final selection from complete evidence; no single metric automatically wins.

## 12. Inherited Amendment A feasibility gate

The following item text is inherited from Amendment A §23, retrieved from conversation message `c02aa2b5-c15b-462a-8a4b-e0cbcc313635`. Evidence requirements are new operational details in B, not a fabricated canonical Amendment A file.

| ID | Inherited item | Required evidence |
| --- | --- | --- |
| A01 | Open the 3D assembly. | Viewer/version and successful open record |
| A02 | Inspect major components. | Named parts mapped to BOM and dimensions |
| A03 | Follow the construction documentation. | Evaluator walkthrough, tools/materials/preparation and checkpoints |
| A04 | Launch the simulation. | Clean-install launch log and exact versions |
| A05 | Load a standardized environment. | Organizer world ID and checksum |
| A06 | Start the robot. | Import/start log and valid health state |
| A07 | Establish the simulated PC connection. | Authentication/identity/handshake trace |
| A08 | See telemetry and diagnostic messages. | Valid event log plus console demonstration |
| A09 | Speak through the PC microphone. | Live device/capture/ASR demonstration |
| A10 | Cause the robot to interpret the interaction. | Correlated transcript, intent and action request |
| A11 | Observe an appropriate simulated response/action. | Correlated acknowledgement and observed outcome |
| A12 | Run the standardized mission. | All stage outcomes and raw run evidence |
| A13 | Trigger at least one failure condition. | Recorded organizer injection and timestamp |
| A14 | Observe the documented safety/recovery behavior. | Stop/recovery trace against declared expectation |

Gate records include item ID, `pass`/`fail`/`not_run`, evaluator, UTC time, evidence paths/hashes, notes and failure reason. A12 proves the mission was run, not that every stage succeeded; scored outcomes remain separate. The complete failure suite is additionally required before harness release/acceptance; A13 alone does not waive it.

## 13. Freeze acceptance

Before opening Round 1: verify canonical sources; deliver and clean-install the actual worlds/harness; validate the import/HAL/security/event contracts with a neutral reference robot; demonstrate live microphone, all gate items and failure cases on the HP OMEN; record resource envelope; pin versions/hashes and all test parameters; publish identical starter package and submission deadline to all six. Changes after freeze require a versioned amendment and equal notice. Do not expose any contestant's independent design before all six are locked.
