/**
 * Render repository READMEs to HTML at build time.
 *
 * Uses Astro's own Markdown pipeline (GFM, Shiki, GitHub-compatible heading ids)
 * plus one rehype pass that rewrites relative README links to site routes and
 * wraps wide tables so they scroll on small screens.
 */
import { createMarkdownProcessor, type MarkdownHeading, type MarkdownProcessor } from '@astrojs/markdown-remark';
import type { Element, ElementContent, Root } from 'hast';
import { CONTINUE, SKIP, visit } from 'unist-util-visit';
import { codeContrast } from './codeColors';
import { getContent, resolveLink } from './repo';

export interface RenderedMarkdown {
  html: string;
  headings: MarkdownHeading[];
}

interface FileLike {
  data: { astro?: { frontmatter?: Record<string, unknown> } };
}

const brokenLinks = new Map<string, Set<string>>();

/** Broken README links found while rendering (file -> hrefs); printed by the build. */
export function getBrokenLinks(): Map<string, Set<string>> {
  return brokenLinks;
}

function rehypeRepoLinks() {
  return (tree: Root, file: FileLike) => {
    const from = file.data.astro?.frontmatter?.sourceRel;
    if (typeof from !== 'string') return;
    const content = getContent();
    const base = import.meta.env.BASE_URL;

    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        // Wrap for horizontal scrolling, then keep walking into the table:
        // README tables are full of links that still need rewriting.
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [node as ElementContent],
        };
        return CONTINUE;
      }
      if (node.tagName !== 'a' && node.tagName !== 'img') return;
      const attr = node.tagName === 'a' ? 'href' : 'src';
      const value = node.properties?.[attr];
      if (typeof value !== 'string') return;

      const link = resolveLink(content, from, value, base);
      if (link.kind === 'external') {
        if (node.tagName === 'a') {
          node.properties.target = '_blank';
          node.properties.rel = ['noopener', 'noreferrer'];
          node.children.push(NEW_TAB_NOTE());
        }
      } else if (link.kind === 'broken') {
        if (!brokenLinks.has(from)) brokenLinks.set(from, new Set());
        const seen = brokenLinks.get(from);
        if (seen && !seen.has(value)) {
          seen.add(value);
          console.warn(`[broken-link] ${from} -> ${value}`);
        }
        delete node.properties[attr];
        node.properties.className = ['broken-link'];
        node.properties.title = `Broken link in ${from}: ${value}`;
      } else {
        node.properties[attr] = link.href;
      }
      return undefined;
    });
  };
}

/** Said after the text of a link that opens in a new tab; seen by screen readers only. */
const NEW_TAB_NOTE = (): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { className: ['visually-hidden'] },
  children: [{ type: 'text', value: ' (opens in a new tab)' }],
});

const BLOCK = new Set(['ul', 'ol', 'p', 'div', 'pre', 'blockquote', 'table']);

/**
 * GFM task lists render a bare disabled checkbox before the item's text. Wrap the checkbox and
 * the inline content after it (up to a nested list or block) in a <label>, so the box is named
 * by its item.
 */
function rehypeTaskLabels() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'input' || node.properties?.type !== 'checkbox' || !parent || typeof index !== 'number') return;
      if (parent.type !== 'element' || (parent.tagName !== 'li' && parent.tagName !== 'p')) return;
      let end = index + 1;
      while (end < parent.children.length) {
        const next = parent.children[end];
        if (next.type === 'element' && BLOCK.has(next.tagName)) break;
        end++;
      }
      // The line break before a nested list stays outside the label.
      while (end > index + 1) {
        const last = parent.children[end - 1];
        if (last.type !== 'text' || last.value.trim() !== '') break;
        end--;
      }
      const label: Element = { type: 'element', tagName: 'label', properties: {}, children: parent.children.slice(index, end) };
      parent.children.splice(index, end - index, label);
      return SKIP;
    });
  };
}

let processor: Promise<MarkdownProcessor> | undefined;

function getProcessor(): Promise<MarkdownProcessor> {
  processor ??= createMarkdownProcessor({
    gfm: true,
    smartypants: false, // render text exactly as written on GitHub
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'light',
      wrap: false,
      transformers: [codeContrast],
    },
    rehypePlugins: [rehypeRepoLinks, rehypeTaskLabels],
  });
  return processor;
}

const cache = new Map<string, Promise<RenderedMarkdown>>();

/** Render one Markdown file; `sourceRel` is its repo-relative path (for link resolution). */
export function renderMarkdown(source: string, sourceRel: string): Promise<RenderedMarkdown> {
  const key = `${sourceRel}\u0000${source.length}`;
  let result = cache.get(key);
  if (!result) {
    result = getProcessor()
      .then((p) => p.render(source, { frontmatter: { sourceRel } }))
      .then((r) => ({ html: r.code, headings: r.metadata.headings }));
    cache.set(key, result);
  }
  return result;
}
