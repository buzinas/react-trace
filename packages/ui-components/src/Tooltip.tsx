import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactElement,
  ReactNode,
} from 'react'

import { Kbd } from './Kbd'

export interface TooltipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: ReactNode
  shortcut?: string
  container: TooltipPrimitive.Portal.Props['container']
  render?: ReactElement
  children: ReactNode
}

const popupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: '#09090b',
  border: '1px solid #3f3f46',
  borderRadius: 6,
  padding: '5px 8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
  whiteSpace: 'nowrap',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 12,
  color: '#d4d4d8',
  pointerEvents: 'none',
  zIndex: 9999999,
}

export function Tooltip({
  label,
  shortcut,
  container,
  render,
  children,
  ...triggerProps
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger render={render} {...triggerProps}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal container={container}>
        <TooltipPrimitive.Positioner sideOffset={10}>
          <TooltipPrimitive.Popup style={popupStyle}>
            {label}
            {shortcut && <Kbd>{shortcut}</Kbd>}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

Tooltip.Provider = TooltipPrimitive.Provider
