/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        100: "26.6rem",
        120: "40rem",
      },
      width: {
        100: "26.6rem",
      },
      colors: {
        'grey1': '#393939',
        'grey2': '#999999',
        'grey3': '#d5d5d5',
        'grey4': '#f1f1f1',
      },
    },
  },
  plugins: [],
};
