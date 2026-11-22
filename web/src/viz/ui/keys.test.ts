import { describe, expect, it } from 'vitest';
import { commandForKey, elementKeepsKey, PLAYER_KEYS, shortcutGroups, tabKeyTarget } from './keys';

describe('commandForKey', () => {
  it('maps every listed key to its command', () => {
    for (const k of PLAYER_KEYS) expect(commandForKey({ key: k.key })).toBe(k.command);
    expect(commandForKey({ key: ' ' })).toBe('toggle');
    expect(commandForKey({ key: '?' })).toBe('help');
  });

  it('leaves other keys and browser shortcuts alone', () => {
    expect(commandForKey({ key: 'a' })).toBeUndefined();
    expect(commandForKey({ key: 'ArrowLeft', altKey: true })).toBeUndefined();
    expect(commandForKey({ key: 'ArrowRight', metaKey: true })).toBeUndefined();
    expect(commandForKey({ key: 'Home', ctrlKey: true })).toBeUndefined();
  });

  it('lists each key once', () => {
    const keys = PLAYER_KEYS.map((k) => k.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('elementKeepsKey', () => {
  it('lets fields and menus keep every key', () => {
    for (const tagName of ['INPUT', 'SELECT', 'TEXTAREA']) {
      expect(elementKeepsKey({ tagName }, 'ArrowRight')).toBe(true);
      expect(elementKeepsKey({ tagName }, '?')).toBe(true);
    }
  });

  it('lets buttons keep Space and Enter only', () => {
    expect(elementKeepsKey({ tagName: 'BUTTON' }, ' ')).toBe(true);
    expect(elementKeepsKey({ tagName: 'BUTTON' }, 'Enter')).toBe(true);
    expect(elementKeepsKey({ tagName: 'BUTTON' }, 'ArrowRight')).toBe(false);
    expect(elementKeepsKey({ tagName: 'DIV' }, ' ')).toBe(false);
    expect(elementKeepsKey(null, ' ')).toBe(false);
  });
});

describe('tabKeyTarget', () => {
  it('moves to the neighbour and wraps around', () => {
    expect(tabKeyTarget('ArrowRight', 0, 14)).toBe(1);
    expect(tabKeyTarget('ArrowRight', 13, 14)).toBe(0);
    expect(tabKeyTarget('ArrowLeft', 0, 14)).toBe(13);
    expect(tabKeyTarget('ArrowLeft', 5, 14)).toBe(4);
  });

  it('jumps to the ends with Home and End', () => {
    expect(tabKeyTarget('Home', 7, 14)).toBe(0);
    expect(tabKeyTarget('End', 2, 14)).toBe(13);
  });

  it('ignores other keys', () => {
    expect(tabKeyTarget(' ', 0, 3)).toBeUndefined();
    expect(tabKeyTarget('ArrowRight', 0, 0)).toBeUndefined();
  });
});

describe('shortcutGroups', () => {
  it('shows the tab and input keys only when the player has them', () => {
    expect(shortcutGroups(false, false).map((g) => g.title)).toEqual(['In the player', 'In this list']);
    expect(shortcutGroups(true, true).map((g) => g.title)).toEqual(['In the player', 'On an algorithm tab', 'In the input box', 'In this list']);
  });

  it('gives every key a spoken name', () => {
    for (const g of shortcutGroups(true, true)) for (const row of g.rows) for (const k of row.keys) expect(k.name.length).toBeGreaterThan(0);
  });
});
