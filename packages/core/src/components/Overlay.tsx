import { useEffect, useState } from 'react'

import type { ComponentContext } from '../types'

interface OverlayProps {
  hoveredContext: ComponentContext | null
  selectedContext: ComponentContext | null
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

function toRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function HighlightRect({
  rect,
  label,
  variant,
}: {
  rect: Rect
  label: string
  variant: 'hover' | 'selected'
}) {
  const isSelected = variant === 'selected'

  return (
    <>
      {/* Bounding box */}
      <div
        style={{
          position: 'fixed',
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          background: isSelected
            ? 'rgba(59,130,246,0.12)'
            : 'rgba(59,130,246,0.07)',
          border: isSelected
            ? '2px solid #3b82f6'
            : '2px dashed rgba(59,130,246,0.7)',
          borderRadius: 2,
          pointerEvents: 'none',
          boxSizing: 'border-box',
        }}
      />
      {/* Label pill */}
      <div
        style={{
          position: 'fixed',
          top: Math.max(0, rect.top - 24),
          left: rect.left,
          background: isSelected ? '#3b82f6' : 'rgba(59,130,246,0.85)',
          color: '#fff',
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          fontWeight: 600,
          padding: '2px 6px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          lineHeight: '18px',
        }}
      >
        {label}
      </div>
    </>
  )
}

export function Overlay({ hoveredContext, selectedContext }: OverlayProps) {
  // Track rects separately so we can update them on scroll/resize
  const [hoveredRect, setHoveredRect] = useState<Rect | null>(null)
  const [selectedRect, setSelectedRect] = useState<Rect | null>(null)

  // Recompute rects when contexts change
  useEffect(() => {
    setHoveredRect(hoveredContext ? toRect(hoveredContext.element) : null)
  }, [hoveredContext])

  useEffect(() => {
    setSelectedRect(selectedContext ? toRect(selectedContext.element) : null)
  }, [selectedContext])

  // Keep rects in sync with scroll and resize
  useEffect(() => {
    if (!hoveredContext && !selectedContext) return

    function update() {
      if (hoveredContext) setHoveredRect(toRect(hoveredContext.element))
      if (selectedContext) setSelectedRect(toRect(selectedContext.element))
    }

    window.addEventListener('scroll', update, { passive: true, capture: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update, { capture: true })
      window.removeEventListener('resize', update)
    }
  }, [hoveredContext, selectedContext])

  const showHovered =
    hoveredRect &&
    hoveredContext &&
    // Don't show hover rect when it's the same element as selected
    hoveredContext.element !== selectedContext?.element

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 999998,
      }}
    >
      {showHovered && (
        <HighlightRect
          rect={hoveredRect}
          label={hoveredContext.breadcrumb.join(' › ')}
          variant="hover"
        />
      )}
      {selectedRect && selectedContext && (
        <HighlightRect
          rect={selectedRect}
          label={selectedContext.breadcrumb.join(' › ')}
          variant="selected"
        />
      )}
    </div>
  )
}
