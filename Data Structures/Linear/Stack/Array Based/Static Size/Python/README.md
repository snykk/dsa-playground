# 🐍 Python - Static Array-Based Stack (Fixed Size)

This folder contains a **Python implementation of a static (fixed-size) array-based stack** using a preallocated list.

---

## ⚙️ Features

- Core operations:
  - `push(value)` → add element to top (raises `OverflowError` if full)
  - `pop()` → remove and return top element (raises `IndexError` if empty)
  - `peek()` → view top element (raises `IndexError` if empty)
  - `is_empty()` → check if stack is empty
  - `size()` → get current number of elements
- Fixed capacity defined at initialization
- Prevents adding elements beyond capacity

---

## 📝 Example Usage

```python
from array_stack import ArrayStack

stack = ArrayStack(3)  # max size 3
stack.push(10)
stack.push(20)
stack.push(30)

print(stack.peek())    # 30
print(stack.pop())     # 30
print(stack.pop())     # 20
print(stack.is_empty())# False
print(stack.pop())     # 10
print(stack.is_empty())# True

# stack.push(40)  # Would raise OverflowError if stack is full
```

## ▶️ Running Tests

```bash
python -m unittest array_stack_test.py
```
