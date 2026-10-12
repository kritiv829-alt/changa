# Verification checklist

- Storage exports implemented and covered by automated tests.
- Malformed CSS fragment removed; visual checks remain below.
- Invalid request URLs return HTTP 400 in the live server test.
- Run `npm test` for storage and HTTP regression checks.
- Run `npm run build` to check JavaScript syntax.
- Start the app with `npm start` and open http://localhost:3000.
- Add, complete, filter, and delete tasks.
- Refresh and confirm saved tasks are restored.
- Verify invalid saved data and unavailable browser storage do not crash the app.
- Check keyboard controls and the layout on a narrow screen.

See code-review.md for the current findings and completed checks.
