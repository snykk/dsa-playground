# Skip List -- C++ Implementation

## Files

| File | Contents |
| --- | --- |
| `skip_list.cpp` | `Node` and `SkipList` (no `main()`) |
| `skip_list_test.cpp` | assert-based tests, including a randomized check against `std::set` |

## API

- `SkipList(int max_level = 16, float p = 0.5)`
- `void insert(int key)`: an existing key is ignored.
- `bool search(int key)`
- `bool deleteNode(int key)`: `true` if the key was present.
- `vector<int> display()`: sorted keys.
- Copy constructor and copy assignment are deleted.

## C++-Specific Notes

- Nodes are allocated with `new` and freed by the destructor, which walks level 0 (every node is on it).
- Copying is deleted: a shallow copy would make two lists free the same nodes. A `static_assert` in the tests checks that copying does not compile.
- Each list owns an `mt19937` seeded from `std::random_device`, and heights come from `bernoulli_distribution(p)`. Constructing a list does not touch the global `rand()` state.
- `Node::forward` is a `vector<Node*>` with `height + 1` entries.
- The header key `-1` is a placeholder that is never compared.

## How to Run

```bash
cd "Data_Structures/Linear/Linked_List/Skip_List/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD skip_list_test.cpp -o /tmp/skiplist && /tmp/skiplist
# with AddressSanitizer:
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD skip_list_test.cpp -o /tmp/skiplist_asan && /tmp/skiplist_asan
```

## Key Takeaways

- A class with a destructor that frees raw nodes must not be copyable (rule of three).
- Use a per-object random generator instead of re-seeding `rand()`.
- `update` holds one predecessor per level.
