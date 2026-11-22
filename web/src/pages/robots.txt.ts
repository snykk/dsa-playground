import type { APIRoute } from 'astro';

/**
 * robots.txt: everything may be crawled, and the sitemap (from @astrojs/sitemap) is at the base
 * path. Made from `site` and `base` rather than kept in public/, so it stays right when the site
 * is built for another address (SITE_URL / SITE_BASE in astro.config.mjs). Crawlers only read
 * robots.txt at the root of a host, so it takes effect with a custom domain and SITE_BASE=/.
 */
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('robots.txt needs `site` in astro.config.mjs');
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const sitemap = new URL(`${base}sitemap-index.xml`, site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
