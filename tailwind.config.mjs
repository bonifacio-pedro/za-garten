import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Paleta Solarized (Ethan Schoonover) — tema claro, tom de papel.
        paper: '#fdf6e3', // base3
        'paper-alt': '#eee8d5', // base2
        ink: '#657b83', // base00 — texto de leitura
        'ink-strong': '#586e75', // base01 — títulos e ênfase
        'ink-faint': '#93a1a1', // base1 — metadados, texto secundário
        line: '#eee8d5', // base2 — bordas e separadores
        accent: '#268bd2', // blue
        'accent-warm': '#cb4b16', // orange
        oak: '#7c5a35', // marrom carvalho — hover de títulos e nav
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [typography],
};
