'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Confetti from 'react-confetti'

interface PuzzleGameProps {
  imageUrl: string
  pieceCount: 20 | 30 | 40
  onBack: () => void
}

interface PuzzlePiece {
  id: number
  correctX: number
  correctY: number
  currentX: number
  currentY: number
  isPlaced: boolean
}

export default function PuzzleGame({ imageUrl, pieceCount, onBack }: PuzzleGameProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [draggingPiece, setDraggingPiece] = useState<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isComplete, setIsComplete] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Calculate grid dimensions based on piece count
  const getGridDimensions = (count: number) => {
    if (count === 20) return { cols: 5, rows: 4 }
    if (count === 30) return { cols: 6, rows: 5 }
    return { cols: 8, rows: 5 } // 40 pieces
  }

  const { cols, rows } = getGridDimensions(pieceCount)
  const pieceWidth = containerSize.width / cols
  const pieceHeight = containerSize.height / rows

  // Initialize puzzle
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const size = Math.min(rect.width, 500)
        setContainerSize({ width: size, height: size * (rows / cols) })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [cols, rows])

  useEffect(() => {
    if (containerSize.width === 0) return

    const newPieces: PuzzlePiece[] = []
    const scrambleAreaWidth = containerSize.width
    const scrambleAreaHeight = 200

    for (let i = 0; i < pieceCount; i++) {
      const correctX = (i % cols) * pieceWidth
      const correctY = Math.floor(i / cols) * pieceHeight

      newPieces.push({
        id: i,
        correctX,
        correctY,
        currentX: Math.random() * (scrambleAreaWidth - pieceWidth),
        currentY: containerSize.height + 20 + Math.random() * scrambleAreaHeight,
        isPlaced: false,
      })
    }

    // Shuffle the pieces
    for (let i = newPieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tempX = newPieces[i].currentX
      const tempY = newPieces[i].currentY
      newPieces[i].currentX = newPieces[j].currentX
      newPieces[i].currentY = newPieces[j].currentY
      newPieces[j].currentX = tempX
      newPieces[j].currentY = tempY
    }

    setPieces(newPieces)
    setIsPlaying(true)
    setTimer(0)
    setIsComplete(false)
  }, [pieceCount, containerSize, cols, rows, pieceWidth, pieceHeight])

  // Timer
  useEffect(() => {
    if (!isPlaying || isComplete) return

    const interval = setInterval(() => {
      setTimer((t) => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, isComplete])

  // Mouse/Touch handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, pieceId: number) => {
    const piece = pieces.find((p) => p.id === pieceId)
    if (!piece || piece.isPlaced) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    setDraggingPiece(pieceId)
    setDragOffset({
      x: e.clientX - rect.left - piece.currentX,
      y: e.clientY - rect.top - piece.currentY,
    })
  }, [pieces])

  const handleTouchStart = useCallback((e: React.TouchEvent, pieceId: number) => {
    const piece = pieces.find((p) => p.id === pieceId)
    if (!piece || piece.isPlaced) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const touch = e.touches[0]
    setDraggingPiece(pieceId)
    setDragOffset({
      x: touch.clientX - rect.left - piece.currentX,
      y: touch.clientY - rect.top - piece.currentY,
    })
  }, [pieces])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingPiece === null) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    setPieces((prev) =>
      prev.map((p) =>
        p.id === draggingPiece ? { ...p, currentX: newX, currentY: newY } : p
      )
    )
  }, [draggingPiece, dragOffset])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (draggingPiece === null) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const touch = e.touches[0]
    const newX = touch.clientX - rect.left - dragOffset.x
    const newY = touch.clientY - rect.top - dragOffset.y

    setPieces((prev) =>
      prev.map((p) =>
        p.id === draggingPiece ? { ...p, currentX: newX, currentY: newY } : p
      )
    )
  }, [draggingPiece, dragOffset])

  const handleMouseUp = useCallback(() => {
    if (draggingPiece === null) return

    const piece = pieces.find((p) => p.id === draggingPiece)
    if (!piece) {
      setDraggingPiece(null)
      return
    }

    const snapThreshold = Math.min(pieceWidth, pieceHeight) * 0.4
    const distX = Math.abs(piece.currentX - piece.correctX)
    const distY = Math.abs(piece.currentY - piece.correctY)

    if (distX < snapThreshold && distY < snapThreshold) {
      setPieces((prev) => {
        const updated = prev.map((p) =>
          p.id === draggingPiece
            ? { ...p, currentX: p.correctX, currentY: p.correctY, isPlaced: true }
            : p
        )

        // Check if all pieces are placed
        const allPlaced = updated.every((p) => p.isPlaced)
        if (allPlaced) {
          setIsComplete(true)
          setIsPlaying(false)
        }

        return updated
      })
    }

    setDraggingPiece(null)
  }, [draggingPiece, pieces, pieceWidth, pieceHeight])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const placedCount = pieces.filter((p) => p.isPlaced).length

  return (
    <div className="max-w-4xl mx-auto">
      {isComplete && (
        <Confetti
          width={typeof window !== 'undefined' ? window.innerWidth : 500}
          height={typeof window !== 'undefined' ? window.innerHeight : 500}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Game Header */}
      <div className="card-cute mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="btn-cute bg-gray-400 hover:bg-gray-500"
          >
            ← 返回
          </button>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">進度</div>
              <div className="text-2xl font-bold text-candy-purple">
                {placedCount} / {pieceCount}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">時間</div>
              <div className="text-2xl font-bold text-candy-pink">
                ⏱️ {formatTime(timer)}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-cute btn-blue"
          >
            {showPreview ? '隱藏' : '顯示'}原圖
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-candy-pink to-candy-purple transition-all duration-300"
            style={{ width: `${(placedCount / pieceCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
             onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-3xl p-4 max-w-lg w-full">
            <img src={imageUrl} alt="Original" className="w-full rounded-2xl" />
            <p className="text-center mt-2 text-gray-500">點擊任意處關閉</p>
          </div>
        </div>
      )}

      {/* Puzzle Area */}
      <div className="card-cute">
        <div
          ref={containerRef}
          className="relative mx-auto select-none touch-none"
          style={{
            width: containerSize.width || '100%',
            height: (containerSize.height || 300) + 250,
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Puzzle Board */}
          <div
            className="absolute border-4 border-candy-purple/30 rounded-xl bg-white/50"
            style={{
              width: containerSize.width,
              height: containerSize.height,
              top: 0,
              left: 0,
            }}
          >
            {/* Grid lines */}
            {Array.from({ length: cols * rows }).map((_, i) => (
              <div
                key={`grid-${i}`}
                className="absolute border border-dashed border-candy-pink/20"
                style={{
                  width: pieceWidth,
                  height: pieceHeight,
                  left: (i % cols) * pieceWidth,
                  top: Math.floor(i / cols) * pieceHeight,
                }}
              />
            ))}
          </div>

          {/* Puzzle Pieces */}
          {pieces.map((piece) => (
            <div
              key={piece.id}
              className={`puzzle-piece absolute rounded-lg overflow-hidden border-2
                         ${piece.isPlaced
                           ? 'border-green-400 correct shadow-green-200'
                           : draggingPiece === piece.id
                           ? 'border-candy-purple shadow-2xl z-50 scale-105'
                           : 'border-white shadow-lg hover:border-candy-pink'
                         }`}
              style={{
                width: pieceWidth,
                height: pieceHeight,
                left: piece.currentX,
                top: piece.currentY,
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: `${containerSize.width}px ${containerSize.height}px`,
                backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`,
                zIndex: piece.isPlaced ? 1 : draggingPiece === piece.id ? 100 : 10,
                cursor: piece.isPlaced ? 'default' : 'grab',
              }}
              onMouseDown={(e) => handleMouseDown(e, piece.id)}
              onTouchStart={(e) => handleTouchStart(e, piece.id)}
            />
          ))}
        </div>
      </div>

      {/* Completion Modal */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="card-cute text-center animate-bounce-slow max-w-md w-full">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-candy-purple mb-4">
              恭喜完成！
            </h2>
            <p className="text-xl text-gray-600 mb-2">
              你用了 <span className="font-bold text-candy-pink">{formatTime(timer)}</span> 完成拼圖！
            </p>
            <p className="text-lg text-gray-500 mb-6">
              共 {pieceCount} 片拼圖
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={onBack}
                className="btn-cute btn-pink"
              >
                🖼️ 新拼圖
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-cute btn-blue"
              >
                🔄 再玩一次
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
