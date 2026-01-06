# Rabin-Karp Algorithm

Hash-based pattern matching algorithm.

## Algorithm

1. Compute hash of pattern
2. Compute hash of each text window
3. Compare hashes; if match, verify characters
4. Use rolling hash for efficient window updates

## Complexity

| Case | Time | Space |
|------|------|-------|
| Average | O(n + m) | O(1) |
| Worst | O(nm) | O(1) |

## Rolling Hash

```
hash(s[i+1..i+m]) = (hash(s[i..i+m-1]) - s[i] * d^(m-1)) * d + s[i+m]
```

## Applications

- Multiple pattern search
- Plagiarism detection
- DNA sequence matching

