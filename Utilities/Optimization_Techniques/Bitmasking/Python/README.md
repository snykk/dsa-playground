# Bitmasking (Python)

Python implementation of bitmasking techniques for competitive programming.

## Functions

### Basic Operations
- `get_bit(mask, i)` - Check if i-th bit is set
- `set_bit(mask, i)` - Set i-th bit to 1
- `clear_bit(mask, i)` - Clear i-th bit
- `toggle_bit(mask, i)` - Toggle i-th bit
- `count_bits(mask)` - Count number of set bits
- `lowest_set_bit(mask)` - Get lowest set bit
- `clear_lowest_bit(mask)` - Clear lowest set bit

### Subset Enumeration
- `enumerate_subsets(mask)` - Iterate through all subsets
- `subsets_of_size_k(n, k)` - Generate subsets of size k

### Bitmask DP
- `tsp(dist)` - Traveling Salesman Problem
- `count_subset_sum(nums, target)` - Count subsets that sum to target

### Tricks
- `is_power_of_2(n)` - Check if n is power of 2
- `next_power_of_2(n)` - Round up to next power of 2
- `sos_dp(a)` - Sum Over Subsets DP

## Usage

```python
mask = 0b10110
print(get_bit(mask, 1))  # True
print(set_bit(mask, 0))  # 0b10111
```

