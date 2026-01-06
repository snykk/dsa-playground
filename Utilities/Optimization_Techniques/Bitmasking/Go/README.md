# Bitmasking (Go)

Go implementation of bitmasking techniques for competitive programming.

## Functions

### Basic Operations
- `GetBit(mask, i)` - Check if i-th bit is set
- `SetBit(mask, i)` - Set i-th bit to 1
- `ClearBit(mask, i)` - Clear i-th bit
- `ToggleBit(mask, i)` - Toggle i-th bit
- `CountBits(mask)` - Count number of set bits
- `LowestSetBit(mask)` - Get lowest set bit
- `ClearLowestBit(mask)` - Clear lowest set bit

### Subset Enumeration
- `EnumerateSubsets(mask)` - Get all subsets of a set

### Bitmask DP
- `TSP(dist)` - Traveling Salesman Problem
- `CountSubsetSum(nums, target)` - Count subsets that sum to target

### Tricks
- `IsPowerOf2(n)` - Check if n is power of 2
- `NextPowerOf2(n)` - Round up to next power of 2
- `SOSDP(a)` - Sum Over Subsets DP

## Usage

```go
package main

import "fmt"

func main() {
    mask := 0b10110
    fmt.Println(GetBit(mask, 1))  // true
    fmt.Println(SetBit(mask, 0))  // 0b10111
}
```

## Testing

```bash
go test
```

