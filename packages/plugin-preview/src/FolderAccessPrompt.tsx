import { IS_MAC, toAbsolutePath } from '@react-trace/core'
import { Button, FolderIcon, Kbd, KbdGroup } from '@react-trace/ui-components'

export function FolderAccessPrompt({
  root,
  onGrant,
  onCancel,
}: {
  root: string | undefined
  onGrant(): void
  onCancel(): void
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '20px 16px',
        height: '100%',
        boxSizing: 'border-box',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <span style={{ color: '#52525b' }}>
        <FolderIcon />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#fafafa' }}>
          Folder access needed
        </span>
        <span style={{ fontSize: 12, color: '#71717a', lineHeight: 1.5 }}>
          {root ? (
            <span style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span>
                The project root path will be copied to your clipboard. Navigate
                to it in the folder picker.
              </span>
              {IS_MAC && (
                <span>
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>⇧</Kbd>
                    <Kbd>G</Kbd>
                  </KbdGroup>
                  <span> to paste the path directly.</span>
                </span>
              )}
            </span>
          ) : (
            'Grant access to your project folder to preview source files.'
          )}
        </span>
        {root && (
          <span
            style={{
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              color: '#3b82f6',
              wordBreak: 'break-all',
            }}
          >
            {root}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onGrant}>
          Grant access
        </Button>
      </div>
    </div>
  )
}

/**
 * Copies the root path to clipboard then calls requestAccess().
 */
export async function handleGrantAccess(
  root: string | undefined,
  requestAccess: () => Promise<boolean>,
): Promise<boolean> {
  if (root) {
    const absPath = toAbsolutePath(root, undefined) ?? root
    navigator.clipboard.writeText(absPath).catch(() => {})
  }
  return requestAccess()
}
