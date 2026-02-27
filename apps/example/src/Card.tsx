import type { ReactNode } from 'react'

type CardProps = {
  title: string
  children: ReactNode
}
export function Card({ title, children }: CardProps) {
  return (
    <div
      style={{
        border: '1px solid #e4e4e7',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
      {children}
    </div>
  )
}
