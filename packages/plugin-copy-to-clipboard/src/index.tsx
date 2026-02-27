import { resolveSource } from '@react-xray/core'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'

export interface CopyToClipboardPluginOptions {
  /**
   * Absolute path to the project root, used to convert absolute filesystem
   * paths (React 18 / _debugSource) to relative paths.
   * Not needed for Vite dev URLs — the relative path is extracted from the URL.
   */
  root?: string
}

/**
 * Converts a resolved source fileName to a path relative to the project root.
 *
 *   Vite URL  http://localhost:5173/src/App.tsx  →  src/App.tsx
 *   /@fs/ URL http://localhost:5173/@fs/abs/path →  abs/path  (or relative if root given)
 *   Abs path  /Users/you/project/src/App.tsx     →  src/App.tsx  (root required)
 */
function toRelativePath(fileName: string, root?: string): string {
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

function ClipboardIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="1"
        width="8"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4 3H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CopyToClipboardPlugin(
  options: CopyToClipboardPluginOptions = {},
): RVEPlugin {
  const { root } = options

  return {
    name: 'copy-to-clipboard',
    actions(_ctx: ComponentContext, _services: RVEServices) {
      const ctx = _ctx
      if (!ctx.source) return []

      return [
        {
          id: 'copy-to-clipboard',
          label: 'Copy path',
          icon: <ClipboardIcon />,
          onClick(ctx: ComponentContext) {
            resolveSource(ctx.source!).then((resolved) => {
              const path = toRelativePath(resolved.fileName, root)
              navigator.clipboard.writeText(`${path}:${resolved.lineNumber}`)
            })
          },
        },
      ]
    },
  }
}
