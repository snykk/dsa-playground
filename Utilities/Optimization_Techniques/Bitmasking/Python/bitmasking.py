"""
Bitmasking Techniques for Competitive Programming (Python)
"""

from typing import List, Generator
from functools import lru_cache

# ==================== Basic Bit Operations ====================

def get_bit(mask: int, i: int) -> bool:
    """Check if i-th bit is set."""
    return (mask >> i) & 1 == 1

def set_bit(mask: int, i: int) -> int:
    """Set i-th bit to 1."""
    return mask | (1 << i)

def clear_bit(mask: int, i: int) -> int:
    """Clear i-th bit (set to 0)."""
    return mask & ~(1 << i)

def toggle_bit(mask: int, i: int) -> int:
    """Toggle i-th bit."""
    return mask ^ (1 << i)

def count_bits(mask: int) -> int:
    """Count number of set bits."""
    return bin(mask).count('1')

def lowest_set_bit(mask: int) -> int:
    """Get lowest set bit."""
    return mask & (-mask)

def clear_lowest_bit(mask: int) -> int:
    """Clear lowest set bit."""
    return mask & (mask - 1)

# ==================== Subset Enumeration ====================

def enumerate_subsets(mask: int) -> Generator[int, None, None]:
    """Iterate through all subsets of a set (including empty)."""
    sub = mask
    while True:
        yield sub
        if sub == 0:
            break
        sub = (sub - 1) & mask

def subsets_of_size_k(n: int, k: int) -> Generator[int, None, None]:
    """Generate all subsets of size k from n elements."""
    # Generate first subset of size k
    mask = (1 << k) - 1
    
    while mask < (1 << n):
        yield mask
        
        # Gosper's hack to get next subset
        c = mask & -mask
        r = mask + c
        mask = (((r ^ mask) >> 2) // c) | r

# ==================== Bitmask DP ====================

def tsp(dist: List[List[int]]) -> int:
    """Traveling Salesman Problem using bitmask DP."""
    n = len(dist)
    INF = float('inf')
    
    # dp[mask][last] = minimum distance to visit all cities in mask, ending at last
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0  # Start from city 0
    
    for mask in range(1, 1 << n):
        for last in range(n):
            if not (mask & (1 << last)):
                continue
            if dp[mask][last] == INF:
                continue
            
            for next_city in range(n):
                if mask & (1 << next_city):
                    continue
                
                new_mask = mask | (1 << next_city)
                dp[new_mask][next_city] = min(
                    dp[new_mask][next_city],
                    dp[mask][last] + dist[last][next_city]
                )
    
    # Return to starting city
    full_mask = (1 << n) - 1
    return min(dp[full_mask][last] + dist[last][0] for last in range(1, n))

def count_subset_sum(nums: List[int], target: int) -> int:
    """Count subsets that sum to target."""
    n = len(nums)
    count = 0
    
    for mask in range(1 << n):
        total = sum(nums[i] for i in range(n) if mask & (1 << i))
        if total == target:
            count += 1
    
    return count

# ==================== Bit Manipulation Tricks ====================

def is_power_of_2(n: int) -> bool:
    """Check if n is power of 2."""
    return n > 0 and (n & (n - 1)) == 0

def next_power_of_2(n: int) -> int:
    """Round up to next power of 2."""
    if n <= 0:
        return 1
    n -= 1
    n |= n >> 1
    n |= n >> 2
    n |= n >> 4
    n |= n >> 8
    n |= n >> 16
    return n + 1

def log2_floor(n: int) -> int:
    """Floor of log base 2."""
    return n.bit_length() - 1

def log2_ceil(n: int) -> int:
    """Ceiling of log base 2."""
    return (n - 1).bit_length()

# ==================== SOS DP (Sum Over Subsets) ====================

def sos_dp(a: List[int]) -> List[int]:
    """
    Sum Over Subsets DP.
    For each mask, compute sum of a[sub] for all sub ⊆ mask.
    """
    n = len(a).bit_length() - 1
    dp = a.copy()
    
    for i in range(n):
        for mask in range(1 << n):
            if mask & (1 << i):
                dp[mask] += dp[mask ^ (1 << i)]
    
    return dp

# ==================== Meet in the Middle ====================

def meet_in_middle_subset_sum(nums: List[int], target: int) -> bool:
    """
    Check if any subset sums to target using meet in the middle.
    Works for n up to ~40.
    """
    n = len(nums)
    half = n // 2
    
    # Generate all subset sums for first half
    left_sums = set()
    for mask in range(1 << half):
        total = sum(nums[i] for i in range(half) if mask & (1 << i))
        left_sums.add(total)
    
    # Check second half
    for mask in range(1 << (n - half)):
        total = sum(nums[half + i] for i in range(n - half) if mask & (1 << i))
        if target - total in left_sums:
            return True
    
    return False


if __name__ == "__main__":
    # Demo
    mask = 0b10110
    
    print(f"Original: {bin(mask)}")
    print(f"Bit 1 set: {get_bit(mask, 1)}")
    print(f"Bit 3 set: {get_bit(mask, 3)}")
    print(f"Set bit 0: {bin(set_bit(mask, 0))}")
    print(f"Clear bit 2: {bin(clear_bit(mask, 2))}")
    print(f"Toggle bit 4: {bin(toggle_bit(mask, 4))}")
    print(f"Count bits: {count_bits(mask)}")
    
    print("\nSubsets of 0b111:")
    for sub in enumerate_subsets(0b111):
        print(f"  {bin(sub)}")

