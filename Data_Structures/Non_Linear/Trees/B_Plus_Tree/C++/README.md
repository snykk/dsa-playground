# B+ Tree -- C++ Implementation

A B+ tree over `int` keys with `std::string` values. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `b_plus_tree.cpp` | `BPlusTreeNode` and `BPlusTree` (included directly by the tests) |
| `b_plus_tree_test.cpp` | unit tests, a split test, a duplicate-key test and a randomized test against `std::map` with a `validate()` check |

## API

| Call | Result |
| ---- | ------ |
| `BPlusTree(int t = 3)` | empty tree |
| `void insert(int key, const string& value)` | stores the pair; an existing key is overwritten |
| `string search(int key)` | the value, or `""` when missing |
| `vector<pair<int, string>> range_search(int lo, int hi)` | pairs with `lo <= key <= hi`, in key order |
| `vector<pair<int, string>> traverse()` | every pair in key order |
| `bool validate() const` | fill bounds, separators, leaf depth and the leaf chain all hold |

There is no delete.

## C++-Specific Notes

- The destructor frees the tree through the `children` vectors. Leaves are also linked by `next`, but `next` is not owned, so nothing is freed twice.
- Copying is deleted; a shallow copy would double free.
- `search` returns `""` for a missing key, which is also a valid stored value.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/B_Plus_Tree/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD b_plus_tree_test.cpp -o b_plus_tree_test && ./b_plus_tree_test
# optional: AddressSanitizer + UBSan
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD b_plus_tree_test.cpp -o b_plus_tree_asan && ./b_plus_tree_asan
```

## Key Takeaways

- Own nodes through `children` only; `next` is a non-owning link.
- `range_search` and `traverse` use the leaf chain, the point of a B+ tree.
- `validate()` makes the invariants testable.
