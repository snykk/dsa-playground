class RopeNode:
    """A node in the rope binary tree.

    Leaf nodes store a string fragment in `data`.
    Internal nodes store `weight` (total length of left subtree)
    and pointers to `left` and `right` children.
    """

    def __init__(self, data=None):
        self.left = None
        self.right = None
        self.data = data
        self.weight = len(data) if data else 0


def _length(node):
    """Compute total length of string stored in the subtree rooted at node."""
    if node is None:
        return 0
    if node.data is not None:
        return len(node.data)
    return node.weight + _length(node.right)


def _index(node, i):
    """Return the character at position i in the subtree rooted at node."""
    if node is None:
        raise IndexError("index out of range")
    if node.data is not None:
        if i < 0 or i >= len(node.data):
            raise IndexError("index out of range")
        return node.data[i]
    if i < node.weight:
        return _index(node.left, i)
    return _index(node.right, i - node.weight)


def _collect(node, parts):
    """In-order traversal to collect leaf strings."""
    if node is None:
        return
    if node.data is not None:
        parts.append(node.data)
        return
    _collect(node.left, parts)
    _collect(node.right, parts)


def _build(text, leaf_size=10):
    """Build a balanced rope tree from a string, splitting into leaf_size chunks."""
    if len(text) <= leaf_size:
        return RopeNode(text)
    mid = len(text) // 2
    parent = RopeNode()
    parent.left = _build(text[:mid], leaf_size)
    parent.right = _build(text[mid:], leaf_size)
    parent.weight = _length(parent.left)
    return parent


def _split(node, i):
    """Split the subtree at position i, returning (left_tree, right_tree)."""
    if node is None:
        return (None, None)

    if node.data is not None:
        if i <= 0:
            return (None, node)
        if i >= len(node.data):
            return (node, None)
        left_leaf = RopeNode(node.data[:i])
        right_leaf = RopeNode(node.data[i:])
        return (left_leaf, right_leaf)

    if i < node.weight:
        left_part, right_part = _split(node.left, i)
        new_right = RopeNode()
        new_right.left = right_part
        new_right.right = node.right
        new_right.weight = _length(right_part)
        return (left_part, new_right)

    if i > node.weight:
        left_part, right_part = _split(node.right, i - node.weight)
        new_left = RopeNode()
        new_left.left = node.left
        new_left.right = left_part
        new_left.weight = node.weight
        return (new_left, right_part)

    # i == node.weight
    return (node.left, node.right)


def _concat_nodes(left, right):
    """Concatenate two rope subtrees under a new root."""
    if left is None:
        return right
    if right is None:
        return left
    parent = RopeNode()
    parent.left = left
    parent.right = right
    parent.weight = _length(left)
    return parent


class Rope:
    """Rope data structure for efficient string manipulation.

    A rope stores a string as a balanced binary tree of fragments,
    enabling O(log n) insert and delete operations.
    """

    def __init__(self, text=""):
        if text:
            self._root = _build(text)
        else:
            self._root = None

    def index(self, i):
        """Return the character at position i."""
        return _index(self._root, i)

    def concat(self, other):
        """Concatenate this rope with another, returning a new Rope."""
        result = Rope()
        result._root = _concat_nodes(self._root, other._root)
        return result

    def split(self, i):
        """Split the rope at position i, returning two new Ropes."""
        left_node, right_node = _split(self._root, i)
        left_rope = Rope()
        left_rope._root = left_node
        right_rope = Rope()
        right_rope._root = right_node
        return (left_rope, right_rope)

    def insert(self, i, text):
        """Insert text at position i."""
        left, right = self.split(i)
        middle = Rope(text)
        merged = left.concat(middle).concat(right)
        self._root = merged._root

    def delete(self, i, length):
        """Delete `length` characters starting at position i."""
        left, rest = self.split(i)
        _, right = rest.split(length)
        merged = left.concat(right)
        self._root = merged._root

    def to_string(self):
        """Collect all leaf fragments into a single string."""
        parts = []
        _collect(self._root, parts)
        return "".join(parts)

    def __len__(self):
        """Return total length of the string stored in this rope."""
        return _length(self._root)

    def __repr__(self):
        return f"Rope({self.to_string()!r})"
