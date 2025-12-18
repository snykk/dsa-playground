# Z-Algorithm (Python)

**Z-Algorithm** constructs a Z-array where Z[i] is the length of the longest substring starting from position i which is also a prefix of the string.

---

## Overview

Z-Algorithm is used for pattern matching and string processing. It builds a Z-array in linear time and can be used to find all occurrences of a pattern in text.

**Time Complexity:** O(n + m)  
**Space Complexity:** O(n + m)

---

## Usage

```python
from z_algorithm import z_algorithm_search, build_z_array

occurrences = z_algorithm_search(text, pattern)
z = build_z_array(string)
```

---

## Testing

```bash
python -m unittest z_algorithm_test.py
python z_algorithm.py
```

---

_Last Updated: December 2025_

