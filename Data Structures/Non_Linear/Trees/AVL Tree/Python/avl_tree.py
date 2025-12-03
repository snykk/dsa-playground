from collections import deque

class AVLNode:
    """Node class for AVL Tree."""
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None
        self.height = 1  # Height of node (leaf has height 1)

class AVLTree:
    """AVL Tree (Self-Balancing Binary Search Tree) implementation.
    
    AVL Property: For each node, the height difference between left and right
    subtrees is at most 1 (balance factor: -1, 0, or 1).
    """
    
    def __init__(self):
        self.root = None

    def _height(self, node):
        """Get height of a node."""
        if node is None:
            return 0
        return node.height

    def _update_height(self, node):
        """Update height of a node based on children."""
        if node is not None:
            node.height = 1 + max(self._height(node.left), self._height(node.right))

    def _balance_factor(self, node):
        """Calculate balance factor of a node.
        
        Balance factor = height(left) - height(right)
        Should be -1, 0, or 1 for AVL property
        """
        if node is None:
            return 0
        return self._height(node.left) - self._height(node.right)

    def _rotate_right(self, y):
        """Right rotation.
        
            y                  x
           / \\                / \\
          x   T3    =>       T1  y
         / \\                    / \\
        T1  T2                 T2  T3
        """
        x = y.left
        T2 = x.right

        # Perform rotation
        x.right = y
        y.left = T2

        # Update heights
        self._update_height(y)
        self._update_height(x)

        return x

    def _rotate_left(self, x):
        """Left rotation.
        
        x                      y
         \\                    / \\
          y        =>        x   T3
         / \\                 \\  /
        T2  T3               T2
        """
        y = x.right
        T2 = y.left

        # Perform rotation
        y.left = x
        x.right = T2

        # Update heights
        self._update_height(x)
        self._update_height(y)

        return y

    def insert(self, data):
        """Insert data into the AVL tree maintaining AVL property.
        
        Args:
            data: The data to insert
        """
        self.root = self._insert_recursive(self.root, data)
    
    def _insert_recursive(self, node, data):
        """Helper method for recursive insertion with balancing."""
        # 1. Perform normal BST insertion
        if node is None:
            return AVLNode(data)
        
        if data < node.data:
            node.left = self._insert_recursive(node.left, data)
        elif data > node.data:
            node.right = self._insert_recursive(node.right, data)
        else:
            # Duplicate values not allowed
            return node

        # 2. Update height of ancestor node
        self._update_height(node)

        # 3. Get balance factor
        balance = self._balance_factor(node)

        # 4. If unbalanced, perform rotations
        
        # Left Left Case
        if balance > 1 and data < node.left.data:
            return self._rotate_right(node)
        
        # Right Right Case
        if balance < -1 and data > node.right.data:
            return self._rotate_left(node)
        
        # Left Right Case
        if balance > 1 and data > node.left.data:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)
        
        # Right Left Case
        if balance < -1 and data < node.right.data:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)

        return node

    def search(self, data):
        """Search for data in the AVL tree.
        
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
        """Delete data from the AVL tree maintaining AVL property.
        
        Args:
            data: The data to delete
        """
        self.root = self._delete_recursive(self.root, data)
    
    def _delete_recursive(self, node, data):
        """Helper method for recursive deletion with balancing."""
        # 1. Perform standard BST delete
        if node is None:
            return node
        
        if data < node.data:
            node.left = self._delete_recursive(node.left, data)
        elif data > node.data:
            node.right = self._delete_recursive(node.right, data)
        else:
            # Node to delete found
            if node.left is None:
                return node.right
            elif node.right is None:
                return node.left
            else:
                # Node with two children: get inorder successor
                successor = self._find_min(node.right)
                node.data = successor.data
                node.right = self._delete_recursive(node.right, successor.data)

        # 2. Update height
        self._update_height(node)

        # 3. Get balance factor
        balance = self._balance_factor(node)

        # 4. If unbalanced, perform rotations
        
        # Left Left Case
        if balance > 1 and self._balance_factor(node.left) >= 0:
            return self._rotate_right(node)
        
        # Left Right Case
        if balance > 1 and self._balance_factor(node.left) < 0:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)
        
        # Right Right Case
        if balance < -1 and self._balance_factor(node.right) <= 0:
            return self._rotate_left(node)
        
        # Right Left Case
        if balance < -1 and self._balance_factor(node.right) > 0:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)

        return node

    def _find_min(self, node):
        """Find minimum node in subtree."""
        while node.left is not None:
            node = node.left
        return node

    def find_min(self):
        """Find the minimum value in the AVL tree.
        
        Returns:
            Minimum value, or None if tree is empty
        """
        if self.root is None:
            return None
        min_node = self._find_min(self.root)
        return min_node.data

    def find_max(self):
        """Find the maximum value in the AVL tree.
        
        Returns:
            Maximum value, or None if tree is empty
        """
        if self.root is None:
            return None
        max_node = self._find_max(self.root)
        return max_node.data
    
    def _find_max(self, node):
        """Find maximum node in subtree."""
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
        """Calculate the height of the AVL tree.
        
        Returns:
            Height of the tree
        """
        return self._height(self.root)

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

    def is_balanced(self):
        """Check if the tree maintains AVL property.
        
        Returns:
            True if balanced, False otherwise
        """
        return self._is_balanced_recursive(self.root)
    
    def _is_balanced_recursive(self, node):
        """Helper method to check AVL property."""
        if node is None:
            return True
        
        balance = self._balance_factor(node)
        if abs(balance) > 1:
            return False
        
        return self._is_balanced_recursive(node.left) and \
               self._is_balanced_recursive(node.right)

