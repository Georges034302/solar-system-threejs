(function() {
    window.SolarApp = window.SolarApp || {};

    var core = window.SolarApp.core;
    var systems = window.SolarApp.systems;
    var ui = window.SolarApp.ui;
    var engine = window.SolarApp.engine;

    /*
     * Bootstraps the full application in deterministic order.
     * Applies compatibility fixes, creates core runtime services,
     * builds systems, and starts the render/update loop.
     */
    function bootstrap() {
        core.compat.applyCompatibilityShims();
        core.scene.initScene();
        core.input.setupInput();

        systems.solarSystem.build();
        systems.solarSystem.addLightsAndMaterials();
        systems.dyson.build();
        systems.solarSystem.addStarField();

        systems.asteroids.init();
        systems.player.load();
        systems.galactus.load();
        systems.cloud.build();
        systems.combat.init();

        ui.hud.create();

        engine.loop.start();
    }

    bootstrap();
})();