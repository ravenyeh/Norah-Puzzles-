'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface ImageUploaderProps {
  onImageSelect: (url: string, pieces: 20 | 30 | 40) => void
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedPieces, setSelectedPieces] = useState<20 | 30 | 40>(20)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片檔案！')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleStartGame = () => {
    if (previewUrl) {
      onImageSelect(previewUrl, selectedPieces)
    }
  }

  const pieceOptions: { count: 20 | 30 | 40; label: string; emoji: string }[] = [
    { count: 20, label: '簡單', emoji: '🌟' },
    { count: 30, label: '中等', emoji: '⭐' },
    { count: 40, label: '困難', emoji: '🔥' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card-cute">
        {!previewUrl ? (
          <div
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="text-6xl mb-4 animate-bounce-slow">📸</div>
            <h2 className="text-2xl font-bold text-candy-purple mb-2">
              點擊或拖曳上傳照片
            </h2>
            <p className="text-candy-pink">
              支援 JPG、PNG、GIF 等圖片格式
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview */}
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-80 object-contain rounded-2xl shadow-lg"
              />
              <button
                onClick={() => setPreviewUrl('')}
                className="absolute top-2 right-2 bg-red-500 text-white w-10 h-10 rounded-full
                         opacity-0 group-hover:opacity-100 transition-opacity shadow-lg
                         hover:bg-red-600 flex items-center justify-center text-xl"
              >
                ✕
              </button>
            </div>

            {/* Piece Selection */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-candy-purple text-center">
                🧩 選擇拼圖片數
              </h3>
              <div className="flex justify-center gap-4">
                {pieceOptions.map((option) => (
                  <button
                    key={option.count}
                    onClick={() => setSelectedPieces(option.count)}
                    className={`px-6 py-4 rounded-2xl font-bold transition-all transform
                              ${selectedPieces === option.count
                                ? 'bg-gradient-to-r from-candy-pink to-candy-purple text-white scale-110 shadow-xl'
                                : 'bg-white border-2 border-candy-pink text-candy-purple hover:scale-105'
                              }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-lg">{option.count} 片</div>
                    <div className="text-sm opacity-80">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStartGame}
                className="btn-cute btn-pink text-xl px-12 py-4 animate-wiggle"
              >
                🎮 開始遊戲！
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 card-cute bg-pastel-blue/50">
        <h3 className="text-xl font-bold text-candy-blue mb-4 text-center">
          📖 遊戲說明
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <span className="text-candy-pink">💡</span>
            上傳你喜歡的照片
          </li>
          <li className="flex items-center gap-2">
            <span className="text-candy-pink">💡</span>
            選擇拼圖片數（20、30 或 40 片）
          </li>
          <li className="flex items-center gap-2">
            <span className="text-candy-pink">💡</span>
            拖動拼圖塊到正確位置
          </li>
          <li className="flex items-center gap-2">
            <span className="text-candy-pink">💡</span>
            完成拼圖後會有驚喜！
          </li>
        </ul>
      </div>
    </div>
  )
}
