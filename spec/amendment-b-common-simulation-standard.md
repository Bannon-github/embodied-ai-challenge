# Amendment B — Body V1 Design Sprint Standard

Version: **0.2.0**, 2026-10-05. Applies equally to all six contestants: Gemini, Grok, ChatGPT, Claude, Meta AI, Microsoft Copilot.

**Decision of the project lead, 2026-10-05:** Body V1 is a 48-hour design sprint followed by building one real robot by Monday, October 19, 2026. This replaces Amendment B 0.1.0 for Body V1. The full simulation standard and Amendment A's 14-point digital-twin gate are not discarded: they are deferred to Body V2, which will use the finished Body V1 robot as its reference hardware. See [Body V2 deferred documents](body-v2/amendment-b-0.1.0-full-simulation-standard.md).

The frozen Master Brief v1.0 and Mandatory Amendment A are not rewritten here. Their canonical files are still missing ([TODO](SOURCE-DOCUMENTS-TODO.md)). Where a Body V1 rule below differs from them, it is a recorded decision by the project lead for this edition only, and must be reconciled against the canonical text once recovered.

## 1. The goal

One autonomous robot that **sees, hears, moves, grabs and speaks**, built from the lead's existing parts, for **at most $100 USD of new purchases**, finished by **October 19, 2026**. A PC agent turns the robot's camera, microphone and sensor data into an awareness of its surroundings and talks with the lead.

Every entry is judged on whether the lead, working alone in a bedroom with the tools listed below, can actually build it in the time and budget.

## 2. Timeline

All times are Pacific (UTC−7).

| When | What |
| --- | --- |
| Oct 5 | Sprint brief (this document plus §3 inventory) sent identically to all six |
| Oct 7, 12:00 | Entries due. Late entries are recorded but not scored |
| Oct 7 | Lead scores entries, then selects one design or merges the best parts |
| Oct 8 – Oct 18 | Build, following the selected design |
| Oct 19 | Demo day: the §8 demo checks |

If the lead orders parts before selection to protect the schedule, those parts and their prices are listed in `data/status.json` under `sprint.pre_ordered`. They count toward every entry's $100 and are on hand for every entry.

## 3. Inventory (free to use, $0)

Verified by the lead's description on 2026-10-05. Items marked *confirm* have a detail the entry must not assume.

| Item | Notes |
| --- | --- |
| HP OMEN laptop | Robot's main compute. Runs speech, planning, vision-language model, agent, message broker |
| Dual-band home router | Omen on 5 GHz. Robot boards need 2.4 GHz (*confirm* 2.4 GHz is enabled) |
| 3 × ESP32 Wi-Fi/Bluetooth boards | Generic ESP32 dev boards |
| ESP32-S3 board with 1.47" 172×320 LCD | 2.4 GHz Wi-Fi, Bluetooth 5, RGB LED |
| Raspberry Pi Zero with AI camera module | *confirm* Zero, Zero W or Zero 2 W, and camera model |
| Robot vacuums (2 or more), for parts | Chassis, wheel modules, bump/cliff sensors, speaker, IR receiver, possibly a working battery pack |
| Larger stepper motors | |
| Several Lego DC motors and a lot of Lego | |
| Bluetooth dual bidirectional DC motor controller | *confirm* driver chip and voltage/current rating |
| 50+ lithium-ion cells, mixed shapes and sizes | Salvaged, condition unknown |
| Saturn Ultra 6K Pro resin printer | Tough, rubber and regular resin |
| Flipper Zero | Infrared, GPIO, USB-UART |
| LoRa module | |
| 405 nm laser module | **Excluded**: must not be mounted on the robot (eye-injury risk on an autonomous platform) |
| Soldering iron, solder, rosin, helping hands, multimeter | |

Anything else counts against the $100. Prices in the BOM are dated, sourced from a seller who can deliver by Oct 9, and include shipping and tax estimate.

## 4. The mission

The robot is in a bedroom. The lead says something like "find my cup and bring it to me."

1. **Hear**: the request is captured by a microphone on the robot (a PC microphone is an allowed fallback, and the entry must say which).
2. **Find**: the robot searches the room and recognizes the named object with its camera.
3. **Grab**: the robot approaches and picks up the object. It detects whether the grab succeeded.
4. **Return**: the robot brings the object back to the lead.
5. **Speak**: the robot releases the object and says what it did, through a speaker on the robot.

Awareness: the PC agent keeps a memory of what it has seen and where, and can answer "where did you last see my keys?" by voice and in a text chat page on the PC.

## 5. PC ↔ robot connection

The reference connection, consistent with the project's working build plan:

- The Omen hosts an **MQTT broker** on the home network. Every robot board connects to it over 2.4 GHz Wi-Fi.
- Microphone audio goes up and speech audio comes down over UDP. Camera video goes to the PC as a compressed stream (MJPEG, RTSP or H.264).
- **Tailscale** is only for reaching the PC or robot from outside the home. It is not required on the robot's boards.

Minimum security for Body V1:

- Each board has its own MQTT username and password. No anonymous connections. A broker access list limits each board to its own topics.
- The broker is reachable only on the home network: Windows firewall rule on the private profile, no router port forwarding.
- Credentials stay out of Git (`.gitignore` already blocks `.env`, `*.key`, `*.pem`).
- TLS on MQTT (port 8883) is a stretch goal for Body V1 and required in Body V2.

Entries may use a different transport if they justify it and keep these guarantees.

## 6. Common robot interface

The agent on the PC never sends raw motor commands. It picks **behaviours** (explore, find, approach, grab, return, release, speak, stop), and code on the PC and the boards carries them out. This is the hardware abstraction layer: the same behaviour names work in an optional simulation and on the real robot.

Reference MQTT topics (JSON payloads). Entries may add topics, and must map any renamed ones to these:

| Topic | Direction | Payload |
| --- | --- | --- |
| `robot/drive/cmd` | PC → drive board | `{"v": m/s, "w": rad/s, "ttl_ms": ≤300}` |
| `robot/drive/state` | drive board → PC | odometry, bump, cliff, battery volts |
| `robot/safety/cmd` | PC → drive board | `{"cmd": "arm" \| "stop" \| "reset"}` |
| `robot/safety/state` | drive board → PC | `{"state": "DISARMED" \| "ARMED" \| "STOPPED" \| "ESTOP", "reason": ...}` |
| `robot/gripper/cmd` | PC → hand board | `{"cmd": "open" \| "close" \| "lift" \| "lower"}` |
| `robot/gripper/state` | hand board → PC | position, `holding` true/false |
| `robot/vision/detections` | camera → PC | `[{"label", "confidence", "box": [x, y, w, h]}]`, frame time |
| `robot/head/face` | PC → head board | expression, speaking true/false |
| `robot/<board>/health` | each board → PC | uptime, Wi-Fi signal, free memory, every 1 s |

Every board publishes a retained `online`/`offline` status using MQTT's last-will message.

## 7. Safety (must pass, not scored)

An entry that misses any item below is rejected, however good the rest is.

1. **Local stop timer.** The drive board stops the motors on its own if no valid drive command arrives within 300 ms. Wi-Fi loss or a PC crash therefore stops the robot.
2. **Wireless kill switch independent of Wi-Fi.** Default: the vacuum's IR receiver, triggered by the Flipper Zero's infrared remote, latches ESTOP on the drive board.
3. **Bump and cliff stops** handled on the drive board, not the PC.
4. **Safe startup and reset.** The robot starts DISARMED. After any stop, reset returns to DISARMED, and moving again needs a new arm command.
5. **Speed limit** of 0.30 m/s, enforced on the drive board.
6. **Battery safety.** Prefer a working vacuum pack with its own charger. Salvaged cells: triage (discard below 2.0 V, check self-discharge), holder rather than soldered cells, balancing BMS, fuse at the pack, a proper CC/CV charger, supervised charging on a non-flammable surface, and a software low-voltage cutoff.
7. **No laser** on the robot. Resin parts handled with gloves and fully cured.
8. **The language model never drives motors.** It only chooses behaviours from §6.

## 8. Gates and scoring

### Entry gate (5 checks, on paper, Oct 7)

| ID | Check |
| --- | --- |
| E1 | New-purchase BOM total ≤ $100 USD, including any `pre_ordered` parts, with dated prices |
| E2 | Uses only §3 inventory plus the BOM; nothing assumed that §3 marks *confirm* without a fallback |
| E3 | Covers all five mission steps (§4) and the awareness memory |
| E4 | Meets every §7 safety item |
| E5 | Day-by-day build schedule from Oct 8 that ends with the demo on Oct 19 |

Each check is recorded as `pass`, `fail` or `not_run` with a one-line reason. Only entries passing all five are scored.

### Scoring (100 points, for entries that pass the gate)

| Criterion | Points |
| --- | --- |
| Buildable by one person by Oct 19 with the listed tools | 25 |
| Mission design, especially the grab and grab-success check | 20 |
| Reuse of inventory and money left over | 15 |
| Awareness agent and memory design | 15 |
| Clear, ordered build and wiring instructions | 15 |
| Risks named, with fallbacks and a cut list if behind | 10 |

Points guide the decision; the lead makes the final choice and may merge ideas from several entries, crediting each source in `data/status.json`.

### Demo checks (Oct 19, on the real robot)

| ID | Check |
| --- | --- |
| D1 | Hears a spoken request and shows the transcript |
| D2 | Finds the named object |
| D3 | Grabs it and reports that the grab succeeded |
| D4 | Returns it to the lead and releases it |
| D5 | Says what it did, through the robot's speaker |
| D6 | Safety: kill switch and Wi-Fi-loss stop both work during the demo run |

D6 must pass for the demo to count. The demo is run three times; all three results are recorded, including failures.

## 9. Event log

The PC writes one JSON object per line to `events.jsonl` for each run:

```json
{"schema_version":"1.0","run_id":"2026-10-19-run1","seq":1,"time_utc":"2026-10-19T17:00:00Z","source":"agent","kind":"command","correlation_id":"req-001","payload":{"behaviour":"find","object":"cup"}}
```

`kind` is one of observation, state, command, acknowledgement, safety, memory, speech, error. A correlation ID links a spoken request to every command and result it caused. Raw audio is not kept by default. Public logs are redacted of personal speech and room images.

## 10. Simulation

Optional for Body V1, and not scored. An entry may provide a simple simulation (for example a Webots model of a differential-drive vacuum in one bedroom-sized room) to test behaviours before the hardware is ready. It must use the §6 behaviour names so the same agent code drives both. See [simulation/README.md](../simulation/README.md).

## 11. Body V2 (deferred)

After Oct 19, Body V2 returns to the full standard: Webots reference worlds, the robot/digital-twin import contract, TLS with per-device certificates, failure injection, Amendment A's 14-point feasibility gate and the resource comparison. The finished Body V1 robot becomes the reference hardware those tests are validated against. Documents: [Amendment B 0.1.0](body-v2/amendment-b-0.1.0-full-simulation-standard.md), [simulation harness](body-v2/simulation-harness.md), [submission contract](body-v2/submission-contract.md).
