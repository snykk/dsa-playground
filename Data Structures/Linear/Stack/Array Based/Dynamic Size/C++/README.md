# ⚡ C++ - Dynamic Array-Based Stack (Dynamic Size)

This folder contains a **C++ implementation of a dynamic array-based stack** using `std::vector`.

---

## ⚙️ Features

- Core operations:
  - `push(int value)` → add element to top
  - `pop()` → remove and return top element (throws `out_of_range` if empty)
  - `peek()` → view top element (throws `out_of_range` if empty)
  - `is_empty()` → check if stack is empty
  - `size()` → current number of elements
- Dynamic resizing handled automatically by `std::vector`
- Efficient amortized O(1) push/pop

---

## 📝 Example Usage

```cpp
#include "array_stack.cpp"
#include <iostream>

int main() {
    ArrayStack stack;
    stack.push(10);
    stack.push(20);
    stack.push(30);

    std::cout << stack.peek() << std::endl; // 30
    std::cout << stack.pop() << std::endl;  // 30
    std::cout << stack.pop() << std::endl;  // 20
    std::cout << stack.is_empty() << std::endl; // 0 (false)
    std::cout << stack.pop() << std::endl;  // 10
    std::cout << stack.is_empty() << std::endl; // 1 (true)
}
```

---

## ▶️ Running Tests

```bash
g++ array_stack_test.cpp -o test && ./test
```
