# Interactive Problems -- Python Implementation

## Files

| File | Contents |
|------|----------|
| `interactive.py` | query and answer helpers, search strategies and a `solve` template |
| `interactive_test.py` | tests that run the functions against an in-process fake judge |

## API

| Function | Description |
|----------|-------------|
| `query(x)`, `query_multi(*args)` | print `? ...` with `flush=True`, return the integer reply |
| `answer(x)`, `answer_multi(*args)` | print `! ...` with `flush=True` |
| `guess_number(n)` | binary search with `higher` / `lower` / `correct` replies |
| `binary_search_answer(n, predicate)` | offline binary search for the largest `m` with `predicate(m)` |
| `explore_graph(n)` | BFS from node 1 using a neighbor query; returns the adjacency list |
| `find_maximum(n)`, `tournament(n)` | maximum by comparisons; both print the answer and return the index |
| `guess_subset(n)` | one membership query per element; returns the subset |
| `binary_subset_search(n)` | finds a hidden number in 0..n bit by bit; prints and returns it |
| `check_response()` | reads a reply, exits on `-1` |
| `solve()` | template |

## Python-Specific Notes

- Reading uses `input()`, which is fine for interactive problems because it reads one line.
- Always pass `flush=True` (or call `sys.stdout.flush()`).
- The tests replace `sys.stdout` and `input()` with a fake judge; `FakeJudge` also fails if a reply is read before a flush.

## How to Run

```bash
python3 -m unittest interactive_test
```

## Key Takeaways

- Flush after every line you print.
- Count queries before coding; binary search gives O(log n).
