import { Select as SelectPrimitive } from '@base-ui/react/select'
import { ChevronDown } from 'lucide-react'
import type { ComponentProps, CSSProperties } from 'react'

import { panelPopupStyle } from './Popover'

function StyledTrigger({
  style,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      style={(state) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        width: '100%',
        background: '#0f0f11',
        border: '1px solid #3f3f46',
        borderRadius: 5,
        color: '#fafafa',
        fontSize: 12,
        fontFamily: 'system-ui, sans-serif',
        padding: '5px 8px',
        cursor: state.disabled ? 'not-allowed' : 'pointer',
        opacity: state.disabled ? 0.5 : 1,
        boxSizing: 'border-box',
        ...(typeof style === 'function' ? style(state) : style),
      })}
      {...props}
    >
      {children}
      <ChevronDown size={12} strokeWidth={1.75} aria-hidden />
    </SelectPrimitive.Trigger>
  )
}

function StyledPositioner({
  ...props
}: ComponentProps<typeof SelectPrimitive.Positioner>) {
  return (
    <SelectPrimitive.Positioner
      align="start"
      side="top"
      sideOffset={4}
      alignItemWithTrigger={false}
      {...props}
    />
  )
}

function StyledPopup({
  style,
  ...props
}: ComponentProps<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Popup
      style={{ ...panelPopupStyle, paddingBlock: 4, ...style }}
      {...props}
    />
  )
}

function StyledList({
  style,
  ...props
}: ComponentProps<typeof SelectPrimitive.List>) {
  return (
    <SelectPrimitive.List
      style={{
        ...style,
        width: 'var(--anchor-width)',
      }}
      {...props}
    />
  )
}

interface StyledItemProps extends Omit<
  ComponentProps<typeof SelectPrimitive.Item>,
  'style'
> {
  style?: CSSProperties
}

function StyledItem({ style: callerStyle, ...props }: StyledItemProps) {
  return (
    <SelectPrimitive.Item
      style={(state) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        cursor: state.disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        outline: 'none',
        fontSize: 12,
        fontFamily: 'system-ui, sans-serif',
        color: state.selected ? '#fafafa' : '#d4d4d8',
        background: state.highlighted ? 'rgba(59,130,246,0.2)' : 'transparent',
        transition: 'background 0.1s',
        ...callerStyle,
      })}
      {...props}
    />
  )
}

export const Select = {
  Root: SelectPrimitive.Root,
  Trigger: StyledTrigger,
  Value: SelectPrimitive.Value,
  Portal: SelectPrimitive.Portal,
  Positioner: StyledPositioner,
  Popup: StyledPopup,
  List: StyledList,
  Item: StyledItem,
  ItemText: SelectPrimitive.ItemText,
  ItemIndicator: SelectPrimitive.ItemIndicator,
  Group: SelectPrimitive.Group,
  GroupLabel: SelectPrimitive.GroupLabel,
  Separator: SelectPrimitive.Separator,
}
