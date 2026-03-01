import {
  resolveSource,
  toRelativePath,
  useClearSelectedContext,
  useDeactivateInspector,
  useProjectRoot,
  useSelectedContext,
  useSelectedSource,
  useWidgetPortalContainer,
  type RVEPlugin,
} from '@react-xray/core'
import {
  ChatBubbleIcon,
  DropdownMenu,
  ToolbarButton,
  Tooltip,
} from '@react-xray/ui-components'
import { useRef, useState } from 'react'

import { CommentEditorOverlay } from './CommentEditor'
import { CommentsMenu } from './CommentsMenu'
import { useCommentEntries, useCommentsActions } from './store'

export type { CommentEntry } from './store'

function CommentsToolbarIcon({ count }: { count: number }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ChatBubbleIcon />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: '#ef4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1,
            minWidth: 14,
            height: 14,
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  )
}

function CommentsToolbar() {
  const comments = useCommentEntries()
  const portalContainer = useWidgetPortalContainer()
  const deactivateInspector = useDeactivateInspector()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const count = comments.length

  return (
    <>
      <Tooltip
        label="Comments"
        container={portalContainer}
        render={<ToolbarButton ref={buttonRef} />}
        aria-label="Comments"
        onClick={() => {
          deactivateInspector()
          setIsOpen((open) => !open)
        }}
      >
        <CommentsToolbarIcon count={count} />
      </Tooltip>

      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Portal container={portalContainer}>
          <DropdownMenu.Positioner
            anchor={buttonRef.current}
            side="top"
            align="end"
            sideOffset={8}
            collisionPadding={8}
            positionMethod="fixed"
            style={{ zIndex: 9999999, pointerEvents: 'auto' }}
          >
            <DropdownMenu.Popup>
              <CommentsMenu onClose={() => setIsOpen(false)} />
            </DropdownMenu.Popup>
          </DropdownMenu.Positioner>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <CommentEditorOverlay />
    </>
  )
}

function CommentsActionPanel() {
  const selectedContext = useSelectedContext()
  const selectedSource = useSelectedSource()
  const root = useProjectRoot()
  const { setPending } = useCommentsActions()
  const clearSelectedContext = useClearSelectedContext()
  const deactivateInspector = useDeactivateInspector()

  if (!selectedContext || !selectedSource) return null

  const handleAddComment = async () => {
    const { fileName, lineNumber } = await resolveSource(selectedSource)
    const filePath = toRelativePath(fileName, root)

    setPending({
      filePath,
      lineNumber,
      anchorEl: selectedContext.element,
    })
    clearSelectedContext()
    deactivateInspector()
  }

  return (
    <DropdownMenu.Item
      closeOnClick
      onClick={() => handleAddComment().catch(() => {})}
    >
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <ChatBubbleIcon />
      </span>
      Add comment
    </DropdownMenu.Item>
  )
}

export function CommentsPlugin(): RVEPlugin {
  return {
    name: 'comments',
    toolbar: CommentsToolbar,
    actionPanel: CommentsActionPanel,
  }
}
