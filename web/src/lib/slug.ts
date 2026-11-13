/**
 * Turn one repository folder name into a URL-safe slug segment.
 *
 * Folder names in the repo mix spaces, underscores, apostrophes, parentheses and
 * even Greek letters ("Big-Theta (\u0398)"), so this normalizes aggressively:
 *   "Dijkstra's_Algorithm"            -> "dijkstras-algorithm"
 *   "Segment Tree (Lazy Propagation)" -> "segment-tree-lazy-propagation"
 *   "B+ Tree"                         -> "b-plus-tree"   (keeps it distinct from "B-Tree")
 *   "Big-Theta (\u0398)"                   -> "big-theta"
 */
export function slugifySegment(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .replace(/['\u2019]/g, '') // apostrophes join words: Dijkstra's -> Dijkstras
    .replace(/\+\+/g, 'pp') // C++ -> Cpp
    .replace(/\+/g, ' plus ')
    .replace(/&/g, ' and ')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** Slug for a repo-relative directory path ("Algorithms/Sorting/Bubble_Sort"). */
export function slugifyPath(relDir: string): string {
  return relDir
    .split('/')
    .filter(Boolean)
    .map(slugifySegment)
    .join('/');
}
