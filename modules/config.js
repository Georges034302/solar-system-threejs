const config = {
    scene: {
        fov: 45,
        near: 0.1,
        far: 1000,
        initialCamera: { x: 10, y: 10, z: 300 }
    },
    controls: {
        enableZoom: true,
        minDistance: 2,
        maxDistance: 50,
        enableDamping: true,
        dampingFactor: 0.08,
        enablePan: false,
        enabled: false
    },
    solar: {
        sunRadius: 3,
        earthRatio: 0.5,
        moonRatio: 1 / 3,
        earthOrbitFactor: 3,
        moonOrbitFactor: 2,
        earthSpinSpeed: 0.015,
        earthOrbitStep: 2 * Math.PI / 2000,
        moonOrbitStep: 4 * Math.PI / 1000
    },
    dyson: {
        panelCount: 36,
        panelScale: { x: 0.25, y: 1.2, z: 0.5 },
        spinSpeed: 0.01,
        secondaryOffset: 0.4
    },
    stars: {
        count: 1200,
        spread: 1200,
        exclusionHalfExtent: 80,
        exclusionPush: 120,
        radius: 0.35
    },
    asteroids: {
        beltRadiusOffset: 6,
        beltWidth: 4,
        count: 180,
        size: 0.3,
        rotationSpeed: 0.002,
        consumeDistance: 4
    },
    ship: {
        targetSize: 2.5,
        spawnPosition: { x: -15, y: 5, z: 0 },
        spawnYaw: Math.PI / 2,
        moveSpeed: 18,
        turnSpeed: 1.9,
        verticalSpeed: 12,
        verticalLimit: 12,
        followOffset: { x: -24, y: 11, z: 0 },
        lookOffset: { x: 0, y: 2.6, z: 0 },
        followSmoothing: 0.22,
        followDistanceMultiplier: 2,
        minCameraDistance: 7.5,
        maxLagSnapDistance: 28
    },
    combat: {
        projectileSpeed: 48,
        projectileLifeSeconds: 2,
        projectileDamage: 10,
        fireCooldown: 0.22,
        galactusMaxHealth: 100,
        perishSpeed: 0.24,
        impactLife: 0.22,
        impactGrowth: 7,
        impactRadius: 0.2
    },
    galactus: {
        basePaths: ["models/", "/models/", "../../models/"],
        mtlFile: "galactus.mtl",
        objFile: "galactus.obj",
        targetSize: 12,
        position: { x: 30, y: 0, z: 0 },
        yaw: -Math.PI / 2,
        beamDuration: 0.4,
        beamCooldown: 2,
        beamTriggerRadius: 22,
        beamAsteroidDistance: 6
    },
    cloud: {
        baseRadius: 4.5,
        numVertices: 2500,
        growthSpeed: 0.02,
        maxScale: 8,
        rotationSpeed: 0.005,
        fadeFactor: 0.9985,
        minAlpha: 0.02
    },
    ui: {
        panelWidth: 245,
        top: 12,
        left: 12,
        gap: 8
    }
};

export default config;
