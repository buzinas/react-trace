import type { Monaco } from '@monaco-editor/react'
import { toRelativePath } from '@react-xray/core'
import type { Uri } from 'monaco-types'

export function cleanPath(fileName: string): string {
  return fileName.split('?')[0]!
}

export function detectLanguage(fileName: string): string {
  const ext = cleanPath(fileName).split('.').pop()?.toLowerCase() ?? ''
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

/** Last two path segments — used in the toolbar label. */
export function shortName(fileName: string): string {
  return toRelativePath(fileName).split('/').slice(-2).join('/')
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
