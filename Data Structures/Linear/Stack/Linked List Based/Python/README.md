# 🐍 Linked List-Based Stack (Python)

This folder contains the **Python implementation** of a stack using a **singly linked list**.

---

## 📌 Files

- `linked_list_stack.py` → Implementation of stack using linked list
- `linked_list_stack_test.py` → Unit tests using `unittest`

---

## ⚡ Example Usage

```python
from linked_list_stack import LinkedListStack

s = LinkedListStack()
s.push(10)
s.push(20)
print(s.peek())   # 20
print(s.pop())    # 20
print(s.is_empty())  # False
```

---

## 🧪 Run Tests

```bash
python3 -m unittest linked_list_stack_test.py
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
