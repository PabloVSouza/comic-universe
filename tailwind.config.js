import { createThemes } from 'tw-colors'
import colors from 'tailwindcss/colors'

const addTransparency = (color, transparency) => {
  const splitColor = color.substring(1)

  const hexTransparency = Math.round((transparency * 100 * 255) / 100).toString(16)

  const finalColor = `#${splitColor}${hexTransparency}`

  return finalColor
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    createThemes({
      light: {
        'text-default': colors.zinc[900],
        'text-oposite': colors.zinc[900],
        list: addTransparency(colors.zinc[300], 0.7),
        'list-item': addTransparency(colors.zinc[300], 0.7),
        'list-item-hover': addTransparency(colors.slate[50], 0.6),
        'list-item-active': addTransparency(colors.slate[50], 0.8)
      },
      dark: {
        'text-default': colors.zinc[50],
        'text-oposite': colors.zinc[900],
        list: addTransparency(colors.zinc[950], 0.7),
        'list-item': addTransparency(colors.zinc[950], 0.7),
        'list-item-hover': addTransparency(colors.slate[50], 0.6),
        'list-item-active': addTransparency(colors.slate[50], 0.8)
      }
    })
  ]
}
