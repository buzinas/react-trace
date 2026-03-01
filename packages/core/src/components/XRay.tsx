import { Provider, useAtom, useAtomValue } from 'jotai'
import { useEffect, useEffectEvent, useState } from 'react'
import { createPortal } from 'react-dom'

import { getComponentContext, resolveSource } from '../fiber'
import { fileSystemService } from '../fs'
import { IS_MAC } from '../platform'
import {
  createWidgetStore,
  inspectorActiveAtom,
  portalContainerAtom,
  projectRootAtom,
  selectedContextAtom,
} from '../store'
import type { ComponentContext, XRayProps } from '../types'
import { ActionPanel } from './ActionPanel'
import { Overlay } from './Overlay'
import { Toolbar } from './Toolbar'

/**
 * How long Cmd/Ctrl+X must be held before the inspector latches on
 */
const LONGPRESS_MS = 600

export function XRay({
  root,
  plugins = [],
  position = 'bottom-right',
}: XRayProps) {
  const [jotaiStore] = useState(() => {
    const store = createWidgetStore()
    store.set(projectRootAtom, root)
    return store
  })

  return (
    <Provider store={jotaiStore}>
      <XRayRoot plugins={plugins} position={position} />
    </Provider>
  )
}

function XRayRoot({
  plugins,
  position,
}: {
  plugins: NonNullable<XRayProps['plugins']>
  position: NonNullable<XRayProps['position']>
}) {
  const portalContainer = useAtomValue(portalContainerAtom)

  const [inspectorActive, setInspectorActive] = useAtom(inspectorActiveAtom)
  const [hoveredContext, setHoveredContext] = useState<ComponentContext | null>(
    null,
  )
  const [selectedContext, setSelectedContext] = useAtom(selectedContextAtom)
  const applySelectedContext = useEffectEvent(() =>
    setSelectedContext(hoveredContext),
  )

  // Silently try to restore a previously granted FS handle on mount
  useEffect(() => {
    fileSystemService.tryRestore().catch(() => {})
  }, [])

  const toggleInspector = useEffectEvent((value?: boolean) =>
    setInspectorActive((prev) => value ?? !prev),
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

  // Long-press Cmd+X (Mac) / Ctrl+X (other): hold for LONGPRESS_MS to latch inspector on.
  // Releasing before the timer fires cancels — no accidental activation.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    function onKeyDown(e: KeyboardEvent) {
      const modifierHeld = IS_MAC ? e.metaKey : e.ctrlKey
      if (e.key === 'x' && modifierHeld && !e.repeat && timer === null) {
        e.preventDefault() // prevent browser Cut
        timer = setTimeout(() => {
          timer = null
          toggleInspector(true)
        }, LONGPRESS_MS)
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      // If either key is released before the timer fires, cancel
      if (e.key === 'x' || e.key === 'Meta' || e.key === 'Control') {
        if (timer !== null) {
          clearTimeout(timer)
          timer = null
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      if (timer !== null) clearTimeout(timer)
    }
  }, [])

  // Inspector mouse + keyboard listeners — active whenever enabled
  useEffect(() => {
    if (!inspectorActive) return

    let lastHoveredElement: HTMLElement | null = null

    function onMouseMove(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (!target || target === lastHoveredElement) return
      if (portalContainer.contains(target)) return

      lastHoveredElement = target
      const ctx = getComponentContext(target)
      setHoveredContext(ctx)

      // Async: remap compiled positions → original TypeScript positions via source map.
      // Resolves the top-level source AND every entry in ctx.all in parallel (all
      // cached per URL, so only the first hover on each file incurs a fetch).
      if (ctx) {
        Promise.all([
          ctx.source ? resolveSource(ctx.source) : Promise.resolve(null),
          ...ctx.all.map((e) =>
            e.source ? resolveSource(e.source) : Promise.resolve(null),
          ),
        ])
          .then(([resolvedSource, ...resolvedAll]) => {
            if (lastHoveredElement !== target) return
            setHoveredContext((prev) => {
              if (prev?.element !== target) return prev
              return {
                ...prev,
                ...(resolvedSource && { source: resolvedSource }),
                all: prev.all.map((e, i) => ({
                  ...e,
                  source: resolvedAll[i] ?? e.source,
                })),
              }
            })
          })
          .catch(() => {})
      }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null
      if (portalContainer.contains(target)) return

      e.stopPropagation()
      e.preventDefault()
      applySelectedContext()
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('click', onClick, true) // capture phase
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

  return createPortal(
    <>
      {/* Toolbar — pointer-events:auto so buttons are clickable */}
      <div style={{ pointerEvents: 'auto' }}>
        <Toolbar plugins={plugins} position={position} />
      </div>

      {/* Overlay — pointer-events:none, managed by the container */}
      {inspectorActive && (
        <Overlay
          hoveredContext={hoveredContext}
          selectedContext={selectedContext}
        />
      )}

      {/*
        ActionPanel — always rendered when inspector is active so the Popover can
        animate open/closed. The Popover.Positioner handles pointer-events itself.
      */}
      {inspectorActive && <ActionPanel plugins={plugins} />}
    </>,
    portalContainer,
  )
}
