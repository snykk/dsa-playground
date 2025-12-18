# Rabin-Karp Algorithm (Python)

**Rabin-Karp Algorithm** is a string matching algorithm that uses hashing to find patterns in text. It computes hash values for the pattern and all substrings of text, comparing hashes instead of characters directly.

---

## Overview

The Rabin-Karp algorithm uses a rolling hash function to efficiently compute hash values for all substrings of the text. When hash values match, it performs a character-by-character verification to confirm the match.

**Key Characteristics:**
- Average case: O(n + m) time complexity
- Uses hashing for efficient comparison
- Rolling hash allows O(1) hash update per position
- Worst case: O(n × m) when many hash collisions occur

**Example:**
- Text: "ABABDABACDABABCABC"
- Pattern: "ABABCABC"
- Result: Found at index 10

---

## Algorithm

### Rolling Hash

1. **Calculate pattern hash**: Hash value for pattern
2. **Calculate initial text hash**: Hash value for first m characters of text
3. **Slide window**: For each position:
   - Compare hash values
   - If hashes match, verify character by character
   - Update hash for next window using rolling hash

### Hash Function

- Base: 256 (for ASCII characters)
- Modulus: Large prime number (e.g., 101)
- Formula: `hash = (base * hash + char) % mod`

### Rolling Hash Update

When sliding window:
- Remove leading character: `hash = (hash - text[i] * base^(m-1)) % mod`
- Add trailing character: `hash = (base * hash + text[i+m]) % mod`

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Average Time** | O(n + m) |
| **Worst Time** | O(n × m) |
| **Space** | O(1) |
| **Best Case** | O(n + m) when no hash collisions |

Where:
- n = length of text
- m = length of pattern

**Worst Case Scenario:**
- Many hash collisions requiring character-by-character verification
- Example: Text = "AAAAA", Pattern = "AAA"

---

## Implementation Details

### Functions

1. **`rabin_karp_search(text, pattern, base, mod)`**
   - Find all occurrences of pattern in text
   - Returns list of starting indices
   - Time: O(n + m) average, O(n × m) worst
   - Space: O(1)

2. **`rabin_karp_search_count(text, pattern)`**
   - Count occurrences of pattern in text
   - Returns number of occurrences
   - Time: O(n + m) average

3. **`rabin_karp_search_first(text, pattern)`**
   - Find first occurrence of pattern in text
   - Returns index of first occurrence, or -1 if not found
   - Time: O(n + m) average

---

## Usage

```python
from rabin_karp import rabin_karp_search, rabin_karp_search_count

# Find all occurrences
text = "ABABDABACDABABCABC"
pattern = "ABABCABC"
occurrences = rabin_karp_search(text, pattern)
print(occurrences)  # [10]

# Count occurrences
count = rabin_karp_search_count(text, pattern)
print(count)  # 1
```

---

## Important Notes

1. **Hash Collisions**: Different strings can have same hash (false positives)
2. **Verification**: Always verify character-by-character when hashes match
3. **Modulus Choice**: Large prime modulus reduces collisions
4. **Average Case**: Typically very fast in practice

---

## Advantages

- ✅ Average case O(n + m) time
- ✅ Simple to implement
- ✅ Works well for multiple patterns
- ✅ Can be extended for 2D pattern matching

---

## Disadvantages

- ❌ Worst case O(n × m) with many collisions
- ❌ Requires careful hash function design
- ❌ Hash collisions require verification

---

## When to Use

- Average case performance is acceptable
- Multiple pattern searches
- When simplicity is preferred over worst-case guarantee
- 2D pattern matching applications

---

## Related Algorithms

- **Naive Pattern Search**: O(n × m), simpler but always slow
- **KMP Algorithm**: O(n + m) guaranteed, more complex
- **Boyer-Moore Algorithm**: O(n/m) best case with character skipping
- **Z-Algorithm**: O(n + m) with Z-array preprocessing

---

## Testing

Run tests with:

```bash
# Python
python -m unittest rabin_karp_test.py

# Or run directly
python rabin_karp_test.py

# Or run the main file to see example usage
python rabin_karp.py
```

---

## References

- Rabin, M. O., & Karp, R. M. (1987). "Efficient randomized pattern-matching algorithms"
- "Introduction to Algorithms" by CLRS (Chapter 32)

---

_Last Updated: December 2025_

