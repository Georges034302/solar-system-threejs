import config from "../config.js";
import state from "../state.js";
import { loadObjWithMtl } from "../core/assets.js";

/*
 * Loads the Galactus asset bundle (OBJ + MTL) and prepares it.
 * Centers/scales the mesh, configures render properties,
 * stores reset baselines, and spawns beam meshes.
 */
export function load() {
    loadObjWithMtl(
        config.galactus.basePaths,
        config.galactus.mtlFile,
        config.galactus.objFile,
        function(object) {
            prepareGalactusObject(object);
            state.galactus = object;
            state.scene.add(state.galactus);
            createBeams();
        },
        function(err) {
            console.error(err);
        }
    );
}

/*
 * Disables beam visuals and resets beam timing state.
 * Called on attack end, victory transition, and hard reset.
 */
export function hideBeams() {
    if (state.beamLeft) state.beamLeft.visible = false;
    if (state.beamRight) state.beamRight.visible = false;
    state.beams.active = false;
    state.beams.timer = 0;
}

/*
 * Removes asteroids that move too close to Galactus.
 * This simulates local consumption pressure around the boss
 * during normal world simulation.
 */
export function animateConsumeAsteroids() {
    if (!state.asteroidBelt || !state.galactus) return;

    var galactusPosition = getGalactusWorldPosition();

    removeAsteroidsWithinDistance(galactusPosition, config.asteroids.consumeDistance);
}

/*
 * Runs beam state machine and beam-side asteroid destruction.
 * Handles cooldowns, activation trigger, beam placement,
 * and automatic deactivation when duration expires.
 */
export function animateBeams(dt) {
    if (!state.galactus || !state.asteroidBelt || !state.beamLeft || !state.beamRight) return;

    updateBeamCooldown(dt);

    if (shouldActivateBeams()) {
        activateBeams();
    }

    if (!state.beams.active) {
        setBeamVisibility(false);
        return;
    }

    state.beams.timer -= dt;

    setBeamVisibility(true);

    var galactusPosition = getGalactusWorldPosition();
    updateBeamPositions(galactusPosition);
    removeAsteroidsWithinDistance(galactusPosition, config.galactus.beamAsteroidDistance);

    if (state.beams.timer <= 0) {
        hideBeams();
    }
}

/*
 * Applies a uniform opacity value to all Galactus mesh parts.
 * Used by perish and reset flows for coherent fade behavior
 * across the full hierarchical model.
 */
export function setOpacity(alpha) {
    if (!state.galactus) return;

    state.galactus.traverse(function(child) {
        if (child instanceof THREE.Mesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = alpha;
            child.material.needsUpdate = true;
        }
    });
}

/*
 * Plays victory perish animation for Galactus.
 * Progressively scales down, lowers position, and fades opacity
 * until the boss becomes invisible at completion.
 */
export function animatePerish(dt) {
    if (!state.galactus || state.gameplay.phase !== "victory") return;

    var userData = state.galactus.userData;
    if (!userData || !userData.baseScale || !userData.basePosition) return;

    state.gameplay.perishProgress = Math.min(
        1,
        state.gameplay.perishProgress + config.combat.perishSpeed * dt
    );

    var scaleFactor = 1 - 0.4 * state.gameplay.perishProgress;
    state.galactus.scale.set(
        userData.baseScale.x * scaleFactor,
        userData.baseScale.y * scaleFactor,
        userData.baseScale.z * scaleFactor
    );

    state.galactus.position.set(
        userData.basePosition.x,
        userData.basePosition.y - 2.2 * state.gameplay.perishProgress,
        userData.basePosition.z
    );

    setOpacity(1 - state.gameplay.perishProgress);

    if (state.gameplay.perishProgress >= 1) {
        state.galactus.visible = false;
    }
}

/*
 * Restores Galactus to baseline transform and full visibility.
 * Also clears any beam state so a restarted session begins clean.
 */
export function reset() {
    hideBeams();

    if (!state.galactus || !state.galactus.userData) return;

    state.galactus.visible = true;

    if (state.galactus.userData.basePosition) {
        state.galactus.position.copy(state.galactus.userData.basePosition);
    }
    if (state.galactus.userData.baseScale) {
        state.galactus.scale.copy(state.galactus.userData.baseScale);
    }
    if (typeof state.galactus.userData.baseRotationY === "number") {
        state.galactus.rotation.y = state.galactus.userData.baseRotationY;
    }

    setOpacity(1);
}

/*
 * Normalizes Galactus mesh transform and render properties.
 * Stores baseline values required by restart and perish flows.
 */
function prepareGalactusObject(object) {
    var bbox = new THREE.Box3().setFromObject(object);
    var center = new THREE.Vector3();
    var size = new THREE.Vector3();
    bbox.getCenter(center);
    bbox.getSize(size);

    object.position.sub(center);

    var scaleFactor = config.galactus.targetSize / Math.max(size.x, size.y, size.z);
    object.scale.set(scaleFactor, scaleFactor, scaleFactor);
    object.position.set(
        config.galactus.position.x,
        config.galactus.position.y,
        config.galactus.position.z
    );
    object.rotation.y = config.galactus.yaw;

    object.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = 1;
                child.material.needsUpdate = true;
            }
        }
    });

    object.userData.basePosition = object.position.clone();
    object.userData.baseScale = object.scale.clone();
    object.userData.baseRotationY = object.rotation.y;
}

/*
 * Creates left/right eye beam meshes used by boss attacks.
 * Beams are created once and toggled visible during
 * attack windows to avoid repeated allocations.
 */
function createBeams() {
    var beamGeometry = new THREE.CylinderGeometry(0.08, 0.08, 12.5, 12);
    var beamMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    state.beamLeft = new THREE.Mesh(beamGeometry, beamMaterial);
    state.beamRight = new THREE.Mesh(beamGeometry, beamMaterial);

    state.beamLeft.visible = false;
    state.beamRight.visible = false;

    state.beamLeft.rotation.z = -Math.PI / 6;
    state.beamRight.rotation.z = -Math.PI / 6;

    state.scene.add(state.beamLeft);
    state.scene.add(state.beamRight);
}

/*
 * Returns Galactus world position with updated transforms.
 */
function getGalactusWorldPosition() {
    state.scene.updateMatrixWorld();
    var galactusPosition = new THREE.Vector3();
    state.galactus.getWorldPosition(galactusPosition);
    return galactusPosition;
}

/*
 * Removes asteroids from the belt within a radius of Galactus.
 */
function removeAsteroidsWithinDistance(galactusPosition, distance) {
    for (var i = state.asteroidBelt.children.length - 1; i >= 0; i--) {
        var asteroid = state.asteroidBelt.children[i];
        var asteroidPosition = new THREE.Vector3();
        asteroid.getWorldPosition(asteroidPosition);

        if (galactusPosition.distanceTo(asteroidPosition) < distance) {
            state.asteroidBelt.remove(asteroid);
        }
    }
}

/*
 * Decrements beam cooldown using frame delta-time.
 */
function updateBeamCooldown(dt) {
    if (state.beams.cooldown > 0) {
        state.beams.cooldown -= dt;
    }
}

/*
 * Evaluates beam activation trigger condition.
 */
function shouldActivateBeams() {
    return (
        !state.beams.active &&
        state.asteroidParams.beltRadius >= config.galactus.beamTriggerRadius &&
        state.beams.cooldown <= 0
    );
}

/*
 * Activates beam state and resets attack timers.
 */
function activateBeams() {
    state.beams.active = true;
    state.beams.timer = config.galactus.beamDuration;
    state.beams.cooldown = config.galactus.beamCooldown;
}

/*
 * Toggles both beam meshes with one call.
 */
function setBeamVisibility(visible) {
    state.beamLeft.visible = visible;
    state.beamRight.visible = visible;
}

/*
 * Positions both beam meshes relative to Galactus face.
 */
function updateBeamPositions(galactusPosition) {
    var eyeY = galactusPosition.y + 8.6;
    var beamHalf = 6.25;

    var cx = galactusPosition.x - beamHalf * Math.sin(Math.PI / 3) + 1;
    var cy = eyeY - beamHalf * Math.cos(Math.PI / 3);

    state.beamLeft.position.set(cx, cy, galactusPosition.z - 0.5);
    state.beamRight.position.set(cx, cy, galactusPosition.z + 0.5);
}
