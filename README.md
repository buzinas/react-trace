# react-trace

React Trace is a development-time React inspector that helps you identify rendered components, resolve their source locations, and run source-aware actions such as previewing code, adding comments, copying paths, and opening files in your editor.

Use `@react-trace/kit` for the recommended all-in-one setup, or compose `@react-trace/core` with the official plugins when you want explicit control over the plugin list.

## Installation

### Recommended: `@react-trace/kit`

Use the `@react-trace/kit` package when you want the standard inspector setup with all official plugins already wired for you.

```bash
pnpm add --dev @react-trace/kit
```

Peer requirements:

- `react >= 18`
- `react-dom >= 18`

#### Usage

Change your dev script to export the project root e.g.:

```diff
-    "dev": "vite"
+    "dev": "VITE_ROOT=$(pwd) vite",
```

Then add it next to your app:

```tsx
import Trace from '@react-trace/kit'

import App from './App'

export function Root() {
  return (
    <>
      <App />
      <Trace root={import.meta.env.VITE_ROOT} />
    </>
  )
}
```

`root` should be the absolute path to the project being inspected. A common development setup is exporting it in your dev script, for example: `VITE_ROOT=$(pwd) vite`.

### Alternative: `@react-trace/core` and specific plugins

Use `@react-trace/core` when you want to choose plugins yourself. The official plugins also expect `@react-trace/ui-components` as a peer dependency.

```bash
pnpm add --dev @react-trace/core @react-trace/ui-components @react-trace/plugin-preview @react-trace/plugin-copy-to-clipboard @react-trace/plugin-open-editor @react-trace/plugin-comments
```

```tsx
import { Trace } from '@react-trace/core'
import { CommentsPlugin } from '@react-trace/plugin-comments'
import { CopyToClipboardPlugin } from '@react-trace/plugin-copy-to-clipboard'
import { OpenEditorPlugin } from '@react-trace/plugin-open-editor'
import { PreviewPlugin } from '@react-trace/plugin-preview'

import App from './App'

export function Root() {
  return (
    <>
      <App />
      <Trace
        root={import.meta.env.VITE_ROOT}
        plugins={[
          PreviewPlugin(),
          CopyToClipboardPlugin(),
          OpenEditorPlugin(),
          CommentsPlugin(),
        ]}
      />
    </>
  )
}
```

## Official Plugins

| Package                                 | What it adds                                                                                                               |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `@react-trace/plugin-preview`           | Project-folder access, Monaco-based source preview, optional inline editing, and preview settings.                         |
| `@react-trace/plugin-copy-to-clipboard` | An action-panel item that copies the selected source as a project-relative `path:lineNumber` reference.                    |
| `@react-trace/plugin-open-editor`       | An action-panel item for opening the selected source in supported local editors, plus editor selection in widget settings. |
| `@react-trace/plugin-comments`          | Toolbar comments UI, inline add-comment flow, and "Copy to Clipboard" + "Send to OpenCode" support for collected comments. |

## Writing your own plugin

Build custom plugins against `@react-trace/core` when you want your own plugin list or plugin-specific UI. A plugin is an `TracePlugin` object with a `name` and optional React components for the widget `toolbar`, selected-component `actionPanel`, and `settings` menu.

Those plugin components receive no props. Instead, read shared state and services through the public hooks exported by `@react-trace/core`, including `useProjectRoot()`, `useInspectorActive()`, `useDeactivateInspector()`, `useSelectedContext()`, `useClearSelectedContext()`, `useSelectedSource()`, `useWidgetPortalContainer()`, and `useWidgetServices()`.

In practice, plugin authors usually read the current selection with `useSelectedContext()` or `useSelectedSource()`, access shared services such as `fs` through `useWidgetServices()`, and render popovers or menus through `useWidgetPortalContainer()` so plugin UI stays inside the widget shell.

## Contributing

Clone the repo. Run `nvm use` and `pnpm i`.

### Monorepo layout

- `packages/core` — `@react-trace/core`, the `Trace` component, plugin API, hooks, and utilities.
- `packages/react-trace` — `@react-trace/kit`, the convenience wrapper with all official plugins pre-wired.
- `packages/ui-components` — `@react-trace/ui-components`, shared UI primitives used by the official plugins.
- `packages/plugin-preview` — `@react-trace/plugin-preview`, source preview/editor action panel with project-folder access.
- `packages/plugin-comments` — `@react-trace/plugin-comments`, inline comments and Send to OpenCode flows.
- `packages/plugin-copy-to-clipboard` — `@react-trace/plugin-copy-to-clipboard`, copies the selected source path and line.
- `packages/plugin-open-editor` — `@react-trace/plugin-open-editor`, opens the selected source in a local editor.
- `apps/example` — Vite + React demo app that mounts `react-trace`.

### Tooling

- `pnpm` workspaces
- Turborepo
- TypeScript
- `tsdown`
- `oxlint` / `oxfmt`
- Vitest

### Workspace commands

Run these from the repository root:

```bash
pnpm build
pnpm dev
pnpm test
pnpm lint
pnpm typecheck
pnpm fmt
pnpm fmt:check
```

Useful package-scoped commands:

```bash
pnpm --filter @react-trace/core build
pnpm --filter @react-trace/plugin-comments typecheck
pnpm --filter @react-trace/core exec vitest run src/path.test.ts
pnpm --filter example build
```

### Example app

The example lives in `apps/example` and depends on the workspace `react-trace` package. It is the fastest way to try the current widget and plugin bundle locally.

For a production build of the example app:

```bash
pnpm --filter example build
```

### Note to contributors

- Package entry points use conditional exports for development and production builds.
- Each package has a `src/index.prod.ts` production stub used for zero-cost production aliases.
- If you need a full workspace watch across packages, use `pnpm dev` from the repo root.
