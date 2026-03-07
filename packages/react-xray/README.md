# react-xray

`react-xray` is the batteries-included package for adding the React XRay inspector to an app without wiring plugins manually.

It ships a default `XRay` export that wraps `@react-xray/core` and preconfigures all official plugins.

## Installation

```bash
pnpm add --dev react-xray
```

Peer requirements:

- `react >= 18`
- `react-dom >= 18`

## When to use this package

Use `react-xray` when you want the standard inspector setup with all official plugins already enabled.

If you need granular control over plugin composition or plugin-specific options beyond the wrapper props documented here, use `@react-xray/core` with individual `@react-xray/plugin-*` packages instead.

## Default export

The package exports a default `XRay` component:

```tsx
import XRay from 'react-xray'

function AppShell() {
  return <XRay root={import.meta.env.VITE_ROOT} />
}
```

`root` should be the absolute path to your project root. The wrapper forwards it to `@react-xray/core` so bundled plugins can resolve files for preview, comments, copy-to-clipboard, and open-in-editor flows.

## Bundled plugins

`react-xray` currently wires these official plugins in this order:

1. `@react-xray/plugin-preview` — adds the source preview panel with inline Monaco-based file preview and editing support.
2. `@react-xray/plugin-copy-to-clipboard` — adds an action-panel item for copying the selected source location.
3. `@react-xray/plugin-open-editor` — adds an action-panel item for opening the selected source in your editor.
4. `@react-xray/plugin-comments` — adds inline comments UI, including the comments toolbar and comment actions.

## Props

The default export supports the following props today:

| Prop              | Type                                                           | Default          | Description                                                                          |
| ----------------- | -------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `root`            | `string`                                                       | —                | Required absolute path to the project root.                                          |
| `position`        | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'bottom-right'` | Controls where the XRay widget is placed on screen.                                  |
| `editingDisabled` | `boolean`                                                      | `false`          | Disables inline editing in the preview panel and hides the Save and expand controls. |
| `editor`          | `EditorPreset`                                                 | `'vscode'`       | Sets the default editor used by the Open in Editor action.                           |

`EditorPreset` currently supports these values:

- `vscode`
- `cursor`
- `windsurf`
- `webstorm`
- `intellij`

## Example

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
      <XRay
        root={import.meta.env.VITE_ROOT}
        position="bottom-left"
        editor="cursor"
        editingDisabled={false}
      />
    </>
  )
}
```

## Exposed types

In addition to the default export, the package exports `XRayAllInOneProps` and re-exports `EditorPreset` for convenience.
