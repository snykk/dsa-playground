# Naive Pattern Search

Simple brute-force pattern matching algorithm.

## Algorithm

1. For each position in text
2. Compare pattern with text starting at that position
3. If all characters match, pattern found

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(n) | O(1) |
| Worst | O(nm) | O(1) |
| Average | O(nm) | O(1) |

n = text length, m = pattern length

## When to Use

- Short patterns
- Simple implementation needed
- One-time search

