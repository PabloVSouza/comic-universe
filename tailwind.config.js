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
      },
      colors: {
        // Custom theme colors for light mode
        'text-dark': '#18181b',
        'text-light': '#fafafa',
        'text-default': '#18181b',
        'text-oposite': '#18181b',
        'default': 'rgba(228, 228, 231, 0.7)',
        'oposite': 'rgba(248, 250, 252, 0.8)',
        'list': 'rgba(212, 212, 216, 0.7)',
        'list-item': 'rgba(244, 244, 245, 0.7)',
        'list-item-hover': 'rgba(226, 232, 240, 0.8)',
        'list-item-active': 'rgba(241, 245, 249, 0.8)',
        'modal': 'rgba(228, 228, 231, 0.5)',
        'dark': 'rgba(9, 9, 11, 0.7)',
        'light': 'rgba(248, 250, 252, 0.8)'
      }
    }
  },
  plugins: []
}
