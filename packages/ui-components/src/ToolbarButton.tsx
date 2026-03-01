import { Button } from '@base-ui/react/button'
import type { ButtonHTMLAttributes, CSSProperties, ReactElement } from 'react'
import { forwardRef } from 'react'

export interface ToolbarButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'style'
> {
  style?: CSSProperties
  render?: ReactElement
}

const toolbarButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 7,
  cursor: 'pointer',
  padding: 0,
  background: 'transparent',
  border: 0,
  outline: 'none',
  color: '#fafafa',
  fontSize: 14,
  transition: 'background 0.15s, border-color 0.15s',
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ style, render, type = 'button', ...props }, ref) {
    return (
      <Button
        ref={ref}
        type={type}
        render={render}
        style={(state) => ({
          ...toolbarButtonStyle,
          cursor: state.disabled ? 'not-allowed' : 'pointer',
          opacity: state.disabled ? 0.4 : 1,
          ...style,
        })}
        {...props}
      />
    )
  },
)
