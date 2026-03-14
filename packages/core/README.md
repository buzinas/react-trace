# @react-trace/core

`@react-trace/core` is the low-level package that powers the React Trace inspector widget. It gives you the `Trace` component, the plugin contract, and the hooks/utilities that official and custom plugins use.

Use this package when you want to:

- Mount the inspector yourself
- Choose exactly which plugins to enable
- Build custom plugins against the public core API

If you want the batteries-included bundle with all official plugins pre-wired, use `react-trace` instead.

## Installation

```bash
pnpm add --dev @react-trace/core
```

Peer requirements:

- `react >= 18`
- `react-dom >= 18`

## Minimal usage

Change your dev script to export the project root e.g.:

```diff
-    "dev": "vite"
+    "dev": "VITE_ROOT=$(pwd) vite",
```

Then add it next to your app:

```tsx
import { Trace } from '@react-trace/core'

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

`root` must be the absolute path to the project being inspected.

## When to use `@react-trace/core` vs `react-trace`

- Use `@react-trace/core` when you want a custom plugin list or your own plugins.
- Use `react-trace` when you want the default bundle of official plugins (`preview`, `copy-to-clipboard`, `open-editor`, and `comments`) with one import.

## `Trace` component

`Trace` is the widget entrypoint exported by this package.

### Props

- `root: string` — absolute project root path
- `plugins?: TracePlugin[]` — plugin instances to mount
- `position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'` — initial toolbar position
- `minimized?: boolean` — whether the widget starts minimized by default

## Plugin model

Plugins implement `TracePlugin`:

```ts
interface TracePlugin {
  name: string
  toolbar?: ComponentType
  actionPanel?: ComponentType
  settings?: ComponentType
}
```

- `toolbar` renders inside the widget toolbar.
- `actionPanel` renders inside the selected-component action menu.
- `settings` renders inside the widget settings popover.

Plugin-owned components receive no props. Read shared widget state through the exported hooks instead.

### Minimal plugin example

> Tip: Run `pnpm create react-trace-plugin` to scaffold a full plugin package with build config and production stubs.

```tsx
import { Trace, useSelectedContext, type TracePlugin } from '@react-trace/core'

function SelectionInfo() {
  const context = useSelectedContext()
  return context ? <button type="button">{context.displayName}</button> : null
}

const examplePlugin: TracePlugin = {
  name: 'Example',
  toolbar: SelectionInfo,
}

export function AppShell() {
  return <Trace root="/absolute/path/to/project" plugins={[examplePlugin]} />
}
```

## Exported hooks

- `useProjectRoot()` — returns the current project root string
- `useInspectorActive()` — returns whether inspector mode is active
- `useDeactivateInspector()` — returns a callback that turns inspector mode off
- `useSelectedContext()` — returns the currently selected `ComponentContext | null`
- `useClearSelectedContext()` — returns a callback that clears the current selection
- `useSelectedSource()` — returns the currently selected `ComponentSource | null`
- `useWidgetPortalContainer()` — returns the widget portal container element

## Exported utilities and constants

- `settingsPluginAtom(pluginKey)` — returns a writable Jotai atom for a section of `TraceSettings`
- `IS_MAC` — `true` on macOS/iOS user agents
- `MOD_KEY` — platform-specific modifier key label (`⌘` or `Ctrl`)

## Exported types

- `ComponentContext` — full context of an inspected component (element, name, breadcrumb, props, sources)
- `ComponentSource` — source file location (`fileName`, `lineNumber`, `columnNumber`, `relativePath`, `absolutePath`)
- `TracePlugin`
- `TraceProps`
- `TraceSettings`

## Notes for plugin authors

- `useWidgetPortalContainer()` lets plugin popovers, tooltips, and menus render inside the widget portal instead of `document.body`.
- `settingsPluginAtom()` is keyed by `TraceSettings`, so plugin settings should live under a stable top-level key.

## Production builds

This package publishes development and production entrypoints. In production mode, the exported `Trace` component resolves to a no-op stub, which keeps the inspector at zero runtime cost when production export conditions are used.
