# Deployment

## Production URL

https://georges034302.github.io/solar-system-threejs/

## GitHub Pages

This project is deployed as a static site via GitHub Pages.

## Deployment Checklist

1. Verify index.html references correct script and asset paths.
2. Verify modules/config.js points to valid model filenames.
3. Confirm docs and README are up to date.
4. Validate project locally over HTTP.
5. Push changes to the publishing branch.

## Post-Deploy Validation

- App loads without console errors.
- Models and textures render correctly.
- Controls and HUD function as expected.
- Combat and restart flow work end-to-end.

## Rollback Strategy

- Revert to previous known-good commit.
- Redeploy branch.
- Re-validate runtime and asset loading.
