"""
Interval Tree Implementation

An Interval Tree is a data structure for storing intervals and efficiently
querying intervals that overlap with a given interval or point.
"""


class Interval:
    """Represents an interval [low, high]"""
    
    def __init__(self, low, high, data=None):
        if low > high:
            raise ValueError("low must be <= high")
        self.low = low
        self.high = high
        self.data = data
    
    def overlaps(self, other):
        """Check if this interval overlaps with another interval"""
        return not (self.high < other.low or other.high < self.low)
    
    def contains_point(self, point):
        """Check if this interval contains a point"""
        return self.low <= point <= self.high
    
    def __str__(self):
        return f"[{self.low}, {self.high}]"
    
    def __repr__(self):
        return f"Interval({self.low}, {self.high})"


class IntervalNode:
    """Node for Interval Tree"""
    
    def __init__(self, interval):
        self.interval = interval
        self.max = interval.high  # Maximum high value in subtree
        self.left = None
        self.right = None


class IntervalTree:
    """
    Interval Tree - Stores intervals and supports overlap queries
    
    Based on a balanced BST structure where:
    - Each node stores an interval
    - Nodes are sorted by low value
    - Each node stores max (maximum high value in subtree)
    """
    
    def __init__(self):
        self.root = None
    
    def insert(self, interval):
        """
        Insert an interval into the tree
        
        Time Complexity: O(log n) average
        """
        if not isinstance(interval, Interval):
            interval = Interval(interval[0], interval[1])
        
        self.root = self._insert_recursive(self.root, interval)
        self._update_max(self.root)
    
    def _insert_recursive(self, node, interval):
        """Recursive helper for insertion"""
        if node is None:
            return IntervalNode(interval)
        
        # Insert based on low value
        if interval.low < node.interval.low:
            node.left = self._insert_recursive(node.left, interval)
        else:
            node.right = self._insert_recursive(node.right, interval)
        
        # Update max value
        if interval.high > node.max:
            node.max = interval.high
        
        return node
    
    def _update_max(self, node):
        """Update max values in the tree"""
        if node is None:
            return
        
        self._update_max(node.left)
        self._update_max(node.right)
        
        node.max = node.interval.high
        if node.left is not None and node.left.max > node.max:
            node.max = node.left.max
        if node.right is not None and node.right.max > node.max:
            node.max = node.right.max
    
    def search_overlapping(self, query_interval):
        """
        Find all intervals that overlap with the query interval
        
        Time Complexity: O(log n + k) where k is number of results
        """
        if not isinstance(query_interval, Interval):
            query_interval = Interval(query_interval[0], query_interval[1])
        
        result = []
        self._search_overlapping_recursive(self.root, query_interval, result)
        return result
    
    def _search_overlapping_recursive(self, node, query_interval, result):
        """Recursive helper for overlap search"""
        if node is None:
            return
        
        # If current interval overlaps, add it
        if node.interval.overlaps(query_interval):
            result.append(node.interval)
        
        # If left child exists and might have overlapping intervals
        if node.left is not None and node.left.max >= query_interval.low:
            self._search_overlapping_recursive(node.left, query_interval, result)
        
        # If right child exists and might have overlapping intervals
        if node.right is not None and node.interval.low <= query_interval.high:
            self._search_overlapping_recursive(node.right, query_interval, result)
    
    def search_containing_point(self, point):
        """
        Find all intervals that contain a point
        
        Time Complexity: O(log n + k) where k is number of results
        """
        query_interval = Interval(point, point)
        return self.search_overlapping(query_interval)
    
    def search_contained_in(self, query_interval):
        """
        Find all intervals that are completely contained in query interval
        
        Time Complexity: O(log n + k) where k is number of results
        """
        if not isinstance(query_interval, Interval):
            query_interval = Interval(query_interval[0], query_interval[1])
        
        result = []
        self._search_contained_recursive(self.root, query_interval, result)
        return result
    
    def _search_contained_recursive(self, node, query_interval, result):
        """Recursive helper for contained search"""
        if node is None:
            return
        
        # Check if current interval is contained
        if query_interval.low <= node.interval.low and node.interval.high <= query_interval.high:
            result.append(node.interval)
        
        # Search left if possible
        if node.left is not None and node.left.max >= query_interval.low:
            self._search_contained_recursive(node.left, query_interval, result)
        
        # Search right if possible
        if node.right is not None and node.interval.low <= query_interval.high:
            self._search_contained_recursive(node.right, query_interval, result)
    
    def delete(self, interval):
        """
        Delete an interval from the tree
        
        Time Complexity: O(log n) average
        """
        if not isinstance(interval, Interval):
            interval = Interval(interval[0], interval[1])
        
        self.root = self._delete_recursive(self.root, interval)
        self._update_max(self.root)
    
    def _delete_recursive(self, node, interval):
        """Recursive helper for deletion"""
        if node is None:
            return None
        
        # Find the node to delete
        if interval.low < node.interval.low:
            node.left = self._delete_recursive(node.left, interval)
        elif interval.low > node.interval.low:
            node.right = self._delete_recursive(node.right, interval)
        else:
            # Found the node
            if node.interval.high != interval.high:
                # Same low but different high, continue searching
                node.right = self._delete_recursive(node.right, interval)
            else:
                # This is the node to delete
                if node.left is None:
                    return node.right
                elif node.right is None:
                    return node.left
                else:
                    # Node has two children
                    # Find inorder successor (minimum in right subtree)
                    successor = self._find_min(node.right)
                    node.interval = successor.interval
                    node.right = self._delete_recursive(node.right, successor.interval)
        
        return node
    
    def _find_min(self, node):
        """Find node with minimum low value"""
        while node.left is not None:
            node = node.left
        return node
    
    def inorder_traversal(self):
        """Inorder traversal of intervals"""
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        """Recursive helper for inorder traversal"""
        if node is not None:
            self._inorder_recursive(node.left, result)
            result.append(node.interval)
            self._inorder_recursive(node.right, result)
    
    def is_empty(self):
        """Check if tree is empty"""
        return self.root is None
    
    def size(self):
        """Get number of intervals in tree"""
        return self._size_recursive(self.root)
    
    def _size_recursive(self, node):
        """Recursive helper to count nodes"""
        if node is None:
            return 0
        return 1 + self._size_recursive(node.left) + self._size_recursive(node.right)

