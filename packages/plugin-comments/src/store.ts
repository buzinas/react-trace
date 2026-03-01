import { atom, createStore, useAtomValue, useSetAtom } from 'jotai'

export interface CommentEntry {
  id: string
  filePath: string
  lineNumber: number
  comment: string
  createdAt: number
}

export interface PendingComment {
  filePath: string
  lineNumber: number
  anchorEl: HTMLElement
}

interface CommentsSnapshot {
  comments: CommentEntry[]
  pending: PendingComment | null
}

type NewCommentEntry = Omit<CommentEntry, 'id' | 'createdAt'>

interface CommentsStore {
  getSnapshot(): CommentsSnapshot
  addComment(entry: NewCommentEntry): string
  updateComment(id: string, text: string): void
  removeComment(id: string): void
  clearAllComments(): void
  setPending(value: PendingComment | null): void
}

const commentEntriesAtom = atom<CommentEntry[]>([])
const pendingCommentAtom = atom<PendingComment | null>(null)

const commentsSnapshotAtom = atom<CommentsSnapshot>((get) => ({
  comments: get(commentEntriesAtom),
  pending: get(pendingCommentAtom),
}))

const addCommentAtom = atom(null, (get, set, entry: NewCommentEntry) => {
  const id = crypto.randomUUID()
  const comment: CommentEntry = { ...entry, id, createdAt: Date.now() }

  set(commentEntriesAtom, [...get(commentEntriesAtom), comment])

  return id
})

const updateCommentAtom = atom(
  null,
  (get, set, payload: { id: string; text: string }) => {
    set(
      commentEntriesAtom,
      get(commentEntriesAtom).map((comment) =>
        comment.id === payload.id
          ? { ...comment, comment: payload.text }
          : comment,
      ),
    )
  },
)

const removeCommentAtom = atom(null, (get, set, id: string) => {
  set(
    commentEntriesAtom,
    get(commentEntriesAtom).filter((comment) => comment.id !== id),
  )
})

const clearAllCommentsAtom = atom(null, (_get, set) => {
  set(commentEntriesAtom, [])
})

export function createCommentsStore(
  jotaiStore: ReturnType<typeof createStore> = createStore(),
): CommentsStore {
  return {
    getSnapshot: () => jotaiStore.get(commentsSnapshotAtom),
    addComment: (entry) => jotaiStore.set(addCommentAtom, entry),
    updateComment: (id, text) => {
      jotaiStore.set(updateCommentAtom, { id, text })
    },
    removeComment: (id) => {
      jotaiStore.set(removeCommentAtom, id)
    },
    clearAllComments: () => {
      jotaiStore.set(clearAllCommentsAtom)
    },
    setPending: (value) => {
      jotaiStore.set(pendingCommentAtom, value)
    },
  }
}

function useCommentsSnapshot() {
  return useAtomValue(commentsSnapshotAtom)
}

export function useCommentEntries() {
  return useCommentsSnapshot().comments
}

export function usePendingComment() {
  return useCommentsSnapshot().pending
}

export function useCommentsActions() {
  const addComment = useSetAtom(addCommentAtom)
  const updateComment = useSetAtom(updateCommentAtom)
  const removeComment = useSetAtom(removeCommentAtom)
  const clearAllComments = useSetAtom(clearAllCommentsAtom)
  const setPending = useSetAtom(pendingCommentAtom)

  return {
    addComment,
    updateComment,
    removeComment,
    clearAllComments,
    setPending,
  }
}
