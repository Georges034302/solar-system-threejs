# Controls and Gameplay

## Controls

- Arrow Up: Move forward
- Arrow Down: Move backward
- Arrow Left: Turn left
- Arrow Right: Turn right
- Q: Move up
- W: Move down
- Space: Fire projectile
- Tab: Restart after victory

## Gameplay Flow

1. Player controls ship in third-person view.
2. Projectiles can damage Galactus on direct mesh intersection.
3. Galactus health decreases until zero.
4. At zero health, victory state triggers perish animation.
5. Tab restarts combat and resets state.

## HUD

- Health panel displays current and max health.
- Status panel displays playing or win state.
- Controls legend stays visible for quick reference.

## Combat Rules

- Fire rate is constrained by cooldown.
- Projectiles have finite lifetime.
- Collision is segment raycast-based for strict hit registration.

## Balancing Knobs

Use modules/config.js to adjust:

- move speed and turning responsiveness
- projectile speed and damage
- fire cooldown and boss health
- camera follow distance and smoothing
