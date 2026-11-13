from collections import deque


class TreeNode:
    """Node class for Binary Search Tree."""
    def __init__(self, data):
        self.data = data
        self.left = None
        self.right = None


class BinarySearchTree:
    """Binary Search Tree (BST) implementation.

    BST Property: for every node, ALL values in its left subtree are < node.data
    and ALL values in its right subtree are > node.data. Duplicates are ignored.

    Every operation is iterative, so a degenerate tree (for example sorted
    input, a chain of n nodes) never hits Python's recursion limit.
    """

    def __init__(self):
        self.root = None

    def insert(self, data):
        """Insert data into the BST (a duplicate is ignored)."""
        if self.root is None:
            self.root = TreeNode(data)
            return
        node = self.root
        while True:
            if data < node.data:
                if node.left is None:
                    node.left = TreeNode(data)
                    return
                node = node.left
            elif data > node.data:
                if node.right is None:
                    node.right = TreeNode(data)
                    return
                node = node.right
            else:
                return

    def search(self, data):
        """Return True if data is in the BST."""
        node = self.root
        while node is not None:
            if data == node.data:
                return True
            node = node.left if data < node.data else node.right
        return False

    def delete(self, data):
        """Delete data from the BST (a missing key is ignored)."""
        parent = None
        node = self.root
        while node is not None and node.data != data:
            parent = node
            node = node.left if data < node.data else node.right
        if node is None:
            return

        if node.left is not None and node.right is not None:
            # Two children: copy the in-order successor here, then remove it.
            succ_parent = node
            succ = node.right
            while succ.left is not None:
                succ_parent = succ
                succ = succ.left
            node.data = succ.data
            parent, node = succ_parent, succ

        # Now node has at most one child: splice it out.
        child = node.left if node.left is not None else node.right
        if parent is None:
            self.root = child
        elif parent.left is node:
            parent.left = child
        else:
            parent.right = child

    def find_min(self):
        """Return the minimum value, or None if the tree is empty."""
        if self.root is None:
            return None
        return self._find_min(self.root).data

    def _find_min(self, node):
        while node.left is not None:
            node = node.left
        return node

    def find_max(self):
        """Return the maximum value, or None if the tree is empty."""
        if self.root is None:
            return None
        return self._find_max(self.root).data

    def _find_max(self, node):
        while node.right is not None:
            node = node.right
        return node

    def inorder_traversal(self):
        """Left, Root, Right: values in sorted order."""
        result = []
        stack = []
        node = self.root
        while stack or node is not None:
            while node is not None:
                stack.append(node)
                node = node.left
            node = stack.pop()
            result.append(node.data)
            node = node.right
        return result

    def preorder_traversal(self):
        """Root, Left, Right."""
        result = []
        stack = [self.root] if self.root is not None else []
        while stack:
            node = stack.pop()
            result.append(node.data)
            if node.right is not None:
                stack.append(node.right)
            if node.left is not None:
                stack.append(node.left)
        return result

    def postorder_traversal(self):
        """Left, Right, Root."""
        result = []
        stack = [self.root] if self.root is not None else []
        while stack:
            node = stack.pop()
            result.append(node.data)
            if node.left is not None:
                stack.append(node.left)
            if node.right is not None:
                stack.append(node.right)
        result.reverse()
        return result

    def level_order_traversal(self):
        """Breadth-first traversal."""
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
        """Height in edges: -1 for an empty tree, 0 for a single node."""
        if self.root is None:
            return -1
        height = -1
        level = [self.root]
        while level:
            height += 1
            level = [c for n in level for c in (n.left, n.right) if c is not None]
        return height

    def size(self):
        """Number of nodes."""
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

    def is_empty(self):
        """True if the tree has no nodes."""
        return self.root is None
