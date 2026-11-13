# Hash Map -- C++ Implementation

`HashMap<K, V>` inherits from `HashTable<K, V>` and adds three helpers. See the [topic README](../README.md).

## Files

- `hash_map.cpp`: the `HashMap` class template. It includes `../../Hash Table/C++/hash_table.cpp`.
- `hash_map_test.cpp`: assert-based tests for `getOrDefault`, `putIfAbsent` and `update`.

## API

| Member | Description | Time |
|--------|-------------|------|
| everything in `HashTable` | `put`, `get`, `remove`, `contains`, `getSize`, `isEmpty`, `clear` | see Hash Table |
| `V getOrDefault(key, defaultValue)` | the value, or the default if absent | O(1) average |
| `bool putIfAbsent(key, value)` | true if stored, false if the key exists | O(1) average |
| `void update(const std::map<K, V>&)` | put every pair of the other map | O(m) |

No copy method and no iteration (the base class has none). Constructors are inherited (`using HashTable<K, V>::HashTable`), so `HashMap<K, V>(cap)` throws `std::invalid_argument` for `cap == 0`.

## C++-Specific Notes

- The base class is a template, so `this->get(key)` is needed inside the derived methods.
- `getOrDefault` returns by value, so it copies the stored value.
- The Hash Table file is included, so compiling the test pulls it in; do not compile `hash_table.cpp` separately as well.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD hash_map_test.cpp -o hash_map_test && ./hash_map_test
```

## Key Takeaways

- Inheritance is enough to add helpers to a container.
- A pointer return (`get`) makes "absent" unambiguous.
- Helpers do not change the cost: every one is a lookup plus at most one insert.
