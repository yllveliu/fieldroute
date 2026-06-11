/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fieldroute: {
          primary:   "#2563EB", // blue-600
          secondary: "#1E40AF", // blue-800
          accent:    "#06B6D4", // cyan-500
          success:   "#16A34A", // green-600
          warning:   "#D97706", // amber-600
          danger:    "#DC2626", // red-600
          surface:   "#F8FAFC", // slate-50
          border:    "#E2E8F0", // slate-200
          muted:     "#64748B", // slate-500
          dark:      "#0F172A", // slate-900
        },
      },
    },
  },
  plugins: [],
}
