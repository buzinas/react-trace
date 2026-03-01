import { Button as ButtonPrimitive } from '@base-ui/react/button'
import type { CSSProperties } from 'react'

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'style'
> {
  variant: 'primary' | 'secondary'
  style?: CSSProperties
  render?: React.ReactElement
}

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  height: 28,
  padding: '0 12px',
  borderRadius: 6,
  fontSize: 12,
  fontFamily: 'system-ui, sans-serif',
  fontWeight: 500,
  outline: 'none',
  transition: 'opacity 0.15s',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const variantStyles: Record<'primary' | 'secondary', CSSProperties> = {
  primary: {
    background: '#fafafa',
    border: 'none',
    color: '#18181b',
  },
  secondary: {
    background: 'transparent',
    border: '1px solid #3f3f46',
    color: '#d4d4d8',
  },
}

export function Button({ variant, style, render, ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      render={render}
      style={(state) => ({
        ...baseStyle,
        ...variantStyles[variant],
        opacity: state.disabled ? 0.5 : 1,
        cursor: state.disabled ? 'not-allowed' : 'pointer',
        ...style,
      })}
      {...props}
    />
  )
}
