import heapq

class PriorityQueue:
    """Priority Queue implementation using min heap.
    
    Elements with lower priority values have higher priority (min heap).
    For max heap behavior, negate the priority values.
    """

    def __init__(self):
        self.heap = []
        self.count = 0  # Used to break ties and maintain insertion order

    def enqueue(self, item, priority):
        """Add item to the priority queue with given priority.
        
        Args:
            item: The item to add
            priority: Priority value (lower = higher priority)
        """
        # Use count to maintain insertion order for items with same priority
        heapq.heappush(self.heap, (priority, self.count, item))
        self.count += 1

    def dequeue(self):
        """Remove and return the item with highest priority (lowest priority value).
        
        Returns:
            The item with highest priority
            
        Raises:
            IndexError: If the queue is empty
        """
        if self.is_empty():
            raise IndexError("Priority queue is empty")
        priority, count, item = heapq.heappop(self.heap)
        return item

    def peek(self):
        """Return the item with highest priority without removing it.
        
        Returns:
            The item with highest priority
            
        Raises:
            IndexError: If the queue is empty
        """
        if self.is_empty():
            raise IndexError("Priority queue is empty")
        priority, count, item = self.heap[0]
        return item

    def is_empty(self):
        """Check if the priority queue is empty."""
        return len(self.heap) == 0

    def size(self):
        """Return the number of elements in the priority queue."""
        return len(self.heap)

    def clear(self):
        """Remove all elements from the priority queue."""
        self.heap = []
        self.count = 0

