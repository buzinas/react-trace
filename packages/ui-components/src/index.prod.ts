/**
 * Production stub for @react-trace/ui-components.
 *
 * All React components render null — zero runtime cost in production.
 * panelPopupStyle is an empty object; nothing renders to apply styles to.
 */
import type { CSSProperties, ReactNode } from 'react'

export const panelPopupStyle: CSSProperties = {}

export const Kbd = () => null
export const KbdGroup = () => null

export const Tooltip = () => null

export const Button = () => null
export const IconButton = () => null
export const ToolbarButton = () => null
export const PanelHeader = () => null
export const Textarea = () => null
export const Separator = () => null

export const ChevronLeftIcon = () => null
export const ClipboardIcon = () => null
export const XIcon = () => null
export const ChevronRightIcon = () => null
export const OpenInEditorIcon = () => null
export const ChatBubbleIcon = () => null
export const TrashIcon = () => null
export const SaveIcon = () => null
export const ExpandIcon = () => null
export const CollapseIcon = () => null
export const FolderIcon = () => null
export const SettingsIcon = () => null
export const OpencodeIcon = () => null

export const Popover = {
  Root: ({ children }: { children?: ReactNode }) => children,
  Trigger: () => null,
  Portal: () => null,
  Positioner: () => null,
  Close: () => null,
  Popup: () => null,
}

export const DropdownMenu = {
  Root: ({ children }: { children?: ReactNode }) => children,
  Trigger: () => null,
  Portal: () => null,
  Positioner: () => null,
  Popup: () => null,
  Item: () => null,
  Separator: () => null,
}

export const Select = {
  Root: ({ children }: { children?: ReactNode }) => children,
  Trigger: () => null,
  Value: () => null,
  Positioner: () => null,
  Portal: () => null,
  Popup: () => null,
  List: () => null,
  Item: () => null,
  ItemText: () => null,
  ItemIndicator: () => null,
  Group: ({ children }: { children?: ReactNode }) => children,
  GroupLabel: () => null,
  Separator: () => null,
}

export const Combobox = {
  Root: ({ children }: { children?: ReactNode }) => children,
  Trigger: () => null,
  Value: () => null,
  Positioner: () => null,
  Popup: () => null,
  List: () => null,
  Empty: () => null,
  Item: () => null,
  Input: () => null,
  ItemIndicator: () => null,
  Group: ({ children }: { children?: ReactNode }) => children,
  GroupLabel: () => null,
  Separator: () => null,
}
