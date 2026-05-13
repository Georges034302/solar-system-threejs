(function() {
    window.SolarApp = window.SolarApp || {};
    window.SolarApp.core = window.SolarApp.core || {};

    var config = window.SolarApp.config;
    var state = window.SolarApp.state;

    function initScene() {
        state.scene = new THREE.Scene();

        var ratio = window.innerWidth / window.innerHeight;
        state.camera = new THREE.PerspectiveCamera(
            config.scene.fov,
            ratio,
            config.scene.near,
            config.scene.far
        );
        state.camera.position.set(
            config.scene.initialCamera.x,
            config.scene.initialCamera.y,
            config.scene.initialCamera.z
        );
        state.camera.lookAt(0, 0, 0);

        state.renderer = new THREE.WebGLRenderer({ antialias: true });
        state.renderer.setPixelRatio(window.devicePixelRatio);
        state.renderer.setSize(window.innerWidth, window.innerHeight);
        state.renderer.shadowMap.enabled = true;
        document.body.appendChild(state.renderer.domElement);

        state.controls = new THREE.OrbitControls(state.camera, state.renderer.domElement);
        state.controls.enableZoom = config.controls.enableZoom;
        state.controls.minDistance = config.controls.minDistance;
        state.controls.maxDistance = config.controls.maxDistance;
        state.controls.enableDamping = config.controls.enableDamping;
        state.controls.dampingFactor = config.controls.dampingFactor;
        state.controls.enablePan = config.controls.enablePan;
        state.controls.enabled = config.controls.enabled;

        window.addEventListener("resize", onResize);
    }

    function onResize() {
        if (!state.renderer || !state.camera) return;

        var width = window.innerWidth;
        var height = window.innerHeight;
        state.renderer.setSize(width, height);
        state.camera.aspect = width / height;
        state.camera.updateProjectionMatrix();
        state.renderer.render(state.scene, state.camera);
    }

    window.SolarApp.core.scene = {
        initScene: initScene,
        onResize: onResize
    };
})();