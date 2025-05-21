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
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#2563eb',
          secondary: '#7c3aed',
          accent: '#14b8a6',
        },
        night: {
          ...require('daisyui/src/theming/themes')['night'],
          primary: '#60a5fa',
          secondary: '#a78bfa',
          accent: '#2dd4bf',
        },
      },
    ],
    rtl: true,
  },
};