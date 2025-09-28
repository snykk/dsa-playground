# ⚡ C++ - Static Array-Based Stack (Fixed Size)

This folder contains a **C++ implementation of a static array-based stack** using a fixed-size array.

---

## ⚙️ Features

- Core operations:
  - `push(int value)` → add element to top (throws `overflow_error` if full)
  - `pop()` → remove and return top element (throws `underflow_error` if empty)
  - `peek()` → view top element (throws `underflow_error` if empty)
  - `is_empty()` → check if stack is empty
  - `size()` → current number of elements
- Fixed capacity defined at compile or initialization
- Simple, efficient, no dynamic memory allocation

---

## 📝 Example Usage

```cpp
#include "array_stack.cpp"
#include <iostream>

int main() {
    ArrayStack stack(3); // max size 3
    stack.push(10);
    stack.push(20);
    stack.push(30);

    std::cout << stack.peek() << std::endl; // 30
    std::cout << stack.pop() << std::endl;  // 30
    std::cout << stack.pop() << std::endl;  // 20
    std::cout << stack.is_empty() << std::endl; // 0 (false)
    std::cout << stack.pop() << std::endl;  // 10
    std::cout << stack.is_empty() << std::endl; // 1 (true)

    // stack.push(40); // Would throw overflow_error if full
}
```

---

## ▶️ Running Tests

```bash
g++ array_stack_test.cpp -o test && ./test

```
