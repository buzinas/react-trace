import { resolveSource, toRelativePath } from '@react-xray/core'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'

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

export function CopyToClipboardPlugin(): RVEPlugin {
  return {
    name: 'copy-to-clipboard',
    actions(_ctx: ComponentContext, services: RVEServices) {
      const ctx = _ctx
      if (!ctx.source) return []
      const root = services.root

      return [
        {
          id: 'copy-to-clipboard',
          label: 'Copy path',
          icon: <ClipboardIcon />,
          onClick(ctx: ComponentContext) {
            resolveSource(ctx.source!)
              .then((resolved) => {
                const path = toRelativePath(resolved.fileName, root)
                navigator.clipboard.writeText(`${path}:${resolved.lineNumber}`)
              })
              .catch(() => {})
          },
        },
      ]
    },
  }
}
