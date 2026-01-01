import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🧩 可愛拼圖遊戲 | Cute Puzzle Game',
  description: '上傳你的照片，享受拼圖的樂趣！',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
