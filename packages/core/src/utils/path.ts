/**
 * Shared path utilities for converting Vite dev URLs and absolute filesystem
 * paths into relative or absolute forms needed by plugins.
 *
 * Handles all three fileName conventions react-trace encounters:
 *   - Vite dev URL        http://localhost:5173/src/App.tsx
 *   - Vite /@fs/ URL      http://localhost:5173/@fs/abs/path/src/App.tsx
 *   - Absolute path       /Users/you/project/src/App.tsx  (React 18 _debugSource)
 */

/**
 * Converts a source fileName to a path relative to the project root.
 *
 *   Vite URL    http://localhost:5173/src/App.tsx         → src/App.tsx
 *   /@fs/ URL   http://localhost:5173/@fs/abs/root/src/…  → src/App.tsx  (root required)
 *   Abs URL     http://localhost:5173//abs/root/src/…     → src/App.tsx  (root required)
 *   Abs path    /Users/you/project/src/App.tsx            → src/App.tsx  (root required)
 */
export function toRelativePath(fileName: string, root?: string): string {
  const clean = fileName.split('?')[0]!

  try {
    const { pathname } = new URL(clean)

    if (pathname.startsWith('/@fs/') || pathname.startsWith('/Users/')) {
      const absPath = pathname.startsWith('/@fs/')
        ? pathname.slice('/@fs'.length)
        : pathname
      if (root) {
        const normalizedRoot = root.replace(/\\/g, '/').replace(/\/$/, '')
        if (absPath.startsWith(normalizedRoot + '/')) {
          return absPath.slice(normalizedRoot.length + 1)
        }
      }
      return absPath
    }

    // Regular Vite dev URL — pathname is already relative to the project root
    return pathname.replace(/^\//, '')
  } catch {
    // Absolute filesystem path from _debugSource (React 18)
    const normalized = clean.replace(/\\/g, '/')
    if (root) {
      const normalizedRoot = root.replace(/\\/g, '/').replace(/\/$/, '')
      if (normalized.startsWith(normalizedRoot + '/')) {
        return normalized.slice(normalizedRoot.length + 1)
      }
    }
    return normalized
  }
}

/**
 * Converts a source fileName to an absolute filesystem path.
 * Used by plugins that build editor URL schemes (vscode://, cursor://, etc.)
 *
 *   Vite /@fs/ URL   → strip /@fs prefix → /abs/path/src/App.tsx
 *   Vite URL         → prepend root if provided → /project/src/App.tsx
 *   Abs URL          → strip host → /abs/root/src/App.tsx
 *   Abs path         → used as-is
 *
 * Returns null if the path is empty or cannot be resolved.
 */
export function toAbsolutePath(fileName: string, root?: string): string | null {
  const clean = (fileName.split('?')[0] ?? fileName).trim()
  if (!clean) return null

  try {
    const { pathname } = new URL(clean)
    if (pathname.startsWith('/Users/')) return pathname
    // Vite embeds the absolute path after /@fs/
    if (pathname.startsWith('/@fs/')) return pathname.slice('/@fs'.length)
    // Standard Vite URL — resolve against root if provided
    return root ? root.replace(/\/$/, '') + pathname : pathname
  } catch {
    // Not a URL — already an absolute filesystem path (React 18)
    return clean
  }
}
