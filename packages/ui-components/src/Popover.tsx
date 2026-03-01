import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import type { ComponentProps, CSSProperties } from 'react'

/**
 * Shared panel popup style (exported for callers that extend it)
 */
export const panelPopupStyle: CSSProperties = {
  background: '#18181b',
  border: '1px solid #27272a',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
}

function StyledPopup({
  style,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Popup>) {
  return (
    <PopoverPrimitive.Popup
      style={{ ...panelPopupStyle, ...style }}
      {...props}
    />
  )
}

export const Popover = {
  Root: PopoverPrimitive.Root,
  Trigger: PopoverPrimitive.Trigger,
  Portal: PopoverPrimitive.Portal,
  Positioner: PopoverPrimitive.Positioner,
  Close: PopoverPrimitive.Close,
  Popup: StyledPopup,
}
