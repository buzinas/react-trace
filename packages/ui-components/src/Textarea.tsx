import type { CSSProperties } from 'react'
import { forwardRef, useState } from 'react'

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'style'
> {
  style?: CSSProperties
}

const baseStyle: CSSProperties = {
  width: '100%',
  background: '#0f0f11',
  borderRadius: 4,
  outline: 'none',
  resize: 'vertical',
  color: '#fafafa',
  fontSize: 12,
  fontFamily: 'system-ui, sans-serif',
  lineHeight: 1.4,
  padding: '4px 6px',
  boxSizing: 'border-box',
  caretColor: '#3b82f6',
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ style, onFocus, onBlur, ...props }, ref) {
    const [focused, setFocused] = useState(false)

    return (
      <textarea
        ref={ref}
        style={{
          ...baseStyle,
          border: `1px solid ${focused ? '#3b82f6' : '#3f3f46'}`,
          ...style,
        }}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...props}
      />
    )
  },
)
