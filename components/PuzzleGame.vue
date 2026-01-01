<template>
  <div class="max-w-4xl mx-auto">
    <!-- Confetti -->
    <div v-if="isComplete" class="fixed inset-0 pointer-events-none z-50">
      <div
        v-for="i in 100"
        :key="i"
        class="confetti"
        :style="{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          backgroundColor: confettiColors[i % confettiColors.length]
        }"
      />
    </div>

    <!-- Game Header -->
    <div class="card-cute mb-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <button class="btn-cute bg-gray-400 hover:bg-gray-500" @click="emit('back')">
          ← 返回
        </button>

        <div class="flex items-center gap-6">
          <div class="text-center">
            <div class="text-sm text-gray-500">進度</div>
            <div class="text-2xl font-bold text-candy-purple">
              {{ placedCount }} / {{ pieceCount }}
            </div>
          </div>
          <div class="text-center">
            <div class="text-sm text-gray-500">時間</div>
            <div class="text-2xl font-bold text-candy-pink">
              ⏱️ {{ formatTime(timer) }}
            </div>
          </div>
        </div>

        <button class="btn-cute btn-blue" @click="showPreview = !showPreview">
          {{ showPreview ? '隱藏' : '顯示' }}原圖
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-candy-pink to-candy-purple transition-all duration-300"
          :style="{ width: `${(placedCount / pieceCount) * 100}%` }"
        />
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreview"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="showPreview = false"
    >
      <div class="bg-white rounded-3xl p-4 max-w-lg w-full">
        <img :src="imageUrl" alt="Original" class="w-full rounded-2xl" />
        <p class="text-center mt-2 text-gray-500">點擊任意處關閉</p>
      </div>
    </div>

    <!-- Puzzle Area -->
    <div class="card-cute">
      <div
        ref="containerRef"
        class="relative mx-auto select-none touch-none"
        :style="{
          width: containerSize.width + 'px',
          height: (containerSize.height + 250) + 'px',
        }"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @touchmove.prevent="handleTouchMove"
        @touchend="handleMouseUp"
      >
        <!-- Puzzle Board -->
        <div
          class="absolute border-4 border-candy-purple/30 rounded-xl bg-white/50"
          :style="{
            width: containerSize.width + 'px',
            height: containerSize.height + 'px',
            top: 0,
            left: 0,
          }"
        >
          <!-- Grid lines -->
          <div
            v-for="i in pieceCount"
            :key="'grid-' + i"
            class="absolute border border-dashed border-candy-pink/20"
            :style="{
              width: pieceWidth + 'px',
              height: pieceHeight + 'px',
              left: ((i - 1) % cols) * pieceWidth + 'px',
              top: Math.floor((i - 1) / cols) * pieceHeight + 'px',
            }"
          />
        </div>

        <!-- Puzzle Pieces -->
        <div
          v-for="piece in pieces"
          :key="piece.id"
          class="puzzle-piece absolute rounded-lg overflow-hidden border-2"
          :class="{
            'border-green-400 correct shadow-green-200': piece.isPlaced,
            'border-candy-purple shadow-2xl z-50 scale-105': draggingPiece === piece.id,
            'border-white shadow-lg hover:border-candy-pink': !piece.isPlaced && draggingPiece !== piece.id
          }"
          :style="{
            width: pieceWidth + 'px',
            height: pieceHeight + 'px',
            left: piece.currentX + 'px',
            top: piece.currentY + 'px',
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: `${containerSize.width}px ${containerSize.height}px`,
            backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`,
            zIndex: piece.isPlaced ? 1 : draggingPiece === piece.id ? 100 : 10,
            cursor: piece.isPlaced ? 'default' : 'grab',
          }"
          @mousedown="(e) => handleMouseDown(e, piece.id)"
          @touchstart="(e) => handleTouchStart(e, piece.id)"
        />
      </div>
    </div>

    <!-- Completion Modal -->
    <div
      v-if="isComplete"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4"
    >
      <div class="card-cute text-center animate-bounce-slow max-w-md w-full">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-3xl font-bold text-candy-purple mb-4">
          恭喜完成！
        </h2>
        <p class="text-xl text-gray-600 mb-2">
          你用了 <span class="font-bold text-candy-pink">{{ formatTime(timer) }}</span> 完成拼圖！
        </p>
        <p class="text-lg text-gray-500 mb-6">
          共 {{ pieceCount }} 片拼圖
        </p>

        <div class="flex justify-center gap-4">
          <button class="btn-cute btn-pink" @click="emit('back')">
            🖼️ 新拼圖
          </button>
          <button class="btn-cute btn-blue" @click="resetGame">
            🔄 再玩一次
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  imageUrl: string
  pieceCount: 6 | 10 | 20
}

interface PuzzlePiece {
  id: number
  correctX: number
  correctY: number
  currentX: number
  currentY: number
  isPlaced: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'back'): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const pieces = ref<PuzzlePiece[]>([])
const draggingPiece = ref<number | null>(null)
const dragOffset = ref({ x: 0, y: 0 })
const isComplete = ref(false)
const timer = ref(0)
const isPlaying = ref(false)
const showPreview = ref(false)
const containerSize = ref({ width: 400, height: 320 })

const confettiColors = ['#FF6B9D', '#C44EC4', '#4ECDC4', '#FFE66D', '#FF8B4E']

// Calculate grid dimensions
const gridDimensions = computed(() => {
  if (props.pieceCount === 6) return { cols: 3, rows: 2 }
  if (props.pieceCount === 10) return { cols: 5, rows: 2 }
  return { cols: 5, rows: 4 } // 20 pieces
})

const cols = computed(() => gridDimensions.value.cols)
const rows = computed(() => gridDimensions.value.rows)
const pieceWidth = computed(() => containerSize.value.width / cols.value)
const pieceHeight = computed(() => containerSize.value.height / rows.value)
const placedCount = computed(() => pieces.value.filter(p => p.isPlaced).length)

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const initializePuzzle = () => {
  const newPieces: PuzzlePiece[] = []
  const scrambleAreaWidth = containerSize.value.width
  const scrambleAreaHeight = 200

  for (let i = 0; i < props.pieceCount; i++) {
    const correctX = (i % cols.value) * pieceWidth.value
    const correctY = Math.floor(i / cols.value) * pieceHeight.value

    newPieces.push({
      id: i,
      correctX,
      correctY,
      currentX: Math.random() * (scrambleAreaWidth - pieceWidth.value),
      currentY: containerSize.value.height + 20 + Math.random() * scrambleAreaHeight,
      isPlaced: false,
    })
  }

  // Shuffle positions
  for (let i = newPieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tempX = newPieces[i].currentX
    const tempY = newPieces[i].currentY
    newPieces[i].currentX = newPieces[j].currentX
    newPieces[i].currentY = newPieces[j].currentY
    newPieces[j].currentX = tempX
    newPieces[j].currentY = tempY
  }

  pieces.value = newPieces
  isPlaying.value = true
  timer.value = 0
  isComplete.value = false
}

const resetGame = () => {
  initializePuzzle()
}

// Mouse handlers
const handleMouseDown = (e: MouseEvent, pieceId: number) => {
  const piece = pieces.value.find(p => p.id === pieceId)
  if (!piece || piece.isPlaced) return

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  draggingPiece.value = pieceId
  dragOffset.value = {
    x: e.clientX - rect.left - piece.currentX,
    y: e.clientY - rect.top - piece.currentY,
  }
}

const handleTouchStart = (e: TouchEvent, pieceId: number) => {
  const piece = pieces.value.find(p => p.id === pieceId)
  if (!piece || piece.isPlaced) return

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  const touch = e.touches[0]
  draggingPiece.value = pieceId
  dragOffset.value = {
    x: touch.clientX - rect.left - piece.currentX,
    y: touch.clientY - rect.top - piece.currentY,
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (draggingPiece.value === null) return

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  const newX = e.clientX - rect.left - dragOffset.value.x
  const newY = e.clientY - rect.top - dragOffset.value.y

  const pieceIndex = pieces.value.findIndex(p => p.id === draggingPiece.value)
  if (pieceIndex !== -1) {
    pieces.value[pieceIndex].currentX = newX
    pieces.value[pieceIndex].currentY = newY
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (draggingPiece.value === null) return

  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return

  const touch = e.touches[0]
  const newX = touch.clientX - rect.left - dragOffset.value.x
  const newY = touch.clientY - rect.top - dragOffset.value.y

  const pieceIndex = pieces.value.findIndex(p => p.id === draggingPiece.value)
  if (pieceIndex !== -1) {
    pieces.value[pieceIndex].currentX = newX
    pieces.value[pieceIndex].currentY = newY
  }
}

const handleMouseUp = () => {
  if (draggingPiece.value === null) return

  const piece = pieces.value.find(p => p.id === draggingPiece.value)
  if (!piece) {
    draggingPiece.value = null
    return
  }

  const snapThreshold = Math.min(pieceWidth.value, pieceHeight.value) * 0.4
  const distX = Math.abs(piece.currentX - piece.correctX)
  const distY = Math.abs(piece.currentY - piece.correctY)

  if (distX < snapThreshold && distY < snapThreshold) {
    const pieceIndex = pieces.value.findIndex(p => p.id === draggingPiece.value)
    if (pieceIndex !== -1) {
      pieces.value[pieceIndex].currentX = pieces.value[pieceIndex].correctX
      pieces.value[pieceIndex].currentY = pieces.value[pieceIndex].correctY
      pieces.value[pieceIndex].isPlaced = true
    }

    // Check completion
    if (pieces.value.every(p => p.isPlaced)) {
      isComplete.value = true
      isPlaying.value = false
    }
  }

  draggingPiece.value = null
}

// Timer
let timerInterval: ReturnType<typeof setInterval> | null = null

watch(isPlaying, (playing) => {
  if (playing && !isComplete.value) {
    timerInterval = setInterval(() => {
      timer.value++
    }, 1000)
  } else if (timerInterval) {
    clearInterval(timerInterval)
  }
})

onMounted(() => {
  // Set container size based on viewport
  const updateSize = () => {
    if (containerRef.value) {
      const parentWidth = containerRef.value.parentElement?.clientWidth || 500
      const size = Math.min(parentWidth - 48, 500)
      containerSize.value = {
        width: size,
        height: size * (rows.value / cols.value)
      }
    }
  }

  updateSize()
  window.addEventListener('resize', updateSize)

  // Initialize puzzle after size is set
  nextTick(() => {
    initializePuzzle()
  })
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: fall 3s ease-out forwards;
}

@keyframes fall {
  to {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>
