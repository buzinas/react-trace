# @react-trace/plugin-copy-to-clipboard

`@react-trace/plugin-copy-to-clipboard` adds a `Copy path` item to the Trace action panel for selections that have source information.

When you trigger the action, the plugin copies a project-relative `path:lineNumber` reference to the clipboard.

## Install

Install the plugin alongside its peer dependencies:

```bash
pnpm add --dev @react-trace/core @react-trace/ui-components @react-trace/plugin-copy-to-clipboard
```

If you are already using `@react-trace/kit`, this plugin is included there by default.

## Usage

```tsx
import { Trace } from '@react-trace/core'
import { CopyToClipboardPlugin } from '@react-trace/plugin-copy-to-clipboard'

import App from './App'

export function AppWithTrace() {
  return (
    <>
      <App />
      <Trace
        root={import.meta.env.VITE_ROOT}
        plugins={[CopyToClipboardPlugin()]}
      />
    </>
  )
}
```

`root` should be the absolute project root passed to Trace so the plugin can resolve relative file paths for comments.

## Copied output

The copied value uses the current project root as the base path and looks like this:

```text
src/components/Button.tsx:42
```
