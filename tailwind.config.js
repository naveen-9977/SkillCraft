/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // primary: "#EA5D74",
        primary: "#0088CC",

        // from here just for fun
        // primary: "#0ea5e9", //sky
        // primary: "#6366f1", //indigo
        // primary: "#8b5cf6", //violet
        // primary: "#a855f7", //purple
        // primary: "#ec4899", //pink
        // primary: "#f43f5e", //rose
      },
    },
  },
  plugins: [],
};
