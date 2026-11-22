import { describe, expect, it } from 'vitest';
import { escapeHtml, moveActive, opensSearch, PLAYER_SELECTOR, safeExcerpt, statusText, type FocusLike } from './search';

const slash = { key: '/', ctrlKey: false, metaKey: false, altKey: false };

/** A stand-in for the focused element: its tag, and whether it sits inside a player. */
function focused(tagName: string, options: { inPlayer?: boolean; editable?: boolean } = {}): FocusLike {
  return {
    tagName,
    isContentEditable: options.editable ?? false,
    closest: (selector: string) => (selector === PLAYER_SELECTOR && options.inPlayer ? {} : null),
  };
}

describe('opensSearch', () => {
  it('opens on a plain slash on the page', () => {
    expect(opensSearch(slash, null)).toBe(true);
    expect(opensSearch(slash, focused('BODY'))).toBe(true);
    expect(opensSearch(slash, focused('a'))).toBe(true);
    expect(opensSearch(slash, focused('BUTTON'))).toBe(true);
  });

  it('ignores other keys and a slash with a modifier or during composition', () => {
    expect(opensSearch({ ...slash, key: 's' }, null)).toBe(false);
    expect(opensSearch({ ...slash, ctrlKey: true }, null)).toBe(false);
    expect(opensSearch({ ...slash, metaKey: true }, null)).toBe(false);
    expect(opensSearch({ ...slash, altKey: true }, null)).toBe(false);
    expect(opensSearch({ ...slash, isComposing: true }, null)).toBe(false);
  });

  it('leaves the slash to fields the reader is typing in', () => {
    for (const tag of ['INPUT', 'TEXTAREA', 'SELECT', 'input']) expect(opensSearch(slash, focused(tag))).toBe(false);
    expect(opensSearch(slash, focused('DIV', { editable: true }))).toBe(false);
  });

  it('leaves keys to a player that has focus', () => {
    expect(opensSearch(slash, focused('DIV', { inPlayer: true }))).toBe(false);
    expect(opensSearch(slash, focused('BUTTON', { inPlayer: true }))).toBe(false);
  });
});

describe('moveActive', () => {
  it('has nothing to move through without results', () => {
    expect(moveActive(-1, 1, 0)).toBe(-1);
    expect(moveActive(3, -1, 0)).toBe(-1);
  });

  it('starts at the first result going down and the last going up', () => {
    expect(moveActive(-1, 1, 5)).toBe(0);
    expect(moveActive(-1, -1, 5)).toBe(4);
    expect(moveActive(9, 1, 5)).toBe(0);
  });

  it('steps and wraps at both ends', () => {
    expect(moveActive(0, 1, 5)).toBe(1);
    expect(moveActive(3, -1, 5)).toBe(2);
    expect(moveActive(4, 1, 5)).toBe(0);
    expect(moveActive(0, -1, 5)).toBe(4);
    expect(moveActive(0, 1, 1)).toBe(0);
  });
});

describe('statusText', () => {
  it('says nothing for an empty query', () => {
    expect(statusText('  ', 0, 0)).toBe('');
  });

  it('counts the results and says when only some are shown', () => {
    expect(statusText('heap', 0, 0)).toBe('No results for "heap"');
    expect(statusText(' heap ', 1, 1)).toBe('1 result for "heap"');
    expect(statusText('heap', 7, 7)).toBe('7 results for "heap"');
    expect(statusText('sort', 40, 10)).toBe('40 results for "sort", showing the first 10');
  });
});

describe('safeExcerpt', () => {
  it('keeps the match marks and escaped entities', () => {
    const excerpt = 'pick a <mark>pivot</mark> so that a &lt; b &amp;&amp; <mark>pivot</mark>';
    expect(safeExcerpt(excerpt)).toBe(excerpt);
  });

  it('escapes anything else that looks like markup', () => {
    expect(safeExcerpt('<img src=x onerror=alert(1)> <mark>x</mark>')).toBe('&lt;img src=x onerror=alert(1)&gt; <mark>x</mark>');
    expect(safeExcerpt('<mark class="x">y</mark>')).toBe('&lt;mark class="x"&gt;y</mark>');
  });
});

describe('escapeHtml', () => {
  it('escapes the characters that matter in text and attributes', () => {
    expect(escapeHtml('A & B <c> "d"')).toBe('A &amp; B &lt;c&gt; &quot;d&quot;');
  });
});
