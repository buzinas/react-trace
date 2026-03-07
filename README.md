# react-xray

React XRay is a development-time React inspector that helps you identify rendered components, resolve their source locations, and run source-aware actions such as previewing code, adding comments, copying paths, and opening files in your editor.

Use `react-xray` for the recommended all-in-one setup, or compose `@react-xray/core` with the official plugins when you want explicit control over the plugin list.

## Installation

### Recommended: `react-xray`

Use the `react-xray` package when you want the standard inspector setup with all official plugins already wired for you.

```bash
pnpm add --dev react-xray
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
import XRay from 'react-xray'

import App from './App'

export function Root() {
  return (
    <>
      <App />
      <XRay root={import.meta.env.VITE_ROOT} />
    </>
  )
}
```

`root` should be the absolute path to the project being inspected. A common development setup is exporting it in your dev script, for example: `VITE_ROOT=$(pwd) vite`.

### Alternative: `@react-xray/core` and specific plugins

Use `@react-xray/core` when you want to choose plugins yourself. The official plugins also expect `@react-xray/ui-components` as a peer dependency.

```bash
pnpm add --dev @react-xray/core @react-xray/ui-components @react-xray/plugin-preview @react-xray/plugin-copy-to-clipboard @react-xray/plugin-open-editor @react-xray/plugin-comments
```

```tsx
import { XRay } from '@react-xray/core'
import { CommentsPlugin } from '@react-xray/plugin-comments'
import { CopyToClipboardPlugin } from '@react-xray/plugin-copy-to-clipboard'
import { OpenEditorPlugin } from '@react-xray/plugin-open-editor'
import { PreviewPlugin } from '@react-xray/plugin-preview'

import App from './App'

export function Root() {
  return (
    <>
      <App />
      <XRay
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

| Package                                | What it adds                                                                                                               |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `@react-xray/plugin-preview`           | Project-folder access, Monaco-based source preview, optional inline editing, and preview settings.                         |
| `@react-xray/plugin-copy-to-clipboard` | An action-panel item that copies the selected source as a project-relative `path:lineNumber` reference.                    |
| `@react-xray/plugin-open-editor`       | An action-panel item for opening the selected source in supported local editors, plus editor selection in widget settings. |
| `@react-xray/plugin-comments`          | Toolbar comments UI, inline add-comment flow, and "Copy to Clipboard" + "Send to OpenCode" support for collected comments. |

## Writing your own plugin

Build custom plugins against `@react-xray/core` when you want your own plugin list or plugin-specific UI. A plugin is an `XRayPlugin` object with a `name` and optional React components for the widget `toolbar`, selected-component `actionPanel`, and `settings` menu.

Those plugin components receive no props. Instead, read shared state and services through the public hooks exported by `@react-xray/core`, including `useProjectRoot()`, `useInspectorActive()`, `useDeactivateInspector()`, `useSelectedContext()`, `useClearSelectedContext()`, `useSelectedSource()`, `useWidgetPortalContainer()`, and `useWidgetServices()`.

In practice, plugin authors usually read the current selection with `useSelectedContext()` or `useSelectedSource()`, access shared services such as `fs` through `useWidgetServices()`, and render popovers or menus through `useWidgetPortalContainer()` so plugin UI stays inside the widget shell.

## Contributing

Clone the repo. Run `nvm use` and `pnpm i`.

### Monorepo layout

- `packages/core` — `@react-xray/core`, the `XRay` component, plugin API, hooks, and utilities.
- `packages/react-xray` — `react-xray`, the convenience wrapper with all official plugins pre-wired.
- `packages/ui-components` — `@react-xray/ui-components`, shared UI primitives used by the official plugins.
- `packages/plugin-preview` — `@react-xray/plugin-preview`, source preview/editor action panel with project-folder access.
- `packages/plugin-comments` — `@react-xray/plugin-comments`, inline comments and Send to OpenCode flows.
- `packages/plugin-copy-to-clipboard` — `@react-xray/plugin-copy-to-clipboard`, copies the selected source path and line.
- `packages/plugin-open-editor` — `@react-xray/plugin-open-editor`, opens the selected source in a local editor.
- `apps/example` — Vite + React demo app that mounts `react-xray`.

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
pnpm --filter @react-xray/core build
pnpm --filter @react-xray/plugin-comments typecheck
pnpm --filter @react-xray/core exec vitest run src/path.test.ts
pnpm --filter example build
```

### Example app

The example lives in `apps/example` and depends on the workspace `react-xray` package. It is the fastest way to try the current widget and plugin bundle locally.

For a production build of the example app:

```bash
pnpm --filter example build
```

### Note to contributors

- Package entry points use conditional exports for development and production builds.
- Each package has a `src/index.prod.ts` production stub used for zero-cost production aliases.
- If you need a full workspace watch across packages, use `pnpm dev` from the repo root.
