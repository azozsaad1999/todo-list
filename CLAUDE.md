# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack Arabic-language To-Do List app with:
- **Frontend**: Single-file vanilla JS/HTML ([todo-list/index.html](todo-list/index.html)) — RTL layout, Tajawal font, dark theme
- **Backend**: Node.js HTTP server ([todo-list/server.js](todo-list/server.js)) using the native `http` module (no Express) connected to MongoDB Atlas
- **Database**: MongoDB Atlas — collection `tasks` inside database `todo-app`

The `todo-list/` directory is itself a nested git repository (deployed separately to Render).

## Running the Server

```bash
cd todo-list
npm install
MONGODB_URI=<your-atlas-uri> node server.js
```

The server starts on port 3000 by default (`process.env.PORT` overrides this — Render sets it automatically).

Open [todo-list/index.html](todo-list/index.html) directly in a browser. The frontend hardcodes `http://localhost:3000` as the API base.

## API

All routes are implemented manually in [todo-list/server.js](todo-list/server.js) — no router library:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | Return all tasks |
| POST | `/tasks` | Create a task `{ text }` |
| PUT | `/tasks/:id` | Toggle `done` on a task |
| DELETE | `/tasks/:id` | Delete a task |

Task documents use MongoDB's `_id` (ObjectId). The frontend renders with `task._id`; note the inconsistency with the legacy `tasks.json` which used a numeric `id` field.

## Deployment

The backend is hosted on Render. `MONGODB_URI` must be set as an environment variable there. CORS is open (`*`) — acceptable for a personal project.

## Known Issues / Watch-outs

- `tasks.json` is a legacy artifact (was the original flat-file store before MongoDB); the current server ignores it.
- The `package.json` lists `mangodb` (a typo/dummy package) alongside the real `mongodb` driver — do not remove `mongodb`.
- No test suite exists (`npm test` exits with an error by design).