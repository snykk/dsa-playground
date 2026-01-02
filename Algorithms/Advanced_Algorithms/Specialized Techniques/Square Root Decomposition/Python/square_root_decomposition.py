"""
Square Root Decomposition

Decomposes array into blocks of size sqrt(n) for efficient range queries.
"""

from typing import List
from math import sqrt, ceil


class SqrtDecomposition:
    def __init__(self, arr: List[int]):
        self.arr = arr
        self.n = len(arr)
        self.block_size = int(ceil(sqrt(self.n)))
        self.block_count = (self.n + self.block_size - 1) // self.block_size
        self.blocks = [0] * self.block_count
        
        # Precompute block sums
        for i in range(self.n):
            block_idx = i // self.block_size
            self.blocks[block_idx] += arr[i]
    
    def update(self, index: int, value: int):
        """Update value at index."""
        block_idx = index // self.block_size
        self.blocks[block_idx] += value - self.arr[index]
        self.arr[index] = value
    
    def query(self, left: int, right: int) -> int:
        """Query sum in range [left, right]."""
        result = 0
        left_block = left // self.block_size
        right_block = right // self.block_size
        
        if left_block == right_block:
            # Same block
            for i in range(left, right + 1):
                result += self.arr[i]
        else:
            # Left partial block
            for i in range(left, (left_block + 1) * self.block_size):
                result += self.arr[i]
            
            # Middle complete blocks
            for i in range(left_block + 1, right_block):
                result += self.blocks[i]
            
            # Right partial block
            for i in range(right_block * self.block_size, right + 1):
                result += self.arr[i]
        
        return result


def main():
    """Example usage."""
    print("Square Root Decomposition Examples:")
    print()
    
    arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    sd = SqrtDecomposition(arr)
    
    print(f"Array: {arr}")
    print(f"Block size: {sd.block_size}")
    print(f"Block sums: {sd.blocks}")
    print()
    
    # Query range [2, 7]
    result = sd.query(2, 7)
    print(f"Sum of range [2, 7]: {result}")
    
    # Update index 5
    sd.update(5, 20)
    print(f"\nAfter updating index 5 to 20:")
    print(f"Array: {sd.arr}")
    print(f"Block sums: {sd.blocks}")
    
    result = sd.query(2, 7)
    print(f"Sum of range [2, 7]: {result}")


if __name__ == "__main__":
    main()
