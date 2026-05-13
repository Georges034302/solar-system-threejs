/*
 * Particle system shader definitions.
 * Vertex shader handles alpha pass-through and vertex positioning.
 * Fragment shader applies color with per-vertex alpha blending.
 */

export const particleVertexShader = `
    attribute float alpha;
    varying float vAlpha;
    void main() {
        vAlpha = alpha;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 2.0;
        gl_Position = projectionMatrix * mvPosition;
    }
`;

export const particleFragmentShader = `
    uniform vec3 color;
    varying float vAlpha;
    void main() {
        gl_FragColor = vec4(color, vAlpha);
    }
`;
