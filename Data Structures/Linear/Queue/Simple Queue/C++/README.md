# Simple Queue -- C++ Implementation

A FIFO queue of `int` backed by `std::vector<int>`. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `simple_queue.cpp` | the `SimpleQueue` class |
| `simple_queue_test.cpp` | assert-based tests, built with `-DIS_TEST_BUILD` |

## API

| Member | Description | Time |
| --- | --- | --- |
| `void enqueue(int x)` | `push_back` | O(1) amortized |
| `int dequeue()` | `erase(begin())`; throws `std::runtime_error` if empty | O(n) |
| `int peek() const` | return the front item by value; throws `std::runtime_error` if empty | O(1) |
| `bool is_empty() const`, `int size() const` | length checks | O(1) |

## C++-Specific Notes

- `peek()` returns `int` by value, not a reference.
- `erase(begin())` moves every remaining element. `std::queue` (over `std::deque`) has an O(1) `pop()`.
- The class owns only a `std::vector`, so it is safe to copy and destroy.

## How to Run

```bash
cd "Data Structures/Linear/Queue/Simple Queue/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD simple_queue_test.cpp -o simple_queue_test
./simple_queue_test
```

## Key Takeaways

- Erasing at the front of a vector is linear.
- Mark read-only accessors `const`.
