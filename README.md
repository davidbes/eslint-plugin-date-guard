# eslint-plugin-date-guard

ESLint rules for enforcing safe, consistent date handling in TypeScript and JavaScript.

`date-guard` is intended for teams that want date handling to go through approved date utilities, such as the date library already installed in the project, instead of ad-hoc native `Date` mutation, formatting, timestamp math, type assertions, or ISO-string slicing.

## Install

```sh
npm install --save-dev eslint eslint-plugin-date-guard @typescript-eslint/parser typescript
```

`eslint` is a peer dependency. `@typescript-eslint/parser` and `typescript` are optional peer dependencies used for full type-aware coverage. The plugin has no runtime dependency on `date-fns`.

## Requirements

The recommended rules use TypeScript parser services when they are available, but they do not require type-aware linting for every check.

For full coverage, consuming projects should have:

- ESLint 9 or newer with flat config.
- `typescript` installed.
- `@typescript-eslint/parser` configured with type information, preferably `parserOptions.projectService: true`.
- Linted files included by a `tsconfig.json` or equivalent TypeScript project.

Without parser services, the rules still report safe syntactic traps such as:

```ts
new Date().setMonth(0);
new Date().toLocaleDateString();
date.toISOString().split("T")[0];
new Date().getTime() + 86_400_000;
Date.now() - startedAt;
value as Date;
```

Ambiguous patterns still need type information. For example, `value.setMonth(0)`, `value.toLocaleString()`, `date.getHours() + 1`, `end - start`, and `value as MaybeDate` are only reported when TypeScript can prove the receiver or asserted type is `Date`.

This fallback is intentionally conservative for common method names. Without type information, `obj.toJSON().slice(0, 10)` and `shift.getHours() + 1` are not treated as date operations, because unrelated objects often expose methods with those names.

## Usage

`date-guard` is built for ESLint 9 flat config:

```js
// eslint.config.js
import tsParser from "@typescript-eslint/parser";
import dateGuard from "eslint-plugin-date-guard";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    ...dateGuard.configs.recommended,
  },
];
```

For JavaScript projects, use a TypeScript config for linting and enable `allowJs` so the parser can provide type information:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "noEmit": true
  },
  "include": ["src/**/*.js", "src/**/*.jsx"]
}
```

Then point ESLint at that project or use `projectService: true` from the config above. Without that, JavaScript files still get the safe syntactic checks, but not the ambiguous type-aware ones.

## Recommended Rules

```js
{
  "date-guard/no-date-mutation": "error",
  "date-guard/no-date-string-hacks": "error",
  "date-guard/no-date-type-assertion": "error",
  "date-guard/no-manual-date-arithmetic": "error",
  "date-guard/no-native-date-formatting": "error"
}
```

## Example Correction

The rules are meant to push code away from ad-hoc native `Date` operations and toward the project's approved date library. For example, if the project uses `date-fns`, prefer an explicit immutable helper:

```ts
import { parseLocalDateTimeInput } from "@/lib/date/time";

export const DEFAULT_EVENT_DURATION_HOURS = 3;

export function resolveEventEndsAt({
  startsAtInput,
  durationHours = DEFAULT_EVENT_DURATION_HOURS,
}: {
  startsAtInput: string;
  durationHours?: number;
}): Date | null {
  const startsAt = parseLocalDateTimeInput(startsAtInput);

  if (!startsAt) {
    return null;
  }

  const endsAt = new Date(startsAt);
  endsAt.setHours(endsAt.getHours() + durationHours);

  return endsAt;
}
```

Use the date utility directly instead:

```ts
import { addHours } from "date-fns";
import { parseLocalDateTimeInput } from "@/lib/date/time";

export const DEFAULT_EVENT_DURATION_HOURS = 3;

export function resolveEventEndsAt({
  startsAtInput,
  durationHours = DEFAULT_EVENT_DURATION_HOURS,
}: {
  startsAtInput: string;
  durationHours?: number;
}): Date | null {
  const startsAt = parseLocalDateTimeInput(startsAtInput);

  if (!startsAt) {
    return null;
  }

  return addHours(startsAt, durationHours);
}
```

The first version triggers `date-guard/no-date-mutation` for `setHours` and `date-guard/no-manual-date-arithmetic` for `getHours() + durationHours`.

## Rules

### `date-guard/no-date-mutation`

Disallows mutating `Date` instances with `set*` methods:

```ts
date.setDate(1);
date.setMonth(0);
date.setUTCFullYear(2026);
```

Allowed:

```ts
const date = new Date();
const copy = new Date(date);
Date.now();
```

### `date-guard/no-native-date-formatting`

Disallows native `Date` formatting methods whose output can vary by runtime, locale, or timezone:

```ts
date.toLocaleDateString("en-US");
date.toDateString();
date.toUTCString();
date.toString();
```

Allowed:

```ts
date.toISOString();
date.toJSON();
```

### `date-guard/no-manual-date-arithmetic`

Disallows arithmetic on `Date` values or numbers derived from `Date` methods:

```ts
new Date(date.getTime() + 86_400_000);
Date.now() - startedAt.getTime();
end - start;
date.getUTCMonth() + 1;
+date + 86_400_000;
Number(endDate) - Number(startDate);
elapsed += date.getTime();
```

Allowed:

```ts
new Date();
new Date(existingDate);
Date.now();
date.getTime();
Number(date);
```

### `date-guard/no-date-string-hacks`

Disallows deriving calendar or display dates by splitting or slicing ISO strings:

```ts
date.toISOString().split("T")[0];
date.toISOString().slice(0, 10);
date.toJSON().substring(0, 10);
```

Allowed:

```ts
date.toISOString();
"2026-09-04T00:00:00.000Z".split("T")[0];
```

### `date-guard/no-date-type-assertion`

Disallows asserting a value to `Date` instead of validating or converting it:

```ts
value as Date;
value as unknown as Date;
<Date>value;
value as Date | null;
```

Allowed:

```ts
const value: Date = new Date();
function run(value: Date) {}
type MaybeDate = Date | null;
interface Row {
  createdAt: Date;
}
```

## Design Principles

- Prefer semantic type-aware checks for ambiguous patterns; use syntax-only fallbacks only where the false-positive risk is low.
- Keep rules suitable for `"error"` severity in CI.
- Do not ban legitimate `Date` transport, construction, annotations, or timestamp capture.
- Point developers toward approved date utilities instead of hand-rolled helpers.
