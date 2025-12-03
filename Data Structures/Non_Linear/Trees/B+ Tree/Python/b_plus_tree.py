class BPlusTreeNode:
    """Node class for B+ Tree."""
    def __init__(self, is_leaf=False):
        self.keys = []
        self.children = []  # For internal nodes
        self.values = []  # For leaf nodes
        self.is_leaf = is_leaf
        self.next = None  # Pointer to next leaf (for sequential access)

class BPlusTree:
    """B+ Tree implementation.
    
    A B+ Tree is a variant of B-Tree where:
    - All data is stored in leaf nodes
    - Internal nodes only store keys for navigation
    - Leaf nodes are linked for sequential access
    - Better for range queries and database indexing
    """
    
    def __init__(self, min_degree=3):
        """Initialize B+ Tree.
        
        Args:
            min_degree: Minimum degree (t). Node can have at most 2t-1 keys
        """
        self.root = BPlusTreeNode(is_leaf=True)
        self.min_degree = min_degree
        self.max_keys = 2 * min_degree - 1
        self.min_keys = min_degree - 1

    def search(self, key):
        """Search for a key in the B+ Tree.
        
        Args:
            key: The key to search for
            
        Returns:
            Value if found, None otherwise
        """
        leaf = self._find_leaf(key)
        if leaf:
            for i, k in enumerate(leaf.keys):
                if k == key:
                    return leaf.values[i]
        return None

    def _find_leaf(self, key):
        """Find the leaf node that should contain the key."""
        node = self.root
        while not node.is_leaf:
            i = 0
            while i < len(node.keys) and key >= node.keys[i]:
                i += 1
            node = node.children[i]
        return node

    def insert(self, key, value):
        """Insert a key-value pair into the B+ Tree.
        
        Args:
            key: The key to insert
            value: The value associated with the key
        """
        root = self.root
        
        # If root is full, split it
        if len(root.keys) == self.max_keys:
            new_root = BPlusTreeNode(is_leaf=False)
            new_root.children.append(root)
            self._split_child(new_root, 0)
            self.root = new_root
        
        self._insert_non_full(self.root, key, value)

    def _insert_non_full(self, node, key, value):
        """Insert key-value into non-full node."""
        if node.is_leaf:
            # Insert into leaf node
            i = 0
            while i < len(node.keys) and node.keys[i] < key:
                i += 1
            
            node.keys.insert(i, key)
            node.values.insert(i, value)
        else:
            # Find child to insert into
            i = 0
            while i < len(node.keys) and key >= node.keys[i]:
                i += 1
            
            # If child is full, split it
            if len(node.children[i].keys) == self.max_keys:
                self._split_child(node, i)
                if key >= node.keys[i]:
                    i += 1
            
            self._insert_non_full(node.children[i], key, value)

    def _split_child(self, parent, index):
        """Split a full child node."""
        full_child = parent.children[index]
        new_child = BPlusTreeNode(is_leaf=full_child.is_leaf)
        
        mid = self.min_keys
        
        if full_child.is_leaf:
            # Split leaf node
            new_child.keys = full_child.keys[mid:]
            new_child.values = full_child.values[mid:]
            full_child.keys = full_child.keys[:mid]
            full_child.values = full_child.values[:mid]
            
            # Link leaf nodes
            new_child.next = full_child.next
            full_child.next = new_child
            
            # Promote first key of new child to parent
            promote_key = new_child.keys[0]
        else:
            # Split internal node
            new_child.keys = full_child.keys[mid + 1:]
            new_child.children = full_child.children[mid + 1:]
            promote_key = full_child.keys[mid]
            full_child.keys = full_child.keys[:mid]
            full_child.children = full_child.children[:mid + 1]
        
        # Insert promote_key into parent
        parent.keys.insert(index, promote_key)
        parent.children.insert(index + 1, new_child)

    def range_search(self, start_key, end_key):
        """Search for all keys in the range [start_key, end_key].
        
        Args:
            start_key: Start of range (inclusive)
            end_key: End of range (inclusive)
            
        Returns:
            List of (key, value) tuples in range
        """
        result = []
        leaf = self._find_leaf(start_key)
        
        while leaf:
            for i, key in enumerate(leaf.keys):
                if start_key <= key <= end_key:
                    result.append((key, leaf.values[i]))
                elif key > end_key:
                    return result
            leaf = leaf.next
        
        return result

    def traverse(self):
        """Traverse all keys in sorted order.
        
        Returns:
            List of (key, value) tuples
        """
        result = []
        leaf = self._find_leaf(float('-inf'))
        
        while leaf:
            for i in range(len(leaf.keys)):
                result.append((leaf.keys[i], leaf.values[i]))
            leaf = leaf.next
        
        return result

