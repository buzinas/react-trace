import type { FileSystemService } from './types'

/**
 * FileSystemService stub.
 *
 * The real implementation (using the File System Access API / showDirectoryPicker)
 * will be added when the first file-editing plugin (inline-text, file-viewer) is built.
 *
 * Plugins can import this service via RVEServices and type-check against the interface today.
 * Calling read/write will throw with a clear message until the implementation lands.
 */
export const fileSystemService: FileSystemService = {
  isSupported: typeof window !== 'undefined' && 'showDirectoryPicker' in window,
  hasAccess: false,
  requestAccess: () => {
    throw new Error(
      '[react-xray] FileSystemService is not yet implemented. ' +
        'It will be added alongside the first file-editing plugin.',
    )
  },
  read: () => {
    throw new Error(
      '[react-xray] FileSystemService is not yet implemented. ' +
        'It will be added alongside the first file-editing plugin.',
    )
  },
  write: () => {
    throw new Error(
      '[react-xray] FileSystemService is not yet implemented. ' +
        'It will be added alongside the first file-editing plugin.',
    )
  },
}
