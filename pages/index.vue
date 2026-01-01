<template>
  <main class="min-h-screen relative overflow-hidden">
    <FloatingDecorations />
    <AppHeader />

    <div class="container mx-auto px-4 py-8">
      <ImageUploader
        v-if="gameState === 'upload'"
        @image-select="handleImageSelect"
      />
      <PuzzleGame
        v-else
        :image-url="imageUrl"
        :piece-count="pieceCount"
        @back="handleBackToUpload"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
const gameState = ref<'upload' | 'playing'>('upload')
const imageUrl = ref('')
const pieceCount = ref<20 | 30 | 40>(20)

const handleImageSelect = (data: { url: string; pieces: 20 | 30 | 40 }) => {
  imageUrl.value = data.url
  pieceCount.value = data.pieces
  gameState.value = 'playing'
}

const handleBackToUpload = () => {
  gameState.value = 'upload'
  imageUrl.value = ''
}
</script>
