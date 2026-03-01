import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import type { CSSProperties } from 'react'

export interface SeparatorProps {
  style?: CSSProperties
}

export function Separator({ style }: SeparatorProps) {
  return (
    <SeparatorPrimitive
      style={{ borderTop: '1px solid #27272a', margin: '2px 0', ...style }}
    />
  )
}
