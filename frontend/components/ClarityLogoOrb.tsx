"use client"

import React, { useEffect, useRef } from 'react'

type OrbState = 'idle' | 'listening' | 'thinking' | 'responding'

type Props = {
  size?: number
  state?: OrbState
  className?: string
}

const stateParams: Record<OrbState, { speed: number; amp: number; glow: number }> = {
  idle: { speed: 0.5, amp: 0.7, glow: 0.28 },
  listening: { speed: 0.9, amp: 1.0, glow: 0.33 },
  thinking: { speed: 0.7, amp: 1.3, glow: 0.36 },
  responding: { speed: 1.2, amp: 1.5, glow: 0.40 },
}

export default function ClarityLogoOrb({ size = 240, state = 'idle', className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d', { alpha: true })!

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const W = size * dpr
    const H = size * dpr
    canvas.width = W
    canvas.height = H
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    const cx = W / 2
    const cy = H / 2
    const r = Math.min(W, H) * 0.48

    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const { speed: baseSpeed, amp: baseAmp, glow } = stateParams[state]
    const speed = prefersReduced ? 0.2 : baseSpeed
    let amp = prefersReduced ? baseAmp * 0.6 : baseAmp

    let t = 0

    // helpers
    const clipCircle = () => {
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
    }

    // Signed distance to circle boundary (for subtle inner vignette)
    const drawBase = () => {
      const g = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r * 1.05)
      g.addColorStop(0, 'rgba(10,12,28,0.50)')
      g.addColorStop(1, 'rgba(10,12,28,0.88)')
      ctx.fillStyle = g
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
    }

    const drawRim = () => {
      // glass rim with refraction
      const rimGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
      rimGrad.addColorStop(0, 'rgba(255,255,255,0.35)')
      rimGrad.addColorStop(0.6, 'rgba(255,255,255,0.12)')
      rimGrad.addColorStop(1, 'rgba(255,255,255,0.28)')
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = rimGrad
      ctx.lineWidth = Math.max(2, r * 0.035)
      ctx.stroke()
    }

    const drawSheen = () => {
      // top-left glass sheen
      const grd = ctx.createRadialGradient(
        cx - r * 0.45,
        cy - r * 0.58,
        r * 0.06,
        cx - r * 0.45,
        cy - r * 0.58,
        r * 1.1
      )
      grd.addColorStop(0, 'rgba(255,246,218,0.7)') // #FFF6DA
      grd.addColorStop(0.25, 'rgba(255,255,255,0.22)')
      grd.addColorStop(1, 'rgba(255,255,255,0.0)')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx - r * 0.2, cy - r * 0.35, r * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }

    const wave = (x: number, phase: number) => {
      // Curvature tuned to match the logo's S divider
      const s1 = Math.sin(x * 1.25 + phase) * 0.20
      const s2 = Math.sin(x * 0.55 - phase * 0.85) * 0.10
      const mid = 1 - Math.min(1, Math.abs(x) / 0.92)
      const belly = Math.pow(Math.max(0, mid), 1.2) * 0.10
      return s1 + s2 + belly * (x < 0 ? 1 : -0.65)
    }

    // gradients locked to brand hexes; we only move positions over time
    const gradTop = () => {
      const g = ctx.createLinearGradient(cx - r * 0.8, cy - r * 0.7, cx + r * 0.9, cy + r * 0.9)
      g.addColorStop(0.0, '#8FC8FF')
      g.addColorStop(0.55, '#C58AFF')
      g.addColorStop(1.0, '#F9A9D3')
      return g
    }
    const gradBot = () => {
      const g = ctx.createLinearGradient(cx + r * 0.9, cy + r * 0.9, cx - r * 0.9, cy - r * 0.8)
      g.addColorStop(0.0, '#F9A9D3')
      g.addColorStop(0.6, '#C58AFF')
      g.addColorStop(1.0, '#8FC8FF')
      return g
    }

    const drawLobes = (time: number) => {
      // gentle breathing
      const breath = Math.sin((time / 7) * Math.PI * 2) * 0.08
      amp = prefersReduced ? amp : amp + breath

      // Draw upper and lower lobe by filling above/below the S curve
      const drawLobe = (above = true) => {
        ctx.beginPath()
        ctx.moveTo(cx - r, cy)
        for (let x = -r; x <= r; x += 1.5) {
          const nx = x / r
          const y = wave(nx, time * speed) * amp * r * 0.52
          const yy = cy + y
          ctx.lineTo(cx + x, yy + (above ? -r : r))
        }
        ctx.lineTo(cx + r, cy + (above ? -r : r))
        ctx.lineTo(cx - r, cy + (above ? -r : r))
        ctx.closePath()
        ctx.fillStyle = above ? gradTop() : gradBot()
        ctx.globalCompositeOperation = 'source-over'
        ctx.fill()
      }

      drawLobe(true)
      drawLobe(false)

      // glossy seam along the divider (double pass for bevel)
      const drawEdge = (alpha: number, offset: number) => {
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`
        ctx.lineWidth = Math.max(1, r * 0.018)
        ctx.beginPath()
        for (let x = -r; x <= r; x += 2.2) {
          const nx = x / r
          const y = wave(nx, time * speed) * amp * r * 0.52 + offset
          ctx.lineTo(cx + x, cy + y)
        }
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'overlay'
      drawEdge(0.26, r * 0.006)
      drawEdge(0.12, -r * 0.006)
    }

    const drawHalo = () => {
      // outer glow halo
      const halo = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r * 1.55)
      halo.addColorStop(0, `rgba(197,138,255,${0.25 + glow})`)
      halo.addColorStop(0.65, 'rgba(143,200,255,0.18)')
      halo.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2)
      ctx.fill()
    }

    const loop = (now: number) => {
      t = now / 1000
      ctx.clearRect(0, 0, W, H)

      // background vignette outside the clip (gives premium depth)
      ctx.save()
      drawHalo()
      clipCircle()
      drawBase()
      drawLobes(t)
      drawSheen()
      ctx.restore()
      drawRim()

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [size, state])

  return (
    <div
      className={`relative rounded-full bg-transparent ${className || ''}`}
      style={{ width: size, height: size, filter: 'drop-shadow(0 0 35px rgba(163,102,255,0.35))' }}
      aria-label={`Clarity logo orb - ${state}`}
    >
      <canvas ref={canvasRef} style={{ borderRadius: '50%' }} />
    </div>
  )
}
