# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Frontend (run from repo root):
- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview built bundle
- `npm run check` — `svelte-check` against `tsconfig.app.json` + `tsc -p tsconfig.node.json` (type check only; there is no test runner or linter configured)

Backend (run from `server/`):
- `pip install -r requirements.txt`
- `uvicorn app:app --reload --host 0.0.0.0 --port 8000` (or `python app.py`, which honors `$PORT`)
- Docs at `http://localhost:8000/docs`, health at `/health`

Frontend ↔ backend: the API base URL is hardcoded in [src/app_constants.ts](src/app_constants.ts) (`app_server_address`). Toggle the commented line to switch between `http://localhost:8000/` and the deployed Render URL. The Render backend is deployed from the root [Dockerfile](Dockerfile) / [render.yaml](render.yaml) and needs `OPENAI_API_KEY` set in its environment.

## Architecture

Two independently-deployed halves:
- Frontend is a **Svelte 5 + Vite + TypeScript** SPA deployed to GitHub Pages via [.github/workflows/main.yml](.github/workflows/main.yml). Because of Pages, [vite.config.ts](vite.config.ts) sets `base: "/JT_dashboard/"` — don't remove this; all asset paths depend on it.
- Backend is a **FastAPI** service deployed to Render (Docker). [server/app.py](server/app.py) wires four routers under `/api/{mental-model,sunburst,linking,flow}` with permissive CORS.

### Frontend routing
[src/App.svelte](src/App.svelte) uses `svelte-spa-router` (hash routing — required for GH Pages) with five views: Home, Flow, Linking, MentalModel, Sunburst. Each view lives in its own directory under [src/lib/](src/lib/) and is self-contained (own `constants.ts`, `renderers/`, `types/`). Enter/Escape toggle fullscreen globally.

### Backend routers and data
Each router in [server/routers/](server/routers/) reads static JSON from a sibling data directory resolved via `server_path = os.path.join(dirname, "..", filename)`:
- `mental_model.py` → `server/mm_data/` (codebook `all_codes.json`, per-participant MM files under `MMs/`, exhibition data)
- `sunburst.py` → `server/sunburst_data/sunburst/` (one JSON per chart)
- `linking.py` → `server/linking_data/` (scenarios + code co-occurrence)
- `flow.py` → `server/flow_data/{metadata,chunked_summary}/`, with helpers in [server/routers/FlowDBUtils/](server/routers/FlowDBUtils/)
- `AutoGenUtils/query.py` wraps `autogen-agentchat` / `openai` for LLM calls (requires `OPENAI_API_KEY`)

**Important:** these JSON data files are `.gitignore`d (`server/{flow_data,mm_data,linking_data,sunburst_data}/**/*.json`). The directories must exist locally with data for the server to return anything meaningful — don't assume endpoints work from a fresh clone.

### Visualization conventions
- Heavy use of `d3` for SVG rendering only; DOM/state is Svelte-native. The pattern (documented in [src/lib/Sunburst/REFACTORING_SUMMARY.md](src/lib/Sunburst/REFACTORING_SUMMARY.md)) is: D3 computes arcs/layouts, Svelte `{#each}` blocks render, and tooltips/legends are Svelte reactive state — not `d3.select().append()`.
- Flow view uses a module-level `$state` store in [src/lib/Flow/flow_store.svelte.ts](src/lib/Flow/flow_store.svelte.ts) (Svelte 5 runes) with `flowActions.setInterviewFlowRef` so the parent can trigger child re-renders imperatively.
- Tailwind v4 via `@tailwindcss/vite` + `@tailwindcss/postcss`; theme tokens live in [src/theme_colors.css](src/theme_colors.css) and are referenced as CSS variables (`var(--brand-primary)`, `var(--sc-title)`, etc.). Components use `@reference "tailwindcss"` inside `<style lang="postcss">` blocks.

### Secondary entry points
- [dragMM/](dragMM/) — standalone HTML prototype for a drag-and-drop mental-model interface (not part of the Vite build).
- [sunburst_paper/](sunburst_paper/) — separate sibling Vite project (its own `package.json`, `node_modules`, `dist`). Treat as a distinct app; commands here do not affect the main frontend.
