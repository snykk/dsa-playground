# ⚡ Linked List-Based Stack (C++)

This folder contains the **C++ implementation** of a stack using a **singly linked list**.

---

## 📌 Files

- `linked_list_stack.cpp` → Implementation
- `linked_list_stack_test.cpp` → Test file using `assert`

---

## ⚡ Example Usage

```cpp
#include "linked_list_stack.cpp"
#include <iostream>
using namespace std;

int main() {
    LinkedListStack s;
    s.push(10);
    s.push(20);
    cout << s.peek() << endl; // 20
    cout << s.pop() << endl;  // 20
    cout << s.size() << endl; // 1
}
```

---

## 🧪 Run Tests

```bash
g++ linked_list_stack_test.cpp -o test && ./test
```

---

## ⏱️ Complexity

| Operation | Time Complexity |
| --------- | --------------- |
| Push      | O(1)            |
| Pop       | O(1)            |
| Peek      | O(1)            |
| isEmpty   | O(1)            |
| Size      | O(1)            |
