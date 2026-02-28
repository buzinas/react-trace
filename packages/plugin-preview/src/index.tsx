import type { ComponentContext, RVEPlugin, RVEServices } from '@react-xray/core'

import { SourcePreview } from './SourcePreview'

export interface PreviewPluginOptions {
  /** Allow editing. Shows Save (⌘S) + Expand buttons. Saves via FileSystemService. @default false */
  editable?: boolean
  /** Shiki theme ID. @default 'one-dark-pro' — any https://shiki.style/themes value works. */
  theme?: string
}

export function PreviewPlugin(options: PreviewPluginOptions = {}): RVEPlugin {
  const { editable = false, theme = 'one-dark-pro' } = options

  function BoundSourcePreview({
    ctx,
    services,
  }: {
    ctx: ComponentContext
    services: RVEServices
  }) {
    return (
      <SourcePreview
        ctx={ctx}
        services={services}
        editable={editable}
        theme={theme}
      />
    )
  }

  return { name: 'preview', subpanel: BoundSourcePreview }
}
