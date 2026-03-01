import { Button } from '@base-ui/react/button'
import type { ButtonHTMLAttributes, CSSProperties, ReactElement } from 'react'

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'style'
> {
  style?: CSSProperties
  render?: ReactElement
}

const iconButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  color: '#52525b',
  padding: 4,
  borderRadius: 4,
  lineHeight: 1,
  transition: 'color 0.1s, opacity 0.15s',
}

export function IconButton({ style, render, ...props }: IconButtonProps) {
  return (
    <Button
      render={render}
      style={(state) => ({
        ...iconButtonStyle,
        opacity: state.disabled ? 0.4 : 1,
        cursor: state.disabled ? 'not-allowed' : 'pointer',
        ...style,
      })}
      {...props}
    />
  )
}
