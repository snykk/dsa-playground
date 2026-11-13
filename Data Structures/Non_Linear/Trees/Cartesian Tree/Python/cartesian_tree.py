"""
Cartesian Tree Implementation

A Cartesian Tree is a binary tree derived from a sequence of numbers.
It has two properties:
1. Min-heap property: parent <= children (equal values: the later one is the descendant)
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
    - Min-heap property: parent value <= children values
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
        Index of the minimum value in array[left..right] (leftmost one on ties).

        The answer is the lowest common ancestor of the nodes at index left and
        index right. Starting at the root, go right while the node is left of
        the range and left while it is right of the range; the first node whose
        index lies inside [left, right] is the LCA, and by the heap order it is
        the minimum of the whole range.

        Returns -1 for an empty tree or an invalid range.

        Time Complexity: O(h), at most the height of the tree (O(n) worst case)
        """
        if self.root is None or left < 0 or right >= len(self.original_array) or left > right:
            return -1
        node = self.root
        while True:
            if node.index < left:
                node = node.right
            elif node.index > right:
                node = node.left
            else:
                return node.index

    def inorder_traversal(self):
        """
        Inorder traversal returns original array sequence (iterative, so a
        degenerate tree from sorted input does not hit the recursion limit)

        Time Complexity: O(n)
        """
        result = []
        stack = []
        node = self.root
        while stack or node is not None:
            while node is not None:
                stack.append(node)
                node = node.left
            node = stack.pop()
            result.append(node.value)
            node = node.right
        return result

    def preorder_traversal(self):
        """Preorder traversal (iterative)"""
        result = []
        stack = [self.root] if self.root is not None else []
        while stack:
            node = stack.pop()
            result.append(node.value)
            if node.right is not None:
                stack.append(node.right)
            if node.left is not None:
                stack.append(node.left)
        return result

    def postorder_traversal(self):
        """Postorder traversal (iterative)"""
        result = []
        stack = [self.root] if self.root is not None else []
        while stack:
            node = stack.pop()
            result.append(node.value)
            if node.left is not None:
                stack.append(node.left)
            if node.right is not None:
                stack.append(node.right)
        result.reverse()
        return result

    def is_empty(self):
        """Check if tree is empty"""
        return self.root is None

    def height(self):
        """Height in edges: -1 for an empty tree, 0 for a single node"""
        height = -1
        level = [self.root] if self.root is not None else []
        while level:
            height += 1
            level = [c for n in level for c in (n.left, n.right) if c is not None]
        return height

    def size(self):
        """Get number of nodes in tree"""
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
