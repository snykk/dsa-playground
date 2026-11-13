# Red-Black Tree -- C++ Implementation

## Files

- `red_black_tree.cpp`: `RBNode` and `RedBlackTree` (the class is defined in the `.cpp`; tests include it directly).
- `red_black_tree_test.cpp`: assert-based tests, including random invariant checks.

## API

- `void insert(int data)`: insert (duplicates allowed). O(log n).
- `bool search(int data)`: O(log n).
- `vector<int> inorderTraversal()`: sorted keys. O(n).
- `int size()`, `bool isEmpty()`.
- `bool isValid()`: checks the five rules, BST order and parent links. O(n).

There is no delete, `height()`, `findMin()` or `findMax()` in C++.

## C++-Specific Notes

- The tree owns raw `new` nodes and a sentinel. The destructor frees them, and the copy constructor and copy assignment are `= delete` (a shallow copy would free nodes twice).
- Keys are `int`.
- The test file has `static_assert`s that the class is not copyable.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Red_Black_Tree/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD red_black_tree_test.cpp -o red_black_tree_test
./red_black_tree_test
```

Optional memory check (use-after-free and overflow detection):

```bash
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD red_black_tree_test.cpp -o rb_asan && ./rb_asan
```

## Key Takeaways

- A class with raw owning pointers must not be copyable by default.
- `isValid()` makes the red-black rules directly testable.
