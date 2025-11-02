/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // src以下の全てのファイルを対象にする
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}