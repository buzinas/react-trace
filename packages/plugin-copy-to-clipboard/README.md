# @react-xray/plugin-copy-to-clipboard

`@react-xray/plugin-copy-to-clipboard` adds a `Copy path` item to the XRay action panel for selections that have source information.

When you trigger the action, the plugin copies a project-relative `path:lineNumber` reference to the clipboard.

## Install

Install the plugin alongside its peer dependencies:

```bash
pnpm add --dev @react-xray/core @react-xray/ui-components @react-xray/plugin-copy-to-clipboard
```

If you are already using `react-xray`, this plugin is included there by default.

## Usage

```tsx
import { XRay } from '@react-xray/core'
import { CopyToClipboardPlugin } from '@react-xray/plugin-copy-to-clipboard'

import App from './App'

export function AppWithXray() {
  return (
    <>
      <App />
      <XRay
        root={import.meta.env.VITE_ROOT}
        plugins={[CopyToClipboardPlugin()]}
      />
    </>
  )
}
```

`root` should be the absolute project root passed to XRay so the plugin can resolve relative file paths for comments.

## Copied output

The copied value uses the current project root as the base path and looks like this:

```text
src/components/Button.tsx:42
```
