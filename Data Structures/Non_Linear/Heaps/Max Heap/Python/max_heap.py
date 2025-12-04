class MaxHeap:
    """Max Heap implementation using array-based binary heap.
    
    A Max Heap is a complete binary tree where the parent node is always
    greater than or equal to its children. The maximum element is always at the root.
    
    Supports:
    - Insert: O(log n)
    - Extract max: O(log n)
    - Peek max: O(1)
    - Heapify: O(n)
    """
    
    def __init__(self, arr=None):
        """Initialize Max Heap.
        
        Args:
            arr: Optional array to build heap from (heapify)
        """
        if arr is None:
            self.heap = []
        else:
            self.heap = arr.copy()
            self._heapify()
    
    def _parent(self, index):
        """Get parent index.
        
        Args:
            index: Current index
            
        Returns:
            Parent index
        """
        return (index - 1) // 2
    
    def _left_child(self, index):
        """Get left child index.
        
        Args:
            index: Current index
            
        Returns:
            Left child index
        """
        return 2 * index + 1
    
    def _right_child(self, index):
        """Get right child index.
        
        Args:
            index: Current index
            
        Returns:
            Right child index
        """
        return 2 * index + 2
    
    def _swap(self, i, j):
        """Swap elements at indices i and j.
        
        Args:
            i: First index
            j: Second index
        """
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]
    
    def _heapify_up(self, index):
        """Move element up to maintain heap property.
        
        Args:
            index: Index to start heapifying from
        """
        while index > 0:
            parent = self._parent(index)
            if self.heap[parent] >= self.heap[index]:
                break
            self._swap(parent, index)
            index = parent
    
    def _heapify_down(self, index):
        """Move element down to maintain heap property.
        
        Args:
            index: Index to start heapifying from
        """
        while True:
            largest = index
            left = self._left_child(index)
            right = self._right_child(index)
            
            if left < len(self.heap) and self.heap[left] > self.heap[largest]:
                largest = left
            
            if right < len(self.heap) and self.heap[right] > self.heap[largest]:
                largest = right
            
            if largest == index:
                break
            
            self._swap(index, largest)
            index = largest
    
    def _heapify(self):
        """Build heap from array in O(n) time."""
        n = len(self.heap)
        # Start from last non-leaf node
        for i in range(n // 2 - 1, -1, -1):
            self._heapify_down(i)
    
    def insert(self, value):
        """Insert value into heap.
        
        Args:
            value: Value to insert
        """
        self.heap.append(value)
        self._heapify_up(len(self.heap) - 1)
    
    def extract_max(self):
        """Extract and return maximum element.
        
        Returns:
            Maximum element
            
        Raises:
            IndexError: If heap is empty
        """
        if self.is_empty():
            raise IndexError("Heap is empty")
        
        if len(self.heap) == 1:
            return self.heap.pop()
        
        max_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._heapify_down(0)
        return max_val
    
    def peek(self):
        """Get maximum element without removing it.
        
        Returns:
            Maximum element
            
        Raises:
            IndexError: If heap is empty
        """
        if self.is_empty():
            raise IndexError("Heap is empty")
        return self.heap[0]
    
    def is_empty(self):
        """Check if heap is empty.
        
        Returns:
            True if empty, False otherwise
        """
        return len(self.heap) == 0
    
    def size(self):
        """Get number of elements in heap.
        
        Returns:
            Number of elements
        """
        return len(self.heap)
    
    def clear(self):
        """Remove all elements from heap."""
        self.heap = []

