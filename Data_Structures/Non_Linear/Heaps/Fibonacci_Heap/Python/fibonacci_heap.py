class FibonacciHeapNode:
    """Node in Fibonacci Heap, and the handle that insert returns.

    A caller keeps the node that insert returned and passes it back to
    decrease_key or delete. Read its key as `handle.key` and whether it is
    still in a heap as `handle.in_heap`; change it only through the heap.
    """
    def __init__(self, key):
        self.key = key
        self.degree = 0
        self.parent = None
        self.child = None
        self.left = self
        self.right = self
        self.marked = False
        # False once the node has left its heap (extract_min, delete, clear):
        # the handle is then stale and decrease_key / delete reject it.
        self.in_heap = True

    def __repr__(self):
        return "FibonacciHeapNode(key=%r)" % (self.key,)


class FibonacciHeap:
    """Fibonacci heap: a lazy forest of heap-ordered trees with a circular root list.

    Insert drops a node into the root list and returns it as a handle. Extract
    min promotes the children of the minimum to the root list and then
    consolidates trees of equal degree. Decrease key cuts a node that breaks
    heap order and moves it to the root list; a parent that loses a second
    child is cut too (cascading cut), which is what the `marked` flag records.
    Delete cuts the node the same way, makes it the minimum and extracts it.
    Merge splices two root lists together.

    Costs:
    - Insert: O(1) worst case
    - Peek: O(1)
    - Extract min: O(log n) amortized
    - Decrease key: O(1) amortized
    - Delete: O(log n) amortized
    - Merge: O(1) worst case
    - Clear: O(n), because every node is flagged as no longer in the heap
    """
    
    def __init__(self):
        """Initialize Fibonacci Heap."""
        self.min_node = None
        self.count = 0
        # Work counters for the amortized analysis: trees linked by
        # consolidation and nodes cut from their parent.
        self.link_count = 0
        self.cut_count = 0
    
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

        Returns:
            The new node, a handle for decrease_key and delete
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
        return node
    
    def _add_to_root_list(self, node):
        """Add node to root list, right after min_node.
        
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
        
        # Move children to root list; a root is never marked
        if min_node.child is not None:
            child = min_node.child
            while True:
                next_child = child.right
                child.parent = None
                child.marked = False
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
        
        self._detach(min_node)
        self.count -= 1
        return min_key
    
    def _detach(self, node):
        """Forget a node that left the heap: its handle is stale from now on."""
        node.in_heap = False
        node.parent = None
        node.child = None
        node.left = node
        node.right = node

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
        self.link_count += 1
    
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
    
    def _check_handle(self, node):
        """Reject a stale handle (a node that already left its heap) or None."""
        if node is None or not node.in_heap:
            raise ValueError("stale handle: the node is no longer in a heap")

    def decrease_key(self, node, new_key):
        """Lower the key of the node behind a handle.

        If the node now beats its parent, it is cut to the root list, and
        each marked ancestor is cut after it (cascading cut).

        Args:
            node: Handle returned by insert
            new_key: New key, at most the current one

        Raises:
            ValueError: If the handle is stale or new_key is larger
        """
        self._check_handle(node)
        if new_key > node.key:
            raise ValueError("new key is greater than the current key")
        node.key = new_key
        parent = node.parent
        if parent is not None and node.key < parent.key:
            self._cut(node, parent)
            self._cascading_cut(parent)
        if node.key < self.min_node.key:
            self.min_node = node

    def delete(self, node):
        """Remove the node behind a handle.

        Works as decrease_key to minus infinity followed by extract_min, but
        without a sentinel key: the node is cut like a decreased node and then
        made min_node directly.

        Args:
            node: Handle returned by insert

        Raises:
            ValueError: If the handle is stale
        """
        self._check_handle(node)
        parent = node.parent
        if parent is not None:
            self._cut(node, parent)
            self._cascading_cut(parent)
        self.min_node = node
        self.extract_min()

    def _cut(self, node, parent):
        """Move node (with its subtree) from parent's children to the root list."""
        if node.right is node:
            parent.child = None
        else:
            if parent.child is node:
                parent.child = node.right
            node.left.right = node.right
            node.right.left = node.left
        parent.degree -= 1
        self._add_to_root_list(node)
        node.parent = None
        node.marked = False
        self.cut_count += 1

    def _cascading_cut(self, node):
        """Walk up from a node that just lost a child.

        A non-root node that loses its first child is marked; a marked node
        that loses a second child is cut as well, and the walk goes on with
        its parent. Roots are never marked.
        """
        parent = node.parent
        while parent is not None:
            if not node.marked:
                node.marked = True
                return
            self._cut(node, parent)
            node = parent
            parent = node.parent

    def merge(self, other):
        """Move every node of other into this heap in O(1).

        The root list of other is spliced in right after min_node, and other
        is left empty. Handles from other stay valid and now belong to this
        heap.

        Args:
            other: Another FibonacciHeap

        Raises:
            ValueError: If other is this heap
        """
        if other is self:
            raise ValueError("cannot merge a heap with itself")
        if other.min_node is not None:
            if self.min_node is None:
                self.min_node = other.min_node
            else:
                first = other.min_node
                last = first.left
                after = self.min_node.right
                self.min_node.right = first
                first.left = self.min_node
                last.right = after
                after.left = last
                if first.key < self.min_node.key:
                    self.min_node = first
            self.count += other.count
        other.min_node = None
        other.count = 0

    def clear(self):
        """Remove all elements from heap; every handle becomes stale."""
        stack = [self.min_node] if self.min_node is not None else []
        while stack:
            start = stack.pop()
            ring = []
            current = start
            while True:
                ring.append(current)
                current = current.right
                if current is start:
                    break
            for node in ring:
                if node.child is not None:
                    stack.append(node.child)
                self._detach(node)
        self.min_node = None
        self.count = 0
