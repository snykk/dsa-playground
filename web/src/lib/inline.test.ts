import { describe, expect, it } from 'vitest';
import { escapeHtml, formatInline, isComplexity } from './inline';

describe('formatInline', () => {
  it('escapes HTML so the result is safe for set:html', () => {
    expect(formatInline('<script>alert("x")</script> & co')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; co');
    expect(escapeHtml('a < b')).toBe('a &lt; b');
  });

  it('formats code, bold and superscripts', () => {
    expect(formatInline('use `arr[high]` as **pivot**')).toBe('use <code>arr[high]</code> as <strong>pivot</strong>');
    expect(formatInline('n^2 and 2^{k+1}')).toBe('n<sup>2</sup> and 2<sup>k+1</sup>');
    expect(formatInline('log2(n) levels')).toBe('log<sub>2</sub>(n) levels');
    expect(formatInline('n^2.81 and n^{log2(7)}')).toBe('n<sup>2.81</sup> and n<sup>log<sub>2</sub>(7)</sup>');
  });

  it('keeps complexities on one line', () => {
    const nowrap = (inner: string) => `<span style="white-space: nowrap">${inner}</span>`;
    expect(formatInline('O(n^2) worst')).toBe(`${nowrap('O(n<sup>2</sup>)')} worst`);
    expect(formatInline('expected O(n log n), not O(n log(n))')).toBe(`expected ${nowrap('O(n log n)')}, not ${nowrap('O(n log(n))')}`);
    expect(formatInline('FIFO(queue)')).toBe('FIFO(queue)');
  });

  it('turns ASCII operators into symbols outside code only', () => {
    expect(formatInline('x <= y >= z != w -> v')).toBe('x &#x2264; y &#x2265; z &#x2260; w &#x2192; v');
    expect(formatInline('`a <= b` stays')).toBe('<code>a &lt;= b</code> stays');
    expect(formatInline('`n^2`')).toBe('<code>n^2</code>');
  });

  it('leaves plain text alone', () => {
    expect(formatInline('Divide and conquer')).toBe('Divide and conquer');
    expect(formatInline('')).toBe('');
  });
});

describe('isComplexity', () => {
  it('recognises Big-O values', () => {
    expect(isComplexity('O(n log n)')).toBe(true);
    expect(isComplexity('Divide and conquer')).toBe(false);
  });
});
