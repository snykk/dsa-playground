# 📈 Dynamic Array-Based Stack

[![Language](https://img.shields.io/badge/Language-Python%20|%20C++%20|%20Go-blue.svg)]()
[![Concept](https://img.shields.io/badge/Concept-Dynamic%20Array-orange.svg)]()

> A **dynamic array-based stack** automatically resizes when the stack is full, maintaining the **LIFO principle**.

---

## ⚙️ Key Features

- Can **grow automatically** when capacity is reached.
- Maintains **O(1) amortized time** for `push`.
- Ideal when **maximum size is unknown** in advance.

---

## 📂 Folder Structure

```
Dynamic Size/
├── Python/
│ ├── array_stack.py
│ └── array_stack_test.py
├── C++/
│ ├── array_stack.cpp
│ └── array_stack_test.cpp
└── Go/
  ├── main.go
  └── main_test.go
```

- Each language folder contains:
  - Implementation of **dynamic array stack**
  - **Unit tests** demonstrating push/pop/peek/isEmpty/size
  - Language-specific README.md (examples)

---

## 🔧 Usage Tips

- Visualize **LIFO principle** during push/pop.
- For dynamic arrays:
  - Understand **resizing** (usually doubling capacity).
  - Know that resizing is **amortized O(1)** but worst-case O(n) for a single push.
- Compare with static arrays to see **memory vs flexibility trade-off**.
