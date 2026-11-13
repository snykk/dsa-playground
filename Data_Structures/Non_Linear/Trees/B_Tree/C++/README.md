# B-Tree -- C++ Implementation

A B-tree of minimum degree `t` over `int` keys, with insert, delete, search and sorted traversal. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `b_tree.cpp` | `BTreeNode` and `BTree` (header-style, included directly) |
| `b_tree_test.cpp` | unit tests, a split regression test, and a randomized test against `std::set` with a `validate()` check |

## API

| Call | Result |
| ---- | ------ |
| `BTree(int t = 3)` | empty tree |
| `void insert(int key)` | adds a key; an existing key is stored again |
| `bool search(int key) const` | whether the key is present |
| `bool remove(int key)` | removes one copy; false if absent (`delete` is a C++ keyword) |
| `vector<int> traverse() const` | all keys in sorted order |
| `bool validate() const` | fill bounds, key order and equal leaf depth all hold |

## C++-Specific Notes

- The tree owns its nodes: the destructor frees every node, and copying is deleted (a copy would double free). Move the tree by pointer or keep it in place.
- A split used to lose one key per split in an earlier version; `testSplitKeepsAllKeys` guards against that.
- Keys are `int`. Nodes keep `vector<int>` keys and `vector<BTreeNode*>` children.
- Merging hands the right node's children to the left node before freeing it, so nothing is freed twice.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/B_Tree/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD b_tree_test.cpp -o b_tree_test && ./b_tree_test
# optional: AddressSanitizer + UBSan
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD b_tree_test.cpp -o b_tree_asan && ./b_tree_asan
```

## Key Takeaways

- Save the median key before erasing the upper half of a node; reading it afterwards is out of bounds.
- Own the nodes in one place (the destructor) and delete copying.
- `validate()` turns the invariants into an assertion usable in tests.
