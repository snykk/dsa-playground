# Manacher's Algorithm

Linear time algorithm for finding longest palindromic substring.

## Algorithm

1. Transform string: "abc" → "#a#b#c#"
2. Use previously computed palindromes
3. Expand around center when needed
4. Maintain rightmost palindrome boundary

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Find all palindromes | O(n) | O(n) |

## Key Insight

If we're inside a known palindrome, we can use symmetry to initialize our search.

## Applications

- Finding longest palindrome
- Counting palindromic substrings
- Palindrome-related problems

