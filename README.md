# Jay's Audio Tools

A web-based suite of audio utilities and tools for musicians, producers, and audio enthusiasts. Built with Node.js and modern web audio technologies.

**Note: This project is in early development. Features and APIs may change frequently.**

## Project Overview

Jay's Audio Tools is a collection of web-based audio utilities including:
- Tone monitoring and analysis
- MIDI device integration
- Audio plugin hosting
- Real-time audio processing tools

The project uses a Node.js/Express backend to serve modular audio tools as client-side plugins, making them accessible through any modern web browser.

## Installation

1. Ensure you have [Node.js](https://nodejs.org/) (v16 or higher) installed
2. Clone this repository:
   ```bash
   git clone https://github.com/stratemeyerjw/jays-audio-tools.git
   cd jays-audio-tools
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode
For development with auto-reload on file changes:
```bash
npm run dev
```

### Production Mode
1. Build the project:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000` by default.

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


