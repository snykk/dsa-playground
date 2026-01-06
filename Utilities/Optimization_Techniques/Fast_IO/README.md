# Fast I/O Techniques

Fast input/output techniques are crucial for competitive programming when dealing with large datasets. Standard I/O operations can be a bottleneck, making the difference between passing and timing out.

## Why Fast I/O Matters

- **Standard I/O is slow**: `scanf`/`printf` and `cin`/`cout` have overhead
- **Large inputs**: Problems with 10^6+ elements need optimized I/O
- **Time limits**: Often 1-2 seconds for millions of operations

## Techniques

### C++ Fast I/O

```cpp
// Method 1: Standard fast I/O (recommended)
ios_base::sync_with_stdio(false);
cin.tie(nullptr);
cout.tie(nullptr);

// Method 2: getchar/putchar (faster)
inline int readInt() {
    int x = 0, f = 1;
    char c = getchar();
    while (c < '0' || c > '9') {
        if (c == '-') f = -1;
        c = getchar();
    }
    while (c >= '0' && c <= '9') {
        x = x * 10 + c - '0';
        c = getchar();
    }
    return x * f;
}

// Method 3: Buffered I/O (fastest)
class FastInput { /* ... */ };
```

### Python Fast I/O

```python
import sys
input = sys.stdin.readline  # 5-10x faster

# Fast integer input
def fast_int():
    return int(sys.stdin.readline())

# Fast list of integers
def fast_ints():
    return list(map(int, sys.stdin.readline().split()))

# Fast output
sys.stdout.write(str(ans) + '\n')

# Batch output
print('\n'.join(map(str, results)))
```

### Go Fast I/O

```go
import "bufio"

var reader = bufio.NewReader(os.Stdin)
var writer = bufio.NewWriter(os.Stdout)

func readInt() int {
    var x int
    fmt.Fscan(reader, &x)
    return x
}

// Always flush at end
defer writer.Flush()
```

## Performance Comparison

| Method | Speed | Use Case |
|--------|-------|----------|
| cin/cout with sync_with_stdio(false) | Fast | General use |
| getchar/putchar | Faster | Large inputs |
| Buffered I/O | Fastest | Very large inputs |

### Benchmark (reading 10^6 integers)

| Language | Method | Time |
|----------|--------|------|
| C++ | cin (default) | ~500ms |
| C++ | cin (fast) | ~100ms |
| C++ | getchar | ~50ms |
| C++ | Buffered | ~25ms |
| Python | input() | ~2000ms |
| Python | sys.stdin.readline | ~400ms |
| Python | read all at once | ~200ms |
| PyPy | sys.stdin.readline | ~100ms |

## Best Practices

1. **Always use fast I/O** in competitive programming
2. **Use appropriate method** based on input size
3. **Don't mix** cin/cout with scanf/printf after sync_with_stdio(false)
4. **Use '\n'** instead of endl (endl flushes buffer)
5. **Consider PyPy** for Python solutions
6. **Batch output** using join() when possible

## Common Pitfalls

1. **Forgetting to tie(nullptr)** - cin and cout are synchronized by default
2. **Using endl** - Forces buffer flush, slow for many outputs
3. **Reading line-by-line** when you can read all at once
4. **Not using bufio** in Go

