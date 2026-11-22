import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { areaOf, cardSvg, OG_HOME, siteLabel, type OgCard } from '../../lib/og';
import { cardFonts } from '../../lib/ogFonts';
import { getContent, topicsUnder } from '../../lib/repo';
import { VIZ_CATALOG } from '../../viz/catalog';

/**
 * Link-preview images: og/<page slug>.png for every page, og/home.png for the home page (the
 * 404 page uses it too). The titles are the ones the pages show: an article's or overview's
 * own title, else the README's. BaseLayout points og:image here through ogImagePath().
 * Under `astro dev` a dynamic route keeps the site's trailing slash: og/<slug>.png/ there.
 */
export const getStaticPaths = (async () => {
  const content = getContent();
  const articles = new Map((await getCollection('articles')).map((a) => [a.data.topic, a.data.title]));
  const overviews = new Map((await getCollection('categories')).map((c) => [c.data.category, c.data.title]));
  const pages = new Map((await getCollection('pages')).map((p) => [p.data.page, p.data.title]));
  const topics = topicsUnder(content.root).length;
  const everywhere = `${topics} topics in Python, C++ and Go`;

  const cards: OgCard[] = [
    { slug: OG_HOME, title: 'Step through data structures and algorithms on your own input', area: '', note: everywhere },
    { slug: 'visualizations', title: 'Visualizations', area: '', note: `${VIZ_CATALOG.length} visualizations that run on your own input` },
    ...content.nodes.map((node) => {
      const count = topicsUnder(node).length;
      return {
        slug: node.slug,
        title: (node.kind === 'topic' ? articles.get(node.rel) : overviews.get(node.rel)) ?? node.title,
        area: areaOf(node),
        note: node.kind === 'category' && count > 0 ? `${count} ${count === 1 ? 'topic' : 'topics'}` : undefined,
      };
    }),
    ...content.standalone.map((doc) => ({
      slug: doc.slug,
      title: pages.get(doc.slug) ?? doc.title,
      area: '',
      note: doc.slug === 'overview' ? everywhere : undefined,
    })),
  ];
  const seen = new Set<string>();
  for (const card of cards) {
    if (seen.has(card.slug)) throw new Error(`Two link-preview images are named og/${card.slug}.png`);
    seen.add(card.slug);
  }
  // Astro asks for the images one at a time, but a build needs all of them: start them all here
  // so sharp rasterizes several at once on its thread pool instead of one after another.
  if (import.meta.env.PROD) for (const card of cards) png(card);
  return cards.map((card) => ({ params: { slug: card.slug }, props: { card } }));
}) satisfies GetStaticPaths;

const pngs = new Map<string, Promise<Buffer>>();

/** The card as a PNG, made once. */
function png(card: OgCard): Promise<Buffer> {
  let made = pngs.get(card.slug);
  if (!made) {
    const svg = cardSvg(card, cardFonts(), siteLabel(import.meta.env.SITE, import.meta.env.BASE_URL));
    // Truecolor at the default zlib level: about 60 KB and 15 ms a card. A palette PNG is half
    // the size but three to four times slower to make, and only link unfurlers fetch these files.
    made = sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toBuffer();
    // GET awaits it and reports a failure; this only keeps Node from calling it unhandled first.
    made.catch(() => undefined);
    pngs.set(card.slug, made);
  }
  return made;
}

interface Props {
  card: OgCard;
}

export const GET: APIRoute<Props> = async ({ props }) => {
  return new Response(new Uint8Array(await png(props.card)), { headers: { 'Content-Type': 'image/png' } });
};
