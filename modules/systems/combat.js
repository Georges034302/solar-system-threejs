import config from "../config.js";
import state from "../state.js";
import { hideBeams, reset as resetGalactus } from "./galactus.js";

var collisionRayCaster = new THREE.Raycaster();
var sharedProjectileGeometry = new THREE.CylinderGeometry(0.11, 0.11, 1.1, 10);
var sharedProjectileMaterial = new THREE.MeshBasicMaterial({ color: 0xff7a33 });
var sharedImpactGeometry = new THREE.SphereGeometry(config.combat.impactRadius, 8, 8);

/*
 * Initializes combat runtime state for a fresh session.
 * Clears transient entities and restores baseline values
 * for health, timers, and gameplay phase.
 */
export function init() {
    resetCombatTransientState();
    resetGameplayState();
}

/*
 * Requests restart only when victory has been reached.
 * This protects in-progress sessions from accidental reset
 * while preserving keyboard restart behavior post-win.
 */
export function requestRestart() {
    if (state.gameplay.phase === "victory") {
        restart();
    }
}

/*
 * Performs a full gameplay reset after victory.
 * Removes transient scene objects, restores ship and boss,
 * and clears any held fire input state.
 */
export function restart() {
    removeAllProjectiles();
    removeAllImpacts();
    resetGameplayState();
    resetPlayerToSpawn();
    state.input.fire = false;
    resetGalactus();
}

/*
 * Handles fire input and cooldown timing.
 * Holding fire generates repeated shots at a
 * controlled cadence defined in configuration.
 */
export function animateFire(dt) {
    if (state.gameplay.phase !== "playing") return;

    state.gameplay.fireTimer -= dt;
    if (state.input.fire && state.gameplay.fireTimer <= 0) {
        spawnProjectile();
        state.gameplay.fireTimer = config.combat.fireCooldown;
    }
}

/*
 * Advances active projectiles and removes expired ones.
 * Previous-frame position is retained to support swept
 * segment collision tests against moving geometry.
 */
export function animateProjectiles(dt) {
    for (var i = state.gameplay.projectiles.length - 1; i >= 0; i--) {
        var projectile = state.gameplay.projectiles[i];

        updateProjectilePreviousPosition(projectile);
        projectile.position.addScaledVector(projectile.userData.velocity, dt);
        projectile.userData.life -= dt;

        if (projectile.userData.life <= 0) {
            removeProjectileAt(i);
        }
    }
}

/*
 * Resolves projectile collisions against Galactus geometry.
 * Uses raycast sweep per frame to avoid tunneling and applies
 * damage, impact FX, and victory-state transitions.
 */
export function animateCollisions() {
    if (!state.galactus || state.gameplay.phase !== "playing") return;

    for (var i = state.gameplay.projectiles.length - 1; i >= 0; i--) {
        var projectile = state.gameplay.projectiles[i];
        var hitPoint = getProjectileHitPoint(projectile, collisionRayCaster);

        if (!hitPoint) {
            continue;
        }

        applyProjectileHit(i, hitPoint);

        if (state.gameplay.phase === "victory") {
            break;
        }
    }
}

/*
 * Animates and expires active impact effects.
 * Each effect grows and fades over time before
 * being removed from scene and state.
 */
export function animateImpacts(dt) {
    for (var i = state.gameplay.impacts.length - 1; i >= 0; i--) {
        var impact = state.gameplay.impacts[i];
        impact.life -= dt;

        var ageRatio = 1 - (impact.life / impact.maxLife);
        var splashScale = 1 + impact.growth * ageRatio;
        impact.mesh.scale.set(splashScale, splashScale, splashScale);
        impact.mesh.material.opacity = Math.max(0, 1 - ageRatio);

        if (impact.life <= 0) {
            removeImpactAt(i);
        }
    }
}

/*
 * Resets arrays used for active projectiles and impact effects.
 * This is used during startup and restart to guarantee a clean
 * transient entity state.
 */
function resetCombatTransientState() {
    state.gameplay.projectiles = [];
    state.gameplay.impacts = [];
}

/*
 * Restores all core gameplay scalar values to defaults.
 * Keeps values synchronized with configuration for
 * health, timers, phase, and perish progression.
 */
function resetGameplayState() {
    state.gameplay.health = config.combat.galactusMaxHealth;
    state.gameplay.phase = "playing";
    state.gameplay.fireTimer = 0;
    state.gameplay.perishProgress = 0;
}

/*
 * Removes every active projectile from scene and state.
 */
function removeAllProjectiles() {
    for (var i = state.gameplay.projectiles.length - 1; i >= 0; i--) {
        state.scene.remove(state.gameplay.projectiles[i]);
    }
    state.gameplay.projectiles = [];
}

/*
 * Removes every active impact effect from scene and state.
 */
function removeAllImpacts() {
    for (var i = state.gameplay.impacts.length - 1; i >= 0; i--) {
        removeImpactAt(i);
    }
}

/*
 * Restores the player ship to the saved spawn transform.
 * This is intentionally no-op safe when the ship has not
 * loaded yet or userData metadata is missing.
 */
function resetPlayerToSpawn() {
    if (!state.playerShip || !state.playerShip.userData) {
        return;
    }

    if (state.playerShip.userData.spawnPosition) {
        state.playerShip.position.copy(state.playerShip.userData.spawnPosition);
    }
    if (state.playerShip.userData.spawnRotation) {
        state.playerShip.rotation.copy(state.playerShip.userData.spawnRotation);
    }
}

/*
 * Spawns one projectile from the ship forward axis.
 * The projectile stores velocity and lifetime metadata
 * used by update and collision systems.
 */
function spawnProjectile() {
    if (!state.playerShip || state.gameplay.phase !== "playing") return;

    var projectile = new THREE.Mesh(sharedProjectileGeometry, sharedProjectileMaterial);

    var forward = getPlayerForwardVector();

    projectile.position.copy(state.playerShip.position).addScaledVector(forward, 2.7);
    projectile.position.y += 0.5;

    projectile.quaternion.copy(state.playerShip.quaternion);
    projectile.rotateZ(-Math.PI / 2);

    projectile.userData.velocity = forward.clone().multiplyScalar(config.combat.projectileSpeed);
    projectile.userData.life = config.combat.projectileLifeSeconds;
    projectile.userData.prevPosition = projectile.position.clone();

    state.gameplay.projectiles.push(projectile);
    state.scene.add(projectile);
}

/*
 * Returns the ship forward direction in world space.
 */
function getPlayerForwardVector() {
    var forward = new THREE.Vector3(1, 0, 0);
    forward.applyQuaternion(state.playerShip.quaternion).normalize();
    return forward;
}

/*
 * Preserves projectile previous position for swept tests.
 */
function updateProjectilePreviousPosition(projectile) {
    if (!projectile.userData.prevPosition) {
        projectile.userData.prevPosition = projectile.position.clone();
        return;
    }

    projectile.userData.prevPosition.copy(projectile.position);
}

/*
 * Removes one projectile by index from scene and state.
 */
function removeProjectileAt(index) {
    state.scene.remove(state.gameplay.projectiles[index]);
    state.gameplay.projectiles.splice(index, 1);
}

/*
 * Computes hit point for a projectile segment against Galactus.
 * Returns null when no intersection is detected for this frame.
 */
function getProjectileHitPoint(projectile, rayCaster) {
    var start = projectile.userData.prevPosition || projectile.position;
    var end = projectile.position;
    var segment = end.clone().sub(start);
    var segmentLength = segment.length();

    if (segmentLength <= 0.0001) {
        return null;
    }

    rayCaster.set(start.clone(), segment.clone().normalize());
    rayCaster.near = 0;
    rayCaster.far = segmentLength;

    var intersections = rayCaster.intersectObject(state.galactus, true);
    if (intersections.length === 0) {
        return null;
    }

    return intersections[0].point.clone();
}

/*
 * Applies all side-effects for a confirmed projectile hit.
 * Includes visual impact, projectile removal, damage,
 * and potential transition into victory state.
 */
function applyProjectileHit(projectileIndex, hitPoint) {
    var projectile = state.gameplay.projectiles[projectileIndex];
    projectile.position.copy(hitPoint);

    spawnImpact(hitPoint);
    removeProjectileAt(projectileIndex);

    state.gameplay.health = Math.max(0, state.gameplay.health - config.combat.projectileDamage);

    if (state.gameplay.health > 0) {
        return;
    }

    state.gameplay.phase = "victory";
    state.gameplay.perishProgress = 0;
    hideBeams();
}

/*
 * Spawns short-lived visual feedback at a hit location.
 * Impact instances are tracked so they can be animated
 * and removed automatically after their lifetime.
 */
function spawnImpact(position) {
    var impactMaterial = new THREE.MeshBasicMaterial({
        color: 0xffc27a,
        transparent: true,
        opacity: 0.9
    });

    var impactMesh = new THREE.Mesh(sharedImpactGeometry, impactMaterial);
    impactMesh.position.copy(position);
    state.scene.add(impactMesh);

    state.gameplay.impacts.push({
        mesh: impactMesh,
        life: config.combat.impactLife,
        maxLife: config.combat.impactLife,
        growth: config.combat.impactGrowth
    });
}

/*
 * Removes one impact mesh and disposes its unique material.
 * Geometry is shared globally, so only material is disposed.
 */
function removeImpactAt(index) {
    var impact = state.gameplay.impacts[index];
    state.scene.remove(impact.mesh);
    if (impact.mesh.material && typeof impact.mesh.material.dispose === "function") {
        impact.mesh.material.dispose();
    }
    state.gameplay.impacts.splice(index, 1);
}
