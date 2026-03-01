import type { ComponentType, ReactNode } from 'react'

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

export interface RVEServices {
  fs: FileSystemService
  /** Absolute path to the project root — passed via <XRay root="..." /> */
  root?: string
}

/**
 * Legacy compatibility toolbar button. Prefer `RVEPlugin.toolbar`.
 */
export interface ToolbarItem {
  id: string
  /** ReactNode, or a render function that receives services for reactive icons */
  icon: ReactNode | ((services: RVEServices) => ReactNode)
  /** ReactNode, or a render function that receives services for reactive labels */
  label: ReactNode | ((services: RVEServices) => ReactNode)
  /** Plain-text label used for aria-label. Falls back to id. */
  ariaLabel?: string
  isActive?: (ctx: ComponentContext | null) => boolean
  onClick(ctx: ComponentContext | null, services: RVEServices): void
}

/**
 * Legacy compatibility action row. Prefer `RVEPlugin.actionPanel`.
 */
export interface Action {
  id: string
  label: string
  icon?: ReactNode
  onClick(
    ctx: ComponentContext,
    services: RVEServices,
  ): boolean | void | Promise<boolean | void>
}

export interface RVEPlugin {
  name: string
  /**
   * Wave 2 primary path: plugin-owned toolbar UI rendered directly inside the
   * core toolbar. Components should read shared state through the public hooks.
   */
  toolbar?: ComponentType
  /**
   * Wave 2 primary path: plugin-owned UI rendered directly inside each action
   * panel entry submenu. Direct renderers receive no per-entry props; read
   * shared state through the public hooks instead. Use `useSelectedSource()`
   * for the current row's source, plus shared hooks such as
   * `useSelectedContext()` and `useWidgetServices()` for widget-wide state.
   */
  actionPanel?: ComponentType
  /** @deprecated Narrow compatibility bridge for pre-Wave 2 toolbar plugins. */
  toolbarItems?: ToolbarItem[]
  /** @deprecated Narrow compatibility bridge for pre-Wave 2 action rows. */
  actions?: (ctx: ComponentContext, services: RVEServices) => Action[]
  /**
   * @deprecated Narrow compatibility bridge for pre-Wave 2 inline action-panel UI.
   * Prefer `actionPanel`, which is prop-less and reads shared state via hooks.
   *
   * An optional React component rendered inside the entry submenu popup,
   * above the action buttons. Receives the per-entry ctx (ctx.source is the
   * specific entry's source, not the top-level one). Must be a component type
   * (not a function returning ReactNode) so it can use hooks.
   */
  subpanel?: ComponentType<{ ctx: ComponentContext; services: RVEServices }>
}

export interface XRayProps {
  /**
   * Absolute path to the project root, forwarded to all plugins
   */
  root: string
  plugins?: RVEPlugin[]
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}
