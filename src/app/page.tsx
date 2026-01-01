'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import PuzzleGame from '@/components/PuzzleGame'
import Header from '@/components/Header'
import FloatingDecorations from '@/components/FloatingDecorations'

export default function Home() {
  const [gameState, setGameState] = useState<'upload' | 'playing'>('upload')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [pieceCount, setPieceCount] = useState<20 | 30 | 40>(20)

  const handleImageSelect = (url: string, pieces: 20 | 30 | 40) => {
    setImageUrl(url)
    setPieceCount(pieces)
    setGameState('playing')
  }

  const handleBackToUpload = () => {
    setGameState('upload')
    setImageUrl('')
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <FloatingDecorations />
      <Header />

      <div className="container mx-auto px-4 py-8">
        {gameState === 'upload' ? (
          <ImageUploader onImageSelect={handleImageSelect} />
        ) : (
          <PuzzleGame
            imageUrl={imageUrl}
            pieceCount={pieceCount}
            onBack={handleBackToUpload}
          />
        )}
      </div>
    </main>
  )
}
