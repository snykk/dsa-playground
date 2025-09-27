# 🔗 Linked List

A **Linked List** is a fundamental **linear data structure** consisting of nodes, where each node contains **data** and a **pointer/reference** to the next node (or previous node, depending on the type). Linked Lists are dynamic in size, allowing **efficient insertion and deletion** compared to arrays.

This folder contains implementations of the three main types of Linked Lists:

1. **Singly Linked List (SLL)**  
   Each node points only to the next node.  
   → Ideal for simple structures with one-way traversal.

2. **Doubly Linked List (DLL)**  
   Each node points to both the next and previous nodes.  
   → Facilitates two-way traversal and faster deletion of nodes.

3. **Circular Linked List (CLL)**  
   The last node points back to the first node.  
   → Useful for systems requiring continuous cycles, such as round-robin scheduling.

---

## 💡 Key Learning Points

- **Node**: The basic building block of a Linked List.
- **Head/Tail**: Pointers to manage traversal.
- **Insertion**:
  - At the head
  - At the tail
  - After a specific node
- **Deletion**:
  - Specific node
  - Head or tail
- **Traversal**:
  - SLL: one-way
  - DLL: two-way
  - CLL: potentially infinite loop (cycle)
- **Complexity**:

| Operation       | Singly | Doubly | Circular |
| --------------- | ------ | ------ | -------- |
| Access by index | O(n)   | O(n)   | O(n)     |
| Search          | O(n)   | O(n)   | O(n)     |
| Insert at head  | O(1)   | O(1)   | O(1)     |
| Insert at tail  | O(n)   | O(1)   | O(1)     |
| Delete head     | O(1)   | O(1)   | O(1)     |
| Delete tail     | O(n)   | O(1)   | O(n)     |

---

## 📝 Tips & Best Practices

- Always **update pointers** carefully when adding or removing nodes to avoid losing parts of the list.
- For **unit testing**, verify that traversals return the expected sequence.
- Use **Circular Linked List** for cyclic systems or continuous iteration.
- Use **Doubly Linked List** if two-way traversal or frequent deletion is required.
- Singly Linked List suffices for simple one-way traversal needs.

---

## 📚 References

- [GeeksforGeeks - Linked List](https://www.geeksforgeeks.org/data-structures/linked-list/)
- [Visualgo - Linked List Visualization](https://visualgo.net/en/list)

---

## 🚀 Next Steps

- Explore each linked list type in its subfolder.
- Implement from scratch to reinforce understanding.
- Use the provided unit tests to validate your implementations.
