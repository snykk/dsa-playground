/**
 * The study guide's progress: which topics a reader has ticked as done. Runs in the browser
 * (TopicList's script); nothing leaves it. Kept in localStorage under PROGRESS_KEY as
 *
 *   {"version":1,"done":["Algorithms/Searching/Binary_Search","Algorithms/Sorting/Quick_Sort"]}
 *
 * (repository folders, sorted; an empty list removes the key). Every storage access is guarded:
 * when storage is missing or refuses (a private window, blocked site data), ticks still work
 * for the visit and `saved` turns false so the page can say they will not be kept.
 */

export const PROGRESS_KEY = 'dsa-study-progress';
export const PROGRESS_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** The done topics in a stored value; anything unreadable counts as no progress. */
export function parseProgress(raw: string | null | undefined): Set<string> {
  if (!raw) return new Set();
  try {
    const data: unknown = JSON.parse(raw);
    const done = data && typeof data === 'object' ? (data as { done?: unknown }).done : undefined;
    if (!Array.isArray(done)) return new Set();
    return new Set(done.filter((t): t is string => typeof t === 'string' && t.length > 0));
  } catch {
    return new Set();
  }
}

export function serializeProgress(done: Iterable<string>): string {
  return JSON.stringify({ version: PROGRESS_VERSION, done: [...new Set(done)].sort() });
}

/** How many of `topics` are done (each topic counted once). */
export function countDone(topics: Iterable<string>, done: ReadonlySet<string>): { done: number; total: number } {
  const unique = new Set(topics);
  let n = 0;
  for (const t of unique) if (done.has(t)) n++;
  return { done: n, total: unique.size };
}

/** "12 of 153 done", or with a noun, "12 of 153 topics done". */
export function progressText(done: number, total: number, noun = ''): string {
  return `${done} of ${total}${noun ? ` ${noun}` : ''} done`;
}

export interface ProgressStore {
  /** False once storage turned out to be missing or refused a write: ticks last for the visit. */
  readonly saved: boolean;
  readonly done: ReadonlySet<string>;
  set(topic: string, done: boolean): void;
  clear(): void;
  /** Read storage again (another tab changed it). */
  reload(): void;
}

/**
 * A progress store over `getStorage()` (in the page: () => window.localStorage, whose mere
 * access can throw). Writes go through at once; a failing storage degrades to memory.
 */
export function openProgress(getStorage: () => StorageLike | null | undefined): ProgressStore {
  let storage: StorageLike | null = null;
  try {
    storage = getStorage() ?? null;
  } catch {
    storage = null;
  }
  let saved = storage !== null;
  let done = new Set<string>();

  const read = () => {
    if (!storage) return;
    try {
      done = parseProgress(storage.getItem(PROGRESS_KEY));
    } catch {
      saved = false;
    }
  };
  const write = () => {
    if (!storage) return;
    try {
      if (done.size > 0) storage.setItem(PROGRESS_KEY, serializeProgress(done));
      else storage.removeItem(PROGRESS_KEY);
    } catch {
      saved = false;
    }
  };

  read();
  return {
    get saved() {
      return saved;
    },
    get done() {
      return done;
    },
    set(topic, isDone) {
      if (isDone === done.has(topic)) return;
      if (isDone) done.add(topic);
      else done.delete(topic);
      write();
    },
    clear() {
      done = new Set();
      write();
    },
    reload: read,
  };
}
