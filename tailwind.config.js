/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#b71c1c',
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 15s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '33.33%': { transform: 'translateX(0%)' },
          '36.66%': { transform: 'translateX(-100%)' },
          '66.66%': { transform: 'translateX(-100%)' },
          '70%': { transform: 'translateX(-200%)' },
          '100%': { transform: 'translateX(-200%)' },
        }
      }
    },
  },
  plugins: [],
}
