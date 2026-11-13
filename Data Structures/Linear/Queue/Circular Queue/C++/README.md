# Circular Queue -- C++ Implementation

A bounded FIFO queue over a heap-allocated `int` array, using a `front = -1` sentinel for the empty state. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `circular_queue.cpp` | the `CircularQueue` class |
| `circular_queue_test.cpp` | assert-based tests, built with `-DIS_TEST_BUILD` |

## API

| Member | Description |
| --- | --- |
| `explicit CircularQueue(int size)` | create a queue; throws `std::invalid_argument` if `size < 1` |
| `void enqueue(int x)` | add at the rear; throws `std::overflow_error` when full |
| `int dequeue()` | remove and return the front item; throws `std::runtime_error` when empty |
| `int peek()` | return the front item by value; throws `std::runtime_error` when empty |
| `bool is_empty()`, `bool is_full()`, `int size()` | state queries |

All operations are O(1).

## C++-Specific Notes

- The class owns a raw `new int[capacity]` array that the destructor frees. Because a copy would share the array and free it twice, the copy constructor and copy assignment are deleted.
- The data members are initialised in declaration order to avoid a `-Wreorder` warning.
- `peek()` returns a copy of the front item, not a reference.
- `std::vector<int>` would remove the manual memory management.

## How to Run

```bash
cd "Data Structures/Linear/Queue/Circular Queue/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD circular_queue_test.cpp -o circular_queue_test
./circular_queue_test
```

## Key Takeaways

- A class that owns raw memory needs a destructor and a decision about copying.
- Reject a capacity below 1 before any modulo is computed.
- Distinguish empty from full explicitly: here with `front == -1`.
