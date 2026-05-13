# Assets

This project uses static assets from the models directory.

## Active Assets

- models/ufo.ply: Player ship model.
- models/galactus.obj: Boss mesh.
- models/galactus.mtl: Boss material definition.
- models/galactus.jpg: Boss diffuse texture.

## Loader Expectations

- PLYLoader loads ufo.ply.
- MTLLoader + OBJLoader load galactus.mtl and galactus.obj.
- The MTL map_Kd entry must match galactus.jpg.

## Naming Conventions

- Use lowercase, descriptive filenames.
- Keep asset names domain-oriented (for example: galactus.obj).
- Avoid legacy or generic source-export names in production.

## Replacing Assets

1. Add new files under models.
2. Update filenames in modules/config.js.
3. If using OBJ/MTL, ensure mtl references correct texture names.
4. Validate loading paths in browser console.

## Performance Notes

- Prefer optimized meshes where possible.
- Keep texture dimensions reasonable for web delivery.
- Remove unused assets to reduce repository weight.
