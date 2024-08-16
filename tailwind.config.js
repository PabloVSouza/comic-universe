import { createThemes } from 'tw-colors'
import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    createThemes({
      dark: {
        'text-default': colors.slate[50],
        'text-oposite': colors.slate[750],
        'list-item-bg': colors.slate[750],
        'list-item-bg-highlight': colors.slate[50]
      }
    })
  ]
}
