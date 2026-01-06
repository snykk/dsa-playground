# Fast I/O (Go)

Go implementation of fast input/output techniques for competitive programming.

## Usage

```go
package main

import "fmt"

func main() {
    defer writer.Flush()
    
    n := readInt()
    arr := readInts(n)
    println(sum)
}
```

## Functions

- `readInt()` - Read single integer
- `readInt64()` - Read single int64
- `readString()` - Read single string
- `readInts(n)` - Read n integers
- `println(...)` - Fast print with newline
- `printf(...)` - Fast formatted print

## Buffered Input

For very large inputs, use `BufferedInput`:

```go
bi := NewBufferedInput()
x := bi.NextInt()
```

