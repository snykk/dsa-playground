import { describe, expect, it } from 'vitest';
import { countDone, openProgress, parseProgress, PROGRESS_KEY, progressText, serializeProgress, type StorageLike } from './progress';

/** An in-memory localStorage; `fail` makes the chosen calls throw like a blocked storage. */
function fakeStorage(initial: Record<string, string> = {}, fail: Partial<Record<keyof StorageLike, boolean>> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: StorageLike = {
    getItem: (k) => {
      if (fail.getItem) throw new Error('SecurityError');
      return data.get(k) ?? null;
    },
    setItem: (k, v) => {
      if (fail.setItem) throw new Error('QuotaExceededError');
      data.set(k, v);
    },
    removeItem: (k) => {
      if (fail.removeItem) throw new Error('SecurityError');
      data.delete(k);
    },
  };
  return { storage, data };
}

const QUICK = 'Algorithms/Sorting/Quick_Sort';
const BINARY = 'Algorithms/Searching/Binary_Search';

describe('parseProgress and serializeProgress', () => {
  it('round-trip a set of topics, sorted and without duplicates', () => {
    const raw = serializeProgress([QUICK, BINARY, QUICK]);
    expect(raw).toBe(`{"version":1,"done":["${BINARY}","${QUICK}"]}`);
    expect([...parseProgress(raw)]).toEqual([BINARY, QUICK]);
  });

  it('read anything unexpected as no progress', () => {
    for (const raw of [null, undefined, '', 'not json', '42', 'null', '[]', '{"done":"x"}', '{"version":1}']) {
      expect(parseProgress(raw).size).toBe(0);
    }
  });

  it('skip entries that are not topic names', () => {
    expect([...parseProgress('{"version":1,"done":["a",3,null,"",{"x":1},"b"]}')]).toEqual(['a', 'b']);
  });
});

describe('countDone and progressText', () => {
  it('count the done topics of a list once each', () => {
    const done = new Set([QUICK, 'Somewhere/Else']);
    expect(countDone([QUICK, BINARY, QUICK], done)).toEqual({ done: 1, total: 2 });
    expect(countDone([], done)).toEqual({ done: 0, total: 0 });
  });

  it('say the count in words', () => {
    expect(progressText(12, 153, 'topics')).toBe('12 of 153 topics done');
    expect(progressText(0, 7)).toBe('0 of 7 done');
  });
});

describe('openProgress', () => {
  it('reads, writes and clears through storage', () => {
    const { storage, data } = fakeStorage({ [PROGRESS_KEY]: serializeProgress([BINARY]) });
    const store = openProgress(() => storage);
    expect(store.saved).toBe(true);
    expect([...store.done]).toEqual([BINARY]);
    store.set(QUICK, true);
    expect(parseProgress(data.get(PROGRESS_KEY)).has(QUICK)).toBe(true);
    store.set(BINARY, false);
    expect([...parseProgress(data.get(PROGRESS_KEY))]).toEqual([QUICK]);
    store.clear();
    expect(data.has(PROGRESS_KEY)).toBe(false);
    expect(store.done.size).toBe(0);
  });

  it('picks up changes made in another tab on reload', () => {
    const { storage, data } = fakeStorage();
    const store = openProgress(() => storage);
    data.set(PROGRESS_KEY, serializeProgress([QUICK]));
    store.reload();
    expect(store.done.has(QUICK)).toBe(true);
  });

  it('works in memory when storage cannot even be reached', () => {
    const store = openProgress(() => {
      throw new Error('SecurityError: access denied');
    });
    expect(store.saved).toBe(false);
    store.set(QUICK, true);
    expect(store.done.has(QUICK)).toBe(true);
    store.clear();
    expect(store.done.size).toBe(0);
  });

  it('works in memory when there is no storage', () => {
    const store = openProgress(() => undefined);
    expect(store.saved).toBe(false);
    store.set(QUICK, true);
    expect(store.done.has(QUICK)).toBe(true);
  });

  it('keeps the ticks for the visit and reports it when reads or writes throw', () => {
    const reads = openProgress(() => fakeStorage({}, { getItem: true }).storage);
    expect(reads.saved).toBe(false);
    reads.set(QUICK, true);
    expect(reads.done.has(QUICK)).toBe(true);

    const writes = openProgress(() => fakeStorage({}, { setItem: true, removeItem: true }).storage);
    expect(writes.saved).toBe(true);
    writes.set(QUICK, true);
    expect(writes.saved).toBe(false);
    expect(writes.done.has(QUICK)).toBe(true);
    expect(() => writes.clear()).not.toThrow();
  });
});
