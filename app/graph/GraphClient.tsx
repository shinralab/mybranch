'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Node {
  id: string
  label: string
  isRoot: boolean
  isGroup: boolean
  commitCount: number
  lastUpdated: string
  href: string
}

interface DrawNode extends Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

const COLORS = {
  root:    '#ffd700',
  group:   '#bc8cff',
  person:  '#39d353',
  edge:    '#30363d',
  bg:      '#0d1117',
  text:    '#e6edf3',
  textDim: '#8b949e',
}

export default function GraphClient({ nodes, rootUser }: { nodes: Node[]; rootUser: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const nodesRef  = useRef<DrawNode[]>([])
  const [hovered, setHovered] = useState<DrawNode | null>(null)
  const [dims, setDims]       = useState({ w: 800, h: 600 })
  const mouseRef = useRef({ x: 0, y: 0 })
  const dragging = useRef<DrawNode | null>(null)
  const [ready, setReady] = useState(false)

  // Layout nodes in a radial tree from root
  useEffect(() => {
    const root = nodes.find(n => n.isRoot)
    const groups = nodes.filter(n => n.isGroup)
    const people = nodes.filter(n => !n.isRoot && !n.isGroup)

    const cx = dims.w / 2
    const cy = dims.h / 2

    const placed: DrawNode[] = []

    // Root at center
    if (root) {
      placed.push({
        ...root, x: cx, y: cy, vx: 0, vy: 0, radius: 22,
      })
    }

    // Groups in inner ring
    const gRadius = Math.min(dims.w, dims.h) * 0.22
    groups.forEach((g, i) => {
      const angle = (i / Math.max(groups.length, 1)) * Math.PI * 2 - Math.PI / 2
      placed.push({
        ...g,
        x: cx + Math.cos(angle) * gRadius,
        y: cy + Math.sin(angle) * gRadius,
        vx: 0, vy: 0, radius: 16,
      })
    })

    // People in outer ring(s)
    const pRadius = Math.min(dims.w, dims.h) * 0.38
    const pRadius2 = Math.min(dims.w, dims.h) * 0.47
    people.forEach((p, i) => {
      const angle = (i / Math.max(people.length, 1)) * Math.PI * 2 - Math.PI / 2
      const r = i % 2 === 0 ? pRadius : pRadius2
      placed.push({
        ...p,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
        vx: 0, vy: 0, radius: 10,
      })
    })

    nodesRef.current = placed
    setReady(true)
  }, [nodes, dims])

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const { width, height } = e.contentRect
        setDims({ w: width, h: height })
        canvas.width  = width * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        canvas.style.width  = `${width}px`
        canvas.style.height = `${height}px`
      }
    })
    ro.observe(canvas.parentElement!)
    return () => ro.disconnect()
  }, [])

  // Force simulation + draw loop
  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1

    function tick() {
      const ns = nodesRef.current
      const cx = dims.w / 2
      const cy = dims.h / 2

      // Light force simulation
      ns.forEach(a => {
        if (a.isRoot || a === dragging.current) return

        // Repel from each other
        ns.forEach(b => {
          if (a === b) return
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx*dx + dy*dy) || 1
          const minDist = a.radius + b.radius + 30
          if (dist < minDist) {
            const force = (minDist - dist) / minDist * 0.3
            a.vx += (dx / dist) * force
            a.vy += (dy / dist) * force
          }
        })

        // Attract to center ring based on type
        const targetR = a.isGroup ? Math.min(dims.w, dims.h) * 0.22 : Math.min(dims.w, dims.h) * 0.38
        const dx = a.x - cx
        const dy = a.y - cy
        const d = Math.sqrt(dx*dx + dy*dy) || 1
        const pull = (d - targetR) * 0.01
        a.vx -= (dx / d) * pull
        a.vy -= (dy / d) * pull

        // Dampen
        a.vx *= 0.85
        a.vy *= 0.85
        a.x  += a.vx
        a.y  += a.vy

        // Bounds
        a.x = Math.max(a.radius + 4, Math.min(dims.w - a.radius - 4, a.x))
        a.y = Math.max(a.radius + 4, Math.min(dims.h - a.radius - 4, a.y))
      })

      // Draw — reset transform each frame to prevent dpr accumulation
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, dims.w, dims.h)

      // Bg
      ctx.fillStyle = COLORS.bg
      ctx.fillRect(0, 0, dims.w, dims.h)

      // Subtle grid
      ctx.strokeStyle = 'rgba(48,54,61,0.3)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < dims.w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, dims.h); ctx.stroke()
      }
      for (let y = 0; y < dims.h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(dims.w, y); ctx.stroke()
      }


      const root = ns.find(n => n.isRoot)

      // Draw edges from root → groups → people
      ns.forEach(n => {
        if (n.isRoot) return
        const src = n.isGroup ? root : (ns.find(g => g.isGroup) ?? root)
        if (!src) return

        const grd = ctx.createLinearGradient(src.x, src.y, n.x, n.y)
        grd.addColorStop(0, n.isGroup ? 'rgba(188,140,255,0.3)' : 'rgba(57,211,83,0.15)')
        grd.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.moveTo(src.x, src.y)

        // Curved edge
        const mx = (src.x + n.x) / 2 + (Math.random() > 0.5 ? 20 : -20)
        const my = (src.y + n.y) / 2
        ctx.quadraticCurveTo(mx, my, n.x, n.y)

        ctx.strokeStyle = grd
        ctx.lineWidth = n.isGroup ? 1.5 : 0.8
        ctx.stroke()
      })

      // Draw nodes
      ns.forEach(n => {
        const isHov = hovered?.id === n.id
        const r = n.radius + (isHov ? 3 : 0)
        const color = n.isRoot ? COLORS.root : n.isGroup ? COLORS.group : COLORS.person

        // Glow
        if (isHov || n.isRoot) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2)
          const glow = ctx.createRadialGradient(n.x, n.y, r, n.x, n.y, r + 8)
          glow.addColorStop(0, `${color}40`)
          glow.addColorStop(1, 'transparent')
          ctx.fillStyle = glow
          ctx.fill()
        }

        // Circle
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = COLORS.bg
        ctx.fill()
        ctx.strokeStyle = color
        ctx.lineWidth = n.isRoot ? 2.5 : isHov ? 2 : 1.5
        ctx.stroke()

        // Inner dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Label
        const showLabel = isHov || n.isRoot || n.isGroup || r > 13
        if (showLabel) {
          ctx.font = `${n.isRoot ? 700 : 400} ${n.isRoot ? 11 : 10}px "Commit Mono", monospace`
          ctx.fillStyle = isHov ? color : COLORS.textDim
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillText(n.label.slice(0, 14), n.x, n.y + r + 4)
        }
      })

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [ready, dims, hovered])

  // Mouse events
  function getNodeAt(x: number, y: number): DrawNode | null {
    for (const n of nodesRef.current) {
      const dx = n.x - x, dy = n.y - y
      if (Math.sqrt(dx*dx + dy*dy) <= n.radius + 6) return n
    }
    return null
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mouseRef.current = { x, y }

    if (dragging.current && !dragging.current.isRoot) {
      dragging.current.x = x
      dragging.current.y = y
      dragging.current.vx = 0
      dragging.current.vy = 0
    } else {
      const h = getNodeAt(x, y)
      setHovered(h)
      canvasRef.current!.style.cursor = h ? 'pointer' : 'default'
    }
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const n = getNodeAt(e.clientX - rect.left, e.clientY - rect.top)
    if (n && !n.isRoot) dragging.current = n
  }

  function onMouseUp() {
    dragging.current = null
  }

  function onClick(e: React.MouseEvent<HTMLCanvasElement>) {
    if (dragging.current) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const n = getNodeAt(e.clientX - rect.left, e.clientY - rect.top)
    if (n) window.location.href = n.href
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--gh-surface)', borderBottom: '1px solid var(--gh-border)', padding: '12px 24px', flexShrink: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-mono text-[14px] font-semibold">Branch Graph</h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--gh-text-muted)' }}>
              {nodes.length} nodes · drag to rearrange · click to visit
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--gh-text-dim)' }}>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.root, display: 'inline-block' }} />
              root
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.group, display: 'inline-block' }} />
              group
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.person, display: 'inline-block' }} />
              person
            </span>
            <Link href="/" className="btn btn-default" style={{ fontSize: '11px' }}>
              ← Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%' }}
          onMouseMove={onMouseMove}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onClick={onClick}
        />

        {/* Hover tooltip */}
        {hovered && (
          <div
            style={{
              position: 'absolute',
              left: mouseRef.current.x + 12,
              top: mouseRef.current.y + 12,
              background: 'var(--gh-surface-2)',
              border: '1px solid var(--gh-border)',
              borderRadius: 'var(--radius)',
              padding: '8px 12px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 50,
            }}
          >
            <div style={{ color: hovered.isRoot ? COLORS.root : hovered.isGroup ? COLORS.group : COLORS.person, fontWeight: 600 }}>
              {hovered.label}
            </div>
            <div style={{ color: 'var(--gh-text-dim)', marginTop: '2px' }}>
              {hovered.commitCount} commits · click to visit
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
