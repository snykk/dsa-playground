/**
 * Article checker: every MDX article must compile, match the frontmatter schema, point at
 * real repository folders and visualizations, use only the registered components, and
 * follow the house rules (ASCII source, no horizontal rules, an Implementation section
 * with the code tabs).
 *
 * Run one article: npx vitest run src/content/articles.test.ts -t quick-sort
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { MDX_COMPONENT_NAMES } from '../components/mdxNames';
import { articleSchema } from '../lib/article';
import { getContent } from '../lib/repo';
import { VIZ_CATALOG } from '../viz/catalog';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'articles');
const files = readdirSync(DIR)
  .filter((f) => f.endsWith('.mdx'))
  .sort();
const content = getContent();
const vizIds = new Set(VIZ_CATALOG.map((v) => v.id));
const known = new Set<string>(MDX_COMPONENT_NAMES);

function split(source: string): { frontmatter: string; body: string } {
  const m = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('missing frontmatter block');
  return { frontmatter: m[1], body: m[2] };
}

function load(file: string) {
  const source = readFileSync(path.join(DIR, file), 'utf8');
  const { frontmatter, body } = split(source);
  return { source, body, data: articleSchema.parse(parseYaml(frontmatter)) };
}

// Files are parsed inside each test, so a broken article fails its own tests only.
describe.each(files)('%s', (file) => {
  it('has valid frontmatter pointing at real folders', () => {
    const { data } = load(file);
    expect(content.byRel.has(data.topic), `topic ${data.topic}`).toBe(true);
    for (const rel of [...data.prerequisites, ...data.related]) expect(content.byRel.has(rel), rel).toBe(true);
    expect(data.lead.length, 'lead: one or two sentences').toBeLessThanOrEqual(360);
  });

  it('compiles as MDX and only uses registered components', async () => {
    const { body } = load(file);
    await compile(body);
    const used = new Set([...body.matchAll(/<([A-Z][A-Za-z]*)\b/g)].map((m) => m[1]));
    for (const name of used) expect(known.has(name), `unknown component <${name}>`).toBe(true);
  });

  it('embeds only existing visualizations and topic folders', () => {
    const { body } = load(file);
    for (const m of body.matchAll(/<ArticleViz\s+ids=\{\[([^\]]*)\]\}/g)) {
      for (const id of m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)) {
        expect(vizIds.has(id), `visualization ${id}`).toBe(true);
      }
    }
    for (const m of body.matchAll(/<TopicCode\s+topic="([^"]+)"/g)) expect(content.byRel.has(m[1]), m[1]).toBe(true);
  });

  it('follows the house rules', () => {
    const { source, body, data } = load(file);
    const nonAscii = source.split('\n').findIndex((line) => /[^\x00-\x7F]/.test(line));
    expect(nonAscii, `non-ASCII on line ${nonAscii + 1} (use entities such as &le; or ASCII)`).toBe(-1);
    const prose = body.replace(/```[\s\S]*?```/g, ''); // code blocks may contain "# comments" or "---"
    expect(/^\s*(---|\*\*\*|___)\s*$/m.test(prose), 'no horizontal rules: sections are separated by spacing').toBe(false);
    expect(/^# /m.test(prose), 'no h1 in the body: the page title comes from the frontmatter').toBe(false);
    const sections = [...prose.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    expect(sections.length, 'at least 6 sections').toBeGreaterThanOrEqual(6);
    expect(sections.some((s) => /^implementation/i.test(s)), 'an "Implementation" section').toBe(true);
    expect(body.includes(`<TopicCode topic="${data.topic}"`), 'the code tabs of this topic').toBe(true);
  });
});

it('gives every topic at most one article', () => {
  const topics = files.map((f) => {
    const { frontmatter } = split(readFileSync(path.join(DIR, f), 'utf8'));
    return (parseYaml(frontmatter) as { topic: string }).topic;
  });
  expect(new Set(topics).size).toBe(topics.length);
});
