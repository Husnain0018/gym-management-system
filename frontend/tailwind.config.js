/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#06080C',
          900: '#090B10',
          850: '#0E131F',
          800: '#161D2E',
          750: '#1A2234',
          700: '#232D42',
        },
        borderDark: {
          hairline: '#1E293B',
          active: '#27344D',
          hover: '#334155'
        },
        indigoVolt: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          glow: 'rgba(99, 102, 241, 0.45)',
          muted: 'rgba(99, 102, 241, 0.12)'
        },
        emeraldGlow: {
          DEFAULT: '#10B981',
          neon: '#34D399',
          glow: 'rgba(16, 185, 129, 0.5)',
          muted: 'rgba(16, 185, 129, 0.12)'
        },
        amberAlert: {
          DEFAULT: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.45)',
          muted: 'rgba(245, 158, 11, 0.12)'
        },
        roseDanger: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.45)',
          muted: 'rgba(239, 68, 68, 0.12)'
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-indigo': '0 0 20px -3px rgba(99, 102, 241, 0.45)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.45)',
        'glow-rose': '0 0 20px -3px rgba(239, 68, 68, 0.45)',
        'glass-card': '0 12px 32px -4px rgba(0, 0, 0, 0.6)'
      }
    },
  },
  plugins: [],
}
