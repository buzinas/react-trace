export interface FileSystemService {
  /** Whether the File System Access API is available in this browser */
  isSupported: boolean
  /** Whether the user has already granted directory access */
  hasAccess: boolean
  /**
   * Silently try to restore a previously granted directory handle from
   * IndexedDB and re-request permission. Resolves true if successful.
   * Call this on app mount to avoid prompting on every reload.
   */
  tryRestore(): Promise<boolean>
  /**
   * Prompt the user to pick the project root directory via showDirectoryPicker().
   * The handle is persisted in IndexedDB for future sessions.
   */
  requestAccess(): Promise<boolean>
  /**
   * Subscribe to hasAccess changes (e.g. after requestAccess / tryRestore).
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void
  /**
   * Read a file by its relative path (relative to the granted directory).
   * If no access has been granted yet, triggers requestAccess() first.
   */
  read(relativePath: string): Promise<string>
  /**
   * Write content to a file by its relative path. Triggers requestAccess() if needed.
   * Written files trigger HMR automatically in the dev server.
   */
  write(relativePath: string, content: string): Promise<void>
}

/**
 * Why the File System Access API can't be used, when it can't:
 * - `insecure-context`: `showDirectoryPicker` is only exposed in secure
 *   contexts (localhost or HTTPS). This is the common WSL case, where the dev
 *   server is reached via the VM's IP address (e.g. http://172.x.x.x:3000)
 *   rather than http://localhost — see issue #8.
 * - `unsupported-browser`: a non-Chromium browser (Firefox, Safari) that
 *   doesn't implement the File System Access API at all.
 */
export type FileSystemSupport =
  | { supported: true }
  | { supported: false; reason: 'insecure-context' | 'unsupported-browser' }

export function getFileSystemSupport(): FileSystemSupport {
  if (typeof window === 'undefined')
    return { supported: false, reason: 'unsupported-browser' }
  // Read before the `in` check below: lib.dom types `showDirectoryPicker` as
  // always-present, so that narrowing collapses `window` to `never` and any
  // later `window.*` access stops type-checking.
  const secureContext = window.isSecureContext
  if ('showDirectoryPicker' in window) return { supported: true }
  // The API is missing. In an insecure context it's stripped from `window`
  // even on Chromium, so treat that as the more actionable reason.
  if (!secureContext)
    return { supported: false, reason: 'insecure-context' }
  return { supported: false, reason: 'unsupported-browser' }
}

const IDB_NAME = 'react-trace'
const IDB_STORE = 'handles'
const IDB_KEY = 'root-directory'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function loadHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly')
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY)
      req.onsuccess = () =>
        resolve((req.result as FileSystemDirectoryHandle) ?? null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

/**
 * Traverses the directory handle tree to reach the target file.
 * Returns null if any segment of the path doesn't exist.
 */
async function getFileHandle(
  dir: FileSystemDirectoryHandle,
  relativePath: string,
  create = false,
): Promise<FileSystemFileHandle | null> {
  const parts = relativePath.split('/').filter(Boolean)
  if (parts.length === 0) return null

  let current: FileSystemDirectoryHandle = dir

  for (let i = 0; i < parts.length - 1; i++) {
    try {
      current = await current.getDirectoryHandle(parts[i]!, { create })
    } catch {
      return null
    }
  }

  try {
    return await current.getFileHandle(parts.at(-1)!, { create })
  } catch {
    return null
  }
}

class FileSystemServiceImpl implements FileSystemService {
  private _handle: FileSystemDirectoryHandle | null = null
  private _listeners = new Set<() => void>()

  get isSupported(): boolean {
    return getFileSystemSupport().supported
  }

  get hasAccess(): boolean {
    return this._handle !== null
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener)
    return () => this._listeners.delete(listener)
  }

  private notify(): void {
    this._listeners.forEach((l) => l())
  }

  async tryRestore(): Promise<boolean> {
    if (!this.isSupported) return false
    try {
      const handle = await loadHandle()
      if (!handle) return false
      const perm = await handle.requestPermission({ mode: 'readwrite' })
      if (perm === 'granted') {
        this._handle = handle
        this.notify()
        return true
      }
    } catch {
      // handle gone or permission denied — fall through
    }
    return false
  }

  async requestAccess(): Promise<boolean> {
    if (!this.isSupported) return false
    try {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
      await saveHandle(handle)
      this._handle = handle
      this.notify()
      return true
    } catch {
      // User cancelled the picker
      return false
    }
  }

  /** Ensure we have access — try restore silently first, then prompt. */
  private async ensureAccess(): Promise<boolean> {
    if (this._handle) return true
    const restored = await this.tryRestore()
    if (restored) return true
    return this.requestAccess()
  }

  async read(relativePath: string): Promise<string> {
    const ok = await this.ensureAccess()
    if (!ok || !this._handle)
      throw new Error('[react-trace] File system access denied')

    const file = await getFileHandle(this._handle, relativePath)
    if (!file) throw new Error(`[react-trace] File not found: ${relativePath}`)

    return (await file.getFile()).text()
  }

  async write(relativePath: string, content: string): Promise<void> {
    const ok = await this.ensureAccess()
    if (!ok || !this._handle)
      throw new Error('[react-trace] File system access denied')

    const file = await getFileHandle(this._handle, relativePath, true)
    if (!file)
      throw new Error(
        `[react-trace] Cannot open file for writing: ${relativePath}`,
      )

    const writable = await file.createWritable()
    await writable.write(content)
    await writable.close()
  }
}

export const fileSystemService: FileSystemService = new FileSystemServiceImpl()
