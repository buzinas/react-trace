/**
 * Production stub for @react-trace/plugin-preview.
 * Returns a no-op plugin object — Trace itself renders null in production
 * so the plugin is never used, but the import must resolve to a valid shape.
 */
export const PreviewPlugin = () => ({ name: 'preview' as const })

export type { PreviewPluginOptions } from './types'
