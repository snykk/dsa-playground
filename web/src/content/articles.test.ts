/**
 * Article checker: every MDX article must compile, match the frontmatter schema, point at
 * real repository folders and visualizations, use only the registered components, follow
 * the house rules (ASCII source, no horizontal rules, an Implementation section with the
 * code tabs) and be named after its topic folder.
 *
 * Run one article: npx vitest run src/content/articles.test.ts -t quick-sort
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile, createProcessor } from '@mdx-js/mdx';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { MDX_COMPONENT_NAMES } from '../components/mdxNames';
import { articleSchema } from '../lib/article';
import { getContent } from '../lib/repo';
import { slugifySegment } from '../lib/slug';
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
  });

  it('embeds only existing visualizations and topic folders', () => {
    const { body } = load(file);
    for (const m of body.matchAll(/<ArticleViz\s+ids=\{\[([^\]]*)\]\}/g)) {
      for (const id of m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)) {
        expect(vizIds.has(id), `visualization ${id}`).toBe(true);
      }
    }
    for (const folder of topicCodeFolders(body)) expect(content.byRel.has(folder), folder).toBe(true);
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
    expect(topicCodeFolders(body).includes(data.topic), 'the code tabs of this topic').toBe(true);
  });
});

const articleTopics = () =>
  files.map((f) => {
    const { frontmatter } = split(readFileSync(path.join(DIR, f), 'utf8'));
    return { file: f, topic: (parseYaml(frontmatter) as { topic: string }).topic };
  });

it('gives every topic at most one article', () => {
  const topics = articleTopics().map((a) => a.topic);
  expect(new Set(topics).size).toBe(topics.length);
});

it('names every article file after its topic folder', () => {
  // The folder's own name as a slug; the parent's slug goes in front only when two topics share that name.
  const segment = (rel: string, fromEnd: number) => slugifySegment(rel.split('/').reverse()[fromEnd] ?? '');
  const uses = new Map<string, number>();
  for (const node of content.nodes) {
    if (node.kind === 'topic') uses.set(segment(node.rel, 0), (uses.get(segment(node.rel, 0)) ?? 0) + 1);
  }
  const misnamed = articleTopics().flatMap(({ file, topic }) => {
    const own = segment(topic, 0);
    const expected = `${(uses.get(own) ?? 0) > 1 ? `${segment(topic, 1)}-${own}` : own}.mdx`;
    return file === expected ? [] : [`${file} should be ${expected}`];
  });
  expect(misnamed).toEqual([]);
});
