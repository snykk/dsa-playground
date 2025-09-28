# 🗂️ Array-Based Stack

[![Language](https://img.shields.io/badge/Language-Python%20|%20C++%20|%20Go-blue.svg)]()
[![Concept](https://img.shields.io/badge/Concept-Stack-orange.svg)]()

> This folder contains **Array-Based Stack** implementations in **Python, C++, and Go**.  
> Array-based stacks store elements in a **contiguous block of memory** and support both **static** and **dynamic sizing**.

---

## 🎯 Why Array-Based Stacks?

Array-based stacks are commonly used because:

- Memory layout is **contiguous**, allowing for **fast access**.
- Simpler to implement than linked-list stacks.
- Dynamic array versions can **resize automatically** while still maintaining LIFO behavior.
- Useful in **expression evaluation**, **DFS**, and **undo-redo operations**.

---

## ⚙️ Core Operations

| Operation   | Description                          | Time Complexity |
| ----------- | ------------------------------------ | --------------- |
| `push(x)`   | Add an element to the top            | O(1) amortized  |
| `pop()`     | Remove the top element               | O(1)            |
| `peek()`    | Get the top element without removing | O(1)            |
| `isEmpty()` | Check if stack is empty              | O(1)            |
| `size()`    | Return the number of elements        | O(1)            |

> 💡 For dynamic arrays, `push` may trigger resizing, which is **amortized O(1)**.

---

## 🧱 Subfolder Structure

```
Array Based/
├── Static Size/
│ ├── Python/
│ ├── C++/
│ └── Go/
└── Dynamic Size/
  ├── Python/
  ├── C++/
  └── Go/
```

- **Static Size**: fixed capacity stacks.
- **Dynamic Size**: resizable stacks that grow automatically when full.

---

## 💡 Learning Tips

- Compare **static vs dynamic array stacks**:
  - Static → simple, fixed memory, no resizing overhead
  - Dynamic → flexible, may resize occasionally
- Practice implementing both types to understand **resizing logic**.
- Visualize the **LIFO principle** in your mind while pushing and popping.
- Combine with **real-world applications**: undo-redo, expression parsing, DFS.

---

## 🔧 Applications

- Parsing expressions (infix → postfix, prefix evaluation)
- Undo/redo feature in editors
- Backtracking problems (mazes, N-Queens)
- DFS traversal of graphs

---

## 📖 References & Further Reading

- [Visualgo - Array Stack](https://visualgo.net/en/stack)
- [GeeksforGeeks - Array Stack](https://www.geeksforgeeks.org/stack-data-structure/)
- "Data Structures and Algorithms in Python" – Goodrich et al.
- "Introduction to Algorithms" – Cormen et al.

---

**Pro Tip:**  
Always try to **implement both static and dynamic array stacks** in **Python, C++, and Go** to strengthen your understanding of memory layout, resizing, and LIFO operations.
