class SegmentTree:
    """Segment Tree for range sum queries and point updates.

    Iterative bottom-up layout: the array is padded to a power of two
    (size), leaves live at tree[size + i], and tree[i] = tree[2i] + tree[2i+1].

    Supports:
    - Range sum query: O(log n)
    - Point update (assign): O(log n)

    Range updates need lazy propagation (see Segment Tree (Lazy Propagation)).
    Indices outside [0, n) raise IndexError.
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

    def _check(self, index):
        """Raise IndexError unless 0 <= index < n (no negative indexing)."""
        if not 0 <= index < self.n:
            raise IndexError("index %d out of range for size %d" % (index, self.n))

    def update(self, index, value):
        """Update value at index.
        
        Args:
            index: Index to update (0-indexed)
            value: New value
        """
        self._check(index)
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

        Raises:
            IndexError: unless 0 <= left <= right < n
        """
        self._check(left)
        self._check(right)
        if left > right:
            raise IndexError("left %d is greater than right %d" % (left, right))
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
        self._check(index)
        return self.tree[self.size + index]

