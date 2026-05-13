(function() {
    window.SolarApp = window.SolarApp || {};
    window.SolarApp.systems = window.SolarApp.systems || {};

    var config = window.SolarApp.config;
    var state = window.SolarApp.state;

    /*
     * Initializes combat runtime state for a fresh session.
     * Clears transient entities and restores baseline values
     * for health, timers, and gameplay phase.
     */
    function init() {
        state.gameplay.projectiles = [];
        state.gameplay.impacts = [];
        state.gameplay.health = config.combat.galactusMaxHealth;
        state.gameplay.phase = "playing";
        state.gameplay.fireTimer = 0;
        state.gameplay.perishProgress = 0;
    }

    /*
     * Requests restart only when victory has been reached.
     * This protects in-progress sessions from accidental reset
     * while preserving keyboard restart behavior post-win.
     */
    function requestRestart() {
        if (state.gameplay.phase === "victory") {
            restart();
        }
    }

    /*
     * Performs a full gameplay reset after victory.
     * Removes transient scene objects, restores ship and boss,
     * and clears any held fire input state.
     */
    function restart() {
        var i;

        for (i = state.gameplay.projectiles.length - 1; i >= 0; i--) {
            state.scene.remove(state.gameplay.projectiles[i]);
        }
        state.gameplay.projectiles = [];

        for (i = state.gameplay.impacts.length - 1; i >= 0; i--) {
            state.scene.remove(state.gameplay.impacts[i].mesh);
        }
        state.gameplay.impacts = [];

        state.gameplay.health = config.combat.galactusMaxHealth;
        state.gameplay.fireTimer = 0;
        state.gameplay.phase = "playing";
        state.gameplay.perishProgress = 0;
        state.input.fire = false;

        if (state.playerShip && state.playerShip.userData) {
            if (state.playerShip.userData.spawnPosition) {
                state.playerShip.position.copy(state.playerShip.userData.spawnPosition);
            }
            if (state.playerShip.userData.spawnRotation) {
                state.playerShip.rotation.copy(state.playerShip.userData.spawnRotation);
            }
        }

        if (window.SolarApp.systems.galactus) {
            window.SolarApp.systems.galactus.reset();
        }
    }

    /*
     * Spawns one projectile from the ship forward axis.
     * The projectile stores velocity and lifetime metadata
     * used by update and collision systems.
     */
    function spawnProjectile() {
        if (!state.playerShip || state.gameplay.phase !== "playing") return;

        var geometry = new THREE.CylinderGeometry(0.11, 0.11, 1.1, 10);
        var material = new THREE.MeshBasicMaterial({ color: 0xff7a33 });
        var projectile = new THREE.Mesh(geometry, material);

        var forward = new THREE.Vector3(1, 0, 0);
        forward.applyQuaternion(state.playerShip.quaternion).normalize();

        projectile.position.copy(state.playerShip.position).addScaledVector(forward, 2.7);
        projectile.position.y += 0.5;

        projectile.quaternion.copy(state.playerShip.quaternion);
        projectile.rotateZ(-Math.PI / 2);

        projectile.userData.velocity = forward.clone().multiplyScalar(config.combat.projectileSpeed);
        projectile.userData.life = config.combat.projectileLifeSeconds;
        projectile.userData.prevPosition = projectile.position.clone();

        state.gameplay.projectiles.push(projectile);
        state.scene.add(projectile);
    }

    /*
     * Handles fire input and cooldown timing.
     * Holding fire generates repeated shots at a
     * controlled cadence defined in configuration.
     */
    function animateFire(dt) {
        if (state.gameplay.phase !== "playing") return;

        state.gameplay.fireTimer -= dt;
        if (state.input.fire && state.gameplay.fireTimer <= 0) {
            spawnProjectile();
            state.gameplay.fireTimer = config.combat.fireCooldown;
        }
    }

    /*
     * Advances active projectiles and removes expired ones.
     * Previous-frame position is retained to support swept
     * segment collision tests against moving geometry.
     */
    function animateProjectiles(dt) {
        for (var i = state.gameplay.projectiles.length - 1; i >= 0; i--) {
            var projectile = state.gameplay.projectiles[i];
            if (!projectile.userData.prevPosition) {
                projectile.userData.prevPosition = projectile.position.clone();
            } else {
                projectile.userData.prevPosition.copy(projectile.position);
            }

            projectile.position.addScaledVector(projectile.userData.velocity, dt);
            projectile.userData.life -= dt;

            if (projectile.userData.life <= 0) {
                state.scene.remove(projectile);
                state.gameplay.projectiles.splice(i, 1);
            }
        }
    }

    /*
     * Resolves projectile collisions against Galactus geometry.
     * Uses raycast sweep per frame to avoid tunneling and applies
     * damage, impact FX, and victory-state transitions.
     */
    function animateCollisions() {
        if (!state.galactus || state.gameplay.phase !== "playing") return;

        var rayCaster = new THREE.Raycaster();

        for (var i = state.gameplay.projectiles.length - 1; i >= 0; i--) {
            var projectile = state.gameplay.projectiles[i];
            var start = projectile.userData.prevPosition || projectile.position;
            var end = projectile.position;
            var segment = end.clone().sub(start);
            var segmentLength = segment.length();
            var hit = false;
            var hitPoint = end.clone();

            if (segmentLength > 0.0001) {
                rayCaster.set(start.clone(), segment.clone().normalize());
                rayCaster.near = 0;
                rayCaster.far = segmentLength;

                var intersections = rayCaster.intersectObject(state.galactus, true);
                if (intersections.length > 0) {
                    hit = true;
                    hitPoint.copy(intersections[0].point);
                }
            }

            if (hit) {
                projectile.position.copy(hitPoint);
                spawnImpact(hitPoint);

                state.scene.remove(projectile);
                state.gameplay.projectiles.splice(i, 1);

                state.gameplay.health = Math.max(0, state.gameplay.health - config.combat.projectileDamage);
                if (state.gameplay.health <= 0) {
                    state.gameplay.phase = "victory";
                    state.gameplay.perishProgress = 0;
                    if (window.SolarApp.systems.galactus) {
                        window.SolarApp.systems.galactus.hideBeams();
                    }
                    break;
                }
            }
        }
    }

    /*
     * Spawns short-lived visual feedback at a hit location.
     * Impact instances are tracked so they can be animated
     * and removed automatically after their lifetime.
     */
    function spawnImpact(position) {
        var impactGeometry = new THREE.SphereGeometry(config.combat.impactRadius, 8, 8);
        var impactMaterial = new THREE.MeshBasicMaterial({
            color: 0xffc27a,
            transparent: true,
            opacity: 0.9
        });

        var impactMesh = new THREE.Mesh(impactGeometry, impactMaterial);
        impactMesh.position.copy(position);
        state.scene.add(impactMesh);

        state.gameplay.impacts.push({
            mesh: impactMesh,
            life: config.combat.impactLife,
            maxLife: config.combat.impactLife,
            growth: config.combat.impactGrowth
        });
    }

    /*
     * Animates and expires active impact effects.
     * Each effect grows and fades over time before
     * being removed from scene and state.
     */
    function animateImpacts(dt) {
        for (var i = state.gameplay.impacts.length - 1; i >= 0; i--) {
            var impact = state.gameplay.impacts[i];
            impact.life -= dt;

            var ageRatio = 1 - (impact.life / impact.maxLife);
            var splashScale = 1 + impact.growth * ageRatio;
            impact.mesh.scale.set(splashScale, splashScale, splashScale);
            impact.mesh.material.opacity = Math.max(0, 1 - ageRatio);

            if (impact.life <= 0) {
                state.scene.remove(impact.mesh);
                state.gameplay.impacts.splice(i, 1);
            }
        }
    }

    window.SolarApp.systems.combat = {
        init: init,
        requestRestart: requestRestart,
        restart: restart,
        animateFire: animateFire,
        animateProjectiles: animateProjectiles,
        animateCollisions: animateCollisions,
        animateImpacts: animateImpacts
    };
})();