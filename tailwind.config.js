/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // Neon Blue
        slate: {
          950: '#0F172A', // Deep Slate Background
        },
        success: '#10B981', // Emerald Green
      },
      backgroundColor: {
        base: '#0F172A', // Deep Slate for body
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
