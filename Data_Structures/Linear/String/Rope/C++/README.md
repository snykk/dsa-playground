# Rope -- C++ Implementation

## Files

| File | Contents |
| --- | --- |
| `rope.cpp` | `RopeNode`, the free helpers (`ropeJoin`, `ropeSplit`, `ropeBuild`, ...) and class `Rope` (no `main()`) |
| `rope_test.cpp` | assert-based tests, a randomized comparison with `std::string` and tree-invariant checks |

## API

- `Rope()`, `Rope(const string&)`: empty rope or a balanced rope (leaves of at most 10 bytes).
- `char index(int i) const`: throws `std::out_of_range` out of range. O(log n).
- `Rope concat(const Rope&) const`: a new rope; sources unchanged. O(log n).
- `pair<Rope, Rope> split(int i) const`: `i` is clamped.
- `void insert(int i, const string&)`, `void deleteStr(int i, int length)`: modify in place.
- `string toString() const`: the whole text. O(n).
- `int length() const`: O(1) (cached).
- `int height() const`: 0 for one leaf, -1 for an empty rope.

## C++-Specific Notes

- Nodes are `shared_ptr<RopeNode>`; subtrees shared between ropes are freed when the last rope releases them. No manual `delete`, and the default copy of a `Rope` is safe because nodes are immutable.
- Positions are bytes (`std::string`), so non-ASCII text can be cut mid-character.
- Recursion depth is the tree height, O(log n), so neither traversal nor the `shared_ptr` destructor chain can overflow the stack. Before the AVL-style join, 500,000 appends at the end crashed with a stack overflow.
- A leaf is recognised by a non-empty `data`; internal nodes have empty `data`.
- Weights, lengths and heights are `int`, which limits a rope to about 2 billion bytes.

## How to Run

```bash
cd "Data_Structures/Linear/String/Rope/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD rope_test.cpp -o /tmp/rope && /tmp/rope
# with AddressSanitizer:
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD rope_test.cpp -o /tmp/rope_asan && /tmp/rope_asan
```

## Key Takeaways

- Immutable shared nodes make persistence free.
- The join keeps the height logarithmic, which also keeps recursion safe.
- Positions are bytes.
