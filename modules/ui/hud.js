import config from "../config.js";
import state from "../state.js";
import { hideBeams } from "../systems/galactus.js";

/*
 * Creates the primary HUD container and value fields.
 * Initializes health/status rows once, then constructs
 * the controls legend and positions both panels.
 */
export function create() {
    if (state.hud.root) return;

    state.hud.root = createPanelRoot();
    state.hud.healthValue = document.createElement("span");
    state.hud.statusValue = document.createElement("span");

    state.hud.root.appendChild(createRow("HEALTH", state.hud.healthValue, "#ff7eb6", "1.5px"));
    state.hud.root.appendChild(createRow("STATUS", state.hud.statusValue, "#eeddff", "0.5px"));

    document.body.appendChild(state.hud.root);

    createLegend();
    updatePosition();
}

/*
 * Recomputes HUD and legend placement.
 * Keeps legend stacked directly beneath the main panel
 * even when dimensions change.
 */
export function updatePosition() {
    if (!state.hud.root || !state.hud.legendRoot) return;

    state.hud.root.style.top = config.ui.top + "px";
    state.hud.root.style.left = config.ui.left + "px";

    state.hud.legendRoot.style.left = config.ui.left + "px";
    state.hud.legendRoot.style.top = (
        config.ui.top +
        state.hud.root.offsetHeight +
        config.ui.gap
    ) + "px";
    state.hud.legendRoot.style.minHeight = state.hud.root.offsetHeight + "px";
}

/*
 * Refreshes HUD dynamic values each frame.
 * Synchronizes panel layout and prints current
 * gameplay health and phase text.
 */
export function update() {
    if (!state.hud.healthValue || !state.hud.statusValue) return;

    if (
        state.gameplay.phase !== "playing" &&
        (
            state.beams.active ||
            (state.beamLeft && state.beamLeft.visible) ||
            (state.beamRight && state.beamRight.visible)
        )
    ) {
        hideBeams();
    }

    updatePosition();
    state.hud.healthValue.textContent = state.gameplay.health + " / " + config.combat.galactusMaxHealth;
    state.hud.statusValue.textContent = state.gameplay.phase === "victory" ? "win" : "playing";
}

/*
 * Creates the main HUD panel root with shared panel styling.
 */
function createPanelRoot() {
    var root = document.createElement("div");
    applyPanelBaseStyles(root);
    root.style.display = "flex";
    root.style.flexDirection = "column";
    root.style.gap = "8px";
    return root;
}

/*
 * Creates one labeled HUD row with a shared visual style.
 * The provided value element is styled in-place so callers
 * can update text content efficiently per frame.
 */
function createRow(labelText, valueElement, valueColor, valueLetterSpacing) {
    var row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "baseline";
    row.style.gap = "6px";
    row.style.fontFamily = "monospace";
    row.style.fontSize = "13px";
    row.style.lineHeight = "1";

    var label = createRowLabel(labelText);
    styleValueElement(valueElement, valueColor, valueLetterSpacing);

    row.appendChild(label);
    row.appendChild(valueElement);
    return row;
}

/*
 * Builds the row label element used by health and status lines.
 */
function createRowLabel(labelText) {
    var label = document.createElement("span");
    label.textContent = labelText;
    label.style.color = "rgba(200, 170, 255, 0.7)";
    label.style.textTransform = "uppercase";
    label.style.fontSize = "10px";
    label.style.letterSpacing = "0.5px";
    label.style.alignSelf = "center";
    return label;
}

/*
 * Applies consistent visual treatment to row value elements.
 */
function styleValueElement(valueElement, color, letterSpacing) {
    valueElement.style.color = color;
    valueElement.style.fontWeight = "bold";
    valueElement.style.letterSpacing = letterSpacing;
}

/*
 * Creates the controls legend panel shown below the HUD.
 * The panel is static instructional content and is built
 * once during initialization.
 */
function createLegend() {
    if (state.hud.legendRoot) return;

    state.hud.legendRoot = createLegendRoot();

    state.hud.legendRoot.appendChild(createLegendTitle());
    state.hud.legendRoot.appendChild(createLegendBody());

    document.body.appendChild(state.hud.legendRoot);
}

/*
 * Creates the legend root panel with base style inheritance.
 */
function createLegendRoot() {
    var root = document.createElement("div");
    applyPanelBaseStyles(root);
    root.style.fontSize = "11px";
    root.style.lineHeight = "1.4";
    return root;
}

/*
 * Creates the legend heading element.
 */
function createLegendTitle() {
    var title = document.createElement("div");
    title.textContent = "CONTROLS";
    title.style.color = "#a97fda";
    title.style.fontWeight = "900";
    title.style.fontSize = "12px";
    title.style.letterSpacing = "0.7px";
    title.style.marginBottom = "4px";
    return title;
}

/*
 * Creates the legend multi-line control hint block.
 */
function createLegendBody() {
    var body = document.createElement("div");
    body.style.whiteSpace = "pre-line";
    body.textContent =
        "Arrow Up/Down: Forward/Back\n" +
        "Arrow Left/Right: Turn\n" +
        "Q/W: Up/Down\n" +
        "Space: Fire Rockets\n" +
        "Tab: Restart (after win)";
    return body;
}

/*
 * Applies shared panel chrome used by HUD and legend.
 */
function applyPanelBaseStyles(element) {
    element.style.position = "fixed";
    element.style.left = config.ui.left + "px";
    element.style.width = config.ui.panelWidth + "px";
    element.style.boxSizing = "border-box";
    element.style.padding = "8px 12px";
    element.style.color = "#eeddff";
    element.style.background = "rgba(8, 4, 20, 0.78)";
    element.style.border = "1px solid rgba(200, 170, 255, 0.25)";
    element.style.borderRadius = "10px";
    element.style.backdropFilter = "blur(3px)";
    element.style.webkitBackdropFilter = "blur(3px)";
    element.style.fontFamily = "monospace";
    element.style.zIndex = "1000";
    element.style.pointerEvents = "none";
}
