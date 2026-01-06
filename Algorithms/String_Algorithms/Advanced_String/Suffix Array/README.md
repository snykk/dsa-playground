# Suffix Array

A sorted array of all suffixes of a string.

## Construction

1. Generate all suffixes with their indices
2. Sort suffixes lexicographically
3. Store the starting indices

## Complexity

| Algorithm | Time | Space |
|-----------|------|-------|
| Naive | O(n² log n) | O(n) |
| SA-IS | O(n) | O(n) |
| DC3 | O(n) | O(n) |

## LCP Array

LCP[i] = longest common prefix between suffix[i] and suffix[i-1]

## Applications

- Substring search: O(m log n)
- Longest repeated substring
- Number of distinct substrings
- Longest common substring

