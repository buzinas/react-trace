import {
  Clipboard,
  ChevronRight,
  ExternalLink,
  Folder,
  Maximize2,
  MessageSquare,
  Minimize2,
  Save,
  Settings,
  Trash2,
  X,
} from 'lucide-react'

const DEFAULT_STROKE_WIDTH = 2
const DEFAULT_SIZE = 16

export function SettingsIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return <Settings size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
}

export function ClipboardIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return (
    <Clipboard size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
  )
}

export function XIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return <X size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
}

export function ChevronRightIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return (
    <ChevronRight size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
  )
}

export function OpenInEditorIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return (
    <ExternalLink size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
  )
}

export function ChatBubbleIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return (
    <MessageSquare size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
  )
}

export function TrashIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return <Trash2 size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
}

export function SaveIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return <Save size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
}

export function ExpandIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return (
    <Maximize2 size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
  )
}

export function CollapseIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return (
    <Minimize2 size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
  )
}

export function FolderIcon({ size = DEFAULT_SIZE }: { size?: number }) {
  return <Folder size={size} strokeWidth={DEFAULT_STROKE_WIDTH} aria-hidden />
}

// OpenCode brand icon — not available in Lucide
export function OpencodeIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path fill="#131010" d="M0 0h512v512H0z" />
      <path d="M320 224v128H192V224h128z" fill="#5A5858" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M384 416H128V96h256v320zm-64-256H192v192h128V160z"
        fill="#fff"
      />
    </svg>
  )
}
