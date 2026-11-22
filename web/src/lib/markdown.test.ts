import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

const RS = 'Algorithms/Coding_Theory/Reed_Solomon/README.md';

describe('renderMarkdown', () => {
  it('rewrites links inside tables and wraps the table for scrolling', async () => {
    const md = '| Language | Folder |\n|---|---|\n| Python | [Python/](Python/) |\n';
    const { html } = await renderMarkdown(md, RS);
    expect(html).toContain('class="table-wrap"');
    expect(html).toContain('href="/algorithms/coding-theory/reed-solomon/#impl-python"');
  });

  it('marks links to missing folders as broken instead of emitting a dead href', async () => {
    const { html } = await renderMarkdown('[gone](../Nope/README.md)', RS);
    expect(html).toContain('class="broken-link"');
    expect(html).not.toContain('href="../Nope/README.md"');
  });

  it('keeps GitHub-compatible heading ids so README anchors still work', async () => {
    const { html, headings } = await renderMarkdown('## \u{1f501} The fcr Parameter\n\n[jump](#-the-fcr-parameter)', RS);
    expect(headings[0].slug).toBe('-the-fcr-parameter');
    expect(html).toContain('href="#-the-fcr-parameter"');
  });

  it('opens external links in a new tab', async () => {
    const { html } = await renderMarkdown('[x](https://example.com)', RS);
    expect(html).toMatch(/target="_blank"/);
    expect(html).toMatch(/rel="noopener noreferrer"/);
  });

  it('keeps the token colours of code blocks readable', async () => {
    const { html } = await renderMarkdown('```go\nvar value int\n```\n', RS);
    expect(html).not.toMatch(/#E36209/i);
  });
});
