import type { ComponentType } from 'react'

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
  all: Array<{ source: ComponentSource | null; names: string[] }>
  /** Location of the component's definition. fileName may be a URL in Vite dev mode. */
  source: ComponentSource | null
  props: Record<string, unknown>
}

export interface FileSystemService {
  /** Whether the File System Access API is available in this browser */
  isSupported: boolean
  /** Whether the user has already granted directory access */
  hasAccess: boolean
  /**
   * Silently try to restore a previously granted directory handle from
   * IndexedDB and re-request permission. Resolves true if successful.
   * Call this on app mount to avoid prompting on every reload.
   */
  tryRestore(): Promise<boolean>
  /**
   * Prompt the user to pick the project root directory via showDirectoryPicker().
   * The handle is persisted in IndexedDB for future sessions.
   */
  requestAccess(): Promise<boolean>
  /**
   * Subscribe to hasAccess changes (e.g. after requestAccess / tryRestore).
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void
  /**
   * Read a file by its path (absolute filesystem path or Vite dev URL).
   * If no access has been granted yet, triggers requestAccess() first.
   */
  read(path: string): Promise<string>
  /**
   * Write content to a file. Triggers requestAccess() if needed.
   * Written files trigger HMR automatically in the dev server.
   */
  write(path: string, content: string): Promise<void>
}

export interface XRayServices {
  fs: FileSystemService
}

export interface XRayPlugin {
  name: string
  /**
   * Component to render inside the widget's toolbar.
   */
  toolbar?: ComponentType
  /**
   * Component to render inside the action panel when a context is selected in the inspector.
   */
  actionPanel?: ComponentType
  /**
   * Component to render inside the settings dropdown.
   */
  settings?: ComponentType
}

type WidgetPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface XRayProps {
  /**
   * Absolute path to the project root, forwarded to all plugins
   */
  root: string
  plugins?: XRayPlugin[]
  position?: WidgetPosition
}

export interface XRaySettings {
  core: {
    position: WidgetPosition
  }
}
