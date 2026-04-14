# 🤖 RL Crawler | Telemetry Terminal

[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=flat-square&logo=three.dot-js)](https://threejs.org/)
[![Chart.js](https://img.shields.io/badge/Chart.js-3.9.1-orange?style=flat-square&logo=chart.dot-js)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

A high-fidelity, interactive 3D simulation of a multi-limbed crawler agent utilizing reinforcement learning principles for autonomous navigation. This project features a premium glassmorphic telemetry dashboard, real-time performance tracking, and an articulated physics-driven agent.

![Crawler Showcase](https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=1200&h=400) 
*(Note: Replace with your project screenshot for the best look!)*

## ✨ Key Features

- **Articulated 3D Agent**: A multi-jointed robot model featuring upper/lower segments, spherical joints, and a directional indicator.
- **Real-Time Telemetry**: Live tracking of Mean Reward, Episode Return, Steps, and Episodes.
- **Dynamic Physics Animation**: A procedural gait system that simulates organic walking patterns.
- **Premium UI/UX**: Dark-mode terminal design with glassmorphism, micro-animations, and responsive layout.
- **Interactive Charting**: visualized reward history using Chart.js.
- **Target Navigation**: Autonomous "Seeking Target" behavior with random goal relocation.

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript (ES6+)
- **3D Rendering**: [Three.js](https://threejs.org/)
- **Data Visualization**: [Chart.js](https://www.chartjs.org/)
- **Typography**: Outfit & JetBrains Mono (via Google Fonts)
- **Styling**: Modern CSS3 with Flexbox/Grid and Backdrop Filters

## 🚀 Getting Started

To run the simulation locally, simply clone the repository and open `index.html` in any modern web browser.

```bash
# Clone the repository
git clone https://github.com/yourusername/rl-crawler.git

# Navigate to the project directory
cd rl-crawler

# Open in browser (Chrome/Edge/Firefox recommended)
open index.html
```

## 📸 Screenshots

| Close-up Detail | Action Viewport |
| :---: | :---: |
| ![Detail](https://via.placeholder.com/600x400?text=Crawler+Detail) | ![Action](https://via.placeholder.com/600x400?text=Wide+Action+Shot) |

## 🧬 Simulation Logic

The agent uses a **Geometric Reward Function** to optimize its path:
- **Heading Alignment**: Incentivizes the agent to face the target directly.
- **Velocity**: Rewards forward movement speed.
- **Distance Penalty**: Encourages efficient target reaching.

```javascript
const reward = (Math.max(0, Math.cos(angle)) * 0.5) + (Math.max(0, 1 - distance/20) * 0.5);
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
