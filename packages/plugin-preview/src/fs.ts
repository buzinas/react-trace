import { toRelativePath } from '@react-trace/core'

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
   * Read a file by its path (absolute filesystem path or Vite dev URL).
   * If no access has been granted yet, triggers requestAccess() first.
   */
  read(root: string, path: string): Promise<string>
  /**
   * Write content to a file. Triggers requestAccess() if needed.
   * Written files trigger HMR automatically in the dev server.
   */
  write(root: string, path: string, content: string): Promise<void>
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
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window
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

  async read(root: string, path: string): Promise<string> {
    const ok = await this.ensureAccess()
    if (!ok || !this._handle)
      throw new Error('[react-trace] File system access denied')

    const rel = toRelativePath(path, root)
    if (rel == null) {
      throw new Error(
        `[react-trace] Cannot resolve "${path}" relative to "${this._handle.name}". ` +
          'Make sure the picked folder is the project root.',
      )
    }

    const file = await getFileHandle(this._handle, rel)
    if (!file) throw new Error(`[react-trace] File not found: ${rel}`)

    return (await file.getFile()).text()
  }

  async write(root: string, path: string, content: string): Promise<void> {
    const ok = await this.ensureAccess()
    if (!ok || !this._handle)
      throw new Error('[react-trace] File system access denied')

    const rel = toRelativePath(path, root)
    if (rel == null) {
      throw new Error(
        `[react-trace] Cannot resolve "${path}" relative to "${this._handle.name}".`,
      )
    }

    const file = await getFileHandle(this._handle, rel, true)
    if (!file)
      throw new Error(`[react-trace] Cannot open file for writing: ${rel}`)

    const writable = await file.createWritable()
    await writable.write(content)
    await writable.close()
  }
}

export const fileSystemService: FileSystemService = new FileSystemServiceImpl()
