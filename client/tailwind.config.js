/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          300: '#69c0ff',
          400: '#40a9ff',
          500: '#2ea3f2',
          600: '#1890ff',
          700: '#096dd9',
          800: '#0050b3',
          900: '#003a8c',
        },
        secondary: {
          50: '#fff7e6',
          100: '#ffe7ba',
          200: '#ffd591',
          300: '#ffc069',
          400: '#ffa940',
          500: '#ff9520',
          600: '#fa8c16',
          700: '#d46b08',
          800: '#ad4e00',
          900: '#873800',
        },
        accent: {
          50: '#f0f5ff',
          100: '#d6e4ff',
          200: '#adc6ff',
          300: '#85a5ff',
          400: '#597ef7',
          500: '#2f54eb',
          600: '#1d39c4',
          700: '#10239e',
          800: '#061178',
          900: '#030852',
        },
        dark: {
          DEFAULT: '#32373c',
          light: '#4a5056',
          lighter: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2ea3f2 0%, #1890ff 100%)',
        'gradient-warm': 'linear-gradient(135deg, #ff9520 0%, #fa8c16 100%)',
      },
    },
  },
  plugins: [],
}
