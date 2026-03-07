# AGENTS.md — react-trace

Guidelines for AI coding agents working in this repository.

---

## Monorepo structure

```
packages/
  ui-components/            @react-trace/ui-components — Kbd, Tooltip, Button, IconButton,
                                                        PanelHeader, Popover, DropdownMenu,
                                                        icons (via @hugeicons/core-free-icons)
  core/                     @react-trace/core          — Trace component, plugin API, utilities
  plugin-preview/           @react-trace/plugin-preview — Monaco editor action panel, FS access
  plugin-comments/          @react-trace/plugin-comments — inline comments + Send to OpenCode
  plugin-copy-to-clipboard/ @react-trace/plugin-copy-to-clipboard
  plugin-open-editor/       @react-trace/plugin-open-editor
  react-trace/              @react-trace/kit               — batteries-included convenience wrapper
apps/
  example/                  Vite + React demo app
```

**Toolchain:** pnpm workspaces · Turborepo · tsdown (rolldown bundler) · TypeScript · oxlint · oxfmt · vitest

---

## Commands

### Root (all packages via Turborepo)

```bash
pnpm build          # build all packages in dependency order
pnpm dev            # watch mode (builds deps first, then watches)
pnpm typecheck      # tsc --noEmit across all packages
pnpm lint           # oxlint across all packages
pnpm fmt            # oxfmt . (auto-fix formatting)
pnpm fmt:check      # check formatting without writing
pnpm test           # vitest run across all packages
```

### Single package

```bash
pnpm --filter @react-trace/core build
pnpm --filter @react-trace/plugin-comments typecheck
pnpm --filter @react-trace/core test
```

### Single test file

```bash
pnpm --filter @react-trace/core exec vitest run src/path.test.ts
```

### Example app

```bash
pnpm --filter example dev    # start dev server
pnpm --filter example build  # production build (uses prod stubs — see below)
```

---

## Production stubs

Every package has `src/index.prod.ts` — a zero-cost stub (all exports are no-ops).
The `package.json` `exports` field uses `"development"` / `"production"` / `"default"` conditions.
`apps/example/vite.config.ts` uses `resolve.alias` to redirect imports to prod stubs in production mode.

**Rule:** When adding a new public export to a package, mirror it in `src/index.prod.ts` (as a type-only re-export or a no-op function).

---

## TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true` — no `any`, no non-null assertions without reason
- Target: ES2022, lib: ES2024 + DOM
- `moduleResolution: "Bundler"` — no `.js` extensions needed on imports
- Use `type` keyword for type-only imports: `import type { Foo } from './foo'`
- When a value and types come from the same module, mix inline: `import { fn, type Foo } from './foo'`
- Prefer `interface` for object shapes that may be extended; `type` for unions/aliases

---

## Imports

Order (enforced by oxlint):

1. External packages (`react`, `@monaco-editor/react`, etc.)
2. Blank line
3. Internal workspace packages (`@react-trace/core`)
4. Blank line
5. Local relative imports (`./store`, `../utils`)

Always use named exports. Default exports only in `react-trace/src/index.tsx` (the convenience component).

---

## Code style

- **Formatter:** oxfmt — run `pnpm fmt` before committing. No manual whitespace decisions.
- **No CSS classes** — all styling uses inline `style` objects with `React.CSSProperties`.
- **No Tailwind** — inline styles only.
- **Color palette:**
  - Background: `#18181b`, surface: `#09090b`
  - Border: `#27272a`, subtle border: `#3f3f46`
  - Text primary: `#fafafa`, secondary: `#d4d4d8`, muted: `#71717a`
  - Accent (blue): `#3b82f6`, success (green): `#22c55e`, danger (red): `#ef4444`
- **No emojis** in source code or comments.
- Avoid section separators in longer files like below (if you feel you need, better to refactor into multiple files instead):
  ```ts
  // ---------------------------------------------------------------------------
  // Section name
  // ---------------------------------------------------------------------------
  ```

---

## Naming conventions

- **Files:** `PascalCase.tsx` for React components, `camelCase.ts` for modules
- **Components:** `PascalCase`
- **Functions/variables:** `camelCase`
- **Interfaces/types:** `PascalCase`
- **Constants:** `SCREAMING_SNAKE_CASE` for module-level primitives (e.g. `LINE_HEIGHT`, `IS_MAC`)
- **Plugin factory functions:** `XxxPlugin()` — returns `TracePlugin`
- **Store files:** module-level `let` + subscribe/getSnapshot/set pattern (compatible with `useSyncExternalStore`)

---

## Plugin architecture

Plugins implement `TracePlugin`:

```ts
{
  name: string
  toolbar?: ComponentType
  actionPanel?: ComponentType
  settings?: ComponentType
}
```

- `toolbar` renders plugin-owned UI directly inside the core toolbar.
- `actionPanel` renders plugin-owned UI directly inside the widget action panel. These components receive no props; read shared state through the public hooks.
- `settings` renders plugin-owned UI directly inside the widget settings popover.
- The deprecated compatibility contract (`toolbarItems`, `actions`, `subpanel`, `ToolbarItem`, `Action`) has been removed and should not be documented or used as supported API.

Shared hook surface from `@react-trace/core`:

- `useProjectRoot()` — absolute project root from `<Trace root="..." />`
- `useInspectorActive()` — whether inspector mode is currently active
- `useSelectedContext()` — currently selected component context
- `useSelectedSource()` — currently selected source for action-panel flows
- `useWidgetServices()` — shared widget services such as `fs`
- `useWidgetPortalContainer()` — portal container inside the widget shell for tooltips, dropdowns, popovers, and other portal UI
- `useDeactivateInspector()` — disable inspector mode before opening plugin-owned interactive UI
- `useClearSelectedContext()` — clear the current selection when a plugin flow should dismiss it

Plugin-owned UI should render directly from `toolbar`, `actionPanel`, or `settings`. For popovers, dropdowns, tooltips, and other portal-mounted UI, use the widget portal container instead of rendering to `document.body`.

---

## Error handling

- Async fire-and-forget calls must have `.catch(() => {})` — no silent unhandled rejections
- In React components, prefer graceful degradation over throwing (return `null` if source is missing)
- `try/catch` in utility functions should return a sensible fallback, not re-throw

---

## Adding a new plugin

1. Create `packages/plugin-xxx/` mirroring an existing plugin (e.g. `plugin-copy-to-clipboard`)
2. Add `src/index.tsx` (plugin factory) and `src/index.prod.ts` (no-op stub)
3. Add `"@react-trace/plugin-xxx"` to the alias map in `apps/example/vite.config.ts`
4. Add `"@react-trace/ui-components"` and `"react-trace/plugin-xxx"` to the `neverBundle` list in the new package's `tsdown.config.ts`
5. Add `@react-trace/ui-components` to both `peerDependencies` and `devDependencies` in `package.json`
6. Optionally wire into `packages/react-trace/src/index.tsx` for the convenience bundle

---

## Reading files

Read known files directly, and parallelize independent read-only inspection when possible. Use broader codebase search only when you do not yet know which files contain the information you need.
