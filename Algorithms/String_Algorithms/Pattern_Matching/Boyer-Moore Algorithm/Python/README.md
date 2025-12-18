# Boyer-Moore Algorithm (Python)

**Boyer-Moore Algorithm** is an efficient string matching algorithm that uses two heuristics: bad character rule and good suffix rule to skip characters.

---

## Overview

Boyer-Moore algorithm matches from right to left and uses heuristics to skip characters, making it very efficient in practice, especially for long patterns.

**Key Characteristics:**
- Best case: O(n/m) time complexity
- Matches from right to left
- Uses bad character and good suffix heuristics
- Very efficient for long patterns

---

## Complexity

| Aspect | Complexity |
|--------|------------|
| **Best Time** | O(n/m) |
| **Worst Time** | O(n × m) |
| **Space** | O(m) |

---

## Usage

```python
from boyer_moore import boyer_moore_search
occurrences = boyer_moore_search(text, pattern)
```

---

## Testing

```bash
python -m unittest boyer_moore_test.py
python boyer_moore.py
```

---

_Last Updated: December 2025_

