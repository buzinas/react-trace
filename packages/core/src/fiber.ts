import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping'
import type { EncodedSourceMap } from '@jridgewell/trace-mapping'

import type { ComponentContext, ComponentSource } from './types'

// ---------------------------------------------------------------------------
// Source map resolution
// ---------------------------------------------------------------------------

/**
 * Per-URL cache of TraceMap promises.
 * Each file is fetched at most once per page load — subsequent calls are instant
 * cache hits. The cache is intentionally not invalidated on HMR because the
 * compiled line numbers in the new _debugStack will also change, so the next
 * hover naturally uses fresh positions against the new source map.
 */
const traceMapCache = new Map<string, Promise<TraceMap | null>>()

function loadTraceMap(fileUrl: string): Promise<TraceMap | null> {
  const cached = traceMapCache.get(fileUrl)
  if (cached !== undefined) return cached

  const promise = (async (): Promise<TraceMap | null> => {
    try {
      const res = await fetch(fileUrl)
      if (!res.ok) return null
      const code = await res.text()

      // Inline source map: //# sourceMappingURL=data:application/json;base64,...
      const inlineMatch = code.match(
        /\/\/# sourceMappingURL=data:application\/json;(?:charset=[^;]+;)?base64,([A-Za-z0-9+/=]+)/,
      )
      if (inlineMatch) {
        const json = JSON.parse(atob(inlineMatch[1]!)) as EncodedSourceMap
        // Pass fileUrl as the base so relative `sources` paths are resolved
        return new TraceMap(json, fileUrl)
      }

      // External source map: //# sourceMappingURL=App.tsx.map
      const externalMatch = code.match(/\/\/# sourceMappingURL=([^\s]+)/)
      if (externalMatch && !externalMatch[1]!.startsWith('data:')) {
        const mapUrl = new URL(externalMatch[1]!, fileUrl).href
        const mapRes = await fetch(mapUrl)
        if (!mapRes.ok) return null
        return new TraceMap((await mapRes.json()) as EncodedSourceMap, mapUrl)
      }

      return null
    } catch {
      return null
    }
  })()

  traceMapCache.set(fileUrl, promise)
  return promise
}

/**
 * Resolves compiled positions (post-Babel/esbuild) back to original TypeScript
 * source positions by fetching and applying the inline source map.
 *
 * - Only runs for URL-form fileNames (Vite dev mode serves files as URLs)
 * - Results are cached per file URL — each file is fetched at most once
 * - Returns the original source unchanged on any error
 *
 * Designed to be called *after* the synchronous context is already rendered,
 * so the UI updates the line number once the source map resolves (usually <50ms
 * after the first hover on a given file, instant on subsequent hovers).
 */
export async function resolveSource(
  source: ComponentSource,
): Promise<ComponentSource> {
  // Only attempt resolution for URL-form fileNames
  try {
    new URL(source.fileName)
  } catch {
    return source
  }

  const traceMap = await loadTraceMap(source.fileName)
  if (!traceMap) return source

  // trace-mapping: line is 1-based, column is 0-based
  const original = originalPositionFor(traceMap, {
    line: source.lineNumber,
    column: source.columnNumber - 1,
  })

  if (original.source == null || original.line == null) return source

  return {
    fileName: original.source,
    lineNumber: original.line,
    columnNumber: original.column != null ? original.column + 1 : 1,
  }
}

// Fiber tags for React component types (React 19)
// 0=FunctionComponent, 1=ClassComponent, 11=ForwardRef, 14=MemoComponent, 15=SimpleMemoComponent
const COMPONENT_TAGS = new Set([0, 1, 11, 14, 15])

interface ReactFiber {
  tag: number
  type: ComponentType
  memoizedProps: Record<string, unknown>
  /** React 19: Error object captured at JSX creation time, stack contains the callsite */
  _debugStack: Error | null
  /** React 18: structured source object injected by Babel/SWC's JSX source transform */
  _debugSource: ComponentSource | null
  _debugOwner: ReactFiber | null
  return: ReactFiber | null
}

type ComponentType =
  | string
  | null
  | {
      displayName?: string
      name?: string
      render?: { name?: string }
    }

/**
 * Finds the React fiber attached to a DOM element.
 * React attaches it as __reactFiber$<randomKey> in development mode.
 */
function findFiber(element: Element): ReactFiber | null {
  const key = Object.keys(element).find((k) => k.startsWith('__reactFiber$'))
  return key
    ? ((element as unknown as Record<string, unknown>)[key] as ReactFiber)
    : null
}

function getDisplayName(type: ComponentType): string {
  if (!type || typeof type === 'string') return 'Unknown'
  return (
    (type as { displayName?: string }).displayName ??
    (type as { name?: string }).name ??
    (type as { render?: { name?: string } }).render?.name ??
    'Anonymous'
  )
}

/**
 * Parses the component definition source location from a React fiber's _debugStack.
 *
 * In React 19, _debugStack is an Error object captured at JSX creation time.
 * For a DOM fiber (e.g. <button> inside Button.tsx), the stack contains
 * Button.tsx as the first non-React frame — which is the component's definition file.
 *
 * The fileName may be a full URL in Vite dev mode (e.g. "http://localhost:5173/src/Button.tsx").
 * URL → absolute path normalization is deferred to the FileSystemService.
 */
function parseComponentSource(
  debugStack: Error | null,
): ComponentSource | null {
  if (!debugStack?.stack) return null

  let stack = debugStack.stack

  // Strip React's sentinel prefix ("Error: react-stack-top-frame\n...")
  if (stack.startsWith('Error: react-stack-top-frame\n')) {
    stack = stack.slice(stack.indexOf('\n') + 1)
  } else if (stack.startsWith('Error\n')) {
    stack = stack.slice('Error\n'.length)
  }

  // Strip the first frame — it's always a React jsx-runtime internal
  const firstNewline = stack.indexOf('\n')
  if (firstNewline !== -1) {
    stack = stack.slice(firstNewline + 1)
  }

  for (const line of stack.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || !trimmed.startsWith('at ')) continue

    // Skip React internals and anything from node_modules
    if (
      trimmed.includes('node_modules') ||
      trimmed.includes('react-jsx') ||
      trimmed.includes('react-dom') ||
      trimmed.includes('react-stack-bottom-frame') ||
      trimmed.includes('(@fs') // Vite internal prefix
    )
      continue

    // Match: at ComponentName (filePath:line:col)
    // Also handles URLs: at Button (http://localhost:5173/src/Button.tsx:10:5)
    const match = trimmed.match(/\((.+):(\d+):(\d+)\)$/)
    if (match) {
      return {
        fileName: match[1]!,
        lineNumber: parseInt(match[2]!, 10),
        columnNumber: parseInt(match[3]!, 10),
      }
    }
  }

  return null
}

/**
 * Extracts source location from a fiber, supporting both React versions:
 * - React 19: reads _debugStack (Error object) and parses the stack string
 * - React 18: reads _debugSource (pre-parsed object from Babel/SWC JSX transform)
 *
 * React 18 paths are absolute filesystem paths (/abs/path/to/File.tsx) so
 * resolveSource() will no-op on them — they're already at original positions.
 */
function getSource(fiber: ReactFiber | null): ComponentSource | null {
  if (!fiber) return null
  if (fiber._debugStack) return parseComponentSource(fiber._debugStack)
  if (fiber._debugSource) return fiber._debugSource
  return null
}

/**
 * Returns true when the element's visible text content matches a string prop
 * on the component fiber — indicating the text came from outside the component
 * (a prop passed by a parent) rather than being written in the component itself.
 *
 * When true, we use the component fiber's source (the callsite in the parent)
 * rather than the DOM element fiber's source (the element definition in the
 * component template).
 *
 * Examples:
 *   <Card title="About" />  →  "About" matches `title` prop  →  show App.tsx
 *   <Header />              →  no string props               →  show Header.tsx
 */
function isContentFromProps(
  element: HTMLElement,
  componentFiber: ReactFiber,
): boolean {
  const text = element.textContent?.trim()
  if (!text) return false
  const props = componentFiber.memoizedProps as Record<string, unknown>
  return Object.values(props).some(
    (v) => typeof v === 'string' && v.trim() === text,
  )
}

/**
 * Returns the DOM text node under the given viewport coordinates, or null if
 * the cursor is over an element rather than a text node.
 *
 * Uses the standard `caretPositionFromPoint` API (Chrome 128+, Firefox, Safari 17.4+),
 * with `caretRangeFromPoint` as a fallback for older browsers.
 */
function getTextNodeAtPoint(x: number, y: number): Text | null {
  // Standard (replaces the deprecated caretRangeFromPoint)
  if (typeof document.caretPositionFromPoint === 'function') {
    const pos = document.caretPositionFromPoint(x, y)
    if (pos?.offsetNode.nodeType === Node.TEXT_NODE) {
      return pos.offsetNode as Text
    }
    return null
  }
  // Fallback for browsers without caretPositionFromPoint
  if (typeof document.caretRangeFromPoint === 'function') {
    const range = document.caretRangeFromPoint(x, y)
    if (range?.startContainer.nodeType === Node.TEXT_NODE) {
      return range.startContainer as Text
    }
  }
  return null
}

/**
 * Given a DOM element, returns the ComponentContext describing the nearest
 * React component that rendered it — including display name, breadcrumb path,
 * source location (definition file), and current props.
 *
 * Pass `point` (mouse coordinates) to enable text-node detection: when the
 * cursor is over a bare text node, `caretPositionFromPoint` gives its direct
 * parent element, which is more specific than the DOM event target that bubbles
 * up to the nearest element ancestor.
 *
 * Note on text source accuracy: React's HostText fibers (tag=6) have
 * _debugStack = null — source location is only stored on element fibers.
 * So the location shown is always where the *containing element* was written
 * (e.g. Card.tsx:11 for `<h3>{title}</h3>`), not where the text value was
 * defined. Resolving the value's origin (prop, const, literal) requires
 * AST-level analysis and is handled by the inline-editing plugin, not here.
 *
 * Returns null if:
 * - React is not present / not in dev mode
 * - The element is not part of a React tree
 * - No component fiber is found in the ancestor chain
 */
export function getComponentContext(
  element: HTMLElement,
): ComponentContext | null {
  const domFiber = findFiber(element)
  if (!domFiber) return null

  // Walk up the fiber return chain, collecting host tag names along the way.
  // Stop at (and include) the first React component fiber.
  // e.g. hovering <code> inside <p> inside <Card>:
  //   raw  → ['code', 'p', 'Card']
  //   display → ['Card', 'p', 'code']
  const parts: Array<{ source: ComponentSource | null; names: string[] }> = []
  let fiber: ReactFiber | null = domFiber
  let i = 0

  while (fiber) {
    if (!parts[i]) {
      parts[i] = { source: getSource(fiber), names: [] }
    }

    if (fiber.tag === 5 && typeof fiber.type === 'string') {
      // Host element (div, p, code, …)
      parts[i]!.names.push(fiber.type)
    } else if (COMPONENT_TAGS.has(fiber.tag)) {
      const name = getDisplayName(fiber.type)
      if (name !== 'Unknown' && name !== 'Anonymous') {
        parts[i]!.names.push(name)
      }
      i++
    }
    fiber = fiber.return
  }

  // Decide which fiber's source to use:
  // - If the element's text content matches a string prop on the component, the text
  //   came from outside (a prop) → use the component fiber's source (callsite in parent)
  // - Otherwise the content is self-contained → use the DOM element fiber's source
  //   (where the element is written inside the component's own template)
  const useCallsite = fiber != null && isContentFromProps(element, fiber)
  const source = getSource(useCallsite ? fiber : domFiber)

  // parts: [hovered, …ancestors, Component] — reverse for display order
  const all = parts.map((part) => ({
    source: part.source,
    names: part.names.reverse(),
  }))

  // If there are too many intermediate nodes, keep the component name (first)
  // and the MAX_BREADCRUMB-1 items closest to the hovered element (last).
  const breadcrumb = parts[0]!.names

  const displayName = breadcrumb[0] ?? 'Unknown'

  return {
    element,
    displayName,
    breadcrumb,
    source,
    all,
    props: domFiber.memoizedProps ?? {},
  }
}
