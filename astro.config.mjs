import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkReadingTime from './src/utils/remark-reading-time.mjs';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://jardim-digital.vercel.app', // troque pelo domínio final
  output: 'static', // build 100% estático, ideal para Vercel
  integrations: [
    mdx(),
    tailwind({ applyBaseStyles: false }),
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkReadingTime],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'solarized-light',
      wrap: true,
    },
  },
});
