# Repository Guidelines

## Session board

If a shared session board (a `BOARD.md` next to the repositories you work on)
exists, read it before starting work, and when you stop, append an entry above
its END sentinel using `edit` (never `write`, which replaces the whole file).
It is a shared live log, not a lock, and the repos remain the source of truth.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Coding Style

Use TypeScript with functional React components where the stack is React. Avoid
`any`; type component props, API responses, and environment boundaries
explicitly. Keep page-specific loading, form, and error state local; shared
state belongs in dedicated auth/context modules. Use the project's existing
styling approach (e.g., CSS Modules and design tokens) instead of inventing new
conventions. Match the surrounding files' casing, quotes, and structure.

Keep comments to a minimum: write them only when they clarify something
ambiguous or that is not clear from the code itself, not to restate it.

## Testing

Write tests near the code they cover. Prioritize route smoke tests, API-client
behavior, loading states, empty states, errors, and responsive rendering for
user-facing changes. Run the project's checks (typecheck, lint, tests) before
declaring work done.

## Committing

Keep commits short, descriptive, and focused: avoid mixing broad refactors with
feature work. Pull requests should include a concise summary, the verification
commands run, linked issues when relevant, and screenshots or recordings for
visual changes.

## Security

Never commit secrets or keys. Keep network and service-access logic in a
dedicated API layer; hidden UI is not security. Build-time environment
variables are public by design, so never put secrets in them. Consult the
committed `.example` env files for config shape; treat real `.env*` and
`.dev.vars*` files as off-limits for reading or printing.

## Remaining Work

Track open items in `checklist.md` when one exists; tick items off as they land
and add new ones as they come up.
