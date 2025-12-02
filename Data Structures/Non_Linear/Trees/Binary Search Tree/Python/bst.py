from collections import deque

class TreeNode:
    """Node class for Binary Search Tree."""
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BinarySearchTree:
    """Binary Search Tree (BST) implementation.
    
    BST Property: For each node, all values in left subtree < node.data < all values in right subtree
    """
    
    def __init__(self):
        self.root = None

    def insert(self, data):
        """Insert data into the BST maintaining BST property.
        
        Args:
            data: The data to insert
        """
        self.root = self._insert_recursive(self.root, data)
    
    def _insert_recursive(self, node, data):
        """Helper method for recursive insertion."""
        if node is None:
            return TreeNode(data)
        
        if data < node.data:
            node.left = self._insert_recursive(node.left, data)
        elif data > node.data:
            node.right = self._insert_recursive(node.right, data)
        # If data == node.data, we don't insert duplicates (or can be modified)
        
        return node

    def search(self, data):
        """Search for data in the BST.
        
        Args:
            data: The data to search for
            
        Returns:
            True if found, False otherwise
        """
        return self._search_recursive(self.root, data)
    
    def _search_recursive(self, node, data):
        """Helper method for recursive search."""
        if node is None:
            return False
        if node.data == data:
            return True
        if data < node.data:
            return self._search_recursive(node.left, data)
        else:
            return self._search_recursive(node.right, data)

    def delete(self, data):
        """Delete data from the BST.
        
        Args:
            data: The data to delete
        """
        self.root = self._delete_recursive(self.root, data)
    
    def _delete_recursive(self, node, data):
        """Helper method for recursive deletion."""
        if node is None:
            return None
        
        if data < node.data:
            node.left = self._delete_recursive(node.left, data)
        elif data > node.data:
            node.right = self._delete_recursive(node.right, data)
        else:
            # Node to delete found
            # Case 1: No child
            if node.left is None and node.right is None:
                return None
            # Case 2: One child
            elif node.left is None:
                return node.right
            elif node.right is None:
                return node.left
            # Case 3: Two children - find inorder successor
            else:
                successor = self._find_min(node.right)
                node.data = successor.data
                node.right = self._delete_recursive(node.right, successor.data)
        
        return node

    def find_min(self):
        """Find the minimum value in the BST.
        
        Returns:
            Minimum value, or None if tree is empty
        """
        if self.root is None:
            return None
        min_node = self._find_min(self.root)
        return min_node.data
    
    def _find_min(self, node):
        """Helper method to find minimum node."""
        while node.left is not None:
            node = node.left
        return node

    def find_max(self):
        """Find the maximum value in the BST.
        
        Returns:
            Maximum value, or None if tree is empty
        """
        if self.root is None:
            return None
        max_node = self._find_max(self.root)
        return max_node.data
    
    def _find_max(self, node):
        """Helper method to find maximum node."""
        while node.right is not None:
            node = node.right
        return node

    def inorder_traversal(self):
        """Perform inorder traversal (Left, Root, Right) - produces sorted order.
        
        Returns:
            List of nodes in inorder sequence (sorted)
        """
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        """Helper method for recursive inorder traversal."""
        if node:
            self._inorder_recursive(node.left, result)
            result.append(node.data)
            self._inorder_recursive(node.right, result)

    def preorder_traversal(self):
        """Perform preorder traversal (Root, Left, Right).
        
        Returns:
            List of nodes in preorder sequence
        """
        result = []
        self._preorder_recursive(self.root, result)
        return result
    
    def _preorder_recursive(self, node, result):
        """Helper method for recursive preorder traversal."""
        if node:
            result.append(node.data)
            self._preorder_recursive(node.left, result)
            self._preorder_recursive(node.right, result)

    def postorder_traversal(self):
        """Perform postorder traversal (Left, Right, Root).
        
        Returns:
            List of nodes in postorder sequence
        """
        result = []
        self._postorder_recursive(self.root, result)
        return result
    
    def _postorder_recursive(self, node, result):
        """Helper method for recursive postorder traversal."""
        if node:
            self._postorder_recursive(node.left, result)
            self._postorder_recursive(node.right, result)
            result.append(node.data)

    def level_order_traversal(self):
        """Perform level-order (breadth-first) traversal.
        
        Returns:
            List of nodes in level-order sequence
        """
        if self.root is None:
            return []
        
        result = []
        queue = deque([self.root])
        
        while queue:
            node = queue.popleft()
            result.append(node.data)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        return result

    def height(self):
        """Calculate the height of the BST.
        
        Returns:
            Height of the tree (number of edges from root to deepest leaf)
        """
        return self._height_recursive(self.root)
    
    def _height_recursive(self, node):
        """Helper method for recursive height calculation."""
        if node is None:
            return -1
        return 1 + max(self._height_recursive(node.left),
                      self._height_recursive(node.right))

    def size(self):
        """Get the total number of nodes in the tree.
        
        Returns:
            Number of nodes
        """
        return self._size_recursive(self.root)
    
    def _size_recursive(self, node):
        """Helper method for recursive size calculation."""
        if node is None:
            return 0
        return 1 + self._size_recursive(node.left) + \
               self._size_recursive(node.right)

    def is_empty(self):
        """Check if the tree is empty.
        
        Returns:
            True if empty, False otherwise
        """
        return self.root is None

