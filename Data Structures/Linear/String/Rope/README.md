# Rope Data Structure

A **Rope** is a balanced binary tree used to efficiently store and manipulate long strings. Instead of storing the entire string in a single contiguous array, a rope splits the string into smaller fragments stored at the **leaf nodes** of the tree.

Each **internal node** holds a `weight` value representing the total length of the string in its **left subtree**. This weight enables efficient navigation to any character position using a binary search-like traversal.

---

## How It Works

```
         [11]              <- weight = length of left subtree
        /    \
     [6]      [5]
    /   \    /   \
  "Hello_" "wo"  "rld!!"
```

- Leaves store string fragments: `"Hello "`, `"wo"`, `"rld!!"`
- Internal node weights guide index lookups
- To find character at index `i`, compare with node weight and go left or right

---

## Operations

| Operation         | Time Complexity | Description                              |
| ----------------- | --------------- | ---------------------------------------- |
| Index (char at i) | O(log n)        | Traverse tree using weights              |
| Concat            | O(log n)        | Create new root joining two ropes        |
| Split             | O(log n)        | Divide rope at position i into two ropes |
| Insert            | O(log n)        | Split at i, concat with new text         |
| Delete            | O(log n)        | Split twice, discard middle              |
| To String         | O(n)            | In-order traversal collecting leaves     |
| Length             | O(1)*           | Cached or computed from root weight      |

> *Amortized O(1) when length is cached at the root.

---

## Use Cases

- **Text editors** (e.g., VS Code, Vim): Efficient insert/delete in the middle of large documents
- **Version control diffs**: Manipulating large text buffers
- **Collaborative editing**: Merging edits from multiple users
- **Undo/redo systems**: Tree structure enables cheap snapshots via structural sharing

---

## Advantages Over Plain Strings

| Operation        | Plain String (Array) | Rope           |
| ---------------- | -------------------- | -------------- |
| Insert at middle | O(n)                 | O(log n)       |
| Delete at middle | O(n)                 | O(log n)       |
| Concatenation    | O(n)                 | O(log n)       |
| Index access     | O(1)                 | O(log n)       |
| Memory on edit   | Copy entire string   | Share subtrees |

Ropes trade O(1) index access for dramatically faster insertions and deletions, making them ideal for applications that frequently modify large strings.

---

## Implementations

- **Python** - Clean class-based implementation
- **C++** - Smart pointer (shared_ptr) based implementation
- **Go** - Struct with exported methods
