# AGENTS.md

## Purpose

This repo contains a personal website built in React + TypeScript.

The current site has three real product surfaces:
- a landing/about experience
- an API-backed posts section
- a photo gallery with an optional Firebase-backed admin flow

This guide should reflect the codebase as it exists today while still nudging it toward a cleaner, more maintainable shape.

---

## Working Context

- The application lives in `ThomWeb/`
- Run app commands from `ThomWeb/`, not the repo root
- The repo root currently only contains lightweight repo-level files such as this document and a `prettier` dependency
- Prefer incremental improvement over broad rewrites unless the task explicitly calls for restructuring

---

## Current Stack

- Create React App (`react-scripts`)
- React 18
- TypeScript with `strict: true`
- React Router v6
- Redux Toolkit for small pieces of global UI state
- CSS Modules for component/page styles
- Global CSS variables and theme tokens in `src/index.css`
- `fetch` for the posts API client
- Firebase Auth + Firestore for photo admin/listings

---

## What This App Currently Optimizes For

- Clear personal presentation over framework experimentation
- Simple route-based pages over heavy client architecture
- Fast iteration on UI/content pages
- Light shared state
- Low-dependency implementation unless a dependency clearly earns its keep

---

## Actual Project Structure

The current directory structure is:

- `ThomWeb/src/App.tsx`
  Defines the app shell and route table
- `ThomWeb/src/Components/`
  Reusable UI plus route-adjacent display components such as `Header`, `Footer`, `Project`, and `CollapsibleSection`
- `ThomWeb/src/Pages/`
  Route-level components such as `HomePage`, `Posts`, `Photos`, `PhotoAdmin`, and `ErrorPage`
- `ThomWeb/src/api/`
  Client-side data access modules for posts, photos, and Firebase setup
- `ThomWeb/src/Reducers/`
  Redux slices for theme and user context
- `ThomWeb/src/Hooks/`
  App-level hooks such as resize/mobile routing behavior
- `ThomWeb/src/Assets/`
  Shared copy and route constants
- `ThomWeb/public/`
  Static assets used by posts and resume links

Guidance:
- Follow the existing top-level naming and casing when making local edits
- Do not introduce a second parallel structure such as `components/`, `pages/`, or `router/` unless doing an intentional repo-wide migration
- Keep reusable UI separate from route components, but avoid forced abstraction

---

## Routing

Current behavior:
- Routes are defined centrally in `src/App.tsx`
- `Header` and `Footer` wrap the route content globally
- Mobile redirection logic currently lives in `useResizeListener`, which is invoked from `Header`

Rules:
- Add or update routes in `src/App.tsx` unless there is a deliberate decision to extract a router module
- Keep shared layout behavior near the app shell
- When changing navigation or responsive behavior, test both desktop and mobile flows
- Preserve safe fallback behavior for unknown routes

Note:
- The current mobile-home redirect pattern is part of the app behavior, even though it is structurally awkward. Do not break it casually.

---

## State Management

Use Redux only for cross-app UI state that is genuinely shared.

Current Redux use is appropriate for:
- theme mode
- mobile/desktop context
- last non-mobile route used for redirect behavior

Prefer local component state for:
- loading flags
- form state
- page-specific fetched data
- transient error messages

Rules:
- Do not move page-local async state into Redux without a clear reuse case
- Keep slices small and explicit
- Prefer derived state over duplicated state

---

## Data Fetching And APIs

This repo currently has two distinct data patterns:

- Posts data comes from `REACT_APP_API_URL` via `src/api/Posts/PostsRouter.tsx`
- Photo listings come either from Firestore or from a public JSON manifest via `src/api/Photos/PhotoListingsRouter.tsx`

Rules:
- Keep fetch logic inside `src/api/` modules, not inside presentation components
- Continue using `AbortController` for route/page fetches
- Validate or normalize remote data at the boundary before it reaches page components
- Keep loading, empty, and error states explicit
- Do not rely on hidden UI for security; Firebase/Firestore rules remain the real access control

Naming note:
- The existing `*Router.tsx` files are browser-side API clients, not actual routers
- Do not churn these names during small tasks, but prefer clearer names such as `*Client.ts` if a broader cleanup pass is requested

---

## TypeScript

- Keep `strict` mode clean
- Do not use `any`
- Type props, API payloads, and environment boundaries explicitly
- Extend `src/react-app-env.d.ts` when adding new environment variables
- Prefer straightforward interfaces and unions over clever generic abstractions
- Follow the surrounding file's naming style when editing older code

For new files:
- Prefer `.ts` for non-JSX modules
- Use `.tsx` only when rendering JSX

Do not do extension-renaming churn unless the task already touches the file for a real reason.

---

## React

- Functional components only
- Keep components focused and readable
- Avoid over-abstracting simple markup
- Use effects for real side effects, not for avoidable state synchronization
- Avoid premature memoization

Prefer:
- page components that orchestrate data + page layout
- smaller child components for repeated UI patterns
- simple event handlers and clear control flow

Avoid:
- large multi-purpose components that fetch, transform, and render too many concerns
- adding custom hooks for logic that is not reused

---

## Styling

The styling system is:
- CSS Modules for local styles
- global tokens in `src/index.css`
- theme switching via `body[data-theme="light" | "dark"]`

Rules:
- Reuse the CSS variables in `src/index.css` for spacing, widths, colors, borders, and transitions
- Keep styles co-located with the component/page they belong to
- Preserve visible focus states
- Prefer semantic class names over visual-only names
- Avoid deep selector nesting and hard-coded values when a token already exists

When touching theme-related UI:
- make sure both light and dark mode still read clearly
- keep transitions subtle
- do not hard-code colors that bypass the theme token system unless truly necessary

---

## Content And Assets

- Shared copy can live in `src/Assets/en.json` when reused across screens
- Route constants live in `src/Assets/Common.tsx`
- Post images and static documents currently come from `public/`
- `PUBLIC_URL` is part of the existing asset-loading pattern for resume/post assets

Rules:
- Keep copy concise and specific
- Prefer real project details over placeholder marketing language
- When adding static assets, use predictable names and keep them close to the surface that uses them

---

## Environment And Configuration

Current environment variables include:

- `REACT_APP_API_URL`
  Base URL for the posts API
- `REACT_APP_MODE`
  Used to distinguish local vs production behavior
- `REACT_APP_ADMIN_EMAIL`
  Optional UI-side admin gate for the photo admin screen
- `REACT_APP_PHOTO_LISTINGS_URL`
  Optional public JSON manifest for photo listings
- Firebase config vars in `.env.example`
  Required when using Firebase Auth / Firestore

Rules:
- Update `ThomWeb/.env.example` when adding new env vars
- Update `src/react-app-env.d.ts` for typed env usage
- Keep local and production behavior explicit rather than implicit
- If auth or photo-admin behavior changes, keep `firestore.rules` in sync with the intended security model

---

## Accessibility

Accessibility is required, not optional.

Minimum bar:
- semantic HTML
- correct heading order
- keyboard-operable controls
- visible focus styles
- descriptive alt text
- labels for form fields
- no click-only affordances for essential actions

Current reminder:
- This codebase already has a few places where heading semantics and interactive structure should be improved, so new work should not extend that debt

---

## Performance

Prefer straightforward performance wins:
- lazy-load large images
- keep dependencies lean
- avoid unnecessary re-renders
- keep bundle impact in mind before adding packages
- avoid shipping duplicate data-fetch logic

Do not trade readability for speculative optimization.

---

## Dependencies

Before adding a dependency, ask:
- Does the app already have a simple way to do this?
- Is this dependency solving a recurring problem?
- Does it fit the scale of a personal site?
- Will it increase maintenance burden more than it reduces code burden?

Default stance:
- prefer built-in browser/React capabilities first

---

## Change Strategy

When editing this codebase:
- match the local style of the files you touch
- improve naming, typing, and structure when it is low-risk to do so
- avoid mixing refactors with feature work unless the refactor is necessary to make the feature safe
- preserve existing behavior unless the task explicitly changes it

If a file is already inconsistent:
- leave it better than you found it
- do not expand the inconsistency

---

## Improvement Priorities

These are the main improvements the repo would benefit from next.

### 1. Normalize structure and naming

Current inconsistencies:
- capitalized folders (`Components`, `Pages`, `Hooks`, `Reducers`)
- API client files named as `*Router.tsx`
- non-JSX modules still using `.tsx`

Direction:
- do not rename these piecemeal
- if a cleanup pass is requested, normalize toward clearer names and `.ts` for non-visual modules

### 2. Add real project documentation

Current gap:
- `ThomWeb/README.md` is effectively empty

Direction:
- document setup
- document required env vars
- document local development commands
- document the posts API dependency and the photo manifest/Firebase modes

### 3. Add baseline test coverage

Current gap:
- there is no meaningful test coverage protecting key flows

Highest-value coverage:
- route rendering smoke tests
- posts API adapter behavior
- photo listings parsing/normalization
- photo admin authorization states

### 4. Reduce layout/responsive coupling

Current gap:
- resize-based route redirection is coupled to `Header`

Direction:
- keep current behavior working
- if revisited, move responsive routing concerns closer to the app shell or router boundary

### 5. Standardize async UI states

Current gap:
- loading, empty, and error handling are implemented ad hoc across pages

Direction:
- converge on a small, consistent pattern for page-level async states
- improve user-facing fallback copy

### 6. Tighten accessibility semantics

Current gap:
- some headings and button/heading combinations should be cleaned up

Direction:
- normalize heading hierarchy
- keep interactive elements semantically valid
- treat accessibility fixes as worthwhile maintenance, not polish

### 7. Review dependency footprint

Current gap:
- some dependencies look heavier than this app likely needs

Direction:
- remove unused packages when confirmed unused
- avoid adding new packages without a clear payoff

---

## Definition Of Done

A change is done when it is:

- correct
- readable
- consistent with the current app architecture
- typed properly
- accessible
- responsive
- safe in both light and dark theme when relevant
- respectful of existing routes and data flows

For route or data work, also check:
- loading state
- empty state
- error state
- mobile behavior
- environment/config assumptions
