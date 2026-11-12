# Treap -- C++ Implementation

## Files

- `treap.h`: the `Treap` class (header only).
- `treap_test.cpp`: assert-based tests, including a randomized stress test and a regression test for `INT_MAX` and `INT_MIN` keys.

## API

- `bool insert(int key)`: `false` if the key is already present.
- `bool erase(int key)`: `false` if the key is absent.
- `bool contains(int key) const`
- `int size() const`
- `void inorder(const std::function<void(int)>& visit) const`: sorted keys through a callback.
- `bool checkHeapProperty() const`: diagnostic.

## C++-Specific Notes

- Nodes are owned by `std::unique_ptr`, so the tree frees itself and cannot be copied (only moved).
- Priorities are 32-bit values from a `std::mt19937` seeded with `std::random_device`.
- `erase` does not compute `key + 1`, which would overflow (undefined behavior) at `INT_MAX`.
- `split` and `merge` are recursive; the depth is the height, expected O(log n).

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Treap/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD treap_test.cpp -o treap_test
./treap_test
```

## Key Takeaways

- `unique_ptr` makes split and merge express ownership transfer directly.
- Erase drops the minimum of the right part instead of splitting at `key + 1`.
