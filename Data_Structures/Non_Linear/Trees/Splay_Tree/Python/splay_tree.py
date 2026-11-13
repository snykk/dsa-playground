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

        Returns the stored value or None if the key is absent.
        _search_node returns the closest visited node on a miss, so we
        splay that closest node to the root (a classic splay-tree
        optimization that improves locality) but still report None.

        Time Complexity: O(log n) amortized
        """
        node = self._search_node(key)
        if node is None:
            return None
        self._splay(node)
        if node.key == key:
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
        Delete a key via the classic split-merge approach.

        Splay the target to root, detach the two subtrees, then re-merge
        by splaying the max of the left subtree (which becomes the new
        root with an empty right child) and attaching the right subtree.

        Time Complexity: O(log n) amortized
        """
        node = self._search_node(key)
        if node is None:
            return False
        if node.key != key:
            # Miss: splay the last visited node so a failed delete still pays
            # for itself (amortized O(log n)).
            self._splay(node)
            return False

        # Step 1: Splay the doomed node to the root.
        self._splay(node)

        # Step 2: Detach the two subtrees. Clearing parent pointers is
        # critical - leaving them dangling causes search/splay to traverse
        # back into the deleted node and corrupt the tree.
        left_subtree = node.left
        right_subtree = node.right
        if left_subtree is not None:
            left_subtree.parent = None
        if right_subtree is not None:
            right_subtree.parent = None

        if left_subtree is None:
            self.root = right_subtree
        elif right_subtree is None:
            self.root = left_subtree
        else:
            # Step 3: Splay the maximum of the left subtree to its root.
            # _splay reads/writes self.root, so we temporarily promote the
            # left subtree to root before splaying inside it.
            self.root = left_subtree
            max_left = left_subtree
            while max_left.right is not None:
                max_left = max_left.right
            self._splay(max_left)
            # After splay, max_left is root of left subtree and has no
            # right child (because it was the maximum). Attach the right
            # subtree as its right child.
            max_left.right = right_subtree
            right_subtree.parent = max_left
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
        """Inorder traversal (returns sorted keys).

        Iterative: a splay tree is often a long path (sequential inserts), so
        recursion would overflow the Python stack.
        """
        result = []
        stack = []
        current = self.root
        while stack or current is not None:
            while current is not None:
                stack.append(current)
                current = current.left
            current = stack.pop()
            result.append(current.key)
            current = current.right
        return result

    def is_empty(self):
        """Check if tree is empty"""
        return self.root is None
    
    def size(self):
        """Get number of nodes in tree (iterative, see inorder_traversal)"""
        count = 0
        stack = [self.root] if self.root is not None else []
        while stack:
            node = stack.pop()
            count += 1
            if node.left is not None:
                stack.append(node.left)
            if node.right is not None:
                stack.append(node.right)
        return count
