import type { CSSProperties } from 'react'

export const LINE_HEIGHT = 19
export const INLINE_LINES = 12
export const INLINE_HEIGHT = INLINE_LINES * LINE_HEIGHT
export const EDITOR_WIDTH = 480
export const TOOLBAR_HEIGHT = 33

// Blue-tinted action button used for the Save button in SourcePreview toolbar.
// Distinct from the standard Button variants in @react-xray/ui-components.
export const actionButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  background: 'rgba(59,130,246,0.15)',
  border: '1px solid rgba(59,130,246,0.3)',
  borderRadius: 5,
  color: '#93c5fd',
  cursor: 'pointer',
  fontSize: 11,
  padding: '3px 8px',
  fontFamily: 'system-ui, sans-serif',
}
