# AGENTS.md — react-xray

Guidelines for AI coding agents working in this repository.

---

## Monorepo structure

```
packages/
  ui-components/            @react-xray/ui-components — Kbd, Tooltip, Button, IconButton,
                                                        PanelHeader, Popover, DropdownMenu,
                                                        icons (via @hugeicons/core-free-icons)
  core/                     @react-xray/core          — XRay component, plugin API, utilities
  plugin-preview/           @react-xray/plugin-preview — Monaco editor subpanel, FS access
  plugin-comments/          @react-xray/plugin-comments — inline comments + Send to OpenCode
  plugin-copy-to-clipboard/ @react-xray/plugin-copy-to-clipboard
  plugin-open-editor/       @react-xray/plugin-open-editor
  react-xray/               react-xray               — batteries-included convenience wrapper
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
pnpm --filter @react-xray/core build
pnpm --filter @react-xray/plugin-comments typecheck
pnpm --filter @react-xray/core test
```

### Single test file

```bash
pnpm --filter @react-xray/core exec vitest run src/path.test.ts
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
3. Internal workspace packages (`@react-xray/core`)
4. Blank line
5. Local relative imports (`./store`, `../utils`)

Always use named exports. Default exports only in `react-xray/src/index.tsx` (the convenience component).

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
- **Plugin factory functions:** `XxxPlugin()` — returns `RVEPlugin`
- **Store files:** module-level `let` + subscribe/getSnapshot/set pattern (compatible with `useSyncExternalStore`)

---

## Plugin architecture

Plugins implement `RVEPlugin`:

```ts
{
  name: string
  toolbarItems?: ToolbarItem[]       // icon/label accept ReactNode or (services) => ReactNode
  actions?(ctx, services): Action[]  // per-component actions shown in the action panel
  subpanel?: ComponentType<{ctx, services}>  // rendered below actions in the panel
}
```

- `services.fs` — `FileSystemService` singleton (read/write files via File System Access API)
- `services.root` — absolute project root from `<XRay root="..." />`
- `root` is **never** in plugin options — always read from `services.root`

**Overlay pattern** (for portal-mounted UI like CommentsMenu or FolderAccessOverlay):

1. Module-level store with `subscribe` / `getSnapshot` / `set` functions
2. Mount via `createRoot` into the `[data-react-xray]` portal element
3. `ensureXxxMounted()` — idempotent singleton, called from the plugin factory
4. Overlay components use `useSyncExternalStore` to read store state

**Important:** Plugin overlays must be mounted inside `[data-react-xray]` — the inspector intercepts all clicks in capture phase and only skips the portal element. Overlays rendered to `document.body` will have their clicks swallowed.

---

## Error handling

- Async fire-and-forget calls must have `.catch(() => {})` — no silent unhandled rejections
- In React components, prefer graceful degradation over throwing (return `null` if source is missing)
- `try/catch` in utility functions should return a sensible fallback, not re-throw

---

## Adding a new plugin

1. Create `packages/plugin-xxx/` mirroring an existing plugin (e.g. `plugin-copy-to-clipboard`)
2. Add `src/index.tsx` (plugin factory) and `src/index.prod.ts` (no-op stub)
3. Add `"@react-xray/plugin-xxx"` to the alias map in `apps/example/vite.config.ts`
4. Add `"@react-xray/ui-components"` and `"react-xray/plugin-xxx"` to the `neverBundle` list in the new package's `tsdown.config.ts`
5. Add `@react-xray/ui-components` to both `peerDependencies` and `devDependencies` in `package.json`
6. Optionally wire into `packages/react-xray/src/index.tsx` for the convenience bundle

---

## Reading files

Always use `cachebro_read_files` to read multiple known files in parallel rather than delegating to a subagent. Use the Task tool with the `explore` subagent only for open-ended searches across unknown parts of the codebase.
