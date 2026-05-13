# Configuration

Project runtime constants are centralized in modules/config.js.

## Main Sections

- scene: Camera FOV, clip planes, initial camera position.
- controls: OrbitControls behavior and defaults.
- solar: Orbital scale and angular step values.
- dyson: Halo geometry and spin tuning.
- stars: Star density and placement range.
- asteroids: Belt shape, count, size, and rotation speed.
- ship: Movement, turn rate, vertical limits, follow camera tuning.
- combat: Projectile behavior, health, cooldowns, impact FX.
- galactus: Asset filenames, transforms, beam timings.
- cloud: Shader cloud particle count and pulse parameters.
- ui: HUD placement and panel sizing.

## Safe Tuning Guidance

- Change one section at a time and test behavior in browser.
- Keep projectile speed, damage, and cooldown balanced together.
- Use moderate asteroid counts to avoid performance spikes.
- Maintain follow camera offsets large enough for gameplay visibility.

## Suggested Profile Presets

- Arcade: higher moveSpeed and fire rate.
- Cinematic: slower movement and wider follow distance.
- Challenge: lower damage and tighter cooldown windows.
