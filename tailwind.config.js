module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      corlors: {
        top: "#4268B3",
      },
      backgroundColor: {
        facebook: "#4268B3",
        default: "#262c35",
      },
      maxWidth: {
        10: "2.5rem",
        "2/3": "66.6667%",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
