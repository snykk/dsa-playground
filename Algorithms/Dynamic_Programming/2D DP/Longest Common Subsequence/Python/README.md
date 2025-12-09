# Longest Common Subsequence (Python)

**Longest Common Subsequence (LCS)** finds the longest subsequence common to two strings. A subsequence is a sequence that appears in the same relative order, but not necessarily contiguous.

---

## Overview

LCS is a fundamental problem in string algorithms and dynamic programming. Unlike longest common substring (which must be contiguous), LCS allows non-contiguous matching, making it more flexible and widely applicable.

**Example**:
- s1 = "ABCDGH"
- s2 = "AEDFHR"
- LCS = "ADH" (length 3)
- Note: "ADH" appears in both strings in same order, but not contiguous

---

## Algorithm

1. **DP State**: `dp[i][j]` = length of LCS between `s1[0:i]` and `s2[0:j]`
2. **Recurrence**:
   - If `s1[i-1] == s2[j-1]`: `dp[i][j] = dp[i-1][j-1] + 1` (match, extend LCS)
   - Else: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])` (no match, take best)
3. **Base Case**: `dp[0][j] = 0`, `dp[i][0] = 0` (empty string has LCS length 0)

**Intuition**: 
- If characters match, extend the LCS from previous position
- If they don't match, take the maximum of skipping character from s1 or s2

---

## Complexity Analysis

| Approach | Time | Space |
|----------|------|-------|
| **Standard DP** | O(mn) | O(mn) |
| **Space-Optimized** | O(mn) | O(min(m,n)) |
| **Sequence Reconstruction** | O(mn) | O(mn) |

Where:
- `m` = length of first string
- `n` = length of second string

**Note**: Space can be optimized to O(min(m,n)) by using only two rows/columns.

---

## Implementation Details

### Functions

1. **`lcs_length(s1, s2)`**
   - Finds length of LCS using standard DP
   - Returns integer length
   - Time: O(mn), Space: O(mn)

2. **`lcs_sequence(s1, s2)`**
   - Finds actual LCS string (not just length)
   - Reconstructs sequence by backtracking through DP table
   - Returns LCS string
   - Time: O(mn), Space: O(mn)

3. **`lcs_optimized(s1, s2)`**
   - Space-optimized version
   - Uses only O(min(m,n)) space
   - Returns length only (reconstruction needs full table)
   - Time: O(mn), Space: O(min(m,n))

---

## Usage

```python
from lcs import lcs_length, lcs_sequence, lcs_optimized

s1 = "ABCDGH"
s2 = "AEDFHR"

# Length only (standard)
length = lcs_length(s1, s2)
print(length)  # Output: 3

# Get actual sequence
sequence = lcs_sequence(s1, s2)
print(sequence)  # Output: "ADH"

# Space-optimized (for large strings)
length = lcs_optimized(s1, s2)
print(length)  # Output: 3

# Real-world example
s1 = "AGGTAB"
s2 = "GXTXAYB"
lcs = lcs_sequence(s1, s2)
print(lcs)  # Output: "GTAB"

# Empty LCS
s1 = "ABC"
s2 = "XYZ"
length = lcs_length(s1, s2)
print(length)  # Output: 0
```

---

## Important Notes

1. **Subsequence vs Substring**: 
   - Subsequence: non-contiguous (LCS)
   - Substring: contiguous (different problem)
2. **Multiple LCS**: There may be multiple LCS of same length
3. **Reconstruction**: Need full DP table to reconstruct sequence
4. **Space optimization**: Can reduce space but lose ability to reconstruct
5. **Case sensitivity**: Usually case-sensitive (can be modified)

---

## Advantages

1. ✅ **Optimal**: DP guarantees optimal solution
2. ✅ **Efficient**: O(mn) time complexity
3. ✅ **Space optimizable**: Can reduce to O(min(m,n)) space
4. ✅ **Versatile**: Can get length or actual sequence

---

## Disadvantages

1. ❌ **Quadratic time**: O(mn) can be slow for very long strings
2. ❌ **Memory**: O(mn) space for full table
3. ❌ **Reconstruction overhead**: Need full table to get sequence

---

## When to Use

- ✅ **String comparison**: Finding similarity between strings
- ✅ **Diff algorithms**: Version control, text comparison
- ✅ **Bioinformatics**: DNA/RNA sequence alignment
- ❌ **Very long strings**: May need optimization or approximation
- ❌ **When substring needed**: Use different algorithm for contiguous matching

---

## Comparison: LCS vs Longest Common Substring

| Aspect | LCS (Subsequence) | Longest Common Substring |
|--------|-------------------|-------------------------|
| **Contiguity** | Non-contiguous | Must be contiguous |
| **Complexity** | O(mn) | O(mn) |
| **Applications** | Diff, alignment | Pattern matching |
| **Example** | "ADH" from "ABCDGH" and "AEDFHR" | "AB" from "ABCD" and "ABXY" |

---

## Testing

Run the test suite:

```bash
python lcs_test.py
```

---

## Related Algorithms

- **Longest Common Substring**: Contiguous version (different DP)
- **Edit Distance**: Similar DP structure, different objective
- **Shortest Common Supersequence**: Related problem (SCS = m + n - LCS)
- **Longest Increasing Subsequence**: Similar DP pattern

---

## Applications

1. **Diff Algorithms**: Git, SVN use LCS for showing differences
2. **DNA Sequence Alignment**: Bioinformatics, finding common genes
3. **Plagiarism Detection**: Comparing documents for similarity
4. **Version Control**: Merging and comparing file versions
5. **Spell Checkers**: Finding closest matching words

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 15)
- "Algorithm Design Manual" by Steven Skiena
- LeetCode Problem 1143: Longest Common Subsequence

---

_Last Updated: December 2025_

