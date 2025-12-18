# KMP Algorithm (Python)

**KMP (Knuth-Morris-Pratt) Algorithm** is an efficient string matching algorithm that uses preprocessing to avoid rechecking characters that have already been matched.

---

## Overview

The KMP algorithm improves upon naive pattern search by using information from previous matches to skip unnecessary comparisons. It preprocesses the pattern to build a Longest Proper Prefix which is also Suffix (LPS) array, which helps determine how far to shift the pattern when a mismatch occurs.

**Key Characteristics:**
- Efficient: O(n + m) time complexity
- Uses preprocessing: Builds LPS array in O(m) time
- No backtracking: Text pointer never moves backward
- Optimal for repeated patterns

**Example:**
- Text: "ABABDABACDABABCABC"
- Pattern: "ABABCABC"
- LPS: [0, 0, 1, 2, 0, 1, 2, 3]
- Result: Found at index 10

---

## Algorithm

### LPS Array Construction

The LPS array stores the length of the longest proper prefix which is also a suffix for each prefix of the pattern.

**Steps:**
1. Initialize `lps[0] = 0` and `length = 0`
2. For each position `i` from 1 to m-1:
   - If `pattern[i] == pattern[length]`: increment both
   - Else: if `length != 0`, set `length = lps[length - 1]` and don't increment i
   - Else: set `lps[i] = 0` and increment i

### Pattern Matching

1. Build LPS array for pattern
2. Traverse text with two pointers (i for text, j for pattern)
3. When characters match: increment both pointers
4. When mismatch occurs:
   - If `j != 0`: set `j = lps[j - 1]` (don't move text pointer)
   - Else: increment text pointer
5. When `j == m`: pattern found, record position and continue

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Time** | O(n + m) |
| **Space** | O(m) for LPS array |
| **Preprocessing** | O(m) |
| **Search** | O(n) |

Where:
- n = length of text
- m = length of pattern

**Advantages over Naive:**
- No backtracking in text
- Each character in text is examined at most once
- Optimal for patterns with repeated substrings

---

## Implementation Details

### Functions

1. **`build_lps(pattern)`**
   - Build Longest Proper Prefix which is also Suffix array
   - Returns LPS array
   - Time: O(m), Space: O(m)

2. **`kmp_search(text, pattern)`**
   - Find all occurrences of pattern in text
   - Returns list of starting indices
   - Time: O(n + m), Space: O(m)

3. **`kmp_search_count(text, pattern)`**
   - Count occurrences of pattern in text
   - Returns number of occurrences
   - Time: O(n + m), Space: O(m)

4. **`kmp_search_first(text, pattern)`**
   - Find first occurrence of pattern in text
   - Returns index of first occurrence, or -1 if not found
   - Time: O(n + m), Space: O(m)

---

## Usage

```python
from kmp import kmp_search, build_lps, kmp_search_count

# Find all occurrences
text = "ABABDABACDABABCABC"
pattern = "ABABCABC"
occurrences = kmp_search(text, pattern)
print(occurrences)  # [10]

# Build LPS array
lps = build_lps(pattern)
print(lps)  # [0, 0, 1, 2, 0, 1, 2, 3]

# Count occurrences
count = kmp_search_count(text, pattern)
print(count)  # 1
```

---

## Important Notes

1. **Efficiency**: KMP is more efficient than naive search, especially for patterns with repeated substrings
2. **LPS Array**: The key to KMP's efficiency is the LPS array preprocessing
3. **No Backtracking**: Text pointer never moves backward, making it efficient
4. **Best Case**: When pattern has many repeated characters

---

## Advantages

- ✅ O(n + m) time complexity
- ✅ No backtracking in text
- ✅ Optimal for repeated patterns
- ✅ Guaranteed linear time

---

## Disadvantages

- ❌ Requires O(m) extra space for LPS array
- ❌ More complex than naive search
- ❌ Preprocessing overhead for single searches

---

## When to Use

- Large texts or patterns
- Multiple pattern searches
- Patterns with repeated substrings
- When guaranteed linear time is needed

---

## Related Algorithms

- **Naive Pattern Search**: O(n × m), simpler but slower
- **Rabin-Karp Algorithm**: O(n + m) average case with hashing
- **Boyer-Moore Algorithm**: O(n/m) best case with character skipping
- **Z-Algorithm**: O(n + m) with Z-array preprocessing

---

## Testing

Run tests with:

```bash
# Python
python -m unittest kmp_test.py

# Or run directly
python kmp_test.py

# Or run the main file to see example usage
python kmp.py
```

---

## References

- Knuth, D. E., Morris, J. H., & Pratt, V. R. (1977). "Fast pattern matching in strings"
- "Introduction to Algorithms" by CLRS (Chapter 32)

---

_Last Updated: December 2025_

