# Solar System Three.js

> v2.0: ES module architecture with professional code organization and decomposed helper functions.

Interactive real-time 3D space experience built with Three.js.

This project renders a stylized solar system scene with a controllable ship, asteroid belt simulation, boss encounter logic, projectile combat, shader-driven solar effects, and an in-game HUD.

Live site: https://georges034302.github.io/solar-system-threejs/

## Features

- Real-time 3D rendering with Three.js
- Solar system animation (Sun, Earth, Moon)
- Dyson halo structures with continuous rotation
- Procedural asteroid belt with GUI controls
- Third-person spaceship control (movement, turn, altitude)
- Follow camera tuned for gameplay visibility
- Projectile system with cooldown and lifetime
- Mesh-accurate projectile collision against boss geometry
- Boss health, defeat sequence, restart flow
- Shader-based solar emission cloud animation
- HUD panels for health, status, and control hints

## Quick Start

Serve the project over HTTP (do not use file://).

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Controls

- Arrow Up / Arrow Down: Move forward / backward
- Arrow Left / Arrow Right: Turn left / right
- Q / W: Move up / down
- Space: Fire rockets
- Tab: Restart after victory

## Architecture

Brief project structure:

```text
├── index.html
├── css/
├── js/
├── models/
├── modules/
│   ├── core/
│   ├── systems/
│   ├── engine/
│   └── ui/
├── docs/
├── README.md
└── LICENSE.md
```

For complete runtime structure and startup/data-flow details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Module Responsibilities

- modules/config.js: Central constants and tuning values
- modules/state.js: Shared runtime state container
- modules/core/*: Scene bootstrap, compatibility shims, input, asset loading
- modules/systems/*: Domain systems for world simulation and gameplay
- modules/ui/hud.js: HUD and controls overlay rendering
- modules/engine/loop.js: Main animation/update/render loop
- modules/app.js: Composition root and startup orchestration

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Setup](docs/SETUP.md)
- [Configuration](docs/CONFIGURATION.md)
- [Assets](docs/ASSETS.md)
- [Controls and Gameplay](docs/CONTROLS_AND_GAMEPLAY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Changelog](docs/CHANGELOG.md)

## Usage

Because loaders fetch model and texture assets, run via an HTTP server.

Options:

- VS Code Live Server extension
- Python static server
- Any equivalent local static server

Python example:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deployment

The project is deployed on GitHub Pages:

- https://georges034302.github.io/solar-system-threejs/

## Tech Stack

- JavaScript (browser runtime)
- Three.js ecosystem scripts (OrbitControls, PLYLoader, OBJLoader, MTLLoader)
- dat.GUI for live parameter controls

## License

This project is licensed under the MIT License.

See [LICENSE.md](LICENSE.md) for the full text.

Documentation related to setup and deployment is available in [docs/SETUP.md](docs/SETUP.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Notes

- The current architecture favors safe sequential script loading in index.html.
- A future migration path to ES modules can be done without changing system boundaries.

--- 

<p><span style="font-size:12px;color:#9ca3af;">🧑‍🏫 Author: Dr. Georges Bou Ghantous</span></p>