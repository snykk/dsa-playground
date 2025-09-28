# 🗄️ Stack Data Structure

[![Language](https://img.shields.io/badge/Language-Python%20|%20C++%20|%20Go-blue.svg)]()
[![Concept](https://img.shields.io/badge/Concept-Linear%20DS-orange.svg)]()

> A **Stack** is a **linear data structure** that follows the **LIFO (Last In, First Out)** principle.  
> The last element added is the first one to be removed. Think of it like a stack of plates: you can only take the top plate off first.

Stacks are **fundamental** in computer science and widely used in **real-world applications**.

---

## 🎯 Why Study Stacks?

Stacks are crucial because they:

- Form the basis of **function call stacks** in programming languages.
- Allow **efficient backtracking**, such as in maze solving, puzzle solving, or undo/redo features.
- Facilitate **expression evaluation** and parsing, e.g., converting infix expressions to postfix.
- Serve as building blocks for **more advanced data structures** like stacks of queues, stacks in graphs, or DFS traversal.

---

## ⚙️ Core Operations

| Operation   | Description                          | Time Complexity |
| ----------- | ------------------------------------ | --------------- |
| `push(x)`   | Insert element at the top            | O(1)            |
| `pop()`     | Remove element from the top          | O(1)            |
| `peek()`    | Get the top element without removing | O(1)            |
| `isEmpty()` | Check if stack is empty              | O(1)            |
| `size()`    | Return the number of elements        | O(1)            |

> 💡 Tip: For array-based stacks, maintain a counter for `size()`. For linked-list-based stacks, maintain a `count` variable for O(1) size retrieval.

---

## 🧱 Implementation Approaches

### 1️⃣ Array-Based Stack

- Uses a **contiguous block of memory**.
- Can be:
  - **Static Size**: fixed capacity
  - **Dynamic Size**: resizable array that grows automatically
- **Pros**: Simple, excellent cache performance
- **Cons**: Static arrays may waste memory; dynamic arrays occasionally need resizing.

### 2️⃣ Linked List-Based Stack

- Uses **nodes** where each node points to the next.
- Dynamic size by nature.
- **Pros**: Exact memory usage, constant-time push/pop
- **Cons**: Extra memory per node, slightly worse cache performance.

---

## 💡 Learning Tips

- Visualize the **LIFO principle**; it helps in debugging and reasoning.
- Compare **array-based vs linked list-based stacks**:
  - Arrays → fast access, may require resizing
  - Linked lists → memory-efficient, no resizing, pointer overhead
- Practice implementing both types in **Python, C++, and Go**.
- Understand real-world applications: expression evaluation, DFS, undo/redo operations.

---

## 📂 Folder Structure

```
Stack/
├── Array Based/
│ ├── Static Size/
│ │ ├── Python/
│ │ ├── C++/
│ │ └── Go/
│ └── Dynamic Size/
│   ├── Python/
│   ├── C++/
│   └── Go/
└── Linked List Based/
    ├── Python/
    ├── C++/
    └── Go/
```

- Each language folder contains:
  - Implementation file
  - Unit tests
  - README.md with usage examples

---

## 🔧 Applications

- Expression evaluation: **infix → postfix**, **prefix evaluation**
- Undo-redo operations in editors
- Backtracking algorithms (e.g., N-Queens, Maze solving)
- Depth-First Search (DFS) in graphs
- Function call management in recursion

---

## 🧠 Key Insights

- Stack is **simple yet powerful**; often hidden behind complex algorithms.
- Choose **array-based** or **linked-list-based** depending on:
  - Memory efficiency
  - Dynamic growth needs
  - Operation speed requirements
- Always maintain `size()` for efficient length checks.

---

## 📖 References & Further Reading

- [Visualgo - Stack Visualization](https://visualgo.net/en/stack)
- [Stack on GeeksforGeeks](https://www.geeksforgeeks.org/stack-data-structure/)
- "Introduction to Algorithms" – Cormen et al.
- "Data Structures and Algorithms in Python" – Goodrich et al.

---

**Pro Tip:**  
Before memorizing stack implementations, **try to implement your own from scratch in all three languages**. This builds a strong foundation and prepares you for interviews and real-world problem-solving.

---

**Happy Stacking! 🚀**
