/**
 * Converts a resolved source fileName to a path relative to the project root.
 *
 *   Vite URL  http://localhost:5173/src/App.tsx  →  src/App.tsx
 *   /@fs/ URL http://localhost:5173/@fs/abs/path →  abs/path  (or relative if root given)
 *   Abs path  /Users/you/project/src/App.tsx     →  src/App.tsx  (root required)
 */
export function toRelativePath(fileName: string, root?: string): string {
  const clean = fileName.split('?')[0]!

  try {
    const { pathname } = new URL(clean)

    if (pathname.startsWith('/@fs/')) {
      const absPath = pathname.slice('/@fs'.length)
      if (root) {
        const normalizedRoot = root.replace(/\\/g, '/').replace(/\/$/, '')
        if (absPath.startsWith(normalizedRoot + '/')) {
          return absPath.slice(normalizedRoot.length + 1)
        }
      }
      return absPath
    }

    return pathname.replace(/^\//, '')
  } catch {
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
 * Formats a comment as a compact `file:line: comment` string.
 * Used for both copy-to-clipboard and the synthetic text part sent to OpenCode.
 */
export function formatCommentNote(
  filePath: string,
  lineNumber: number,
  comment: string,
): string {
  return `${filePath}:${lineNumber}: ${comment}`
}
