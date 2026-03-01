import type { CSSProperties, ReactNode } from 'react'

import { IconButton } from './IconButton'
import { XIcon } from './icons'

export interface PanelHeaderProps {
  title: ReactNode
  onClose?: () => void
  closeTitle?: string
  style?: CSSProperties
  titleStyle?: CSSProperties
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px 8px',
  borderBottom: '1px solid #27272a',
}

const titleBaseStyle: CSSProperties = {
  color: '#fafafa',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: 'system-ui, sans-serif',
}

export function PanelHeader({
  title,
  onClose,
  closeTitle = 'Close (Esc)',
  style,
  titleStyle,
}: PanelHeaderProps) {
  return (
    <div style={{ ...headerStyle, ...style }}>
      <span style={{ ...titleBaseStyle, ...titleStyle }}>{title}</span>
      {onClose != null && (
        <IconButton
          onClick={onClose}
          title={closeTitle}
          style={{ padding: '0 2px' }}
        >
          <XIcon />
        </IconButton>
      )}
    </div>
  )
}
