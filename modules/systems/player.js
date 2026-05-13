(function() {
    window.SolarApp = window.SolarApp || {};
    window.SolarApp.systems = window.SolarApp.systems || {};

    var config = window.SolarApp.config;
    var state = window.SolarApp.state;
    var assets = window.SolarApp.core.assets;

    /*
     * Clamps a numeric value with compatibility fallbacks.
     * Uses Three.js utilities when present and falls back
     * to Math-based clamping for older runtime versions.
     */
    function clampValue(value, min, max) {
        if (THREE.MathUtils && THREE.MathUtils.clamp) {
            return THREE.MathUtils.clamp(value, min, max);
        }
        if (THREE.Math && THREE.Math.clamp) {
            return THREE.Math.clamp(value, min, max);
        }
        return Math.max(min, Math.min(max, value));
    }

    /*
     * Loads and prepares the player ship model.
     * Normalizes geometry origin/scale, applies spawn transform,
     * stores restart metadata, and registers the ship in shared state.
     */
    function load() {
        assets.loadPly("models/ufo.ply", function(geometry) {
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();

            var center = new THREE.Vector3();
            var size = new THREE.Vector3();
            geometry.boundingBox.getCenter(center);
            geometry.boundingBox.getSize(size);
            geometry.translate(-center.x, -center.y, -center.z);

            var material = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x888888,
                shininess: 40
            });

            var mesh = new THREE.Mesh(geometry, material);
            mesh.name = "playerShip";

            var targetSize = config.ship.targetSize;
            var scaleFactor = targetSize / Math.max(size.x, size.y, size.z);
            mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

            mesh.position.set(
                config.ship.spawnPosition.x,
                config.ship.spawnPosition.y,
                config.ship.spawnPosition.z
            );
            mesh.rotation.y = config.ship.spawnYaw;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.userData.spawnPosition = mesh.position.clone();
            mesh.userData.spawnRotation = mesh.rotation.clone();

            state.scene.add(mesh);
            state.playerShip = mesh;
        });
    }

    /*
     * Applies per-frame player movement and yaw controls.
     * Movement is ship-relative and constrained to configured
     * vertical limits for stable gameplay bounds.
     */
    function animatePlayer(dt) {
        if (!state.playerShip || state.gameplay.phase !== "playing") return;

        if (state.input.left) {
            state.playerShip.rotation.y += config.ship.turnSpeed * dt;
        }
        if (state.input.right) {
            state.playerShip.rotation.y -= config.ship.turnSpeed * dt;
        }

        var forward = new THREE.Vector3(1, 0, 0);
        forward.applyQuaternion(state.playerShip.quaternion).normalize();

        if (state.input.forward) {
            state.playerShip.position.addScaledVector(forward, config.ship.moveSpeed * dt);
        }
        if (state.input.backward) {
            state.playerShip.position.addScaledVector(forward, -config.ship.moveSpeed * dt);
        }
        if (state.input.rise) {
            state.playerShip.position.y += config.ship.verticalSpeed * dt;
        }
        if (state.input.descend) {
            state.playerShip.position.y -= config.ship.verticalSpeed * dt;
        }

        state.playerShip.position.y = clampValue(
            state.playerShip.position.y,
            -config.ship.verticalLimit,
            config.ship.verticalLimit
        );
    }

    /*
     * Updates third-person follow camera behavior.
     * Combines lag smoothing, minimum distance enforcement,
     * and look-target alignment for readable player framing.
     */
    function animateFollowCamera() {
        if (!state.playerShip || !state.camera) return;

        var followOffset = new THREE.Vector3(
            config.ship.followOffset.x,
            config.ship.followOffset.y,
            config.ship.followOffset.z
        );
        var lookOffset = new THREE.Vector3(
            config.ship.lookOffset.x,
            config.ship.lookOffset.y,
            config.ship.lookOffset.z
        );

        var desiredOffset = followOffset
            .clone()
            .multiplyScalar(config.ship.followDistanceMultiplier)
            .applyQuaternion(state.playerShip.quaternion);

        var desiredPosition = state.playerShip.position.clone().add(desiredOffset);
        var lagDistance = state.camera.position.distanceTo(desiredPosition);

        if (lagDistance > config.ship.maxLagSnapDistance) {
            state.camera.position.copy(desiredPosition);
        } else {
            state.camera.position.lerp(desiredPosition, config.ship.followSmoothing);
        }

        var lookTarget = state.playerShip.position.clone().add(lookOffset);
        var toCamera = state.camera.position.clone().sub(state.playerShip.position);

        if (toCamera.length() < config.ship.minCameraDistance) {
            toCamera.setLength(config.ship.minCameraDistance);
            state.camera.position.copy(state.playerShip.position.clone().add(toCamera));
        }

        var desiredDistance = followOffset.length() * config.ship.followDistanceMultiplier;
        var currentDistance = state.camera.position.distanceTo(state.playerShip.position);

        if (Math.abs(currentDistance - desiredDistance) > 1) {
            var away = state.camera.position.clone().sub(state.playerShip.position);
            if (away.lengthSq() < 0.0001) {
                away.set(0, 0.6, -1);
            }
            away.normalize();
            state.camera.position.copy(state.playerShip.position.clone().addScaledVector(away, desiredDistance));
        }

        state.camera.lookAt(lookTarget);
    }

    window.SolarApp.systems.player = {
        load: load,
        animatePlayer: animatePlayer,
        animateFollowCamera: animateFollowCamera
    };
})();