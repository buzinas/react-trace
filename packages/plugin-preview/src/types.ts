import type { BundledTheme } from 'shiki'

export interface PreviewPluginOptions {
  /** Disable editing. @default false */
  disabled?: boolean
  /** Shiki theme ID. @default 'one-dark-pro' — any https://shiki.style/themes value works. */
  theme?: BundledTheme
}
