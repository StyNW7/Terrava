/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './*.{js,ts,jsx,tsx,mdx}',
    './src/components/ui/**/*.{ts,tsx}',
    './src/lib/utils.{ts,tsx}'
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
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
        terrava: {
          primary: "#277A4D",
          hover: "#1F633E",
          light: "#E8F3ED",
          "muted-light": "#D6EADF",
          dark: "#163D2A",
          forest: "#102B1D",
          soft: "#D5E8DC",
          bg: "#F7FAF8",
          white: "#FFFFFF",
          text: "#15231B",
          muted: "#607066",
          "muted-2": "#66736B",
          border: "#DCE6DF",
          "border-muted": "#E8EEEA",
          warning: "#D89B32",
          error: "#C95B5B",
          success: "#27875B",
          info: "#4A7FA7",
          neutral: "#88948C",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "0 2px 24px -8px rgba(21, 35, 27, 0.12)",
        card: "0 1px 2px rgba(21, 35, 27, 0.04), 0 8px 24px -12px rgba(21, 35, 27, 0.1)",
        lift: "0 12px 40px -16px rgba(21, 35, 27, 0.22), 0 2px 6px -2px rgba(21, 35, 27, 0.06)",
        glow: "0 0 0 1px rgba(39, 122, 77, 0.18), 0 16px 40px -18px rgba(39, 122, 77, 0.45)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        "grid-soft":
          "linear-gradient(to right, rgba(39,122,77,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(39,122,77,0.07) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(60% 60% at 50% 0%, rgba(39,122,77,0.16) 0%, rgba(39,122,77,0) 70%)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
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
        "fade-in-up": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "ping-slow": {
          "0%": { transform: "scale(0.9)", opacity: 0.8 },
          "70%, 100%": { transform: "scale(1.35)", opacity: 0 },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(39, 122, 77, 0.45)" },
          "70%": { boxShadow: "0 0 0 8px rgba(39, 122, 77, 0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(1.5deg)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        float: "float 4s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        marquee: "marquee 38s linear infinite",
        "ping-slow": "ping-slow 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "pulse-dot": "pulse-dot 2s ease-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
