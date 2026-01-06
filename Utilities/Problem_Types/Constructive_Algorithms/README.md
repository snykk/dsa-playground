# Constructive Algorithms

Constructive problems ask you to build an object (array, graph, string, etc.) satisfying given constraints.

## Common Patterns

### 1. Permutation Construction

```cpp
// Build permutation with k distinct adjacent differences
vi perm(n);
iota(perm.begin(), perm.end(), 1);  // [1,2,3,4,5]
reverse(perm.begin() + (n-k-1), perm.end());  // Creates k differences
```

### 2. Array with Sum Constraints

```cpp
// Fill array with minimum, then distribute remaining
vi arr(n, minVal);
ll remaining = sum - n * minVal;
for (int i = 0; i < n && remaining > 0; i++) {
    int add = min(maxVal - minVal, (int)remaining);
    arr[i] += add;
    remaining -= add;
}
```

### 3. Graph Construction

```cpp
// Erdős–Gallai: Build graph with given degrees
// Use max-heap, repeatedly connect highest-degree node
priority_queue<pair<int,int>> pq;
for (int i = 0; i < n; i++)
    if (deg[i] > 0) pq.push({deg[i], i});
```

### 4. String with Character Counts

```cpp
// Alternating pattern to avoid adjacent duplicates
string result;
for (int i = 0; i < n; i++) {
    char c = (i % 2 == 0) ? moreChar : lessChar;
    result += c;
}
```

### 5. Binary Decomposition

```cpp
// Express number as sum of powers of 2
vi powers;
for (int bit = 0; bit < 30; bit++)
    if (n & (1 << bit)) powers.push_back(1 << bit);
```

## Impossibility Conditions

Check these early to return "impossible":

| Condition | Example |
|-----------|---------|
| Sum constraints | `sum < n*min` or `sum > n*max` |
| Parity | Need even sum but given odd elements |
| Degree sum | Graph degrees must sum to 2×edges |
| Character counts | Can't alternate if `max > min + 1` |

## Problem-Solving Strategy

1. **Understand constraints** - What must the output satisfy?
2. **Find impossibility** - When is construction impossible?
3. **Start simple** - Try sorted, constant, or alternating patterns
4. **Be greedy** - Build step by step, optimal local choices
5. **Verify** - Check your construction meets all constraints

## Common Techniques

| Technique | When to Use |
|-----------|-------------|
| Greedy filling | Sum/count constraints |
| Alternating | Avoiding adjacent duplicates |
| Binary search | Finding threshold values |
| Graph algorithms | Degree sequences |
| Divide & conquer | Large constructions |

## Example Problems

- Build array with given XOR
- Construct tree with given depths
- Build permutation with k inversions
- Create matrix with row/column sums
- Generate string matching pattern

