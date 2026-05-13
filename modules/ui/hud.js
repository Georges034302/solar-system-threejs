(function() {
    window.SolarApp = window.SolarApp || {};
    window.SolarApp.ui = window.SolarApp.ui || {};

    var config = window.SolarApp.config;
    var state = window.SolarApp.state;

    /*
     * Creates the primary HUD container and value fields.
     * Initializes health/status rows once, then constructs
     * the controls legend and positions both panels.
     */
    function create() {
        if (state.hud.root) return;

        state.hud.root = document.createElement("div");
        state.hud.root.style.position = "fixed";
        state.hud.root.style.top = config.ui.top + "px";
        state.hud.root.style.left = config.ui.left + "px";
        state.hud.root.style.width = config.ui.panelWidth + "px";
        state.hud.root.style.boxSizing = "border-box";
        state.hud.root.style.display = "flex";
        state.hud.root.style.flexDirection = "column";
        state.hud.root.style.gap = "8px";
        state.hud.root.style.padding = "8px 12px";
        state.hud.root.style.borderRadius = "10px";
        state.hud.root.style.border = "1px solid rgba(200, 170, 255, 0.25)";
        state.hud.root.style.background = "rgba(8, 4, 20, 0.78)";
        state.hud.root.style.backdropFilter = "blur(3px)";
        state.hud.root.style.webkitBackdropFilter = "blur(3px)";
        state.hud.root.style.zIndex = "1000";
        state.hud.root.style.pointerEvents = "none";

        state.hud.healthValue = document.createElement("span");
        state.hud.statusValue = document.createElement("span");

        state.hud.root.appendChild(createRow("HEALTH", state.hud.healthValue, "#ff7eb6", "1.5px"));
        state.hud.root.appendChild(createRow("STATUS", state.hud.statusValue, "#eeddff", "0.5px"));
        document.body.appendChild(state.hud.root);

        createLegend();
        updatePosition();
    }

    /*
     * Builds one labeled HUD row with a shared visual style.
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

        var label = document.createElement("span");
        label.textContent = labelText;
        label.style.color = "rgba(200, 170, 255, 0.7)";
        label.style.textTransform = "uppercase";
        label.style.fontSize = "10px";
        label.style.letterSpacing = "0.5px";
        label.style.alignSelf = "center";

        valueElement.style.color = valueColor;
        valueElement.style.fontWeight = "bold";
        valueElement.style.letterSpacing = valueLetterSpacing;

        row.appendChild(label);
        row.appendChild(valueElement);
        return row;
    }

    /*
     * Creates the controls legend panel shown below the HUD.
     * The panel is static instructional content and is built
     * once during initialization.
     */
    function createLegend() {
        if (state.hud.legendRoot) return;

        state.hud.legendRoot = document.createElement("div");
        state.hud.legendRoot.style.position = "fixed";
        state.hud.legendRoot.style.left = config.ui.left + "px";
        state.hud.legendRoot.style.width = config.ui.panelWidth + "px";
        state.hud.legendRoot.style.boxSizing = "border-box";
        state.hud.legendRoot.style.padding = "8px 12px";
        state.hud.legendRoot.style.color = "#eeddff";
        state.hud.legendRoot.style.background = "rgba(8, 4, 20, 0.78)";
        state.hud.legendRoot.style.border = "1px solid rgba(200, 170, 255, 0.25)";
        state.hud.legendRoot.style.borderRadius = "10px";
        state.hud.legendRoot.style.backdropFilter = "blur(3px)";
        state.hud.legendRoot.style.webkitBackdropFilter = "blur(3px)";
        state.hud.legendRoot.style.fontFamily = "monospace";
        state.hud.legendRoot.style.fontSize = "11px";
        state.hud.legendRoot.style.lineHeight = "1.4";
        state.hud.legendRoot.style.zIndex = "1000";
        state.hud.legendRoot.style.pointerEvents = "none";

        var title = document.createElement("div");
        title.textContent = "CONTROLS";
        title.style.color = "#a97fda";
        title.style.fontWeight = "900";
        title.style.fontSize = "12px";
        title.style.letterSpacing = "0.7px";
        title.style.marginBottom = "4px";

        var body = document.createElement("div");
        body.style.whiteSpace = "pre-line";
        body.textContent =
            "Arrow Up/Down: Forward/Back\n" +
            "Arrow Left/Right: Turn\n" +
            "Q/W: Up/Down\n" +
            "Space: Fire Rockets\n" +
            "Tab: Restart (after win)";

        state.hud.legendRoot.appendChild(title);
        state.hud.legendRoot.appendChild(body);
        document.body.appendChild(state.hud.legendRoot);
    }

    /*
     * Recomputes HUD and legend placement.
     * Keeps legend stacked directly beneath the main panel
     * even when dimensions change.
     */
    function updatePosition() {
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
    function update() {
        if (!state.hud.healthValue || !state.hud.statusValue) return;

        updatePosition();
        state.hud.healthValue.textContent = state.gameplay.health + " / " + config.combat.galactusMaxHealth;
        state.hud.statusValue.textContent = state.gameplay.phase === "victory" ? "win" : "playing";
    }

    window.SolarApp.ui.hud = {
        create: create,
        update: update,
        updatePosition: updatePosition
    };
})();