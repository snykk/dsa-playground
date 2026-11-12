/**
 * Inline text for article components (table cells, list items, step titles, facts).
 *
 * Authors write plain ASCII and this turns it into HTML:
 *   `code`         -> <code>code</code>          (left exactly as written)
 *   **bold**       -> <strong>bold</strong>
 *   n^2, 2^{k+1}   -> n<sup>2</sup>, 2<sup>k+1</sup>
 *   log2(n)        -> log<sub>2</sub>(n)
 *   O(...)         -> kept on one line
 *   <=  >=  !=  -> -> the matching math symbols
 * Everything else is HTML-escaped, so the result is safe to pass to set:html.
 */

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ESCAPES[c]);
}

/** Applied after escaping, so "<" and ">" already appear as &lt; and &gt;. */
const SYMBOLS: Array<[RegExp, string]> = [
  [/-&gt;/g, '&#x2192;'],
  [/&lt;=/g, '&#x2264;'],
  [/&gt;=/g, '&#x2265;'],
  [/!=/g, '&#x2260;'],
];

function formatText(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>').replace(/\^([A-Za-z0-9]+)/g, '<sup>$1</sup>');
  html = html.replace(/\blog_?(\d+)/g, 'log<sub>$1</sub>');
  for (const [pattern, symbol] of SYMBOLS) html = html.replace(pattern, symbol);
  // Keep a complexity such as O(n log n) on one line.
  html = html.replace(/\bO\((?:[^()]|\([^()]*\))*\)/g, (m) => `<span style="white-space: nowrap">${m}</span>`);
  return html;
}

export function formatInline(text: string): string {
  return text
    .split(/(`[^`]*`)/g)
    .map((part) =>
      part.length >= 2 && part.startsWith('`') && part.endsWith('`') ? `<code>${escapeHtml(part.slice(1, -1))}</code>` : formatText(part),
    )
    .join('');
}

/** True for a complexity value such as "O(n log n)", which components set in a monospace font. */
export function isComplexity(text: string): boolean {
  return /^\s*O\(/.test(text);
}
