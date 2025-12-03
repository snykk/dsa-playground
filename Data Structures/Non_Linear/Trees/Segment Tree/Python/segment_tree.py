class SegmentTree:
    """Segment Tree for range sum queries and updates.
    
    Supports:
    - Range sum query: O(log n)
    - Point update: O(log n)
    - Range update: O(n log n) - can be optimized with lazy propagation
    """
    
    def __init__(self, arr):
        """Initialize segment tree with array.
        
        Args:
            arr: Input array
        """
        self.n = len(arr)
        self.size = 1
        while self.size < self.n:
            self.size *= 2
        self.tree = [0] * (2 * self.size)
        
        # Build tree
        for i in range(self.n):
            self.tree[self.size + i] = arr[i]
        for i in range(self.size - 1, 0, -1):
            self.tree[i] = self.tree[2 * i] + self.tree[2 * i + 1]

    def update(self, index, value):
        """Update value at index.
        
        Args:
            index: Index to update (0-indexed)
            value: New value
        """
        index += self.size
        self.tree[index] = value
        index //= 2
        while index:
            self.tree[index] = self.tree[2 * index] + self.tree[2 * index + 1]
            index //= 2

    def query(self, left, right):
        """Query sum in range [left, right] (inclusive).
        
        Args:
            left: Left index (0-indexed)
            right: Right index (0-indexed, inclusive)
            
        Returns:
            Sum of elements in range [left, right]
        """
        left += self.size
        right += self.size
        result = 0
        
        while left <= right:
            if left % 2 == 1:
                result += self.tree[left]
                left += 1
            if right % 2 == 0:
                result += self.tree[right]
                right -= 1
            left //= 2
            right //= 2
        
        return result

    def get(self, index):
        """Get value at index.
        
        Args:
            index: Index to get (0-indexed)
            
        Returns:
            Value at index
        """
        return self.tree[self.size + index]

