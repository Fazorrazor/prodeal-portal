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
        display: ['var(--font-bebas-neue)', 'sans-serif'],
        heading: ['var(--font-dm-sans)', 'sans-serif'],
        body:    ['var(--font-ibm-plex-sans)', 'sans-serif']
      }
    },
  },
  plugins: [],
};
export default config;
