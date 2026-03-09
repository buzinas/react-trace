import type { Monaco } from '@monaco-editor/react'
import type { Uri } from 'monaco-types'

export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
  }
  return map[ext] ?? 'plaintext'
}

/** Convert a file path (URL or absolute) to a monaco file:// URI. */
export function pathToUri(monaco: Monaco, path: string): Uri {
  try {
    const { pathname } = new URL(path)
    return monaco.Uri.parse(`file://${pathname}`)
  } catch {
    const normalized = path.replace(/\\/g, '/')
    return monaco.Uri.parse(
      normalized.startsWith('/')
        ? `file://${normalized}`
        : `file:///${normalized}`,
    )
  }
}
