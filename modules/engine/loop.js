(function() {
    window.SolarApp = window.SolarApp || {};
    window.SolarApp.engine = window.SolarApp.engine || {};

    var state = window.SolarApp.state;
    var systems = window.SolarApp.systems;
    var ui = window.SolarApp.ui;

    /*
     * Starts the runtime frame loop.
     * A shared clock is initialized once so every system
     * receives consistent delta-time values per frame.
     */
    function start() {
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

        systems.solarSystem.animate();
        systems.dyson.animate();
        systems.asteroids.animate();
        systems.galactus.animateConsumeAsteroids();
        systems.galactus.animateBeams(dt);
        systems.cloud.animate();

        systems.player.animatePlayer(dt);
        systems.player.animateFollowCamera();

        systems.combat.animateFire(dt);
        systems.combat.animateProjectiles(dt);
        systems.combat.animateCollisions();
        systems.combat.animateImpacts(dt);

        systems.galactus.animatePerish(dt);

        ui.hud.update();

        if (state.controls) {
            state.controls.update();
        }

        state.renderer.render(state.scene, state.camera);
    }

    window.SolarApp.engine.loop = {
        start: start
    };
})();