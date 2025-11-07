/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        text: "hsl(var(--text))",
        button1: "hsl(var(--button1))","button-text": "hsl(var(--button-text))",
        accent: "hsl(var(--accent))",

        // optional but useful UI surfaces
        card: "hsl(var(--card))",
        form: "hsl(var(--form))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))", 
        danger: "hsl(var(--danger))",
      },
        boxShadow: {
          soft: "0 4px 12px hsl(var(--shadow) / 0.2)",
          md: "0 6px 18px hsl(var(--shadow) / 0.3)",
          strong: "0 10px 30px hsl(var(--shadow) / 0.4)",
      },
    },
  },
  plugins: [],
}
