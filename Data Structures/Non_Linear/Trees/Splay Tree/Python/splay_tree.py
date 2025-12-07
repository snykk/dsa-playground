"""
Splay Tree Implementation

A self-adjusting binary search tree that moves recently accessed elements
to the root through rotations (splaying).
"""


class SplayNode:
    """Node for Splay Tree"""
    
    def __init__(self, key, value=None):
        self.key = key
        self.value = value
        self.left = None
        self.right = None
        self.parent = None


class SplayTree:
    """
    Splay Tree - Self-Adjusting Binary Search Tree
    
    Operations automatically move accessed nodes to the root,
    improving access time for frequently used elements.
    """
    
    def __init__(self):
        self.root = None
    
    def _right_rotate(self, x):
        """Right rotation around node x"""
        y = x.left
        if y is None:
            return
        
        x.left = y.right
        if y.right is not None:
            y.right.parent = x
        
        y.parent = x.parent
        if x.parent is None:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        
        y.right = x
        x.parent = y
    
    def _left_rotate(self, x):
        """Left rotation around node x"""
        y = x.right
        if y is None:
            return
        
        x.right = y.left
        if y.left is not None:
            y.left.parent = x
        
        y.parent = x.parent
        if x.parent is None:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        
        y.left = x
        x.parent = y
    
    def _splay(self, node):
        """Splay operation: move node to root"""
        while node.parent is not None:
            parent = node.parent
            grandparent = parent.parent
            
            if grandparent is None:
                # Zig case
                if node == parent.left:
                    self._right_rotate(parent)
                else:
                    self._left_rotate(parent)
            elif node == parent.left and parent == grandparent.left:
                # Zig-Zig case (left-left)
                self._right_rotate(grandparent)
                self._right_rotate(parent)
            elif node == parent.right and parent == grandparent.right:
                # Zig-Zig case (right-right)
                self._left_rotate(grandparent)
                self._left_rotate(parent)
            elif node == parent.right and parent == grandparent.left:
                # Zig-Zag case (left-right)
                self._left_rotate(parent)
                self._right_rotate(grandparent)
            else:
                # Zig-Zag case (right-left)
                self._right_rotate(parent)
                self._left_rotate(grandparent)
    
    def search(self, key):
        """
        Search for a key and splay it to root
        
        Time Complexity: O(log n) amortized
        """
        node = self._search_node(key)
        if node is not None:
            self._splay(node)
            return node.value
        return None
    
    def _search_node(self, key):
        """Internal method to find a node without splaying"""
        current = self.root
        while current is not None:
            if key == current.key:
                return current
            elif key < current.key:
                if current.left is None:
                    return current  # Return closest node
                current = current.left
            else:
                if current.right is None:
                    return current  # Return closest node
                current = current.right
        return None
    
    def insert(self, key, value=None):
        """
        Insert a key-value pair and splay to root
        
        Time Complexity: O(log n) amortized
        """
        if self.root is None:
            self.root = SplayNode(key, value)
            return
        
        # Find insertion point
        current = self.root
        parent = None
        
        while current is not None:
            parent = current
            if key == current.key:
                # Key exists, update value and splay
                current.value = value
                self._splay(current)
                return
            elif key < current.key:
                current = current.left
            else:
                current = current.right
        
        # Insert new node
        new_node = SplayNode(key, value)
        new_node.parent = parent
        
        if key < parent.key:
            parent.left = new_node
        else:
            parent.right = new_node
        
        # Splay the new node to root
        self._splay(new_node)
    
    def delete(self, key):
        """
        Delete a key and splay parent to root
        
        Time Complexity: O(log n) amortized
        """
        node = self._search_node(key)
        if node is None or node.key != key:
            return False
        
        # Splay the node to root
        self._splay(node)
        
        # If node has no children
        if node.left is None and node.right is None:
            self.root = None
        # If node has only right child
        elif node.left is None:
            self.root = node.right
            self.root.parent = None
        # If node has only left child
        elif node.right is None:
            self.root = node.left
            self.root.parent = None
        # If node has both children
        else:
            # Find maximum in left subtree
            max_left = node.left
            while max_left.right is not None:
                max_left = max_left.right
            
            # Splay max_left to root of left subtree
            if max_left.parent != node:
                self._splay(max_left)
                max_left.parent = None
            
            # Attach right subtree to max_left
            max_left.right = node.right
            if node.right is not None:
                node.right.parent = max_left
            
            self.root = max_left
        
        return True
    
    def find_min(self):
        """Find minimum key"""
        if self.root is None:
            return None
        
        current = self.root
        while current.left is not None:
            current = current.left
        
        self._splay(current)
        return current.key
    
    def find_max(self):
        """Find maximum key"""
        if self.root is None:
            return None
        
        current = self.root
        while current.right is not None:
            current = current.right
        
        self._splay(current)
        return current.key
    
    def inorder_traversal(self):
        """Inorder traversal (returns sorted keys)"""
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        """Recursive helper for inorder traversal"""
        if node is not None:
            self._inorder_recursive(node.left, result)
            result.append(node.key)
            self._inorder_recursive(node.right, result)
    
    def is_empty(self):
        """Check if tree is empty"""
        return self.root is None
    
    def size(self):
        """Get number of nodes in tree"""
        return self._size_recursive(self.root)
    
    def _size_recursive(self, node):
        """Recursive helper to count nodes"""
        if node is None:
            return 0
        return 1 + self._size_recursive(node.left) + self._size_recursive(node.right)

