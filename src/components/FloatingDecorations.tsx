'use client'

import { useEffect, useState } from 'react'

interface Decoration {
  id: number
  emoji: string
  left: number
  top: number
  delay: number
  size: number
}

export default function FloatingDecorations() {
  const [decorations, setDecorations] = useState<Decoration[]>([])

  useEffect(() => {
    const emojis = ['🌟', '💖', '🎀', '🌈', '✨', '🦋', '🌸', '💫', '🍭', '🎈']
    const newDecorations: Decoration[] = []

    for (let i = 0; i < 15; i++) {
      newDecorations.push({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        size: 1.5 + Math.random() * 1.5,
      })
    }

    setDecorations(newDecorations)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {decorations.map((dec) => (
        <div
          key={dec.id}
          className="absolute animate-float opacity-50"
          style={{
            left: `${dec.left}%`,
            top: `${dec.top}%`,
            fontSize: `${dec.size}rem`,
            animationDelay: `${dec.delay}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          {dec.emoji}
        </div>
      ))}
    </div>
  )
}
