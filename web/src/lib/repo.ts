/**
 * Build-time model of the repository: every folder with a README becomes a page.
 *
 * - "topic"    = folder with Python/ C++/ Go/ implementations (e.g. Sorting/Bubble Sort)
 * - "category" = folder that only groups other folders (e.g. Algorithms/Sorting)
 *
 * READMEs stay the single source of truth; the site only renders them and adds
 * navigation, source-code tabs and visualizations around them.
 */
import fs from 'node:fs';
import path from 'node:path';
import { slugifyPath } from './slug';

export const REPO_ROOT = path.resolve(process.env.DSA_REPO_ROOT ?? path.join(process.cwd(), '..'));
export const GITHUB_REPO = 'https://github.com/snykk/dsa-playground';
export const GITHUB_BRANCH = 'master';

/** Folders that are never pages: tooling, build output, the site itself, local audit notes. */
const SKIP_DIRS = new Set([
  '.git', '.github', '.build', '.claude', '.venv', 'venv', '.idea', '.vscode',
  '__pycache__', '.pytest_cache', 'node_modules', 'web', 'docs', 'scripts', 'playground',
]);

export const LANGUAGES = [
  { dir: 'Python', id: 'python', label: 'Python' },
  { dir: 'C++', id: 'cpp', label: 'C++' },
  { dir: 'Go', id: 'go', label: 'Go' },
] as const;
export type LanguageId = (typeof LANGUAGES)[number]['id'];

const CODE_LANG: Record<string, string> = {
  '.py': 'python', '.cpp': 'cpp', '.cc': 'cpp', '.h': 'cpp', '.hpp': 'cpp', '.go': 'go',
};

/** Top-level reading order (everything else falls back to alphabetical). */
const TOP_ORDER = ['Data Structures', 'Algorithms', 'Problem_Patterns', 'Complexity_Analysis', 'Utilities'];

/** Repository-root documents that get their own page. */
export const STANDALONE_DOCS: Record<string, string> = {
  'README.md': 'overview',
  'STUDY_GUIDE.md': 'study-guide',
  'CONTRIBUTING.md': 'contributing',
};

export interface MarkdownSource { rel: string; source: string }
export interface SourceFile { rel: string; name: string; lang: string; code: string; isTest: boolean }
export interface LanguageImpl {
  id: LanguageId;
  label: string;
  rel: string;
  readme?: MarkdownSource;
  files: SourceFile[];
}
export interface DocNode {
  rel: string;
  name: string;
  slug: string;
  kind: 'root' | 'category' | 'topic';
  title: string;
  description: string;
  readme?: MarkdownSource;
  languages: LanguageImpl[];
  children: DocNode[];
  parent?: DocNode;
  depth: number;
}
export interface StandaloneDoc { rel: string; slug: string; title: string; description: string; source: string }
export interface RepoContent {
  root: DocNode;
  nodes: DocNode[]; // every page node (root excluded), depth-first order
  byRel: Map<string, DocNode>;
  bySlug: Map<string, DocNode>;
  standalone: StandaloneDoc[];
}

/** First "# Heading" of a README, without leading emoji. */
export function extractTitle(markdown: string, fallback: string): string {
  const m = markdown.match(/^#\s+(.+?)\s*#*\s*$/m);
  return cleanTitle(m ? m[1] : fallback.replace(/_/g, ' '));
}

export function cleanTitle(title: string): string {
  return title.replace(/^[^\p{L}\p{N}]+/u, '').replace(/[*_`]/g, '').trim();
}

/** First prose paragraph of a README as plain text (used for cards and meta tags). */
export function extractDescription(markdown: string, maxLen = 220): string {
  const blocks = markdown.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block || /^(#|```|\||---|\[!\[|!\[|<)/.test(block)) continue;
    if (/^[-*+]\s|^\d+\.\s/.test(block)) continue; // skip lists
    const text = block
      .split('\n')
      .map((l) => l.replace(/^>\s?/, ''))
      .join(' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/(\*\*|__|\*|_)(.+?)\1/g, '$2')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length < 12) continue;
    return text.length > maxLen ? `${text.slice(0, maxLen - 1).trimEnd()}\u2026` : text;
  }
  return '';
}

function readText(abs: string): string {
  return fs.readFileSync(abs, 'utf8');
}

function readMarkdown(rel: string): MarkdownSource | undefined {
  const abs = path.join(REPO_ROOT, rel);
  return fs.existsSync(abs) ? { rel, source: readText(abs) } : undefined;
}

/** Source files of one language folder, including nested Go sub-modules (Array/Go/static_array/...). */
function listSourceFiles(langRel: string): SourceFile[] {
  const out: SourceFile[] = [];
  const visitDir = (dirRel: string, depth: number) => {
    for (const entry of fs.readdirSync(path.join(REPO_ROOT, dirRel), { withFileTypes: true })) {
      const rel = path.posix.join(dirRel, entry.name);
      if (entry.isDirectory()) {
        if (depth < 2 && !SKIP_DIRS.has(entry.name)) visitDir(rel, depth + 1);
        continue;
      }
      const lang = CODE_LANG[path.extname(entry.name)];
      if (!lang) continue;
      out.push({
        rel,
        name: path.posix.relative(langRel, rel),
        lang,
        code: readText(path.join(REPO_ROOT, rel)),
        isTest: /(_test\.(py|cpp|go)|test_[^/]*\.py)$/.test(entry.name),
      });
    }
  };
  visitDir(langRel, 0);
  return out.sort((a, b) => Number(a.isTest) - Number(b.isTest) || a.name.localeCompare(b.name));
}

function readLanguage(topicRel: string, lang: (typeof LANGUAGES)[number]): LanguageImpl {
  const rel = path.posix.join(topicRel, lang.dir);
  return {
    id: lang.id,
    label: lang.label,
    rel,
    readme: readMarkdown(path.posix.join(rel, 'README.md')),
    files: listSourceFiles(rel),
  };
}

function compareNodes(a: DocNode, b: DocNode): number {
  if (a.depth === 1 && b.depth === 1) {
    const ia = TOP_ORDER.indexOf(a.name);
    const ib = TOP_ORDER.indexOf(b.name);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  }
  return a.title.localeCompare(b.title, 'en', { numeric: true, sensitivity: 'base' });
}

function walk(rel: string, depth: number): DocNode | null {
  const abs = path.join(REPO_ROOT, rel);
  const entries = fs.readdirSync(abs, { withFileTypes: true });
  const dirNames = entries
    .filter((e) => e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith('.'))
    .map((e) => e.name);
  const langs = LANGUAGES.filter((l) => dirNames.includes(l.dir));
  const name = rel === '' ? '' : path.posix.basename(rel);
  const readme = rel === '' ? undefined : readMarkdown(path.posix.join(rel, 'README.md'));

  const node: DocNode = {
    rel,
    name,
    slug: slugifyPath(rel),
    kind: rel === '' ? 'root' : langs.length > 0 ? 'topic' : 'category',
    title: readme ? extractTitle(readme.source, name) : cleanTitle(name.replace(/_/g, ' ')),
    description: readme ? extractDescription(readme.source) : '',
    readme,
    languages: langs.map((l) => readLanguage(rel, l)),
    children: [],
    depth,
  };

  for (const dir of dirNames) {
    if (LANGUAGES.some((l) => l.dir === dir)) continue;
    const child = walk(rel === '' ? dir : `${rel}/${dir}`, depth + 1);
    if (child) {
      child.parent = node;
      node.children.push(child);
    }
  }
  node.children.sort(compareNodes);

  const isPage = node.kind !== 'category' || readme !== undefined || node.children.length > 0;
  return isPage ? node : null;
}

let cached: RepoContent | undefined;

export function getContent(): RepoContent {
  if (cached) return cached;
  const root = walk('', 0);
  if (!root) throw new Error(`No content found under ${REPO_ROOT}`);

  const nodes: DocNode[] = [];
  const byRel = new Map<string, DocNode>();
  const bySlug = new Map<string, DocNode>();
  const visit = (n: DocNode) => {
    byRel.set(n.rel, n);
    if (n.kind !== 'root') {
      const clash = bySlug.get(n.slug);
      if (clash) throw new Error(`Slug collision "${n.slug}": "${clash.rel}" vs "${n.rel}"`);
      bySlug.set(n.slug, n);
      nodes.push(n);
    }
    n.children.forEach(visit);
  };
  visit(root);

  const standalone: StandaloneDoc[] = [];
  for (const [rel, slug] of Object.entries(STANDALONE_DOCS)) {
    const md = readMarkdown(rel);
    if (!md) continue;
    standalone.push({
      rel,
      slug,
      title: extractTitle(md.source, slug),
      description: extractDescription(md.source),
      source: md.source,
    });
  }

  cached = { root, nodes, byRel, bySlug, standalone };
  return cached;
}

/** Every topic under a node (the node itself included when it is a topic). */
export function topicsUnder(node: DocNode): DocNode[] {
  const out: DocNode[] = [];
  const visit = (n: DocNode) => {
    if (n.kind === 'topic') out.push(n);
    n.children.forEach(visit);
  };
  visit(node);
  return out;
}

export function ancestors(node: DocNode): DocNode[] {
  const out: DocNode[] = [];
  for (let p = node.parent; p && p.kind !== 'root'; p = p.parent) out.unshift(p);
  return out;
}

/** Slug of a repo folder; throws on unknown folders so catalog typos fail the build. */
export function slugOfRel(content: RepoContent, rel: string): string {
  const node = content.byRel.get(rel);
  if (!node) throw new Error(`Unknown repository folder: "${rel}"`);
  return node.slug;
}

export function joinBase(base: string, slug: string): string {
  const b = base.endsWith('/') ? base : `${base}/`;
  return slug ? `${b}${slug}/` : b;
}

export function githubUrl(rel: string, isDir: boolean): string {
  const encoded = rel.split('/').map(encodeURIComponent).join('/');
  return `${GITHUB_REPO}/${isDir ? 'tree' : 'blob'}/${GITHUB_BRANCH}/${encoded}`;
}

export type LinkKind = 'external' | 'anchor' | 'page' | 'github' | 'broken';
export interface ResolvedLink { kind: LinkKind; href: string }

/**
 * Map a link found in a README to where it should point on the site.
 * Relative links to other READMEs/folders become site pages; links into a
 * topic's Python/C++/Go folder open that language tab; other repo files go to
 * GitHub; anything that does not exist is reported as broken.
 */
export function resolveLink(content: RepoContent, fromFileRel: string, href: string, base: string): ResolvedLink {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return { kind: 'external', href };
  if (href.startsWith('#')) return { kind: 'anchor', href };

  const hashAt = href.indexOf('#');
  const rawPath = hashAt === -1 ? href : href.slice(0, hashAt);
  const hash = hashAt === -1 ? '' : href.slice(hashAt);
  let decoded = rawPath;
  try {
    decoded = decodeURI(rawPath);
  } catch {
    /* keep the raw path */
  }
  const fromDir = path.posix.dirname(fromFileRel);
  let target = decoded.startsWith('/') ? decoded.slice(1) : path.posix.join(fromDir === '.' ? '' : fromDir, decoded);
  target = path.posix.normalize(target).replace(/\/+$/, '');
  if (target === '.' || target === '') target = '';
  if (target.startsWith('..')) return { kind: 'broken', href };

  const standalone = STANDALONE_DOCS[target];
  if (standalone) return { kind: 'page', href: joinBase(base, standalone) + hash };

  const dir = target === 'README.md' ? '' : target.endsWith('/README.md') ? target.slice(0, -'/README.md'.length) : target;
  if (dir === '') return { kind: 'page', href: joinBase(base, '') + hash };
  const node = content.byRel.get(dir);
  if (node && node.kind !== 'root') return { kind: 'page', href: joinBase(base, node.slug) + hash };

  // A link into a topic's language folder (or a file inside it) opens that language tab.
  const parts = target.split('/');
  for (let i = parts.length - 1; i > 0; i--) {
    const lang = LANGUAGES.find((l) => l.dir === parts[i]);
    if (!lang) continue;
    const topic = content.byRel.get(parts.slice(0, i).join('/'));
    if (topic?.kind === 'topic' && fs.existsSync(path.join(REPO_ROOT, target))) {
      return { kind: 'page', href: `${joinBase(base, topic.slug)}#impl-${lang.id}` };
    }
  }

  const abs = path.join(REPO_ROOT, target);
  if (fs.existsSync(abs)) return { kind: 'github', href: githubUrl(target, fs.statSync(abs).isDirectory()) + hash };
  return { kind: 'broken', href };
}
