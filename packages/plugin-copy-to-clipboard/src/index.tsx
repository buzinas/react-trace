import { resolveSource, toRelativePath } from '@react-xray/core'
import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'
import { ClipboardIcon } from '@react-xray/ui-components'

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
