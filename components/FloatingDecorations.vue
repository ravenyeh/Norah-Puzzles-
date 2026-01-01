<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
    <div
      v-for="dec in decorations"
      :key="dec.id"
      class="absolute animate-float opacity-50"
      :style="{
        left: `${dec.left}%`,
        top: `${dec.top}%`,
        fontSize: `${dec.size}rem`,
        animationDelay: `${dec.delay}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
      }"
    >
      {{ dec.emoji }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Decoration {
  id: number
  emoji: string
  left: number
  top: number
  delay: number
  size: number
}

const emojis = ['🌟', '💖', '🎀', '🌈', '✨', '🦋', '🌸', '💫', '🍭', '🎈']

const decorations = ref<Decoration[]>([])

onMounted(() => {
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
  decorations.value = newDecorations
})
</script>
