/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#E9ECEF',
        mainText: '#0F172A',
        mutedText: '#475569',
        primary: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          bright: '#14B8A6',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#B45309',
        },
        badge: {
          verifiedBg: '#DCFCE7',
          verifiedText: '#15803D',
          pendingBg: '#FEF3C7',
          pendingText: '#B45309',
          rejectedBg: '#FEE2E2',
          rejectedText: '#DC2626',
        },
        danger: '#EF4444',
        food: {
          veg: '#16A34A',
          nonveg: '#DC2626',
        },
        star: '#FACC15',
        role: {
          student: '#14B8A6',
          pgOwner: '#3B82F6',
          messOwner: '#F97316',
          admin: '#8B5CF6',
        }
      },
      borderRadius: {
        '2xl': '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 30px rgba(0, 0, 0, 0.06)',
        'glass-hover': '0 12px 35px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}

