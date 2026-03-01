/**
 * Production stub for @react-xray/ui-components.
 *
 * All React components render null — zero runtime cost in production.
 * panelPopupStyle is an empty object; nothing renders to apply styles to.
 */
import type { CSSProperties, ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------
export const panelPopupStyle: CSSProperties = {}

// ---------------------------------------------------------------------------
// Kbd
// ---------------------------------------------------------------------------
export const Kbd = () => null
export const KbdGroup = () => null

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------
export const Tooltip = () => null

// ---------------------------------------------------------------------------
// Button primitives
// ---------------------------------------------------------------------------
export const Button = () => null
export const IconButton = () => null
export const PanelHeader = () => null

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Popover namespace
// ---------------------------------------------------------------------------
export const Popover = {
  Root: ({ children }: { children?: ReactNode }) => children,
  Trigger: () => null,
  Portal: () => null,
  Positioner: () => null,
  Close: () => null,
  Popup: () => null,
}

// ---------------------------------------------------------------------------
// DropdownMenu namespace
// ---------------------------------------------------------------------------
export const DropdownMenu = {
  Root: ({ children }: { children?: ReactNode }) => children,
  Trigger: () => null,
  Portal: () => null,
  Positioner: () => null,
  Popup: () => null,
  Item: () => null,
  Separator: () => null,
}
