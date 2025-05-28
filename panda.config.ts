import { defineConfig } from '@pandacss/dev'
import { createPreset } from '@park-ui/panda-preset'
import amber from '@park-ui/panda-preset/colors/amber'
import sand from '@park-ui/panda-preset/colors/sand'

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: [
    '@pandacss/preset-panda',
    createPreset({ accentColor: amber, grayColor: sand, radius: 'sm' })
  ],
  // Where to look for your css declarations
  include: ['./src/renderer/**/*.{js,jsx,ts,tsx}'],
  jsxFramework: 'react',
  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      keyframes: {
        ripple: {
          '0%': {
            transform: 'translate(-50%, -50%) scale(1)'
          },
          '50%': {
            transform: 'translate(-50%, -50%) scale(0.9)'
          },
          '100%': {
            transform: 'translate(-50%, -50%) scale(1)'
          }
        }
      },
      tokens: {
        colors: {
          stealth: {
            DEFAULT: { value: '#8B5CF6' },
            purple: { value: '#8B5CF6' },
            blue: { value: '#0EA5E9' },
            pink: { value: '#EC4899' },
            orange: { value: '#F97316' },
            dark: { value: '#0F172A' }
          }
        }
      }
    }
  },
  globalCss: {
    extend: {
      body: {
        color: 'white'
      }
    }
  },

  // The output directory for your css system
  outdir: 'src/renderer/styled-system'
})
