import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { ChevronDown } from 'lucide-react'
import type { ComponentProps, CSSProperties } from 'react'

import { panelPopupStyle } from './Popover'

function StyledTrigger({
  style,
  children,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Trigger>) {
  return (
    <ComboboxPrimitive.Trigger
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
    </ComboboxPrimitive.Trigger>
  )
}

function StyledInput() {
  return (
    <ComboboxPrimitive.Input
      style={{
        background: '#0f0f11',
        color: '#fafafa',
        border: 'none',
        outline: 'none',
        fontSize: 12,
        fontFamily: 'system-ui, sans-serif',
        width: '100%',
      }}
    />
  )
}

function StyledPositioner({
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Positioner>) {
  return (
    <ComboboxPrimitive.Positioner
      align="start"
      side="top"
      sideOffset={8}
      {...props}
    />
  )
}

function StyledPopup({
  style,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Popup>) {
  return (
    <ComboboxPrimitive.Popup
      style={{ ...panelPopupStyle, paddingBlock: 4, ...style }}
      {...props}
    />
  )
}

function StyledList({
  style,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.List>) {
  return (
    <ComboboxPrimitive.List
      style={{
        ...style,
        width: 'var(--anchor-width)',
      }}
      {...props}
    />
  )
}

interface StyledItemProps extends Omit<
  ComponentProps<typeof ComboboxPrimitive.Item>,
  'style'
> {
  style?: CSSProperties
}

function StyledItem({ style: callerStyle, ...props }: StyledItemProps) {
  return (
    <ComboboxPrimitive.Item
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

export const Combobox = {
  Root: ComboboxPrimitive.Root,
  Trigger: StyledTrigger,
  Value: ComboboxPrimitive.Value,
  Portal: ComboboxPrimitive.Portal,
  Positioner: StyledPositioner,
  Popup: StyledPopup,
  List: StyledList,
  Empty: ComboboxPrimitive.Empty,
  Item: StyledItem,
  Input: StyledInput,
  ItemIndicator: ComboboxPrimitive.ItemIndicator,
  Group: ComboboxPrimitive.Group,
  GroupLabel: ComboboxPrimitive.GroupLabel,
  Separator: ComboboxPrimitive.Separator,
}
