/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../components/built/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@bitcoin-computer/components/built/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        "blue-1": "#000F38",
        "blue-2": "#002A99",
        "blue-3": "#0046FF",
        "blue-4": "#A7BFFF",
      },
    },
  },
  plugins: [],
};
