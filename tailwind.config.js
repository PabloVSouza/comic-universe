const plugin = require('tailwindcss/plugin')

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
    })
  ]
}
