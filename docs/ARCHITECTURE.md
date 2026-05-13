# Architecture

This document describes the runtime architecture for the Solar System Three.js project.

## Overview

The project uses a modular browser architecture organized under the modules directory. Script loading is sequential in index.html to keep startup deterministic and safe in non-ES-module mode.

## Project Tree

```text
├── LICENSE.md
├── README.md
├── css
│   └── layout.css
├── docs
│   ├── ARCHITECTURE.md
│   ├── ASSETS.md
│   ├── CHANGELOG.md
│   ├── CONFIGURATION.md
│   ├── CONTROLS_AND_GAMEPLAY.md
│   ├── DEPLOYMENT.md
│   └── SETUP.md
├── index.html
├── js
│   ├── MTLLoader.js
│   ├── OBJLoader.js
│   ├── OrbitControls.js
│   ├── PLYLoader.js
│   ├── Reflector.js
│   ├── dat.gui.min.js
│   └── three.js
├── models
│   ├── galactus.jpg
│   ├── galactus.mtl
│   ├── galactus.obj
│   └── ufo.ply
└── modules
	├── app.js
	├── config.js
	├── core
	│   ├── assets.js
	│   ├── compat.js
	│   ├── input.js
	│   └── scene.js
	├── engine
	│   └── loop.js
	├── state.js
	├── systems
	│   ├── asteroids.js
	│   ├── cloud.js
	│   ├── combat.js
	│   ├── dyson.js
	│   ├── galactus.js
	│   ├── player.js
	│   └── solar-system.js
	└── ui
		└── hud.js
```

## Runtime Layers

- app.js: Composition root and startup orchestration.
- engine/loop.js: Per-frame update and render loop.
- state.js: Shared runtime state container.
- config.js: Gameplay, rendering, and systems tuning constants.
- core/*: Scene setup, compatibility, input, asset loading.
- systems/*: Domain simulation and gameplay logic.
- ui/*: HUD and interface overlays.

## Startup Order

1. Apply compatibility shims.
2. Initialize scene, camera, renderer, controls.
3. Register input handlers.
4. Build world systems (solar, dyson, stars, asteroids, cloud).
5. Load gameplay assets (player ship, Galactus).
6. Initialize combat state.
7. Create HUD.
8. Start animation loop.

## Frame Update Order

1. World simulation: solar, dyson, asteroids.
2. Boss systems: consume asteroids, beam updates.
3. Visual systems: cloud animation.
4. Player systems: movement and follow camera.
5. Combat systems: fire, projectile updates, collision checks, impacts.
6. Boss perish animation.
7. HUD update.
8. Controls update and scene render.

## Data Flow

- config.js provides constants consumed by all systems.
- systems read/write shared state in state.js.
- engine loop invokes system update functions in stable order.
- ui reads gameplay state and presents values to the user.

## Key Design Principles

- Single source of truth for runtime state.
- Deterministic update ordering.
- Narrow file responsibilities for maintainability.
- Backward-compatible Three.js runtime handling.
