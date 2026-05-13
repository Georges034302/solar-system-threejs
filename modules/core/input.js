(function() {
    window.SolarApp = window.SolarApp || {};
    window.SolarApp.core = window.SolarApp.core || {};

    var state = window.SolarApp.state;

    /*
     * Converts key events into normalized gameplay input state.
     * Handles movement, fire, and restart actions while preventing
     * default browser behavior for control keys.
     */
    function onKeyChange(event, isPressed) {
        if (event.code === "ArrowUp") state.input.forward = isPressed;
        if (event.code === "ArrowDown") state.input.backward = isPressed;
        if (event.code === "ArrowLeft") state.input.left = isPressed;
        if (event.code === "ArrowRight") state.input.right = isPressed;
        if (event.code === "KeyQ") state.input.rise = isPressed;
        if (event.code === "KeyW") state.input.descend = isPressed;

        if (
            event.code === "ArrowUp" ||
            event.code === "ArrowDown" ||
            event.code === "ArrowLeft" ||
            event.code === "ArrowRight"
        ) {
            event.preventDefault();
        }

        if (event.code === "Space") {
            state.input.fire = isPressed;
            event.preventDefault();
        }

        if (event.code === "Tab") {
            event.preventDefault();
            if (isPressed && window.SolarApp.systems && window.SolarApp.systems.combat) {
                window.SolarApp.systems.combat.requestRestart();
            }
        }
    }

    /*
     * Registers keyboard listeners once for the runtime session.
     * Input is funneled through onKeyChange so keydown/keyup
     * transitions produce consistent per-frame state.
     */
    function setupInput() {
        document.addEventListener("keydown", function(event) {
            onKeyChange(event, true);
        });

        document.addEventListener("keyup", function(event) {
            onKeyChange(event, false);
        });
    }

    window.SolarApp.core.input = {
        setupInput: setupInput
    };
})();