/** @type {import('tailwindcss').Config} */
const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: withAlpha('--canvas'),
        'canvas-soft': withAlpha('--canvas-soft'),
        surface: withAlpha('--surface'),
        'surface-2': withAlpha('--surface-2'),
        line: withAlpha('--line'),
        'line-strong': withAlpha('--line-strong'),
        ink: withAlpha('--ink'),
        'ink-soft': withAlpha('--ink-soft'),
        muted: withAlpha('--muted'),
        accent: withAlpha('--accent'),
        'accent-hover': withAlpha('--accent-hover'),
        'accent-soft': withAlpha('--accent-soft'),
        'accent-ink': withAlpha('--accent-ink'),
        violet: withAlpha('--violet'),
        'violet-soft': withAlpha('--violet-soft'),
        gold: withAlpha('--gold'),
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 32px -18px rgb(var(--shadow-color) / 0.35)',
        card: '0 22px 48px -26px rgb(var(--shadow-color) / 0.45)',
        lift: '0 32px 64px -30px rgb(var(--shadow-color) / 0.55)',
        glow: '0 16px 44px -20px rgb(var(--accent) / 0.55)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        rise: 'rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
