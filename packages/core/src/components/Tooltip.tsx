import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import {
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react'

interface TooltipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  shortcut?: string
  container: RefObject<HTMLDivElement | null>
  /** Forwarded to Tooltip.Trigger's render prop — use to compose with e.g. Toolbar.Button */
  render?: ReactElement
  children: ReactNode
}

const popupStyle: React.CSSProperties = {
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

const kbdStyle: React.CSSProperties = {
  background: '#27272a',
  border: '1px solid #52525b',
  borderRadius: 4,
  padding: '1px 5px',
  fontFamily: 'ui-monospace, monospace',
  fontSize: 11,
  color: '#a1a1aa',
  lineHeight: 1.6,
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
            {shortcut && <kbd style={kbdStyle}>{shortcut}</kbd>}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
