import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sicpPics from './src/integrations/sicp-pics.ts';

export default defineConfig({
  site: 'https://nyaaarlathotep.github.io',
  integrations: [
    sitemap(),
    mdx(),
    sicpPics(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
});
