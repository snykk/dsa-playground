import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleSchema } from './lib/article';
import { categorySchema } from './lib/category';
import { pageSchema } from './lib/page';

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

/** Hand-written root-document pages (overview, study guide); any other root document renders as Markdown. */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: pageSchema,
});

export const collections = { articles, categories, pages };
