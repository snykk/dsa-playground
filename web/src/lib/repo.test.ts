import { describe, expect, it } from 'vitest';
import { extractDescription, extractTitle, getContent, resolveLink } from './repo';
import { slugifySegment } from './slug';

describe('slugifySegment', () => {
  it.each([
    ["Dijkstra's_Algorithm", 'dijkstras-algorithm'],
    ['Segment Tree (Lazy Propagation)', 'segment-tree-lazy-propagation'],
    ['B+ Tree', 'b-plus-tree'],
    ['B-Tree', 'b-tree'],
    ['Big-Theta (\u0398)', 'big-theta'],
    ['0-1 Knapsack', '0-1-knapsack'],
    ['C++', 'cpp'],
  ])('%s -> %s', (input, expected) => {
    expect(slugifySegment(input)).toBe(expected);
  });
});

describe('README text helpers', () => {
  it('strips leading emoji from titles', () => {
    expect(extractTitle('# \u{1f4da} Data Structures\n', 'x')).toBe('Data Structures');
  });
  it('takes the first prose paragraph as description', () => {
    const md = '# T\n\n[![badge](x)](y)\n\n> A **useful** [thing](z) with `code`.\n';
    expect(extractDescription(md)).toBe('A useful thing with code.');
  });
});

describe('repository content', () => {
  const content = getContent();
  const base = '/b/';
  const rs = 'Algorithms/Coding_Theory/Reed_Solomon/README.md';

  it('turns every implementation folder into a topic with unique slugs', () => {
    const topics = content.nodes.filter((n) => n.kind === 'topic');
    expect(topics.length).toBeGreaterThanOrEqual(150);
    expect(new Set(content.nodes.map((n) => n.slug)).size).toBe(content.nodes.length);
  });

  it('collects language folders and their source files', () => {
    const node = content.byRel.get('Algorithms/Coding_Theory/Reed_Solomon');
    expect(node?.kind).toBe('topic');
    expect(node?.languages.map((l) => l.id)).toEqual(['python', 'cpp', 'go']);
    const py = node?.languages[0];
    expect(py?.files.map((f) => f.name)).toEqual(['reed_solomon.py', 'reed_solomon_test.py']);
  });

  it('maps README links to site pages, language tabs and GitHub', () => {
    expect(resolveLink(content, rs, '../Galois_Field/README.md', base)).toEqual({
      kind: 'page',
      href: '/b/algorithms/coding-theory/galois-field/',
    });
    expect(resolveLink(content, rs, 'Python/', base)).toEqual({
      kind: 'page',
      href: '/b/algorithms/coding-theory/reed-solomon/#impl-python',
    });
    expect(
      resolveLink(content, rs, '../../Mathematical_Algorithms/Number_Theory/Modular_Arithmetic/README.md', base).href,
    ).toBe('/b/algorithms/mathematical-algorithms/number-theory/modular-arithmetic/');
    expect(resolveLink(content, rs, '#-the-fcr-parameter', base).kind).toBe('anchor');
    expect(resolveLink(content, rs, 'https://example.com', base).kind).toBe('external');
    expect(resolveLink(content, 'README.md', 'LICENSE', base).kind).toBe('github');
    expect(resolveLink(content, 'README.md', 'STUDY_GUIDE.md', base)).toEqual({ kind: 'page', href: '/b/study-guide/' });
  });

  it('reports links to folders that do not exist', () => {
    // The folder is Maximum_Subarray_Kadanes_Algorithm, so this link must be reported.
    const link = resolveLink(content, 'STUDY_GUIDE.md', 'Algorithms/Dynamic_Programming/Linear_DP/Maximum_Subarray/', base);
    expect(link.kind).toBe('broken');
  });
});
