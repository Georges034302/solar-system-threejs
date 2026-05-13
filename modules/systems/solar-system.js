import config from "../config.js";
import state from "../state.js";

/*
 * Creates a wireframe sphere mesh used by the base celestial bodies.
 * Geometry density and color are provided by caller so the same helper
 * can construct Sun, Earth, and Moon consistently.
 */
function createSphere(radius, hlines, vlines, color) {
    var material = new THREE.MeshBasicMaterial();
    material.color = new THREE.Color(color);
    material.wireframe = true;
    var geometry = new THREE.SphereGeometry(radius, hlines, vlines);
    return new THREE.Mesh(geometry, material);
}

/*
 * Builds the solar core objects and derived orbital metrics.
 * Radii and orbit distances are computed from configuration ratios,
 * then meshes are instantiated and attached to the scene graph.
 */
export function build() {
    var solar = config.solar;

    state.earthRadius = solar.sunRadius * solar.earthRatio;
    state.moonRadius = state.earthRadius * solar.moonRatio;
    state.earthOrbit = 4 + solar.sunRadius * solar.earthOrbitFactor;
    state.moonOrbit = state.earthRadius * solar.moonOrbitFactor;

    state.sun = createSphere(solar.sunRadius, 42, 42, 0xffff00);
    state.sun.position.set(0, 0, 0);

    state.earth = createSphere(state.earthRadius, 32, 32, 0x006400);
    state.earth.position.set(state.earthOrbit, 0, 0);

    state.moon = createSphere(state.moonRadius, 16, 16, 0x888888);
    state.moon.position.set(state.earthOrbit + state.moonOrbit, 0, 0);

    state.scene.add(state.sun);
    state.scene.add(state.earth);
    state.scene.add(state.moon);
}

/*
 * Applies scene lighting and upgrades body materials for shading.
 * Also configures shadow participation and moon flat-shading to
 * preserve intended visual style from the original experience.
 */
export function addLightsAndMaterials() {
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    state.scene.add(ambientLight);

    var sunLight = new THREE.PointLight(0xffffff, 1.5);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    state.scene.add(sunLight);

    state.sun.material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        emissive: 0xffaa00,
        emissiveIntensity: 1
    });

    state.earth.material = new THREE.MeshLambertMaterial({ color: 0x006400 });
    state.moon.material = new THREE.MeshLambertMaterial({ color: 0x888888 });

    state.moon.material.flatShading = true;
    state.moon.material.needsUpdate = true;

    state.moon.castShadow = true;
    state.moon.receiveShadow = true;
    state.earth.castShadow = true;
    state.earth.receiveShadow = true;
}

/*
 * Populates a distant procedural star field around the play space.
 * Stars are distributed randomly while preserving a center exclusion
 * zone so nearby gameplay objects remain visually clear.
 */
export function addStarField() {
    var starCfg = config.stars;
    var starGeometry = new THREE.SphereGeometry(starCfg.radius, 6, 6);
    var starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var starGroup = new THREE.Group();

    for (var i = 0; i < starCfg.count; i++) {
        var star = new THREE.Mesh(starGeometry, starMaterial);
        var x = (Math.random() - 0.5) * starCfg.spread;
        var y = (Math.random() - 0.5) * starCfg.spread;
        var z = (Math.random() - 0.5) * starCfg.spread;

        if (
            Math.abs(x) < starCfg.exclusionHalfExtent &&
            Math.abs(y) < starCfg.exclusionHalfExtent &&
            Math.abs(z) < starCfg.exclusionHalfExtent
        ) {
            x += (x < 0 ? -starCfg.exclusionPush : starCfg.exclusionPush);
            y += (y < 0 ? -starCfg.exclusionPush : starCfg.exclusionPush);
            z += (z < 0 ? -starCfg.exclusionPush : starCfg.exclusionPush);
        }

        star.position.set(x, y, z);
        starGroup.add(star);
    }

    state.scene.add(starGroup);
    state.scene.background = new THREE.Color(0x000000);
}

/*
 * Advances planetary motion each frame.
 * Updates Earth spin/orbit plus Moon orbit and look-at alignment
 * to keep the system moving coherently over time.
 */
export function animate() {
    var solar = config.solar;

    state.earth.rotation.y += solar.earthSpinSpeed;

    state.theta += solar.earthOrbitStep;
    state.earth.position.x = state.earthOrbit * Math.cos(state.theta);
    state.earth.position.z = state.earthOrbit * Math.sin(state.theta);

    state.alpha -= solar.moonOrbitStep;
    state.moon.position.x = state.earth.position.x + state.moonOrbit * Math.cos(state.alpha);
    state.moon.position.z = state.earth.position.z + state.moonOrbit * Math.sin(state.alpha);
    state.moon.position.y = state.earth.position.y;
    state.moon.lookAt(state.earth.position);
}
