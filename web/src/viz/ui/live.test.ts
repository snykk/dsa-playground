import { describe, expect, it } from 'vitest';
import { captionLive } from './live';

describe('captionLive', () => {
  it('reads each caption out while the reader steps by hand', () => {
    expect(captionLive(false, false)).toBe('polite');
  });

  it('stays quiet while the player plays, at any speed', () => {
    expect(captionLive(true, false)).toBe('off');
  });

  it('stays quiet in a teaser that plays by itself', () => {
    expect(captionLive(false, true)).toBe('off');
    expect(captionLive(true, true)).toBe('off');
  });
});
