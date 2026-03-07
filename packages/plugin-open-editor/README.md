# @react-trace/plugin-open-editor

Open the currently selected component source in a local editor from the Trace action panel.

This plugin adds:

- an `Open in Editor` action for the selected source
- a settings control for choosing the default editor inside the widget

## Installation

Install the plugin alongside its peer dependencies:

```bash
pnpm add --dev @react-trace/core @react-trace/ui-components @react-trace/plugin-open-editor
```

If you are already using `@react-trace/kit`, this plugin is included there by default.

## Usage

```tsx
import { Trace } from '@react-trace/core'
import { OpenEditorPlugin } from '@react-trace/plugin-open-editor'

import App from './App'

export function AppWithTrace() {
  return (
    <>
      <App />
      <Trace
        root={import.meta.env.VITE_ROOT}
        plugins={[OpenEditorPlugin({ editor: 'vscode' })]}
      />
    </>
  )
}
```

`root` should be the absolute project root passed to Trace so the plugin can resolve relative file paths for comments.

## `editor` option

`OpenEditorPlugin` accepts a single option:

```ts
interface OpenEditorPluginOptions {
  editor?: EditorPreset
}
```

- Default: `vscode`
- If the user changes the editor in the widget settings, that's what's used instead.

The package also exports the `EditorPreset` type.

## Supported editor presets

These are the currently implemented presets:

- `vscode`
- `cursor`
- `windsurf`
- `webstorm`
- `intellij`

## Behavior

When a source location is selected, the plugin resolves the file path relative to the Trace `root` and opens the generated editor URL with `window.open(...)`.
