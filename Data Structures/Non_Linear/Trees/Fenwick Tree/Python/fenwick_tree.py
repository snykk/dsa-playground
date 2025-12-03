class FenwickTree:
    """Fenwick Tree (Binary Indexed Tree) for range sum queries.
    
    Fenwick Tree is simpler and more memory-efficient than Segment Tree
    for range sum queries and point updates.
    
    Supports:
    - Range sum query: O(log n)
    - Point update: O(log n)
    - Prefix sum: O(log n)
    """
    
    def __init__(self, arr):
        """Initialize Fenwick Tree with array.
        
        Args:
            arr: Input array
        """
        self.n = len(arr)
        self.tree = [0] * (self.n + 1)
        
        # Build tree
        for i in range(self.n):
            self.update(i, arr[i])

    def _lsb(self, index):
        """Get least significant bit (lowest set bit).
        
        Args:
            index: Index (1-indexed)
            
        Returns:
            Value of least significant bit
        """
        return index & (-index)

    def update(self, index, delta):
        """Update value at index by adding delta.
        
        Args:
            index: Index to update (0-indexed)
            delta: Value to add (can be negative for subtraction)
        """
        index += 1  # Convert to 1-indexed
        while index <= self.n:
            self.tree[index] += delta
            index += self._lsb(index)

    def prefix_sum(self, index):
        """Get prefix sum from 0 to index (inclusive).
        
        Args:
            index: End index (0-indexed, inclusive)
            
        Returns:
            Sum of elements from index 0 to index
        """
        index += 1  # Convert to 1-indexed
        result = 0
        while index > 0:
            result += self.tree[index]
            index -= self._lsb(index)
        return result

    def query(self, left, right):
        """Query sum in range [left, right] (inclusive).
        
        Args:
            left: Left index (0-indexed)
            right: Right index (0-indexed, inclusive)
            
        Returns:
            Sum of elements in range [left, right]
        """
        if left == 0:
            return self.prefix_sum(right)
        return self.prefix_sum(right) - self.prefix_sum(left - 1)

    def get(self, index):
        """Get value at index.
        
        Args:
            index: Index to get (0-indexed)
            
        Returns:
            Value at index
        """
        return self.query(index, index)

