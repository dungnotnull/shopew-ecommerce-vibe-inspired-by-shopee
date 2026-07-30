/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        shopee: {
          primary: '#EE4D2D',
          hover: '#f05d40',
          bg: '#f5f5f5',
          orangeDark: '#d0011b',
        }
      }
    },
  },
  plugins: [],
}
