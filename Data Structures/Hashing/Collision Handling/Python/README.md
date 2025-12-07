# Collision Handling (Python)

Demonstrates two main collision handling techniques in hash tables.

---

## 1. Chaining

Each bucket contains a list of key-value pairs. Collisions are handled by storing multiple pairs in the same bucket.

**Advantages:**
- Simple to implement
- No clustering issues
- Can store more elements than capacity

**Disadvantages:**
- Extra memory for pointers
- Cache performance may be worse

---

## 2. Open Addressing

Finds next available slot using probing when collision occurs.

### Linear Probing
- Next slot: `(hash + 1) % capacity`
- Simple but can cause clustering

### Quadratic Probing
- Next slot: `(hash + i²) % capacity`
- Reduces clustering compared to linear

**Advantages:**
- Better cache performance
- No extra memory for pointers

**Disadvantages:**
- Clustering can occur
- Load factor must be kept low

---

## Related Data Structures

- **Hash Table**: Basic hash table implementation
- **Hash Map**: Extended hash table

