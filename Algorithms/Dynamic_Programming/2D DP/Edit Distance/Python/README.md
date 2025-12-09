# Edit Distance (Python)

**Edit Distance (Levenshtein Distance)** is the minimum number of single-character operations (insertions, deletions, or substitutions) required to transform one string into another.

---

## Overview

Edit Distance measures the similarity between two strings. It's widely used in spell checkers, DNA sequence alignment, version control systems, and natural language processing. The algorithm uses dynamic programming to efficiently compute the minimum edit distance.

**Example**:
- s1 = "kitten", s2 = "sitting"
- Operations: 
  - k → s (substitute)
  - e → i (substitute)
  - add g (insert)
- Edit distance = 3

---

## Algorithm

1. **DP State**: `dp[i][j]` = edit distance between `s1[0:i]` and `s2[0:j]`
2. **Recurrence**:
   - If `s1[i-1] == s2[j-1]`: `dp[i][j] = dp[i-1][j-1]` (no operation needed)
   - Else: `dp[i][j] = 1 + min(delete, insert, replace)`
     - `delete = dp[i-1][j]` (delete from s1)
     - `insert = dp[i][j-1]` (insert into s1)
     - `replace = dp[i-1][j-1]` (replace in s1)
3. **Base Cases**: 
   - `dp[i][0] = i` (delete all characters from s1)
   - `dp[0][j] = j` (insert all characters into s1)

**Intuition**: At each position, we can either match (if characters are same), or perform one of three operations to make them match.

---

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| **Naive Recursive** | O(3^(m+n)) | O(m+n) | Exponential, not practical |
| **Standard DP** | O(mn) | O(mn) | 2D DP table |
| **Space-Optimized** | O(mn) | O(min(m,n)) | Use 2 rows/columns only |

Where:
- `m` = length of first string
- `n` = length of second string

**Note**: Space can be optimized to O(min(m,n)) by using only two rows.

---

## Implementation Details

### Functions

1. **`edit_distance(s1, s2)`**
   - Standard DP approach
   - Returns minimum edit distance
   - Time: O(mn), Space: O(mn)

2. **`edit_distance_optimized(s1, s2)`**
   - Space-optimized version
   - Uses only O(min(m,n)) space
   - Returns minimum edit distance
   - Time: O(mn), Space: O(min(m,n))

3. **`edit_distance_with_operations(s1, s2)`**
   - Returns edit distance and sequence of operations
   - Uses backtracking through DP table
   - Returns (distance, operations_list)
   - Time: O(mn), Space: O(mn)

---

## Operations

1. **Insert**: Add a character to s1
2. **Delete**: Remove a character from s1
3. **Replace/Substitute**: Change a character in s1

**Note**: All operations have cost 1. Can be modified to have different costs.

---

## Usage

```python
from edit_distance import (
    edit_distance,
    edit_distance_optimized,
    edit_distance_with_operations
)

# Basic usage
dist = edit_distance("kitten", "sitting")
print(dist)  # Output: 3

# Same strings
dist = edit_distance("abc", "abc")
print(dist)  # Output: 0

# One empty string
dist = edit_distance("abc", "")
print(dist)  # Output: 3 (delete all)

# Space-optimized
dist = edit_distance_optimized("kitten", "sitting")
print(dist)  # Output: 3

# With operations
dist, ops = edit_distance_with_operations("kitten", "sitting")
print(dist)  # Output: 3
print(ops)   # Output: [('replace', 0, 'k', 's'), ...]

# Real-world examples
dist = edit_distance("intention", "execution")
print(dist)  # Output: 5
```

---

## Important Notes

1. **Symmetric**: `edit_distance(s1, s2) == edit_distance(s2, s1)`
2. **Operations**: All operations have equal cost (can be modified)
3. **Case sensitivity**: Usually case-sensitive (can be modified)
4. **Space optimization**: Can reduce space but lose operation tracking
5. **Multiple solutions**: There may be multiple ways to achieve minimum distance

---

## Advantages

1. ✅ **Optimal**: DP guarantees optimal solution
2. ✅ **Efficient**: O(mn) time complexity
3. ✅ **Space optimizable**: Can reduce to O(min(m,n)) space
4. ✅ **Versatile**: Can get distance or actual operations

---

## Disadvantages

1. ❌ **Quadratic time**: O(mn) can be slow for very long strings
2. ❌ **Memory**: O(mn) space for full table
3. ❌ **Equal cost**: Assumes all operations have same cost

---

## When to Use

- ✅ **String similarity**: Measuring similarity between strings
- ✅ **Spell checking**: Finding closest matching word
- ✅ **DNA alignment**: Comparing genetic sequences
- ✅ **Version control**: Computing differences between files
- ❌ **Very long strings**: May need optimization or approximation

---

## Variations

1. **Weighted Edit Distance**: Different costs for insert, delete, replace
2. **Damerau-Levenshtein**: Includes transposition operation
3. **Longest Common Subsequence**: Related problem (only insert/delete)

---

## Testing

Run the test suite:

```bash
python edit_distance_test.py
```

---

## Related Algorithms

- **Longest Common Subsequence**: Similar DP structure
- **Hamming Distance**: Only substitutions allowed
- **Jaro-Winkler Distance**: Different similarity metric

---

## Applications

1. **Spell Checkers**: Find closest matching word
2. **DNA Sequence Alignment**: Bioinformatics, genetic analysis
3. **Diff Algorithms**: Version control systems (Git, SVN)
4. **Fuzzy String Matching**: Search with typos
5. **Natural Language Processing**: Text similarity, machine translation

---

## References

- Levenshtein, V. I. (1966). "Binary codes capable of correcting deletions, insertions, and reversals"
- "Introduction to Algorithms" by CLRS (Chapter 15)
- LeetCode Problem 72: Edit Distance

---

_Last Updated: December 2025_
