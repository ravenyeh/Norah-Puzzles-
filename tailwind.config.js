/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        'candy-pink': '#FF6B9D',
        'candy-purple': '#C44EC4',
        'candy-blue': '#4ECDC4',
        'candy-yellow': '#FFE66D',
        'candy-orange': '#FF8B4E',
        'pastel-pink': '#FFE4EC',
        'pastel-purple': '#E8D4F0',
        'pastel-blue': '#D4F0ED',
      },
      fontFamily: {
        cute: ['Comic Sans MS', 'Chalkboard SE', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
