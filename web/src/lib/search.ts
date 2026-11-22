/**
 * Logic behind the site search dialog (src/components/organisms/SearchDialog.astro), kept free
 * of the DOM so it can be unit-tested: when "/" opens the search, how the arrow keys move
 * through the results, what the status line says, and how a Pagefind excerpt is made safe to
 * insert as HTML. The index itself is built after `astro build` by Pagefind (see package.json).
 */

/** The part of a keyboard event the shortcut looks at. */
export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  isComposing?: boolean;
}

/** The part of the focused element the shortcut looks at (an Element in the browser). */
export interface FocusLike {
  tagName: string;
  isContentEditable?: boolean;
  closest(selector: string): unknown;
}

/** A visualization player, or any other React island, keeps its own keys. */
export const PLAYER_SELECTOR = '.viz, astro-island';

/**
 * Whether a key press should open the search: a plain "/" while the reader is not typing in a
 * field and is not driving a player.
 */
export function opensSearch(e: KeyLike, focused: FocusLike | null): boolean {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return false;
  if (!focused) return true;
  const tag = focused.tagName.toUpperCase();
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || focused.isContentEditable) return false;
  return !focused.closest(PLAYER_SELECTOR);
}

/**
 * The next active result after moving by `delta` (+1 down, -1 up), wrapping at both ends; -1
 * when there are no results.
 */
export function moveActive(current: number, delta: number, count: number): number {
  if (count <= 0) return -1;
  if (current < 0 || current >= count) return delta < 0 ? count - 1 : 0;
  return (((current + delta) % count) + count) % count;
}

/** What the status line (a polite live region) says about a finished search. */
export function statusText(query: string, total: number, shown: number): string {
  const q = query.trim();
  if (!q) return '';
  if (total === 0) return `No results for "${q}"`;
  const results = `${total} ${total === 1 ? 'result' : 'results'} for "${q}"`;
  return shown < total ? `${results}, showing the first ${shown}` : results;
}

/**
 * A Pagefind excerpt as HTML that is safe to insert: Pagefind escapes the page text and wraps
 * the matches in <mark>; anything else that looks like a tag is escaped, entities are kept.
 */
export function safeExcerpt(excerpt: string): string {
  return excerpt
    .split(/(<\/?mark>)/)
    .map((part) => (part === '<mark>' || part === '</mark>' ? part : part.replace(/</g, '&lt;').replace(/>/g, '&gt;')))
    .join('');
}

/** Escapes text for use inside HTML (titles, areas and URLs from the index). */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** The part of Pagefind's browser API the dialog uses (pagefind/pagefind.js, made at build time). */
export interface PagefindResultData {
  url: string;
  excerpt: string;
  meta: Record<string, string | undefined>;
}

export interface PagefindApi {
  options(options: { baseUrl?: string; excerptLength?: number }): Promise<void>;
  init(): Promise<void>;
  debouncedSearch(
    term: string,
    options?: object,
    debounceMs?: number,
  ): Promise<{ results: { id: string; data(): Promise<PagefindResultData> }[] } | null>;
}
