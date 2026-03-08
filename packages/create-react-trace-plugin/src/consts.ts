import type { FormatOptions } from 'oxfmt'

export const TEMPLATE_SOURCE = 'gh:buzinas/react-trace/plugin-template'

export const USE_LOCAL = process.env['USE_LOCAL'] === 'true'

export const LOCAL_TEMPLATE_PATH = new URL(
  '../../../plugin-template',
  import.meta.url,
).pathname

export const KEBAB_CASE_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/

export const VALID_SLOTS = ['toolbar', 'actionPanel', 'settings'] as const
export type Slot = (typeof VALID_SLOTS)[number]

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export function detectPackageManager(): PackageManager {
  const ua = process.env['npm_config_user_agent'] ?? ''
  if (ua.startsWith('bun')) return 'bun'
  if (ua.startsWith('yarn')) return 'yarn'
  if (ua.startsWith('npm')) return 'npm'
  return 'pnpm'
}

export const OXFMT_OPTIONS: FormatOptions = {
  printWidth: 80,
  singleQuote: true,
  semi: false,
  sortImports: {},
}
