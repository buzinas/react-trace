import type { ReactNode } from 'react'

export interface ComponentSource {
  fileName: string
  lineNumber: number
  columnNumber: number
}

export interface ComponentContext {
  element: HTMLElement
  displayName: string
  /** e.g. ['Card', 'p', 'code'] — nearest React component down to the hovered DOM element */
  breadcrumb: string[]
  /** Location of the component's definition. fileName may be a URL in Vite dev mode. */
  source: ComponentSource | null
  props: Record<string, unknown>
}

export interface FileSystemService {
  /** Whether the File System Access API is available in this browser */
  isSupported: boolean
  /** Whether the user has already granted directory access */
  hasAccess: boolean
  /** Prompt the user to pick the project root directory */
  requestAccess(): Promise<boolean>
  read(absolutePath: string): Promise<string>
  write(absolutePath: string, content: string): Promise<void>
}

export interface RVEServices {
  fs: FileSystemService
}

export interface ToolbarItem {
  id: string
  icon: ReactNode
  label: string
  isActive?: (ctx: ComponentContext | null) => boolean
  onClick(ctx: ComponentContext | null, services: RVEServices): void
}

export interface Action {
  id: string
  label: string
  icon?: ReactNode
  onClick(ctx: ComponentContext, services: RVEServices): void
}

export interface RVEPlugin {
  name: string
  toolbarItems?: ToolbarItem[]
  /** Return contextual actions for the currently selected component */
  actions?: (ctx: ComponentContext, services: RVEServices) => Action[]
}

export interface XRayProps {
  plugins?: RVEPlugin[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}
