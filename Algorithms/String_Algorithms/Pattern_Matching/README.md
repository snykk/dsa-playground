# Pattern Matching Algorithms

Algorithms for finding patterns within strings.

## Topics

| Algorithm | Description |
|-----------|-------------|
| [Naive Pattern Search](Naive%20Pattern%20Search/) | Simple brute-force approach |
| [KMP Algorithm](KMP%20Algorithm/) | Knuth-Morris-Pratt with failure function |
| [Rabin-Karp Algorithm](Rabin-Karp%20Algorithm/) | Hash-based pattern matching |
| [Boyer-Moore Algorithm](Boyer-Moore%20Algorithm/) | Right-to-left with bad character rule |

## Complexity Comparison

| Algorithm | Preprocessing | Matching | Space |
|-----------|---------------|----------|-------|
| Naive | O(1) | O(nm) | O(1) |
| KMP | O(m) | O(n) | O(m) |
| Rabin-Karp | O(m) | O(n)* | O(1) |
| Boyer-Moore | O(m + σ) | O(n/m)† | O(σ) |

*Average case, †Best case

## When to Use

- **Naive**: Short patterns, simple implementation
- **KMP**: Single pattern, guaranteed linear time
- **Rabin-Karp**: Multiple patterns, plagiarism detection
- **Boyer-Moore**: Long patterns, text editors

