# 🧩 Linked List-Based Stack

[![Language](https://img.shields.io/badge/Language-Python%20|%20C++%20|%20Go-blue.svg)]()
[![Concept](https://img.shields.io/badge/Concept-Linked%20List-orange.svg)]()

> A **linked list-based stack** uses nodes connected via pointers to maintain the **LIFO (Last In, First Out)** order.  
> Unlike array-based stacks, it **grows dynamically** without a predefined size.

---

## ⚙️ Key Features

- Dynamic size: no fixed capacity.
- Push and pop operations are **O(1)**.
- Memory is allocated per node, slightly higher overhead than arrays.
- Excellent for **unknown maximum stack size** or frequent resizing.

---

## 📝 Core Operations

| Operation   | Description                          | Time Complexity |
| ----------- | ------------------------------------ | --------------- |
| `push(x)`   | Insert element at the top            | O(1)            |
| `pop()`     | Remove element from the top          | O(1)            |
| `peek()`    | Get the top element without removing | O(1)            |
| `isEmpty()` | Check if stack is empty              | O(1)            |
| `size()`    | Return number of elements            | O(n) or O(1)\*  |

\*Size can be O(1) if a counter is maintained during push/pop.

---

## 📂 Folder Structure

```
Linked List Based/
├── Python/
│ ├── linked_list_stack.py
│ └── linked_list_stack_test.py
├── C++/
│ ├── linked_list_stack.cpp
│ └── linked_list_stack_test.cpp
└── Go/
  ├── main.go
  └── main_test.go
```

- Each language folder contains:
  - **Linked list stack implementation**
  - **Unit tests** demonstrating push/pop/peek/isEmpty/size
  - Language-specific README.md with examples

---

## 🔧 Usage Tips

- Visualize **nodes and pointers** to understand push/pop operations.
- Compare with array-based stacks:
  - Linked list → dynamic, no resizing, extra memory for pointers
  - Array → fast access, cache-friendly, may require resizing
- Practice implementing both types to understand trade-offs in **performance and memory**.

---

## 📖 References

- [GeeksforGeeks - Stack using Linked List](https://www.geeksforgeeks.org/stack-data-structure-using-linked-list/)
- [Visualgo - Linked List Stack Visualization](https://visualgo.net/en/list)
