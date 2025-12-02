from collections import deque

class TreeNode:
    """Node class for Binary Tree."""
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None

class BinaryTree:
    """Binary Tree implementation."""
    
    def __init__(self):
        self.root = None

    def insert(self, data):
        """Insert data into the binary tree using level-order insertion.
        
        Args:
            data: The data to insert
        """
        if self.root is None:
            self.root = TreeNode(data)
            return
        
        queue = deque([self.root])
        while queue:
            node = queue.popleft()
            
            if node.left is None:
                node.left = TreeNode(data)
                return
            elif node.right is None:
                node.right = TreeNode(data)
                return
            else:
                queue.append(node.left)
                queue.append(node.right)

    def search(self, data):
        """Search for data in the binary tree.
        
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
        return self._search_recursive(node.left, data) or \
               self._search_recursive(node.right, data)

    def inorder_traversal(self):
        """Perform inorder traversal (Left, Root, Right).
        
        Returns:
            List of nodes in inorder sequence
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
        """Calculate the height of the binary tree.
        
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

