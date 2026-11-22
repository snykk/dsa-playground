/**
 * The player's keyboard shortcuts in one table. The key handlers (usePlayback, AlgorithmTabs)
 * and the shortcut list (ShortcutsDialog) both read it, so the list can only show keys that
 * work. Plain TypeScript, unit-tested without a browser.
 */
import { SYM } from './symbols';

/** A key as the list shows it: what is printed on the key cap, and its name for screen readers. */
export interface KeyCap {
  cap: string;
  name: string;
}

export interface ShortcutRow {
  keys: KeyCap[];
  does: string;
}

export type PlayerCommand = 'toggle' | 'next' | 'prev' | 'first' | 'last' | 'help';

const SPACE: KeyCap = { cap: 'Space', name: 'Space' };
const RIGHT: KeyCap = { cap: SYM.rightArrow, name: 'Right arrow' };
const LEFT: KeyCap = { cap: SYM.leftArrow, name: 'Left arrow' };
const HOME: KeyCap = { cap: 'Home', name: 'Home' };
const END: KeyCap = { cap: 'End', name: 'End' };
const QUESTION: KeyCap = { cap: '?', name: 'Question mark' };

/** Keys that work anywhere in a player except in its input box and menus. */
export const PLAYER_KEYS: ReadonlyArray<{ key: string; cap: KeyCap; command: PlayerCommand; does: string }> = [
  { key: ' ', cap: SPACE, command: 'toggle', does: 'Play or pause' },
  { key: 'ArrowRight', cap: RIGHT, command: 'next', does: 'Next step' },
  { key: 'ArrowLeft', cap: LEFT, command: 'prev', does: 'Previous step' },
  { key: 'Home', cap: HOME, command: 'first', does: 'First step' },
  { key: 'End', cap: END, command: 'last', does: 'Last step' },
  { key: '?', cap: QUESTION, command: 'help', does: 'Show this list of shortcuts' },
];

/** Keys on a focused algorithm tab (see tabKeyTarget). */
export const TAB_KEYS: readonly ShortcutRow[] = [
  { keys: [LEFT, RIGHT], does: 'Previous or next algorithm' },
  { keys: [HOME, END], does: 'First or last algorithm' },
];

/** Keys in the input box. */
export const INPUT_KEYS: readonly ShortcutRow[] = [{ keys: [{ cap: 'Enter', name: 'Enter' }], does: 'Visualize the input from the first step' }];

/** Keys in the shortcut list itself. */
export const DIALOG_KEYS: readonly ShortcutRow[] = [{ keys: [{ cap: 'Esc', name: 'Escape' }], does: 'Close this list' }];

interface KeyLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

/**
 * The player command for a key press, or undefined. Presses with Ctrl, Cmd or Alt belong to
 * the browser and the system (Alt+Left goes back), so they never trigger the player.
 */
export function commandForKey(e: KeyLike): PlayerCommand | undefined {
  if (e.ctrlKey || e.metaKey || e.altKey) return undefined;
  return PLAYER_KEYS.find((k) => k.key === e.key)?.command;
}

/**
 * Whether the focused element keeps its own keys: fields and menus keep every key (typing,
 * the scrubber's arrows, a menu's type-ahead), and buttons keep Space and Enter, which press them.
 */
export function elementKeepsKey(target: { tagName?: string } | null | undefined, key: string): boolean {
  const tag = target?.tagName ?? '';
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
  return tag === 'BUTTON' && (key === ' ' || key === 'Enter');
}

/**
 * The tab to select after a key press on tab `current` of `count`, following the ARIA tabs
 * pattern: arrows move to the neighbour (wrapping around), Home and End to the ends.
 */
export function tabKeyTarget(key: string, current: number, count: number): number | undefined {
  if (count < 1) return undefined;
  if (key === 'ArrowRight') return (current + 1) % count;
  if (key === 'ArrowLeft') return (current - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return undefined;
}

/** The rows of the shortcut list, in groups; the tab group only when the player has tabs. */
export function shortcutGroups(hasTabs: boolean, hasInput: boolean): Array<{ title: string; rows: readonly ShortcutRow[] }> {
  return [
    { title: 'In the player', rows: PLAYER_KEYS.map((k) => ({ keys: [k.cap], does: k.does })) },
    ...(hasTabs ? [{ title: 'On an algorithm tab', rows: TAB_KEYS }] : []),
    ...(hasInput ? [{ title: 'In the input box', rows: INPUT_KEYS }] : []),
    { title: 'In this list', rows: DIALOG_KEYS },
  ];
}
