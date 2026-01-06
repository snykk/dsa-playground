# Boyer-Moore Algorithm

Efficient pattern matching using right-to-left comparison.

## Algorithm

1. Compare pattern from right to left
2. Use bad character rule to skip alignments
3. Use good suffix rule for further optimization

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(n/m) | O(m + σ) |
| Average | O(n) | O(m + σ) |
| Worst | O(nm) | O(m + σ) |

σ = alphabet size

## Heuristics

- **Bad Character**: Skip based on mismatched character
- **Good Suffix**: Skip based on matched suffix

## Applications

- Text editors (search/replace)
- Long pattern matching
- Large text processing

