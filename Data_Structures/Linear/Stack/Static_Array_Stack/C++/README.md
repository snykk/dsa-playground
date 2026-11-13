# Static Size Array Stack -- C++ Implementation

A LIFO stack of `int` over a raw `new int[capacity]` array. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `array_stack.cpp` | the `ArrayStack` class |
| `array_stack_test.cpp` | assert-based tests, built with `-DIS_TEST_BUILD` |

## API

| Member | Description | Time |
| --- | --- | --- |
| `explicit ArrayStack(int size = 100)` | create a stack; throws `std::invalid_argument` if `size < 1` | O(capacity) |
| `void push(int value)` | add on top; throws `std::overflow_error` when full | O(1) |
| `int pop()` | remove and return the top; throws `std::underflow_error` if empty | O(1) |
| `int peek()` | return the top by value; throws `std::underflow_error` if empty | O(1) |
| `bool isEmpty()`, `int size()` | state queries | O(1) |

## C++-Specific Notes

- The class allocates with `new int[capacity]` (dynamic memory, once) and frees it in the destructor.
- Copy constructor and copy assignment are deleted: a copy would share the array and free it twice.
- The method is `isEmpty()` here and in the Linked List stack, while the Dynamic Size stack uses `is_empty()`.
- `<stdexcept>` is included for the exceptions.

## How to Run

```bash
cd "Data_Structures/Linear/Stack/Static_Array_Stack/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD array_stack_test.cpp -o array_stack_test
./array_stack_test
```

## Key Takeaways

- A class that owns a raw array needs a destructor and a copy policy.
- Reject a capacity below 1 in the constructor.
