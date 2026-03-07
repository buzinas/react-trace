# @react-trace/plugin-preview

Monaco-based source preview plugin for `@react-trace/core`.

This package adds a toolbar control for connecting the current project folder and an action-panel preview for the selected source file.

## Installation

```bash
pnpm add --dev @react-trace/core @react-trace/ui-components @react-trace/plugin-preview
```

If you are already using `@react-trace/kit`, this plugin is included there by default.

## Usage

```tsx
import { Trace } from '@react-trace/core'
import { PreviewPlugin } from '@react-trace/plugin-preview'

import App from './App'

export function AppWithTrace() {
  return (
    <>
      <App />
      <Trace
        root={import.meta.env.VITE_ROOT}
        plugins={[PreviewPlugin({ theme: 'one-dark-pro' })]}
      />
    </>
  )
}
```

`root` should be the absolute project root passed to Trace so the plugin can resolve relative file paths for comments.

## What it adds

- A toolbar button for project-folder access.
- An action-panel source preview for the currently selected component source.
- An inline Monaco editor with syntax highlighting.
- Optional save and expand controls when editing is enabled.
- A plugin settings UI for preview theme and editing mode.

## Folder access expectations

The preview plugin reads files from the project through Trace's file-system service, so users must grant folder access before the preview can load file contents.

- Pass the absolute project root to `<Trace root="..." />`.
- When prompted, select the same project folder that contains the source files Trace resolves.
- If a root path is available, the plugin copies that path to the clipboard to make the folder picker easier to use.
- Until access is granted, the toolbar button and action panel show the access flow instead of a live file preview.
- When editing is enabled, saves are written back through the same file-system access.

If you only want inspection without file writes, start the plugin in read-only mode with `disabled: true`.

## Options

`PreviewPlugin(options?: PreviewPluginOptions)`

```ts
interface PreviewPluginOptions {
  disabled?: boolean
  theme?: BundledTheme
}
```

- `disabled` — defaults to `false`. Starts the preview in read-only mode and removes editing controls.
- `theme` — defaults to `'one-dark-pro'`. Accepts any bundled Shiki theme id.

## Settings

The plugin also contributes a settings panel inside Trace where users can:

- toggle code editing on or off
- switch the preview theme

These controls let users adjust preview behavior without changing the plugin registration code.
