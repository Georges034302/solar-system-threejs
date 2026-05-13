import config from "../config.js";
import state from "../state.js";

/*
 * Builds a ring of transformed panel meshes around a radius.
 * Matrix composition is used so each panel can be positioned
 * and rotated efficiently without per-frame transform updates.
 */
function createHalo(radius, n, sx, sy, sz) {
    var group = new THREE.Group();
    var material = new THREE.MeshPhongMaterial({
        color: 0xC0C0C0,
        specular: 0xffffff,
        shininess: 80
    });

    for (var i = 0; i < n; i++) {
        var sca = new THREE.Matrix4();
        var rot = new THREE.Matrix4();
        var tra = new THREE.Matrix4();
        var combined = new THREE.Matrix4();

        sca.makeScale(sx, sy, sz);
        tra.makeTranslation(radius, 0, 0);
        rot.makeRotationY(i * (2 * Math.PI / n));

        combined.multiply(rot);
        combined.multiply(tra);
        combined.multiply(sca);

        var panel = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
        panel.matrixAutoUpdate = false;
        panel.matrix.copy(combined);
        group.add(panel);
    }

    return group;
}

/*
 * Creates the two Dyson halo layers and adds them to the scene.
 * The second halo is offset and rotated orthogonally to provide
 * the crossed-ring visual motif around the Sun.
 */
export function build() {
    var dyson = config.dyson;
    var haloRadius = config.solar.sunRadius + state.earthRadius;

    state.haloA = createHalo(
        haloRadius,
        dyson.panelCount,
        dyson.panelScale.x,
        dyson.panelScale.y,
        dyson.panelScale.z
    );
    state.scene.add(state.haloA);

    state.haloB = createHalo(
        haloRadius + dyson.secondaryOffset,
        dyson.panelCount,
        dyson.panelScale.x,
        dyson.panelScale.y,
        dyson.panelScale.z
    );
    state.haloB.rotation.x = Math.PI / 2;
    state.scene.add(state.haloB);
}

/*
 * Rotates both halo groups each frame.
 * The animation is lightweight and only updates group-level
 * transforms to keep motion smooth.
 */
export function animate() {
    if (state.haloA) state.haloA.rotation.y += config.dyson.spinSpeed;
    if (state.haloB) state.haloB.rotation.y += config.dyson.spinSpeed;
}
