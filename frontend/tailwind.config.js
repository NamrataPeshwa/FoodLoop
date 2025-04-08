/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        merriweather: ["Merriweather", "serif"],
        rouge: ["Rouge Script", "cursive"],
        Birthstone: ["Birthstone", "serif"],
      
      },
      colors: {
        colour1: '#FFA725', 
        colour2: '#FFF5E4', 
        colour3: '#C1D8C3', 
        colour4: '#6A9C89',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'scroll-left': 'scroll 30s linear infinite',
      },
    },

  },
  plugins: [],
};
