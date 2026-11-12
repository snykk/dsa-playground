# Hash Table -- C++ Implementation

A template chaining hash table with a doubling resize. See the [topic README](../README.md).

## Files

- `hash_table.cpp`: `HashTable<K, V>` (included directly by the test).
- `hash_table_test.cpp`: assert-based tests, including a chain longer than one, pointer stability across resizes and invalid capacity.

## API

| Member | Description | Time |
|--------|-------------|------|
| `HashTable(size_t cap = 16)` | throws `std::invalid_argument` if `cap` is 0 | O(cap) |
| `void put(key, value)` | insert or update; resize at load > 0.75 | O(1) amortized |
| `V* get(key)` | pointer to the value or `nullptr` | O(1) average |
| `bool remove(key)` | true if removed | O(1) average |
| `bool contains(key)` | presence | O(1) average |
| `getSize()`, `isEmpty()`, `clear()` | bookkeeping | O(1) |

No iteration. Keys use `std::hash<K>` and `==`.

## C++-Specific Notes

- Buckets are `std::vector<std::list<KeyValue>>`. A resize moves each list node into its new bucket with `splice`, so a `V*` from `get` stays valid across resizes, like `std::unordered_map`. It is invalidated only when the entry is removed or the table is destroyed.
- `HashTable<std::string, std::string>` uses a specialized 31-based `hash`; other types, such as `<std::string, int>`, use `std::hash`. The specialization is `inline`, so the file can be included from several translation units.
- Compile the test directly (it includes the `.cpp`); do not also compile `hash_table.cpp` separately.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD hash_table_test.cpp -o hash_table_test && ./hash_table_test
```

## Key Takeaways

- Splicing nodes is cheaper than copying and keeps pointers valid.
- Validate the capacity before taking `% capacity`.
- `get` returning a pointer makes "absent" explicit.
