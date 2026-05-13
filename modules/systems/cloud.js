(function() {
    window.SolarApp = window.SolarApp || {};
    window.SolarApp.systems = window.SolarApp.systems || {};

    var config = window.SolarApp.config;
    var state = window.SolarApp.state;

    /*
     * Builds the shader-driven solar emission cloud.
     * Generates particle positions/alphas, wires custom shaders,
     * and attaches the point cloud to the scene.
     */
    function build() {
        var cloudCfg = config.cloud;

        var positions = new Float32Array(cloudCfg.numVertices * 3);
        var alphas = new Float32Array(cloudCfg.numVertices);

        for (var i = 0; i < cloudCfg.numVertices; i++) {
            var theta = Math.acos(2 * Math.random() - 1);
            var phi = 2 * Math.PI * Math.random();

            positions[i * 3] = cloudCfg.baseRadius * Math.sin(theta) * Math.cos(phi);
            positions[i * 3 + 1] = cloudCfg.baseRadius * Math.sin(theta) * Math.sin(phi);
            positions[i * 3 + 2] = cloudCfg.baseRadius * Math.cos(theta);
            alphas[i] = 0.75 + 0.25 * Math.random();
        }

        var geometry = new THREE.BufferGeometry();
        geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute("alpha", new THREE.BufferAttribute(alphas, 1));

        var uniforms = {
            color: { value: new THREE.Color(1, 0.65, 0.15) }
        };

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: document.getElementById("particleVertexShader").textContent,
            fragmentShader: document.getElementById("particleFragmentShader").textContent,
            transparent: true,
            depthWrite: false
        });

        state.cloud = new THREE.Points(geometry, shaderMaterial);
        state.cloud.position.set(0, 0, 0);
        state.scene.add(state.cloud);
        state.cloudScale = 1;
    }

    /*
     * Animates cloud expansion, fade, and reset pulse cycle.
     * Alpha values are decayed per frame and regenerated when
     * cloud scale reaches configured maximum.
     */
    function animate() {
        if (!state.cloud) return;

        var cloudCfg = config.cloud;

        state.cloud.position.set(0, 0, 0);
        state.cloudScale += cloudCfg.growthSpeed;
        state.cloud.scale.set(state.cloudScale, state.cloudScale, state.cloudScale);

        var alphaAttribute = state.cloud.geometry.attributes.alpha;
        var alphas = alphaAttribute.array;

        for (var i = 0; i < alphas.length; i++) {
            alphas[i] *= cloudCfg.fadeFactor;
            if (alphas[i] < cloudCfg.minAlpha) {
                alphas[i] = cloudCfg.minAlpha;
            }
        }

        alphaAttribute.needsUpdate = true;
        state.cloud.rotation.y += cloudCfg.rotationSpeed;

        if (state.cloudScale >= cloudCfg.maxScale) {
            state.cloudScale = 1;
            state.cloud.scale.set(state.cloudScale, state.cloudScale, state.cloudScale);

            for (var j = 0; j < alphas.length; j++) {
                alphas[j] = 0.75 + 0.25 * Math.random();
            }
            alphaAttribute.needsUpdate = true;
        }
    }

    window.SolarApp.systems.cloud = {
        build: build,
        animate: animate
    };
})();