# 📊 Static Array-Based Stack

[![Language](https://img.shields.io/badge/Language-Python%20|%20C++%20|%20Go-blue.svg)]()
[![Concept](https://img.shields.io/badge/Concept-Static%20Array-orange.svg)]()

> A **static array-based stack** uses a fixed-size array to store elements.  
> The size is determined at creation and does **not resize dynamically**.

---

## ⚙️ Key Features

- Simple **fixed-size stack** implementation.
- Push operation fails if the stack is **full**.
- Best when **maximum stack size is known** in advance.
- Excellent **cache performance** due to contiguous memory.

---

## 📂 Folder Structure

```
Static Size/
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
  - Implementation of **static array stack**
  - **Unit tests** demonstrating push/pop/peek/isEmpty/size
  - Language-specific README.md (examples)

---

## 🔧 Usage Tips

- Always **check for overflow** before push.
- Use when **stack size is predictable** to save memory.
- Compare with dynamic stacks:
  - Static → fixed memory, simpler, no resizing overhead
  - Dynamic → flexible, slightly more complex, occasional resizing
