import state from "../state.js";
import { animate as animateSolarSystem } from "../systems/solar-system.js";
import { animate as animateDyson } from "../systems/dyson.js";
import { animate as animateAsteroids } from "../systems/asteroids.js";
import {
    animateConsumeAsteroids,
    animateBeams,
    animatePerish
} from "../systems/galactus.js";
import { animate as animateCloud } from "../systems/cloud.js";
import { animatePlayer, animateFollowCamera } from "../systems/player.js";
import {
    animateFire,
    animateProjectiles,
    animateCollisions,
    animateImpacts
} from "../systems/combat.js";
import { update as updateHud } from "../ui/hud.js";

/*
 * Starts the runtime frame loop.
 * A shared clock is initialized once so every system
 * receives consistent delta-time values per frame.
 */
export function start() {
    state.clock = new THREE.Clock();
    animate();
}

/*
 * Main per-frame update pipeline.
 * Executes systems in stable order, updates UI,
 * then renders the scene with the active camera.
 */
function animate() {
    requestAnimationFrame(animate);

    var dt = Math.min(state.clock.getDelta(), 0.05);
    animateSolarSystem();
    animateDyson();
    animateAsteroids();
    animateConsumeAsteroids();
    animateBeams(dt);
    animateCloud();

    animatePlayer(dt);
    animateFollowCamera();

    animateFire(dt);
    animateProjectiles(dt);
    animateCollisions();
    animateImpacts(dt);

    animatePerish(dt);

    updateHud();

    if (state.controls) {
        state.controls.update();
    }

    state.renderer.render(state.scene, state.camera);
}
