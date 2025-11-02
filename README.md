## Jay's Audio Tools

A small Node.js + Express-based collection of utilities and lightweight servers for audio tooling and client-side plugins. This repository is a work-in-progress intended to host small web-based audio utilities (tone monitor, MIDI and audio plugins) and a server that can serve client applications and plugin code.

Key ideas:
- Minimal Express server that serves static client assets and provides helper endpoints.
- A small set of reusable client plugins and templates under `classes/` and `public/`.
- Easy configuration through environment variables or a `.env` file.

## What’s in this repo

- `index.mjs` — project entrypoint that loads configuration and starts the server.
- `package.json` — node metadata and dependencies (Express, fs-extra, dotenv, etc.).
- `classes/` — server and client modules used by the app (examples: `audio-tool-server.mjs`, `tone-monitor.mjs`, `express-server.mjs`).
- `public/` — static client files served to browsers (HTML, JS, plugins, CSS).
- `client-deps.json` — client dependency list referenced by server (used to generate client-side dependency bundles).

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (optional) or rely on defaults. Example `.env` values:

```
PUBLIC_DIR=./public
CLIENT_DEPS=./client-deps.json
PORT=3000
```

3. Start the server:

```bash
npm start
```

The server will start and serve the static client from the configured `PUBLIC_DIR` (default `./public`) on the configured `PORT` (default `3000`).

## Configuration

Configuration is loaded via `dotenv` (in `index.mjs`). Supported environment variables:

- `PUBLIC_DIR` — path to static files (default `./public`).
- `CLIENT_DEPS` — path to client dependency JSON (default `./client-deps.json`).
- `PORT` — port the server will listen on (default `3000`).

## Project structure (important files)

- `classes/audio-tool-server.mjs` — orchestrates server components.
- `classes/express-server.mjs` — Express server wrapper and routes.
- `classes/tone-monitor.mjs` — example audio tool (client plugin/server helper).

Explore the `classes/` directory for other small modules that implement client plugins and server helpers.

## Development notes

- The project uses ES modules (`type: "module"` in `package.json`).
- If you want automatic restarts during development, use `nodemon` (install globally or as a dev dependency) and run `nodemon --experimental-modules index.mjs` or configure a script.
- Client-side code lives under `public/` and some helper client modules are in `classes/` (there is a `public/classes/` copy for distribution).

## Next steps / TODOs

- Add a short contributing guide and code of conduct.
- Add tests for server endpoints and a simple smoke test for the client bundle.
- Add an example `.env.example` file and a small demo page showing the available audio tools.

## License

This project uses the ISC license as declared in `package.json`.

---

If you'd like, I can also:
- expand the README with examples for each plugin under `classes/`;
- add a `start:dev` script using `nodemon`;
- create a `.env.example` and an example demo page under `public/demo.html`.

