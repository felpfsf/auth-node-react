/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090A'
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      },
      gridTemplateColumns: {
        7: 'repeat(7,minmax(0,1fr))'
      },
      gridTemplateRows: {
        7: 'repeat(7,minmax(0,1fr))'
      }
    }
  },
  plugins: []
}
