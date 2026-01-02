"""
Mo's Algorithm

Square root decomposition technique for answering range queries efficiently.
Optimized for offline queries with O((N + Q) * sqrt(N)) complexity.
"""

from typing import List, Tuple
from math import sqrt


class MoSAlgorithm:
    def __init__(self, arr: List[int]):
        self.arr = arr
        self.n = len(arr)
        self.block_size = int(sqrt(self.n))
    
    def get_block(self, index: int) -> int:
        """Get block number for given index."""
        return index // self.block_size
    
    def process_queries(self, queries: List[Tuple[int, int]]) -> List[int]:
        """
        Process range queries using Mo's algorithm.
        
        Args:
            queries: List of (left, right) query ranges
            
        Returns:
            List of answers for each query
        """
        # Sort queries by block, then by right endpoint
        sorted_queries = sorted(
            enumerate(queries),
            key=lambda x: (self.get_block(x[1][0]), x[1][1])
        )
        
        answers = [0] * len(queries)
        current_l = 0
        current_r = -1
        current_ans = 0
        freq = {}  # Frequency map for current range
        
        for query_idx, (l, r) in sorted_queries:
            # Expand or contract window
            while current_l > l:
                current_l -= 1
                current_ans = self.add(current_ans, self.arr[current_l], freq)
            
            while current_r < r:
                current_r += 1
                current_ans = self.add(current_ans, self.arr[current_r], freq)
            
            while current_l < l:
                current_ans = self.remove(current_ans, self.arr[current_l], freq)
                current_l += 1
            
            while current_r > r:
                current_ans = self.remove(current_ans, self.arr[current_r], freq)
                current_r -= 1
            
            answers[query_idx] = current_ans
        
        return answers
    
    def add(self, current_ans: int, value: int, freq: dict) -> int:
        """Add element to current range."""
        freq[value] = freq.get(value, 0) + 1
        # Example: count distinct elements
        if freq[value] == 1:
            return current_ans + 1
        return current_ans
    
    def remove(self, current_ans: int, value: int, freq: dict) -> int:
        """Remove element from current range."""
        freq[value] = freq.get(value, 0) - 1
        if freq[value] == 0:
            del freq[value]
            return current_ans - 1
        return current_ans


def count_distinct_in_ranges(arr: List[int], queries: List[Tuple[int, int]]) -> List[int]:
    """
    Count distinct elements in given ranges using Mo's algorithm.
    
    Args:
        arr: Input array
        queries: List of (left, right) query ranges (0-indexed)
        
    Returns:
        List of distinct counts for each query
    """
    mo = MoSAlgorithm(arr)
    return mo.process_queries(queries)


def main():
    """Example usage."""
    print("Mo's Algorithm Examples:")
    print()
    
    arr = [1, 1, 2, 1, 3, 4, 3, 3, 4]
    queries = [(0, 4), (1, 3), (2, 6), (0, 8)]
    
    print(f"Array: {arr}")
    print(f"Queries: {queries}")
    print()
    
    results = count_distinct_in_ranges(arr, queries)
    print("Distinct counts for each query:")
    for i, (l, r) in enumerate(queries):
        print(f"  Range [{l}, {r}]: {results[i]} distinct elements")


if __name__ == "__main__":
    main()
