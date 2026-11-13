# Collision Handling -- C++ Implementation

Chaining and linear probing as class templates. See the [topic README](../README.md).

## Files

- `collision_handling.cpp`: `HashTableChaining<K, V>` and `HashTableOpenAddressing<K, V>` (included directly by the test).
- `collision_handling_test.cpp`: assert-based tests, including forced collisions, a full table, wrap-around, deep copy and invalid capacity.

## API

| Member | Description |
|--------|-------------|
| `HashTableChaining(size_t cap = 16)` | throws `std::invalid_argument` if `cap` is 0 |
| `put(key, value)`, `V* get(key)` | insert or update; pointer or `nullptr` |
| `size_t longestChain() const` | longest bucket (chaining only) |
| `HashTableOpenAddressing(size_t cap = 16)` | linear probing; throws `std::invalid_argument` if `cap` is 0 |
| `put(key, value)` | throws `std::runtime_error` for a new key in a full table |
| `V* get(key)` | pointer to the value or `nullptr`; probes at most `cap` slots |

There is no `remove`, no `size()`, no quadratic probing and no resizing.

## C++-Specific Notes

- Slots are `std::optional<std::pair<K, V>>` held by value. An earlier version used `new`-ed pairs that were never freed and were shared by copies; now the table owns nothing by hand and copies are deep.
- Keys hash with `std::hash<K>`. For `int` this is the identity on common standard libraries, which is what the collision tests rely on.
- A pointer returned by `get` stays valid until that key's table is destroyed (there is no resize).
- Needs `<optional>`, so compile with C++17.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD collision_handling_test.cpp -o collision_handling_test && ./collision_handling_test
```

## Key Takeaways

- Bound every probe loop by the capacity.
- Hold slots by value and the destructor problem disappears.
- Without a remove there are no tombstones to manage.
