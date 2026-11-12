# Dynamic Size Array Stack -- C++ Implementation

A LIFO stack of `int` backed by `std::vector<int>`. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `array_stack.cpp` | the `ArrayStack` class |
| `array_stack_test.cpp` | assert-based tests, built with `-DIS_TEST_BUILD` |

## API

| Member | Description | Time |
| --- | --- | --- |
| `void push(int value)` | `push_back` | O(1) amortized |
| `int pop()` | remove and return the top; throws `std::out_of_range` if empty | O(1) |
| `int peek()` | return the top by value; throws `std::out_of_range` if empty | O(1) |
| `bool is_empty()`, `int size()` | length checks | O(1) |

## C++-Specific Notes

- The vector manages its own memory, so the class is safe to copy and destroy.
- A `vector` reallocation invalidates references and iterators, which is why `peek()` returns a value.
- `std::stack<int>` from `<stack>` is the standard adapter with the same behaviour.
- Note the sibling topics: the Static Size and Linked List stacks name the method `isEmpty()`, while this class uses `is_empty()`.

## How to Run

```bash
cd "Data Structures/Linear/Stack/Array Based/Dynamic Size/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD array_stack_test.cpp -o array_stack_test
./array_stack_test
```

## Key Takeaways

- `std::vector` already provides amortized O(1) `push_back`.
- Check emptiness before `pop()` or `peek()`, or catch `std::out_of_range`.
