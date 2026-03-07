# @react-xray/plugin-preview

Monaco-based source preview plugin for `@react-xray/core`.

This package adds a toolbar control for connecting the current project folder and an action-panel preview for the selected source file.

## Installation

```bash
pnpm add --dev @react-xray/core @react-xray/ui-components @react-xray/plugin-preview
```

If you are already using `react-xray`, this plugin is included there by default.

## Usage

```tsx
import { XRay } from '@react-xray/core'
import { PreviewPlugin } from '@react-xray/plugin-preview'

import App from './App'

export function AppWithXRay() {
  return (
    <>
      <App />
      <XRay
        root={import.meta.env.VITE_ROOT}
        plugins={[PreviewPlugin({ theme: 'one-dark-pro' })]}
      />
    </>
  )
}
```

`root` should be the absolute project root passed to XRay so the plugin can resolve relative file paths for comments.

## What it adds

- A toolbar button for project-folder access.
- An action-panel source preview for the currently selected component source.
- An inline Monaco editor with syntax highlighting.
- Optional save and expand controls when editing is enabled.
- A plugin settings UI for preview theme and editing mode.

## Folder access expectations

The preview plugin reads files from the project through XRay's file-system service, so users must grant folder access before the preview can load file contents.

- Pass the absolute project root to `<XRay root="..." />`.
- When prompted, select the same project folder that contains the source files XRay resolves.
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

The plugin also contributes a settings panel inside XRay where users can:

- toggle code editing on or off
- switch the preview theme

These controls let users adjust preview behavior without changing the plugin registration code.
