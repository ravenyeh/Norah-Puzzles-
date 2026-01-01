<template>
  <div class="max-w-2xl mx-auto">
    <div class="card-cute">
      <!-- Upload Area -->
      <div
        v-if="!previewUrl"
        class="upload-area"
        :class="{ dragging: isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileInput"
        />
        <div class="text-6xl mb-4 animate-bounce-slow">📸</div>
        <h2 class="text-2xl font-bold text-candy-purple mb-2">
          點擊或拖曳上傳照片
        </h2>
        <p class="text-candy-pink">
          支援 JPG、PNG、GIF 等圖片格式
        </p>
      </div>

      <!-- Preview & Settings -->
      <div v-else class="space-y-6">
        <!-- Preview -->
        <div class="relative group">
          <img
            :src="previewUrl"
            alt="Preview"
            class="w-full max-h-80 object-contain rounded-2xl shadow-lg"
          />
          <button
            class="absolute top-2 right-2 bg-red-500 text-white w-10 h-10 rounded-full
                   opacity-0 group-hover:opacity-100 transition-opacity shadow-lg
                   hover:bg-red-600 flex items-center justify-center text-xl"
            @click="previewUrl = ''"
          >
            ✕
          </button>
        </div>

        <!-- Piece Selection -->
        <div class="space-y-3">
          <h3 class="text-xl font-bold text-candy-purple text-center">
            🧩 選擇拼圖片數
          </h3>
          <div class="flex justify-center gap-4">
            <button
              v-for="option in pieceOptions"
              :key="option.count"
              class="px-6 py-4 rounded-2xl font-bold transition-all transform"
              :class="selectedPieces === option.count
                ? 'bg-gradient-to-r from-candy-pink to-candy-purple text-white scale-110 shadow-xl'
                : 'bg-white border-2 border-candy-pink text-candy-purple hover:scale-105'"
              @click="selectedPieces = option.count"
            >
              <div class="text-2xl mb-1">{{ option.emoji }}</div>
              <div class="text-lg">{{ option.count }} 片</div>
              <div class="text-sm opacity-80">{{ option.label }}</div>
            </button>
          </div>
        </div>

        <!-- Start Button -->
        <div class="text-center">
          <button
            class="btn-cute btn-pink text-xl px-12 py-4 animate-wiggle"
            @click="handleStartGame"
          >
            🎮 開始遊戲！
          </button>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-8 card-cute bg-pastel-blue/50">
      <h3 class="text-xl font-bold text-candy-blue mb-4 text-center">
        📖 遊戲說明
      </h3>
      <ul class="space-y-2 text-gray-700">
        <li class="flex items-center gap-2">
          <span class="text-candy-pink">💡</span>
          上傳你喜歡的照片
        </li>
        <li class="flex items-center gap-2">
          <span class="text-candy-pink">💡</span>
          選擇拼圖片數（6、9 或 20 片）
        </li>
        <li class="flex items-center gap-2">
          <span class="text-candy-pink">💡</span>
          拖動拼圖塊到正確位置
        </li>
        <li class="flex items-center gap-2">
          <span class="text-candy-pink">💡</span>
          完成拼圖後會有驚喜！
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'image-select', data: { url: string; pieces: 6 | 9 | 20 }): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const previewUrl = ref('')
const selectedPieces = ref<6 | 9 | 20>(6)

const pieceOptions = [
  { count: 6 as const, label: '簡單', emoji: '🌟' },
  { count: 9 as const, label: '中等', emoji: '⭐' },
  { count: 20 as const, label: '困難', emoji: '🔥' },
]

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files[0]) {
    handleFile(files[0])
  }
}

const handleFileInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
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
      previewUrl.value = e.target.result as string
    }
  }
  reader.readAsDataURL(file)
}

const handleStartGame = () => {
  if (previewUrl.value) {
    emit('image-select', { url: previewUrl.value, pieces: selectedPieces.value })
  }
}
</script>
