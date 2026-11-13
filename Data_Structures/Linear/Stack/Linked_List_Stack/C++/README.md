# Linked List Stack -- C++ Implementation

A LIFO stack of `int` on a singly linked list of heap-allocated nodes. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `linked_list_stack.cpp` | the `LinkedListStack` class with a private `Node` |
| `linked_list_stack_test.cpp` | assert-based tests, built with `-DIS_TEST_BUILD`; counts allocations to check that nodes are freed |

## API

| Member | Description | Time |
| --- | --- | --- |
| `LinkedListStack()` | create an empty stack | O(1) |
| `void push(int value)` | new node becomes the top | O(1) |
| `int pop()` | remove, free and return the top; throws `std::underflow_error` if empty | O(1) |
| `int peek()` | return the top by value; throws `std::underflow_error` if empty | O(1) |
| `bool isEmpty()`, `int size()` | state queries | O(1) |

## C++-Specific Notes

- Nodes are allocated with `new` in `push` and `delete`d in `pop`.
- The destructor pops every remaining node, so a stack that goes out of scope does not leak.
- Copy constructor and copy assignment are deleted: a shallow copy would share nodes and free them twice.
- `Node` is a private nested type, so it cannot collide with another `Node` in the same program.
- The destructor frees nodes in a loop, so a very long stack does not overflow the call stack.

## How to Run

```bash
cd "Data_Structures/Linear/Stack/Linked_List_Stack/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD linked_list_stack_test.cpp -o linked_list_stack_test
./linked_list_stack_test
```

## Key Takeaways

- Every `new` needs a matching `delete`, including nodes still on the stack at destruction.
- A class that owns raw nodes must not be copied naively.
