import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'

import {
  inspectorActiveAtom,
  portalContainerAtom,
  projectRootAtom,
  selectedContextAtom,
} from '../store'
import type { ComponentContext } from '../types'
import { getComponentContext } from '../utils/fiber'
import { useEffectEvent } from './useEffectEvent'

/**
 * Encapsulates all inspector mouse/keyboard behavior:
 *
 * - Tracks hovered component context via mousemove + fiber tree walking
 * - Async source-map resolution for hovered components
 * - Click to promote hovered context to selected
 * - Escape to clear selection, then deactivate inspector
 * - Cleanup (clear hover + selection) when inspector is turned off
 */
export function useInspectorBehavior() {
  const portalContainer = useAtomValue(portalContainerAtom)
  const inspectorActive = useAtomValue(inspectorActiveAtom)
  const root = useAtomValue(projectRootAtom)
  const setInspectorActive = useSetAtom(inspectorActiveAtom)
  const [hoveredContext, setHoveredContext] = useState<ComponentContext | null>(
    null,
  )
  const [selectedContext, setSelectedContext] = useAtom(selectedContextAtom)

  const applySelectedContext = useEffectEvent(() =>
    setSelectedContext(hoveredContext),
  )

  const onEscapeKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key !== 'Escape') return

    // First Escape: clear selected context (if any)
    if (selectedContext) {
      setSelectedContext(null)
      return
    }

    // Second Escape: turn inspector off
    setInspectorActive(false)
    setHoveredContext(null)
  })

  // Inspector mouse + keyboard listeners — active whenever inspector is enabled
  useEffect(() => {
    if (!inspectorActive) return

    let lastHoveredElement: HTMLElement | null = null

    async function onMouseMove(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target || target === lastHoveredElement) return
      if (portalContainer.contains(target)) return

      lastHoveredElement = target

      try {
        const ctx = await getComponentContext(target, root)
        if (lastHoveredElement !== target) return
        setHoveredContext(ctx)
      } catch {}
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (portalContainer.contains(target)) return

      e.stopPropagation()
      e.preventDefault()
      applySelectedContext()
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onEscapeKeyDown)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('keydown', onEscapeKeyDown)
    }
  }, [inspectorActive])

  // Clear hover/select when inspector is turned off
  useEffect(() => {
    if (!inspectorActive) {
      setHoveredContext(null)
      setSelectedContext(null)
    }
  }, [inspectorActive, setSelectedContext])

  return { hoveredContext }
}
