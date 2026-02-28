import { IS_MAC, Kbd, KbdGroup, toAbsolutePath } from '@react-xray/core'

function FolderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 3.5a1 1 0 0 1 1-1h3l1.5 1.5H12a1 1 0 0 1 1 1V10.5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
        <button
          type="button"
          onClick={onCancel}
          style={{
            height: 28,
            padding: '0 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid #3f3f46',
            color: '#d4d4d8',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onGrant}
          style={{
            height: 28,
            padding: '0 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            background: '#fafafa',
            border: 'none',
            color: '#18181b',
          }}
        >
          Grant access
        </button>
      </div>
    </div>
  )
}

/**
 * Copies the root path to clipboard then calls requestAccess().
 * Used by both FolderAccessOverlay (toolbar) and SourcePreview (subpanel).
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
