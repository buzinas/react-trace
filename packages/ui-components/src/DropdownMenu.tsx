import type { MenuItemState } from '@base-ui/react/menu'
import { Menu } from '@base-ui/react/menu'
import type { ComponentProps, CSSProperties } from 'react'

import { panelPopupStyle } from './Popover'

function StyledPopup({ style, ...props }: ComponentProps<typeof Menu.Popup>) {
  return <Menu.Popup style={{ ...panelPopupStyle, ...style }} {...props} />
}

interface StyledItemProps extends Omit<
  ComponentProps<typeof Menu.Item>,
  'style'
> {
  style?: CSSProperties | ((state: MenuItemState) => CSSProperties)
}

function StyledItem({ style: callerStyle, ...props }: StyledItemProps) {
  return (
    <Menu.Item
      style={(state) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 12px',
        cursor: 'pointer',
        userSelect: 'none',
        outline: 'none',
        fontSize: 12,
        color: '#d4d4d8',
        fontFamily: 'system-ui, sans-serif',
        background: state.highlighted ? 'rgba(59,130,246,0.2)' : 'transparent',
        transition: 'background 0.1s',
        ...(typeof callerStyle === 'function'
          ? callerStyle(state)
          : callerStyle),
      })}
      {...props}
    />
  )
}

function StyledSeparator({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{ borderTop: '1px solid #27272a', margin: '2px 0', ...style }}
    />
  )
}

export const DropdownMenu = {
  Root: Menu.Root,
  Trigger: Menu.Trigger,
  Portal: Menu.Portal,
  Positioner: Menu.Positioner,
  Popup: StyledPopup,
  Item: StyledItem,
  Separator: StyledSeparator,
}

export type {
  MenuRootProps as DropdownMenuRootProps,
  MenuItemState as DropdownMenuItemState,
} from '@base-ui/react/menu'
export { StyledItemProps as DropdownMenuItemProps }
