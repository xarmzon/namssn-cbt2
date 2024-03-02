const colors = require("tailwindcss/colors");

module.exports = {
  mode: "jit",
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1100px",
      },
    },
    extend: {
      colors: {
        primary: "#3e0587",
        "primary-light-50": "#FACDCD",
        "primary-light-100": "#F09393",
        "primary-deep": "#064E3B",
        color1: "#0a0d46",
        secondary: colors.coolGray["700"],
        ascent: colors.amber["600"],
        "ascent-light": colors.amber["400"],
      },
      fontFamily: {
        brand: ["nunito", "helvetica", "sans-serif"],
      },
      backgroundImage: {
        book: `url('/assets/images/bg_img.jpg')`,
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
