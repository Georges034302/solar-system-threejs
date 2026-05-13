# Changelog

All notable changes to this project should be documented in this file.

## [2.0.0] - 2026-05-13

### Added

- ES module architecture with explicit import/export graph across all modules.
- Dedicated shader module (modules/shaders.js) for particle system vertex and fragment code.
- Professional multi-line function comments across all systems for improved readability.

### Changed

- Migrated entire runtime from IIFE + global namespace (window.SolarApp) to native ES modules.
- Refactored large module functions into smaller, focused helper functions with clear responsibilities.
- Removed inline shader tags from index.html; shaders now live in modules/shaders.js.
- Updated DOM references to use module imports instead of HTML script embed queries.
- Simplified index.html to a single ES module entry point.

### Improved

- Code modularity: each internal function has a single, well-defined concern
- Maintainability: professional comments explain intent and constraints
- Debugging: smaller functions with discrete scope boundaries
- Architecture clarity: explicit ES module dependency graph vs. implicit global state

### Removed

- Inline shader HTML script tags from index.html (moved to modules/shaders.js)
- Redundant inline shader comments (preserved in string literals)

## [1.0.0] - 2026-05-13

Initial production release.

### Added

- Modular runtime architecture under modules.
- New docs set under docs.
- Production asset naming (Galactus, UFO models).
- MIT License and comprehensive setup documentation.

### Changed

- Converted from lab-style loading to direct project runtime startup.
- Renamed legacy Librarian assets to Galactus production names.

### Removed

- Legacy lab loader (js/lab-loader.js) and progressive lab runtime scripts.

## Versioning Notes

Use semantic versioning where practical:

- MAJOR: incompatible architecture or API shifts
- MINOR: backward-compatible feature additions
- PATCH: fixes and non-breaking improvements
