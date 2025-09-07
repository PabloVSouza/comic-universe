const { createThemes } = require('tw-colors')
const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')

const addTransparency = (color, transparency) => {
  const splitColor = color.substring(1)

  const hexTransparency = Math.round((transparency * 100 * 255) / 100).toString(16)

  const finalColor = `#${splitColor}${hexTransparency}`

  return finalColor
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans']
      },
      transform: {
        '3d': 'translate3d(0, 0, 0)'
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.075, 0.82, 0.165, 1)'
      },
      transitionProperty: {
        fade: 'opacity, visibility',
        'move-fade': 'transform, visibility'
      },
      aspectRatio: {
        portrait: '9 / 16',
        '10/16': '10 / 16'
      },
      boxShadow: {
        basic: '3px 7px 16px -5px rgba(0, 0, 0, 0.75)'
      }
    }
  },

  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'translate-3d': (value) => ({
            '--tw-translate-3d': value,
            transform: `translate3d(${value},${value},${value})`
          })
        },
        { values: theme('translate'), supportsNegativeValues: true }
      )
    }),
    createThemes({
      light: {
        'text-dark': colors.zinc[900],
        'text-light': colors.zinc[50],
        dark: addTransparency(colors.zinc[950], 0.7),
        light: addTransparency(colors.slate[50], 0.8),
        'text-default': colors.zinc[900],
        'text-oposite': colors.zinc[900],
        default: addTransparency(colors.zinc[200], 0.7),
        oposite: addTransparency(colors.slate[50], 0.8),
        list: addTransparency(colors.zinc[300], 0.7),
        'list-item': addTransparency(colors.zinc[100], 0.7),
        'list-item-hover': addTransparency(colors.slate[200], 0.8),
        'list-item-active': addTransparency(colors.slate[100], 0.8),
        modal: addTransparency(colors.zinc[200], 0.5)
      },
      dark: {
        'text-dark': colors.zinc[900],
        'text-light': colors.zinc[50],
        dark: addTransparency(colors.zinc[950], 0.7),
        light: addTransparency(colors.slate[50], 0.8),
        'text-default': colors.zinc[50],
        'text-oposite': colors.zinc[900],
        default: addTransparency(colors.zinc[950], 0.7),
        oposite: addTransparency(colors.slate[50], 0.8),
        list: addTransparency(colors.zinc[950], 0.7),
        'list-item': addTransparency(colors.zinc[950], 0.7),
        'list-item-hover': addTransparency(colors.slate[50], 0.6),
        'list-item-active': addTransparency(colors.slate[50], 0.8),
        modal: addTransparency(colors.zinc[800], 0.5)
      }
    })
  ]
}
