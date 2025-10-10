import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
        'short': { 'raw': '(max-height: 599px)' },
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        avantar: {
          primary: "hsl(var(--avantar-primary))",
          secondary: "hsl(var(--avantar-secondary))",
          "purple-light": "hsl(var(--avantar-purple-light))",
          yellow: "hsl(var(--avantar-yellow))",
          teal: "hsl(var(--avantar-teal))",
          "teal-dark": "hsl(var(--avantar-teal-dark))",
          dark: "hsl(var(--avantar-dark))",
          orange: "hsl(var(--avantar-orange))",
          light: "hsl(var(--avantar-light))",
          lavender: "hsl(var(--avantar-lavender))",
          "lavender-light": "hsl(var(--avantar-lavender-light))",
          "lavender-dark": "hsl(var(--avantar-lavender-dark))",
        },
        "primary-purple": "#4A04A5",
        "secondary-purple": "#6500CC",
        "tertiary-purple": "#3E0085",
        "tertiary-purple-opacity": "rgba(62, 0, 133, 0.5)",
        "fourth-purple": "#6800E0",
        "fifth-purple": "#170138",
        "sixteen-purple": "#8822ED",
        pink: "#C252F2",
        blue: "#29F3DF",
        "blue-light": "#7AFFF2",
        "blue-navigator": "#00D2BE",
        orange: "#E06400",
        "second-orange": "#F28907",
        yellow: "#F1B808",
        "primary-lillac": "#9F8CF2",
        "secondary-lillac": "#B270FF",
        "tertiary-lillac": "#A556FF",
        black: "#000000",
        "purple-black": "#0F0124",
        white: "#F6F3FF",
        "white-navBar": "#E3E3E3",
        "white-btn-modal": "#F4F4F4",
        "white-opacity": "#FFFFFFD4",
        gray: "#CDCDCD",
        red: "#FF0000",
        transparent: "transparent",
        green: "#32CD32",
        "dark-blue": "#0EC8B5",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      borderWidth: {
        '5': '5px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
