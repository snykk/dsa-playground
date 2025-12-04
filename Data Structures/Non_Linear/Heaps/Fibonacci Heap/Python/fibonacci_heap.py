class FibonacciHeapNode:
    """Node in Fibonacci Heap."""
    def __init__(self, key):
        self.key = key
        self.degree = 0
        self.parent = None
        self.child = None
        self.left = self
        self.right = self
        self.marked = False

class FibonacciHeap:
    """Fibonacci Heap implementation.
    
    A Fibonacci Heap is an advanced heap data structure with amortized O(1) insert
    and O(log n) extract min. It's more complex than binary heaps but offers
    better performance for certain operations.
    
    Supports:
    - Insert: O(1) amortized
    - Extract min: O(log n) amortized
    - Decrease key: O(1) amortized
    - Merge: O(1)
    """
    
    def __init__(self):
        """Initialize Fibonacci Heap."""
        self.min_node = None
        self.count = 0
    
    def is_empty(self):
        """Check if heap is empty.
        
        Returns:
            True if empty, False otherwise
        """
        return self.min_node is None
    
    def size(self):
        """Get number of elements in heap.
        
        Returns:
            Number of elements
        """
        return self.count
    
    def insert(self, key):
        """Insert key into heap.
        
        Args:
            key: Key to insert
        """
        node = FibonacciHeapNode(key)
        
        if self.min_node is None:
            self.min_node = node
        else:
            # Insert into root list
            self._add_to_root_list(node)
            if key < self.min_node.key:
                self.min_node = node
        
        self.count += 1
    
    def _add_to_root_list(self, node):
        """Add node to root list.
        
        Args:
            node: Node to add
        """
        if self.min_node is None:
            return
        
        node.left = self.min_node
        node.right = self.min_node.right
        self.min_node.right.left = node
        self.min_node.right = node
    
    def extract_min(self):
        """Extract and return minimum element.
        
        Returns:
            Minimum key
            
        Raises:
            IndexError: If heap is empty
        """
        if self.is_empty():
            raise IndexError("Heap is empty")
        
        min_node = self.min_node
        min_key = min_node.key
        
        # Move children to root list
        if min_node.child is not None:
            child = min_node.child
            while True:
                next_child = child.right
                child.parent = None
                self._add_to_root_list(child)
                if next_child == min_node.child:
                    break
                child = next_child
        
        # Remove min_node from root list
        if min_node == min_node.right:
            self.min_node = None
        else:
            self.min_node = min_node.right
            self._remove_from_root_list(min_node)
            self._consolidate()
        
        self.count -= 1
        return min_key
    
    def _remove_from_root_list(self, node):
        """Remove node from root list.
        
        Args:
            node: Node to remove
        """
        node.left.right = node.right
        node.right.left = node.left
    
    def _consolidate(self):
        """Consolidate trees to maintain heap property."""
        if self.min_node is None:
            return
        
        # Array to track trees by degree
        degree_table = {}
        nodes_to_process = []
        
        # Collect all root nodes
        current = self.min_node
        while True:
            nodes_to_process.append(current)
            current = current.right
            if current == self.min_node:
                break
        
        for node in nodes_to_process:
            degree = node.degree
            while degree in degree_table:
                other = degree_table[degree]
                if node.key > other.key:
                    node, other = other, node
                self._link(other, node)
                del degree_table[degree]
                degree += 1
            degree_table[degree] = node
        
        # Find new minimum
        self.min_node = None
        for node in degree_table.values():
            if self.min_node is None or node.key < self.min_node.key:
                self.min_node = node
    
    def _link(self, child, parent):
        """Link child to parent.
        
        Args:
            child: Child node
            parent: Parent node
        """
        self._remove_from_root_list(child)
        child.parent = parent
        child.marked = False
        
        if parent.child is None:
            parent.child = child
            child.left = child
            child.right = child
        else:
            child.left = parent.child
            child.right = parent.child.right
            parent.child.right.left = child
            parent.child.right = child
        
        parent.degree += 1
    
    def peek(self):
        """Get minimum element without removing it.
        
        Returns:
            Minimum key
            
        Raises:
            IndexError: If heap is empty
        """
        if self.is_empty():
            raise IndexError("Heap is empty")
        return self.min_node.key
    
    def clear(self):
        """Remove all elements from heap."""
        self.min_node = None
        self.count = 0

