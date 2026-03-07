/**
 * Production stub for @react-xray/plugin-preview.
 * Returns a no-op plugin object — XRay itself renders null in production
 * so the plugin is never used, but the import must resolve to a valid shape.
 */
export const PreviewPlugin = () => ({ name: 'preview' as const })

export type { PreviewPluginOptions } from './types'
