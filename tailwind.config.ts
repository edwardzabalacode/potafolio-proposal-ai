import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent-green': 'var(--accent-green)',
        'accent-green-dim': 'var(--accent-green-dim)',
        'accent-yellow': 'var(--accent-yellow)',
        border: 'var(--border)',
      },
      boxShadow: {
        brutal: 'none',
        'brutal-hover': 'none',
        'brutal-large': 'none',
        'brutal-large-hover': 'none',
      },
      borderRadius: {
        DEFAULT: '12px',
      },
      fontFamily: {
        mono: ['Space Mono', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
