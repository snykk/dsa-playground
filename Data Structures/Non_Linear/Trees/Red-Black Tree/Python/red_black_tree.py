from collections import deque

class Color:
    RED = 0
    BLACK = 1

class RBNode:
    """Node class for Red-Black Tree."""
    def __init__(self, data, color=Color.RED):
        self.data = data
        self.left = None
        self.right = None
        self.parent = None
        self.color = color  # 0 = RED, 1 = BLACK

class RedBlackTree:
    """Red-Black Tree (Self-Balancing Binary Search Tree) implementation.
    
    Red-Black Tree Properties:
    1. Every node is either RED or BLACK
    2. Root is always BLACK
    3. Every leaf (NIL) is BLACK
    4. If a node is RED, both children are BLACK
    5. Every path from node to descendant leaf has same number of BLACK nodes
    """
    
    def __init__(self):
        self.NIL = RBNode(0, Color.BLACK)  # Sentinel node
        self.root = self.NIL

    def _left_rotate(self, x):
        """Left rotation."""
        y = x.right
        x.right = y.left
        if y.left != self.NIL:
            y.left.parent = x
        y.parent = x.parent
        if x.parent == self.NIL:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def _right_rotate(self, y):
        """Right rotation."""
        x = y.left
        y.left = x.right
        if x.right != self.NIL:
            x.right.parent = y
        x.parent = y.parent
        if y.parent == self.NIL:
            self.root = x
        elif y == y.parent.left:
            y.parent.left = x
        else:
            y.parent.right = x
        x.right = y
        y.parent = x

    def _insert_fixup(self, z):
        """Fix Red-Black Tree properties after insertion."""
        while z.parent.color == Color.RED:
            if z.parent == z.parent.parent.left:
                y = z.parent.parent.right
                if y.color == Color.RED:
                    z.parent.color = Color.BLACK
                    y.color = Color.BLACK
                    z.parent.parent.color = Color.RED
                    z = z.parent.parent
                else:
                    if z == z.parent.right:
                        z = z.parent
                        self._left_rotate(z)
                    z.parent.color = Color.BLACK
                    z.parent.parent.color = Color.RED
                    self._right_rotate(z.parent.parent)
            else:
                y = z.parent.parent.left
                if y.color == Color.RED:
                    z.parent.color = Color.BLACK
                    y.color = Color.BLACK
                    z.parent.parent.color = Color.RED
                    z = z.parent.parent
                else:
                    if z == z.parent.left:
                        z = z.parent
                        self._right_rotate(z)
                    z.parent.color = Color.BLACK
                    z.parent.parent.color = Color.RED
                    self._left_rotate(z.parent.parent)
        self.root.color = Color.BLACK

    def insert(self, data):
        """Insert data into the Red-Black Tree."""
        z = RBNode(data, Color.RED)
        z.left = self.NIL
        z.right = self.NIL
        
        y = self.NIL
        x = self.root
        
        while x != self.NIL:
            y = x
            if z.data < x.data:
                x = x.left
            else:
                x = x.right
        
        z.parent = y
        if y == self.NIL:
            self.root = z
        elif z.data < y.data:
            y.left = z
        else:
            y.right = z
        
        self._insert_fixup(z)

    def _search_recursive(self, node, data):
        """Helper method for recursive search."""
        if node == self.NIL:
            return False
        if node.data == data:
            return True
        if data < node.data:
            return self._search_recursive(node.left, data)
        else:
            return self._search_recursive(node.right, data)

    def search(self, data):
        """Search for data in the tree."""
        return self._search_recursive(self.root, data)

    def _inorder_recursive(self, node, result):
        """Helper method for recursive inorder traversal."""
        if node != self.NIL:
            self._inorder_recursive(node.left, result)
            result.append(node.data)
            self._inorder_recursive(node.right, result)

    def inorder_traversal(self):
        """Perform inorder traversal (sorted order)."""
        result = []
        self._inorder_recursive(self.root, result)
        return result

    def _height_recursive(self, node):
        """Calculate height of subtree."""
        if node == self.NIL:
            return 0
        return 1 + max(self._height_recursive(node.left),
                      self._height_recursive(node.right))

    def height(self):
        """Calculate the height of the tree."""
        return self._height_recursive(self.root)

    def _size_recursive(self, node):
        """Helper method for recursive size calculation."""
        if node == self.NIL:
            return 0
        return 1 + self._size_recursive(node.left) + \
               self._size_recursive(node.right)

    def size(self):
        """Get the total number of nodes."""
        return self._size_recursive(self.root)

    def is_empty(self):
        """Check if the tree is empty."""
        return self.root == self.NIL

    def find_min(self):
        """Find the minimum value."""
        if self.root == self.NIL:
            return None
        node = self.root
        while node.left != self.NIL:
            node = node.left
        return node.data

    def find_max(self):
        """Find the maximum value."""
        if self.root == self.NIL:
            return None
        node = self.root
        while node.right != self.NIL:
            node = node.right
        return node.data

