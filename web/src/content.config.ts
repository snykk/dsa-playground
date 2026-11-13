import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema } from './lib/article';
import { categorySchema } from './lib/category';

/** Hand-written topic articles; a topic without one falls back to its README. */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/articles' }),
  schema: articleSchema,
});

/** Hand-written category overviews; a category without one falls back to its README. */
const categories = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/categories' }),
  schema: categorySchema,
});

export const collections = { articles, categories };
