# @react-xray/plugin-comments

`@react-xray/plugin-comments` adds lightweight review comments to the XRay widget. It plugs into the current `XRayPlugin` API and contributes both a toolbar control and an inspector action-panel entry.

## What it does

- Adds a **Comments** button to the XRay toolbar.
- Shows a badge with the current number of collected comments.
- Adds an **Add comment** action to the inspector action panel for the currently selected element.
- Opens an inline comment editor anchored to the selected element.
- Lets users review, edit, remove, clear comments.

Comments are collected in the plugin's in-memory widget state while XRay is mounted.

Once you're done, you can copy the comments to the clipboard to send to your best AI agent or you can send it directly to an existing session on your Opencode.

## Installation

Install the plugin alongside its peer dependencies:

```bash
pnpm add --dev @react-xray/core @react-xray/ui-components @react-xray/plugin-comments
```

If you are already using `react-xray`, this plugin is included there by default.

## Usage

Register the plugin by calling `CommentsPlugin()` and passing the result to the `plugins` prop on `XRay`.

```tsx
import { XRay } from '@react-xray/core'
import { CommentsPlugin } from '@react-xray/plugin-comments'

import App from './App'

export function AppWithXRay() {
  return (
    <>
      <App />
      <XRay root={import.meta.env.VITE_ROOT} plugins={[CommentsPlugin()]} />
    </>
  )
}
```

`root` should be the absolute project root passed to XRay so the plugin can resolve relative file paths for comments.

## User-visible behavior

### Toolbar

The plugin adds a **Comments** toolbar button with a live count badge. Opening it shows a menu of collected comments.

From this menu, users can:

- review comments grouped as `file:line` entries,
- click a comment to edit its text,
- remove individual comments,
- copy all comments to the clipboard,
- clear the full comment list,
- open the **Send to OpenCode** flow.

If there are no comments yet, the menu prompts the user to inspect an element and choose **Add comment**.

### Action panel

When the inspector has an active selection with source information, the plugin adds an **Add comment** action to the XRay action panel.

Choosing that action:

1. resolves the selected source location,
2. opens a small editor anchored to the selected element,
3. records the comment against the resolved relative file path and line number.

The inline editor supports save/cancel actions and keyboard shortcuts such as `Enter` to submit and `Escape` to cancel.

### OpenCode integration

The toolbar menu includes a **Send to OpenCode** flow for the currently collected comments. Users can choose an existing session or create a new one, optionally add a general message, and send the comments plus related file references to a locally running OpenCode instance.

If OpenCode is not available, the send form shows a connection error instead of sending.

## API

This package currently exports:

- `CommentsPlugin(): XRayPlugin`
- `CommentEntry` (type)

Use the returned plugin object with the current `plugins` array on `XRay`.
