# 🐍 Python - Dynamic Array-Based Stack (Dynamic Size)

This folder contains a **Python implementation of a dynamic array-based stack** using a Python list that automatically resizes.

---

## ⚙️ Features

- Core operations:
  - `push(value)` → add element to the top
  - `pop()` → remove and return the top element
  - `peek()` → view the top element without removing
  - `is_empty()` → check if stack is empty
  - `size()` → get the number of elements
- Raises `IndexError` when popping or peeking an empty stack
- Dynamic resizing handled by Python lists

---

## 📝 Example Usage

````python
from array_stack import ArrayStack

stack = ArrayStack()
stack.push(10)
stack.push(20)
stack.push(30)

print(stack.peek())    # 30
print(stack.pop())     # 30
print(stack.pop())     # 20
print(stack.is_empty())# False
print(stack.pop())     # 10
print(stack.is_empty())# True

--

## ▶️ Running Tests
```bash
python -m unittest array_stack_test.py
````
