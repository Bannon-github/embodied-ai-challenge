# Simulation and bench testing

**Body V1:** simulation is optional and not scored ([Amendment B §10](../spec/amendment-b-common-simulation-standard.md)). The real test is the robot on demo day. The full Webots harness is deferred to Body V2 ([harness spec](../spec/body-v2/simulation-harness.md)).

## Optional bedroom model

Useful only if it saves build time, for example to develop the find and approach behaviours while waiting for parts:

- One room about the size of the lead's bedroom, a few obstacles, and a target object.
- A differential-drive robot about the size of the vacuum chassis, with a camera and a front gripper.
- It speaks the same MQTT topics and behaviour names as the real robot (Amendment B §6), so the PC agent runs unchanged against either.

Webots is the suggested simulator because Body V2 will use it. Nothing here exists yet.

## Bench tests for the real robot

These run on the HP OMEN against the real boards and matter more than simulation for Body V1. Each writes to `events.jsonl` (Amendment B §9).

| Test | Pass when |
| --- | --- |
| Broker check | Every board shows `online` on `robot/<board>/health` |
| Stop timer | Stop sending drive commands while the wheels spin; they stop within 300 ms |
| Wi-Fi loss | Switch off the robot's Wi-Fi access mid-drive; wheels stop, and re-arm is needed |
| Kill switch | Flipper IR stop latches ESTOP; reset returns to DISARMED, not to motion |
| Bump and cliff | Each sensor stops the drive with no PC involved |
| Grab check | Gripper reports `holding: true` with an object and `false` when empty, 5 times each |
| Voice loop | Spoken request → transcript → behaviour → spoken reply, with one correlation ID |

The tooling (a teleop script, an MQTT recorder and a test runner) is built during the build window by whichever design is selected. Run-time output goes in `simulation/runs/`, which Git ignores.
