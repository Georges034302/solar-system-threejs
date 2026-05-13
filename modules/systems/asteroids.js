(function() {
    window.SolarApp = window.SolarApp || {};
    window.SolarApp.systems = window.SolarApp.systems || {};

    var config = window.SolarApp.config;
    var state = window.SolarApp.state;

    /*
     * Initializes asteroid runtime defaults.
     * Derives initial belt radius from solar metrics,
     * then builds geometry and parameter UI controls.
     */
    function init() {
        state.asteroidParams.beltRadius = state.earthOrbit + config.asteroids.beltRadiusOffset;
        rebuild();
        buildGui();
    }

    /*
     * Rebuilds the full asteroid belt from current parameters.
     * Existing belt geometry is replaced so GUI changes are reflected
     * immediately in shape, count, and size distribution.
     */
    function rebuild() {
        if (state.asteroidBelt) {
            state.scene.remove(state.asteroidBelt);
        }

        state.asteroidBelt = new THREE.Group();

        for (var i = 0; i < state.asteroidParams.count; i++) {
            var angle = Math.random() * 2 * Math.PI;
            var radius = state.asteroidParams.beltRadius + (Math.random() - 0.5) * state.asteroidParams.beltWidth;
            var y = (Math.random() - 0.5) * 1.2;

            var geo = new THREE.SphereGeometry(1, 8, 8);
            var material = new THREE.MeshPhongMaterial({ color: 0x888888 });
            var asteroid = new THREE.Mesh(geo, material);

            asteroid.position.set(radius * Math.cos(angle), y, radius * Math.sin(angle));

            var sx = state.asteroidParams.size * (0.5 + Math.random());
            var sy = state.asteroidParams.size * (0.5 + Math.random());
            var sz = state.asteroidParams.size * (0.5 + Math.random());
            asteroid.scale.set(sx, sy, sz);

            asteroid.castShadow = true;
            asteroid.receiveShadow = true;

            state.asteroidBelt.add(asteroid);
        }

        state.scene.add(state.asteroidBelt);
    }

    /*
     * Creates a dat.GUI control panel for belt tuning.
     * Geometry-affecting changes trigger full belt rebuilds,
     * while rotation speed updates are applied live.
     */
    function buildGui() {
        state.gui = new dat.GUI();

        var params = {
            beltRadius: state.asteroidParams.beltRadius,
            beltWidth: state.asteroidParams.beltWidth,
            asteroidCount: state.asteroidParams.count,
            asteroidSize: state.asteroidParams.size,
            rotationSpeed: state.asteroidParams.rotationSpeed
        };

        state.gui.add(params, "beltRadius", state.earthOrbit + 2, state.earthOrbit + 15).onChange(function(value) {
            state.asteroidParams.beltRadius = value;
            rebuild();
        });

        state.gui.add(params, "beltWidth", 1, 10).onChange(function(value) {
            state.asteroidParams.beltWidth = value;
            rebuild();
        });

        state.gui.add(params, "asteroidCount", 50, 500).step(1).onChange(function(value) {
            state.asteroidParams.count = value;
            rebuild();
        });

        state.gui.add(params, "asteroidSize", 0.1, 1).onChange(function(value) {
            state.asteroidParams.size = value;
            rebuild();
        });

        state.gui.add(params, "rotationSpeed", 0.001, 0.02).onChange(function(value) {
            state.asteroidParams.rotationSpeed = value;
        });

        state.gui.open();
    }

    /*
     * Rotates the asteroid belt group each frame.
     * Uses the current runtime parameter so UI edits
     * take effect without restarting the scene.
     */
    function animate() {
        if (state.asteroidBelt) {
            state.asteroidBelt.rotation.y += state.asteroidParams.rotationSpeed;
        }
    }

    window.SolarApp.systems.asteroids = {
        init: init,
        rebuild: rebuild,
        animate: animate
    };
})();