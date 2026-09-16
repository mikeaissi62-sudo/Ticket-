import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          yellow: "#FFB800",
          yellowHover: "#E5A600",
          blue: "#1A3C8F",
          lightBlue: "#2B5CD9",
          white: "#FFFFFF",
          gray: "#F3F4F6",
          darkGray: "#4B5563"
        }
      },
    },
  },
  plugins: [],
};
export default config;
