# NOTES — PUT /users/:id

## Plan
Plan approved before any code was written:
1. `db/store.js`: add `updateUser(id, { name, email })`. It returns the updated user, or `undefined` for an unknown id, the same contract as `getUserById`.
2. `routes/users.js`: add `PUT /:id`. Look the user up first and return 404 `{ "error": "User not found" }` (the same body as `GET /users/:id`). Then validate the body and return 400 if `name` or `email` is missing or invalid. On success, return 200 with the updated user.
3. Read only `name` and `email` from the body, so a client can't overwrite `id`.

One edit before approving: validation was made stricter than `POST`'s "is it truthy" check. Both fields must be strings, and blank names are rejected. The README asks for missing *or invalid* input to be rejected.

Order of checks: 404 comes before 400. If the user doesn't exist, the body doesn't matter. That order also matches how REST APIs usually behave.

## Model
Claude Opus 5.5. The feature is small, but the work also involved reviewing the change and catching validation edge cases, which is where a stronger model pays off. Sonnet would have been enough to write the code itself.

## Commits
1. `Add updateUser helper to the in-memory store`: data layer only.
2. `Add PUT /users/:id endpoint to update a user`: the route. This is the commit that turns the tests green.
3. `Reject blank-local-part emails like " @ " in PUT /users/:id`: the fix found in self-review.
4. This `NOTES.md`.

Each commit is one logical step, so the history shows the order the feature was built in. The review fix stays visible as its own commit instead of being squashed into the route.

## Review
Before pushing, I sent the endpoint 11 edge-case requests that the provided tests don't cover. These were all fine:
- no body or `{}`
- a number instead of a string
- a blank name
- an email without `@`
- a non-numeric id
- an unknown id combined with a bad body
- a body that tries to change `id`

**Real bug caught:** `" @ "` passed validation and saved `"@"` as the email, because `includes("@")` was checked before trimming. It's fixed in commit 3: values are trimmed first, then the email must match `something@something`.

Also noticed:
- The provided 404 test was green *before* the endpoint existed, because Express answers unknown routes with 404 anyway. A passing test isn't proof that the feature works.
- Malformed JSON returns Express's default 400 and logs a stack trace. This affects every route, including `POST`, so it's out of scope for this PR.
