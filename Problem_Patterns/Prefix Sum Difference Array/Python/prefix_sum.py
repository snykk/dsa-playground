"""
Prefix Sum / Difference Array Pattern

Techniques for efficient range queries and updates using prefix sums and difference arrays.
"""

from typing import List


class PrefixSum:
    """Prefix sum array for range sum queries."""
    
    def __init__(self, arr: List[int]):
        self.prefix = [0]
        for num in arr:
            self.prefix.append(self.prefix[-1] + num)
    
    def query(self, left: int, right: int) -> int:
        """Get sum of range [left, right] (inclusive)."""
        return self.prefix[right + 1] - self.prefix[left]


class DifferenceArray:
    """Difference array for range updates."""
    
    def __init__(self, size: int):
        self.diff = [0] * (size + 1)
        self.size = size
    
    def update(self, left: int, right: int, value: int):
        """Update range [left, right] by adding value."""
        self.diff[left] += value
        if right + 1 < len(self.diff):
            self.diff[right + 1] -= value
    
    def get_array(self) -> List[int]:
        """Get final array after all updates."""
        result = []
        current = 0
        for i in range(self.size):
            current += self.diff[i]
            result.append(current)
        return result


def range_sum_queries(arr: List[int], queries: List[tuple]) -> List[int]:
    """Answer multiple range sum queries efficiently."""
    ps = PrefixSum(arr)
    results = []
    for left, right in queries:
        results.append(ps.query(left, right))
    return results


def range_updates(arr: List[int], updates: List[tuple]) -> List[int]:
    """Apply multiple range updates efficiently."""
    da = DifferenceArray(len(arr))
    for left, right, value in updates:
        da.update(left, right, value)
    result = da.get_array()
    # Add original array
    for i in range(len(arr)):
        result[i] += arr[i]
    return result


def main():
    """Example usage."""
    print("Prefix Sum / Difference Array Examples:")
    print()
    
    # Example 1: Range sum queries
    arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    queries = [(0, 4), (2, 6), (0, 9)]
    results = range_sum_queries(arr, queries)
    print(f"Range sum queries on {arr}:")
    for (l, r), res in zip(queries, results):
        print(f"  Sum[{l}, {r}] = {res}")
    print()
    
    # Example 2: Range updates
    arr = [0] * 10
    updates = [(0, 4, 5), (2, 6, 3), (1, 3, 2)]
    result = range_updates(arr, updates)
    print(f"After range updates: {result}")

