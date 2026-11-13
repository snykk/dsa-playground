# Mo's Algorithm -- Python Implementation

## Files

| File | Contents |
|------|----------|
| `mos_algorithm.py` | the `MoSAlgorithm` class, `count_distinct_in_ranges` and a demo `main()` |
| `mos_algorithm_test.py` | unit tests (examples, order of answers, empty input, randomized check against brute force) |

## API

| Function | Description |
|----------|-------------|
| `MoSAlgorithm(arr)` | stores the array; block size is `max(1, int(sqrt(n)))` |
| `process_queries(queries)` | `queries` is a list of 0-indexed inclusive `(l, r)` tuples; returns distinct counts in input order |
| `add(current_ans, value, freq)`, `remove(current_ans, value, freq)` | update the distinct count and the frequency dict |
| `count_distinct_in_ranges(arr, queries)` | convenience wrapper |

## Python-Specific Notes

- The aggregate is distinct counting; change `add` and `remove` for another statistic.
- The array is stored, not copied; it is never modified.

## How to Run

```bash
python3 -m unittest mos_algorithm_test
python3 mos_algorithm.py
```

## Key Takeaways

- Queries are sorted by `(block of l, r)` and answered in input order.
- Total pointer movement is O((N + Q) sqrt N).
