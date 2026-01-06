# Bitmasking (C++)

C++ implementation of bitmasking techniques for competitive programming.

## Functions

### Basic Operations
- `getBit(mask, i)` - Check if i-th bit is set
- `setBit(mask, i)` - Set i-th bit to 1
- `clearBit(mask, i)` - Clear i-th bit
- `toggleBit(mask, i)` - Toggle i-th bit
- `countBits(mask)` - Count number of set bits
- `lowestBit(mask)` - Get lowest set bit
- `clearLowestBit(mask)` - Clear lowest set bit

### Subset Enumeration
- `enumerateSubsets(mask)` - Iterate through all subsets
- `subsetsOfSizeK(n, k)` - Generate subsets of size k

### Bitmask DP
- `tsp(dist)` - Traveling Salesman Problem
- `countSubsetSum(nums, target)` - Count subsets that sum to target

### Tricks
- `isPowerOf2(n)` - Check if n is power of 2
- `nextPowerOf2(n)` - Round up to next power of 2
- `sosDP(a)` - Sum Over Subsets DP

## Usage

```cpp
int mask = 0b10110;
cout << getBit(mask, 1) << endl;  // 1
cout << setBit(mask, 0) << endl;  // 0b10111
```

