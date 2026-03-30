/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deep': '#0D0D1A',
        'ink': '#1A1A2E',
        'cream': '#F5F0E8',
        'gold': {
          DEFAULT: '#C9A84C',
          light: '#E8C96A',
          dim: 'rgba(201,168,76,0.6)',
          glow: 'rgba(201,168,76,0.18)',
        },
        'scarlet': '#B33A3A',
        'emerald': '#2A7A5A',
        'muted': '#8A8FA8',
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['DM Sans', 'sans-serif'],
        'mono': ['DM Mono', 'monospace'],
      },
      boxShadow: {
        'gold': '0 4px 20px rgba(201,168,76,0.3)',
        'gold-lg': '0 10px 36px rgba(201,168,76,0.55)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C, #E8C96A)',
      }
    },
  },
  plugins: [],
}
