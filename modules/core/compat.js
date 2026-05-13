import state from "../state.js";

/*
 * Applies cross-version compatibility aliases for Three.js APIs.
 * The shim only fills missing members and never overwrites native
 * behavior in the currently loaded library version.
 */
export function applyCompatibilityShims() {
    if (state.shimsApplied) return;

    if (THREE && THREE.Quaternion && THREE.Quaternion.prototype) {
        var quatProto = THREE.Quaternion.prototype;

        if (!quatProto.inverse && quatProto.invert) {
            quatProto.inverse = function() {
                return this.invert();
            };
        }

        if (!quatProto.invert && quatProto.inverse) {
            quatProto.invert = function() {
                return this.inverse();
            };
        }
    }

    if (THREE && THREE.BufferGeometry && THREE.BufferGeometry.prototype) {
        var geometryProto = THREE.BufferGeometry.prototype;

        if (!geometryProto.addAttribute && geometryProto.setAttribute) {
            geometryProto.addAttribute = function(name, attribute) {
                return this.setAttribute(name, attribute);
            };
        }

        if (!geometryProto.setAttribute && geometryProto.addAttribute) {
            geometryProto.setAttribute = function(name, attribute) {
                return this.addAttribute(name, attribute);
            };
        }
    }

    if (THREE && THREE.FileLoader) {
        THREE.XHRLoader = THREE.FileLoader;
    }

    if (THREE && THREE.Loader && THREE.DefaultLoadingManager) {
        if (!THREE.Loader.Handlers) {
            THREE.Loader.Handlers = {};
        }

        THREE.Loader.Handlers.get = function(file) {
            if (THREE.DefaultLoadingManager.getHandler) {
                return THREE.DefaultLoadingManager.getHandler(file) || null;
            }
            return null;
        };

        THREE.Loader.Handlers.add = function(regex, loader) {
            if (THREE.DefaultLoadingManager.addHandler) {
                THREE.DefaultLoadingManager.addHandler(regex, loader);
            }
        };
    }

    if (THREE && THREE.Material && THREE.Material.prototype) {
        defineShadingAlias(THREE.MeshPhongMaterial && THREE.MeshPhongMaterial.prototype);
        defineShadingAlias(THREE.MeshLambertMaterial && THREE.MeshLambertMaterial.prototype);
        defineShadingAlias(THREE.MeshStandardMaterial && THREE.MeshStandardMaterial.prototype);
    }

    state.shimsApplied = true;
}

/*
 * Adds a legacy shading property bridge to a material prototype.
 * This allows older code paths to use `material.shading` while
 * transparently mapping onto modern flatShading behavior.
 */
function defineShadingAlias(proto) {
    if (!proto) return;
    if (Object.prototype.hasOwnProperty.call(proto, "shading")) return;

    Object.defineProperty(proto, "shading", {
        get: function() {
            return this.flatShading ? THREE.FlatShading : THREE.SmoothShading;
        },
        set: function(value) {
            this.flatShading = (value === THREE.FlatShading || value === 1);
        }
    });
}
