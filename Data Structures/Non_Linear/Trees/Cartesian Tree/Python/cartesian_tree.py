"""
Cartesian Tree Implementation

A Cartesian Tree is a binary tree derived from a sequence of numbers.
It has two properties:
1. Min-heap property: parent < children
2. Inorder traversal produces the original sequence
"""


class CartesianNode:
    """Node for Cartesian Tree"""
    
    def __init__(self, value, index=0):
        self.value = value
        self.index = index
        self.left = None
        self.right = None


class CartesianTree:
    """
    Cartesian Tree - Binary tree with min-heap property
    
    Built from an array such that:
    - Inorder traversal gives the original array
    - Min-heap property: parent value < children values
    """
    
    def __init__(self, array=None):
        self.root = None
        self.original_array = []  # Store original array for range queries
        if array is not None:
            self.build_from_array(array)
    
    def build_from_array(self, array):
        """
        Build Cartesian Tree from array using stack-based approach
        
        Time Complexity: O(n)
        """
        self.original_array = array.copy() if array else []
        if not array:
            self.root = None
            return
        
        stack = []
        
        for i, value in enumerate(array):
            node = CartesianNode(value, i)
            
            # Pop nodes from stack until we find a node with smaller value
            # or stack is empty
            last_popped = None
            while stack and stack[-1].value > value:
                last_popped = stack.pop()
            
            # If we popped something, make current node its parent
            if last_popped is not None:
                node.left = last_popped
            
            # If stack is not empty, make current node right child of top
            if stack:
                stack[-1].right = node
            
            stack.append(node)
        
        # Root is the bottom of the stack
        self.root = stack[0] if stack else None
    
    def get_min_index(self, left, right):
        """
        Find index of minimum value in range [left, right]
        using Cartesian Tree structure
        
        Time Complexity: O(log n) average
        """
        if self.root is None or left < 0 or right >= len(self.original_array):
            return -1
        
        return self._find_min_in_range(self.root, left, right)
    
    def _find_min_in_range(self, node, left, right):
        """Helper to find minimum in range"""
        if node is None:
            return -1
        
        # If current node is in range, it's a candidate
        if left <= node.index <= right:
            candidate = node.index
        else:
            candidate = -1
        
        # Check left subtree if it might contain range
        if node.left is not None and node.index > left:
            left_candidate = self._find_min_in_range(node.left, left, right)
            if left_candidate != -1:
                if candidate == -1 or self._get_value_at_index(candidate) > self._get_value_at_index(left_candidate):
                    candidate = left_candidate
        
        # Check right subtree if it might contain range
        if node.right is not None and node.index < right:
            right_candidate = self._find_min_in_range(node.right, left, right)
            if right_candidate != -1:
                if candidate == -1 or self._get_value_at_index(candidate) > self._get_value_at_index(right_candidate):
                    candidate = right_candidate
        
        return candidate
    
    def _get_value_at_index(self, index):
        """Helper to get value at index"""
        if 0 <= index < len(self.original_array):
            return self.original_array[index]
        return None
    
    def _find_node_by_index(self, node, index):
        """Find node by its index"""
        if node is None:
            return None
        if node.index == index:
            return node
        if index < node.index:
            return self._find_node_by_index(node.left, index)
        else:
            return self._find_node_by_index(node.right, index)
    
    def inorder_traversal(self):
        """
        Inorder traversal returns original array sequence
        
        Time Complexity: O(n)
        """
        result = []
        self._inorder_recursive(self.root, result)
        return result
    
    def _inorder_recursive(self, node, result):
        """Recursive helper for inorder traversal"""
        if node is not None:
            self._inorder_recursive(node.left, result)
            result.append(node.value)
            self._inorder_recursive(node.right, result)
    
    def preorder_traversal(self):
        """Preorder traversal"""
        result = []
        self._preorder_recursive(self.root, result)
        return result
    
    def _preorder_recursive(self, node, result):
        """Recursive helper for preorder traversal"""
        if node is not None:
            result.append(node.value)
            self._preorder_recursive(node.left, result)
            self._preorder_recursive(node.right, result)
    
    def postorder_traversal(self):
        """Postorder traversal"""
        result = []
        self._postorder_recursive(self.root, result)
        return result
    
    def _postorder_recursive(self, node, result):
        """Recursive helper for postorder traversal"""
        if node is not None:
            self._postorder_recursive(node.left, result)
            self._postorder_recursive(node.right, result)
            result.append(node.value)
    
    def is_empty(self):
        """Check if tree is empty"""
        return self.root is None
    
    def height(self):
        """Get height of the tree"""
        return self._height_recursive(self.root)
    
    def _height_recursive(self, node):
        """Recursive helper to calculate height"""
        if node is None:
            return -1
        return 1 + max(self._height_recursive(node.left), 
                      self._height_recursive(node.right))
    
    def size(self):
        """Get number of nodes in tree"""
        return self._size_recursive(self.root)
    
    def _size_recursive(self, node):
        """Recursive helper to count nodes"""
        if node is None:
            return 0
        return 1 + self._size_recursive(node.left) + self._size_recursive(node.right)

