# Skip List

A Skip List is a probabilistic data structure that allows efficient search, insertion, and deletion operations on a sorted sequence of elements. It extends a standard linked list by adding multiple layers of forward pointers, enabling elements to be "skipped" during traversal.

## How It Works

- The bottom level (level 0) is a regular sorted linked list containing all elements.
- Each higher level acts as an "express lane" that skips over elements.
- A new element's level is determined randomly using a coin-flip probability (typically p=0.5).
- Search starts from the top level and moves right until overshooting, then drops down a level.

## Visual Example

```
Level 3: header ────────────────────────────────────→ 25 ──→ NIL
Level 2: header ──────────→ 6 ──────────────────────→ 25 ──→ NIL
Level 1: header ──→ 3 ──→ 6 ────────→ 12 ──────────→ 25 ──→ NIL
Level 0: header ──→ 3 ──→ 6 ──→ 9 ──→ 12 ──→ 19 ──→ 25 ──→ NIL
```

## Operations

1. **Search** - Start at the highest level, move right while the next key is smaller, drop down when overshooting.
2. **Insert** - Search for the correct position, generate a random level, insert at each level up to that level.
3. **Delete** - Locate the node at each level and remove it from each linked list.
4. **Display** - Traverse the bottom level to collect all elements in sorted order.

## Time Complexity

| Operation | Average  | Worst Case |
|-----------|----------|------------|
| Search    | O(log n) | O(n)       |
| Insert    | O(log n) | O(n)       |
| Delete    | O(log n) | O(n)       |
| Space     | O(n)     | O(n log n) |

## Advantages

- Simpler to implement than balanced BSTs (AVL, Red-Black Trees)
- Probabilistic balancing requires no rotations or restructuring
- Efficient concurrent access (easier to lock individual levels)

## Disadvantages

- Uses more memory than a simple linked list due to multiple forward pointers
- Worst-case performance is O(n), though this is extremely unlikely
- Performance depends on random number generator quality
