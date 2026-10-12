# changa reviewer notes

## Architecture

Everyday is a dependency-free browser to-do app built with HTML, CSS, and JavaScript ES modules. `app.js` coordinates UI state and events, while `tasks.js` contains pure task operations, `storage.js` handles localStorage persistence and validation, and `dom.js` renders task rows. `server.js` is a small Node.js static server; tests use Node’s built-in test runner and cover server behavior and storage handling.

## Conventions

- Keep the project dependency-free and use native ES modules (`package.json`, `app.js`).
- Use two-space indentation and Node.js 22+ (`CONTRIBUTING.md`, `package.json`).
- Keep responsibilities separated: task transformations belong in `tasks.js`, persistence in `storage.js`, and DOM rendering in `dom.js` (`CONTRIBUTING.md`).
- Task operations are immutable: `addTask`, `toggleTask`, and `deleteTask` return new arrays/objects rather than mutating input (`tasks.js`).
- Task titles are trimmed and capped at 200 characters when created; task IDs use `crypto.randomUUID()` (`tasks.js`).
- Treat localStorage as untrusted input. `loadTasks()` validates object shape, IDs, duplicate IDs, title length/content, and completion type, recovering valid entries while reporting an error (`storage.js`).
- Invalid saved data is not rewritten during loading; this behavior is explicitly tested (`test/storage.test.js`).
- Render user-controlled task text with `textContent`, including labels and warning/summary content; do not introduce `innerHTML` for task data (`dom.js`, `app.js`, `CONTRIBUTING.md`).
- Preserve keyboard/accessibility behavior: labels are associated with checkbox IDs, delete buttons have task-specific `aria-label`s, filters use `aria-pressed`, and focus is restored after mutations (`dom.js`, `app.js`).
- Run `npm test` for automated tests and `npm run build` for syntax checks; the build checks every root-level `.js` file (`README.md`, `package.json`).

## Intentional non-standard choices

- The app intentionally remains usable when storage is unavailable or corrupted. Load/save failures return status values and cause a visible warning rather than throwing (`storage.js`, `app.js`).
- The server intentionally serves only an explicit asset allowlist, binds to `127.0.0.1`, disables caching, and supports only `GET`/`HEAD` (`server.js`, `test/server.test.js`).
- Loading malformed storage recovers valid tasks without replacing the original stored value (`storage.js`, `test/storage.test.js`).

## Watch out for

- Flag any rendering of task titles or storage-derived text through `innerHTML`; it would violate the project’s XSS-safe rendering convention (`dom.js`, `CONTRIBUTING.md`).
- Flag direct mutation of the `tasks` array or task objects, bypassing the pure operations in `tasks.js`.
- Flag persistence changes that stop catching localStorage access/quota errors or overwrite malformed data during `loadTasks()`.
- Flag task creation that permits blank titles, exceeds 200 characters, or generates non-unique/missing IDs.
- Flag UI changes that omit focus restoration, checkbox-label association, filter `aria-pressed` state, or accessible delete labels.
- Flag server changes that expose arbitrary filesystem paths, accept unsupported methods, bind beyond localhost without an explicit requirement, or break malformed-URL handling.