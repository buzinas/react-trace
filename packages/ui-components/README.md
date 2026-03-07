# @react-xray/ui-components

Shared UI primitives for the React XRay package ecosystem.

Use this package when building a plugin. These components match the widget's existing look and feel, especially toolbar controls, action-panel controls, overlays, and small layout helpers.

## Stable exports across current entrypoints

These are the symbols currently present in both `src/index.tsx` and the production stub surface (`src/index.prod.ts` / `dist/index.prod.d.ts`).

### Action and input primitives

- `Button`
- `IconButton`
- `ToolbarButton`
- `Textarea`

### Layout and small helpers

- `PanelHeader`
- `Separator`
- `Kbd`, `KbdGroup`

### Overlay and selection primitives

- `Tooltip`
- `Popover`
- `DropdownMenu`
- `Select`
- `Combobox`
- `panelPopupStyle`

### Icons

- `ChatBubbleIcon`
- `ChevronRightIcon`
- `ClipboardIcon`
- `CollapseIcon`
- `ExpandIcon`
- `FolderIcon`
- `OpencodeIcon`
- `OpenInEditorIcon`
- `SaveIcon`
- `SettingsIcon`
- `TrashIcon`
- `XIcon`

## Intended usage for package authors

- Prefer these primitives over package-local replacements when you need standard buttons, headers, menus, selects, or text inputs.
- Keep styling inline. These components are designed to be extended with `style` props and the shared inline-style approach used throughout this repo.
- For portal-based UI inside the XRay widget, render into the widget portal container instead of `document.body`. In practice, package authors typically pair this package with `useWidgetPortalContainer()` from `@react-xray/core`.
- Keep examples and public imports limited to the shared surface available across the package's current conditional entrypoints.

## Example

```tsx
import { useWidgetPortalContainer } from '@react-xray/core'
import {
  Button,
  IconButton,
  OpenInEditorIcon,
  PanelHeader,
  Tooltip,
} from '@react-xray/ui-components'

export function ExamplePanel() {
  const portalContainer = useWidgetPortalContainer()

  return (
    <div>
      <PanelHeader
        title="Preview"
        actionsRender={
          <Tooltip label="Open in editor" container={portalContainer}>
            <IconButton aria-label="Open in editor">
              <OpenInEditorIcon size={14} />
            </IconButton>
          </Tooltip>
        }
      />

      <Button variant="secondary">Refresh</Button>
    </div>
  )
}
```
