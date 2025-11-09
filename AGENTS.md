# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains each MCP domain (`gsc/`, `router/`, `backends/`, `ads/`, `analytics/`, `http-server/`, `shared/`); place new agents in the relevant folder and keep shared utilities in `src/shared`.
- `tests/` holds Jest specs (`*.test.ts`) while `dist/` is the ES2020 output used by `start:*` scripts.
- Keep operational info in `docs/`, `config/`, and `scripts/`; edit these only when your change affects docs or automation.

## Build, Test, and Development Commands
- `npm run build` compiles `src/` into `dist/`; `npm run lint` runs `tsc --noEmit`.
- `npm run dev:*` (gsc/router with `:http` or `:stdio`) runs ts-node servers with the right `MCP_TRANSPORT`.
- `npm run start:*` executes the compiled servers; adjust `MCP_TRANSPORT`, `ROUTER_PORT`, or `GOOGLE_BACKEND_PORT` as required.
- `npm run setup:auth` refreshes OAuth fixtures; `npm test` (plus `test:gsc`, `test:ads`) runs Jest; `docker:build/run` mirror container deployments.

## Documentation & Decision Sources
- `CLAUDE.md` is the quick-reference guide for priorities and port rules, and points to `.claude/PORT_MANAGEMENT.md`.
- `PROJECT-BLUEPRINT.md` is the authoritative manual—use Part 2 for architecture, Part 9 for platform decisions, and Part 8 for deployment.
- `WORKFLOW.md` details how Claude, sub-agents, and Linear coordinate work; follow it when starting sessions or syncing docs.

## Coding Style & Naming Conventions
- This is ESM TypeScript (`"type":"module"`); keep `import/export`, camelCase functions, PascalCase classes, and descriptive filenames such as `router/server.ts`.
- Honor the strict flags in `tsconfig.json` (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, etc.) and drop unused exports/parameters.
- Place domain helpers inside their folder and promote only widely reused utilities to `src/shared`.

## Testing Guidelines
- Jest runs via `npm test`; add `tests/*.test.ts` files and keep shared fixtures under `tests/`.
- Run `npm run test:gsc` or `npm run test:ads` before touching those domains and append `-- --coverage` when documenting coverage gaps.

## Commit & Pull Request Guidelines
- Use conventional commits (`feat:`, `fix:`, `docs:`).
- PRs should explain the work, list related issues, and summarize manual checks (`npm run lint`, `npm test`, OAuth flows); include screenshots only for UI adjustments.

## Security & Configuration Tips
- Keep secrets outside Git, hydrate them through `.env` or the helpers in `config/`, and rerun `npm run setup:auth` when credentials rotate.
- Ports are locked: Next.js frontend on 3000, MCP HTTP server on 3001, Google backend on 3100; consult `.claude/PORT_MANAGEMENT.md`, `restart-dev-servers.sh`, and `check-services.sh` when you hit conflicts.
- Prefer `MCP_TRANSPORT=stdio` for local runs and document any new transports or port overrides you add.
