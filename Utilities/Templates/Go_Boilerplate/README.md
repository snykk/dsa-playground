# Go Competitive Programming Boilerplate

A comprehensive Go template for competitive programming that includes commonly used utilities and data structures.

## Features

### Fast I/O
- `readInt()` - Read single integer
- `readInt64()` - Read single int64
- `readString()` - Read string
- `readInts(n)` - Read n integers as slice
- `println(a...)` - Print with newline
- `printf(format, a...)` - Formatted print

### Constants
- `MOD` - 10^9 + 7
- `MOD2` - 998244353
- `INF` - 2^60

### Math Utilities
- `gcd(a, b)`, `lcm(a, b)` - GCD and LCM
- `power(base, exp, mod)` - Modular exponentiation
- `modInverse(a, mod)` - Modular multiplicative inverse
- `isPrime(n)` - Primality test
- `abs(x)`, `min(a, b)`, `max(a, b)` - Basic math functions

### Data Structures
- **Combinatorics** - Precomputed factorials for NCr/NPr
- **DSU** - Disjoint Set Union with path compression
- **SegTree** - Segment Tree for range queries
- **Graph** - Adjacency list with BFS/DFS

## Usage

```go
package main

import (
	"bufio"
	"fmt"
	"os"
)

var reader = bufio.NewReader(os.Stdin)
var writer = bufio.NewWriter(os.Stdout)

func solve() {
	n := readInt()
	a := readInts(n)
	
	// Your solution here
	ans := 0
	for _, x := range a {
		ans += x
	}
	
	println(ans)
}

func main() {
	defer writer.Flush()
	
	t := 1
	// t = readInt()
	for i := 0; i < t; i++ {
		solve()
	}
}
```

## Complexity

| Function | Time | Space |
|----------|------|-------|
| gcd | O(log(min(a,b))) | O(1) |
| power | O(log n) | O(1) |
| modInverse | O(log MOD) | O(1) |
| isPrime | O(√n) | O(1) |
| DSU.Find | O(α(n)) | O(n) |
| DSU.Unite | O(α(n)) | O(n) |
| SegTree.Update | O(log n) | O(n) |
| SegTree.Query | O(log n) | O(n) |

## Best Practices

1. **Use bufio** for fast I/O
2. **Defer writer.Flush()** at start of main
3. **Use int64** for large numbers to avoid overflow
4. **Preallocate slices** when size is known
5. **Use sort.Search** for binary search on sorted slices

