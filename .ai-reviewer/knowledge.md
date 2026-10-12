# changa reviewer notes

## Architecture

Everyday is a dependency-free browser to-do app using native ES modules, served by a small Node.js HTTP server. `app.js` owns UI state and event wiring; `tasks.js` contains pure task operations, `storage.js` handles browser persistence, and `dom.js` renders task elements. The server exposes an explicit allowlist of HTML, CSS, and application module files.

## Conventions

- Use JavaScript modules and two-space indentation; `package.json` sets `"type": "module"` and `CONTRIBUTING.md` requires two spaces.
- Keep responsibilities separated: task mutations belong in `tasks.js`, persistence in `storage.js`, rendering in `dom.js`, and orchestration/UI state in `app.js`.
- Task operations are immutable and return new arrays/objects: `tasks.js` uses spread in `addTask` and `toggleTask`, and `filter` in `deleteTask`/`filterTasks`.
- Normalize and validate task input in `tasks.js`: `addTask` trims input, limits titles to 200 characters, and rejects empty titles. `app.js` also prevents whitespace-only form submission and restores focus.
- Render user-controlled task text with `textContent`, not HTML interpolation. This is used for titles and empty-state text in `dom.js` and `app.js`; delete labels are also generated through DOM APIs.
- Preserve accessibility behavior: every checkbox has an associated label (`dom.js`), delete controls have descriptive `aria-label`s, filters update `aria-pressed`, and controls are keyboard-focusable.
- Use event delegation for the dynamic task list. `app.js` listens on `list` for checkbox changes and delete-button clicks rather than attaching handlers per rendered row.
- Update state through `update()` in `app.js`, which persists via `saveTasks`, displays storage failure warnings, and re-renders.
- The project intentionally has no dependencies or install step. Run with Node.js 22+ and `npm start`; `npm run build` syntax-checks every root-level `.js` file, including utility/placeholder files.
- New browser-served modules must be added to `server.js`’s `allowed` map; arbitrary filesystem paths are not served.

## Intentional non-standard choices

- `server.js` binds only to `127.0.0.1` and uses a fixed allowlist rather than a general static-file server; this is deliberate for the local development server.
- `app.js` keeps the current filter in UI state and resets it to `all` after adding a task, while toggle/delete operations preserve the selected filter.
- `broken-counter.js`, `broken-greeting.js`, `fortune-cookie.js`, and `rough-*` files are standalone examples/placeholders. They are still syntax-checked by the build script but are not part of the browser application.

## Watch out for

- Do not introduce `innerHTML` or unsafe HTML interpolation for task/user text; preserve the `textContent`/DOM-construction approach.
- Do not mutate the existing task array or task objects in place; persistence and rendering assume operations return updated values.
- Keep storage failures non-fatal: `app.js` must continue rendering and show a warning when loading or saving fails.
- When adding or renaming client modules, update the `server.js` allowlist or the browser will receive a 404.
- Preserve the 200-character limit, UUID IDs, filter semantics (`all`, `active`, `completed`), and focus restoration after task actions.