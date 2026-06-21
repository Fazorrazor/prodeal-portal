import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          'deep-blue': '#0A1628',
          'blue':      '#1A56DB',
          'red':       '#E02424',
          'blue-muted':'#3B5998',
          'surface':   '#F3F6FB',
          'border':    '#CBD5E1',
        }
      },
      fontFamily: {
        display: ['Roghin', 'var(--font-montserrat)', 'sans-serif'],
        heading: ['Roghin', 'var(--font-montserrat)', 'sans-serif'],
        body:    ['var(--font-roboto)', 'sans-serif']
      }
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
export default config;
