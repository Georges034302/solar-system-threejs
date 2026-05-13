import { applyCompatibilityShims } from "./core/compat.js";
import { initScene } from "./core/scene.js";
import { setupInput } from "./core/input.js";
import {
    build as buildSolarSystem,
    addLightsAndMaterials,
    addStarField
} from "./systems/solar-system.js";
import { build as buildDyson } from "./systems/dyson.js";
import { init as initAsteroids } from "./systems/asteroids.js";
import { load as loadPlayer } from "./systems/player.js";
import { load as loadGalactus } from "./systems/galactus.js";
import { build as buildCloud } from "./systems/cloud.js";
import { init as initCombat } from "./systems/combat.js";
import { create as createHud } from "./ui/hud.js";
import { start } from "./engine/loop.js";

/*
 * Bootstraps the full application in deterministic order.
 * Applies compatibility fixes, creates core runtime services,
 * builds systems, and starts the render/update loop.
 */
function bootstrap() {
    applyCompatibilityShims();
    initScene();
    setupInput();

    buildSolarSystem();
    addLightsAndMaterials();
    buildDyson();
    addStarField();

    initAsteroids();
    loadPlayer();
    loadGalactus();
    buildCloud();
    initCombat();

    createHud();

    start();
}

bootstrap();
