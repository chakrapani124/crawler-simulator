# 🤖 RL Crawler — Reinforcement Learning Agent

A high-fidelity 3D reinforcement learning simulation that replicates complex multi-limbed locomotion in a Unity-style environment. Featuring a real-time Three.js visualizer, a PPO-driven telemetry dashboard, and an articulated physics-based agent.

---

## Demo

| Training | Watching | Manual Control |
|---|---|---|
| Agent learns live, mean reward chart updates in real time | Watch the articulated agent navigate with a procedural gait | Physics-based locomotion seeking the green target cube |

---

## 📸 Screenshots

### 🖼️ Image 1: Agent Detail
<img width="1920" height="912" alt="image1" src="https://github.com/user-attachments/assets/980c2170-e2c6-4bcf-b2f4-829e49df6b1f" />


### 🖼️ Image 2: Wide Action View
<img width="1920" height="912" alt="image2" src="https://github.com/user-attachments/assets/bea11f64-4a8d-405e-95db-379b400fbdf8" />


### 🖼️ Image 3: Telemetry Dashboard
<img width="1920" height="912" alt="image3" src="https://github.com/user-attachments/assets/f9033b9e-fc37-4dbc-ad88-b6379e5de0c6" />


---

## Features

- **Matches Unity ML-Agents Crawler spec**
  - Continuous observation vector (joint positions, body orientation, target direction)
  - Multi-dimensional continuous action space for joint torque control
  - Coordinate-based gait system for high-fidelity locomotion
- **Premium Real-Time Dash** — Live Three.js viewport with fog, shadows, and glassmorphic telemetry overlays
- **Articulated Agent Model** — Multi-layered body (blue outer ring, white hub, yellow top disc) with detailed 2-segment limbs and spherical joints
- **Geometric Reward Function** — Optimizes for heading alignment, forward velocity, and distance-to-target efficiency
- **Responsive Telemetry** — Integrated Chart.js dashboard tracking training progress (Steps, Episodes, Mean Reward)
- **Target Navigation** — Autonomous "Seeking Target" state with random goal relocation and flash feedback

---

## Installation

The simulation runs entirely in the browser using Three.js and Chart.js via CDN. No complex backend installation is required.

```bash
# Clone the repository
git clone https://github.com/yourusername/rl-crawler.git

# Navigate to the folder
cd rl-crawler
```

---

## Usage

Simply open the `index.html` file in any modern browser:

```bash
# On Windows
start index.html

# On macOS
open index.html
```

**Controls & UI:**

| Element | Function |
|---------|----------|
| `Reset Episode` | Resets the agent position and relocates the goal |
| `Pause / Resume` | Stops/Starts the simulation and telemetry tracking |
| `HUD Overlay` | Displays real-time FPS and simulation version |

---

## Environment Specification

| Property | Value |
|----------|-------|
| Observation space | 172-dim float vector |
| Action space | 20-dim continuous |
| Max episodes | Unlimited (Continuously training) |
| Target proximity | 1.2m |
| Mean Reward Benchmark | 3.000+ |
| Physics Tick | Variable dt (max 0.1s) |

### Observation Vector Layout

| Components | Description |
|---------|-------------|
| Body State | Position, rotation, and linear/angular velocity |
| Joint States | Rotation and angular velocity for each limb segment |
| Goal Vector | Relative distance and heading error to target |
| Feet Sensors | Contact points and ground orientation |

### Simulation parameters

| Parameter | Default |
|-----------|---------|
| `move_speed` | 4.5 m/s |
| `turn_speed` | 2.0 rad/s |
| `reward_smoothing` | 0.999 (EMA) |
| `target_reach_dist` | 1.2 m |

---

## Architecture

```
crawler game/
│
├── app.js            # Three.js engine, Simulation logic, and UI Controller
├── index.html        # Main viewport and telemetry structure
├── style.css         # Premium telemetry styling and micro-animations
└── image/            # README assets and documentation screenshots
```

---

## Requirements

| Package | Purpose |
|---------|---------|
| `Three.js` | 3D Graphics and Scene management |
| `Chart.js` | Telemetry visualization |
| `Google Fonts` | Interface typography (Outfit, JetBrains Mono) |

---

## License

MIT

## How to Run

1. Open `index.html` in your browser.
2. Observe the agent navigating toward the green cube.
3. Monitor real-time performance via the telemetry sidebar.
