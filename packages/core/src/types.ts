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

export interface TracePlugin {
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

export interface TraceProps {
  /**
   * Absolute path to the project root, forwarded to all plugins
   */
  root: string
  plugins?: TracePlugin[]
  position?: WidgetPosition
}

export interface TraceSettings {
  core: {
    position: WidgetPosition
  }
}
