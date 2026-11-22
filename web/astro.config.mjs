// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { codeContrast } from './src/lib/codeColors.ts';

// GitHub project pages serve the site from https://<owner>.github.io/<repo>/.
// Override SITE_URL / SITE_BASE for a custom domain (e.g. SITE_BASE=/).
const site = process.env.SITE_URL ?? 'https://snykk.github.io';
const base = process.env.SITE_BASE ?? '/dsa-playground';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [
    react(),
    mdx(),
    // sitemap-index.xml at the base path, with every page but the 404 page (src/pages/robots.txt.ts points to it).
    sitemap({ filter: (page) => !new URL(page).pathname.endsWith('/404/') }),
  ],
  // Topic articles (src/content/articles/*.mdx) use the same code style as the README pages.
  markdown: {
    smartypants: false,
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'light',
      wrap: false,
      // Two token colours of these themes are too faint to read (src/lib/codeColors.ts).
      transformers: [codeContrast],
    },
  },
  // The floating dev toolbar covers page content while reviewing locally.
  devToolbar: { enabled: false },
  build: { format: 'directory' },
  vite: {
    // The site reads READMEs and source files from the repository root.
    server: { fs: { allow: ['..'] } },
  },
});
