/*
 * Loads a PLY model and forwards callbacks from Three.js loader.
 * This wrapper centralizes loader construction so callers keep
 * system logic separate from raw asset plumbing.
 */
export function loadPly(url, onLoad, onError) {
    var loader = new THREE.PLYLoader();
    loader.load(url, onLoad, undefined, onError);
}

/*
 * Loads an OBJ model with its MTL materials from fallback base paths.
 * The function retries sequentially until one path succeeds,
 * then resolves through onLoad or reports final failure.
 */
export function loadObjWithMtl(basePaths, mtlFile, objFile, onLoad, onError) {
    /*
     * Attempts one candidate base path and recurses on failure.
     * Both MTL and OBJ stages are validated before success,
     * ensuring material binding is complete for the loaded mesh.
     */
    function tryPath(pathIndex) {
        if (pathIndex >= basePaths.length) {
            if (onError) onError(new Error("Failed to load OBJ/MTL from all base paths."));
            return;
        }

        var basePath = basePaths[pathIndex];
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath(basePath);

        mtlLoader.load(mtlFile, function(materials) {
            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath(basePath);
            objLoader.load(objFile, onLoad, undefined, function() {
                tryPath(pathIndex + 1);
            });
        }, undefined, function() {
            tryPath(pathIndex + 1);
        });
    }

    tryPath(0);
}
