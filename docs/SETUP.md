# Setup

## Prerequisites

- A modern desktop browser (Chrome, Edge, Firefox, Safari).
- A local static file server (required for model/texture loading).

## Local Development

From the project root, serve files over HTTP.

Example with Python:

```bash
python -m http.server 8080
```

Then open:

http://localhost:8080

## Recommended VS Code Workflow

- Open the workspace folder.
- Start a static server (or use Live Server extension).
- Open browser dev tools to monitor runtime errors.

## Quick Validation Checklist

- Scene loads with Sun, Earth, Moon.
- Ship appears and responds to controls.
- Galactus model and texture load successfully.
- HUD appears at top-left.
- Space fires projectiles.

## Common Setup Issues

- Blank page or missing assets: verify HTTP serving (not file://).
- Model load errors: confirm models directory and filenames.
- Shader errors: confirm shader script tags exist in index.html.
