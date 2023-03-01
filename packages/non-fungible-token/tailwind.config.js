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
    },
  },
  plugins: [],
};
