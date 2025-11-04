'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'

type OrbState = 'idle' | 'listening' | 'thinking' | 'responding'

export function ClarityOrb({ state = 'idle', size = 180 }: { state?: OrbState; size?: number }) {
  const reduce = useReducedMotion()
  const color = useMemo(() => ({
    idle: 'conic-gradient(from 180deg, #8FC8FF, #C58AFF, #F9A9D3, #8FC8FF)',
    listening: 'conic-gradient(from 180deg, #8FC8FF, #C58AFF)',
    thinking: 'conic-gradient(from 180deg, #C58AFF, #F9A9D3)',
    responding: 'conic-gradient(from 180deg, #8FC8FF, #F9A9D3)'
  }[state]), [state])

  const pulse = !reduce ? {
    scale: [1, 1.06, 1],
    filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'],
    transition: { duration: 2.4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }
  } : {}

  return (
    <div style={{ width: size, height: size }} className="relative">
      <motion.div
        style={{
          width: size, height: size,
          backgroundImage: color,
          border: '1px solid #FFFFFF15',
          boxShadow: '0 0 40px rgba(197, 138, 255, 0.35)',
          filter: 'blur(0.2px)'
        }}
        className="rounded-full" animate={pulse}
      />
      {!reduce && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </div>
  )
}
