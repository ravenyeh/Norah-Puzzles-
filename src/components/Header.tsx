'use client'

export default function Header() {
  return (
    <header className="text-center py-8">
      <div className="inline-block animate-float">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-candy-pink via-candy-purple to-candy-blue bg-clip-text text-transparent drop-shadow-lg">
          🧩 可愛拼圖遊戲
        </h1>
      </div>
      <p className="mt-4 text-xl text-candy-purple/80 animate-pulse">
        ✨ 上傳照片，開始你的拼圖冒險！ ✨
      </p>
    </header>
  )
}
