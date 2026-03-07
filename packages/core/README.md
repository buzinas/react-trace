# @react-xray/core

`@react-xray/core` is the low-level package that powers the React XRay inspector widget. It gives you the `XRay` component, the plugin contract, and the hooks/utilities that official and custom plugins use.

Use this package when you want to:

- Mount the inspector yourself
- Choose exactly which plugins to enable
- Build custom plugins against the public core API

If you want the batteries-included bundle with all official plugins pre-wired, use `react-xray` instead.

## Installation

```bash
pnpm add --dev @react-xray/core
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
import { XRay } from '@react-xray/core'

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

`root` must be the absolute path to the project being inspected.

## When to use `@react-xray/core` vs `react-xray`

- Use `@react-xray/core` when you want a custom plugin list or your own plugins.
- Use `react-xray` when you want the default bundle of official plugins (`preview`, `copy-to-clipboard`, `open-editor`, and `comments`) with one import.

## `XRay` component

`XRay` is the widget entrypoint exported by this package.

### Props

- `root: string` — absolute project root path
- `plugins?: XRayPlugin[]` — plugin instances to mount
- `position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'` — initial toolbar position

## Plugin model

Plugins implement `XRayPlugin`:

```ts
interface XRayPlugin {
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

```tsx
import { XRay, useSelectedContext, type XRayPlugin } from '@react-xray/core'

function SelectionInfo() {
  const context = useSelectedContext()
  return context ? <button type="button">{context.displayName}</button> : null
}

const examplePlugin: XRayPlugin = {
  name: 'Example',
  toolbar: SelectionInfo,
}

export function AppShell() {
  return <XRay root="/absolute/path/to/project" plugins={[examplePlugin]} />
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
- `useWidgetServices()` — returns shared services such as `fs`

## Exported utilities and constants

- `resolveSource(source)` — resolves URL-based source locations back to original source-map positions when possible
- `toAbsolutePath(fileName, root?)` — converts a source filename or Vite URL to an absolute filesystem path
- `toRelativePath(fileName, root?)` — converts a source filename or Vite URL to a path relative to the project root when possible
- `settingsPluginAtom(pluginKey)` — returns a writable Jotai atom for a section of `XRaySettings`
- `IS_MAC` — `true` on macOS/iOS user agents
- `MOD_KEY` — platform-specific modifier key label (`⌘` or `Ctrl`)

## Exported types

- `ComponentContext`
- `ComponentSource`
- `FileSystemService`
- `XRayPlugin`
- `XRayProps`
- `XRayServices`
- `XRaySettings`

## Notes for plugin authors

- `useWidgetServices().fs` exposes the file-system service used by official plugins.
- `useWidgetPortalContainer()` lets plugin popovers, tooltips, and menus render inside the widget portal instead of `document.body`.
- `settingsPluginAtom()` is keyed by `XRaySettings`, so plugin settings should live under a stable top-level key.

## Production builds

This package publishes development and production entrypoints. In production mode, the exported `XRay` component resolves to a no-op stub, which keeps the inspector at zero runtime cost when production export conditions are used.
