import config from "../config.js";
import state from "../state.js";

/*
 * Initializes the Three.js scene runtime.
 * Creates scene, camera, renderer, and controls,
 * then wires browser resize handling.
 */
export function initScene() {
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

/*
 * Keeps renderer and camera projection in sync with viewport size.
 * This protects aspect ratio correctness after window resizing
 * and immediately re-renders one frame with updated dimensions.
 */
export function onResize() {
    if (!state.renderer || !state.camera) return;

    var width = window.innerWidth;
    var height = window.innerHeight;
    state.renderer.setSize(width, height);
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.render(state.scene, state.camera);
}
