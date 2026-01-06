# Interactive Problems

Interactive problems require communication with a judge program that responds to queries.

## Key Rules

1. **Always flush output** after each query
2. **Read response** before next query
3. **Handle errors** gracefully (usually -1 means error)
4. **Query limits** - don't exceed allowed queries

## Output Flushing

### C++
```cpp
// Method 1: endl (slower but auto-flushes)
cout << "? " << x << endl;

// Method 2: explicit flush (preferred)
cout << "? " << x << "\n";
cout.flush();
```

### Python
```python
# Always use flush=True
print(f"? {x}", flush=True)

# Or flush manually
import sys
print(f"? {x}")
sys.stdout.flush()
```

### Go
```go
import "bufio"
var writer = bufio.NewWriter(os.Stdout)
fmt.Fprintln(writer, "?", x)
writer.Flush()
```

## Common Patterns

### Binary Search
```cpp
int lo = 1, hi = n;
while (lo < hi) {
    int mid = (lo + hi) / 2;
    cout << "? " << mid << "\n";
    cout.flush();
    
    string resp;
    cin >> resp;
    
    if (resp == "higher") lo = mid + 1;
    else hi = mid;
}
cout << "! " << lo << "\n";
```

### Graph Exploration
```python
def get_neighbors(u):
    print(f"? {u}", flush=True)
    return list(map(int, input().split()))

# BFS to explore
visited = set([1])
queue = [1]
while queue:
    u = queue.pop(0)
    for v in get_neighbors(u):
        if v not in visited:
            visited.add(v)
            queue.append(v)
```

### Comparison-Based
```cpp
auto compare = [](int i, int j) {
    cout << "? " << i << " " << j << "\n";
    cout.flush();
    int res; cin >> res;
    return res;  // 1 if i > j, -1 if i < j
};
```

## Tips

1. **Plan queries** - Know maximum queries allowed
2. **Binary search** - Reduces linear to logarithmic queries
3. **Batch when possible** - Some problems allow multiple queries at once
4. **Track state** - Remember previous responses
5. **Handle edge cases** - First/last elements, empty responses

## Query Complexity

| Strategy | Queries | Use Case |
|----------|---------|----------|
| Linear | O(n) | Simple search |
| Binary Search | O(log n) | Sorted/monotonic |
| Ternary Search | O(log n) | Unimodal functions |
| Divide & Conquer | O(log n) | Recursive partitioning |

