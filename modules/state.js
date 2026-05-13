import config from "./config.js";

const state = {
    scene: null,
    camera: null,
    renderer: null,
    controls: null,
    gui: null,
    clock: null,

    sun: null,
    earth: null,
    moon: null,
    haloA: null,
    haloB: null,
    asteroidBelt: null,
    playerShip: null,
    galactus: null,
    cloud: null,
    beamLeft: null,
    beamRight: null,

    earthRadius: 0,
    moonRadius: 0,
    earthOrbit: 0,
    moonOrbit: 0,

    theta: 0,
    alpha: 0,
    cloudScale: 1,

    input: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        rise: false,
        descend: false,
        fire: false
    },

    gameplay: {
        phase: "playing",
        health: config.combat.galactusMaxHealth,
        fireTimer: 0,
        perishProgress: 0,
        projectiles: [],
        impacts: []
    },

    asteroidParams: {
        beltRadius: 0,
        beltWidth: config.asteroids.beltWidth,
        count: config.asteroids.count,
        size: config.asteroids.size,
        rotationSpeed: config.asteroids.rotationSpeed
    },

    hud: {
        root: null,
        healthValue: null,
        statusValue: null,
        legendRoot: null
    },

    shimsApplied: false,
    beams: {
        active: false,
        timer: 0,
        cooldown: 0
    }
};

export default state;
