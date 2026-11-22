/**
 * Links to one moment of a visualization, and copying them. A step link is the page's own URL
 *
 *   /dsa-playground/problem-patterns/?viz=sliding-window&step=7#visualize
 *
 * with `step` (1-based, what the player has always read), `viz` (the open tab's id, only on a
 * page with several visualizations), `input` (only when the run's input is not the example the
 * page opens with, so a typed or random input comes back too) and the player's anchor. The
 * player reads the same parameters when it starts. Plain functions: the Player passes in
 * window.location and the clipboard, and the tests pass fakes.
 */

export const STEP_PARAM = 'step';
export const VIZ_PARAM = 'viz';
export const INPUT_PARAM = 'input';
/** Viewing preferences of the person sharing (?theme=dark), not part of the moment. */
const PREFERENCE_PARAMS = ['theme'];

export interface StepLinkTarget {
  /** 0-based frame index. */
  index: number;
  /** The open tab's visualization id; leave it out on a page with one visualization. */
  viz?: string;
  /** The run's input; leave it out when it is the input the page opens with. */
  input?: string;
  /** Id of the element to scroll to, without '#'. */
  anchor?: string;
}

/** The page URL `href` pointing at a step; other query parameters are kept. */
export function buildStepLink(href: string, target: StepLinkTarget): string {
  const url = new URL(href);
  for (const p of [STEP_PARAM, VIZ_PARAM, INPUT_PARAM, ...PREFERENCE_PARAMS]) url.searchParams.delete(p);
  if (target.viz) url.searchParams.set(VIZ_PARAM, target.viz);
  url.searchParams.set(STEP_PARAM, String(Math.max(0, Math.floor(target.index)) + 1));
  if (target.input !== undefined) url.searchParams.set(INPUT_PARAM, target.input);
  url.hash = target.anchor ? `#${target.anchor}` : '';
  return url.toString();
}

export interface StepLinkState {
  /** 0-based frame index to open at (0 without a valid step). */
  index: number;
  /** Index of the tab to open (0 without a known `viz`). */
  tab: number;
  /** Input to run instead of the default, if the link carries one for this tab. */
  input?: string;
}

/**
 * What a page's query string asks the player for, given the ids of its tabs. An unknown `viz`
 * opens the first tab and drops `input`, which was meant for another visualization.
 */
export function readStepLink(search: string, vizIds: readonly string[]): StepLinkState {
  const params = new URLSearchParams(search);
  const raw = params.get(STEP_PARAM);
  const n = raw === null || raw.trim() === '' ? NaN : Number(raw);
  const index = Number.isInteger(n) && n > 0 ? n - 1 : 0;
  const viz = params.get(VIZ_PARAM);
  const found = viz === null ? 0 : vizIds.indexOf(viz);
  const input = found >= 0 ? (params.get(INPUT_PARAM) ?? undefined) : undefined;
  return { index, tab: Math.max(0, found), input };
}

export interface ClipboardEnv {
  /** navigator.clipboard, when the browser has it (it needs a secure page). */
  clipboard?: { writeText(text: string): Promise<void> };
  /** Older way: select the text in a hidden field and run the copy command. */
  legacyCopy?: (text: string) => boolean;
}

/** Copy `text`, trying the Clipboard API, then the legacy command; false when neither works. */
export async function copyText(text: string, env: ClipboardEnv): Promise<boolean> {
  if (env.clipboard && typeof env.clipboard.writeText === 'function') {
    try {
      await env.clipboard.writeText(text);
      return true;
    } catch {
      // Refused (no permission, page not focused): try the older way.
    }
  }
  if (env.legacyCopy) {
    try {
      return env.legacyCopy(text);
    } catch {
      return false;
    }
  }
  return false;
}

/** The browser's clipboard, with the legacy fallback; focus returns to where it was. */
export function browserClipboard(): ClipboardEnv {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  return {
    clipboard,
    legacyCopy: (text) => {
      if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;
      const before = document.activeElement as HTMLElement | null;
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.setAttribute('aria-hidden', 'true');
      field.style.position = 'fixed';
      field.style.top = '0';
      field.style.left = '0';
      field.style.opacity = '0';
      document.body.appendChild(field);
      try {
        field.focus({ preventScroll: true });
        field.select();
        return document.execCommand('copy');
      } finally {
        field.remove();
        before?.focus({ preventScroll: true });
      }
    },
  };
}
