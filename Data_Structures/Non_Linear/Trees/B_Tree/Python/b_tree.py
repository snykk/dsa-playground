class BTreeNode:
    """Node class for B-Tree."""
    def __init__(self, is_leaf=False):
        self.keys = []
        self.children = []
        self.is_leaf = is_leaf

class BTree:
    """B-Tree implementation.
    
    A B-Tree is a self-balancing tree data structure that maintains sorted data
    and allows searches, sequential access, insertions, and deletions in O(log n).
    B-Trees are commonly used in databases and file systems.
    """
    
    def __init__(self, min_degree=3):
        """Initialize B-Tree.
        
        Args:
            min_degree: Minimum degree (t). Node can have at most 2t-1 keys
        """
        self.root = BTreeNode(is_leaf=True)
        self.min_degree = min_degree
        self.max_keys = 2 * min_degree - 1
        self.min_keys = min_degree - 1

    def search(self, key):
        """Search for a key in the B-Tree.
        
        Args:
            key: The key to search for
            
        Returns:
            Tuple (node, index) if found, None otherwise
        """
        return self._search_recursive(self.root, key)

    def _search_recursive(self, node, key):
        """Recursive search helper."""
        i = 0
        while i < len(node.keys) and key > node.keys[i]:
            i += 1
        
        if i < len(node.keys) and node.keys[i] == key:
            return (node, i)
        
        if node.is_leaf:
            return None
        
        return self._search_recursive(node.children[i], key)

    def insert(self, key):
        """Insert a key into the B-Tree.
        
        Args:
            key: The key to insert
        """
        root = self.root
        
        # If root is full, split it
        if len(root.keys) == self.max_keys:
            new_root = BTreeNode(is_leaf=False)
            new_root.children.append(root)
            self._split_child(new_root, 0)
            self.root = new_root
        
        self._insert_non_full(self.root, key)

    def _insert_non_full(self, node, key):
        """Insert key into non-full node."""
        i = len(node.keys) - 1
        
        if node.is_leaf:
            # Insert key into leaf node
            node.keys.append(0)
            while i >= 0 and node.keys[i] > key:
                node.keys[i + 1] = node.keys[i]
                i -= 1
            node.keys[i + 1] = key
        else:
            # Find child to insert into
            while i >= 0 and node.keys[i] > key:
                i -= 1
            i += 1
            
            # If child is full, split it
            if len(node.children[i].keys) == self.max_keys:
                self._split_child(node, i)
                if node.keys[i] < key:
                    i += 1
            
            self._insert_non_full(node.children[i], key)

    def _split_child(self, parent, index):
        """Split a full child node."""
        full_child = parent.children[index]
        new_child = BTreeNode(is_leaf=full_child.is_leaf)
        
        # Move keys
        mid = self.min_keys
        # Save middle key before modifying full_child
        middle_key = full_child.keys[mid]
        
        new_child.keys = full_child.keys[mid + 1:]
        full_child.keys = full_child.keys[:mid]
        
        # Move children if not leaf
        if not full_child.is_leaf:
            new_child.children = full_child.children[mid + 1:]
            full_child.children = full_child.children[:mid + 1]
        
        # Insert middle key into parent
        parent.keys.insert(index, middle_key)
        parent.children.insert(index + 1, new_child)

    def delete(self, key):
        """Delete a key from the B-Tree.
        
        Args:
            key: The key to delete
        """
        self._delete_recursive(self.root, key)
        
        # If root becomes empty, make first child the new root
        if len(self.root.keys) == 0 and not self.root.is_leaf:
            self.root = self.root.children[0]

    def _delete_recursive(self, node, key):
        """Recursive delete helper."""
        i = 0
        while i < len(node.keys) and node.keys[i] < key:
            i += 1
        
        # Key found in this node
        if i < len(node.keys) and node.keys[i] == key:
            if node.is_leaf:
                # Case 1: Key in leaf node
                node.keys.pop(i)
            else:
                # Case 2: Key in internal node
                self._delete_internal_node(node, i)
        else:
            # Key not in this node
            if node.is_leaf:
                return  # Key doesn't exist
            
            # Ensure child has at least min_keys
            if len(node.children[i].keys) == self.min_keys:
                self._fill_child(node, i)
            
            # After fill, the last child may have merged into its left sibling
            if i > len(node.keys):
                i -= 1
            
            self._delete_recursive(node.children[i], key)

    def _delete_internal_node(self, node, index):
        """Delete key from internal node."""
        key = node.keys[index]
        
        # Case 2a: Left child has more than min_keys
        if len(node.children[index].keys) > self.min_keys:
            predecessor = self._get_predecessor(node.children[index])
            node.keys[index] = predecessor
            self._delete_recursive(node.children[index], predecessor)
        # Case 2b: Right child has more than min_keys
        elif len(node.children[index + 1].keys) > self.min_keys:
            successor = self._get_successor(node.children[index + 1])
            node.keys[index] = successor
            self._delete_recursive(node.children[index + 1], successor)
        # Case 2c: Both children have min_keys, merge them
        else:
            self._merge_children(node, index)
            self._delete_recursive(node.children[index], key)

    def _get_predecessor(self, node):
        """Get predecessor (rightmost key in left subtree)."""
        while not node.is_leaf:
            node = node.children[-1]
        return node.keys[-1]

    def _get_successor(self, node):
        """Get successor (leftmost key in right subtree)."""
        while not node.is_leaf:
            node = node.children[0]
        return node.keys[0]

    def _fill_child(self, parent, index):
        """Fill child that has min_keys."""
        # Borrow from left sibling
        if index > 0 and len(parent.children[index - 1].keys) > self.min_keys:
            self._borrow_from_left(parent, index)
        # Borrow from right sibling
        elif (index < len(parent.children) - 1 and 
              len(parent.children[index + 1].keys) > self.min_keys):
            self._borrow_from_right(parent, index)
        # Merge with the right sibling; the last child merges with its left one
        else:
            if index < len(parent.keys):
                self._merge_children(parent, index)
            else:
                self._merge_children(parent, index - 1)

    def _borrow_from_left(self, parent, index):
        """Borrow key from left sibling."""
        child = parent.children[index]
        sibling = parent.children[index - 1]
        
        # Move key from parent to child
        child.keys.insert(0, parent.keys[index - 1])
        
        # Move key from sibling to parent
        parent.keys[index - 1] = sibling.keys.pop()
        
        # Move child pointer if not leaf
        if not child.is_leaf:
            child.children.insert(0, sibling.children.pop())

    def _borrow_from_right(self, parent, index):
        """Borrow key from right sibling."""
        child = parent.children[index]
        sibling = parent.children[index + 1]
        
        # Move key from parent to child
        child.keys.append(parent.keys[index])
        
        # Move key from sibling to parent
        parent.keys[index] = sibling.keys.pop(0)
        
        # Move child pointer if not leaf
        if not child.is_leaf:
            child.children.append(sibling.children.pop(0))

    def _merge_children(self, parent, index):
        """Merge child with right sibling."""
        left_child = parent.children[index]
        right_child = parent.children[index + 1]
        
        # Move key from parent to left child
        left_child.keys.append(parent.keys.pop(index))
        
        # Move all keys from right child to left child
        left_child.keys.extend(right_child.keys)
        
        # Move all children from right child to left child
        if not left_child.is_leaf:
            left_child.children.extend(right_child.children)
        
        # Remove right child
        parent.children.pop(index + 1)

    def traverse(self):
        """Traverse the B-Tree in-order.
        
        Returns:
            List of keys in sorted order
        """
        result = []
        self._traverse_recursive(self.root, result)
        return result

    def _traverse_recursive(self, node, result):
        """Recursive traverse helper."""
        for i in range(len(node.keys)):
            if not node.is_leaf:
                self._traverse_recursive(node.children[i], result)
            result.append(node.keys[i])
        if not node.is_leaf:
            self._traverse_recursive(node.children[-1], result)

