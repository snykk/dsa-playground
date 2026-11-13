/**
 * Checker for the hand-written MDX pages: topic articles (src/content/articles), category
 * overviews (src/content/categories) and root-document pages (src/content/pages). Every page
 * must compile, match its frontmatter schema, point at real repository folders and
 * visualizations, use only the registered components, follow the house rules (ASCII source,
 * no horizontal rules, no h1) and be named after its folder or document. A topic article also
 * needs an Implementation section with the code tabs; a category overview lists each of its
 * sub-folders exactly once.
 *
 * Run one page: npx vitest run src/content/articles.test.ts -t quick-sort
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile, createProcessor } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { MDX_COMPONENT_NAMES } from '../components/mdxNames';
import { articleSchema } from '../lib/article';
import { categorySchema } from '../lib/category';
import { pageSchema } from '../lib/page';
import { getContent } from '../lib/repo';
import { slugifySegment } from '../lib/slug';
import { VIZ_CATALOG } from '../viz/catalog';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, 'articles');
const CATEGORY_DIR = path.join(HERE, 'categories');
const PAGE_DIR = path.join(HERE, 'pages');
const mdxFiles = (dir: string) =>
  readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .sort();
const files = mdxFiles(DIR);
const categoryFiles = mdxFiles(CATEGORY_DIR);
const pageFiles = mdxFiles(PAGE_DIR);
const content = getContent();
const vizIds = new Set(VIZ_CATALOG.map((v) => v.id));
const known = new Set<string>(MDX_COMPONENT_NAMES);

function split(source: string): { frontmatter: string; body: string } {
  const m = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('missing frontmatter block');
  return { frontmatter: m[1], body: m[2] };
}

/**
 * The topic folder named by each <TopicCode>, written either as topic="..." or, for a
 * folder name an ASCII file cannot spell, as a JavaScript string with escapes: topic={'...'}.
 */
function topicCodeFolders(body: string): string[] {
  return [...body.matchAll(/<TopicCode\s+topic=(?:"([^"]+)"|\{'((?:[^'\\]|\\.)*)'\})/g)].map((m) =>
    m[1] !== undefined ? m[1] : (JSON.parse(`"${m[2].replace(/"/g, '\\"')}"`) as string),
  );
}

function load(file: string) {
  const source = readFileSync(path.join(DIR, file), 'utf8');
  const { frontmatter, body } = split(source);
  return { source, body, data: articleSchema.parse(parseYaml(frontmatter)) };
}

function loadCategory(file: string) {
  const source = readFileSync(path.join(CATEGORY_DIR, file), 'utf8');
  const { frontmatter, body } = split(source);
  return { source, body, data: categorySchema.parse(parseYaml(frontmatter)) };
}

function loadPage(file: string) {
  const source = readFileSync(path.join(PAGE_DIR, file), 'utf8');
  const { frontmatter, body } = split(source);
  return { source, body, data: pageSchema.parse(parseYaml(frontmatter)) };
}

async function expectValidMdx(body: string) {
  await compile(body);
  // A brace in prose starts a JavaScript expression: "{A, C}" throws at render time and
  // "{3, 4, 5}" silently renders "5". Articles never need expressions, so any is a bug.
  const tree = createProcessor().parse(body);
  const expressions: string[] = [];
  const walk = (node: { type: string; value?: string; position?: { start: { line: number } }; children?: unknown[] }) => {
    if (node.type === 'mdxTextExpression' || node.type === 'mdxFlowExpression') {
      expressions.push(`line ${node.position?.start.line}: {${node.value}}`);
    }
    for (const child of (node.children ?? []) as Array<typeof node>) walk(child);
  };
  walk(tree as unknown as Parameters<typeof walk>[0]);
  expect(expressions, 'braces in prose are JavaScript expressions: put them in backticks or write &#123; &#125;').toEqual([]);
  // Component tags only: code (fenced or inline) may legitimately show types such as <Point>.
  const markup = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const used = new Set([...markup.matchAll(/<([A-Z][A-Za-z]*)\b/g)].map((m) => m[1]));
  for (const name of used) expect(known.has(name), `unknown component <${name}>`).toBe(true);
}

function expectKnownEmbeds(body: string) {
  for (const m of body.matchAll(/<ArticleViz\s+ids=\{\[([^\]]*)\]\}/g)) {
    for (const id of m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)) {
      expect(vizIds.has(id), `visualization ${id}`).toBe(true);
    }
  }
  for (const folder of topicCodeFolders(body)) expect(content.byRel.has(folder), folder).toBe(true);
}

/** Checks the rules every page follows and returns its section (h2) titles. */
function expectHouseRules(source: string, body: string): string[] {
  const nonAscii = source.split('\n').findIndex((line) => /[^\x00-\x7F]/.test(line));
  expect(nonAscii, `non-ASCII on line ${nonAscii + 1} (use entities such as &le; or ASCII)`).toBe(-1);
  const prose = body.replace(/```[\s\S]*?```/g, ''); // code blocks may contain "# comments" or "---"
  expect(/^\s*(---|\*\*\*|___)\s*$/m.test(prose), 'no horizontal rules: sections are separated by spacing').toBe(false);
  expect(/^# /m.test(prose), 'no h1 in the body: the page title comes from the frontmatter').toBe(false);
  return [...prose.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
}

/**
 * The file a page for this folder must have: the folder's own name as a slug, with the
 * parent's slug in front only when another folder of the same kind shares that name.
 */
function expectedFile(rel: string, kind: 'topic' | 'category'): string {
  const segment = (r: string, fromEnd: number) => slugifySegment(r.split('/').reverse()[fromEnd] ?? '');
  const own = segment(rel, 0);
  const shared = content.nodes.filter((n) => n.kind === kind && segment(n.rel, 0) === own).length > 1;
  return `${shared ? `${segment(rel, 1)}-${own}` : own}.mdx`;
}

// Files are parsed inside each test, so a broken page fails its own tests only.
describe.each(files)('%s', (file) => {
  it('has valid frontmatter pointing at real folders', () => {
    const { data } = load(file);
    expect(content.byRel.has(data.topic), `topic ${data.topic}`).toBe(true);
    for (const rel of [...data.prerequisites, ...data.related]) expect(content.byRel.has(rel), rel).toBe(true);
    expect(data.lead.length, 'lead: one or two sentences').toBeLessThanOrEqual(360);
  });

  it('compiles as MDX and only uses registered components', async () => {
    await expectValidMdx(load(file).body);
  });

  it('embeds only existing visualizations and topic folders', () => {
    expectKnownEmbeds(load(file).body);
  });

  it('follows the house rules', () => {
    const { source, body, data } = load(file);
    const sections = expectHouseRules(source, body);
    expect(sections.length, 'at least 6 sections').toBeGreaterThanOrEqual(6);
    expect(sections.some((s) => /^implementation/i.test(s)), 'an "Implementation" section').toBe(true);
    expect(topicCodeFolders(body).includes(data.topic), 'the code tabs of this topic').toBe(true);
  });
});

describe.each(categoryFiles)('categories/%s', (file) => {
  it('has valid frontmatter pointing at a category and real folders', () => {
    const { data } = loadCategory(file);
    expect(content.byRel.get(data.category)?.kind, `category ${data.category}`).toBe('category');
    for (const rel of [...data.prerequisites, ...data.related]) expect(content.byRel.has(rel), rel).toBe(true);
    expect(data.lead.length, 'lead: one or two sentences').toBeLessThanOrEqual(360);
  });

  it('lists every sub-folder exactly once', () => {
    const { data } = loadCategory(file);
    const folders = content.byRel.get(data.category)?.children.map((c) => c.name) ?? [];
    expect(data.contents.map((e) => e.folder).sort(), 'contents: each sub-folder once, nothing else').toEqual([...folders].sort());
  });

  it('compiles as MDX and only uses registered components', async () => {
    await expectValidMdx(loadCategory(file).body);
  });

  it('embeds only existing visualizations and topic folders', () => {
    expectKnownEmbeds(loadCategory(file).body);
  });

  it('follows the house rules', () => {
    const { source, body } = loadCategory(file);
    expect(expectHouseRules(source, body).length, 'at least 4 sections').toBeGreaterThanOrEqual(4);
  });
});

describe.each(pageFiles)('pages/%s', (file) => {
  it('has valid frontmatter naming a root document and real folders', () => {
    const { data } = loadPage(file);
    expect(content.standalone.map((d) => d.slug), `page ${data.page}`).toContain(data.page);
    expect(file, 'a page is named after its document').toBe(`${data.page}.mdx`);
    for (const rel of data.related) expect(content.byRel.has(rel), rel).toBe(true);
    expect(data.lead.length, 'lead: one or two sentences').toBeLessThanOrEqual(360);
  });

  it('lists every top-level area exactly once, when it lists them', () => {
    const { data } = loadPage(file);
    if (data.contents.length === 0) return;
    const areas = content.root.children.map((c) => c.name);
    expect(data.contents.map((e) => e.folder).sort(), 'contents: each top-level folder once, nothing else').toEqual([...areas].sort());
  });

  it('compiles as MDX and only uses registered components', async () => {
    await expectValidMdx(loadPage(file).body);
  });

  it('embeds only existing visualizations and topic folders', () => {
    expectKnownEmbeds(loadPage(file).body);
  });

  it('follows the house rules', () => {
    const { source, body } = loadPage(file);
    expect(expectHouseRules(source, body).length, 'at least 4 sections').toBeGreaterThanOrEqual(4);
  });
});

const pages = (dir: string, list: string[], key: 'topic' | 'category') =>
  list.map((f) => {
    const { frontmatter } = split(readFileSync(path.join(dir, f), 'utf8'));
    return { file: f, rel: (parseYaml(frontmatter) as Record<string, string>)[key] };
  });

it('gives every topic at most one article and every category at most one overview', () => {
  for (const list of [pages(DIR, files, 'topic'), pages(CATEGORY_DIR, categoryFiles, 'category')]) {
    const rels = list.map((p) => p.rel);
    expect(new Set(rels).size).toBe(rels.length);
  }
});

it('names every page after its folder', () => {
  const misnamed = [
    ...pages(DIR, files, 'topic').map((p) => ({ ...p, expected: expectedFile(p.rel, 'topic') })),
    ...pages(CATEGORY_DIR, categoryFiles, 'category').map((p) => ({ ...p, expected: expectedFile(p.rel, 'category') })),
  ]
    .filter((p) => p.file !== p.expected)
    .map((p) => `${p.file} should be ${p.expected}`);
  expect(misnamed).toEqual([]);
});
