import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0C0E',
        surface: '#141518',
        'surface-2': '#1C1E22',
        'surface-3': '#23262B',
        line: '#26292E',
        'line-2': '#34383E',
        fg: '#F4F5F7',
        fg2: '#A1A6AE',
        fg3: '#6B7280',
        fg4: '#4B5159',
        accent: '#FACC15',
        'accent-bg': '#3D330A',
        success: '#4ADE80',
        'success-bg': '#0F2A1A',
        warning: '#FBBF24',
        'warning-bg': '#3D2E0A',
        error: '#F87171',
        'error-bg': '#3D1A1A',
        info: '#60A5FA',
        'info-bg': '#15243D',
        purple: '#A78BFA',
        'purple-bg': '#241B3D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.03em',
      },
    },
  },
  plugins: [],
};
export default config;
