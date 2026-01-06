# Knuth-Morris-Pratt (KMP) Algorithm

Efficient pattern matching using failure function.

## Algorithm

1. Precompute failure function (LPS array)
2. Use failure function to skip redundant comparisons
3. Never backtrack in the text

## Complexity

| Phase | Time | Space |
|-------|------|-------|
| Preprocessing | O(m) | O(m) |
| Matching | O(n) | O(1) |
| Total | O(n + m) | O(m) |

## Failure Function

LPS[i] = longest proper prefix of pattern[0..i] that is also a suffix

## Applications

- Single pattern search
- String periodicity
- Repeated substring problems

