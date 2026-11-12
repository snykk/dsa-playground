# Collision Handling

Two keys can hash to the same slot, so every hash table needs a collision rule. Separate chaining keeps a list per slot; open addressing walks a probe sequence to another free slot. Both give O(1) average operations while the load is moderate, and O(n) in the worst case.

## Intuition

Hashing maps a huge key space onto a few slots, so collisions are certain (pigeonhole principle). Chaining says "everyone who lands here shares a small list". Open addressing says "if your seat is taken, follow a fixed rule to the next seat": the same rule is used to look the key up later, so a lookup can stop at the first empty seat.

Invariant (open addressing): a key is stored on its own probe sequence, and every slot before it on that sequence is or was occupied.

## Visual

```text
capacity 8, keys 3, 11, 19, 6, 14   (home slot = key mod 8)

Chaining:
  slot 3: [3] -> [11] -> [19]
  slot 6: [6] -> [14]

Linear probing:      slot: 0 1 2 3  4  5  6 7
                           . . . 3 11 19  6 14

Quadratic probing:   slot: 0  1 2 3  4 5  6 7
(triangular steps)         . 14 . 3 11 . 19 6
```

## Operations

| Operation | Chaining | Open addressing |
|-----------|----------|-----------------|
| `put` | walk the chain; update or append | walk the probe sequence; update if found, else use the first free slot |
| `get` | walk the chain | walk until the key or an empty slot |
| `remove` | unlink from the chain | leave a tombstone |
| table full | never full | a new key fails (exception or panic) |

What exists per language:

| | Python | C++ | Go |
|--|--------|-----|----|
| Chaining | put, get, remove, size | put, get | Put, Get |
| Linear probing | put, get, remove, size | put, get | Put, Get |
| Quadratic probing | put, get, remove, size | not implemented | not implemented |

Only Python can remove. No version resizes, so the capacity is fixed. Capacity must be positive: Python raises `ValueError`, C++ throws `std::invalid_argument`, and Go uses 16.

Probe rules:

- Linear: slot `(hash + i) mod capacity`, i = 0, 1, 2, ...
- Quadratic (Python): slot `(hash + i(i+1)/2) mod capacity` (triangular numbers). Plain `i*i` steps reach only 4 distinct slots of 16, so the code would report "full" with 12 slots empty. Triangular steps reach every slot of a power-of-two table.
- Double hashing (step from a second hash) is not implemented.

Delete uses a tombstone: emptying the slot would cut the probe sequence of keys stored after it. On insert, walk the whole sequence first and remember the first tombstone; use it only if the key is not found, otherwise you store a duplicate.

## Step-by-Step Trace

Linear probing, capacity 8 (`x` = tombstone):

| Step | Table | Note |
|------|-------|------|
| `put(3)`, `put(11)`, `put(19)` | `. . . 3 11 19 . .` | all home slot 3, so 11 and 19 slide right |
| `put(6)`, `put(14)` | `. . . 3 11 19 6 14` | 14 has home 6, slides to 7 |
| `remove(11)` | `. . . 3 x 19 6 14` | slot 4 becomes a tombstone |
| `get(19)` | found at slot 5 | the probe walks past the tombstone |
| `put(27)` | `. . . 3 27 19 6 14` | home 3, reuses the tombstone; size is 5 |

## Complexity

| Scheme | Hit | Miss or insert |
|--------|-----|----------------|
| Chaining (load a = n / buckets) | O(1 + a/2) | O(1 + a) |
| Linear probing | about (1 + 1/(1-a)) / 2 probes | about (1 + 1/(1-a)^2) / 2 probes |
| Worst case, any scheme | O(n) | O(n) |

Linear probing needs a < 1 and degrades fast near 1, so real tables stay below roughly 0.5 to 0.7 by resizing. These tables do not resize, so their cost grows with n / capacity. Space is O(capacity + n) for chaining and O(capacity) for open addressing.

## When to Use

- Chaining: simple, tolerates any load, easy delete.
- Open addressing: compact and cache-friendly when you can keep the table at most about half full.
- Neither is a fix for a bad hash function; clustering and long chains both follow from it.

## Chaining vs. Open Addressing

| | Chaining | Open addressing |
|--|----------|-----------------|
| Load above 1 | works | impossible |
| Delete | easy | needs tombstones |
| Memory | node and pointer per key | one array |
| Cache | pointer chasing | contiguous probes |

## Common Pitfalls

- Emptying a slot on delete in open addressing (use a tombstone).
- Inserting at the first free slot without checking the rest of the sequence (duplicates).
- Unbounded probe loops: on a full table a missing key never meets an empty slot. The C++ and Go code now stop after `capacity` probes.
- `i*i` probing on a power-of-two table.
- Negative integer keys: `k % capacity` is negative in C++ and Go. Go folds it into range now.
- Forgetting that nothing here resizes.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [`Python/`](Python/) | `collision_handling.py` | chaining, linear and quadratic probing, tombstone remove |
| C++ | [`C++/`](C++/) | `collision_handling.cpp` | chaining and linear probing; slots held by value in `std::optional` |
| Go | [`Go/`](Go/) | `main.go` | chaining and linear probing; any key type |

## Practice Problems

- [LeetCode 705 - Design HashSet](https://leetcode.com/problems/design-hashset/)
- [LeetCode 706 - Design HashMap](https://leetcode.com/problems/design-hashmap/)

## Related

- [Hash Table](../Hash%20Table/README.md)
- [Hash Map](../Hash%20Map/README.md)
- [Hash Set](../Hash%20Set/README.md)
- [Bloom Filter](../Bloom%20Filter/README.md)
- [Hashing overview](../README.md)
