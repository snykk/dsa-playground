// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// GitHub project pages serve the site from https://<owner>.github.io/<repo>/.
// Override SITE_URL / SITE_BASE for a custom domain (e.g. SITE_BASE=/).
const site = process.env.SITE_URL ?? 'https://snykk.github.io';
const base = process.env.SITE_BASE ?? '/dsa-playground';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  integrations: [react(), mdx()],
  // Topic articles (src/content/articles/*.mdx) use the same code style as the README pages.
  markdown: {
    smartypants: false,
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'light',
      wrap: false,
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
