# Jay's Audio Tools

A small Node.js + Express-based collection of utilities and lightweight servers for audio tooling and client-side plugins. This repository is a work-in-progress intended to host small web-based audio utilities (tone monitor, MIDI and audio plugins) and a server that can build and serve client applications and plugin code.

This README has been updated to reflect recent changes in the repo (new client templates and partials, an implemented partials refresh, and a `dev` nodemon script).

## What’s in this repo

- `index.mjs` — project entry point; loads configuration and starts the server.
- `package.json` — node metadata and scripts (notably `build`, `dev`, and `start`).
- `build.mjs` — helper that constructs the public directory structure using `treeMap.json` and copies client dependencies.
- `classes/` — server and helper modules (examples: `audio-tool-server.mjs`, `express-server.mjs`, `client-dep-handler.mjs`, `filesystem-handler.mjs`).
- `client-templates/` — Handlebars/Handlebars-like templates used to generate or serve client-side HTML (e.g. `main-layout.hbs`).
- `client-partials/` — source partial templates (copied into `./public/partials` by the partials refresh step).
- `client-css/` — client CSS files used by templates.
- `public/` — generated static client files served to browsers (HTML, JS, CSS, partials).
- `client-deps.json` — client dependency manifest (objects with `{ src, dest }` used by `classes/client-dep-handler.mjs`).

## Notable changes to be aware of

- `classes/client-dep-handler.mjs` now implements `RefreshPartials()` to copy `.hbs` files from `./client-partials` into `./public/partials`.
- A new layout template `client-templates/main-layout.hbs` provides a responsive two-column layout with a collapsible menu drawer.
- `package.json` contains a `dev` script (uses `nodemon`) and a `build` script. See "Development / run" below for details.

## Development / run instructions

1. Install dependencies:

```bash
npm install
```

2. Build the public structure and copy dependencies (optional step; build script runs `build.mjs`):

```bash
npm run build
```

3. Start in development mode (auto-reload with nodemon):

```bash
npm run dev
```

The `dev` script in `package.json` is currently:

```json
"dev": "nodemon --watch classes --watch client-css --watch partials --watch client-deps.json --watch index.html --watch treeMap.json index.mjs"
```

Note: the `dev` command watches several paths and restarts `index.mjs` when changes are detected. If you prefer watching `client-partials` instead of `partials`, update the `dev` script accordingly in `package.json`.

Important: `public/` is a generated output directory (build artifact). Do not edit files directly under `public/`. Make changes in the source directories (`client-templates/`, `client-partials/`, `client-css/`, etc.) and then run the build or `Refresh`/`RefreshPartials()` steps to regenerate `public/`.

To start the server without auto-reload:

```bash
npm start
```

## Project structure (important files)

- `classes/client-dep-handler.mjs` — reads `client-deps.json`, copies dependency files into `./public` and injects `<script>` / `<link>` tags into `./public/index.html`. It also provides `RefreshPartials()` which copies `.hbs` partials from `./client-partials` to `./public/partials`.
- `build.mjs` — build helper that uses `treeMap.json` to generate a public directory layout and copies required files.
- `client-templates/main-layout.hbs` — the new two-column layout template (menu drawer + main content).
- `client-partials/` — source for partial templates; after running the build or `RefreshPartials()` they appear in `./public/partials`.

## Notes and recommended follow-ups

- There's a small naming mismatch to be aware of: the `dev` script currently watches a `partials` directory, but the repository uses `client-partials` as the source directory for partial templates. You can either:
	1. Update `package.json` to watch `client-partials` instead of `partials`, or
	2. Rename `client-partials` → `partials` if you prefer the shorter name.

- If you want, I can update the `dev` script in `package.json` to watch `client-partials` (recommended), or update `classes/client-dep-handler.mjs` to use a configurable partials path. Tell me which you prefer and I will apply the patch.

## Next steps I can take for you

- Update `package.json` `dev` script to watch `client-partials` instead of `partials`.
- Make the partials source path configurable via an environment variable and use it in `client-dep-handler.mjs` and `package.json`.
- Add a small demo page under `public/demo.html` and wire it to the `main-layout.hbs` template.

---

If you'd like me to apply any of the recommended changes (fix the dev watch path, make partials path configurable, or add a demo page), pick one and I'll implement it.


