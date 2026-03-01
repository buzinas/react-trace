import type { CSSProperties, ReactNode } from 'react'

export interface PanelHeaderProps {
  title: ReactNode
  actionsRender?: ReactNode
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
  actionsRender,
  style,
  titleStyle,
}: PanelHeaderProps) {
  return (
    <div style={{ ...headerStyle, ...style }}>
      <span style={{ ...titleBaseStyle, ...titleStyle }}>{title}</span>
      {actionsRender}
    </div>
  )
}
