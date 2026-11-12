class SparseTable:
    """Sparse Table for Range Minimum/Maximum Query (RMQ).
    
    Sparse Table is a static data structure that supports O(1) range queries
    after O(n log n) preprocessing. It does not support updates.
    
    Supports:
    - Range minimum query: O(1)
    - Range maximum query: O(1)
    - Preprocessing: O(n log n)
    """
    
    def __init__(self, arr, query_type='min'):
        """Initialize Sparse Table with array.
        
        Args:
            arr: Input array
            query_type: 'min' for minimum query, 'max' for maximum query

        Raises:
            ValueError: if query_type is neither 'min' nor 'max'

        An empty array is allowed; every query on it raises IndexError.
        """
        if query_type not in ('min', 'max'):
            raise ValueError("query_type must be 'min' or 'max'")
        self.n = len(arr)
        self.arr = list(arr)
        self.query_type = query_type
        
        # Number of levels: floor(log2(n)) + 1, computed with integers (0 for n = 0)
        self.log_n = self.n.bit_length()
        
        # Build sparse table
        # table[i][j] = min/max of range starting at i with length 2^j
        self.table = [[0] * self.log_n for _ in range(self.n)]
        
        # Initialize first column (length 1)
        for i in range(self.n):
            self.table[i][0] = arr[i]
        
        # Fill table using dynamic programming
        for j in range(1, self.log_n):
            for i in range(self.n - (1 << j) + 1):
                if query_type == 'min':
                    self.table[i][j] = min(
                        self.table[i][j - 1],
                        self.table[i + (1 << (j - 1))][j - 1]
                    )
                else:  # max
                    self.table[i][j] = max(
                        self.table[i][j - 1],
                        self.table[i + (1 << (j - 1))][j - 1]
                    )
    
    def query(self, left, right):
        """Query min/max in range [left, right] (inclusive).
        
        Args:
            left: Left index (0-indexed)
            right: Right index (0-indexed, inclusive)
            
        Returns:
            Minimum or maximum value in range [left, right]

        Raises:
            IndexError: if an index is outside [0, n). Swapped bounds
                (left > right) are accepted and reordered.
        """
        if left > right:
            left, right = right, left
        if left < 0 or right >= self.n:
            raise IndexError("range [%d, %d] out of bounds for size %d" % (left, right, self.n))
        
        # Largest k with 2^k <= length
        length = right - left + 1
        k = length.bit_length() - 1
        
        # Query two overlapping ranges of length 2^k
        if self.query_type == 'min':
            return min(
                self.table[left][k],
                self.table[right - (1 << k) + 1][k]
            )
        else:  # max
            return max(
                self.table[left][k],
                self.table[right - (1 << k) + 1][k]
            )
    
    def get(self, index):
        """Get value at index.
        
        Args:
            index: Index to get (0-indexed)
            
        Returns:
            Value at index
        """
        if not 0 <= index < self.n:
            raise IndexError("index %d out of range for size %d" % (index, self.n))
        return self.arr[index]

