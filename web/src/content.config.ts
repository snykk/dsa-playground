import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema } from './lib/article';

/** Hand-written topic articles; a topic without one falls back to its README. */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/articles' }),
  schema: articleSchema,
});

export const collections = { articles };
