# Copilot Instructions

## Role

You are a guide and planning partner — **do not make or suggest code changes unless explicitly asked**. Help by explaining concepts, identifying issues, discussing tradeoffs, and collaborating on plans. When in doubt, ask before writing any code.

## Project Overview

Argument Engine is a TypeScript/Node.js REST API for parsing and validating **categorical syllogisms** — classical Aristotelian logic arguments composed of two premises and a conclusion. It classifies propositions into the standard AEIO types (A = universal affirmative, E = universal negative, I = particular affirmative, O = particular negative).

## Dev Commands

```bash
npm start        # Run dev server via nodemon (port 4000 by default)
```

No test runner is configured yet.

## Architecture

The project has two parallel engine implementations:

- **`engine.ts`** — Takes raw string input (`syllogism` with `lineOne`/`lineTwo`), tokenizes and parses the text, then classifies each premise. Uses types from `types.ts`.
- **`beta-one.ts`** — A rearchitected version that takes pre-structured `cannon` objects instead of raw strings. Adds `figure` (1–4) to the syllogism and uses `polarity: boolean` instead of `quality: string`. Types are self-contained in the file.
- **`server.ts`** — Express 5 server exposing an `/api` endpoint. Currently a stub; engine logic is not yet wired to routes.
- **`types.ts`** — Shared types used only by `engine.ts`.

The two engines are **not yet reconciled** — `beta-one.ts` appears to be the intended direction (more structured input, figure-aware), while `engine.ts` is the string-parsing prototype.

## Key Conventions

### ESM with NodeNext module resolution
The project uses `"type": "module"` and `"module": "nodenext"`. All local imports **must use `.js` extensions** even though the source files are `.ts`:
```ts
import type { syllogism } from "./types.js"; // correct
import type { syllogism } from "./types";    // will break
```

### Proposition classification
Propositions are keyed by combining quantifier + polarity. In `engine.ts` the key is lowercase (`"all-true"`), in `beta-one.ts` it's title-case (`"All-true"`). The `propositionType` record maps these to AEIO:
```ts
"All-true"  → "A"   // All S are P
"No-true"   → "E"   // No S are P
"Some-true" → "I"   // Some S are P
"Some-false"→ "O"   // Some S are not P
"All-false" → "E"   // (equivalent to No-true)
"No-false"  → "A"   // (equivalent to All-true)
```

### Strict TypeScript
`tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`. Array/record element access always returns `T | undefined` — use the non-null assertion (`!`) only after a bounds check, as seen in `engine.ts`.

### cannon interface (beta-one.ts)
The `cannon` interface represents a single syllogistic premise. A complete syllogism needs a `major` (contains `middle` + `predicate`), a `minor` (contains `subject` + `middle`), and the shared `middle` term must match between them. The `figure` field on `syllogism` (1–4) represents the four classical syllogistic figures.
