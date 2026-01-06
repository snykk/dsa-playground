# Longest Common Substring

Finding the longest substring common to multiple strings.

## Approaches

### Dynamic Programming
- Time: O(nm)
- Space: O(nm) or O(min(n,m))

### Suffix Array
- Concatenate strings with unique separators
- Build suffix array and LCP
- Find longest LCP between suffixes from different strings

## Algorithm (DP)

```
if s1[i] == s2[j]:
    dp[i][j] = dp[i-1][j-1] + 1
else:
    dp[i][j] = 0
```

## Applications

- DNA sequence alignment
- Diff tools
- Plagiarism detection

