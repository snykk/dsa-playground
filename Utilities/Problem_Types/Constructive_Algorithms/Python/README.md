# Constructive Algorithms -- Python Implementation

## Files

| File | Contents |
|------|----------|
| `constructive.py` | nine builders and a demo under `if __name__ == "__main__"` |
| `constructive_test.py` | unit tests, including the permutation builder over all `n <= 12` and the graph builder against an Erdos-Gallai test |

## API

| Function | Returns |
|----------|---------|
| `construct_permutation(n, k)` | permutation of 1..n with exactly `k` distinct adjacent differences, or `None` |
| `construct_array_with_sum(n, total, min_val, max_val)` | list, or `None` |
| `construct_graph(degrees)` | list of `(u, v)` edges (Havel-Hakimi), or `None` |
| `construct_string(n, count_a, count_b)` | string with no equal neighbors, or `None` (also when `n != count_a + count_b`) |
| `greedy_construction(n, constraints)` | list, or `None` |
| `construct_matrix(row_sums, col_sums)` | matrix, or `None`; inputs are not modified |
| `construct_by_decomposition(target)` | powers of two summing to `target`; `[]` for `target < 1` |
| `construct_tree(n, parent_constraints)` | edge list, or `None` |
| `construct_balanced_string(s)` | sorted characters, or `None` unless every character occurs equally often |

## Python-Specific Notes

- Impossible input returns `None`, not an exception.
- Integers are unbounded, so `construct_by_decomposition` handles any size.
- `greedy_construction` scans a `set` for each element, so it is O(n^2).

## How to Run

```bash
python3 -m unittest constructive_test
python3 constructive.py
```

## Key Takeaways

- Check feasibility first, then build with a simple rule.
- Verify a construction with a checker over all small inputs.
