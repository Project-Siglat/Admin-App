/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#f44336',
          600: '#e53935',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
        },
        secondary: {
          50: '#fbe9e7',
          100: '#ffccbc',
          200: '#ffab91',
          300: '#ff8a65',
          400: '#ff7043',
          500: '#ff5722',
          600: '#f4511e',
          700: '#e64a19',
          800: '#d84315',
          900: '#bf360c',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'material': '0 2px 4px -1px rgb(0 0 0 / 0.2), 0 4px 5px 0 rgb(0 0 0 / 0.14), 0 1px 10px 0 rgb(0 0 0 / 0.12)',
        'material-lg': '0 5px 5px -3px rgb(0 0 0 / 0.2), 0 8px 10px 1px rgb(0 0 0 / 0.14), 0 3px 14px 2px rgb(0 0 0 / 0.12)',
      },
      animation: {
        'ripple': 'ripple 600ms linear',
      },
      keyframes: {
        ripple: {
          'to': {
            transform: 'scale(4)',
            opacity: '0'
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}