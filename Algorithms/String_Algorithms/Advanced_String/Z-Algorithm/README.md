# Z-Algorithm

Linear time algorithm for computing Z-array.

## Z-Array

Z[i] = length of longest substring starting at i that matches a prefix of the string

## Algorithm

1. Maintain Z-box [l, r] where s[l..r] matches s[0..r-l]
2. Use Z-box to skip redundant comparisons
3. Extend matches beyond Z-box when needed

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Build Z-array | O(n) | O(n) |

## Applications

- Pattern matching (concatenate pattern + "$" + text)
- String periodicity
- Distinct substrings

