# Architecture

This document describes the runtime architecture for the Solar System Three.js project.

## Overview

The project uses ES module architecture organized under the modules directory. All modules are imported and exported explicitly, with index.html serving as a single DOM root that bootstraps the application via modules/app.js.

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
    ├── shaders.js
    ├── state.js
    ├── core
    │   ├── assets.js
    │   ├── compat.js
    │   ├── input.js
    │   └── scene.js
    ├── engine
    │   └── loop.js
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

## Module Organization

### Core Modules

- **app.js**: Composition root; imports and orchestrates all systems in startup sequence.
- **config.js**: Centralized constants for scene, controls, physics, rendering, UI parameters.
- **state.js**: Single shared runtime state container imported by all modules.
- **shaders.js**: Particle system vertex and fragment shader definitions as ES exports.

### Core Subsystem (core/)

Handles scene initialization, compatibility, input, and asset loading:

- **scene.js**: Three.js scene, camera, renderer, controls, and resize handling.
- **compat.js**: Cross-version Three.js API compatibility shims (quaternion, geometry, loader methods).
- **input.js**: Keyboard event binding for movement, fire, and restart controls.
- **assets.js**: PLY and OBJ+MTL asset loaders with fallback path handling.

### Systems (systems/)

Domain-specific simulation and gameplay logic:

- **solar-system.js**: Sun, Earth, Moon mesh creation and orbital animation.
- **dyson.js**: Dyson halo panel rings with rotation animation.
- **asteroids.js**: Procedural belt generation, GUI tuning, and per-frame rotation.
- **cloud.js**: Shader-based particle cloud for solar emission effect.
- **player.js**: UFO ship loading, movement, altitude clamping, follow camera.
- **combat.js**: Projectile spawning, collision resolution, health, victory conditions.
- **galactus.js**: Boss model loading, beam attack state machine, damage/perish animations.

### Engine (engine/)

- **loop.js**: requestAnimationFrame loop orchestrating per-frame update sequence across all systems.

### UI (ui/)

- **hud.js**: Health/status HUD panel and controls legend creation and frame-update rendering.

## Startup Sequence

1. **app.js** is imported as ES module by index.html.
2. **bootstrap()** executes in deterministic order:
   - Apply compatibility shims
   - Initialize scene, camera, renderer, controls
   - Build world systems (solar, dyson, stars, asteroids, cloud)
   - Load gameplay entities (player ship, Galactus boss)
   - Initialize combat state
   - Create HUD panel and legend
3. **loop.js** starts requestAnimationFrame loop.
4. Per-frame: systems animate → UI updates → render.

## Data Flow

- **State**: All sim and gameplay data flows through modules/state.js (shared singleton).
- **Config**: All tuning parameters centralized in modules/config.js.
- **Input**: Keyboard state written to state.input by core/input.js each frame.
- **Animation**: Each system reads state and writes transforms/values; loop.js orchestrates order.
- **Rendering**: loop.js calls state.renderer.render(state.scene, state.camera) each frame.

## Code Quality

- All functions include professional multi-line comments explaining intent and constraints.
- Large functions decomposed into smaller helpers with single responsibilities.
- Explicit ES module imports/exports enable precise dependency tracking.
- No dynamic global state; all sharing flows through state.js and config.js.

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
