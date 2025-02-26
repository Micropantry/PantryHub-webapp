import { background, extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: `'Poppins', sans-serif`, // Apply Poppins font to all headings
    body: `'Poppins', sans-serif`,   // Apply Poppins font to all body text
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "22px",
    "3xl": "30px",
    "4xl": "36px",
    "5xl": "48px",
    "6xl": "64px",
  },
  colors: {
    text:{
        300: "#969696", // Tertiary text color
        400: "#6F6F6F", // Secondary text color
        500: "#3B3D3E", // Primary text color
    },
    primary: "#009C1F",
    darkgreen: "#345E3D",
    babyblue: "#A9BDEC",
    lightgreen: "#B7DF8F",
    background:"#F6F6F6"
  }
});

export default theme;
