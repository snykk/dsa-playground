# Naive Pattern Search (Python)

**Naive Pattern Search** is the simplest string matching algorithm that checks all positions in the text to see if the pattern matches.

---

## Overview

The naive pattern search algorithm is a straightforward approach to finding all occurrences of a pattern in a text string. It works by sliding the pattern over the text one position at a time and checking for a match at each position.

**Key Characteristics:**
- Simple and easy to understand
- No preprocessing required
- Works for any pattern and text
- Inefficient for large texts (O(n × m) time complexity)

**Example:**
- Text: "ABABDABACDABABCABC"
- Pattern: "ABABCABC"
- Result: Found at index 10

---

## Algorithm

### Steps

1. **Initialize**: Start from the first position in text
2. **Slide Pattern**: For each position i in text (0 to n - m):
   - Compare pattern with text starting at position i
   - Check if all characters match
3. **Record Match**: If all characters match, record position i
4. **Continue**: Move to next position and repeat

### Pseudocode

```
function naive_search(text, pattern):
    n = length(text)
    m = length(pattern)
    result = []
    
    for i = 0 to n - m:
        j = 0
        while j < m and text[i + j] == pattern[j]:
            j++
        
        if j == m:
            result.append(i)
    
    return result
```

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Time** | O(n × m) |
| **Space** | O(1) excluding output |
| **Best Case** | O(n) when pattern not found or first character never matches |
| **Worst Case** | O(n × m) when pattern matches at many positions |

Where:
- n = length of text
- m = length of pattern

**Best Case Example:**
- Text: "ABCDEFG"
- Pattern: "XYZ"
- Time: O(n) - pattern never matches

**Worst Case Example:**
- Text: "AAAAAAAA"
- Pattern: "AAA"
- Time: O(n × m) - many matches, each requiring full comparison

---

## Implementation Details

### Functions

1. **`naive_pattern_search(text, pattern)`**
   - Find all occurrences of pattern in text
   - Returns list of starting indices
   - Time: O(n × m), Space: O(1)

2. **`naive_pattern_search_count(text, pattern)`**
   - Count occurrences of pattern in text
   - Returns number of occurrences
   - Time: O(n × m), Space: O(1)

3. **`naive_pattern_search_first(text, pattern)`**
   - Find first occurrence of pattern in text
   - Returns index of first occurrence, or -1 if not found
   - Time: O(n × m), Space: O(1)

---

## Usage

```python
from naive_pattern_search import (
    naive_pattern_search,
    naive_pattern_search_count,
    naive_pattern_search_first
)

# Find all occurrences
text = "ABABDABACDABABCABC"
pattern = "ABABCABC"
occurrences = naive_pattern_search(text, pattern)
print(occurrences)  # [10]

# Count occurrences
text2 = "AABAACAADAABAABA"
pattern2 = "AABA"
count = naive_pattern_search_count(text2, pattern2)
print(count)  # 3

# Find first occurrence
first = naive_pattern_search_first(text2, pattern2)
print(first)  # 0
```

---

## Important Notes

1. **Inefficiency**: This algorithm is inefficient for large texts due to O(n × m) time complexity
2. **No Preprocessing**: Unlike KMP or Rabin-Karp, no preprocessing is done
3. **Simple Implementation**: Easiest to understand and implement
4. **Use Cases**: Suitable for small texts or when simplicity is preferred

---

## Advantages

- ✅ Simple and easy to understand
- ✅ No preprocessing required
- ✅ Works for any pattern and text
- ✅ Easy to implement

---

## Disadvantages

- ❌ Inefficient: O(n × m) time complexity
- ❌ Rechecks characters multiple times
- ❌ Not suitable for large texts
- ❌ No optimization for repeated patterns

---

## When to Use

- Small texts or patterns
- Educational purposes
- When simplicity is preferred
- As a baseline for comparison

---

## Related Algorithms

- **KMP Algorithm**: O(n + m) with preprocessing
- **Rabin-Karp Algorithm**: O(n + m) average case with hashing
- **Boyer-Moore Algorithm**: O(n/m) best case with character skipping
- **Z-Algorithm**: O(n + m) with Z-array preprocessing

---

## Testing

Run tests with:

```bash
# Python
python -m unittest naive_pattern_search_test.py

# Or run directly
python naive_pattern_search_test.py

# Or run the main file to see example usage
python naive_pattern_search.py
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 32)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

