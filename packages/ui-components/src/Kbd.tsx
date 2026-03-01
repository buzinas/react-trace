import type { ComponentProps, CSSProperties } from 'react'

const kbdStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 20,
  minWidth: 20,
  padding: '0 4px',
  gap: 4,
  borderRadius: 4,
  background: '#27272a',
  border: '1px solid #52525b',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 11,
  fontWeight: 500,
  color: '#a1a1aa',
  pointerEvents: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
}

const kbdGroupStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
}

export function Kbd({ style, ...props }: ComponentProps<'kbd'>) {
  return <kbd style={{ ...kbdStyle, ...style }} {...props} />
}

export function KbdGroup({ style, ...props }: ComponentProps<'div'>) {
  return <div style={{ ...kbdGroupStyle, ...style }} {...props} />
}
