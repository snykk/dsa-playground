# Deque -- C++ Implementation

A `std::vector<int>`-backed double-ended queue. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `deque.cpp` | the `Deque` class |
| `deque_test.cpp` | assert-based tests, built with `-DIS_TEST_BUILD` |

## API

| Member | Description | Time |
| --- | --- | --- |
| `void push_front(int)` | insert at the beginning | O(n) |
| `void push_back(int)` | append | O(1) amortized |
| `int pop_front()` | remove the first item; throws `std::runtime_error` if empty | O(n) |
| `int pop_back()` | remove the last item; throws `std::runtime_error` if empty | O(1) |
| `int peek_front()`, `int peek_back()` | read an end; throw if empty | O(1) |
| `bool is_empty()`, `int size()` | length checks | O(1) |

## C++-Specific Notes

- The class has a member named `deque` and the standard `std::deque` is not used, so the front operations are real vector shifts.
- `std::deque<int>` from `<deque>` is the O(1)-at-both-ends standard container.
- The class owns only a `std::vector`, so copying and destruction are safe.

## How to Run

```bash
cd "Data_Structures/Linear/Queue/Deque/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD deque_test.cpp -o deque_test
./deque_test
```

## Key Takeaways

- `vector::insert(begin())` and `erase(begin())` move every item.
- Prefer `std::deque` when you need both ends.
