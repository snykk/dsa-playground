# Collision Handling

Demonstrates two main collision handling techniques in hash tables:
1. **Chaining** - Store colliding elements in a linked list
2. **Open Addressing** - Find next available slot using probing

---

## Chaining

Each bucket contains a list of key-value pairs. When multiple keys hash to the same bucket, they are stored in a list.

**Advantages:**
- Simple to implement
- No clustering issues
- Can store more elements than capacity

**Disadvantages:**
- Extra memory for pointers
- Cache performance may be worse

---

## Open Addressing

When a collision occurs, find the next available slot using a probing sequence.

### Linear Probing
- Next slot: `(hash + 1) % capacity`
- Simple but can cause primary clustering

### Quadratic Probing
- Next slot: `(hash + i²) % capacity`
- Reduces clustering compared to linear probing

### Double Hashing
- Uses a second hash function for probing
- Best for avoiding clustering

**Advantages:**
- Better cache performance
- No extra memory for pointers

**Disadvantages:**
- Clustering can occur
- Load factor must be kept low (< 0.7)

---

## Comparison

| Feature | Chaining | Open Addressing |
|---------|----------|----------------|
| Memory | Higher (pointers) | Lower |
| Cache Performance | Worse | Better |
| Clustering | None | Possible |
| Load Factor | Can exceed 1.0 | Must be < 1.0 |
| Implementation | Simpler | More complex |

---

## Implementations

- **Python** (`Python/`) - Chaining, Linear Probing, Quadratic Probing
- **C++** (`C++/`) - Template-based implementations
- **Go** (`Go/`) - Clean implementations

