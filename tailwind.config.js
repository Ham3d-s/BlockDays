/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        vazirmatn: ['Vazirmatn', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'bounce': 'bounce 1s infinite',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      { // Custom light theme
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#2563eb', // blue-600
          secondary: '#7c3aed', // violet-600
          accent: '#14b8a6', // teal-500
          // You can add other color overrides here:
          // "base-100": "#ffffff",
          // "info": "#2094f3",
          // "success": "#009485",
          // "warning": "#ff9900",
          // "error": "#ff5724",
        },
      },
      { // Custom dark theme (named 'night' in DaisyUI, but we can use 'dark' in our switcher logic if we map)
        night: { // This is the actual theme name DaisyUI will look for.
          ...require('daisyui/src/theming/themes')['night'],
          primary: '#60a5fa', // blue-400
          secondary: '#a78bfa', // violet-400
          accent: '#2dd4bf', // teal-400
           // Example: Ensure base-100 is dark enough for good contrast if needed
          // "base-100": "#1d232a", // Default night base-100
        },
      },
      "cupcake",    // Standard DaisyUI theme
      "synthwave",  // Standard DaisyUI theme
      "retro",      // Standard DaisyUI theme
      "dracula",    // Standard DaisyUI theme
    ],
    rtl: true,
    darkTheme: "night", // Explicitly specify that 'night' is the dark theme for DaisyUI's internal logic
  },
};